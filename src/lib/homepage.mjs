import { renderHero } from './hero.mjs';
import { HOME_COPY, PHOTOS } from '../data/homepage.mjs';
import { escapeHTML as e, routes, UI, SOURCES } from '../data/agenda.mjs';
import { arrow, renderAgenda } from './agenda-render.mjs';
export function renderHome(locale = 'it', today) {
  const c = HOME_COPY[locale], r = routes(locale);
  return `<div class="tt-editorial tt-home" data-home-version="20260922">
    ${renderHero(locale)}

    <section class="tt-section tt-agenda-band" id="prossimi-appuntamenti" aria-labelledby="tt-agenda-title">
      <div class="tt-section-heading"><div><p class="tt-kicker">${e(c.agendaHint)}</p><h2 id="tt-agenda-title">${e(UI[locale].upcoming)}</h2></div><a class="tt-text-link" href="${r.agenda}">${e(UI[locale].all)} ${arrow}</a></div>
      ${renderAgenda({ locale, today, limit: 3 })}
    </section>

    <section class="tt-section tt-activities" aria-labelledby="tt-activities-title">
      <div class="tt-section-heading"><div><p class="tt-kicker">${e(c.activitiesLabel)}</p><h2 id="tt-activities-title">${e(c.activitiesTitle)}</h2></div></div>
      <div class="tt-activity-grid">${c.activities.map((a, index) => `<article class="tt-activity"><a href="${a.key === 'research' ? '#ricerca-accessibilita' : r[a.key]}" aria-label="${e(a.label)}"><img src="${PHOTOS[a.key]}" alt="" loading="lazy" decoding="async" width="640" height="520" /><div class="tt-activity-shade" aria-hidden="true"></div><div class="tt-activity-copy"><span class="tt-activity-number" aria-hidden="true">0${index + 1}</span><h3>${e(a.title)}</h3><p>${e(a.text)}</p><span class="tt-activity-link">${e(a.label)} ${arrow}</span></div></a></article>`).join('')}</div>
    </section>

    <section class="tt-about" aria-labelledby="tt-about-title">
      <figure><img src="${PHOTOS.group}" alt="${e(c.aboutAlt)}" loading="lazy" decoding="async" width="1300" height="867" />${c.aboutCaption ? `<figcaption>${e(c.aboutCaption)}</figcaption>` : ''}</figure>
      <div class="tt-about-copy"><p class="tt-kicker">${e(c.aboutLabel)}</p><h2 id="tt-about-title">${e(c.aboutTitle)}</h2><p class="tt-body-copy">${e(c.aboutText)}</p><a class="tt-button" href="${r.about}">${e(c.aboutLink)} ${arrow}</a></div>
    </section>

    <section class="tt-access" id="ricerca-accessibilita" aria-labelledby="tt-access-title">
      <div class="tt-access-copy"><p class="tt-kicker">${e(c.accessLabel)}</p><h2 id="tt-access-title">${e(c.accessTitle)}</h2><p class="tt-body-copy">${e(c.accessText)}</p><a class="tt-button tt-button--outline" href="${r.accessibility}">${e(c.accessLink)} ${arrow}</a></div>
      <aside class="tt-etica" aria-labelledby="tt-etica-title"><p class="tt-kicker">${e(c.eticaLabel)}</p><h3 id="tt-etica-title">${e(c.eticaName)}</h3><p class="tt-etica-name" lang="it">${e(c.eticaTitle)}</p><p class="tt-etica-note">${e(c.eticaText)}</p><a class="tt-text-link" href="${SOURCES.etica}" target="_blank" rel="noopener noreferrer">${e(c.eticaLink)} ${arrow}</a></aside>
    </section>

    <section class="tt-contact-band" aria-labelledby="tt-contact-title"><div><h2 id="tt-contact-title">${e(c.contactTitle)}</h2><p>${e(c.contactText)}</p></div><div class="tt-contact-actions"><a class="tt-button" href="${r.contacts}">${e(c.contactLink)} ${arrow}</a><a class="tt-text-link" href="https://www.instagram.com/tantanteatro/" target="_blank" rel="noopener noreferrer">Instagram ${arrow}</a></div></section>
  </div>`;
}
