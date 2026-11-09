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
  const bookingLink = event.bookingHref
    ? `<a class="tt-event-link tt-event-link--booking" href="${e(event.bookingHref)}" aria-label="${e(`${event.bookingLabel}: ${compactTitle}`)}">${e(event.bookingLabel)} ${arrow}</a>`
    : '';
  const standardEventLink = event.kind === 'show'
    ? ''
    : `<a class="tt-event-link" href="${e(event.href)}" aria-label="${e(`${compactLabel}: ${compactTitle}`)}">${e(compactLabel)} ${arrow}</a>`;
  const editorialDate = (() => {
    if (!event.start) return '';
    const date = new Date(`${event.start}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return '';
    const localeCode = locale === 'it' ? 'it-IT' : 'en-GB';
    const label = new Intl.DateTimeFormat(localeCode, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Rome',
    }).format(date);
    const sentenceLabel =
      label.charAt(0).toLocaleUpperCase(localeCode) + label.slice(1);
    return event.detail ? `${sentenceLabel} · ${event.detail}` : sentenceLabel;
  })();
  const editorialAddress = /dravelli/i.test(event.venue ?? '')
    ? 'Via Praciosa 11, 10024 Moncalieri (TO)'
    : event.address ?? '';
  return `<article class="tt-event tt-event--${e(event.kind)}" data-event-id="${e(event.id)}">
    <div class="tt-event-photo"><img src="${e(event.image)}" alt="" loading="lazy" decoding="async" width="320" height="360" style="--tt-event-position:${e(event.imagePosition)};--tt-event-mobile-position:${e(event.mobileImagePosition ?? event.imagePosition)}" /></div>
    <div class="tt-event-copy">
      ${compact ? '' : `<p class="tt-event-date-compact">${e(editorialDate)}</p>`}
      <div class="tt-event-dateline"><time class="tt-date" datetime="${e(event.start)}" aria-label="${e(d.long)}"><strong>${e(d.day)}</strong><span>${e(d.month)}<small>${e(d.year)}</small></span></time>${!compact && d.until ? `<span class="tt-date-until">${e(d.until)}</span>` : ''}${!compact && ongoing ? `<span class="tt-ongoing">${e(t.ongoing)}</span>` : ''}</div>
      <p class="tt-event-kind">${e(t.kind[event.kind] ?? t.kind.other)}</p>
      <h3><a href="${e(event.href)}" class="tt-event-title-link">${e(compactTitle)}</a></h3>
      ${compact ? '' : `<p class="tt-event-subtitle">${e(event.subtitle)}</p>`}
      <p class="tt-event-venue">${e(event.venue)}</p>
      ${editorialAddress ? `<p class="tt-event-address">${e(editorialAddress)}</p>` : ''}
      ${compact ? '' : detail}
      <div class="tt-event-actions">${standardEventLink}${bookingLink}</div>
    </div>
  </article>`;
}
/** Riga compatta per la pagina di uno spettacolo: data, luogo e pulsante Prenota (senza foto). */
export function renderShowDate(event, locale = 'it') {
  const t = UI[locale], d = dateLabel(event.start, event.end, locale);
  const localeCode = locale === 'it' ? 'it-IT' : 'en-GB';
  const weekday = new Intl.DateTimeFormat(localeCode, { weekday: 'long', timeZone: 'Europe/Rome' }).format(new Date(`${event.start}T12:00:00Z`));
  const when = [weekday.charAt(0).toLocaleUpperCase(localeCode) + weekday.slice(1), event.detail ? (locale === 'it' ? `ore ${event.detail}` : event.detail) : ''].filter(Boolean).join(' \u00b7 ');
  const address = /dravelli/i.test(event.venue ?? '') ? 'Via Praciosa 11, 10024 Moncalieri (TO)' : event.address ?? '';
  const action = event.bookingHref
    ? `<a class="show-date-book" href="${e(event.bookingHref)}" aria-label="${e(`${event.bookingLabel}: ${event.title}, ${d.long}`)}">${e(event.bookingLabel)} ${arrow}</a>`
    : event.bookingClosed ? `<span class="show-date-soon">${e(t.bookingSoon)}</span>` : '';
  return `<li class="show-date" data-event-id="${e(event.id)}">
    <time class="show-date-day" datetime="${e(event.start)}" aria-label="${e(d.long)}"><strong>${e(d.day)}</strong><span>${e(d.month)} ${e(d.year)}</span></time>
    <div class="show-date-copy"><p class="show-date-when">${e(when)}${d.until ? ` \u00b7 ${e(d.until)}` : ''}</p><p class="show-date-venue">${e(event.venue)}</p>${address ? `<p class="show-date-address">${e(address)}</p>` : ''}</div>
    <div class="show-date-action">${action}</div>
  </li>`;
}
export function renderEvents({ locale = 'it', mode = 'cards', limit = 3, today = romeToday(), rows, show = '' } = {}) {
  const items = upcomingEvents({ locale, rows, today, limit, show });
  if (mode === 'dates') {
    if (!items.length) return `<div class="show-dates-empty"><p>${e(UI[locale].showEmpty)}</p><a class="tt-text-link" href="${routes(locale).contacts}">${e(UI[locale].emptyLink)} ${arrow}</a></div>`;
    return `<ul class="show-dates-list">${items.map((item) => renderShowDate(item, locale)).join('')}</ul>`;
  }
  if (!items.length) return `<div class="tt-agenda-empty"><p>${e(UI[locale].empty)}</p><a class="tt-text-link" href="${routes(locale).contacts}">${e(UI[locale].emptyLink)} ${arrow}</a></div>`;
  return `<div class="tt-events tt-events--${e(mode)}">${items.map((item) => renderEvent(item, locale, mode, today)).join('')}</div>`;
}
export function renderAgenda({ locale = 'it', mode = 'cards', limit = 3, today = romeToday(), show = '' } = {}) {
  return `<tt-agenda data-locale="${e(locale)}" data-mode="${e(mode)}" data-limit="${limit}"${show ? ` data-show="${e(show)}"` : ''} data-rendered-day="${today}"><div data-agenda-items>${renderEvents({ locale, mode, limit, today, show })}</div><p class="tt-agenda-status" data-agenda-status hidden></p></tt-agenda>`;
}
