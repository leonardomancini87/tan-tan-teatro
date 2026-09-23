import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editorialEvents, normalizePerformances } from '../src/data/agenda.mjs';
import { renderAgenda } from '../src/lib/agenda-render.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('Mobile hero hides slide caption and anchors the main copy near the bottom safe area', () => {
  const css = read('src/styles/components/hero-slideshow.css');
  assert(css.includes('env(safe-area-inset-bottom, 0px)'));
  assert(css.includes('padding:96px 25px calc(28px + env(safe-area-inset-bottom, 0px))'));
  assert(css.includes('.tt-hero--slideshow .tt-hero-caption { display:none; }'));
  assert(!css.includes('bottom:calc(10px + env(safe-area-inset-bottom, 0px))'));
});


test('Editorial mobile navigation uses dynamic and small viewport units on iOS', () => {
  const css = read('public/styles/tantan-editorial.css');
  assert(css.includes('.tt-editorial-shell.site-head-open { height:100dvh; min-height:100svh; }'));
  assert(css.includes('padding-bottom:env(safe-area-inset-bottom, 0px)'));
});

test('Homepage appointment cards stack on phone widths without fixed heights', () => {
  const css = read('src/styles/home-agenda-landscape.css');
  assert(css.includes('@media (max-width: 600px)'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr)'));
  assert(css.includes('aspect-ratio: 16 / 9'));
  assert(css.includes('object-position: var(--tt-event-mobile-position)'));
});

test('Appointments cards use a tablet transition and stacked mobile image ratio', () => {
  const css = read('src/styles/appointments-editorial.css');
  assert(css.includes('@media (max-width: 900px) and (min-width: 641px)'));
  assert(css.includes('@media (max-width: 640px)'));
  assert(css.includes('aspect-ratio: 4 / 3'));
  assert(css.includes('object-position: var(--tt-event-mobile-position)'));
});

test('Event photographs expose individual desktop and mobile focal positions', () => {
  for (const event of editorialEvents('it', '2026-09-22')) {
    assert(event.imagePosition);
    assert(event.mobileImagePosition);
  }
  const performance = normalizePerformances([{ id: 'x', title: 'Macbett', venue: 'Teatro', city: 'Torino', starts_on: '2026-11-14', is_published: true }], 'it')[0];
  assert.equal(performance.mobileImagePosition, '50% 48%');
  const html = renderAgenda({ locale: 'it', mode: 'cards', today: '2026-09-22' });
  assert(html.includes('--tt-event-position:'));
  assert(html.includes('--tt-event-mobile-position:'));
  assert(!html.includes('style="object-position:'));
});
