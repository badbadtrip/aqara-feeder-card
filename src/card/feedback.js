/** User feedback: vibration, click sound, "Sent!"/"Fed!" indicators, snackbar. */
export class Feedback {
  _clickFeedback() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = this._audioCtx || (this._audioCtx = new Ctx());
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.04;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      o.stop(ctx.currentTime + 0.06);
    } catch(e) {}
  }
  _showFeedSuccess(btn) {
    var G = this._config.color_positive || 'rgb(206,245,149)';
    var origText = btn ? btn.textContent : null;
    var origBg = btn ? btn.style.background : null;
    if (btn) {
      btn.textContent = '✓ Fed!';
      btn.style.background = G;
      btn.style.color = '#000';
      btn.disabled = true;
      setTimeout(function() {
        btn.textContent = origText;
        btn.style.background = origBg || '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
    }
  }
  _showSent() {
    var badges = this._shadow.querySelector('#hdr-badges');
    if (!badges) return;
    var G = this._config.color_positive || 'rgb(206,245,149)';
    var sent = document.createElement('span');
    sent.className = 'badge';
    sent.style.cssText = 'background:rgba(206,245,149,.15);color:' + G;
    sent.textContent = 'Sent!';
    badges.appendChild(sent);
    var self = this;
    setTimeout(function() {
      if (sent.parentNode) sent.parentNode.removeChild(sent);
    }, 3000);
  }
  _vibrate(pattern) {
    if (this._config.vibration_enabled !== false && navigator.vibrate) {
      navigator.vibrate(pattern || 10);
    }
    if (this._config.sound_enabled === true) {
      this._clickFeedback();
    }
  }
  _showSnackbar(text, actionText, onAction) {
    var self = this;
    var card = this._shadow.querySelector('.card');
    if (!card) return;
    var existing = this._shadow.querySelector('.snackbar');
    if (existing) existing.remove();
    if (this._undoTimer) { clearTimeout(this._undoTimer); this._undoTimer = null; }
    var bar = document.createElement('div');
    bar.className = 'snackbar';
    bar.innerHTML = '<span class="snackbar-text">' + text + '</span>' +
      (actionText ? '<button class="snackbar-action">' + actionText + '</button>' : '');
    card.appendChild(bar);
    var dismiss = function() {
      if (bar.parentNode) bar.classList.add('snackbar-out');
      setTimeout(function() { if (bar.parentNode) bar.remove(); }, 200);
      if (self._undoTimer) { clearTimeout(self._undoTimer); self._undoTimer = null; }
    };
    var actionBtn = bar.querySelector('.snackbar-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', function() {
        if (typeof onAction === 'function') onAction();
        dismiss();
      });
    }
    this._undoTimer = setTimeout(function() {
      self._undo = null;
      dismiss();
    }, 5000);
  }
}
