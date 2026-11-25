import assert from 'node:assert/strict';
import test from 'node:test';

// Minimal DOM double for the nodes the editor creates directly.
class Element extends EventTarget {
  children = [];
  attributes = {};
  dataset = {};
  className = '';
  style = {};

  constructor(tag = '') {
    super();
    this.tag = tag;
  }
  attachShadow() { return new Element(); }
  set innerHTML(value) {
    this.html = value;
    this.children = [];
  }
  get innerHTML() { return this.html; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  appendChild(child) { this.children.push(child); }
  querySelectorAll(selector) {
    return this.children.flatMap(child => {
      const matches = selector.startsWith('.') ? child.className.split(' ').includes(selector.slice(1))
        : selector.startsWith('#') ? child.id === selector.slice(1)
        : child.tag === selector;
      return [...(matches ? [child] : []), ...child.querySelectorAll(selector)];
    });
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0]; }
}

globalThis.HTMLElement = Element;
globalThis.document = { createElement: tag => new Element(tag) };
globalThis.window = { confirm: () => assert.fail('Unexpected device replacement prompt') };
const { AqaraFeederCard } = await import('../src/card/card.js');
const { AqaraFeederCardEditor } = await import('../src/editor/editor.js');
const { mapFeederEntities } = await import('../src/editor/device-discovery.js');

const first = { id: 'a', name: 'Kitchen feeder', name_by_user: 'Кухня', model: 'C1' };
const second = { id: 'b', name: 'Hall feeder', model: 'C1' };

function rows(device) {
  const prefix = device.id;
  return [
    ['sensor', 'schedule', 'Schedule'],
    ['sensor', 'portions_per_day', 'Portions per day'],
    ['sensor', 'weight_per_day', 'Weight per day'],
    ['sensor', 'feeding_source', 'Feeding source'],
    ['sensor', 'feeding_size', 'Feeding size'],
    ['number', 'portion_weight', 'Portion weight'],
    ['number', 'serving_size', 'Serving size'],
    ['select', 'mode', 'Mode'],
    ['switch', 'child_lock', 'Child lock'],
    ['switch', 'led_indicator', 'LED indicator'],
    ['binary_sensor', 'error', 'Error'],
    ['update', 'device', 'Firmware update'],
  ].map(([domain, suffix, original_name]) => ({
    device_id: device.id,
    platform: 'mqtt',
    entity_id: `${domain}.${prefix}_${suffix}`,
    original_name,
  }));
}

async function setup(config, devices, entities, failure = false) {
  const editor = new AqaraFeederCardEditor();
  const configs = [];
  const requests = [];
  editor.addEventListener('config-changed', event => configs.push(event.detail.config));
  editor.setConfig(config);
  editor.hass = {
    states: Object.fromEntries(entities.map(row => [row.entity_id, { state: '0' }])),
    async callWS(request) {
      requests.push(request.type);
      if (failure) throw new Error('registry denied');
      return request.type === 'config/device_registry/list' ? devices : entities;
    },
  };
  await editor._deviceRegistryPromise;
  const status = () => editor._shadow.querySelector('.device-status').textContent;
  function select(id) {
    const select = editor._shadow.querySelector('.device-select');
    select.value = id;
    select.dispatchEvent(new Event('change'));
  }
  return { editor, configs, requests, status, select };
}

test('fresh config selects one confident feeder and uses the registry name for MQTT', async () => {
  const stub = AqaraFeederCard.getStubConfig();
  const { editor, configs, requests, status } = await setup(stub, [first], rows(first));
  assert.deepEqual(requests, ['config/device_registry/list', 'config/entity_registry/list']);
  assert.equal(configs.length, 1);
  assert.equal(configs[0].device_id, first.id);
  assert.equal(configs[0].topic, 'zigbee2mqtt/Kitchen feeder/set');
  assert.equal(configs[0].entity_schedule, 'sensor.a_schedule');
  assert.equal(configs[0].entity_update, 'update.a_device');
  assert.equal(configs[0].entity_food_level, '');
  assert.equal(editor._shadow.querySelector('.device-select').children[1].textContent, 'Кухня · C1');
  assert.match(status(), /12 из 12/);
  const scheduleStatus = editor._shadow.querySelectorAll('.field-status')
    .find(status => status.dataset.entityKey === 'entity_schedule');
  assert.equal(scheduleStatus.textContent, 'Доступно');
  editor.hass = { states: { 'sensor.a_schedule': { state: 'unavailable' } } };
  assert.equal(scheduleStatus.textContent, 'Недоступно');
});

