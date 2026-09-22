/**
 * Public calendar, shared by the homepage and the Appointments page.
 * Editorial events live here. Performances still come from the existing
 * read-only Supabase public_appointments view; the snapshot below is used
 * ONLY when that view is unavailable. No private credentials belong here.
 */
export const SOURCES = Object.freeze({
  unight: 'https://unightproject.eu/it/unight-events',
  unightProgramme: 'https://unightproject.eu/it/eventi/la-notte-europea-delle-ricercatrici-e-dei-ricercatori-2026',
  etica: 'https://www.unito.it/territorio-e-societa/condivisione-e-partecipazione/progetti-di-public-engagement-di-ateneo-45',
});

export const UNIGHT = Object.freeze({
  id: 'unight-2026',
  start: '2026-09-25', end: '2026-09-26',
  friday: { start: '2026-09-25T22:00:00+02:00', end: '2026-09-26T00:00:00+02:00',
    time: '22:00\u201324:00', venue: 'Parco del Valentino',
    detail: 'Stand istituzionali \u00b7 Stand 1', address: 'Viale Mattioli, 39 \u00b7 Torino' },
  saturday: { start: '2026-09-26T16:30:00+02:00', end: '2026-09-26T17:30:00+02:00',
    time: '16:30\u201317:30', venue: 'Castello del Valentino', detail: 'Salone d\u2019Onore' },
  // Organiser-provided time retained. Official programme currently says 22:15.
  // See NOTE-HOMEPAGE.md before publication; do not silently change the time.
});
export const LAB = Object.freeze({
  id: 'laboratorio-autunno-2026', start: '2026-09-30', end: '2026-12-16',
  deadline: '2026-09-25',
  registration: { it: '/iscrizioni/?slug=lab-training', en: '/en/iscrizioni/?slug=lab-training' },
});

// Source: upcoming dates already present in the uploaded site (news-en.md).
// This is a resilience snapshot, NOT a second live calendar to maintain.
export const PERFORMANCE_SNAPSHOT = [
  { id: 'snapshot-macbett-dravelli', title: 'Macbett', venue: 'Teatro Dravelli', city: 'Torino', starts_on: '2026-11-14', ends_on: null, is_published: true },
  { id: 'snapshot-macbett-rivalta', title: 'Macbett', venue: 'Auditorium \u201cFranca Rame\u201d', city: 'Rivalta di Torino', starts_on: '2026-12-12', ends_on: null, is_published: true },
  { id: 'snapshot-matrimonio-dravelli', title: 'Il matrimonio', venue: 'Teatro Dravelli', city: 'Torino', starts_on: '2027-01-30', ends_on: null, is_published: true },
  { id: 'snapshot-matrimonio-ptc', title: 'Il matrimonio', venue: 'Piccolo Teatro Comico', city: 'Torino', starts_on: '2027-02-12', ends_on: '2027-02-13', is_published: true },
];

export const UI = {
  it: { upcoming: 'Prossimi appuntamenti', all: 'Tutti gli appuntamenti', programme: 'Scopri il programma',
    lab: 'Scopri il laboratorio', signup: 'Iscriviti al laboratorio', show: 'Dettagli dello spettacolo',
    event: 'Dettagli dell\u2019appuntamento', ongoing: 'In corso', empty: 'I prossimi appuntamenti saranno pubblicati qui.',
    emptyLink: 'Resta in contatto', monthYear: 'it-IT', kind: { research: 'Ricerca \u00b7 Public engagement', lab: 'Laboratorio', show: 'Spettacolo', other: 'Appuntamento' },
    status: 'Calendario in aggiornamento. Per le repliche, verifica le date con noi.', statusLink: 'Contattaci' },
  en: { upcoming: 'Upcoming events', all: 'All events', programme: 'Explore the programme',
    lab: 'Explore the laboratory', signup: 'Join the laboratory', show: 'Performance details',
    event: 'Event details', ongoing: 'In progress', empty: 'Our next events will be published here.',
    emptyLink: 'Stay in touch', monthYear: 'en-GB', kind: { research: 'Research \u00b7 Public engagement', lab: 'Laboratory', show: 'Performance', other: 'Event' },
    status: 'Calendar being updated. Please check performance dates with us.', statusLink: 'Contact us' },
};

export const routes = (locale = 'it') => locale === 'en'
  ? { home: '/en/', about: '/en/about', shows: '/en/performances', lab: '/en/laboratory', agenda: '/en/news',
      accessibility: '/en/accessibility', contacts: '/en/contact', unight: '/en/news/unight-2026/', macbett: '/spettacoli/en/macbett-ionesco', marriage: '/spettacoli/en/the-marriage' }
  : { home: '/', about: '/bio', shows: '/spettacoli', lab: '/laboratorio', agenda: '/appuntamenti',
      accessibility: '/accessibilita', contacts: '/contatti', unight: '/appuntamenti/unight-2026/', macbett: '/spettacoli/macbett', marriage: '/spettacoli/matrimonio' };

