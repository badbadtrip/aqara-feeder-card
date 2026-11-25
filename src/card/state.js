class MissingMqttTopicError extends Error {}

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
  _requireMqttTopic() {
    var topic = this._config.topic;
    if (typeof topic !== 'string' || !topic.trim()) {
      throw new MissingMqttTopicError('Укажите MQTT topic для команд в основных настройках карточки.');
    }
    return topic;
  }
  _showMqttError(error, message) {
    this._showSnackbar(error instanceof MissingMqttTopicError ? error.message : message);
  }
  _mqttPublish(payload) {
    var args = { topic: this._requireMqttTopic(), payload: JSON.stringify(payload) };
    if (this._config.mqtt_retain) args.retain = true;
    return this._hass.callService('mqtt', 'publish', args);
  }
  async _sendSchedule() {
    var schedules = this._schedules;
    if (!schedules || schedules.length === 0) return;
    var payload = {
      schedule: schedules.map(function(s) {
        return { days: 'everyday', hour: Math.round(s.hour), minute: Math.round(s.minute), size: Math.round(s.size) };
      })
    };
    var config = this._config;
    var signature = this._scheduleSignature(payload.schedule);
    await this._mqttPublish(payload);
    if (this._config === config && this._scheduleSignature(this._schedules) === signature) {
      this._lastSent = Date.now();
      this._pending = false;
    }
  }
  async _feedNow(size) {
    this._requireMqttTopic();
    var servingEntity = this._e('entity_serving_size');
    if (servingEntity && this._hass.states[servingEntity]) {
      await this._hass.callService('number', 'set_value', { entity_id: servingEntity, value: size });
    }
    await this._mqttPublish({ feed: 'START' });
    this._lastFeedSize = size;
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
