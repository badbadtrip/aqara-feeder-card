import { defaultConfig } from '../defaults.js';
import { cardStyles } from './styles.js';
import { ScheduleState } from './state.js';
import { Formatting } from './format.js';
import { Feedback } from './feedback.js';
import { Dialogs } from './dialogs.js';
import { Header } from './header.js';
import { ScheduleTab } from './tabs/schedule.js';
import { FeedTab } from './tabs/feed.js';
import { InfoTab } from './tabs/info.js';

/** The card: <aqara-feeder-card>. Lifecycle, layout and tab switching live here;
 *  everything else is mixed in from the modules imported above. */
export class AqaraFeederCard extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._built = false;
    this._activeTab = 'schedule';
    this._timer = null;
    this._schedules = [];
    this._isLoading = false;
    this._lastSent = null;
    this._pending = false;
    this._undo = null;
    this._undoTimer = null;
    this._countdownTimer = null;
    this._lastFeedSize = null;
    this._customSize = null;
    this._lastSig = null;
  }
  disconnectedCallback() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (this._undoTimer) { clearTimeout(this._undoTimer); this._undoTimer = null; }
    if (this._countdownTimer) { clearInterval(this._countdownTimer); this._countdownTimer = null; }
  }
  static getConfigElement() {
    return document.createElement('aqara-feeder-card-editor');
  }
    static getStubConfig() {
      return defaultConfig();
    }
  setConfig(config) {
    var defaults = AqaraFeederCard.getStubConfig();
    this._config = Object.assign({}, defaults, config);
    this._built = false;
    if (this._hass) this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._render(); return; }
    if (this._timer) return;
    this._timer = setTimeout(function() { this._timer = null; this._updateDynamic(); }.bind(this), 300);
  }
  getCardSize() { return 5; }
  _e(key) { return this._config[key] || ''; }
  _lbl(key, fallback) {
    var v = this._config[key];
    return (v !== undefined && v !== '') ? v : fallback;
  }
  _state(id, fallback) {
    fallback = fallback !== undefined ? fallback : 'unavailable';
    return this._hass && id && this._hass.states[id] ? this._hass.states[id].state : fallback;
  }
  _num(id, fallback) {
    fallback = fallback !== undefined ? fallback : 0;
    var v = parseFloat(this._state(id, String(fallback)));
    return isNaN(v) ? fallback : v;
  }
  _render() {
    this._built = true;
    this._isLoading = false;
    this._lastSig = null;
    var cfg = this._config;
      var css = cardStyles(cfg);
    var icon = this._config.icon || '';
    var iconHtml;
    if (icon && (icon.startsWith('http') || icon.startsWith('data:'))) {
      iconHtml = '<img src="' + icon + '" alt="">';
    } else if (icon && icon.startsWith('/config/www/')) {
      var localPath = icon.replace('/config/www/', '/local/');
      iconHtml = '<img src="' + localPath + '" alt="">';
    } else if (icon && icon.startsWith('/')) {
      iconHtml = '<img src="' + icon + '" alt="">';
    } else {
      iconHtml = icon || '🐱';
    }
    var html =
      '<div class="card">' +
        '<div class="hdr">' +
          '<div class="hdr-icon">' + iconHtml + '</div>' +
          '<div class="hdr-info">' +
            '<div class="hdr-title"><span class="hdr-status-dot offline-dot" id="hdr-status-dot"></span>' + (this._config.title || 'Feeder') + '</div>' +
            '<div class="hdr-sub" id="hdr-sub" title="">Loading...</div>' +
          '</div>' +
          '<div class="hdr-badges" id="hdr-badges"></div>' +
        '</div>' +
        '<div class="stats" id="stats-row"></div>' +
        '<div class="tabs" role="tablist">' +
          '<button class="tab-btn active" id="tab-btn-schedule" data-tab="schedule" role="tab" aria-selected="true" aria-controls="tab-schedule"><div class="tab-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><span class="tab-label">' + this._lbl('label_schedule', 'Schedule') + '</span></button>' +
          '<button class="tab-btn" id="tab-btn-feed" data-tab="feed" role="tab" aria-selected="false" aria-controls="tab-feed"><div class="tab-icon"><svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div><span class="tab-label">' + this._lbl('label_feed', 'Feed now') + '</span></button>' +
          '<button class="tab-btn" id="tab-btn-info" data-tab="info" role="tab" aria-selected="false" aria-controls="tab-info"><div class="tab-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div><span class="tab-label">' + this._lbl('label_settings', 'Settings') + '</span></button>' +
        '</div>' +
        '<div class="content">' +
          '<div id="tab-schedule" class="tab-pane" role="tabpanel" aria-labelledby="tab-btn-schedule"></div>' +
          '<div id="tab-feed" class="tab-pane" role="tabpanel" aria-labelledby="tab-btn-feed" style="display:none"></div>' +
          '<div id="tab-info" class="tab-pane" role="tabpanel" aria-labelledby="tab-btn-info" style="display:none"></div>' +
        '</div>' +
      '</div>';
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    this._shadow.innerHTML = '';
    this._shadow.appendChild(styleEl);
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    this._shadow.appendChild(wrapper.firstChild);
    var self = this;
    var tabs = ['schedule', 'feed', 'info'];
    var switchTab = function(tab) {
      if (tabs.indexOf(tab) === -1) return;
      self._isLoading = false;
      self._shadow.querySelectorAll('.tab-btn').forEach(function(b) {
        var isActive = b.dataset.tab === tab;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive);
      });
      self._activeTab = tab;
      tabs.forEach(function(t) {
        var el = self._shadow.querySelector('#tab-' + t);
        if (el) el.style.display = t === tab ? '' : 'none';
      });
      self._renderTab(tab);
    };
    this._switchTab = switchTab;
    this._shadow.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self._vibrate(10);
        switchTab(btn.dataset.tab);
      });
    });
    var content = this._shadow.querySelector('.content');
    if (content) {
      var startX = 0, startY = 0, tracking = false;
      content.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        tracking = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      content.addEventListener('touchend', function(e) {
        if (!tracking) return;
        tracking = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (Math.abs(dx) < 50 || Math.abs(dy) > 50) return;
        if (self._shadow.querySelector('.popup-overlay')) return;
        var idx = tabs.indexOf(self._activeTab);
        if (idx < 0) return;
        if (dx < 0 && idx < tabs.length - 1) { self._vibrate(8); switchTab(tabs[idx + 1]); }
        else if (dx > 0 && idx > 0) { self._vibrate(8); switchTab(tabs[idx - 1]); }
      }, { passive: true });
    }
    this._updateDynamic();
  }
  _updateDynamic() {
    if (!this._hass) return;
    this._renderHeader();
    this._renderStats();
    if (this._isLoading) return;
    if (this._relevantSignature() === this._lastSig) return;
    this._renderTab(this._activeTab);
  }
  _renderTab(tab) {
    var el = this._shadow.querySelector('#tab-' + tab);
    if (!el) return;
    this._lastSig = this._relevantSignature();
    if (tab === 'schedule') this._renderScheduleTab(el);
    else if (tab === 'feed') this._renderFeedTab(el);
    else if (tab === 'info') this._renderInfoTab(el);
  }
  _relevantSignature() {
    var self = this;
    var keys = [
      'entity_schedule', 'entity_schedule_pretty', 'entity_portions_day', 'entity_weight_day',
      'entity_feeding_source', 'entity_feeding_size', 'entity_portion_weight', 'entity_serving_size',
      'entity_mode', 'entity_child_lock', 'entity_led', 'entity_error', 'entity_food_level'
    ];
    var parts = keys.map(function(k) { return self._state(self._e(k), ''); });
    var updateEntity = this._e('entity_update');
    var fw = (this._hass && updateEntity && this._hass.states[updateEntity] && this._hass.states[updateEntity].attributes.installed_version) || '';
    parts.push(fw);
    parts.push(this._pending ? '1' : '0');
    parts.push(this._activeTab);
    parts.push(String(this._schedules.length));
    return parts.join('|');
  }
}

function applyMixins(target, mixins) {
  mixins.forEach(function(m) {
    Object.getOwnPropertyNames(m.prototype).forEach(function(name) {
      if (name === 'constructor') return;
      if (Object.prototype.hasOwnProperty.call(target.prototype, name)) {
        throw new Error('Mixin method collision: ' + name);
      }
      Object.defineProperty(target.prototype, name, Object.getOwnPropertyDescriptor(m.prototype, name));
    });
  });
}

applyMixins(AqaraFeederCard, [ScheduleState, Formatting, Feedback, Dialogs, Header, ScheduleTab, FeedTab, InfoTab]);
