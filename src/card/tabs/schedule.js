/** Schedule tab. */
export class ScheduleTab {
  _renderScheduleTab(container) {
    if (!container) return;
    var self = this;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var schedules = this._getSchedules();
    var maxSchedules = this._config.max_schedules || 6;
    if (schedules === null) {
      this._isLoading = true;
      var skel = '';
      for (var i = 0; i < 3; i++) {
        skel += '<div class="sched-skeleton">' +
                  '<div class="skel-dot"></div>' +
                  '<div class="skel-time"></div>' +
                  '<div class="skel-info"><div class="skel-line skel-line-1"></div><div class="skel-line skel-line-2"></div></div>' +
                  '<div class="skel-status"></div>' +
                '</div>';
      }
      container.innerHTML =
        '<div class="schedule-list">' + skel + '</div>' +
        '<div class="skel-hint">Waiting for Home Assistant…</div>';
      return;
    }
    this._isLoading = false;
    if (schedules.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#535865" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
          '<div class="empty-state-text"><strong>No feedings scheduled</strong><br>Add your first feeding time below.</div>' +
        '</div>' +
        '<div class="sched-actions">' +
          '<button class="add-btn" id="add-slot-btn" style="flex:1;">+ Add feeding</button>' +
        '</div>';
      container.querySelector('#add-slot-btn').addEventListener('click', function() {
        self._vibrate(10);
        self._schedules.push({ hour: 8, minute: 0, size: 3 });
        self._markPending();
        self._renderTab('schedule');
        setTimeout(function() { self._openEditPopup(0, true); }, 50);
      });
      return;
    }
    var indexed = schedules.map(function(s, i) { return { s: s, i: i }; });
    indexed.sort(function(a, b) {
      return (a.s.hour * 60 + a.s.minute) - (b.s.hour * 60 + b.s.minute);
    });
    var nextIdx = -1;
    var minDiff = Infinity;
    indexed.forEach(function(item, idx) {
      var sm = item.s.hour * 60 + item.s.minute;
      var diff = sm > nowMin ? sm - nowMin : sm + 1440 - nowMin;
      if (diff < minDiff) { minDiff = diff; nextIdx = idx; }
    });
    var html = '<div class="schedule-list" id="sched-list">';
    indexed.forEach(function(item, idx) {
      var s = item.s;
      var sm = s.hour * 60 + s.minute;
      var passed = sm <= nowMin;
      var isNext = idx === nextIdx;
      var statusClass = passed ? 'done' : isNext ? 'next-s' : 'pending';
      var statusText = passed ? self._lbl('label_status_passed','Passed') : isNext ? self._lbl('label_status_next','Next') : self._lbl('label_status_pending','Pending');
      var dotClass = passed ? 'passed' : isNext ? 'next-d' : '';
      var timeClass = passed ? 'passed' : '';
      var portionWeight = parseFloat(self._state(self._e('entity_portion_weight'), '5')) || 5;
      var grams = Math.round(s.size * portionWeight);
      html +=
        '<div class="sched-item" data-slot="' + idx + '" title="Tap to edit" tabindex="0" role="button" aria-label="Edit feeding ' + self._pad(s.hour) + ':' + self._pad(s.minute) + ', ' + s.size + ' portions, ' + statusText + '">' +
          '<div class="sched-dot ' + dotClass + '"></div>' +
          '<div class="sched-time ' + timeClass + '">' + self._pad(s.hour) + ':' + self._pad(s.minute) + '</div>' +
          '<div class="sched-info">' +
            '<div class="sched-portions">' + s.size + ' portions</div>' +
            '<div class="sched-grams">~' + grams + 'g</div>' +
          '</div>' +
          '<span class="sched-status ' + statusClass + '">' + statusText + '</span>' +
          '<span class="sched-edit-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>' +
          '<button class="sched-delete" data-del="' + idx + '" title="Remove" aria-label="Remove ' + self._pad(s.hour) + ':' + self._pad(s.minute) + ' feeding"><div class="sched-delete-inner"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></button>' +
        '</div>';
    });
    html += '</div>';
    var diverges = this._hasDivergence();
    html += '<div class="sched-actions">';
    if (schedules.length < maxSchedules) {
      html += '<button class="add-btn" id="add-slot-btn">+ Add</button>';
    }
    if (diverges) {
      html += '<button class="add-btn warn" id="sync-btn" title="Reload from feeder" aria-label="Reload schedule from feeder"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>';
    }
    html += '<button class="apply-btn' + (this._pending ? ' pulse' : '') + '" id="apply-btn">' + (this._pending ? 'Send changes' : 'Send to feeder') + '</button>';
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('.sched-item').forEach(function(el) {
      el.addEventListener('keydown', function(e) {
        if (e.target !== el) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
      el.addEventListener('click', function(e) {
        if (e.target.closest && e.target.closest('.sched-delete')) return;
        self._vibrate(10);
        var sortedIdx = parseInt(el.dataset.slot, 10);
        var item = indexed[sortedIdx];
        if (!item) return;
        self._openEditPopup(item.i);
      });
    });
    container.querySelectorAll('.sched-delete').forEach(function(btn) {
      var sortedIdx = parseInt(btn.dataset.del, 10);
      var item = indexed[sortedIdx];
      if (!item) return;
      var origIdx = item.i;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        self._vibrate(10);
        var removed = self._schedules[origIdx];
        if (!removed) return;
        self._schedules = self._schedules.filter(function(_, i) { return i !== origIdx; });
        self._undo = { schedule: removed, index: origIdx };
        self._markPending();
        self._renderTab('schedule');
        self._showSnackbar(
          'Feeding at ' + self._pad(removed.hour) + ':' + self._pad(removed.minute) + ' removed',
          'Undo',
          function() {
            if (!self._undo) return;
            var restoreIdx = Math.min(self._undo.index, self._schedules.length);
            self._schedules.splice(restoreIdx, 0, self._undo.schedule);
            self._undo = null;
            if (!self._hasDivergence()) { self._pending = false; self._lastSent = null; }
            self._renderHeader();
            self._renderTab('schedule');
          }
        );
      });
    });
    var addBtn = container.querySelector('#add-slot-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        self._vibrate(10);
        var last = self._schedules[self._schedules.length - 1];
        var newHour = last ? (last.hour + 2) % 24 : 8;
        self._schedules.push({ hour: newHour, minute: 0, size: 3 });
        self._markPending();
        self._renderTab('schedule');
        setTimeout(function() { self._openEditPopup(self._schedules.length - 1, true); }, 50);
      });
    }
    var syncBtn = container.querySelector('#sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', function() {
        self._vibrate(15);
        var actual = self._getActualSchedule();
        self._schedules = actual.map(function(a) {
          return { hour: a.hour, minute: a.minute, size: a.size };
        });
        self._pending = false;
        self._lastSent = null;
        self._undo = null;
        self._renderHeader();
        self._renderTab('schedule');
        self._showSnackbar('Synced from feeder');
      });
    }
    var applyBtn = container.querySelector('#apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', function() {
        if (applyBtn.disabled) return;
        if (!self._schedules || self._schedules.length === 0) return;
        applyBtn.disabled = true;
        applyBtn.style.opacity = '0.6';
        self._vibrate([10, 20, 10]);
        self._sendSchedule();
        self._renderHeader();
        self._showSent();
        setTimeout(function() {
          applyBtn.disabled = false;
          applyBtn.style.opacity = '';
        }, 1500);
      });
    }
  }
}