test('legacy Kitchen config stays intact until the Hall selection is confirmed', async t => {
  const kitchen = { ...first, name: 'Kitchen' };
  const hall = { ...second, name: 'Hall' };
  const saved = { topic: 'zigbee2mqtt/Kitchen/set', title: 'Feeder', label_feed: 'Feed now', mqtt_retain: true };
  const hallRows = rows(hall).map(row => ({ ...row, entity_id: row.entity_id.replace('.b_', '.hall_') }));
  const { editor, configs, select } = await setup(saved, [kitchen, hall], [...rows(kitchen), ...hallRows]);
  const selectedId = () => editor._shadow.querySelector('.device-select').value;
  let accepted = false;
  const confirm = t.mock.method(window, 'confirm', message => {
    assert.match(message, /Hall.*MQTT topic и сущности/s);
    assert.deepEqual(editor._config, saved);
    assert.deepEqual(configs, []);
    assert.equal(selectedId(), '');
    return accepted;
  });

  select(hall.id);
  assert.equal(confirm.mock.callCount(), 1);
  assert.deepEqual(editor._config, saved);
  assert.deepEqual(configs, []);
  assert.equal(selectedId(), '');

  accepted = true;
  select(hall.id);
  assert.equal(confirm.mock.callCount(), 2);
  assert.equal(selectedId(), hall.id);
  assert.deepEqual(configs, [{
    ...saved,
    ...mapFeederEntities(hall.id, hallRows),
    device_id: hall.id,
    topic: 'zigbee2mqtt/Hall/set',
  }]);
  assert.equal(configs[0].entity_serving_size, 'number.hall_serving_size');
  assert.deepEqual(editor._config, configs[0]);
});

test('switching confirms replacement of manual fields and keeps them editable', async t => {
  const { editor, configs, select, status } = await setup(
    AqaraFeederCard.getStubConfig(), [first, second],
    [...rows(first), ...rows(second).filter(row => row.original_name !== 'Firmware update')]
  );
  assert.equal(configs.length, 0);
  select(first.id);
  assert.equal(configs.at(-1).topic, 'zigbee2mqtt/Kitchen feeder/set');

  const topic = editor._shadow.querySelector('#field-general-topic');
  topic.value = 'my-bridge/feeder/set';
  topic.dispatchEvent(new Event('change'));
  const schedule = editor._shadow.querySelectorAll('ha-entity-picker')
    .find(picker => picker.attributes.label === 'Расписание кормления');
  schedule.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'sensor.manual_schedule' } }));
  const manualConfig = configs.at(-1);
  const manualCount = configs.length;
  assert.match(status(), /могут относиться к разным устройствам/);

  select(first.id);
  assert.equal(configs.length, manualCount);
  assert.deepEqual(editor._config, manualConfig);

  const confirm = t.mock.method(window, 'confirm', () => false);
  select(second.id);
  assert.equal(confirm.mock.callCount(), 1);
  assert.equal(configs.length, manualCount);
  assert.deepEqual(editor._config, manualConfig);
  assert.equal(editor._shadow.querySelector('.device-select').value, first.id);
  assert.equal(configs.at(-1).topic, 'my-bridge/feeder/set');
  assert.equal(configs.at(-1).entity_schedule, 'sensor.manual_schedule');

  topic.value = 'zigbee2mqtt/Kitchen feeder/set';
  topic.dispatchEvent(new Event('change'));
  confirm.mock.mockImplementationOnce(() => true);
  select(second.id);
  assert.equal(confirm.mock.callCount(), 2);
  assert.equal(configs.length, manualCount + 2);
  assert.equal(configs.at(-1).device_id, second.id);
  assert.equal(configs.at(-1).topic, 'zigbee2mqtt/Hall feeder/set');
  assert.equal(configs.at(-1).entity_schedule, 'sensor.b_schedule');
  assert.equal(configs.at(-1).entity_serving_size, 'number.b_serving_size');
  assert.equal(configs.at(-1).entity_update, '');
  assert.match(status(), /11 из 12.*Сущности/);
  assert.doesNotMatch(status(), /могут относиться к разным устройствам/);

  select('');
  assert.equal(configs.at(-1).device_id, undefined);
  assert.equal(configs.at(-1).entity_serving_size, '');
  assert.equal(configs.at(-1).topic, '');
  assert.equal(configs.at(-1).entity_schedule, '');
  select(first.id);
  assert.equal(configs.at(-1).entity_serving_size, 'number.a_serving_size');
  assert.equal(configs.at(-1).entity_update, 'update.a_device');
  select(second.id);
  assert.equal(configs.at(-1).device_id, second.id);
  assert.equal(confirm.mock.callCount(), 2);

  const hallTopic = editor._shadow.querySelector('#field-general-topic');
  hallTopic.value = 'my-bridge/hall/set';
  hallTopic.dispatchEvent(new Event('change'));
  const customTopicConfig = configs.at(-1);
  select(first.id);
  assert.equal(confirm.mock.callCount(), 3);
  assert.equal(configs.at(-1), customTopicConfig);
  assert.equal(editor._shadow.querySelector('.device-select').value, second.id);
  select('');
  assert.equal(configs.at(-1).device_id, undefined);
  assert.equal(configs.at(-1).topic, 'my-bridge/hall/set');
  assert.equal(configs.at(-1).entity_serving_size, '');
});

