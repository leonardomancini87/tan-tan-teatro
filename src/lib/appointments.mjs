import { escapeHTML as e, routes, UI, editorialEvents, romeToday } from '../data/agenda.mjs';
import { renderAgenda, arrow } from './agenda-render.mjs';
/** Preserve existing archive copy, but not the old duplicated upcoming list. */
export function extractArchive(content, locale = 'it') {
  const section = (name) => {
    const re = new RegExp(`<section[^>]*data-panel="${name}"[^>]*>([\\s\\S]*?)<\\/section>`, 'i');
    const match = content.match(re);
    if (!match) throw new Error(`Existing calendar archive not found: ${name}`);
    return match[1].replace(/^\s*<h2[^>]*>[\s\S]*?<\/h2>/i, '').trim();
  };
  return { past: section(locale === 'it' ? 'passate' : 'past'), projects: section(locale === 'it' ? 'eventi' : 'projects') };
}
export function renderAppointments(locale = 'it', archive = { past: '', projects: '' }, today = romeToday()) {
  const it = locale === 'it', r = routes(locale);
  // Editorial events remain findable here even after leaving the upcoming list.
  const editorial = editorialEvents(locale, today);
  return `<div class="tt-editorial tt-appointments-page"><header class="tt-page-heading"><p class="tt-kicker">Tan Tan Teatro \u00b7 ${it ? 'Il calendario' : 'The calendar'}</p><h1>${it ? 'Appuntamenti' : 'Events'}</h1><p>${it ? 'Spettacoli, laboratori e incontri. Dove e quando trovarci.' : 'Performances, laboratories and meetings. Where and when to find us.'}</p></header>
    <nav class="tt-page-index" aria-label="${it ? 'Sezioni del calendario' : 'Calendar sections'}"><a href="#prossimi-appuntamenti">${e(UI[locale].upcoming)}</a><a href="#archivio-rappresentazioni">${it ? 'Rappresentazioni passate' : 'Past performances'}</a><a href="#eventi-progetti">${it ? 'Eventi e progetti' : 'Events and projects'}</a></nav>
    <section id="prossimi-appuntamenti" class="tt-agenda-page-list" aria-labelledby="tt-agenda-title"><h2 id="tt-agenda-title">${e(UI[locale].upcoming)}</h2>${renderAgenda({ locale, mode: 'list', limit: 0, today })}</section>
    <section class="tt-archive" id="archivio-rappresentazioni"><h2>${it ? 'Rappresentazioni passate' : 'Past performances'}</h2><div class="appointments-page">${archive.past}</div></section>
    <section class="tt-projects" id="eventi-progetti"><h2>${it ? 'Eventi e progetti' : 'Events and projects'}</h2><div class="tt-project-links">${editorial.map((item) => `<article><p class="tt-kicker">${e(item.id === 'unight-2026' ? (it ? '25\u201326 settembre 2026' : '25\u201326 September 2026') : (it ? 'Settembre\u2013dicembre 2026' : 'September\u2013December 2026'))}</p><h3><a href="${item.kind === 'lab' ? r.lab : item.href}">${e(item.title)} ${arrow}</a></h3><p>${e(item.subtitle)}</p></article>`).join('')}</div><details class="tt-previous-projects"><summary>${it ? 'Altri eventi e progetti' : 'Earlier events and projects'}</summary><div class="appointments-page">${archive.projects}</div></details></section>
    <p class="tt-calendar-note">${it ? 'Le date possono essere soggette a modifiche. Consulta questa pagina per gli aggiornamenti.' : 'Dates may be subject to change. Check this page for updates.'}</p>
  </div>`;
}
