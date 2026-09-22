import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('Appointments template loads only its page-specific restyle', () => {
  const tpl = readFileSync(resolve(root, 'src/templates/Appointments.astro'), 'utf8');
  assert(tpl.includes("import '../styles/appointments-editorial.css';"));
});

test('First live appointment is promoted by CSS rather than hard-coded event id', () => {
  const css = readFileSync(resolve(root, 'src/styles/appointments-editorial.css'), 'utf8');
  assert(css.includes('.tt-events--list > .tt-event:first-child'));
  assert(!css.includes('unight-2026'));
  assert(!css.includes('laboratorio-autunno-2026'));
});

test('Appointments restyle is responsive and reduced-motion aware', () => {
  const css = readFileSync(resolve(root, 'src/styles/appointments-editorial.css'), 'utf8');
  assert(css.includes('@media (max-width: 760px)'));
  assert(css.includes('@media (max-width: 480px)'));
  assert(css.includes('@media (prefers-reduced-motion: reduce)'));
});
