/** Hero-only configuration. Photographs are existing, unmodified site assets.
 * Captions are intentionally evergreen: event dates remain in the existing calendar.
 */
export const HERO_TIMING = Object.freeze({ interval: 8000, fade: 1400 });
export const HERO_SLIDES = Object.freeze([
  {
    id: 'matrimonio', src: '/img/matrimonio01.jpg', width: 2000, height: 1333,
    desktopPosition: '50% 40%', mobilePosition: '59% 35%', mobile: true, route: 'marriage',
    it: { name: 'Il matrimonio', label: 'Spettacoli', detail: 'Witold Gombrowicz', alt: 'Una scena corale de Il matrimonio di Tan Tan Teatro' },
    en: { name: 'The Marriage', label: 'Performances', detail: 'Witold Gombrowicz', alt: 'An ensemble scene from The Marriage by Tan Tan Teatro' },
  },
  {
    id: 'macbett', src: '/img/home/macbett-ghigliottine.jpg', width: 2000, height: 1333,
    desktopPosition: '50% 45%', mobilePosition: '58% 40%', mobile: true, route: 'macbett',
    it: { name: 'Macbett', label: 'Spettacoli', detail: 'Eugène Ionesco', alt: 'Gli interpreti nella scena delle ghigliottine di Macbett a Cavagnolo' },
    en: { name: 'Macbett', label: 'Performances', detail: 'Eugène Ionesco', alt: 'The performers in the guillotine scene from Macbett in Cavagnolo' },
  },
  {
    id: 'matrimonioFinale', src: '/img/home/matrimonio-ivrea.jpg', width: 2000, height: 1333,
    desktopPosition: '50% 45%', mobilePosition: '65% 40%', mobile: true, route: 'marriage',
    it: { name: 'Il matrimonio', label: 'Spettacoli', detail: 'Witold Gombrowicz', alt: 'Gli interpreti de Il matrimonio a Ivrea con le braccia alzate' },
    en: { name: 'The Marriage', label: 'Performances', detail: 'Witold Gombrowicz', alt: 'The performers of The Marriage in Ivrea with their arms raised' },
  },
  {
    id: 'laboratorio', src: '/img/home/training-movimento.jpg', width: 2000, height: 1500,
    desktopPosition: '50% 68%', mobilePosition: '64% 55%', mobile: true, route: 'lab',
    it: { name: 'Training e movimento', label: 'Laboratorio', detail: 'Corpo, movimento e voce', alt: 'Il gruppo durante gli esercizi di movimento in laboratorio' },
    en: { name: 'Training and movement', label: 'Laboratory', detail: 'Body, movement and voice', alt: 'The group practising movement exercises in the laboratory' },
  },
]);
export const HERO_UI = Object.freeze({
  it: {
    carousel: 'presentazione di immagini', choose: 'Scegli l\u2019immagine in evidenza',
    pause: 'Metti in pausa le immagini', play: 'Riprendi la rotazione delle immagini',
    reduced: 'Rotazione automatica disattivata: movimento ridotto',
    paused: 'Rotazione in pausa. Puoi scegliere un\u2019immagine con i controlli.',
    playing: 'Rotazione automatica attiva.',
    unavailable: 'Immagine non disponibile. Rimane visibile l\u2019immagine precedente.',
    image: 'Immagine', of: 'di',
  },
  en: {
    carousel: 'carousel', choose: 'Choose the featured image',
    pause: 'Pause the images', play: 'Resume image rotation',
    reduced: 'Automatic rotation disabled: reduced motion',
    paused: 'Rotation paused. You can choose an image using the controls.',
    playing: 'Automatic rotation on.',
    unavailable: 'Image unavailable. The previous image remains visible.',
    image: 'Image', of: 'of',
  },
});
