import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HERO_SLIDES, HERO_TIMING } from '../src/data/hero.mjs';
import { renderHero } from '../src/lib/hero.mjs';
import { renderHome } from '../src/lib/homepage.mjs';
import { renderAgenda } from '../src/lib/agenda-render.mjs';
import { renderAppointments } from '../src/lib/appointments.mjs';
import { HeroSlideshow, availableSlideIndices, shouldRotate } from '../src/scripts/hero.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = (text) => createHash('sha256').update(text).digest('hex');
const stripHero = (html) => html.replace(/<section class="tt-hero\b[\s\S]*?<\/section>/, '<!-- HERO -->');
const afterAgenda = (html) => html.slice(html.indexOf('<section class="tt-section tt-activities"'));
const baseState = { paused: false, reduced: false, hovered: false, inView: true, pageVisible: true, count: 4 };

test('Italian hero uses the editable homepage copy and not the old slogan', () => {
  const html = renderHero('it');
  assert(html.includes('<h1 id="tt-home-title">Tan Tan Teatro</h1>'));
  assert(html.includes('Gruppo di teatro universitario di Torino'));
  assert(!html.includes('un\u2019esperienza'));
  assert(!html.includes('Il teatro,'));
});
test('English hero changes consistently, preserving the name', () => {
  const html = renderHero('en');
  assert(html.includes('Tan Tan Teatro</h1>'));
  assert(html.includes('University theatre group in Turin'));
  assert(html.includes('Performances, laboratories, research and accessibility.'));
  assert(!html.includes('a shared'));
});
test('Fixed copy and both calls to action occur once, outside all slide panels', () => {
  for (const locale of ['it', 'en']) {
    const html = renderHero(locale), copy = html.match(/<div class="tt-hero-copy">([\s\S]*?)<div class="tt-hero-slides"/)[1];
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((copy.match(/<a\b/g) || []).length, 2);
    assert(copy.includes('href="#prossimi-appuntamenti"'));
    assert(copy.includes(locale === 'it' ? 'href="/bio"' : 'href="/en/about"'));
  }
});
test('Exactly four genuine local photographs are configured', () => {
  assert.equal(HERO_SLIDES.length, 4);
  assert.equal(new Set(HERO_SLIDES.map((s) => s.src)).size, 4);
  for (const slide of HERO_SLIDES) {
    assert(slide.src.startsWith('/img/'));
    assert(existsSync(resolve(root, 'public', slide.src.slice(1))));
    assert(slide.width > 0 && slide.height > 0);
    assert(slide.it.alt.length > 20 && slide.en.alt.length > 20);
  }
});
test('First photo is the same ensemble photograph as the approved homepage', () => assert.equal(HERO_SLIDES[0].src, '/img/matrimonio01.jpg'));
test('Only the first image loads in the server-rendered hero', () => {
  const html = renderHero();
  assert.equal((html.match(/<template data-hero-photo>/g) || []).length, 3);
  const initial = html.replace(/<template[\s\S]*?<\/template>/g, '');
  assert.equal((initial.match(/<img\b/g) || []).length, 1);
  assert(initial.includes('fetchpriority="high"'));
  assert(initial.includes('loading="eager"'));
});
test('Hero exposes no visible slideshow controls or slide counter', () => {
  const html = renderHero();
  assert(!html.includes('data-hero-controls'));
  assert(!html.includes('data-hero-toggle'));
  assert(!html.includes('data-hero-index'));
  assert(!html.includes('data-hero-count'));
});
test('Slides keep accessible names without visible navigation controls', () => {
  const html = renderHero();
  assert.equal((html.match(/role="group"/g) || []).length, HERO_SLIDES.length);
  assert.equal((html.match(/aria-hidden="true" inert/g) || []).length, 3);
  for (const slide of HERO_SLIDES) assert(html.includes(`id="tt-hero-slide-${slide.id}"`));
});
test('Desktop has four slides, mobile has three', () => {
  const panels = HERO_SLIDES.map((s) => ({ dataset: { mobile: String(s.mobile) } }));
  assert.deepEqual(availableSlideIndices(panels, false), [0, 1, 2, 3]);
  assert.deepEqual(availableSlideIndices(panels, true), [0, 1, 2]);
});
test('Timing is eight seconds, with a 1.4-second fade only', () => {
  assert.equal(HERO_TIMING.interval, 8000);
  assert.equal(HERO_TIMING.fade, 1400);
});
test('Normal visible desktop hero can rotate', () => assert(shouldRotate(baseState)));
for (const [label, change] of [
  ['explicit pause', { paused: true }],
  ['reduced motion', { reduced: true }],
  ['hover', { hovered: true }],
  ['outside the viewport', { inView: false }],
  ['hidden document', { pageVisible: false }],
  ['one available slide', { count: 1 }],
]) test(`Autoplay stops for ${label}`, () => assert(!shouldRotate({ ...baseState, ...change })));
test('Hero CSS is isolated and does not introduce pan/zoom effects', () => {
  const css = readFileSync(resolve(root, 'src/styles/components/hero-slideshow.css'), 'utf8');
  assert(css.includes('@media (prefers-reduced-motion:reduce)'));
  assert(css.includes('transition:none !important'));
  assert(!/(?:^|[;{])\s*(?:transform|animation)\s*:|@keyframes\b/.test(css));
  assert(!/(?:^|\n)(?:body|html|:root|\.tt-editorial-shell)\b/.test(css));
});
// Editorial homepage copy is intentionally editable; preserve the required structure instead of exact wording.
for (const locale of ['it', 'en']) test(`Homepage editorial sections remain present in ${locale}`, () => {
  const html = renderHome(locale, '2026-09-22');
  assert(html.includes('class="tt-section tt-activities"'));
  assert(html.includes('class="tt-about"'));
  assert(html.includes('class="tt-access"'));
  assert(html.includes('class="tt-contact-band"'));
});
test('Homepage event cards use only date, kind, title, venue and action', () => {
  const html = renderAgenda({ locale: 'it', mode: 'cards', limit: 3, today: '2026-09-22' });
  assert(html.includes('Tan Tan Teatro a UNIGHT 2026'));
  assert(html.includes('Training e movimento'));
  assert(html.includes('Macbett'));
  assert(!html.includes('Teatro, ricerca e accessibilit'));
  assert(!html.includes('Nuova edizione settembre'));
  assert(!html.includes('Eug\u00e8ne Ionesco'));
  assert(!html.includes('Due incontri, un unico programma'));
  assert(!html.includes('Iscrizioni entro il 25 settembre'));
  assert(!html.includes('fino al 16 DIC'));
  assert(html.includes('>Iscriviti '));
  assert(html.includes('>Dettagli '));
});
const protectedFiles = {
  "src/components/Header.astro": "1e8a7fc88ccaf3b4974560733364fa2fb7c5ef86d993dc83b7103b943eaa9ca2",
  "src/components/Footer.astro": "1d51a954d964d19c04ab75881a3721939f0afbcdc240de2cbd036aa97aa46fad",
  "src/layouts/Layout.astro": "d3159c8f37dbefc3673816767983c1ef44c50070d27f53711619d1f2cf4dc3c8",
  "src/components/CalendarRuntime.astro": "994d46cd1743aac304da4afee7b0d3223f0fa8486af48f35ce17e56ec1a857c7",
  "src/scripts/agenda.mjs": "5787af13e25834da134ba979dd72efc0a792e42618c6781f658936adcbb239d1",
  "src/lib/appointments.mjs": "2a6cf7581eececa873cfc16f2719c4c972748da5d9b1797e0437f286c506ae28",
  "src/lib/unight.mjs": "eb94f90148177308a650c0c7e5a8b25adc035653be4366637a0668d637da0eeb",
  "public/styles/tantan-editorial.css": "1f0f0424721e7d0b3b30478eac837a3553eb87d72cb635a57222e1af5900b6c6",
  "src/styles/vars.css": "bdb7b150160b28f81aefceb87cdaba0cb7799ef79ee70104efa59f2390fcb99c",
  "src/styles/content.css": "266f6499fed4f9da487b820f9bf66967b21fcdfbe169bbab47bea5e119a06539",
  "src/styles/layout.css": "fdee946ef5ecf007e67700bd9182ea645a5e0a4da2856825beb0ee6b03e96f3d",
  "src/templates/Appointments.astro": "1d06085239292cec4be4bdb7789d0921807aec183c379e5ab7428cc8e1dc8239",
  "src/templates/Unight.astro": "83dc38dba8223d642677223e117fb815174363854f3946fd1fc86c1ba0d3d45c",
  "src/pages/laboratorio.astro": "46018abd6f84269aad8f7ae29b2d308ee0852ab74cb4db67d418f891d0d872f5",
  "package.json": "862fe682f445af63ffdfc60cdaf38f9fdbd5c6467cba2afd32bc50aa989c1488",
  "package-lock.json": "865408fffe653a143318cba1bf7cc73dd411d796258de9a14d6b189bdff9046d"
};
for (const [file, expected] of Object.entries(protectedFiles)) test(`Protected baseline file is unchanged: ${file}`, () => assert.equal(sha(readFileSync(resolve(root, file))), expected));

test('Choosing the current slide cancels an older pending image selection', async () => {
  let resolveImage;
  const pendingImage = new Promise((resolve) => { resolveImage = resolve; });
  const fake = {
    available: [0, 1], active: 0, ticket: 0, destroyed: false,
    ensureImage: () => pendingImage,
    commit(index) { this.active = index; },
    announce() {}, syncRotation() {}, canRotate() { return true; },
  };
  const pending = HeroSlideshow.prototype.show.call(fake, 1, { manual: true });
  await HeroSlideshow.prototype.show.call(fake, 0, { manual: true });
  resolveImage(true);
  await pending;
  assert.equal(fake.active, 0);
});

test('Per-photo runtime crops survive the existing PostCSS preserve:false configuration', () => {
  const css = readFileSync(resolve(root, 'src/styles/components/hero-slideshow.css'), 'utf8');
  assert(!/var\(--tt-hero-[^)]*,/.test(css));
  assert(css.includes('object-position:var(--tt-hero-position)'));
  assert(css.includes('object-position:var(--tt-hero-mobile-position)'));
  const html = renderHero();
  for (const slide of HERO_SLIDES) {
    assert(html.includes(`--tt-hero-position:${slide.desktopPosition}`));
    assert(html.includes(`--tt-hero-mobile-position:${slide.mobilePosition}`));
  }
});
