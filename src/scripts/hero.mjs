/** Dependency-free, hero-only slideshow. No visible carousel controls. */
export function availableSlideIndices(slides, mobile) {
  return slides.flatMap((slide, index) => !mobile || slide.dataset.mobile !== 'false' ? [index] : []);
}
export function shouldRotate({ paused, reduced, hovered, inView, pageVisible, count }) {
  return !paused && !reduced && !hovered && inView && pageVisible && count > 1;
}

export class HeroSlideshow {
  constructor(root) {
    this.root = root;
    this.panels = Array.from(root.querySelectorAll('.tt-hero-slide'));
    this.interval = Math.max(8000, Number(root.dataset.heroInterval) || 8000);
    this.fade = Math.max(0, Number(root.dataset.heroFade) || 1400);
    this.mobileQuery = window.matchMedia('(max-width:760px)');
    this.motionQuery = window.matchMedia('(prefers-reduced-motion:reduce)');
    this.hoverQuery = window.matchMedia('(hover:hover)');
    this.abort = new AbortController();
    this.signal = this.abort.signal;
    this.active = 0;
    this.ticket = 0;
    this.destroyed = false;
    this.failed = new Set();
    this.imagePromises = new Map();
    this.available = availableSlideIndices(this.panels, this.mobileQuery.matches);
    this.reduced = this.motionQuery.matches;
    this.paused = this.reduced;
    this.hovered = this.hoverQuery.matches && root.matches(':hover');
    this.focused = root.contains(document.activeElement);
    this.pageVisible = !document.hidden;
    const rect = root.getBoundingClientRect();
    this.inView = rect.bottom > 0 && rect.top < window.innerHeight;
    this.bindEvents();
    root.dataset.heroReady = 'true';
    this.syncRotation();
  }

  listen(target, event, listener) { target.addEventListener(event, listener, { signal: this.signal }); }

