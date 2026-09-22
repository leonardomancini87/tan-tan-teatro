import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path, { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACCESSIBILITY_COPY, ACCESSIBILITY_LINKS, ACCESSIBILITY_PHOTOS } from '../src/data/accessibility.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = readFileSync(resolve(root, 'src/templates/Accessibility.astro'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/accessibility-project.css'), 'utf8');
const allCopy = JSON.stringify(ACCESSIBILITY_COPY);

test('Accessibility page has ten project sections and a single page-level h1 template', () => {
  for (const marker of ['acc-hero','acc-approach','acc-tools','acc-projects','acc-shows','acc-journey','acc-upcoming','acc-research','acc-contact']) assert(template.includes(marker));
  assert.equal((template.match(/<h1\b/g) || []).length, 1);
});

test('Accessibility copy exists in Italian and English with matching tool counts', () => {
  assert.equal(ACCESSIBILITY_COPY.it.tools.length, 4);
  assert.equal(ACCESSIBILITY_COPY.en.tools.length, 4);
  assert.equal(ACCESSIBILITY_COPY.it.journey.length, 3);
  assert.equal(ACCESSIBILITY_COPY.en.journey.length, 3);
  assert.equal(ACCESSIBILITY_COPY.it.shows.length, 2);
  assert.equal(ACCESSIBILITY_COPY.en.shows.length, 2);
});

test('Project links and contact routes are explicit and safe', () => {
  assert.equal(ACCESSIBILITY_LINKS.stentor, 'https://www.stentor.live/');
  assert(ACCESSIBILITY_LINKS.etica.startsWith('https://www.unito.it/'));
  assert.equal(ACCESSIBILITY_LINKS.contact, 'mailto:accessibilita@tantanteatro.it');
  assert(template.includes('rel="noopener noreferrer"'));
});

test('All accessibility photographs are genuine local assets', () => {
  for (const photo of Object.values(ACCESSIBILITY_PHOTOS)) {
    assert(photo.src.startsWith('/img/'));
    assert(existsSync(resolve(root, 'public', photo.src.slice(1))), photo.src);
    assert(photo.width > 0 && photo.height > 0);
  }
});

test('Copy avoids absolute availability claims and marks research as in progress', () => {
  assert(allCopy.includes('quando previsti'));
  assert(allCopy.includes('when scheduled'));
  assert(allCopy.includes('Ricerca in corso'));
  assert(allCopy.includes('Research in progress'));
});

test('Page-specific CSS is responsive, dark-mode aware and reduced-motion aware', () => {
  assert(css.includes('@media (max-width:760px)'));
  assert(css.includes('@media (max-width:480px)'));
  assert(css.includes("[data-theme='dark']"));
  assert(css.includes('@media (prefers-reduced-motion:reduce)'));
  assert(!/(min-width:\s*[4-9]\d{2,}px)/.test(css));
});

test('Accessibility template does not modify global navigation or homepage components', () => {
  assert(!template.includes('Header.astro'));
  assert(!template.includes('Footer.astro'));
  assert(!template.includes('CalendarRuntime'));
  assert(!template.includes('Home.astro'));
});

test('Accessibility has explicit Italian and English routes', () => {
  assert(existsSync(path.join(root, 'src/pages/accessibilita.astro')));
  assert(existsSync(path.join(root, 'src/pages/en/accessibility.astro')));
  const route = readFileSync(resolve(root, 'src/pages/[...slug].astro'), 'utf8');
  assert(route.includes("entry.data.templateKey === 'accessibility-page'"));
});

test('Accessibility v2 has an unmistakable project marker and no sign-language references', () => {
  const templateV2 = readFileSync(resolve(root, 'src/templates/Accessibility.astro'), 'utf8');
  const copy = readFileSync(resolve(root, 'src/data/accessibility.mjs'), 'utf8');
  assert(templateV2.includes('data-accessibility-version="project-v2-20260922"'));
  assert(!/\bLIS\b|lingua dei segni|sign language|interpretariato/i.test(templateV2 + '\n' + copy));
});
