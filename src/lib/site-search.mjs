// Ricerca nel sito — logica condivisa (browser e test).
// L'indice arriva da /search/<lingua>.json, generato a fine build da
// src/integrations/site-search.mjs.

const DIACRITICS = /[̀-ͯ]/g;
const WORD_CHAR = /[\p{L}\p{N}]/u;
const IGNORED_DESCRIPTIONS = new Set(['clay theme', '']);

/** Testo normalizzato (minuscole, senza accenti né punteggiatura) con la mappa
 *  verso le posizioni originali, per evidenziare i risultati. */
export function fold(text = '') {
  let out = '';
  const map = [];
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    let folded = ch.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
    if (!folded || ![...folded].every((c) => WORD_CHAR.test(c))) folded = ' ';
    for (const c of folded) { out += c; map.push(i); }
  }
  return { text: out, map };
}

export const normalize = (text = '') => fold(text).text.replace(/\s+/g, ' ').trim();

export function parseQuery(query = '') {
  const terms = normalize(query).split(' ').filter((t) => t.length > 1 || /\d/.test(t));
  return [...new Set(terms)].slice(0, 8);
}

const isWordStart = (hay, i) => i === 0 || hay[i - 1] === ' ';
function find(hay, term) {
  let first = -1;
  let start = false;
  let count = 0;
  let i = hay.indexOf(term);
  while (i !== -1 && count < 20) {
    if (first === -1) first = i;
    if (!start && isWordStart(hay, i)) { start = true; first = i; }
    count += 1;
    i = hay.indexOf(term, i + term.length);
  }
  return { first, start, count };
}

/** Prepara l'indice (normalizzazione una volta sola). */
export function prepareIndex(data) {
  return (data?.pages ?? []).map((p) => {
    const d = IGNORED_DESCRIPTIONS.has((p.d ?? '').trim().toLowerCase()) ? '' : p.d;
    return {
      ...p,
      d,
      nt: normalize(p.t),
      nd: normalize(d),
      sections: (p.s ?? []).map((s) => ({ ...s, nh: normalize(s.h), nx: normalize(s.x) })),
    };
  });
}

function scoreSection(page, section, terms) {
  let score = 0;
  let own = false;
  for (const term of terms) {
    const inTitle = find(page.nt, term);
    const inHeading = find(section.nh, term);
    const inText = find(section.nx, term);
    const inDesc = find(page.nd, term);
    if (inTitle.first < 0 && inHeading.first < 0 && inText.first < 0 && inDesc.first < 0) return null;
    if (inTitle.first >= 0) score += inTitle.start ? 10 : 6;
    if (inDesc.first >= 0) score += 1.5;
    if (inHeading.first >= 0) { own = true; score += inHeading.start ? 7 : 4; }
    if (inText.first >= 0) { own = true; score += (inText.start ? 2 : 1) + Math.min(inText.count, 6) * 0.35; }
  }
  return { score, own };
}

/** Radice approssimativa per le parole flesse ("prenotare" → "prenot"). */
export const stem = (term) => (term.length >= 6 && !/\d/.test(term) ? term.slice(0, Math.max(5, term.length - 3)) : term);

/** Cerca nell'indice preparato. Un risultato per pagina, con fino a due sezioni in più.
 *  Se non trova nulla, riprova con le radici delle parole. */
export function search(index, query, options = {}) {
  const terms = parseQuery(query);
  const exact = searchTerms(index, terms, options);
  if (exact.results.length || !terms.length) return exact;
  const stems = [...new Set(terms.map(stem))];
  if (stems.join() === terms.join()) return exact;
  return { ...searchTerms(index, stems, options), approximate: true };
}

function searchTerms(index, terms, { limit = 12 } = {}) {
  if (!terms.length) return { terms, results: [], total: 0 };
  const results = [];
  for (const page of index) {
    const hits = [];
    page.sections.forEach((section, i) => {
      const r = scoreSection(page, section, terms);
      if (r && r.own) hits.push({ section, i, score: r.score });
    });
    if (!hits.length) {
      // La pagina corrisponde solo per titolo/descrizione.
      const r = scoreSection(page, { nh: '', nx: '' }, terms);
      if (!r) continue;
      results.push({ page, section: page.sections[0] ?? null, more: [], score: r.score * (page.w ?? 1), titleOnly: true });
      continue;
    }
    hits.sort((a, b) => b.score - a.score || a.i - b.i);
    const [best, ...rest] = hits;
    const seen = new Set([best.section.a + best.section.h]);
    const more = [];
    for (const h of rest) {
      const key = h.section.a + h.section.h;
      if (!h.section.h || seen.has(key)) continue;
      seen.add(key);
      more.push(h.section);
      if (more.length === 2) break;
    }
    results.push({ page, section: best.section, more, score: (best.score + hits.length * 0.15) * (page.w ?? 1) });
  }
  results.sort((a, b) => b.score - a.score || a.page.u.localeCompare(b.page.u));
  return { terms, results: results.slice(0, limit), total: results.length };
}

export const escapeHTML = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Evidenzia i termini cercati in un testo (restituisce HTML sicuro). */
export function highlight(text = '', terms = []) {
  if (!text || !terms.length) return escapeHTML(text);
  const { text: hay, map } = fold(text);
  const ranges = [];
  for (const term of terms) {
    let i = hay.indexOf(term);
    while (i !== -1) {
      ranges.push([map[i], map[i + term.length - 1] + 1]);
      i = hay.indexOf(term, i + term.length);
    }
  }
  if (!ranges.length) return escapeHTML(text);
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (const r of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push(r);
  }
  let out = '';
  let pos = 0;
  for (const [a, b] of merged) {
    out += escapeHTML(text.slice(pos, a)) + '<mark>' + escapeHTML(text.slice(a, b)) + '</mark>';
    pos = b;
  }
  return out + escapeHTML(text.slice(pos));
}

/** Estratto di testo attorno alla prima occorrenza. */
export function excerpt(text = '', terms = [], size = 190) {
  if (!text) return '';
  if (text.length <= size) return text;
  const { text: hay, map } = fold(text);
  let at = -1;
  for (const term of terms) {
    const r = find(hay, term);
    if (r.first >= 0 && (at === -1 || map[r.first] < at)) at = map[r.first];
  }
  if (at < 0) at = 0;
  let start = Math.max(0, at - Math.round(size * 0.3));
  if (start > 0) { const sp = text.indexOf(' ', start); start = sp > -1 && sp < at ? sp + 1 : start; }
  let end = Math.min(text.length, start + size);
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); if (sp > at) end = sp; }
  return `${start > 0 ? '… ' : ''}${text.slice(start, end).trim()}${end < text.length ? ' …' : ''}`;
}

export const resultHref = (page, section) => (section?.a ? `${page.u}#${section.a}` : page.u);