test('first feeder selection confirms replacement of a manually cleared legacy topic', async t => {
  const { editor, configs, select } = await setup(
    { type: 'custom:aqara-feeder-card', topic: 'zigbee2mqtt/Kitchen feeder/set' },
    [first, second], [...rows(first), ...rows(second)]
  );
  const topic = editor._shadow.querySelector('#field-general-topic');
  topic.value = '';
  topic.dispatchEvent(new Event('change'));
  const clearedConfig = configs.at(-1);
  const eventCount = configs.length;
  const confirm = t.mock.method(window, 'confirm', () => false);

  select(second.id);
  assert.equal(confirm.mock.callCount(), 1);
  assert.equal(configs.length, eventCount);
  assert.equal(editor._config, clearedConfig);
  assert.equal(editor._shadow.querySelector('.device-select').value, '');

  confirm.mock.mockImplementation(() => true);
  select(second.id);
  assert.equal(confirm.mock.callCount(), 2);
  assert.equal(configs.length, eventCount + 1);
  assert.equal(configs.at(-1).topic, 'zigbee2mqtt/Hall feeder/set');
  assert.equal(configs.at(-1).entity_serving_size, 'number.b_serving_size');
});

test('switching feeders confirms replacement of a manually cleared MQTT topic', async t => {
  const hallRows = rows(second);
  const { editor, configs, select } = await setup(
    AqaraFeederCard.getStubConfig(), [first, second], [...rows(first), ...hallRows]
  );
  select(first.id);
  const topic = editor._shadow.querySelector('#field-general-topic');
  topic.value = '';
  topic.dispatchEvent(new Event('change'));
  const clearedConfig = configs.at(-1);
  const eventCount = configs.length;
  const selectedId = () => editor._shadow.querySelector('.device-select').value;
  let accepted = false;
  const confirm = t.mock.method(window, 'confirm', message => {
    assert.match(message, /Hall feeder.*MQTT topic/s);
    assert.equal(editor._config, clearedConfig);
    assert.equal(configs.length, eventCount);
    assert.equal(selectedId(), first.id);
    return accepted;
  });
  assert.equal(clearedConfig.topic, '');

  select(first.id);
  assert.equal(confirm.mock.callCount(), 0);
  assert.equal(configs.length, eventCount);

  select(second.id);
  assert.equal(confirm.mock.callCount(), 1);
  assert.equal(editor._config, clearedConfig);
  assert.equal(configs.length, eventCount);
  assert.equal(selectedId(), first.id);

  accepted = true;
  select(second.id);
  assert.equal(confirm.mock.callCount(), 2);
  assert.equal(selectedId(), second.id);
  assert.deepEqual(configs.slice(eventCount), [{
    ...clearedConfig,
    ...mapFeederEntities(second.id, hallRows),
    device_id: second.id,
    topic: 'zigbee2mqtt/Hall feeder/set',
  }]);
  assert.deepEqual(editor._config, configs.at(-1));
});

