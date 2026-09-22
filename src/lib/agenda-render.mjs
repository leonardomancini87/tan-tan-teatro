import { escapeHTML as e, UI, routes, dateLabel, upcomingEvents, romeToday } from '../data/agenda.mjs';
export const arrow = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
export function renderEvent(event, locale = 'it', mode = 'cards', today = romeToday()) {
  const t = UI[locale], d = dateLabel(event.start, event.end, locale);
  const compact = mode === 'cards';
  const detail = event.registrationOpen ? `<span class="tt-deadline">${e(event.detail)}</span>` : event.detail ? `<span class="tt-event-detail">${e(event.detail)}</span>` : '';
  const ongoing = event.kind === 'lab' && event.start <= today && event.end >= today;
  const compactTitle = compact && event.kind === 'lab'
    ? event.title.replace(/^Laboratorio\.\s*/i, '').replace(/^Laboratory\.\s*/i, '')
    : event.title;
  const compactLabel = compact
    ? (event.kind === 'lab' && event.registrationOpen ? (locale === 'it' ? 'Iscriviti' : 'Join')
      : event.kind === 'show' ? (locale === 'it' ? 'Dettagli' : 'Details')
      : event.label)
    : event.label;
  return `<article class="tt-event tt-event--${e(event.kind)}" data-event-id="${e(event.id)}">
    <div class="tt-event-photo"><img src="${e(event.image)}" alt="" loading="lazy" decoding="async" width="320" height="360" style="object-position:${e(event.imagePosition)}" /></div>
    <div class="tt-event-copy">
      <div class="tt-event-dateline"><time class="tt-date" datetime="${e(event.start)}" aria-label="${e(d.long)}"><strong>${e(d.day)}</strong><span>${e(d.month)}<small>${e(d.year)}</small></span></time>${!compact && d.until ? `<span class="tt-date-until">${e(d.until)}</span>` : ''}${!compact && ongoing ? `<span class="tt-ongoing">${e(t.ongoing)}</span>` : ''}</div>
      <p class="tt-event-kind">${e(t.kind[event.kind] ?? t.kind.other)}</p>
      <h3><a href="${e(event.href)}" class="tt-event-title-link">${e(compactTitle)}</a></h3>
      ${compact ? '' : `<p class="tt-event-subtitle">${e(event.subtitle)}</p>`}
      <p class="tt-event-venue">${e(event.venue)}</p>
      ${compact ? '' : detail}
      <a class="tt-event-link" href="${e(event.href)}" aria-label="${e(`${compactLabel}: ${compactTitle}`)}">${e(compactLabel)} ${arrow}</a>
    </div>
  </article>`;
}
export function renderEvents({ locale = 'it', mode = 'cards', limit = 3, today = romeToday(), rows } = {}) {
  const items = upcomingEvents({ locale, rows, today, limit });
  if (!items.length) return `<div class="tt-agenda-empty"><p>${e(UI[locale].empty)}</p><a class="tt-text-link" href="${routes(locale).contacts}">${e(UI[locale].emptyLink)} ${arrow}</a></div>`;
  return `<div class="tt-events tt-events--${e(mode)}">${items.map((item) => renderEvent(item, locale, mode, today)).join('')}</div>`;
}
export function renderAgenda({ locale = 'it', mode = 'cards', limit = 3, today = romeToday() } = {}) {
  return `<tt-agenda data-locale="${e(locale)}" data-mode="${e(mode)}" data-limit="${limit}" data-rendered-day="${today}"><div data-agenda-items>${renderEvents({ locale, mode, limit, today })}</div><p class="tt-agenda-status" data-agenda-status hidden></p></tt-agenda>`;
}
