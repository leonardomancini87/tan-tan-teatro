import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIGHT, LAB, PERFORMANCE_SNAPSHOT, romeToday, validDay, editorialEvents, normalizePerformances, upcomingEvents, dateLabel, escapeHTML, routes } from '../src/data/agenda.mjs';
import { renderEvents, renderAgenda } from '../src/lib/agenda-render.mjs';
import { renderHome } from '../src/lib/homepage.mjs';
import { renderUnight } from '../src/lib/unight.mjs';
import { extractArchive, renderAppointments } from '../src/lib/appointments.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const today = '2026-09-22';
const row = (props = {}) => ({ id:'test', title:'Macbett', starts_on:'2026-11-14', ends_on:null, is_published:true, ...props });
test('Initial homepage order: UNIGHT, laboratory, Macbett', () => {
  const items=upcomingEvents({today,limit:3});
  assert.deepEqual(items.map(x=>x.start),['2026-09-25','2026-09-30','2026-11-14']);
});
test('Full calendar also includes December and 2027', () => assert.equal(upcomingEvents({today}).length,6));
test('Passed two-day event disappears on 27 September', () => assert(!upcomingEvents({today:'2026-09-27'}).some(x=>x.id===UNIGHT.id)));
test('Two-day event stays visible on its final day', () => assert(upcomingEvents({today:'2026-09-26'}).some(x=>x.id===UNIGHT.id)));
test('Ongoing laboratory remains visible', () => assert(upcomingEvents({today:'2026-11-01'}).some(x=>x.id===LAB.id)));
test('Laboratory leaves the upcoming list after 16 December', () => assert(!upcomingEvents({today:'2026-12-17'}).some(x=>x.id===LAB.id)));
test('Registration is open through 25 September in Rome', () => {
  const lab=editorialEvents('it','2026-09-25')[1]; assert(lab.registrationOpen);assert.equal(lab.href,'/iscrizioni/?slug=lab-training');
});
test('Registration CTA disappears from 26 September', () => {
  const lab=editorialEvents('it','2026-09-26')[1];assert(!lab.registrationOpen);assert.equal(lab.href,'/laboratorio');assert(!lab.detail);
});
test('Rome date rolls over before UTC in summer', () => assert.equal(romeToday(new Date('2026-09-25T22:01:00Z')),'2026-09-26'));
test('Rome date also handles winter time', () => assert.equal(romeToday(new Date('2026-12-15T23:01:00Z')),'2026-12-16'));
test('Impossible dates are not valid', () => {
  assert(!validDay('2026-02-30')); assert(!validDay('garbage')); assert(validDay('2028-02-29'));
});
test('Invalid or unpublished API rows are ignored', () => assert.equal(normalizePerformances([null,{},row({is_published:false}),row({starts_on:'bad'}),row({title:''})]).length,0));
test('Malformed API payload is an error, not an empty live calendar', () => assert.throws(()=>normalizePerformances({error:'bad'})));
test('Valid empty API response removes fallback shows', () => assert.equal(upcomingEvents({today,rows:[]}).filter(x=>x.kind==='show').length,0));
test('Live response replaces snapshot rather than duplicating it', () => {
  const items=upcomingEvents({today,rows:[row()]});assert.equal(items.filter(x=>x.kind==='show').length,1);
});
test('An ongoing multi-day performance stays in the list', () => {
  const items=upcomingEvents({today:'2026-09-22',rows:[row({starts_on:'2026-09-21',ends_on:'2026-09-23'})]}); assert(items.some(x=>x.id==='performance-test'));
});
test('Published duplicate rows are deduplicated', () => {
  const items=upcomingEvents({today,rows:[row(),row({id:'second'})]}); assert.equal(items.filter(x=>x.kind==='show').length,1);
});
test('English labels, show links and registration routes are translated', () => {
  assert.equal(editorialEvents('en',today)[1].href,'/en/iscrizioni/?slug=lab-training');
  const item=normalizePerformances([row({title:'Il matrimonio'})],'en')[0];assert.equal(item.title,'The Marriage');assert.equal(item.href,routes('en').marriage);
  assert(renderHome('en',today).includes('Upcoming events'));
});
test('Date range formatting works across years', () => {
  const d=dateLabel('2026-12-30','2027-01-02','it');assert(d.until.includes('2027'));assert(d.long.includes('2026'));
});
test('Remote titles and venues cannot inject HTML', () => {
  const html=renderEvents({today,rows:[row({title:'<script>alert(1)</script>',venue:'<img src=x onerror=alert(1)>', city:'" onmouseover="boom'})]});
  assert(!html.includes('<script>'));assert(!html.includes('<img src=x'));assert(html.includes('&lt;script&gt;'));
});
test('Unexpected show title has a working contact link, never a made-up URL', () => assert.equal(normalizePerformances([row({title:'New show'})])[0].href,'/contatti'));
test('Escape helper handles quotes', () => assert.equal(escapeHTML('<&"\''),'&lt;&amp;&quot;&#39;'));
test('SSR agenda contains dates and links without JavaScript', () => {
  const html=renderAgenda({today});assert(html.includes('UNIGHT'));assert(html.includes('2026-11-14'));assert(!html.includes('Caricamento'));
});
test('Calendar empty state is useful after all dates have ended', () => assert(renderEvents({today:'2030-01-01'}).includes('Resta in contatto')));
test('Homepage has one h1 and no fake newsletter or invented photos', () => {
  const html=renderHome('it',today);assert.equal((html.match(/<h1/g)||[]).length,1);assert(!html.includes('<form'));assert(!html.includes('Teatro per un mondo'));assert(html.includes('Il matrimonio'));
});
test('All homepage and UNIGHT images exist in the uploaded assets', () => {
  for(const locale of ['it','en'])for(const html of [renderHome(locale,today),renderUnight(locale)])for(const [,src] of html.matchAll(/<img[^>]+src="([^"]+)"/g))assert(existsSync(resolve(root,'public',src.slice(1))),src);
});
test('UNIGHT keeps the two supplied schedules and Saturday room', () => {
  const html=renderUnight('it');assert(html.includes('22:00'));assert(html.includes('24:00'));assert(html.includes('16:30'));assert(html.includes('17:30'));assert(html.includes('Salone d'));assert(html.includes('Parco del Valentino'));
});
test('Old archives are preserved and extracted in both languages', () => {
  for(const locale of ['it','en']) {
    const md=readFileSync(resolve(root,'src/content/pages',locale==='it'?'appuntamenti.md':'news-en.md'),'utf8');
    const archive=extractArchive(md,locale);assert(archive.past.includes('2025'));assert(archive.projects.includes('Kathakali'));
    const html=renderAppointments(locale,archive,today);assert(html.includes('unight-2026'));assert(html.includes('2027-02-12'));
  }
});
test('Broken archive shape is detected, never silently discarded', () => assert.throws(()=>extractArchive('no archive')));
test('First performance snapshot matches the existing site', () => assert.equal(PERFORMANCE_SNAPSHOT[0].starts_on,'2026-11-14'));
