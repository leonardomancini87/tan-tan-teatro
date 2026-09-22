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
    id: 'macbett', src: '/img/macbett/macbett-01.jpg', width: 1300, height: 952,
    desktopPosition: '50% 24%', mobilePosition: '65% 20%', mobile: true, route: 'macbett',
    it: { name: 'Macbett', label: 'Spettacoli', detail: 'Eug\u00e8ne Ionesco', alt: 'Due interpreti in una scena di Macbett di Tan Tan Teatro' },
    en: { name: 'Macbett', label: 'Performances', detail: 'Eug\u00e8ne Ionesco', alt: 'Two performers in a scene from Macbett by Tan Tan Teatro' },
  },
  {
    id: 'laboratorio', src: '/img/lab01.jpeg', width: 1300, height: 975,
    desktopPosition: '50% 46%', mobilePosition: '64% 40%', mobile: true, route: 'lab',
    it: { name: 'Training e movimento', label: 'Laboratorio', detail: 'Corpo, movimento e voce', alt: 'Il gruppo durante il training fisico e gli esercizi di movimento in laboratorio' },
    en: { name: 'Training and movement', label: 'Laboratory', detail: 'Body, movement and voice', alt: 'The group practising physical training and movement exercises in the laboratory' },
  },
  {
    id: 'accessibilita', src: '/img/macbett/macbett-03.jpg', width: 1300, height: 866,
    desktopPosition: '50% 6%', mobilePosition: '55% 15%', mobile: false, route: 'research',
    it: { name: 'ETICA \u00b7 St\u00e9ntor', label: 'Ricerca e accessibilit\u00e0', detail: 'Sopratitoli e partecipazione', alt: 'Una scena di Macbett con sopratitoli proiettati sopra gli interpreti' },
    en: { name: 'ETICA \u00b7 St\u00e9ntor', label: 'Research and accessibility', detail: 'Surtitles and participation', alt: 'A scene from Macbett with surtitles projected above the performers' },
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
