// Ricerca nel sito — indice generato a fine build.
// Legge le pagine HTML prodotte da Astro (anche quelle scritte a mano nei .astro),
// le divide per sezioni e scrive dist/search/it.json e dist/search/en.json.
// Nessuna dipendenza esterna.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Pagine che non devono comparire nei risultati. */
export const EXCLUDE = [
  /^\/admin(\/|$)/,          // CMS
  /^\/lab(\/|$)/,            // quaderno riservato ai partecipanti
  /^\/news\//,               // articoli di esempio del tema originale
  /^\/sold(\/|$)/,           // idem
  /^\/contact\/thanks(\/|$)/,
  /^\/(en\/)?iscrizioni(\/|$)/, // moduli raggiungibili solo dal link dedicato
  /^\/prenota(\/|$)/,
  /^\/en\/book(\/|$)/,
  /^\/404(\/|$)/,
];

/** Pagine meno rilevanti: compaiono, ma dopo le altre. */
export const LOW_PRIORITY = [/cookie-policy/, /privacy/];

const SKIP_TAGS = new Set(['script', 'style', 'svg', 'noscript', 'template', 'nav', 'button', 'select', 'form', 'iframe', 'video', 'audio', 'picture']);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const BLOCK_TAGS = new Set(['p', 'div', 'li', 'ul', 'ol', 'section', 'article', 'header', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'tr', 'td', 'th', 'dt', 'dd', 'summary', 'details', 'figure', 'figcaption', 'blockquote', 'aside', 'main', 'table']);

const SECTION_LABELS = {
  it: { '': 'Home', spettacoli: 'Spettacoli', appuntamenti: 'Appuntamenti', laboratorio: 'Laboratorio', accessibilita: 'Accessibilità', bio: 'Chi siamo', contatti: 'Contatti', prenota: 'Prenotazioni', iscrizioni: 'Iscrizioni', 'privacy-app': 'Privacy', 'cookie-policy': 'Cookie' },
  en: { '': 'Home', performances: 'Performances', spettacoli: 'Performances', news: 'Events', laboratory: 'Laboratory', accessibility: 'Accessibility', about: 'About', contact: 'Contacts', book: 'Bookings', iscrizioni: 'Registrations', 'cookie-policy': 'Cookies' },
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', middot: '·', egrave: 'è', eacute: 'é', agrave: 'à', ograve: 'ò', ugrave: 'ù', igrave: 'ì', Egrave: 'È', Agrave: 'À' };
export const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
  if (code[0] === '#') {
    const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isFinite(n) ? String.fromCodePoint(n) : m;
  }
  return ENTITIES[code] ?? m;
});

const clean = (s) => s.replace(/\s+/g, ' ').trim();
const attr = (attrs, name) => {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? m[4] ?? '') : null;
};
const hasFlag = (attrs, name) => new RegExp(`(?:^|\\s)${name}(?=\\s|=|/|$)`, 'i').test(attrs);

export const localeFor = (path) => (path === '/en' || path.startsWith('/en/') || path.startsWith('/spettacoli/en/') ? 'en' : 'it');

