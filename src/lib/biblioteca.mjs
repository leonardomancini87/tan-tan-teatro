import { escapeHTML as e, routes, BIBLIOTECA_20 } from '../data/agenda.mjs';
import { arrow } from './agenda-render.mjs';
/** Dedicated page for the readings at the library's 20th anniversary (28 October 2026). */
export function renderBiblioteca(locale = 'it') {
  const it = locale === 'it', r = routes(locale), b = BIBLIOTECA_20;
  const c = it ? {
    back: 'Tutti gli appuntamenti', eyebrow: 'Mercoledì 28 ottobre 2026 · Torino',
    title: 'Letture per i vent’anni della Biblioteca di Scienze letterarie e filologiche',
    subtitle: 'Università degli Studi di Torino',
    intro: 'Tan Tan Teatro partecipa con alcune letture alle celebrazioni per i vent’anni della Biblioteca di Scienze letterarie e filologiche dell’Università degli Studi di Torino.',
    when: 'Quando', where: 'Dove', date: 'Mercoledì 28 ottobre 2026', kind: 'Letture · Teatro universitario',
    venue: 'Biblioteca di Scienze letterarie e filologiche',
    library: 'La biblioteca', libraryText: 'Per orari, servizi e informazioni sulla Biblioteca di Scienze letterarie e filologiche, consulta la pagina ufficiale sul portale delle biblioteche dell’Università di Torino.',
    libraryLink: 'Scopri la biblioteca', practical: 'Informazioni pratiche',
    info: 'Le date possono essere soggette a modifiche. Consulta la pagina degli appuntamenti per gli aggiornamenti.',
    access: 'Per informazioni sull’accessibilità, scrivi a', caption: 'Mani che sfogliano un copione',
  } : {
    back: 'All events', eyebrow: 'Wednesday 28 October 2026 · Turin',
    title: 'Readings for the 20th anniversary of the Library of Literary and Philological Studies',
    subtitle: 'University of Turin',
    intro: 'Tan Tan Teatro takes part with a series of readings in the celebrations for the 20th anniversary of the Library of Literary and Philological Studies (Biblioteca di Scienze letterarie e filologiche) of the University of Turin.',
    when: 'When', where: 'Where', date: 'Wednesday 28 October 2026', kind: 'Readings · University theatre',
    venue: 'Biblioteca di Scienze letterarie e filologiche',
    library: 'The library', libraryText: 'For opening hours, services and information about the library, see its official page on the University of Turin libraries portal.',
    libraryLink: 'About the library', practical: 'Practical information',
    info: 'Dates may be subject to change. Check the events page for updates.',
    access: 'For information about accessibility, write to', caption: 'Hands leafing through a script',
  };
  const programme = it ? [
    { author: 'Dante Alighieri', work: 'Inferno', title: 'Canto XXXIV', note: '' },
    { author: 'Miguel de Cervantes', work: 'Don Chisciotte della Mancia', title: 'Capitolo VIII', note: '' },
    { author: 'Arnaut Daniel', work: 'Canzoni', title: 'Canzoni VIII e XIII', note: '' },
    { author: 'Cesare Pavese', work: 'Poesia', title: 'Balletto', note: '' },
    { author: 'Alda Merini', work: 'Poesia', title: 'La Terra Santa', note: '' },
  ] : [
    { author: 'Dante Alighieri', work: 'Inferno', title: 'Canto XXXIV', note: '' },
    { author: 'Miguel de Cervantes', work: 'Don Quixote', title: 'Chapter VIII', note: '' },
    { author: 'Arnaut Daniel', work: 'Songs', title: 'Songs VIII and XIII', note: '' },
    { author: 'Cesare Pavese', work: 'Poem', title: 'Balletto', note: '' },
    { author: 'Alda Merini', work: 'Poem', title: 'La Terra Santa', note: '' },
  ];
  const programmeTitle = it ? 'Programma' : 'Programme';
  const ext = `target="_blank" rel="noopener noreferrer"`;
  return `<article class="tt-editorial tt-unight tt-biblioteca">
    <a class="tt-back-link" href="${r.agenda}"><span aria-hidden="true">←</span> ${e(c.back)}</a>
    <header class="tt-unight-hero"><div class="tt-unight-intro"><p class="tt-kicker">${e(c.eyebrow)}</p><h1>${e(c.title)}</h1><p class="tt-unight-subtitle">${e(c.subtitle)}</p><p class="tt-body-copy">${e(c.intro)}</p></div><figure><img src="${e(b.image)}" alt="${e(c.caption)}" width="${b.imageWidth}" height="${b.imageHeight}" loading="eager" decoding="async" style="object-position:${e(b.imagePosition)}" /></figure></header>
    <section class="tt-programme" aria-labelledby="tt-biblioteca-when"><div class="tt-section-heading"><h2 id="tt-biblioteca-when">${e(c.when)} · ${e(c.where)}</h2></div>
      <article class="tt-programme-row"><div class="tt-programme-date"><p>${e(c.date)}</p><time datetime="${b.startsAt}">${e(b.time)}</time></div><div class="tt-programme-copy"><h3>${e(c.title)}</h3><div class="tt-venue"><strong>${e(c.venue)}</strong><span>${e(c.subtitle)}</span><span>${e(b.address)}</span></div><a class="tt-text-link" href="${b.url}" ${ext}>${e(c.libraryLink)} ${arrow}</a></div></article>
    </section>
    <section class="tt-programme tt-biblioteca-programme" id="programma" aria-labelledby="tt-biblioteca-programme"><div class="tt-section-heading"><h2 id="tt-biblioteca-programme">${e(programmeTitle)}</h2></div>
      ${programme.map((x) => `<article class="tt-programme-row"><div class="tt-programme-date"><p>${e(x.author)}</p><span class="tt-kicker">${e(x.work)}</span></div><div class="tt-programme-copy"><h3>${e(x.title)}</h3>${x.note ? `<p>${e(x.note)}</p>` : ''}</div></article>`).join('')}
    </section>
    <section class="tt-unight-notes"><div><p class="tt-kicker">${e(c.subtitle)}</p><h2>${e(c.library)}</h2><p class="tt-body-copy">${e(c.libraryText)}</p><a class="tt-text-link" href="${b.url}" ${ext}>${e(c.libraryLink)} ${arrow}</a></div><aside><h2>${e(c.practical)}</h2><p>${e(c.info)}</p><a class="tt-button tt-button--outline" href="${r.agenda}">${e(c.back)} ${arrow}</a><p class="tt-access-mail">${e(c.access)} <a href="mailto:accessibilita@tantanteatro.it">accessibilita@tantanteatro.it</a>.</p></aside></section>
  </article>`;
}
