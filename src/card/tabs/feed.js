/** Feed-now tab. */
export class FeedTab {
  _renderFeedTab(container) {
    if (!container) return;
    var self = this;
    var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;
    var sizes = Array.isArray(this._config.quick_feed_sizes) && this._config.quick_feed_sizes.length
      ? this._config.quick_feed_sizes.slice()
      : [1, 2, 3, 5];
    sizes = sizes.map(function(n) { return parseInt(n, 10); }).filter(function(n) { return !isNaN(n) && n > 0 && n <= 10; });
    if (!sizes.length) sizes = [1, 2, 3, 5];
    var favourite = parseInt(this._config.quick_feed_default, 10);
    if (isNaN(favourite) || favourite <= 0) favourite = null;
    if (this._customSize == null) this._customSize = this._lastFeedSize || 1;
    var customSize = this._customSize;
    var levelClass = function(n) {
      if (n <= 2) return 'level-low';
      if (n <= 4) return 'level-normal';
      return 'level-high';
    };
    var pelletsHtml = function(n) {
      var inner = '';
      var max = Math.min(n, 6);
      for (var i = 0; i < max; i++) inner += '<span class="pellet"></span>';
      if (n > 6) inner += '<span class="pellet-more">+' + (n - 6) + '</span>';
      return '<div class="quick-pellets" aria-hidden="true">' + inner + '</div>';
    };
    var bowlSvg = function(n) {
      var maxFill = 6;
      var fill = Math.min(n, maxFill) / maxFill;
      var fillY = 18 - Math.round(fill * 12);
      return '<svg class="quick-bowl" viewBox="0 0 36 22" aria-hidden="true">' +
        '<defs><clipPath id="qbowl-clip-' + n + '"><path d="M3 5 L33 5 L29 19 Q18 21 7 19 Z"/></clipPath></defs>' +
        '<path class="bowl-fill" d="M3 ' + fillY + ' L33 ' + fillY + ' L29 19 Q18 21 7 19 Z" clip-path="url(#qbowl-clip-' + n + ')"/>' +
        '<path class="bowl-stroke" d="M3 5 L33 5 L29 19 Q18 21 7 19 Z" fill="none"/>' +
        '<line class="bowl-rim" x1="1" y1="5" x2="35" y2="5"/>' +
      '</svg>';
    };
    var html =
      '<div class="feed-section-title">Quick feed</div>' +
      '<div class="quick-btns sizes-' + sizes.length + '">';
    sizes.forEach(function(n) {
      var classes = ['quick-btn', levelClass(n)];
      if (n === favourite) classes.push('favourite');
      if (self._lastFeedSize === n) classes.push('last-used');
      var grams = Math.round(n * portionWeight);
      html += '<button class="' + classes.join(' ') + '" data-size="' + n + '" aria-label="Feed ' + n + ' portions, ~' + grams + ' grams">' +
        (n === favourite ? '<span class="quick-fav" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg></span>' : '') +
        (self._lastFeedSize === n ? '<span class="quick-last-dot" aria-label="Last used"></span>' : '') +
        pelletsHtml(n) +
        bowlSvg(n) +
        '<div class="quick-meta">' +
          '<span class="quick-btn-val">' + n + '</span>' +
          '<span class="quick-btn-lbl">~' + grams + 'g</span>' +
        '</div>' +
        '<span class="quick-fed-mark" aria-hidden="true">✓ Fed!</span>' +
      '</button>';
    });
    html += '</div>' +
      '<div class="feed-section-title">Custom</div>' +
      '<div class="custom-feed">' +
        '<div class="custom-label">Number of portions</div>' +
        '<div class="stepper">' +
          '<button class="step-btn" id="c-minus" aria-label="Decrease">−</button>' +
          '<div class="step-val" id="c-val">' + customSize + '</div>' +
          '<button class="step-btn" id="c-plus" aria-label="Increase">+</button>' +
        '</div>' +
      '</div>' +
      '<button class="feed-now-btn" id="feed-now-btn">Feed now (' + customSize + ' por. ~' + Math.round(customSize*portionWeight) + 'g)</button>';
    container.innerHTML = html;
    var valEl = container.querySelector('#c-val');
    var btn = container.querySelector('#feed-now-btn');
    var cMinusBtn = container.querySelector('#c-minus');
    var cPlusBtn = container.querySelector('#c-plus');
    var updateCustom = function() {
      self._customSize = customSize;
      valEl.textContent = customSize;
      btn.textContent = 'Feed now (' + customSize + ' por. ~' + Math.round(customSize*portionWeight) + 'g)';
      cMinusBtn.disabled = customSize <= 1;
      cPlusBtn.disabled = customSize >= 10;
    };
    cMinusBtn.addEventListener('click', function() {
      if (customSize > 1) { customSize--; updateCustom(); }
    });
    cPlusBtn.addEventListener('click', function() {
      if (customSize < 10) { customSize++; updateCustom(); }
    });
    updateCustom();
    container.querySelectorAll('.quick-btn').forEach(function(b) {
      b.addEventListener('click', function() {
        if (b.dataset.busy === '1') return;
        self._vibrate(15);
        var size = parseInt(b.dataset.size, 10);
        if (isNaN(size)) return;
        b.dataset.busy = '1';
        b.classList.add('busy');
        self._showConfirmation(size, function() {
          self._feedNow(size).then(function() {
            b.classList.remove('busy');
            b.classList.add('fed');
            setTimeout(function() {
              b.dataset.busy = '';
              self._renderTab('feed');
            }, 1800);
          }).catch(function() {
            b.dataset.busy = '';
            b.classList.remove('busy');
            self._showSnackbar('Failed to send feed command');
          });
        }, function() {
          b.dataset.busy = '';
          b.classList.remove('busy');
        });
      });
    });
    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      self._vibrate(15);
      self._showConfirmation(customSize, function() {
        btn.disabled = true;
        self._feedNow(customSize).then(function() {
          self._showFeedSuccess(btn);
        }).catch(function() {
          btn.disabled = false;
          self._showSnackbar('Failed to send feed command');
        });
      });
    });
  }
}
