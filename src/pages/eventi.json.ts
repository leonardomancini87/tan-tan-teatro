import { editorialEvents, oneOffEvents, LAB, LAB_OCCURRENCES_2026, routes } from '../data/agenda.mjs';

/**
 * Public feed of the website's own events (readings, research, one-off
 * appointments and the laboratory with its dates), read by the Tan Tan Teatro
 * app's home. Shows are excluded: the app already gets them from Supabase.
 * Generated at build time; the app filters out past events itself and, for
 * the laboratory, picks the next date from `occurrences`.
 */
export const prerender = true;

const SITE = 'https://www.tantanteatro.it';
const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE}${path}`);

export function GET() {
  const pick = (locale: 'it' | 'en') =>
    [...editorialEvents(locale, '2000-01-01'), ...oneOffEvents(locale)]
      .filter((e) => e.kind !== 'show')
      .map((e) => (e.id === LAB.id
        ? { ...e, start: LAB.start, end: LAB.end, href: routes(locale).lab, detail: '', occurrences: LAB_OCCURRENCES_2026 }
        : e));
  const it = pick('it');
  const en = new Map(pick('en').map((e) => [e.id, e]));
  const events = it.map((e) => {
    const x = en.get(e.id) ?? e;
    return {
      id: e.id,
      start: e.start,
      end: e.end,
      kind: e.kind,
      title: { it: e.title, en: x.title },
      subtitle: { it: e.subtitle ?? '', en: x.subtitle ?? '' },
      venue: { it: e.venue ?? '', en: x.venue ?? '' },
      detail: { it: e.detail ?? '', en: x.detail ?? '' },
      address: e.address ?? '',
      image: abs(e.image),
      url: { it: abs(e.href), en: abs(x.href) },
      ...(e.occurrences ? { occurrences: e.occurrences } : {}),
    };
  });
  return new Response(JSON.stringify({ version: 1, events }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
