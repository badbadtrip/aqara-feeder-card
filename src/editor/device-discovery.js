const ENTITY_ROLES = [
  { key: 'entity_schedule', domain: 'sensor', terms: ['schedule'] },
  { key: 'entity_portion_weight', domain: 'number', terms: ['portionweight', 'weightperportion'] },
  { key: 'entity_serving_size', domain: 'number', terms: ['servingsize'] },
  { key: 'entity_feeding_source', domain: 'sensor', terms: ['feedingsource'] },
  { key: 'entity_feeding_size', domain: 'sensor', terms: ['feedingsize'] },
  { key: 'entity_portions_day', domain: 'sensor', terms: ['portionsperday', 'portionsday'] },
  { key: 'entity_weight_day', domain: 'sensor', terms: ['weightperday', 'weightday', 'gramsperday'] },
  { key: 'entity_mode', domain: 'select', terms: ['mode'] },
  { key: 'entity_child_lock', domain: 'switch', terms: ['childlock'] },
  { key: 'entity_led', domain: 'switch', terms: ['ledindicator', 'led'] },
  { key: 'entity_error', domain: 'binary_sensor', terms: ['error'] },
  { key: 'entity_update', domain: 'update', terms: ['firmware', 'update'] },
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function roleFor(entity) {
  var entityId = entity.entity_id || '';
  var domain = entityId.split('.')[0];
  var searchable = normalize([
    entityId,
    entity.original_name,
    entity.name,
  ].join(' '));
  if (searchable.includes('schedulepretty')) return undefined;

  return ENTITY_ROLES.find(function(role) {
    return role.domain === domain && role.terms.some(function(term) {
      return searchable.includes(term);
    });
  });
}

/** Map a device's entity registry rows to the feeder's known controls. */
export function mapFeederEntities(deviceId, entities) {
  var mapped = {};
  (entities || []).forEach(function(entity) {
    if (entity.device_id !== deviceId || entity.disabled_by || entity.platform !== 'mqtt') return;
    var role = roleFor(entity);
    if (role && !mapped[role.key]) mapped[role.key] = entity.entity_id;
  });
  return mapped;
}

/** Keep likely feeders in the chooser while allowing unknown Aqara/Z2M names. */
export function findFeederDevices(devices, entities) {
  return (devices || []).filter(function(device) {
    if (device.disabled_by) return false;
    var mapped = mapFeederEntities(device.id, entities);
    var name = normalize([device.name, device.name_by_user, device.model, device.manufacturer].join(' '));
    var hasSchedule = !!mapped.entity_schedule;
    var hasControl = !!(mapped.entity_serving_size || mapped.entity_mode || mapped.entity_feeding_source);
    return (hasSchedule && hasControl) || /feeder|petfeeder/.test(name);
  }).sort(function(a, b) { return feederDeviceLabel(a).localeCompare(feederDeviceLabel(b)); });
}

export function isConfidentFeeder(deviceId, entities) {
  var mapped = mapFeederEntities(deviceId, entities);
  return !!(mapped.entity_schedule && mapped.entity_serving_size &&
    (mapped.entity_feeding_source || mapped.entity_feeding_size));
}

export function feederDeviceLabel(device) {
  var name = device.name_by_user || device.name || device.model || 'Unnamed feeder';
  var details = [device.manufacturer, device.model].filter(Boolean).join(' ');
  return details && !name.toLowerCase().includes(details.toLowerCase())
    ? name + ' · ' + details
    : name;
}

/** Z2M publishes each device below zigbee2mqtt/<friendly_name>/set. */
export function feederMqttTopic(device) {
  var friendlyName = device && (device.name || device.name_by_user);
  return friendlyName ? 'zigbee2mqtt/' + friendlyName + '/set' : '';
}
