import { escapeHTML as e, routes, BIBLIOTECA_20 } from '../data/agenda.mjs';
import { arrow } from './agenda-render.mjs';
/** Dedicated page for the readings at the library's 20th anniversary (28 October 2026). */
export function renderBiblioteca(locale = 'it') {
  const it = locale === 'it', r = routes(locale), b = BIBLIOTECA_20;
  const c = it ? {
    back: 'Tutti gli appuntamenti', eyebrow: 'Mercoledì 28 ottobre 2026 · Torino',
    title: 'Letture per i vent’anni della Biblioteca di Scienze letterarie e filologiche',
    subtitle: 'Università degli Studi di Torino',
    intro: 'Per i vent’anni della Biblioteca di Scienze letterarie e filologiche dell’Università degli Studi di Torino («20 anni di via Bava in Biblioteca»), lettura scenica, coro e danza a cura della Compagnia Tan Tan Teatro e della Compagnia Sperimentale K.',
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
    intro: 'For the 20th anniversary of the Library of Literary and Philological Studies (Biblioteca di Scienze letterarie e filologiche) of the University of Turin, a staged reading with chorus and dance by Compagnia Tan Tan Teatro and Compagnia Sperimentale K.',
    when: 'When', where: 'Where', date: 'Wednesday 28 October 2026', kind: 'Readings · University theatre',
    venue: 'Biblioteca di Scienze letterarie e filologiche',
    library: 'The library', libraryText: 'For opening hours, services and information about the library, see its official page on the University of Turin libraries portal.',
    libraryLink: 'About the library', practical: 'Practical information',
    info: 'Dates may be subject to change. Check the events page for updates.',
    access: 'For information about accessibility, write to', caption: 'Hands leafing through a script',
  };
  // Programma definitivo dalla locandina (UniTo / SUM / StudiUm), versione del 27 ottobre 2026.
  const programme = it ? [
    { time: '11:45', datetime: '2026-10-28T11:45:00+01:00', company: 'Tan Tan Teatro',
      cast: 'Testi per le voci di Viola Cicoria, Olivia Del Sante, Aurora Sempio, Giulia Tonello (Tan Tan Teatro)',
      readings: [
        { author: 'Dante Alighieri', work: 'Inferno', title: 'Canto XXXIV', note: 'A cura di Roberto Mercuri, Torino, Einaudi, 2021', shelf: 'ITAOR.ALIGHIERI.COMMEDIA.051.001' },
        { author: 'Miguel de Cervantes', work: 'Don Chisciotte della Mancia', title: 'Capitolo VIII', note: 'A cura di Patrizia Botta, Modena, Mucchi, 2015', shelf: 'SPA16.CERVANTES.QUIJOTE.021.001' },
        { author: 'Arnaut Daniel', work: 'Sirventese e canzoni', title: 'Canzoni IX e XIII', note: '«L’aura amara» e «Farsi vermigli, verdi, azzurri, bianchi, gialli». Traduzione di Fernando Bandini, a cura di Giosuè Lachin, Torino, Einaudi, 2000', shelf: 'OCCOR.ARNAUT DANIEL.A.002' },
      ] },
    { time: '12:10', datetime: '2026-10-28T12:10:00+01:00', company: 'Compagnia Sperimentale K.',
      cast: 'Testi per voci e danza di Oana Burlacu, Gaia Colosimo, Nicola Fiamma, Eugenio Kosova, Maya Manzati (Compagnia Sperimentale K.)',
      readings: [
        { author: 'Cesare Pavese', work: 'Le poesie', title: 'Balletto', note: 'A cura di Mariarosa Masoero, introduzione di Marziano Guglielminetti, Torino, Einaudi, 1998', shelf: 'ITA20.PAVESE.POESIE.001' },
        { author: 'Alda Merini', work: 'Fiore di poesia (1951–1997)', title: 'La Terra Santa', note: 'A cura di Maria Corti, Torino, Einaudi, 1998', shelf: 'PIC.366' },
      ] },
  ] : [
    { time: '11:45', datetime: '2026-10-28T11:45:00+01:00', company: 'Tan Tan Teatro',
      cast: 'Texts for the voices of Viola Cicoria, Olivia Del Sante, Aurora Sempio, Giulia Tonello (Tan Tan Teatro)',
      readings: [
        { author: 'Dante Alighieri', work: 'Inferno', title: 'Canto XXXIV', note: 'Edited by Roberto Mercuri, Turin, Einaudi, 2021', shelf: 'ITAOR.ALIGHIERI.COMMEDIA.051.001' },
        { author: 'Miguel de Cervantes', work: 'Don Quixote (Don Chisciotte della Mancia)', title: 'Chapter VIII', note: 'Edited by Patrizia Botta, Modena, Mucchi, 2015', shelf: 'SPA16.CERVANTES.QUIJOTE.021.001' },
        { author: 'Arnaut Daniel', work: 'Sirventese e canzoni', title: 'Songs IX and XIII', note: '«L’aura amara» and «Farsi vermigli, verdi, azzurri, bianchi, gialli». Translated by Fernando Bandini, edited by Giosuè Lachin, Turin, Einaudi, 2000', shelf: 'OCCOR.ARNAUT DANIEL.A.002' },
      ] },
    { time: '12:10', datetime: '2026-10-28T12:10:00+01:00', company: 'Compagnia Sperimentale K.',
      cast: 'Texts for voices and dance by Oana Burlacu, Gaia Colosimo, Nicola Fiamma, Eugenio Kosova, Maya Manzati (Compagnia Sperimentale K.)',
      readings: [
        { author: 'Cesare Pavese', work: 'Le poesie', title: 'Balletto', note: 'Edited by Mariarosa Masoero, introduction by Marziano Guglielminetti, Turin, Einaudi, 1998', shelf: 'ITA20.PAVESE.POESIE.001' },
        { author: 'Alda Merini', work: 'Fiore di poesia (1951–1997)', title: 'La Terra Santa', note: 'Edited by Maria Corti, Turin, Einaudi, 1998', shelf: 'PIC.366' },
      ] },
  ];
  const programmeTitle = it ? 'Programma' : 'Programme';
  const at = it ? 'Ore' : 'At';
  const shelfLabel = it ? 'Collocazione' : 'Shelf mark';
  const poster = { href: '/doc/20 anni di via Bava in Biblioteca – Locandina.pdf',
    label: it ? 'Scarica la locandina (PDF)' : 'Download the poster (PDF, in Italian)' };
  const ext = `target="_blank" rel="noopener noreferrer"`;
  return `<article class="tt-editorial tt-unight tt-biblioteca">
    <a class="tt-back-link" href="${r.agenda}"><span aria-hidden="true">←</span> ${e(c.back)}</a>
    <header class="tt-unight-hero"><div class="tt-unight-intro"><p class="tt-kicker">${e(c.eyebrow)}</p><h1>${e(c.title)}</h1><p class="tt-unight-subtitle">${e(c.subtitle)}</p><p class="tt-body-copy">${e(c.intro)}</p></div><figure><img src="${e(b.image)}" alt="${e(c.caption)}" width="${b.imageWidth}" height="${b.imageHeight}" loading="eager" decoding="async" style="object-position:${e(b.imagePosition)}" /></figure></header>
    <section class="tt-programme" aria-labelledby="tt-biblioteca-when"><div class="tt-section-heading"><h2 id="tt-biblioteca-when">${e(c.when)} · ${e(c.where)}</h2></div>
      <article class="tt-programme-row"><div class="tt-programme-date"><p>${e(c.date)}</p><time datetime="${b.startsAt}">${e(b.time)}</time></div><div class="tt-programme-copy"><h3>${e(c.title)}</h3><div class="tt-venue"><strong>${e(c.venue)}</strong><span>${e(c.subtitle)}</span><span>${e(b.address)}</span></div><a class="tt-text-link" href="${b.url}" ${ext}>${e(c.libraryLink)} ${arrow}</a></div></article>
    </section>
    ${programme.map((slot, i) => `<section class="tt-programme tt-biblioteca-programme"${i === 0 ? ' id="programma"' : ''} aria-labelledby="tt-biblioteca-slot-${i}"><div class="tt-section-heading"><h2 id="tt-biblioteca-slot-${i}">${i === 0 ? `${e(programmeTitle)} · ` : ''}${e(at)} <time datetime="${slot.datetime}">${e(slot.time)}</time></h2><p class="tt-kicker">${e(slot.company)}</p></div>
      <p class="tt-biblioteca-cast">${e(slot.cast)}</p>
      ${slot.readings.map((x) => `<article class="tt-programme-row"><div class="tt-programme-date"><p>${e(x.author)}</p><span class="tt-kicker">${e(x.work)}</span></div><div class="tt-programme-copy"><h3>${e(x.title)}</h3>${x.note ? `<p>${e(x.note)}</p>` : ''}${x.shelf ? `<div class="tt-venue"><span>${e(shelfLabel)}: <strong>${e(x.shelf)}</strong></span></div>` : ''}</div></article>`).join('')}
    </section>`).join('')}
    <div class="tt-biblioteca-poster"><a class="tt-button tt-button--outline" href="${encodeURI(poster.href)}" download>${e(poster.label)} ${arrow}</a></div>
    <section class="tt-unight-notes"><div><p class="tt-kicker">${e(c.subtitle)}</p><h2>${e(c.library)}</h2><p class="tt-body-copy">${e(c.libraryText)}</p><a class="tt-text-link" href="${b.url}" ${ext}>${e(c.libraryLink)} ${arrow}</a></div><aside><h2>${e(c.practical)}</h2><p>${e(c.info)}</p><a class="tt-button tt-button--outline" href="${r.agenda}">${e(c.back)} ${arrow}</a><p class="tt-access-mail">${e(c.access)} <a href="mailto:accessibilita@tantanteatro.it">accessibilita@tantanteatro.it</a>.</p></aside></section>
  </article>`;
}
