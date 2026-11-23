import { defaultConfig } from '../defaults.js';
import { findFeederDevices, feederDeviceLabel, feederMqttTopic, isConfidentFeeder, mapFeederEntities } from './device-discovery.js';

export class DeviceDiscovery {
  _loadDeviceRegistry() {
    if (!this._hass || this._deviceRegistryPromise || this._deviceRegistryLoaded) return;
    if (typeof this._hass.callWS !== 'function') {
      this._deviceRegistryLoaded = true;
      this._deviceRegistryError = new Error('Home Assistant WebSocket API is unavailable');
      this._deviceStatusMessage = 'Device discovery is unavailable. You can still select entities below.';
      this._populateDeviceSelects();
      return;
    }
    var self = this;
    var hass = this._hass;
    this._deviceRegistryPromise = Promise.resolve().then(function() {
      return Promise.all([
        hass.callWS({ type: 'config/device_registry/list' }),
        hass.callWS({ type: 'config/entity_registry/list' }),
      ]);
    }).then(function(results) {
      self._devices = results[0] || [];
      self._entities = results[1] || [];
      self._feederDevices = findFeederDevices(self._devices, self._entities);
      self._deviceRegistryLoaded = true;
      self._deviceRegistryError = null;
      self._populateDeviceSelects();
      self._maybeAutoSelectFeeder();
    }).catch(function(error) {
      self._deviceRegistryError = error;
      self._deviceRegistryLoaded = true;
      self._deviceStatusMessage = 'Could not read Home Assistant device registry. You can still select entities below.';
      self._populateDeviceSelects();
    });
  }
  _populateDeviceSelects() {
    var self = this;
    this._shadow.querySelectorAll('.device-select').forEach(function(select) {
      var selectedId = self._config.device_id || '';
      select.innerHTML = '';
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = !self._deviceRegistryLoaded
        ? 'Loading feeder devices…'
        : (self._deviceRegistryError ? 'Device list unavailable' : 'Choose a feeder');
      select.appendChild(placeholder);
      self._feederDevices.forEach(function(device) {
        var option = document.createElement('option');
        option.value = device.id;
        option.textContent = feederDeviceLabel(device);
        select.appendChild(option);
      });
      if (selectedId && !self._feederDevices.some(function(device) { return device.id === selectedId; })) {
        var missing = document.createElement('option');
        missing.value = selectedId;
        missing.textContent = 'Previously selected device (not found)';
        select.appendChild(missing);
      }
      select.value = selectedId;
      placeholder.textContent = self._deviceRegistryError
        ? 'Device list unavailable'
        : (!self._deviceRegistryLoaded ? 'Loading feeder devices…' :
          (self._feederDevices.length ? 'Choose a feeder' : 'No feeder devices found'));
    });
    this._shadow.querySelectorAll('.device-status').forEach(function(status) {
      status.textContent = self._deviceStatusMessage || (self._feederDevices.length
        ? 'Selecting a feeder fills in the matching entities and MQTT topic.'
        : (self._deviceRegistryLoaded ? 'No feeder found. Entity fields remain available below.' : ''));
    });
  }
  _isDefaultDeviceConfig() {
    var defaults = defaultConfig();
    var keys = ['topic', 'entity_schedule', 'entity_portion_weight', 'entity_serving_size', 'entity_feeding_source',
      'entity_feeding_size', 'entity_portions_day', 'entity_weight_day', 'entity_mode', 'entity_child_lock', 'entity_led', 'entity_error', 'entity_update'];
    return keys.every(function(key) {
      return this._config[key] === undefined || this._config[key] === '' || this._config[key] === defaults[key];
    }, this);
  }
  _maybeAutoSelectFeeder() {
    if (!this._hasConfig || this._config.device_id || this._feederDevices.length !== 1 || !this._isDefaultDeviceConfig()) return;
    var deviceId = this._feederDevices[0].id;
    if (isConfidentFeeder(deviceId, this._entities)) this._applyFeederDevice(deviceId);
  }
  _applyFeederDevice(deviceId) {
    var device = this._devices.find(function(item) { return item.id === deviceId; });
    if (!device) return;
    var mapped = mapFeederEntities(deviceId, this._entities);
    var roleKeys = ['entity_schedule', 'entity_portion_weight', 'entity_serving_size', 'entity_feeding_source',
      'entity_feeding_size', 'entity_portions_day', 'entity_weight_day', 'entity_mode', 'entity_child_lock', 'entity_led', 'entity_error', 'entity_update'];
    var next = Object.assign({}, this._config, { device_id: deviceId });
    roleKeys.forEach(function(key) { next[key] = mapped[key] || ''; });
    var topic = feederMqttTopic(device);
    if (topic) next.topic = topic;
    this._config = next;
    var count = roleKeys.filter(function(key) { return !!mapped[key]; }).length;
    this._deviceStatusMessage = count
      ? 'Found ' + count + ' feeder entities. Topic and entity IDs have been filled in.'
      : 'The device was selected, but no feeder entities were matched. You can set them below.';
    this._fire(next);
    this._render();
  }
  _selectFeederDevice(deviceId) {
    if (!deviceId) {
      var next = Object.assign({}, this._config);
      delete next.device_id;
      this._config = next;
      this._deviceStatusMessage = '';
      this._fire(next);
      return;
    }
    this._applyFeederDevice(deviceId);
  }
}
