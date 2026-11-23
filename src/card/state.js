/** Schedule state: reading the feeder schedule, local edits, MQTT publishing, feeding. */
export class ScheduleState {
  _getActualSchedule() {
    var raw = this._state(this._e('entity_schedule'), '[]');
    try {
      var json = raw.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false');
      return JSON.parse(json);
    } catch(e) { return []; }
  }
  _getSchedules() {
    var raw = this._state(this._e('entity_schedule'), null);
    if (raw === null || raw === 'unavailable' || raw === 'unknown') {
      return null;
    }
    if (this._schedules.length === 0 && !this._lastSent && !this._pending) {
      var actual = this._getActualSchedule();
      if (actual.length > 0) {
        this._schedules = actual.map(function(a) {
          return { hour: a.hour, minute: a.minute, size: a.size };
        });
      }
    }
    if (this._lastSent) {
      var actualSig = this._scheduleSignature(this._getActualSchedule());
      var localSig = this._scheduleSignature(this._schedules);
      if (actualSig === localSig) {
        this._lastSent = null;
        this._pending = false;
      }
    }
    return this._schedules;
  }
  _hasDivergence() {
    var actual = this._getActualSchedule();
    return this._scheduleSignature(actual) !== this._scheduleSignature(this._schedules);
  }
  _mqttPublish(payload) {
    var args = { topic: this._config.topic, payload: JSON.stringify(payload) };
    if (this._config.mqtt_retain) args.retain = true;
    this._hass.callService('mqtt', 'publish', args);
  }
  _sendSchedule() {
    var schedules = this._schedules;
    if (!schedules || schedules.length === 0) return;
    var payload = {
      schedule: schedules.map(function(s) {
        return { days: 'everyday', hour: Math.round(s.hour), minute: Math.round(s.minute), size: Math.round(s.size) };
      })
    };
    this._lastSent = Date.now();
    this._pending = false;
    this._mqttPublish(payload);
  }
  _feedNow(size) {
    var self = this;
    var servingEntity = this._e('entity_serving_size');
    var chain;
    if (servingEntity && this._hass.states[servingEntity]) {
      chain = this._hass.callService('number', 'set_value', { entity_id: servingEntity, value: size }).then(function() {
        self._mqttPublish({ feed: 'START' });
      });
    } else {
      this._mqttPublish({ feed: 'START' });
      chain = Promise.resolve();
    }
    return chain.then(function() { self._lastFeedSize = size; });
  }
  _markPending() {
    this._pending = true;
    this._renderHeader();
  }
  _scheduleSignature(arr) {
    if (!arr) return '';
    return arr.slice().sort(function(a, b) {
      return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
    }).map(function(s) {
      return Math.round(s.hour) + ':' + Math.round(s.minute) + ':' + Math.round(s.size);
    }).join(',');
  }
  _computeNextFeeding() {
    var schedules = this._getSchedules();
    if (!schedules || schedules.length === 0) return null;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var nowSec = now.getSeconds();
    var minDiff = Infinity;
    var next = null;
    schedules.forEach(function(s) {
      var sm = s.hour * 60 + s.minute;
      var diff = sm > nowMin ? sm - nowMin : sm + 1440 - nowMin;
      if (diff < minDiff) { minDiff = diff; next = s; }
    });
    if (!next) return null;
    var totalSec = minDiff * 60 - nowSec;
    if (totalSec < 0) totalSec += 86400;
    return { schedule: next, seconds: totalSec };
  }
}
