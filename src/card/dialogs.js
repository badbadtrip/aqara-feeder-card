/** Modal dialogs: focus trap, feed confirmation, schedule slot editor. */
export class Dialogs {
  _focusableEls(container) {
    var list = container.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])');
    return Array.prototype.slice.call(list);
  }
  _trapTab(e, popup) {
    var focusables = this._focusableEls(popup);
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = this._shadow.activeElement;
    if (e.shiftKey) {
      if (active === first || !popup.contains(active)) { e.preventDefault(); last.focus(); }
    } else {
      if (active === last || !popup.contains(active)) { e.preventDefault(); first.focus(); }
    }
  }
  _showConfirmation(size, onConfirm, onCancel) {
    var self = this;
    var G = this._config.color_positive || 'rgb(206,245,149)';
    var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;
    var grams = Math.round(size * portionWeight);
    var existing = this._shadow.querySelector('.popup-overlay');
    if (existing) existing.remove();
    var confirmed = false;
    var closed = false;
    var overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.setAttribute('tabindex', '-1');
    var dismiss = function() {
      if (closed) return;
      closed = true;
      if (overlay.parentNode) overlay.remove();
      document.removeEventListener('keydown', onKey, true);
      if (!confirmed && typeof onCancel === 'function') onCancel();
    };
    var confirmAction = function() {
      if (confirmed || closed) return;
      confirmed = true;
      closed = true;
      if (overlay.parentNode) overlay.remove();
      document.removeEventListener('keydown', onKey, true);
      onConfirm();
    };
    var onKey = function(e) {
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); }
      else if (e.key === 'Enter') { e.preventDefault(); confirmAction(); }
      else if (e.key === 'Tab') { self._trapTab(e, popup); }
    };
    document.addEventListener('keydown', onKey, true);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });
    var popup = document.createElement('div');
    popup.className = 'popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'popup-title-confirm');
    popup.innerHTML =
      '<div class="popup-title" id="popup-title-confirm">Confirm feeding</div>' +
      '<button class="popup-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
      '<div style="text-align:center;font-size:13px;color:#969aa6;margin-bottom:20px;">' +
        'Will dispense <strong style="color:#fff;">' + size + ' por.</strong> (~' + grams + 'g)' +
      '</div>' +
      '<div class="popup-actions">' +
        '<button class="popup-cancel" id="cancel-feed-btn">Cancel</button>' +
        '<button class="popup-save" id="confirm-feed-btn" style="background:' + G + ';color:#000;">Feed</button>' +
      '</div>';
    overlay.appendChild(popup);
    this._shadow.querySelector('.card').appendChild(overlay);
    popup.querySelector('.popup-close').addEventListener('click', dismiss);
    popup.querySelector('#cancel-feed-btn').addEventListener('click', dismiss);
    popup.querySelector('#confirm-feed-btn').addEventListener('click', confirmAction);
    var confirmBtn = popup.querySelector('#confirm-feed-btn');
    if (confirmBtn && confirmBtn.focus) confirmBtn.focus();
  }
  _openEditPopup(slot, isNew) {
    var self = this;
    var existing = this._shadow.querySelector('.popup-overlay');
    if (existing) existing.remove();
    var s = this._schedules[slot];
    if (!s) return;
    var hour = s.hour, minute = s.minute, size = s.size;
    var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;
    var overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.setAttribute('tabindex', '-1');
    var closed = false;
    var saved = false;
    var dismiss = function() {
      if (closed) return;
      closed = true;
      if (overlay.parentNode) overlay.remove();
      document.removeEventListener('keydown', onKey, true);
      if (isNew && !saved) {
        self._schedules.splice(slot, 1);
        if (self._schedules.length === 0) self._pending = false;
        self._renderTab('schedule');
        self._renderHeader();
      }
    };
    var onKey = function(e) {
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); }
      else if (e.key === 'Enter' && e.target && e.target.tagName !== 'BUTTON') { e.preventDefault(); saveBtn.click(); }
      else if (e.key === 'Tab') { self._trapTab(e, popup); }
    };
    document.addEventListener('keydown', onKey, true);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });
    var popup = document.createElement('div');
    popup.className = 'popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'popup-title-edit');
    popup.innerHTML =
      '<div class="popup-title" id="popup-title-edit">Edit feeding ' + self._pad(s.hour) + ':' + self._pad(s.minute) + '</div>' +
      '<button class="popup-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
      '<div class="popup-row">' +
        '<div class="popup-row-label">Time</div>' +
        '<div class="time-inputs">' +
          '<input class="num-input" id="p-hour" type="number" min="0" max="23" inputmode="numeric" aria-label="Hour" value="' + Math.round(hour) + '">' +
          '<span class="time-sep">:</span>' +
          '<input class="num-input" id="p-min" type="number" min="0" max="59" inputmode="numeric" aria-label="Minute" value="' + Math.round(minute) + '">' +
        '</div>' +
        '<div class="popup-warn" id="p-warn" style="display:none;"></div>' +
      '</div>' +
      '<div class="popup-row">' +
        '<div class="popup-row-label">Portions</div>' +
        '<div class="size-stepper">' +
          '<button class="size-step-btn" id="p-minus" aria-label="Decrease">−</button>' +
          '<div><div class="size-val" id="p-size">' + Math.round(size) + '</div><div class="size-sub" id="p-grams">~' + Math.round(size*portionWeight) + 'g</div></div>' +
          '<button class="size-step-btn" id="p-plus" aria-label="Increase">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="popup-actions">' +
        '<button class="popup-cancel" id="p-cancel">Cancel</button>' +
        '<button class="popup-save" id="p-save">Save and send</button>' +
      '</div>';
    overlay.appendChild(popup);
    this._shadow.querySelector('.card').appendChild(overlay);
    var sizeEl = popup.querySelector('#p-size');
    var gramsEl = popup.querySelector('#p-grams');
    var hourInput = popup.querySelector('#p-hour');
    var minInput = popup.querySelector('#p-min');
    var warnEl = popup.querySelector('#p-warn');
    var validate = function() {
      var h = parseInt(hourInput.value, 10);
      var m = parseInt(minInput.value, 10);
      var hOk = !isNaN(h) && h >= 0 && h <= 23;
      var mOk = !isNaN(m) && m >= 0 && m <= 59;
      hourInput.classList.toggle('invalid', !hOk);
      minInput.classList.toggle('invalid', !mOk);
      var dup = false;
      if (hOk && mOk) {
        for (var i = 0; i < self._schedules.length; i++) {
          if (i === slot) continue;
          var other = self._schedules[i];
          if (Math.round(other.hour) === h && Math.round(other.minute) === m) { dup = true; break; }
        }
      }
      if (!hOk || !mOk) {
        warnEl.style.display = '';
        warnEl.textContent = 'Time must be 00:00–23:59';
      } else if (dup) {
        warnEl.style.display = '';
        warnEl.textContent = 'Another feeding already scheduled at this time';
      } else {
        warnEl.style.display = 'none';
      }
      return hOk && mOk && !dup;
    };
    hourInput.addEventListener('input', validate);
    minInput.addEventListener('input', validate);
    popup.querySelector('.popup-close').addEventListener('click', dismiss);
    popup.querySelector('#p-cancel').addEventListener('click', dismiss);
    var pMinusBtn = popup.querySelector('#p-minus');
    var pPlusBtn = popup.querySelector('#p-plus');
    var updateSizeButtons = function() {
      pMinusBtn.disabled = size <= 1;
      pPlusBtn.disabled = size >= 10;
    };
    pMinusBtn.addEventListener('click', function() {
      if (size <= 1) return;
      self._vibrate(5);
      size--; sizeEl.textContent = size; gramsEl.textContent = '~' + Math.round(size*portionWeight) + 'g';
      updateSizeButtons();
    });
    pPlusBtn.addEventListener('click', function() {
      if (size >= 10) return;
      self._vibrate(5);
      size++; sizeEl.textContent = size; gramsEl.textContent = '~' + Math.round(size*portionWeight) + 'g';
      updateSizeButtons();
    });
    updateSizeButtons();
    var saveBtn = popup.querySelector('#p-save');
    saveBtn.addEventListener('click', function() {
      if (saveBtn.disabled) return;
      if (!validate()) { self._vibrate(40); return; }
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.6';
      self._vibrate([10, 20, 10]);
      var h = parseInt(hourInput.value, 10);
      var m = parseInt(minInput.value, 10);
      if (self._schedules[slot]) {
        self._schedules[slot] = { hour: h, minute: m, size: size };
      }
      saved = true;
      self._sendSchedule();
      dismiss();
      self._showSent();
      setTimeout(function() { self._renderTab('schedule'); }, 400);
    });
    validate();
    if (hourInput && hourInput.focus) hourInput.focus();
  }
}
