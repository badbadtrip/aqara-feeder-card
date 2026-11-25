import { FEEDER_CONFIG_KEYS, FEEDER_ENTITY_KEYS, findFeederDevices, feederDeviceLabel, feederMqttTopic, isConfidentFeeder, mapFeederEntities } from './device-discovery.js';

export class DeviceDiscovery {
  _loadDeviceRegistry() {
    if (!this._hass || this._deviceRegistryPromise || this._deviceRegistryLoaded) return;
    var hass = this._hass;
    this._deviceRegistryPromise = Promise.resolve().then(function() {
      return Promise.all([
        hass.callWS({ type: 'config/device_registry/list' }),
        hass.callWS({ type: 'config/entity_registry/list' }),
      ]);
    }).then(function(results) {
      if (!results.every(Array.isArray)) throw new Error('Некорректный ответ реестра Home Assistant');
      this._entities = results[1];
      this._feederDevices = findFeederDevices(results[0], this._entities);
    }.bind(this)).catch(function(error) {
      this._deviceRegistryError = error || new Error('Ошибка чтения реестра Home Assistant');
    }.bind(this)).then(function() {
      this._deviceRegistryLoaded = true;
      this._populateDeviceSelects();
      this._maybeAutoSelectFeeder();
    }.bind(this));
  }
  _deviceValues(deviceId) {
    var device = this._feederDevices.find(function(item) { return item.id === deviceId; });
    return device
      ? Object.assign({ topic: feederMqttTopic(device) }, mapFeederEntities(deviceId, this._entities))
      : {};
  }
  _populateDeviceSelects() {
    var selectedId = this._config.device_id || '';
    var options = this._feederDevices;
    var selected = options.some(function(device) { return device.id === selectedId; });
    var placeholder = 'Выберите кормушку';
    var status = 'Выберите устройство для автозаполнения MQTT topic и сущностей. Редактор попросит подтвердить замену несовпадающих ручных значений.';
    var manual = ' Укажите MQTT topic и сущности вручную в полях ниже.';
    if (!this._deviceRegistryLoaded) {
      placeholder = 'Поиск кормушек…';
      status = 'Читаем реестры устройств и сущностей Home Assistant.';
    } else if (this._deviceRegistryError) {
      placeholder = 'Список устройств недоступен';
      status = 'Не удалось прочитать реестры Home Assistant.' + manual;
    } else if (!options.length) {
      placeholder = 'Кормушки не найдены';
      status = 'Кормушки не найдены. Проверьте, появилось ли устройство в MQTT-интеграции Home Assistant.' + manual;
    } else if (selectedId && !selected) {
      status = 'Сохранённая кормушка отсутствует в списке. Выберите устройство или проверьте поля ниже.';
    } else if (selected) {
      var values = this._deviceValues(selectedId);
      var count = FEEDER_ENTITY_KEYS.filter(function(key) { return !!values[key]; }).length;
      status = 'Сопоставлено сущностей: ' + count + ' из ' + FEEDER_ENTITY_KEYS.length + '.';
      if (count < FEEDER_ENTITY_KEYS.length) status += ' Откройте разделы «Сущности» и укажите недостающие поля, если они есть у вашей кормушки.';
      status += this._config.topic
        ? ' Сверьте MQTT topic с настройками Zigbee2MQTT.'
        : ' Укажите MQTT topic для команд в поле ниже.';
      if (FEEDER_CONFIG_KEYS.some(function(key) {
        return this._config[key] && this._config[key] !== values[key];
      }, this)) {
        status += ' Сохранённые вручную значения и найденные поля могут относиться к разным устройствам. Перед сохранением проверьте, что MQTT topic и сущности относятся к выбранной кормушке.';
      }
    }

    this._shadow.querySelectorAll('.device-select').forEach(function(select) {
      select.innerHTML = '';
      function addOption(id, label) {
        var option = document.createElement('option');
        option.value = id;
        option.textContent = label;
        select.appendChild(option);
      }
      addOption('', placeholder);
      options.forEach(function(device) { addOption(device.id, feederDeviceLabel(device)); });
      if (selectedId && !selected) addOption(selectedId, 'Сохранённая кормушка');
      select.value = selectedId;
      select.disabled = !options.length && !selectedId;
    });
    this._shadow.querySelectorAll('.device-status').forEach(function(element) {
      element.textContent = status;
    });
  }
  _maybeAutoSelectFeeder() {
    if (!this._hasConfig || this._skipAutoSelect || this._config.device_id || this._feederDevices.length !== 1) return;
    if (!FEEDER_CONFIG_KEYS.every(function(key) { return this._config[key] === ''; }, this)) return;
    var device = this._feederDevices[0];
    if (feederMqttTopic(device) && isConfidentFeeder(device.id, this._entities)) this._selectFeederDevice(device.id);
  }
  _selectFeederDevice(deviceId) {
    var current = this._config;
    var previousId = current.device_id || '';
    if (deviceId === previousId) return;

    var previous = this._deviceValues(previousId);
    var values = this._deviceValues(deviceId);
    if (deviceId && FEEDER_CONFIG_KEYS.some(function(key) {
      var value = current[key];
      var hasOverride = value || (value === '' && (previous[key] || this._editedFeederFields.has(key)));
      return hasOverride && value !== previous[key] && value !== (values[key] || '');
    }, this)) {
      this._shadow.querySelectorAll('.device-select').forEach(function(select) {
        select.value = previousId;
      });
      var device = this._feederDevices.find(function(item) { return item.id === deviceId; });
      var message = 'Выбрать кормушку «' + feederDeviceLabel(device) + '» и заменить MQTT topic и сущности? ' +
        'Поля автоподбора без сопоставления будут очищены.';
      if (!window.confirm(message)) return;
    }

    var next = Object.assign({}, current);
    if (deviceId) {
      next.device_id = deviceId;
      FEEDER_CONFIG_KEYS.forEach(function(key) { next[key] = values[key] || ''; });
      this._editedFeederFields.clear();
    } else {
      delete next.device_id;
      FEEDER_CONFIG_KEYS.forEach(function(key) {
        if (previous[key] && current[key] === previous[key]) next[key] = '';
      });
    }
    this._skipAutoSelect = true;
    this._config = next;
    this._render();
    this._fire(next);
  }
}
