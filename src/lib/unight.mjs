import { escapeHTML as e, routes, SOURCES, UNIGHT } from '../data/agenda.mjs';
import { arrow } from './agenda-render.mjs';
export function renderUnight(locale = 'it') {
  const it = locale === 'it', r = routes(locale), fri = UNIGHT.friday, sat = UNIGHT.saturday;
  const c = it ? {
    back: 'Tutti gli appuntamenti', eyebrow: '25\u201326 settembre 2026 \u00b7 Torino',
    title: 'Tan Tan Teatro a UNIGHT 2026', subtitle: 'Teatro, ricerca e accessibilit\u00e0',
    intro: 'Due appuntamenti alla Notte Europea delle Ricercatrici e dei Ricercatori: uno stand dedicato al progetto ETICA e un incontro con Tan Tan Teatro.',
    friday: 'Venerd\u00ec 25 settembre', saturday: 'Sabato 26 settembre',
    fridayType: 'Stand \u00b7 Public engagement', saturdayType: 'Incontro \u00b7 Teatro universitario',
    fridayTitle: 'ETICA. Teatro e accessibilit\u00e0', saturdayTitle: 'Tan Tan Teatro alla Notte della Ricerca',
    fridayText: 'Saremo presenti con uno stand sull\u2019accessibilit\u00e0 dedicato a ETICA \u2013 Esplorazioni Teatrali e Innovazione per una Cultura Accessibile, progetto di public engagement dell\u2019Universit\u00e0 di Torino. Un\u2019occasione per conoscere il percorso di ricerca e gli strumenti sviluppati per ampliare la partecipazione all\u2019esperienza teatrale.',
    saturdayText: 'Un incontro per conoscere il lavoro di Tan Tan Teatro, tra creazione scenica, formazione e ricerca sull\u2019accessibilit\u00e0. Presenteremo il percorso del gruppo e il dialogo tra pratica teatrale e strumenti di partecipazione, a partire dall\u2019esperienza di St\u00e9ntor.',
    project: 'Il progetto ETICA', projectText: 'ETICA unisce teatro, tecnologia e inclusione per rendere le arti performative pi\u00f9 accessibili. Il progetto mette in relazione ricerca universitaria, pratiche artistiche e partecipazione del pubblico.',
    projectLink: 'Leggi il progetto sul sito UniTo', programme: 'Programma ufficiale UNIGHT',
    practical: 'Informazioni pratiche', info: 'Per la collocazione degli stand, le modalit\u00e0 di partecipazione e gli eventuali aggiornamenti, consulta il programma ufficiale UNIGHT.',
    access: 'Per informazioni sull\u2019accessibilit\u00e0 dell\u2019incontro, scrivi a',
    caption: 'Macbett \u00b7 sopratitoli in scena', programmeLabel: 'I due appuntamenti',
  } : {
    back: 'All events', eyebrow: '25\u201326 September 2026 \u00b7 Turin',
    title: 'Tan Tan Teatro at UNIGHT 2026', subtitle: 'Theatre, research and accessibility',
    intro: 'Two events at the European Researchers\u2019 Night: a stand dedicated to the ETICA project and a meeting with Tan Tan Teatro.',
    friday: 'Friday 25 September', saturday: 'Saturday 26 September',
    fridayType: 'Stand \u00b7 Public engagement', saturdayType: 'Meeting \u00b7 University theatre',
    fridayTitle: 'ETICA. Theatre and accessibility', saturdayTitle: 'Tan Tan Teatro at Researchers\u2019 Night',
    fridayText: 'We will be present at an accessibility stand dedicated to ETICA \u2013 Esplorazioni Teatrali e Innovazione per una Cultura Accessibile, a University of Turin public engagement project. An opportunity to discover the research process and the tools developed to broaden participation in theatre.',
    saturdayText: 'A meeting to discover the work of Tan Tan Teatro, bringing together theatrical creation, training and accessibility research. We will present the group\u2019s journey and the dialogue between theatre practice and tools for participation, drawing on our experience with St\u00e9ntor.',
    project: 'The ETICA project', projectText: 'ETICA brings together theatre, technology and inclusion to make the performing arts more accessible. The project connects university research, artistic practice and audience participation.',
    projectLink: 'Read about ETICA on the UniTo website', programme: 'Official UNIGHT programme',
    practical: 'Practical information', info: 'For stand locations, participation details and updates, please consult the official UNIGHT programme.',
    access: 'For information about accessibility at the meeting, write to',
    caption: 'Macbett \u00b7 surtitles on stage', programmeLabel: 'The two events',
  };
  return `<article class="tt-editorial tt-unight">
    <a class="tt-back-link" href="${r.agenda}"><span aria-hidden="true">\u2190</span> ${e(c.back)}</a>
    <header class="tt-unight-hero"><div class="tt-unight-intro"><p class="tt-kicker">${e(c.eyebrow)}</p><h1>${e(c.title)}</h1><p class="tt-unight-subtitle">${e(c.subtitle)}</p><p class="tt-body-copy">${e(c.intro)}</p><a class="tt-button" href="#programma-unight">${e(c.programmeLabel)} ${arrow}</a></div><figure><img src="/img/macbett/macbett-03.jpg" alt="${e(c.caption)}" width="1300" height="866" loading="eager" decoding="async" /><figcaption>${e(c.caption)}</figcaption></figure></header>
    <section class="tt-programme" id="programma-unight" aria-labelledby="tt-programme-title"><div class="tt-section-heading"><h2 id="tt-programme-title">${e(c.programmeLabel)}</h2><span class="tt-kicker">UNIGHT 2026</span></div>
      <article class="tt-programme-row"><div class="tt-programme-date"><p>${e(c.friday)}</p><time datetime="${fri.start}">${fri.time}</time><span class="tt-kicker">${e(c.fridayType)}</span></div><div class="tt-programme-copy"><h3>${e(c.fridayTitle)}</h3><p>${e(c.fridayText)}</p><div class="tt-venue"><strong>${e(fri.venue)}</strong><span>${e(it ? fri.detail : 'Institutional stands \u00b7 Stand 1')}</span><span>${e(fri.address)}</span></div><a class="tt-text-link" href="${SOURCES.etica}" target="_blank" rel="noopener noreferrer">${e(c.projectLink)} ${arrow}</a></div></article>
      <article class="tt-programme-row"><div class="tt-programme-date"><p>${e(c.saturday)}</p><time datetime="${sat.start}">${sat.time}</time><span class="tt-kicker">${e(c.saturdayType)}</span></div><div class="tt-programme-copy"><h3>${e(c.saturdayTitle)}</h3><p>${e(c.saturdayText)}</p><div class="tt-venue"><strong>${e(sat.venue)}</strong><span>${e(sat.detail)} \u00b7 Torino</span></div></div></article>
    </section>
    <section class="tt-unight-notes"><div><p class="tt-kicker">Public engagement</p><h2>${e(c.project)}</h2><p class="tt-body-copy">${e(c.projectText)}</p><a class="tt-text-link" href="${SOURCES.etica}" target="_blank" rel="noopener noreferrer">${e(c.projectLink)} ${arrow}</a></div><aside><h2>${e(c.practical)}</h2><p>${e(c.info)}</p><a class="tt-button tt-button--outline" href="${SOURCES.unight}" target="_blank" rel="noopener noreferrer">${e(c.programme)} ${arrow}</a><p class="tt-access-mail">${e(c.access)} <a href="mailto:accessibilita@tantanteatro.it">accessibilita@tantanteatro.it</a>.</p></aside></section>
  </article>`;
}
