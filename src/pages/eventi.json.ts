import { editorialEvents, oneOffEvents } from '../data/agenda.mjs';

/**
 * Public feed of the website's own events (readings, research, one-off
 * appointments), read by the Tan Tan Teatro app's home. Shows and the
 * laboratory are excluded: the app already gets them from Supabase.
 * Generated at build time; the app filters out past events itself.
 */
export const prerender = true;

const SITE = 'https://www.tantanteatro.it';
const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE}${path}`);

export function GET() {
  const pick = (locale: 'it' | 'en') =>
    [...editorialEvents(locale, '2000-01-01'), ...oneOffEvents(locale)].filter((e) => e.kind !== 'lab' && e.kind !== 'show');
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
    };
  });
  return new Response(JSON.stringify({ version: 1, events }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