test('saved configs do not get rewritten by discovery', async () => {
  for (const saved of [
    { title: 'Feeder', label_feed: 'Feed now', mqtt_retain: true },
    { topic: 'zigbee2mqtt/Feeder/set', entity_schedule: 'sensor.feeder_schedule', entity_led: 'switch.custom_led' },
    { device_id: first.id, topic: 'my-bridge/kitchen/set', entity_schedule: 'sensor.custom_schedule' },
    { device_id: 'removed', entity_schedule: 'sensor.custom_schedule' },
  ]) {
    const { editor, configs } = await setup(saved, [first], rows(first));
    assert.deepEqual(configs, []);
    assert.deepEqual(editor._config, saved);
  }
});

test('weak match, empty list and registry failure have distinct guidance', async () => {
  const stub = AqaraFeederCard.getStubConfig();
  const partial = await setup(stub, [first], rows(first).slice(0, 1));
  assert.equal(partial.configs.length, 0);
  partial.select(first.id);
  assert.equal(partial.configs.at(-1).entity_serving_size, '');
  assert.match(partial.status(), /1 из 12.*Сущности/);

  const empty = await setup(stub, [], []);
  assert.match(empty.status(), /Кормушки не найдены.*вручную/);
  const failed = await setup(stub, [], [], true);
  assert.match(failed.status(), /Не удалось прочитать реестры.*вручную/);
  for (const { editor, configs } of [empty, failed]) {
    assert.equal(editor._shadow.querySelector('.device-select').disabled, true);
    const topic = editor._shadow.querySelector('#field-general-topic');
    assert.equal(topic.value, '');
    topic.value = 'manual/base/set';
    topic.dispatchEvent(new Event('change'));
    assert.equal(configs.at(-1).topic, 'manual/base/set');
  }
});

test('mapping ignores disabled, foreign and non-MQTT entities', () => {
  const source = rows(first)[0];
  assert.deepEqual(mapFeederEntities(first.id, [
    { ...source, device_id: second.id },
    { ...source, disabled_by: 'user' },
    { ...source, platform: 'template' },
    { ...source, entity_id: 'sensor.a_schedule_pretty' },
    { ...source, entity_id: 'sensor.a_schedule_pretty_2' },
    { ...source, entity_id: 'sensor.a_schedule_battery', original_name: 'Battery' },
    source,
  ]), { entity_schedule: 'sensor.a_schedule' });
  assert.deepEqual(mapFeederEntities(first.id, [
    { ...source, entity_id: 'sensor.a_schedule_2', original_name: 'Расписание' },
    { ...rows(first)[6], entity_id: 'number.a_serving_size_3', original_name: 'Размер выдачи' },
  ]), { entity_schedule: 'sensor.a_schedule_2', entity_serving_size: 'number.a_serving_size_3' });
});

test('the selected feeder uses its enabled MQTT update.feeder entity', async () => {
  const update = { device_id: second.id, platform: 'mqtt', entity_id: 'update.feeder', name: 'Feeder' };
  const excluded = [
    { ...update, entity_id: 'update.feeder_2', disabled_by: 'user' },
    { ...update, entity_id: 'update.feeder_3', device_id: first.id },
    { ...update, entity_id: 'update.feeder_4', platform: 'template' },
    { ...update, entity_id: 'sensor.feeder' },
  ];
  assert.deepEqual(mapFeederEntities(second.id, excluded), {});
  const { configs, select } = await setup(AqaraFeederCard.getStubConfig(), [first, second], [
    ...rows(first), ...rows(second).filter(row => !row.entity_id.startsWith('update.')), ...excluded, update,
  ]);
  select(second.id);
  assert.equal(configs.at(-1).entity_update, 'update.feeder');
});

