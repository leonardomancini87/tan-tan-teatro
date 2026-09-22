import { HOME_COPY } from '../data/homepage.mjs';
import { HERO_SLIDES, HERO_TIMING, HERO_UI } from '../data/hero.mjs';
import { escapeHTML as e, routes } from '../data/agenda.mjs';
import { arrow } from './agenda-render.mjs';

/** Server-rendered first photograph and copy work without JavaScript.
 * Other photographs live in inert templates until they are actually needed.
 */
export function renderHero(locale = 'it') {
  const lang = locale === 'en' ? 'en' : 'it';
  const c = HOME_COPY[lang], ui = HERO_UI[lang], r = routes(lang);
  return `<section class="tt-hero tt-hero--slideshow" data-tt-hero data-hero-locale="${lang}" data-hero-interval="${HERO_TIMING.interval}" data-hero-fade="${HERO_TIMING.fade}" style="--tt-hero-fade:${HERO_TIMING.fade}ms" aria-labelledby="tt-home-title" aria-roledescription="${e(ui.carousel)}">
      <div class="tt-hero-copy">
        <h1 id="tt-home-title">${c.title.map(e).join(' ')}</h1>
        <p class="tt-hero-identity">${e(c.eyebrow)}</p>
        <p class="tt-hero-intro">${e(c.intro)}</p>
        <div class="tt-hero-actions"><a class="tt-button tt-button--light" href="#prossimi-appuntamenti">${e(c.primary)} ${arrow}</a><a class="tt-hero-secondary" href="${r.about}">${e(c.secondary)} ${arrow}</a></div>
      </div>
      <div class="tt-hero-slides" data-hero-slides>${HERO_SLIDES.map((slide, index) => {
        const text = slide[lang];
        const img = `<img class="tt-hero-image" src="${slide.src}" alt="${e(text.alt)}" width="${slide.width}" height="${slide.height}" fetchpriority="${index === 0 ? 'high' : 'low'}" loading="eager" decoding="async" />`;
        return `<div class="tt-hero-slide${index === 0 ? ' is-active' : ''}" id="tt-hero-slide-${slide.id}" role="group" aria-label="${e(text.name)}" aria-hidden="${index !== 0}"${index !== 0 ? ' inert' : ''} data-mobile="${slide.mobile}" data-hero-name="${e(text.name)}" style="--tt-hero-position:${slide.desktopPosition};--tt-hero-mobile-position:${slide.mobilePosition}">
          ${index === 0 ? img : `<template data-hero-photo>${img}</template>`}
          <a class="tt-hero-caption" href="${slide.route === 'research' ? '#ricerca-accessibilita' : r[slide.route]}"${index !== 0 ? ' tabindex="-1"' : ''}><span class="tt-hero-caption-label">${e(text.label)}</span><span class="tt-hero-caption-title">${e(text.name)}</span><small>${e(text.detail)}</small></a>
        </div>`;
      }).join('')}</div>
      <div class="tt-hero-shade" aria-hidden="true"></div>
      <p class="tt-hero-sr" data-hero-status role="status" aria-live="polite" aria-atomic="true"></p>
      <script type="application/json" data-hero-labels>${JSON.stringify(ui).replace(/</g, '\\u003c')}</script>
    </section>`;
}
