/** Card header (status, badges, next-feeding countdown, food level) and stats row. */
export class Header {
  _renderHeader() {
    var sub = this._shadow.querySelector('#hdr-sub');
    var badges = this._shadow.querySelector('#hdr-badges');
    var foodBar = this._shadow.querySelector('#food-bar');
    if (!sub || !badges) return;
    var mode = this._state(this._e('entity_mode'), 'unavailable');
    var error = this._state(this._e('entity_error')) === 'on';
    var online = mode !== 'unavailable' && mode !== 'unknown';
    var next = this._computeNextFeeding();
    if (next) {
      var cd = this._formatCountdown(next.seconds);
      sub.textContent = 'Через ' + cd + ' · ' + this._pad(next.schedule.hour) + ':' + this._pad(next.schedule.minute);
    } else {
      var pretty = this._state(this._e('entity_schedule_pretty'), '');
      var text = (pretty && pretty !== 'unavailable' && pretty !== 'unknown') ? pretty : 'Нет расписания';
      sub.textContent = text;
    }
    sub.title = sub.textContent;
    var statusDot = this._shadow.querySelector('#hdr-status-dot');
    if (statusDot) {
      statusDot.classList.toggle('online-dot', online);
      statusDot.classList.toggle('offline-dot', !online);
      statusDot.title = online ? 'В сети' : 'Не в сети';
    }
    var parts = [];
    if (online && mode === 'manual') parts.push('<span class="badge badge-mode">Ручной режим</span>');
    if (this._pending) parts.push('<span class="badge badge-pending" title="Изменения ещё не отправлены">● Не отправлено</span>');
    if (error) parts.push('<span class="badge badge-error">Ошибка</span>');
    badges.innerHTML = parts.join('');
    var foodEntity = this._e('entity_food_level');
    if (foodEntity && this._hass && this._hass.states[foodEntity]) {
      var pct = parseFloat(this._hass.states[foodEntity].state);
      if (!isNaN(pct)) {
        if (pct > 100) pct = 100;
        if (pct < 0) pct = 0;
        var levelClass = pct < 15 ? 'low' : pct < 35 ? 'mid' : 'ok';
        if (!foodBar) {
          var stats = this._shadow.querySelector('#stats-row');
          if (stats && stats.parentNode) {
            var bar = document.createElement('div');
            bar.id = 'food-bar';
            bar.className = 'food-bar ' + levelClass;
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
            bar.setAttribute('aria-valuenow', Math.round(pct));
            bar.setAttribute('aria-label', 'Уровень корма');
            bar.innerHTML = '<div class="food-bar-label">Уровень корма</div><div class="food-bar-track"><div class="food-bar-fill" style="width:' + pct + '%;"></div></div><div class="food-bar-val">' + Math.round(pct) + '%</div>';
            stats.parentNode.insertBefore(bar, stats);
          }
        } else {
          foodBar.className = 'food-bar ' + levelClass;
          foodBar.setAttribute('aria-valuenow', Math.round(pct));
          var fill = foodBar.querySelector('.food-bar-fill');
          var val = foodBar.querySelector('.food-bar-val');
          if (fill) fill.style.width = pct + '%';
          if (val) val.textContent = Math.round(pct) + '%';
        }
      }
    } else if (foodBar) {
      foodBar.remove();
    }
    this._ensureCountdownTimer();
  }
  _ensureCountdownTimer() {
    var self = this;
    if (this._countdownTimer) return;
    if (!this._computeNextFeeding()) return;
    this._countdownTimer = setInterval(function() {
      if (!self.isConnected) {
        clearInterval(self._countdownTimer);
        self._countdownTimer = null;
        return;
      }
      var sub = self._shadow.querySelector('#hdr-sub');
      if (!sub) return;
      var n = self._computeNextFeeding();
      if (!n) return;
      var cd = self._formatCountdown(n.seconds);
      sub.textContent = 'Через ' + cd + ' · ' + self._pad(n.schedule.hour) + ':' + self._pad(n.schedule.minute);
    }, 30000);
  }
  _renderStats() {
    var el = this._shadow.querySelector('#stats-row');
    if (!el) return;
    var clean = function(v) { return (v === 'unknown' || v === 'unavailable') ? '-' : v; };
    var portions = clean(this._state(this._e('entity_portions_day'), '-'));
    var grams = clean(this._state(this._e('entity_weight_day'), '-'));
    var weight = clean(this._state(this._e('entity_portion_weight'), '-'));
    var gFmt = this._formatGrams(grams);
    var portionsClass = (portions === '0' || portions === '-') ? 'stat-val empty' : 'stat-val';
    var gramsClass = (gFmt.val === '0' || gFmt.val === '-') ? 'stat-val empty' : 'stat-val';
    el.innerHTML =
      '<div class="stat"><div class="' + portionsClass + '">' + portions + '</div><div class="stat-lbl">' + this._lbl('label_portions_today', 'Порций сегодня') + '</div></div>' +
      '<div class="stat"><div class="' + gramsClass + '">' + gFmt.val + '<span>' + gFmt.unit + '</span></div><div class="stat-lbl">' + this._lbl('label_grams_today', 'Граммов сегодня') + '</div></div>' +
      '<div class="stat"><div class="stat-val">' + weight + '<span>г</span></div><div class="stat-lbl">' + this._lbl('label_per_portion', 'Вес порции') + '</div></div>';
  }
}
