import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractPage, pathFor, localeFor, EXCLUDE } from '../src/integrations/site-search.mjs';
import { prepareIndex, search, highlight, excerpt, normalize, resultHref } from '../src/lib/site-search.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const page = (main, head = '') => `<!doctype html><html lang="it"><head><title>Appuntamenti | Tan Tan Teatro</title>
<meta name="description" content="Dove e quando trovarci.">${head}</head><body>
<header class="site-head"><nav><a href="/">Home</a></nav></header>
<main id="site-main" class="site-main">${main}</main><footer>Footer da ignorare</footer></body></html>`;

const html = page(`
  <header><h1>Appuntamenti</h1><p>Spettacoli, laboratori e incontri.</p></header>
  <nav class="tt-page-index"><a href="#x">Indice da ignorare</a></nav>
  <section id="archivio-rappresentazioni"><h2>Rappresentazioni passate</h2>
    <div class="appointment-row"><strong>05-06/09/2026</strong> <em>Il Matrimonio</em> &mdash; Festival Mirabilia, Cuneo</div>
    <div class="appointment-row"><strong>03/07/2026</strong> <em>Il Matrimonio</em> — Spazio Kairòs, Torino</div>
  </section>
  <div hidden data-tt-calendar-config data-key="segreto">Non indicizzare</div>
  <script>var x = "codice";</script>
  <section id="eventi-progetti"><h2>Eventi e progetti</h2><article><h3>Residenza a Fuma che ’nduma</h3><p>Busca (Cuneo)</p></article></section>`);

test('Extracts title, description and anchored sections from built HTML', () => {
  const p = extractPage(html, '/appuntamenti');
  assert.equal(p.t, 'Appuntamenti');
  assert.equal(p.d, 'Dove e quando trovarci.');
  assert.equal(p.l, 'it');
  assert.equal(p.k, 'Appuntamenti');
  const archive = p.s.find((s) => s.a === 'archivio-rappresentazioni');
  assert.equal(archive.h, 'Rappresentazioni passate');
  assert.match(archive.x, /Festival Mirabilia, Cuneo/);
  assert.match(archive.x, /— Festival/);
  const residency = p.s.find((s) => s.h.startsWith('Residenza'));
  assert.equal(residency.a, 'eventi-progetti');
  const all = JSON.stringify(p);
  for (const hidden of ['Footer da ignorare', 'Indice da ignorare', 'Non indicizzare', 'codice', 'segreto']) {
    assert(!all.includes(hidden), `should not index: ${hidden}`);
  }
});

test('Skips noindex pages and private paths', () => {
  assert.equal(extractPage(page('<p>x</p>', '<meta name="robots" content="noindex, nofollow">'), '/lab'), null);
  for (const p of ['/admin', '/lab', '/news/studio-update', '/sold', '/contact/thanks']) assert(EXCLUDE.some((rx) => rx.test(p)), p);
  for (const p of ['/appuntamenti', '/spettacoli/macbett', '/laboratorio']) assert(!EXCLUDE.some((rx) => rx.test(p)), p);
});

test('Maps built files to URLs and languages', () => {
  assert.equal(pathFor('/d/index.html', '/d'), '/');
  assert.equal(pathFor('/d/spettacoli/macbett/index.html', '/d'), '/spettacoli/macbett');
  assert.equal(localeFor('/en/news'), 'en');
  assert.equal(localeFor('/spettacoli/en/the-marriage'), 'en');
  assert.equal(localeFor('/spettacoli/macbett'), 'it');
});

test('Search ignores accents and case, ranks and deep-links sections', () => {
  const index = prepareIndex({ pages: [extractPage(html, '/appuntamenti')] });
  const { results } = search(index, 'KAIROS torino');
  assert.equal(results.length, 1);
  assert.equal(resultHref(results[0].page, results[0].section), '/appuntamenti#archivio-rappresentazioni');
  assert.equal(search(index, 'zzqx').results.length, 0);
  assert.equal(search(index, '').results.length, 0);
});

test('Falls back to word stems when nothing matches exactly', () => {
  const index = prepareIndex({ pages: [extractPage(page('<h1>Prenota uno spettacolo</h1><p>Posti limitati.</p>'), '/prenota')] });
  const r = search(index, 'prenotare');
  assert.equal(r.approximate, true);
  assert.equal(r.results[0].page.u, '/prenota');
});

test('Highlighting escapes HTML and keeps original accents', () => {
  assert.equal(highlight('Spazio Kairòs <b>', ['kairos']), 'Spazio <mark>Kairòs</mark> &lt;b&gt;');
  assert.equal(highlight('<img src=x onerror=alert(1)>', ['img']), '&lt;<mark>img</mark> src=x onerror=alert(1)&gt;');
  assert.equal(normalize('Àrhat  Teatro!'), 'arhat teatro');
  const long = `${'parola '.repeat(60)}Mirabilia ${'altro '.repeat(60)}`;
  assert.match(excerpt(long, ['mirabilia']), /^… .*Mirabilia.* …$/);
});

test('Search is wired into the header and the build', () => {
  const header = readFileSync(resolve(root, 'src/components/Header.astro'), 'utf8');
  assert(header.includes("<SiteSearch locale={isEnglish ? 'en' : 'it'} />"));
  const config = readFileSync(resolve(root, 'astro.config.mjs'), 'utf8');
  assert(config.includes('siteSearch()'));
  const component = readFileSync(resolve(root, 'src/components/SiteSearch.astro'), 'utf8');
  assert(component.includes("addEventListener('astro:page-load'"));
  assert(component.includes('prefers-reduced-motion'));
});