/** Estrae titolo, descrizione e sezioni da una pagina HTML generata. */
export function extractPage(html, path) {
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) return null;
  const locale = localeFor(path);
  const rawTitle = decode((html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim());
  const title = clean(rawTitle.replace(/\s*[|–—-]\s*Tan Tan Teatro\s*$/i, '')) || 'Tan Tan Teatro';
  const description = clean(decode(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? ''));

  const mainStart = html.search(/<main\b[^>]*id=["']site-main["'][^>]*>/i);
  let body = mainStart >= 0 ? html.slice(mainStart) : html;
  const mainEnd = body.search(/<\/main>/i);
  if (mainEnd >= 0) body = body.slice(0, mainEnd);

  const sections = [];
  let current = { a: '', h: '', x: '' };
  const idStack = []; // [{tag, id}] per section/article con id
  let skip = null;     // { tag, depth }
  let heading = null;  // { tag, text }

  const push = () => {
    current.h = clean(current.h);
    current.x = clean(current.x);
    if (current.h || current.x) sections.push(current);
  };
  const start = (anchor) => { push(); current = { a: anchor, h: '', x: '' }; };
  const inheritedAnchor = () => idStack.length ? idStack[idStack.length - 1].id : '';

  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(body))) {
    const [, closing, rawTag, attrs = '', text] = m;
    if (text !== undefined) {
      if (skip) continue;
      const t = decode(text);
      if (heading) heading.text += t;
      else current.x += t;
      continue;
    }
    if (!rawTag) continue; // commento
    const tag = rawTag.toLowerCase();
    const selfClosing = /\/\s*$/.test(attrs) || VOID_TAGS.has(tag);

    if (skip) {
      if (tag === skip.tag && !selfClosing) skip.depth += closing ? -1 : 1;
      if (skip.depth === 0) skip = null;
      continue;
    }
    if (!closing && !selfClosing && (SKIP_TAGS.has(tag) || hasFlag(attrs, 'hidden') || attr(attrs, 'aria-hidden') === 'true' || hasFlag(attrs, 'data-search-ignore'))) {
      skip = { tag, depth: 1 };
      continue;
    }

    if (closing) {
      if (heading && tag === heading.tag) {
        const h = clean(heading.text);
        if (current.h) current.x += ` ${h} `; else current.h = h;
        heading = null;
      }
      if ((tag === 'section' || tag === 'article') && idStack.length && idStack[idStack.length - 1].tag === tag) idStack.pop();
      if (BLOCK_TAGS.has(tag)) { if (heading) heading.text += ' '; else current.x += ' '; }
      continue;
    }

    const id = attr(attrs, 'id');
    if ((tag === 'section' || tag === 'article') && id) {
      idStack.push({ tag, id });
      start(id);
    } else if ((tag === 'section' || tag === 'article') && !selfClosing) {
      idStack.push({ tag, id: inheritedAnchor() });
    }
    if (/^h[1-3]$/.test(tag)) {
      if (current.h || current.x.trim()) start(id || inheritedAnchor());
      else if (id) current.a = id;
      heading = { tag, text: '' };
    } else if (BLOCK_TAGS.has(tag)) {
      if (heading) heading.text += ' '; else current.x += ' ';
    }
  }
  push();

  // Le sezioni senza testo proprio confluiscono nella successiva.
  const merged = [];
  for (const s of sections) {
    const prev = merged[merged.length - 1];
    if (prev && !prev.x && prev.a === s.a && !(prev.h && s.h)) { merged[merged.length - 1] = { a: s.a, h: prev.h || s.h, x: s.x }; continue; }
    merged.push(s);
  }
  if (!merged.length && !description) return null;

  const first = path.split('/').filter(Boolean)[locale === 'en' && path.startsWith('/en') ? 1 : 0] ?? '';
  const kicker = SECTION_LABELS[locale][first] ?? title;
  const page = { u: path, t: title, d: description, k: kicker, l: locale, s: merged };
  if (LOW_PRIORITY.some((rx) => rx.test(path))) page.w = 0.35;
  return page;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

export function pathFor(file, root) {
  const rel = relative(root, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel.replace(/\.html$/, '')}`;
}

export async function buildSearchIndex(root) {
  const pages = { it: [], en: [] };
  for await (const file of walk(root)) {
    const path = pathFor(file, root);
    if (path.startsWith('/search') || EXCLUDE.some((rx) => rx.test(path))) continue;
    const page = extractPage(await readFile(file, 'utf8'), path);
    if (page) pages[page.l].push(page);
  }
  await mkdir(join(root, 'search'), { recursive: true });
  for (const locale of ['it', 'en']) {
    pages[locale].sort((a, b) => a.u.localeCompare(b.u));
    await writeFile(join(root, 'search', `${locale}.json`), JSON.stringify({ v: 1, pages: pages[locale] }));
  }
  return pages;
}

export default function siteSearch() {
  return {
    name: 'tan-tan-site-search',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = await buildSearchIndex(root);
        logger.info(`Indice di ricerca: ${pages.it.length} pagine IT, ${pages.en.length} pagine EN`);
      },
    },
  };
}
