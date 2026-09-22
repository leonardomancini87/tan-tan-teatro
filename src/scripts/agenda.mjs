import { UI, routes, romeToday, escapeHTML, normalizePerformances } from '../data/agenda.mjs';
import { renderEvents } from '../lib/agenda-render.mjs';

// Cache only successful responses for one minute. A valid [] is authoritative:
// it removes all snapshot performances instead of bringing cancelled shows back.
let cache;
async function loadPerformances() {
  if (cache && Date.now() - cache.at < 60000) return cache.promise;
  const config = document.querySelector('[data-tt-calendar-config]');
  if (!config?.dataset.url || !config.dataset.key) throw new Error('Calendar not configured');
  const url = new URL('/rest/v1/public_appointments', config.dataset.url);
  url.search = new URLSearchParams({
    select: 'id,title,venue,city,starts_on,ends_on,starts_at_time,is_published',
    is_published: 'eq.true', order: 'starts_on.asc',
  }).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const headers = { apikey: config.dataset.key };
  // The new sb_publishable_ keys are API keys, not JWT bearer tokens.
  if (config.dataset.key.startsWith('eyJ')) headers.Authorization = `Bearer ${config.dataset.key}`;
  const promise = fetch(url, { headers, signal: controller.signal, credentials: 'omit', cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Calendar HTTP ${response.status}`);
      const rows = await response.json();
      normalizePerformances(rows); // Validate the payload before replacing SSR.
      return rows;
    }).finally(() => clearTimeout(timer));
  cache = { at: Date.now(), promise };
  promise.catch(() => { if (cache?.promise === promise) cache = undefined; });
  return promise;
}
class TanTanAgenda extends HTMLElement {
  connectedCallback() {
    if (this.running) return;
    this.running = true;
    this.rows = undefined;
    this.failed = false;
    this.locale = this.dataset.locale === 'en' ? 'en' : 'it';
    this.mode = this.dataset.mode === 'list' ? 'list' : 'cards';
    this.limit = Math.max(0, Number(this.dataset.limit) || 0);
    this.day = romeToday();
    this.paint();
    this.refresh = this.refresh.bind(this);
    this.onVisibility = () => { if (!document.hidden) this.refresh(); };
    this.interval = setInterval(this.refresh, 60000);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.refresh();
  }
  disconnectedCallback() {
    clearInterval(this.interval);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.running = false;
  }
  async refresh() {
    if (!this.isConnected || this.pending) return;
    const today = romeToday();
    if (today !== this.day) { this.day = today; this.paint(); }
    this.pending = true;
    try {
      const rows = await loadPerformances();
      if (!this.isConnected) return;
      const changed = JSON.stringify(rows) !== JSON.stringify(this.rows) || this.failed;
      this.rows = rows; this.failed = false;
      if (changed) this.paint();
    } catch {
      if (!this.isConnected) return;
      this.failed = true;
      this.paint();
    } finally { this.pending = false; }
  }
  paint() {
    const items = this.querySelector('[data-agenda-items]');
    if (!items) return;
    // Never replace a focused link without restoring its focus.
    const focus = this.contains(document.activeElement) && document.activeElement instanceof HTMLAnchorElement
      ? { href: document.activeElement.getAttribute('href'), label: document.activeElement.textContent } : null;
    const html = renderEvents({ locale: this.locale, mode: this.mode, limit: this.limit, today: this.day, rows: this.rows });
    if (html !== this.lastHTML) {
      items.innerHTML = html; this.lastHTML = html;
      if (focus) Array.from(items.querySelectorAll('a')).find((a) => a.getAttribute('href') === focus.href && a.textContent === focus.label)?.focus({ preventScroll: true });
    }
    const status = this.querySelector('[data-agenda-status]');
    if (status) {
      status.hidden = !this.failed;
      status.innerHTML = this.failed ? `${escapeHTML(UI[this.locale].status)} <a href="${routes(this.locale).contacts}">${escapeHTML(UI[this.locale].statusLink)}</a>` : '';
    }
  }
}
if (!customElements.get('tt-agenda')) customElements.define('tt-agenda', TanTanAgenda);
