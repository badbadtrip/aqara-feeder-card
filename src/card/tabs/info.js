/** Settings tab. */
export class InfoTab {
  _renderInfoTab(container) {
    if (!container) return;
    var self = this;
    var portionWeight = this._state(this._e('entity_portion_weight'), '-');
    var lock = this._state(this._e('entity_child_lock')) === 'on';
    var led = this._state(this._e('entity_led')) === 'on';
    var mode = this._state(this._e('entity_mode'), '-');
    var feedingSize = this._state(this._e('entity_feeding_size'), '-');
    var feedingSource = this._state(this._e('entity_feeding_source'), '-');
    var sourceLabel = { schedule: 'Auto schedule', manual: 'Manual', remote: 'Remote' }[feedingSource] || (feedingSource === '-' ? '-' : feedingSource);
    var updateEntity = this._e('entity_update');
    var fw = (this._hass && updateEntity && this._hass.states[updateEntity] && this._hass.states[updateEntity].attributes.installed_version) || '-';
    var actual = this._state(this._e('entity_schedule'), '-');
    var rawOpen = container.querySelector('.raw-details') && container.querySelector('.raw-details').open;
    var modeEntity = this._e('entity_mode');
    var modeAvailable = mode === 'schedule' || mode === 'manual';
    var modeRow = modeAvailable
      ? '<div class="info-row"><div class="info-row-label">Mode</div>' +
          '<div class="segmented" role="tablist" aria-label="Feeder mode">' +
            '<button class="seg-btn' + (mode === 'schedule' ? ' active' : '') + '" data-mode="schedule" role="tab" aria-selected="' + (mode === 'schedule') + '">Auto</button>' +
            '<button class="seg-btn' + (mode === 'manual' ? ' active' : '') + '" data-mode="manual" role="tab" aria-selected="' + (mode === 'manual') + '">Manual</button>' +
          '</div></div>'
      : '<div class="info-row"><div class="info-row-label">Mode</div><div class="info-row-val">-</div></div>';
    container.innerHTML =
      '<div class="info-grid">' +
        modeRow +
        '<div class="info-row"><div class="info-row-label">Haptic feedback</div><div class="toggle ' + (this._config.vibration_enabled !== false ? 'on' : '') + '" id="toggle-vibration" role="switch" tabindex="0" aria-checked="' + (this._config.vibration_enabled !== false) + '" aria-label="Haptic feedback"><div class="toggle-thumb"></div></div></div>' +
        '<div class="info-row"><div class="info-row-label">Sound feedback</div><div class="toggle ' + (this._config.sound_enabled === true ? 'on' : '') + '" id="toggle-sound" role="switch" tabindex="0" aria-checked="' + (this._config.sound_enabled === true) + '" aria-label="Sound feedback"><div class="toggle-thumb"></div></div></div>' +
        '<div class="info-row"><div class="info-row-label">Portion weight</div>' +
          '<div class="info-row-val" style="display:flex;align-items:center;gap:8px;">' +
            '<button class="step-btn" id="pw-minus" style="width:36px;height:36px;font-size:14px;" aria-label="Decrease">−</button>' +
            '<span id="pw-val">' + portionWeight + '</span>g' +
            '<button class="step-btn" id="pw-plus" style="width:36px;height:36px;font-size:14px;" aria-label="Increase">+</button>' +
          '</div></div>' +
        '<div class="info-row"><div class="info-row-label">Last feeding source</div><div class="info-row-val">' + sourceLabel + '</div></div>' +
        '<div class="info-row"><div class="info-row-label">Last portion size</div><div class="info-row-val">' + feedingSize + ' por.</div></div>' +
        '<div class="info-row"><div class="info-row-label">Child lock</div><div class="toggle ' + (lock?'on':'') + '" id="toggle-lock" role="switch" tabindex="0" aria-checked="' + lock + '" aria-label="Child lock"><div class="toggle-thumb"></div></div></div>' +
        '<div class="info-row"><div class="info-row-label">LED indicator</div><div class="toggle ' + (led?'on':'') + '" id="toggle-led" role="switch" tabindex="0" aria-checked="' + led + '" aria-label="LED indicator"><div class="toggle-thumb"></div></div></div>' +
        '<div class="info-row"><div class="info-row-label">Firmware</div><div class="info-row-val">' + fw + '</div></div>' +
        '<details class="raw-details"' + (rawOpen ? ' open' : '') + '><summary>Feeder schedule (raw)</summary><div class="raw-content">' + actual + '</div></details>' +
      '</div>';
    container.querySelectorAll('.seg-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (!modeEntity) return;
        var target = btn.dataset.mode;
        if (mode === target) return;
        self._vibrate(15);
        container.querySelectorAll('.seg-btn').forEach(function(b) {
          var on = b.dataset.mode === target;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on);
        });
        self._hass.callService('select', 'select_option', { entity_id: modeEntity, option: target });
      });
    });
    var parsedPw = parseFloat(portionWeight);
    var pw = isNaN(parsedPw) ? 5 : parsedPw;
    var pwAvailable = !isNaN(parsedPw);
    var pwEl = container.querySelector('#pw-val');
    var pwEntity = this._e('entity_portion_weight');
    var pwMinusBtn = container.querySelector('#pw-minus');
    var pwPlusBtn = container.querySelector('#pw-plus');
    var updatePwButtons = function() {
      pwMinusBtn.disabled = !pwAvailable || !pwEntity || pw <= 1;
      pwPlusBtn.disabled = !pwAvailable || !pwEntity || pw >= 20;
    };
    pwMinusBtn.addEventListener('click', function() {
      if (!pwAvailable || !pwEntity || pw <= 1) return;
      pw--; pwEl.textContent = pw; updatePwButtons();
      self._hass.callService('number', 'set_value', { entity_id: pwEntity, value: pw });
    });
    pwPlusBtn.addEventListener('click', function() {
      if (!pwAvailable || !pwEntity || pw >= 20) return;
      pw++; pwEl.textContent = pw; updatePwButtons();
      self._hass.callService('number', 'set_value', { entity_id: pwEntity, value: pw });
    });
    updatePwButtons();
    var bindToggle = function(el, handler) {
      if (!el) return;
      el.addEventListener('click', handler);
      el.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handler.call(el); }
      });
    };
    bindToggle(container.querySelector('#toggle-vibration'), function() {
      var isOn = this.classList.toggle('on');
      this.setAttribute('aria-checked', isOn);
      self._config.vibration_enabled = isOn;
      if (isOn && navigator.vibrate) navigator.vibrate([10, 20, 10]);
    });
    bindToggle(container.querySelector('#toggle-sound'), function() {
      var isOn = this.classList.toggle('on');
      this.setAttribute('aria-checked', isOn);
      self._config.sound_enabled = isOn;
      if (isOn) self._clickFeedback();
    });
    var lockEntity = this._e('entity_child_lock');
    bindToggle(container.querySelector('#toggle-lock'), function() {
      if (!lockEntity) return;
      self._vibrate([10, 20, 10]);
      var isOn = this.classList.toggle('on');
      this.setAttribute('aria-checked', isOn);
      self._hass.callService('switch', isOn ? 'turn_on' : 'turn_off', { entity_id: lockEntity });
    });
    var ledEntity = this._e('entity_led');
    bindToggle(container.querySelector('#toggle-led'), function() {
      if (!ledEntity) return;
      self._vibrate([10, 20, 10]);
      var isOn = this.classList.toggle('on');
      this.setAttribute('aria-checked', isOn);
      self._hass.callService('switch', isOn ? 'turn_on' : 'turn_off', { entity_id: ledEntity });
    });
  }
}