test('localized defaults preserve saved labels, service arguments and MQTT payload', async () => {
  const card = new AqaraFeederCard();
  card.setConfig({ title: 'Feeder', label_feed: 'Feed now', mqtt_retain: true });
  assert.equal(card._config.title, 'Feeder');
  assert.equal(card._lbl('label_feed'), 'Feed now');
  assert.equal(card._lbl('label_settings'), 'Настройки');
  assert.equal(card._displayState('unavailable'), 'Недоступно');
  assert.equal(card._formatCountdown(90), '1 мин');
  assert.deepEqual(card._formatGrams(1500), { val: '1,5', unit: 'кг' });
  const calls = [];
  card._hass = {
    states: {
      'number.feeder_serving_size': { state: '2' },
      'sensor.feeder_schedule': { state: "[{'days':'everyday','hour':8,'minute':0,'size':3}]" },
    },
    async callService(...args) { calls.push(args); },
  };
  card._getSchedules();
  await card._feedNow(2);
  await card._sendSchedule();
  const expectedMqtt = payload => ['mqtt', 'publish', {
    topic: 'zigbee2mqtt/Feeder/set',
    retain: true,
    payload: JSON.stringify(payload),
  }];
  assert.deepEqual(calls, [
    ['number', 'set_value', { entity_id: 'number.feeder_serving_size', value: 2 }],
    expectedMqtt({ feed: 'START' }),
    expectedMqtt({ schedule: [{ days: 'everyday', hour: 8, minute: 0, size: 3 }] }),
  ]);
  assert.equal(card._lastFeedSize, 2);
  assert.ok(card._lastSent > 0);
  assert.equal(card._pending, false);
});

test('blank MQTT topic blocks feeding and schedule calls before any service runs', async () => {
  const card = new AqaraFeederCard();
  const calls = [];
  card._hass = {
    states: { 'number.feeder_serving_size': { state: '2' } },
    async callService(...args) { calls.push(args); },
  };
  card._schedules = [{ hour: 8, minute: 0, size: 3 }];
  card._pending = true;
  const messages = [];
  card._showSnackbar = message => messages.push(message);
  for (const topic of ['', '  ']) {
    card._config = { ...AqaraFeederCard.getStubConfig(), topic, entity_serving_size: 'number.feeder_serving_size' };
    for (const action of [() => card._feedNow(2), () => card._sendSchedule()]) {
      await assert.rejects(async () => action(), error => {
        card._showMqttError(error, 'Ошибка');
        return true;
      });
    }
  }
  assert.equal(messages.length, 4);
  messages.forEach(message => assert.match(message, /Укажите MQTT topic.*настройках/));
  assert.deepEqual(calls, []);
  assert.equal(card._lastFeedSize, null);
  assert.equal(card._lastSent, null);
  assert.equal(card._pending, true);
});

test('MQTT rejection leaves feeding and schedule success state untouched', async () => {
  const card = new AqaraFeederCard();
  card.setConfig({ topic: 'test/custom/set' });
  card._schedules = [{ hour: 8, minute: 0, size: 3 }];
  card._pending = true;
  const failure = new Error('publish denied');
  const calls = [];
  card._hass = {
    states: {},
    async callService(...args) {
      calls.push(args);
      if (args[0] === 'mqtt') throw failure;
    },
  };
  for (const states of [{}, { 'number.feeder_serving_size': { state: '2' } }]) {
    card._hass.states = states;
    await assert.rejects(card._feedNow(2), error => error === failure);
  }
  await assert.rejects(card._sendSchedule(), error => error === failure);
  assert.deepEqual(calls.map(([domain]) => domain), ['mqtt', 'number', 'mqtt', 'mqtt']);
  assert.equal(card._lastFeedSize, null);
  assert.equal(card._lastSent, null);
  assert.equal(card._pending, true);
});