  bindEvents() {
    this.listen(this.root, 'pointerenter', (event) => {
      if (event.pointerType === 'touch' || !this.hoverQuery.matches) return;
      this.hovered = true;
      this.syncRotation();
    });
    this.listen(this.root, 'pointerleave', () => {
      this.hovered = false;
      this.syncRotation();
    });
    this.listen(this.root, 'focusin', () => {
      this.focused = true;
      this.syncRotation();
    });
    this.listen(this.root, 'focusout', () => {
      queueMicrotask(() => {
        this.focused = this.root.contains(document.activeElement);
        this.syncRotation();
      });
    });
    this.listen(document, 'visibilitychange', () => {
      this.pageVisible = !document.hidden;
      this.syncRotation();
    });
    this.listen(window, 'pagehide', () => { this.pageVisible = false; this.syncRotation(); });
    this.listen(window, 'pageshow', () => { this.pageVisible = !document.hidden; this.syncRotation(); });
    this.listen(this.motionQuery, 'change', () => {
      this.reduced = this.motionQuery.matches;
      this.paused = this.reduced;
      this.finishTransition();
      this.syncRotation();
    });
    this.listen(this.mobileQuery, 'change', () => {
      this.available = availableSlideIndices(this.panels, this.mobileQuery.matches);
      if (!this.available.includes(this.active)) {
        this.ticket++;
        this.commit(this.available[0], true);
      }
      this.syncRotation();
    });
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting && entry.intersectionRatio >= 0.1;
        this.syncRotation();
      }, { threshold: [0, 0.1] });
      this.observer.observe(this.root);
    }
  }

  canRotate() {
    return !this.destroyed && shouldRotate({
      paused: this.paused,
      reduced: this.reduced,
      hovered: this.hovered || this.focused,
      inView: this.inView,
      pageVisible: this.pageVisible,
      count: this.available.filter((index) => !this.failed.has(index)).length,
    });
  }

  nextIndex() {
    const start = this.available.indexOf(this.active);
    for (let step = 1; step < this.available.length; step++) {
      const index = this.available[(start + step) % this.available.length];
      if (!this.failed.has(index)) return index;
    }
    return this.active;
  }

  syncRotation() {
    clearTimeout(this.timer);
    clearTimeout(this.preloadTimer);
    if (this.destroyed) return;
    this.root.dataset.heroRunning = String(this.canRotate());
    if (!this.canRotate()) return;
    this.preloadTimer = setTimeout(() => {
      if (this.canRotate()) void this.ensureImage(this.nextIndex());
    }, 1800);
    this.timer = setTimeout(() => {
      if (this.canRotate()) void this.show(this.nextIndex());
    }, this.interval);
  }

  async ensureImage(index) {
    if (this.imagePromises.has(index)) return this.imagePromises.get(index);
    const panel = this.panels[index];
    let image = panel.querySelector('img');
    if (!image) {
      const template = panel.querySelector('template[data-hero-photo]');
      if (!template) return false;
      panel.insertBefore(template.content.cloneNode(true), panel.firstChild);
      template.remove();
      image = panel.querySelector('img');
    }
    const promise = new Promise((resolve) => {
      let settled = false;
      let timeout;
      const cleanup = () => {
        clearTimeout(timeout);
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', failed);
        this.signal.removeEventListener('abort', failed);
      };
      const done = (ok) => { if (settled) return; settled = true; cleanup(); resolve(ok); };
      const loaded = async () => {
        try { if (image.decode) await image.decode(); } catch { /* Loaded images can still be usable. */ }
        done(image.naturalWidth > 0);
      };
      const failed = () => done(false);
      if (this.destroyed) { done(false); return; }
      if (image.complete) { if (image.naturalWidth) void loaded(); else done(false); return; }
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failed, { once: true });
      this.signal.addEventListener('abort', failed, { once: true });
      timeout = setTimeout(failed, 12000);
    });
    this.imagePromises.set(index, promise);
    return promise;
  }

  async show(index) {
    if (!this.available.includes(index) || this.destroyed) return;
    const ticket = ++this.ticket;
    if (index === this.active) { this.syncRotation(); return; }
    const ready = await this.ensureImage(index);
    if (this.destroyed || ticket !== this.ticket || !this.available.includes(index)) return;
    if (!this.canRotate()) return;
    if (!ready) {
      this.failed.add(index);
      this.syncRotation();
      return;
    }
    this.commit(index, this.reduced);
    this.syncRotation();
  }

  commit(index, instant = false) {
    this.finishTransition();
    const previous = this.active;
    this.active = index;
    if (instant) this.root.dataset.heroInstant = 'true';
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i], current = i === index;
      panel.classList.toggle('is-active', current);
      panel.classList.toggle('is-previous', !instant && previous !== index && i === previous);
      panel.setAttribute('aria-hidden', String(!current));
      panel.inert = !current;
      const link = panel.querySelector('a');
      if (link) {
        if (current) link.removeAttribute('tabindex');
        else link.tabIndex = -1;
      }
    }
    if (instant) {
      void this.root.offsetWidth;
      delete this.root.dataset.heroInstant;
    } else {
      this.transitionTimer = setTimeout(() => this.finishTransition(), this.fade + 60);
    }
  }

  finishTransition() {
    clearTimeout(this.transitionTimer);
    for (const panel of this.panels) panel.classList.remove('is-previous');
  }

  destroy() {
    this.destroyed = true;
    this.ticket++;
    clearTimeout(this.timer);
    clearTimeout(this.preloadTimer);
    this.finishTransition();
    this.abort.abort();
    this.observer?.disconnect();
  }
}

const instances = new Map();
export function initHeroSlideshows() {
  if (typeof document === 'undefined') return;
  for (const [root, instance] of instances) {
    if (!root.isConnected) { instance.destroy(); instances.delete(root); }
  }
  for (const root of document.querySelectorAll('[data-tt-hero]')) {
    if (!instances.has(root)) instances.set(root, new HeroSlideshow(root));
  }
}
export function destroyHeroSlideshows() {
  for (const instance of instances.values()) instance.destroy();
  instances.clear();
}
if (typeof document !== 'undefined') {
  initHeroSlideshows();
  document.addEventListener('astro:page-load', initHeroSlideshows);
  document.addEventListener('astro:before-swap', destroyHeroSlideshows);
}