export function romeToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function validDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const safeText = (value) => typeof value === 'string' ? value.trim().slice(0, 500) : '';
export function dateLabel(start, end, locale = 'it') {
  const formatter = new Intl.DateTimeFormat(UI[locale].monthYear, { month: 'short', timeZone: 'Europe/Rome' });
  const month = (value) => formatter.format(new Date(`${value}T12:00:00Z`)).replace(/\.$/, '').toUpperCase();
  const long = new Intl.DateTimeFormat(UI[locale].monthYear, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' });
  const a = start.slice(8), b = end.slice(8);
  if (start === end) return { day: a, month: month(start), year: start.slice(0, 4), long: long.format(new Date(`${start}T12:00:00Z`)) };
  if (start.slice(0, 7) === end.slice(0, 7)) return { day: `${a}\u2013${b}`, month: month(start), year: start.slice(0, 4), long: `${long.format(new Date(`${start}T12:00:00Z`))} \u2013 ${long.format(new Date(`${end}T12:00:00Z`))}` };
  return { day: a, month: month(start), year: start.slice(0, 4), until: `${locale === 'it' ? 'fino al' : 'until'} ${b} ${month(end)}${end.slice(0, 4) !== start.slice(0, 4) ? ` ${end.slice(0, 4)}` : ''}`, long: `${long.format(new Date(`${start}T12:00:00Z`))} \u2013 ${long.format(new Date(`${end}T12:00:00Z`))}` };
}

export function editorialEvents(locale = 'it', today = romeToday()) {
  const it = locale === 'it', r = routes(locale), t = UI[locale];
  const open = today <= LAB.deadline;
  return [
    { id: UNIGHT.id, start: UNIGHT.start, end: UNIGHT.end, kind: 'research',
      title: 'Tan Tan Teatro a UNIGHT 2026',
      subtitle: it ? 'Teatro, ricerca e accessibilit\u00e0' : 'Theatre, research and accessibility',
      venue: it ? 'Parco del Valentino \u00b7 Torino' : 'Parco del Valentino \u00b7 Turin',
      image: '/img/macbett/macbett-03.jpg', imagePosition: '50% 52%',
      imageAlt: it ? 'Macbett con sopratitoli in scena' : 'Macbett with projected surtitles',
      href: r.unight, label: t.programme,
      detail: it ? 'Due incontri, un unico programma' : 'Two events, one programme' },
    { id: LAB.id, start: LAB.start, end: LAB.end, kind: 'lab',
      title: it ? 'Laboratorio. Training e movimento' : 'Laboratory. Training and movement',
      subtitle: it ? 'Nuova edizione settembre\u2013dicembre 2026' : 'New edition September\u2013December 2026',
      venue: it ? 'Palazzo Nuovo · Torino' : 'Turin', image: '/img/lab01.jpeg', imagePosition: '52% 54%',
      imageAlt: it ? 'Esercizi di movimento al laboratorio Tan Tan Teatro' : 'Movement training at the Tan Tan Teatro laboratory',
      href: open ? LAB.registration[locale] : r.lab, label: open ? t.signup : t.lab,
      detail: open ? (it ? 'Iscrizioni entro il 25 settembre' : 'Apply by 25 September') : '',
      registrationOpen: open, secondaryHref: r.lab },
  ].map((e) => ({ ...e, title: !it && e.id === UNIGHT.id ? 'Tan Tan Teatro at UNIGHT 2026' : e.title }));
}
export function normalizePerformances(rows, locale = 'it') {
  if (!Array.isArray(rows)) throw new TypeError('Invalid calendar response');
  const r = routes(locale), it = locale === 'it';
  return rows.flatMap((row, index) => {
    if (!row || typeof row !== 'object' || row.is_published === false || !validDay(row.starts_on)) return [];
    const title = safeText(row.title);
    if (!title) return [];
    const key = title.toLocaleLowerCase('it');
    const macbett = key.includes('macbett'), marriage = key.includes('matrimonio') || key.includes('marriage');
    const venue = [safeText(row.venue), safeText(row.city)].filter(Boolean).join(' \u00b7 ');
    const time = typeof row.starts_at_time === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(row.starts_at_time) ? row.starts_at_time.slice(0, 5) : '';
    return [{ id: `performance-${safeText(String(row.id ?? index))}`, start: row.starts_on,
      end: validDay(row.ends_on) && row.ends_on >= row.starts_on ? row.ends_on : row.starts_on,
      kind: 'show', title: !it && marriage ? 'The Marriage' : title,
      subtitle: macbett ? 'Eug\u00e8ne Ionesco' : marriage ? 'Witold Gombrowicz' : '',
      venue, detail: time, image: macbett ? '/img/macbett01.jpg' : marriage ? '/img/matrimonio01.jpg' : '/img/tantanteatro.jpeg',
      imagePosition: '50% 46%', imageAlt: title,
      href: macbett ? r.macbett : marriage ? r.marriage : r.contacts,
      label: macbett || marriage ? UI[locale].show : UI[locale].event }];
  });
}
export function upcomingEvents({ locale = 'it', rows = PERFORMANCE_SNAPSHOT, today = romeToday(), limit = 0 } = {}) {
  const seen = new Set();
  const events = [...editorialEvents(locale, today), ...normalizePerformances(rows, locale)]
    .filter((e) => e.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title))
    .filter((e) => {
      const key = `${e.start}|${e.end}|${e.title.toLowerCase()}|${e.venue.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  return limit > 0 ? events.slice(0, limit) : events;
}
