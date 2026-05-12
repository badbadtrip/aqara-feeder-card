(function () {
  console.info(
    `%c AQARA-FEEDER-CARD %c v1.2.0 `,
    'color: white; background: #f5a623; font-weight: bold;',
    'color: #f5a623; background: white; font-weight: bold;'
  );
  if (customElements.get('aqara-feeder-card')) return;
  class AqaraFeederCardEditor extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._config = {};
      this._hass = null;
      this._open = { general: true, colors: false, labels: false, entities_schedule: false, entities_stats: false, entities_control: false, entities_device: false };
    }
    set hass(hass) {
      this._hass = hass;
      this._shadow.querySelectorAll('ha-entity-picker').forEach(function(p) { p.hass = hass; });
    }
    setConfig(config) {
      this._config = Object.assign({}, config);
      this._render();
    }
    _cssColorToHex(color) {
      if (!color) return '#000000';
      color = color.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
      if (/^#[0-9a-fA-F]{3}$/.test(color)) {
        var r = color[1]+color[1], g = color[2]+color[2], b = color[3]+color[3];
        return '#' + r + g + b;
      }
      var m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) {
        return '#' + [m[1],m[2],m[3]].map(function(v) {
          return ('0' + parseInt(v).toString(16)).slice(-2);
        }).join('');
      }
      return '#000000';
    }
    _fire(config) {
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: config }, bubbles: true, composed: true }));
    }
    _update(key, val) {
      var newCfg = Object.assign({}, this._config);
      if (val === '' || val === null || val === undefined) {
        delete newCfg[key];
      } else {
        newCfg[key] = val;
      }
      this._config = newCfg;
      this._fire(newCfg);
    }
    _sections() {
      return [
        {
          key: 'general',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
          title: 'General',
          fields: [
            { key: 'title',         label: 'Card title', type: 'text',   default: 'Feeder' },
            { key: 'icon',          label: 'Icon (emoji or image URL)', type: 'text', default: '🐱',
              note: { type: 'template', text: 'Emoji: just paste the character. Image: provide the full path <code>/config/www/images/your_icon.png</code>. For a 3D effect use a PNG with transparent background — the icon will "float" above the circle.' } },
            { key: 'topic',         label: 'MQTT topic (set)',    type: 'text',   default: 'zigbee2mqtt/Feeder/set' },
            { key: 'max_schedules', label: 'Max schedules',       type: 'number', default: 6 },
            { key: 'quick_feed_default', label: 'Favourite quick portion', type: 'number', default: 2,
              note: { type: 'template', text: 'Portion size highlighted as favourite in the Feed-now grid (gets accent background + star).' } },
            { key: 'vibration_enabled', label: 'Haptic feedback (vibration)', type: 'checkbox', default: true },
            { key: 'sound_enabled', label: 'Sound feedback (click)', type: 'checkbox', default: false,
              note: { type: 'template', text: 'Plays a short click sound on button press. Off by default; useful on iOS where vibration API is blocked.' } },
            { key: 'mqtt_retain',   label: 'MQTT retain flag',    type: 'checkbox', default: false,
              note: { type: 'template', text: 'Adds <code>retain: true</code> to MQTT publishes so broker keeps last schedule across restarts.' } },
          ]
        },
        {
          key: 'colors',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
          title: 'Colors',
          fields: [
            { key: 'color_accent',    label: 'Accent (tabs, buttons)',         type: 'color', default: 'rgb(255,218,120)' },
            { key: 'color_positive',  label: 'Positive (online, Feed now)',    type: 'color', default: 'rgb(206,245,149)' },
            { key: 'color_danger',    label: 'Danger (errors, delete)',        type: 'color', default: 'rgb(255,145,138)' },
            { key: 'color_warning',   label: 'Warning (orange)',               type: 'color', default: 'rgb(255,181,129)' },
            { key: 'color_card_bg',   label: 'Card background',               type: 'color', default: '#111318' },
            { key: 'color_block_bg',  label: 'Block background (primary)',     type: 'color', default: '#1c1f27' },
            { key: 'color_block_bg2', label: 'Block background (dark)',        type: 'color', default: '#262a35' },
          ]
        },
        {
          key: 'labels',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
          title: 'Labels',
          fields: [
            { key: 'label_schedule',    label: 'Tab "Schedule"',            type: 'text', default: 'Schedule' },
            { key: 'label_feed',        label: 'Tab "Feed now"',            type: 'text', default: 'Feed now' },
            { key: 'label_settings',    label: 'Tab "Settings"',            type: 'text', default: 'Settings' },
            { key: 'label_portions_today', label: 'Stat: Portions today',   type: 'text', default: 'Portions today' },
            { key: 'label_grams_today', label: 'Stat: Grams today',         type: 'text', default: 'Grams today' },
            { key: 'label_per_portion',    label: 'Stat: Per portion',               type: 'text', default: 'Per portion' },
            { key: 'label_status_passed',  label: 'Schedule status: Passed',          type: 'text', default: 'Passed' },
            { key: 'label_status_next',    label: 'Schedule status: Next',            type: 'text', default: 'Next' },
            { key: 'label_status_pending', label: 'Schedule status: Pending',         type: 'text', default: 'Pending' },
          ]
        },
        {
          key: 'entities_schedule',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
          title: 'Entities — Schedule',
          fields: [
            {
              key: 'entity_schedule',
              label: 'Feeding schedule',
              type: 'entity',
              default: 'sensor.feeder_schedule',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Find it: Settings → Devices → Zigbee2MQTT → your feeder.' }
            },
            {
              key: 'entity_schedule_pretty',
              label: 'Schedule (human-readable)',
              type: 'entity',
              default: 'sensor.feeder_schedule_pretty',
              note: { type: 'template', text: 'Must be added to <code>configuration.yaml</code> (or <code>template.yaml</code>). Formats the schedule into a readable string for the card header. Example in the repo: <code>template.yaml</code>, sensor <code>feeder_schedule_pretty</code>.' }
            },
          ]
        },
        {
          key: 'entities_stats',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
          title: 'Entities — Statistics',
          fields: [
            {
              key: 'entity_portions_day',
              label: 'Portions today',
              type: 'entity',
              default: 'sensor.feeder_portions_per_day',
              note: { type: 'template', text: 'Must be added to <code>configuration.yaml</code> (or <code>template.yaml</code>). Counts feedings today based on history. Example in the repo: <code>configuration.yaml</code>.' }
            },
            {
              key: 'entity_weight_day',
              label: 'Grams today',
              type: 'entity',
              default: 'sensor.feeder_weight_per_day',
              note: { type: 'template', text: 'Must be added to <code>configuration.yaml</code> (or <code>template.yaml</code>). Sums total food weight for today. Example in the repo: <code>configuration.yaml</code>.' }
            },
            {
              key: 'entity_feeding_source',
              label: 'Last feeding source',
              type: 'entity',
              default: 'sensor.feeder_feeding_source',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Values: <code>schedule</code>, <code>manual</code>, <code>remote</code>.' }
            },
            {
              key: 'entity_feeding_size',
              label: 'Last portion size',
              type: 'entity',
              default: 'sensor.feeder_feeding_size',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT.' }
            },
          ]
        },
        {
          key: 'entities_control',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
          title: 'Entities — Control',
          fields: [
            {
              key: 'entity_portion_weight',
              label: 'Portion weight (g)',
              type: 'entity',
              default: 'number.feeder_portion_weight',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Used to calculate grams in the card.' }
            },
            {
              key: 'entity_serving_size',
              label: 'Serving size for manual feeding',
              type: 'entity',
              default: 'number.feeder_serving_size',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Set before sending the <code>feed: START</code> command.' }
            },
            {
              key: 'entity_mode',
              label: 'Feeder operating mode',
              type: 'entity',
              default: 'select.feeder_mode',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Values: <code>schedule</code> (auto) / <code>manual</code>.' }
            },
          ]
        },
        {
          key: 'entities_device',
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
          title: 'Entities — Device',
          fields: [
            {
              key: 'entity_child_lock',
              label: 'Child lock',
              type: 'entity',
              default: 'switch.feeder_child_lock',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT.' }
            },
            {
              key: 'entity_led',
              label: 'LED indicator',
              type: 'entity',
              default: 'switch.feeder_led_indicator',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT.' }
            },
            {
              key: 'entity_error',
              label: 'Feeder error',
              type: 'entity',
              default: 'binary_sensor.feeder_error',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Shows an error badge in the card header.' }
            },
            {
              key: 'entity_update',
              label: 'Firmware update',
              type: 'entity',
              default: 'update.feeder',
              note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT. Displays the firmware version in settings.' }
            },
            {
              key: 'entity_food_level',
              label: 'Food level (optional)',
              type: 'entity',
              default: '',
              note: { type: 'template', text: 'Optional. Numeric sensor 0–100 (percent) shown as a progress bar in the header. Leave empty to hide.' }
            },
          ]
        },
      ];
    }
    _render() {
      var self = this;
      var cfg = this._config;
      var css =
        ':host{display:block;font-family:var(--primary-font-family,Roboto,sans-serif);}' +
        '*{box-sizing:border-box;}' +
        '.section{margin-bottom:8px;border:1px solid var(--divider-color,rgba(255,255,255,.12));border-radius:12px;overflow:hidden;}' +
        '.section-header{display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;' +
          'background:var(--secondary-background-color,rgba(255,255,255,.04));user-select:none;}' +
        '.section-header:hover{background:var(--primary-color-transparent,rgba(255,255,255,.08));}' +
        '.section-icon{flex-shrink:0;display:flex;align-items:center;color:var(--secondary-text-color,#888);}' +
        '.section-title{flex:1;font-size:13px;font-weight:600;color:var(--primary-text-color,#fff);}' +
        '.section-arrow{font-size:12px;color:var(--secondary-text-color,#888);transition:transform .2s;}' +
        '.section-arrow.open{transform:rotate(180deg);}' +
        '.section-body{padding:12px 16px 16px;display:none;flex-direction:column;gap:10px;}' +
        '.section-body.open{display:flex;}' +
        '.field-label{font-size:12px;color:var(--secondary-text-color,#888);margin-bottom:4px;}' +
        'ha-entity-picker{display:block;}' +
        'input[type=text],input[type=number]{width:100%;padding:8px 10px;' +
          'background:var(--input-fill-color,rgba(255,255,255,.08));' +
          'border:1px solid var(--input-ink-color,rgba(255,255,255,.12));' +
          'border-radius:8px;color:var(--primary-text-color,#fff);font-size:13px;outline:none;}' +
        'input:focus{border-color:var(--primary-color,#f5c842);}' +
        '.note{display:flex;align-items:flex-start;gap:7px;margin-top:5px;padding:7px 10px;border-radius:8px;font-size:11px;line-height:1.5;}' +
        '.note.z2m{background:rgba(99,214,140,.08);border-left:3px solid rgba(99,214,140,.5);color:rgba(99,214,140,.9);}' +
        '.note.template{background:rgba(255,193,64,.08);border-left:3px solid rgba(255,193,64,.5);color:rgba(255,193,64,.9);}' +
        '.note-icon{flex-shrink:0;margin-top:1px;display:flex;align-items:center;}' +
        '.note code{background:rgba(255,255,255,.12);border-radius:3px;padding:1px 4px;font-family:monospace;font-size:10px;}' +
        '.color-row{display:flex;align-items:center;gap:8px;}' +
        '.color-swatch{width:36px;height:36px;border-radius:8px;border:1px solid var(--input-ink-color,rgba(255,255,255,.12));cursor:pointer;flex-shrink:0;padding:2px;background:transparent;}' +
        '.color-text{flex:1;padding:8px 10px;background:var(--input-fill-color,rgba(255,255,255,.08));border:1px solid var(--input-ink-color,rgba(255,255,255,.12));border-radius:8px;color:var(--primary-text-color,#fff);font-size:12px;font-family:monospace;outline:none;}' +
        '.color-text:focus{border-color:var(--primary-color,#f5c842);}' +
        '.color-reset{width:28px;height:28px;border-radius:6px;border:none;background:rgba(255,255,255,.06);color:#888;font-size:12px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
        '.color-reset:hover{background:rgba(255,255,255,.12);color:#fff;}';
      var helpCss =
        '.help-block{background:var(--secondary-background-color,rgba(255,255,255,.04));' +
          'border:1px solid var(--divider-color,rgba(255,255,255,.12));border-radius:12px;' +
          'padding:14px 16px;margin-bottom:8px;}' +
        '.help-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;' +
          'color:var(--primary-text-color,#fff);margin-bottom:10px;}' +
        '.help-title-icon{display:flex;align-items:center;color:var(--secondary-text-color,#888);}' +
        '.help-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;' +
          'border-bottom:1px solid var(--divider-color,rgba(255,255,255,.07));}' +
        '.help-row:last-child{border-bottom:none;padding-bottom:0;}' +
        '.help-row-icon{flex-shrink:0;width:24px;display:flex;align-items:center;justify-content:center;margin-top:1px;color:var(--secondary-text-color,#888);}' +
        '.help-row-body{}' +
        '.help-row-label{font-size:12px;font-weight:600;color:var(--primary-text-color,#fff);margin-bottom:2px;}' +
        '.help-row-desc{font-size:11px;color:var(--secondary-text-color,#888);line-height:1.5;}' +
        'code{font-family:monospace;background:rgba(255,255,255,.1);border-radius:4px;padding:1px 5px;font-size:11px;}';
      this._shadow.innerHTML = '<style>' + css + helpCss + '</style>';
      var helpEl = document.createElement('div');
      helpEl.className = 'help-block';
      helpEl.innerHTML =
        '<div class="help-title"><span class="help-title-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>How to configure the card</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg></div>' +
          '<div class="help-row-body">' +
            '<div class="help-row-label">MQTT topic (set)</div>' +
            '<div class="help-row-desc">' +
              'Open Zigbee2MQTT → Devices → find your feeder.<br>' +
              'The device friendly name is used in the topic:<br>' +
              '<code>zigbee2mqtt/&lt;friendly_name&gt;/set</code><br>' +
              'Example: if the name is <code>Feeder</code>, the topic is<br>' +
              '<code>zigbee2mqtt/Feeder/set</code>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>' +
          '<div class="help-row-body">' +
            '<div class="help-row-label">Device entity IDs</div>' +
            '<div class="help-row-desc">' +
              'Entity IDs are created automatically by Zigbee2MQTT when the device is added.<br>' +
              'Find them: Settings → Devices & Services → Zigbee2MQTT → your feeder.' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(99,214,140,.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 7V2"/><path d="M15 7V2"/><rect x="6" y="7" width="12" height="8" rx="1"/><path d="M9 22v-5h6v5"/></svg></div>' +
          '<div class="help-row-body">' +
            '<div class="help-row-label" style="color:rgba(99,214,140,.9);">Green note — entity already exists</div>' +
            '<div class="help-row-desc">' +
              'Created automatically by Zigbee2MQTT. Nothing to add.' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,193,64,.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>' +
          '<div class="help-row-body">' +
            '<div class="help-row-label" style="color:rgba(255,193,64,.9);">Yellow note — must be added manually</div>' +
            '<div class="help-row-desc">' +
              'A template sensor. By default it goes into <code>configuration.yaml</code> under the <code>template:</code> key.<br>' +
              'You can move it to a separate <code>template.yaml</code> via <code>template: !include template.yaml</code>.<br>' +
              'Copy-paste examples are in the repo: <code>configuration.yaml</code> and <code>template.yaml</code>.' +
            '</div>' +
          '</div>' +
        '</div>';
      this._shadow.appendChild(helpEl);
      this._sections().forEach(function(section) {
        var isOpen = !!self._open[section.key];
        var sectionEl = document.createElement('div');
        sectionEl.className = 'section';
        var header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML =
          '<span class="section-icon">' + section.icon + '</span>' +
          '<span class="section-title">' + section.title + '</span>' +
          '<span class="section-arrow' + (isOpen ? ' open' : '') + '">▼</span>';
        var body = document.createElement('div');
        body.className = 'section-body' + (isOpen ? ' open' : '');
        header.addEventListener('click', function() {
          self._open[section.key] = !self._open[section.key];
          var arrow = header.querySelector('.section-arrow');
          if (self._open[section.key]) {
            body.classList.add('open');
            arrow.classList.add('open');
          } else {
            body.classList.remove('open');
            arrow.classList.remove('open');
          }
        });
        section.fields.forEach(function(f) {
          var wrapper = document.createElement('div');
          var lbl = document.createElement('div');
          lbl.className = 'field-label';
          lbl.textContent = f.label;
          wrapper.appendChild(lbl);
          var val = cfg[f.key] !== undefined ? cfg[f.key] : f.default;
          if (f.type === 'color') {
            var colorRow = document.createElement('div');
            colorRow.className = 'color-row';
            var swatch = document.createElement('input');
            swatch.type = 'color';
            swatch.className = 'color-swatch';
            swatch.value = self._cssColorToHex(val || f.default);
            swatch.title = 'Pick color';
            var textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'color-text';
            textInput.value = val || f.default;
            textInput.placeholder = f.default;
            textInput.spellcheck = false;
            var resetBtn = document.createElement('button');
            resetBtn.className = 'color-reset';
            resetBtn.title = 'Reset to default';
            resetBtn.textContent = '↺';
            (function(fKey, fDefault, sw, txt) {
              sw.addEventListener('input', function() {
                txt.value = sw.value;
                self._update(fKey, sw.value);
              });
              txt.addEventListener('change', function() {
                var v = txt.value.trim();
                if (v) {
                  sw.value = self._cssColorToHex(v);
                  self._update(fKey, v);
                }
              });
              resetBtn.addEventListener('click', function() {
                txt.value = fDefault;
                sw.value = self._cssColorToHex(fDefault);
                self._update(fKey, fDefault);
              });
            })(f.key, f.default, swatch, textInput);
            colorRow.appendChild(swatch);
            colorRow.appendChild(textInput);
            colorRow.appendChild(resetBtn);
            wrapper.appendChild(colorRow);
          } else if (f.type === 'entity') {
            var picker = document.createElement('ha-entity-picker');
            picker.setAttribute('label', f.label);
            picker.setAttribute('allow-custom-entity', '');
            picker.value = val || '';
            if (self._hass) picker.hass = self._hass;
            picker.addEventListener('value-changed', function(e) {
              self._update(f.key, e.detail.value);
            });
            wrapper.appendChild(picker);
          } else if (f.type === 'checkbox') {
            var checkboxWrapper = document.createElement('div');
            checkboxWrapper.style.cssText = 'display:flex;align-items:center;gap:10px;';
            var chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = val === true || val === 'true';
            chk.style.cssText = 'width:18px;height:18px;cursor:pointer;';
            chk.addEventListener('change', function() {
              self._update(f.key, chk.checked);
            });
            var chkLabel = document.createElement('span');
            chkLabel.textContent = 'Enabled';
            chkLabel.style.cssText = 'font-size:12px;color:var(--primary-text-color,#fff);';
            checkboxWrapper.appendChild(chk);
            checkboxWrapper.appendChild(chkLabel);
            wrapper.appendChild(checkboxWrapper);
          } else {
            var inp = document.createElement('input');
            inp.type = f.type === 'number' ? 'number' : 'text';
            inp.value = val !== undefined ? val : '';
            inp.placeholder = String(f.default);
            inp.addEventListener('change', function() {
              var v = inp.type === 'number' ? parseInt(inp.value, 10) : inp.value.trim();
              self._update(f.key, v);
            });
            wrapper.appendChild(inp);
          }
          if (f.note) {
            var noteEl = document.createElement('div');
            noteEl.className = 'note ' + f.note.type;
            var icon = f.note.type === 'z2m'
              ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 7V2"/><path d="M15 7V2"/><rect x="6" y="7" width="12" height="8" rx="1"/><path d="M9 22v-5h6v5"/></svg>'
              : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
            noteEl.innerHTML = '<span class="note-icon">' + icon + '</span><span>' + f.note.text + '</span>';
            wrapper.appendChild(noteEl);
          }
          body.appendChild(wrapper);
        });
        sectionEl.appendChild(header);
        sectionEl.appendChild(body);
        self._shadow.appendChild(sectionEl);
      });
    }
  }
  customElements.define('aqara-feeder-card-editor', AqaraFeederCardEditor);
  class AqaraFeederCard extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._hass = null;
      this._config = {};
      this._built = false;
      this._activeTab = 'schedule';
      this._timer = null;
      this._schedules = [];
      this._isLoading = false;
      this._lastSent = null;
      this._pending = false;
      this._undo = null;
      this._undoTimer = null;
      this._countdownTimer = null;
      this._lastFeedSize = null;
      this._customSize = null;
    }
    disconnectedCallback() {
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      if (this._undoTimer) { clearTimeout(this._undoTimer); this._undoTimer = null; }
      if (this._countdownTimer) { clearInterval(this._countdownTimer); this._countdownTimer = null; }
    }
    static getConfigElement() {
      return document.createElement('aqara-feeder-card-editor');
    }
    static getStubConfig() {
      return {
        title: 'Feeder',
        icon: '🐱',
        topic: 'zigbee2mqtt/Feeder/set',
        max_schedules: 6,
        quick_feed_sizes: [1, 2, 3, 4],
        quick_feed_default: 2,
        vibration_enabled: true,
        sound_enabled: false,
        mqtt_retain: false,
        label_schedule:       'Schedule',
        label_feed:           'Feed now',
        label_settings:       'Settings',
        label_portions_today:  'Portions today',
        label_grams_today:     'Grams today',
        label_per_portion:     'Per portion',
        label_status_passed:   'Passed',
        label_status_next:     'Next',
        label_status_pending:  'Pending',
        color_accent:     'rgb(255,218,120)',
        color_positive:   'rgb(206,245,149)',
        color_danger:     'rgb(255,145,138)',
        color_warning:    'rgb(255,181,129)',
        color_card_bg:    '#111318',
        color_block_bg:   '#1c1f27',
        color_block_bg2:  '#262a35',
        entity_schedule:         'sensor.feeder_schedule',
        entity_schedule_pretty:  'sensor.feeder_schedule_pretty',
        entity_portions_day:     'sensor.feeder_portions_per_day',
        entity_weight_day:       'sensor.feeder_weight_per_day',
        entity_portion_weight:   'number.feeder_portion_weight',
        entity_serving_size:     'number.feeder_serving_size',
        entity_feeding_source:   'sensor.feeder_feeding_source',
        entity_feeding_size:     'sensor.feeder_feeding_size',
        entity_mode:             'select.feeder_mode',
        entity_child_lock:       'switch.feeder_child_lock',
        entity_led:              'switch.feeder_led_indicator',
        entity_error:            'binary_sensor.feeder_error',
        entity_update:           'update.feeder',
        entity_food_level:       '',
      };
    }
    setConfig(config) {
      var defaults = AqaraFeederCard.getStubConfig();
      this._config = Object.assign({}, defaults, config);
      this._built = false;
      if (this._hass) this._render();
    }
    set hass(hass) {
      this._hass = hass;
      if (!this._built) { this._render(); return; }
      if (this._timer) return;
      this._timer = setTimeout(function() { this._timer = null; this._updateDynamic(); }.bind(this), 300);
    }
    getCardSize() { return 5; }
    _e(key) { return this._config[key] || ''; }
    _lbl(key, fallback) {
      var v = this._config[key];
      return (v !== undefined && v !== '') ? v : fallback;
    }
    _state(id, fallback) {
      fallback = fallback !== undefined ? fallback : 'unavailable';
      return this._hass && id && this._hass.states[id] ? this._hass.states[id].state : fallback;
    }
    _num(id, fallback) {
      fallback = fallback !== undefined ? fallback : 0;
      var v = parseFloat(this._state(id, String(fallback)));
      return isNaN(v) ? fallback : v;
    }
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
    _pad(n) { return String(Math.round(n)).padStart(2, '0'); }
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
      var servingEntity = this._e('entity_serving_size');
      if (servingEntity && this._hass.states[servingEntity]) {
        this._hass.callService('number', 'set_value', { entity_id: servingEntity, value: size });
      }
      this._mqttPublish({ feed: 'START' });
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
      var schedules = this._schedules;
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
    _formatCountdown(sec) {
      if (sec == null || sec < 0) return '';
      var h = Math.floor(sec / 3600);
      var m = Math.floor((sec % 3600) / 60);
      if (h > 0) return h + 'h ' + m + 'm';
      if (m > 0) return m + 'm';
      return '<1m';
    }
    _formatGrams(g) {
      if (g === '-' || g === undefined || g === null) return { val: '-', unit: 'g' };
      var n = parseFloat(g);
      if (isNaN(n)) return { val: g, unit: 'g' };
      if (n >= 1000) return { val: (n / 1000).toFixed(1), unit: 'kg' };
      return { val: String(Math.round(n)), unit: 'g' };
    }
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
      var G = 'rgb(206,245,149)';
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
      var G = 'rgb(206,245,149)';
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
    _showConfirmation(size, onConfirm, onCancel) {
      var self = this;
      var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;
      var grams = Math.round(size * portionWeight);
      var existing = this._shadow.querySelector('.popup-overlay');
      if (existing) existing.remove();
      var confirmed = false;
      var overlay = document.createElement('div');
      overlay.className = 'popup-overlay';
      overlay.setAttribute('tabindex', '-1');
      var dismiss = function() {
        if (overlay.parentNode) overlay.remove();
        document.removeEventListener('keydown', onKey, true);
        if (!confirmed && typeof onCancel === 'function') onCancel();
      };
      var confirmAction = function() {
        if (confirmed) return;
        confirmed = true;
        if (overlay.parentNode) overlay.remove();
        document.removeEventListener('keydown', onKey, true);
        onConfirm();
      };
      var onKey = function(e) {
        if (e.key === 'Escape') { e.preventDefault(); dismiss(); }
        else if (e.key === 'Enter') { e.preventDefault(); confirmAction(); }
      };
      document.addEventListener('keydown', onKey, true);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });
      var popup = document.createElement('div');
      popup.className = 'popup';
      popup.innerHTML =
        '<div class="popup-title">Confirm feeding</div>' +
        '<button class="popup-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '<div style="text-align:center;font-size:13px;color:#969aa6;margin-bottom:20px;">' +
          'Will dispense <strong style="color:#fff;">' + size + ' por.</strong> (~' + grams + 'g)' +
        '</div>' +
        '<div class="popup-actions">' +
          '<button class="popup-cancel" id="cancel-feed-btn">Cancel</button>' +
          '<button class="popup-save" id="confirm-feed-btn" style="background:rgb(206,245,149);color:#000;">Feed</button>' +
        '</div>';
      overlay.appendChild(popup);
      this._shadow.querySelector('.card').appendChild(overlay);
      popup.querySelector('.popup-close').addEventListener('click', dismiss);
      popup.querySelector('#cancel-feed-btn').addEventListener('click', dismiss);
      popup.querySelector('#confirm-feed-btn').addEventListener('click', confirmAction);
      var confirmBtn = popup.querySelector('#confirm-feed-btn');
      if (confirmBtn && confirmBtn.focus) confirmBtn.focus();
    }
    _vibrate(pattern) {
      if (this._config.vibration_enabled !== false && navigator.vibrate) {
        navigator.vibrate(pattern || 10);
      }
      if (this._config.sound_enabled === true) {
        this._clickFeedback();
      }
    }
    _render() {
      this._built = true;
      this._isLoading = false;
      var cfg = this._config;
      var Y = cfg.color_accent    || 'rgb(255,218,120)';
      var G = cfg.color_positive  || 'rgb(206,245,149)';
      var R = cfg.color_danger    || 'rgb(255,145,138)';
      var O = cfg.color_warning   || 'rgb(255,181,129)';
      var BG  = cfg.color_card_bg   || '#111318';
      var BG1 = cfg.color_block_bg  || '#1c1f27';
      var BG2 = cfg.color_block_bg2 || '#262a35';
      var css =
        ':host{display:block;font-family:var(--primary-font-family,Roboto,sans-serif);}' +
        '*{box-sizing:border-box;}' +
        '.card{background:' + BG + ';border-radius:24px;overflow:hidden;color:#fff;position:relative;max-width:480px;}' +
        '.hdr{padding:20px 20px 16px;display:flex;align-items:center;gap:12px;}' +
        '.hdr-icon{width:44px;height:44px;background:linear-gradient(145deg,#2a2e3a,#1a1d26);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden;box-shadow:0 0 0 1.5px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.15),0 6px 16px rgba(0,0,0,.7),0 3px 6px rgba(0,0,0,.5);position:relative;}' +
        '.hdr-icon::before{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.08) 0%,transparent 50%);pointer-events:none;}' +
        '.hdr-icon img{width:75%;height:75%;object-fit:contain;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6));transform:translateZ(10px);}' +
        '.hdr-info{flex:1;min-width:0;}' +
        '.hdr-title{font-size:15px;font-weight:600;color:#fff;}' +
        '.hdr-sub{font-size:11px;color:#636774;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
        '.hdr-badges{display:flex;gap:4px;align-items:center;flex-shrink:0;}' +
        '.online-dot{width:10px;height:10px;border-radius:50%;background:rgb(206,245,149);box-shadow:0 0 0 0 rgba(206,245,149,.5);animation:pulse 2s infinite;}' +
        '.offline-dot{width:10px;height:10px;border-radius:50%;background:#535865;}' +
        '@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(206,245,149,.5)}70%{box-shadow:0 0 0 6px rgba(206,245,149,0)}100%{box-shadow:0 0 0 0 rgba(206,245,149,0)}}' +
        '.badge{padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;}' +
        '.badge-mode{background:' + BG1 + ';color:#969aa6;}' +
        '.badge-error{background:rgba(255,145,138,.2);color:' + R + ';}' +
        '.badge-ok{background:rgba(206,245,149,.15);color:' + G + ';}' +
        '.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 20px 16px;}' +
        '.stat{background:' + BG1 + ';border-radius:16px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;justify-content:space-between;}' +
        '.stat-val{font-size:20px;font-weight:500;color:#fff;line-height:1;}' +
        '.stat-val span{font-size:10px;opacity:.5;}' +
        '.stat-lbl{font-size:11px;color:#636774;text-transform:uppercase;letter-spacing:.4px;text-align:center;}' +
        '.stat-val.empty{opacity:.35;}' +
        '.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 20px 14px;}' +
        '.tab-btn{padding:10px 4px 8px;border:1px solid ' + BG2 + ';border-radius:12px;background:' + BG1 + ';color:#636774;font-size:11px;font-weight:500;cursor:pointer;transition:background .2s,border-color .2s,color .2s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:5px;}' +
        '.tab-btn.active{background:' + Y + ';color:#000;border-color:' + Y + ';box-shadow:0 4px 12px rgba(255,218,120,.3),0 2px 4px rgba(0,0,0,.4);}' +
        '.tab-btn:not(.active):hover{background:' + BG2 + ';border-color:' + BG2 + ';}' +
        '.tab-icon{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1.5px rgba(255,255,255,.12),0 2px 4px rgba(0,0,0,.5);filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));}' +
        '.tab-icon svg{width:14px;height:14px;fill:none;stroke:#969aa6;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
        '.tab-btn.active .tab-icon{background:rgba(0,0,0,.20);box-shadow:0 0 0 1.5px rgba(0,0,0,.15),0 2px 4px rgba(0,0,0,.3);}' +
        '.tab-btn.active .tab-icon svg{stroke:#000;}' +
        '.tab-label{font-size:11px;font-weight:500;line-height:1;}' +
        '.content{padding:0 20px 20px;}' +
        '.tab-pane{animation:fadeIn .2s ease;}' +
        '@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}' +
        '.schedule-list{display:flex;flex-direction:column;gap:8px;}' +
        '.sched-item{display:flex;align-items:center;gap:12px;background:' + BG1 + ';border-radius:16px;padding:12px 14px;cursor:pointer;transition:background .15s;}' +
        '.sched-item:hover{background:' + BG2 + ';}' +
        '.sched-item:hover .sched-edit-hint{opacity:1;}' +
        '.sched-edit-hint{font-size:11px;color:#636774;opacity:0;transition:opacity .15s;flex-shrink:0;}' +
        '.sched-dot{width:10px;height:10px;border-radius:50%;background:' + BG2 + ';flex-shrink:0;transition:background .3s;}' +
        '.sched-dot.passed{background:' + Y + ';}' +
        '.sched-dot.next-d{background:' + G + ';box-shadow:0 0 8px ' + G + ';}' +
        '.sched-time{font-size:22px;font-weight:500;min-width:60px;color:#fff;}' +
        '.sched-time.passed{color:#434856;}' +
        '.sched-info{flex:1;}' +
        '.sched-portions{font-size:13px;color:#fff;}' +
        '.sched-grams{font-size:10px;color:#636774;margin-top:1px;}' +
        '.sched-status{font-size:11px;padding:3px 8px;border-radius:20px;font-weight:600;}' +
        '.sched-status.done{background:rgba(255,218,120,.1);color:' + Y + ';}' +
        '.sched-status.next-s{background:rgba(206,245,149,.15);color:' + G + ';}' +
        '.sched-status.pending{background:' + BG2 + ';color:#535865;}' +
        '.sched-delete{width:44px;height:44px;border-radius:50%;background:transparent;border:none;color:#636774;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:color .2s;margin:-8px -8px -8px 0;}' +
        '.sched-delete:hover{color:' + R + ';}' +
        '.sched-delete-inner{width:28px;height:28px;border-radius:50%;background:' + BG2 + ';display:flex;align-items:center;justify-content:center;pointer-events:none;transition:background .2s;}' +
        '.sched-delete:hover .sched-delete-inner{background:rgba(255,145,138,.2);}' +
        '.sched-actions{display:flex;gap:8px;margin-top:10px;}' +
        '.add-btn{flex:1;padding:11px;background:' + BG1 + ';border:1px dashed ' + BG2 + ';border-radius:14px;color:#636774;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;}' +
        '.add-btn:hover{background:' + BG2 + ';border-color:' + Y + ';color:' + Y + ';}' +
        '.apply-btn{flex:2;padding:11px;background:' + Y + ';color:#000;border:none;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s;}' +
        '.apply-btn:hover{opacity:.85;}' +
        '.empty-state{text-align:center;padding:40px 16px;}' +
        '.empty-state.loading{padding:48px 16px;}' +
        '.empty-state-icon{margin-bottom:8px;display:flex;justify-content:center;}' +
        '.empty-state-text{font-size:13px;color:#636774;line-height:1.5;}' +
        '.empty-state.loading .empty-state-text{font-size:12px;color:#535865;}' +
        '.loading-spinner{width:48px;height:48px;margin:0 auto 16px;position:relative;}' +
        '.loading-ring{position:absolute;width:100%;height:100%;border:3px solid transparent;border-top-color:' + Y + ';border-radius:50%;animation:spin 1.5s linear infinite;will-change:transform;transform:translateZ(0);}' +
        '.loading-ring::before{content:"";position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:3px solid transparent;border-top-color:' + G + ';border-radius:50%;animation:spin 3s linear infinite reverse;will-change:transform;transform:translateZ(0);}' +
        '.loading-dots{display:flex;justify-content:center;gap:6px;margin-top:12px;}' +
        '.loading-dot{width:8px;height:8px;border-radius:50%;background:' + Y + ';animation:dotPulse 1.5s ease-in-out infinite;will-change:opacity,transform;transform:translateZ(0);}' +
        '.loading-dot:nth-child(2){animation-delay:0.15s;}' +
        '.loading-dot:nth-child(3){animation-delay:0.3s;}' +
        '@keyframes spin{0%{transform:rotate(0deg) translateZ(0)}100%{transform:rotate(360deg) translateZ(0)}}' +
        '@keyframes bounce{0%,100%{transform:translateY(0)}25%{transform:translateY(-6px)}75%{transform:translateY(-6px)}}' +
        '@keyframes dotPulse{0%,100%{opacity:0.3;transform:scale(1) translateZ(0)}50%{opacity:1;transform:scale(1.5) translateZ(0)}}' +
        '.feed-section-title{font-size:10px;color:#636774;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;font-weight:600;}' +
        '.quick-btns{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}' +
        '.quick-btns.sizes-3{grid-template-columns:repeat(3,1fr);}' +
        '.quick-btns.sizes-2{grid-template-columns:repeat(2,1fr);}' +
        '.quick-btn{position:relative;background:' + BG1 + ';border:1px solid ' + BG2 + ';border-radius:14px;padding:10px 6px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:background .2s,border-color .2s,transform .15s;color:#fff;font-family:inherit;overflow:hidden;}' +
        '.quick-btn:hover{background:' + BG2 + ';border-color:' + Y + ';transform:translateY(-1px);}' +
        '.quick-btn:active{transform:translateY(0);}' +
        '.quick-pellets{display:flex;gap:3px;align-items:center;justify-content:center;height:10px;margin-bottom:2px;}' +
        '.pellet{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.7;}' +
        '.pellet-more{font-size:9px;font-weight:600;opacity:.7;margin-left:2px;}' +
        '.quick-bowl{width:46px;height:26px;color:#535865;transition:color .2s;}' +
        '.bowl-stroke{stroke:currentColor;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;}' +
        '.bowl-rim{stroke:currentColor;stroke-width:1.6;stroke-linecap:round;opacity:.7;}' +
        '.bowl-fill{fill:currentColor;opacity:.35;transition:fill .2s,opacity .2s;}' +
        '.quick-btn.level-low{color:#969aa6;}' +
        '.quick-btn.level-low .quick-pellets{color:' + Y + ';}' +
        '.quick-btn.level-low .quick-bowl{color:' + Y + ';}' +
        '.quick-btn.level-normal{color:#969aa6;}' +
        '.quick-btn.level-normal .quick-pellets{color:' + G + ';}' +
        '.quick-btn.level-normal .quick-bowl{color:' + G + ';}' +
        '.quick-btn.level-high{color:#969aa6;}' +
        '.quick-btn.level-high .quick-pellets{color:' + O + ';}' +
        '.quick-btn.level-high .quick-bowl{color:' + O + ';}' +
        '.quick-meta{display:flex;flex-direction:column;align-items:center;gap:0;margin-top:2px;}' +
        '.quick-btn-val{font-size:18px;font-weight:600;color:#fff;line-height:1;}' +
        '.quick-btn-lbl{font-size:10px;color:#636774;text-transform:uppercase;letter-spacing:.3px;margin-top:2px;}' +
        '.quick-btn.favourite{background:linear-gradient(155deg,rgba(255,218,120,.18),' + BG1 + ' 80%);border-color:rgba(255,218,120,.5);box-shadow:0 0 0 1px rgba(255,218,120,.15),0 6px 14px rgba(0,0,0,.3);}' +
        '.quick-btn.favourite .quick-btn-val{color:' + Y + ';}' +
        '.quick-btn.favourite:hover{border-color:' + Y + ';background:linear-gradient(155deg,rgba(255,218,120,.28),' + BG2 + ' 80%);}' +
        '.quick-fav{position:absolute;top:6px;right:6px;color:' + Y + ';display:flex;align-items:center;justify-content:center;}' +
        '.quick-last-dot{position:absolute;top:8px;left:8px;width:6px;height:6px;border-radius:50%;background:' + G + ';box-shadow:0 0 0 2px ' + BG1 + ',0 0 6px ' + G + ';}' +
        '.quick-btn.favourite .quick-last-dot{box-shadow:0 0 0 2px rgba(255,218,120,.15),0 0 6px ' + G + ';}' +
        '.quick-fed-mark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(206,245,149,.95);color:#000;font-weight:700;font-size:12px;border-radius:13px;opacity:0;pointer-events:none;transform:scale(.85);transition:opacity .15s,transform .15s;}' +
        '.quick-btn.fed .quick-fed-mark{opacity:1;transform:scale(1);}' +
        '.quick-btn.busy{opacity:.55;pointer-events:none;}' +
        '@media(prefers-reduced-motion:reduce){.quick-btn,.quick-btn:hover{transition:none;transform:none;}.quick-fed-mark{transition:none;}}' +
        '.custom-feed{background:' + BG1 + ';border-radius:16px;padding:14px;display:flex;align-items:center;gap:10px;margin-bottom:12px;}' +
        '.custom-label{font-size:12px;color:#969aa6;flex:1;}' +
        '.stepper{display:flex;align-items:center;gap:8px;}' +
        '.step-btn{width:44px;height:44px;border-radius:50%;background:' + BG2 + ';border:none;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
        '.step-btn:hover{background:' + BG2 + ';filter:brightness(1.3);}' +
        '.step-val{font-size:18px;font-weight:500;min-width:24px;text-align:center;color:#fff;}' +
        '.feed-now-btn{width:100%;padding:14px;background:' + G + ';color:#000;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s,color .2s,opacity .2s;box-shadow:0 4px 12px rgba(206,245,149,.25);}' +
        '.feed-now-btn:hover{opacity:.85;}' +
        '.info-grid{display:flex;flex-direction:column;gap:8px;}' +
        '.info-row{background:' + BG1 + ';border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;}' +
        '.info-row-label{font-size:12px;color:#636774;}' +
        '.info-row-val{font-size:12px;color:#fff;font-weight:500;text-align:right;}' +
        '.toggle{width:36px;height:20px;border-radius:10px;background:' + BG2 + ';position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}' +
        '.toggle.on{background:' + G + ';}' +
        '.toggle-thumb{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:left .2s;}' +
        '.toggle.on .toggle-thumb{left:18px;}' +
        '.raw-details{background:' + BG1 + ';border-radius:14px;padding:12px 14px;}' +
        '.raw-details summary{font-size:12px;color:#636774;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;}' +
        '.raw-details summary::-webkit-details-marker{display:none;}' +
        '.raw-details summary::after{content:"▸";transition:transform .2s;}' +
        '.raw-details[open] summary::after{content:"▾";}' +
        '.raw-content{font-size:11px;color:#535865;word-break:break-all;margin-top:8px;}' +
        '.popup-overlay{position:absolute;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10;}' +
        '.popup{background:' + BG1 + ';border-radius:20px;padding:24px 20px 20px;width:calc(100% - 40px);max-width:320px;position:relative;animation:popIn .2s ease;}' +
        '@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}' +
        '.popup-title{font-size:14px;font-weight:600;color:#fff;margin-bottom:20px;text-align:center;}' +
        '.popup-close{position:absolute;top:14px;right:14px;width:44px;height:44px;border-radius:50%;border:none;background:' + BG2 + ';color:#969aa6;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
        '.popup-row{margin-bottom:16px;}' +
        '.popup-row-label{font-size:10px;color:#636774;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;font-weight:600;}' +
        '.time-inputs{display:flex;gap:8px;align-items:center;}' +
        '.time-sep{color:#636774;font-size:20px;}' +
        '.num-input{flex:1;background:' + BG2 + ';border:1px solid ' + BG2 + ';border-radius:12px;color:#fff;font-size:24px;font-weight:500;text-align:center;padding:10px 6px;outline:none;-moz-appearance:textfield;}' +
        '.num-input::-webkit-inner-spin-button{display:none;}' +
        '.num-input:focus{border-color:' + Y + ';}' +
        '.size-stepper{display:flex;align-items:center;justify-content:center;gap:16px;}' +
        '.size-step-btn{width:44px;height:44px;border-radius:50%;background:' + BG2 + ';border:1px solid ' + BG2 + ';color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}' +
        '.size-step-btn:hover{background:' + BG2 + ';filter:brightness(1.3);border-color:' + Y + ';}' +
        '.size-val{font-size:32px;font-weight:500;min-width:48px;text-align:center;color:#fff;}' +
        '.size-sub{font-size:11px;color:#636774;text-align:center;margin-top:4px;}' +
        '.popup-save{flex:2;padding:13px;background:' + Y + ';color:#000;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .2s;}' +
        '.popup-save:hover{opacity:.85;}' +
        '.popup-actions{display:flex;gap:8px;margin-top:20px;}' +
        '.popup-cancel{flex:1;padding:13px;background:' + BG2 + ';color:#fff;border:none;border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .2s,background .2s;}' +
        '.popup-cancel:hover{background:#373c4a;}' +
        '.popup-warn{margin-top:8px;padding:6px 10px;border-radius:8px;background:rgba(255,145,138,.12);color:' + R + ';font-size:11px;line-height:1.4;}' +
        '.num-input.invalid{border-color:' + R + ';background:rgba(255,145,138,.08);}' +
        '.badge-pending{background:rgba(255,218,120,.18);color:' + Y + ';animation:badgePulse 1.6s ease-in-out infinite;}' +
        '.badge-mode{background:' + BG1 + ';color:#969aa6;}' +
        '@keyframes badgePulse{0%,100%{opacity:.7}50%{opacity:1}}' +
        '.apply-btn.pulse{animation:applyPulse 1.6s ease-in-out infinite;}' +
        '@keyframes applyPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,218,120,.5)}50%{box-shadow:0 0 0 6px rgba(255,218,120,0)}}' +
        '.add-btn.danger,.add-btn.warn{flex:0 0 auto;padding:11px 13px;display:flex;align-items:center;justify-content:center;}' +
        '.add-btn.danger{color:#636774;}' +
        '.add-btn.danger:hover{color:' + R + ';border-color:' + R + ';background:rgba(255,145,138,.08);}' +
        '.add-btn.danger.holding,.sched-delete.holding{animation:holdProgress .55s linear forwards;}' +
        '.add-btn.warn{color:' + O + ';border-color:' + O + ';}' +
        '.add-btn.warn:hover{background:rgba(255,181,129,.12);}' +
        '@keyframes holdProgress{0%{transform:scale(1)}100%{transform:scale(0.92);background:rgba(255,145,138,.25)}}' +
        '.sched-skeleton{display:flex;align-items:center;gap:12px;background:' + BG1 + ';border-radius:16px;padding:12px 14px;overflow:hidden;}' +
        '.skel-dot,.skel-time,.skel-line,.skel-status{background:linear-gradient(90deg,' + BG2 + ' 0%,#3a3f4d 50%,' + BG2 + ' 100%);background-size:200% 100%;animation:skelShimmer 1.4s ease-in-out infinite;border-radius:6px;}' +
        '.skel-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}' +
        '.skel-time{width:60px;height:24px;}' +
        '.skel-info{flex:1;display:flex;flex-direction:column;gap:6px;}' +
        '.skel-line-1{height:12px;width:60%;}' +
        '.skel-line-2{height:10px;width:35%;}' +
        '.skel-status{width:54px;height:18px;border-radius:20px;}' +
        '.skel-hint{text-align:center;font-size:11px;color:#535865;margin-top:10px;}' +
        '@keyframes skelShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}' +
        '.food-bar{margin:0 20px 12px;padding:10px 14px;background:' + BG1 + ';border-radius:14px;display:flex;align-items:center;gap:10px;}' +
        '.food-bar-label{font-size:11px;color:#636774;text-transform:uppercase;letter-spacing:.4px;flex-shrink:0;}' +
        '.food-bar-track{flex:1;height:6px;border-radius:3px;background:' + BG2 + ';overflow:hidden;}' +
        '.food-bar-fill{height:100%;border-radius:3px;transition:width .4s ease;}' +
        '.food-bar.ok .food-bar-fill{background:' + G + ';}' +
        '.food-bar.mid .food-bar-fill{background:' + O + ';}' +
        '.food-bar.low .food-bar-fill{background:' + R + ';}' +
        '.food-bar-val{font-size:12px;color:#fff;font-weight:600;min-width:34px;text-align:right;}' +
        '.food-bar.low .food-bar-val{color:' + R + ';}' +
        '.segmented{display:inline-flex;background:' + BG2 + ';border-radius:10px;padding:2px;}' +
        '.seg-btn{padding:6px 14px;border:none;background:transparent;color:#969aa6;font-size:12px;font-weight:600;cursor:pointer;border-radius:8px;transition:background .2s,color .2s;}' +
        '.seg-btn.active{background:' + Y + ';color:#000;}' +
        '.seg-btn:not(.active):hover{color:#fff;}' +
        '.snackbar{position:absolute;left:16px;right:16px;bottom:16px;background:#2a2e3a;color:#fff;padding:12px 14px;border-radius:12px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:20;animation:snackIn .25s ease;}' +
        '@keyframes snackIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}' +
        '.snackbar.snackbar-out{animation:snackOut .2s ease forwards;}' +
        '@keyframes snackOut{to{opacity:0;transform:translateY(8px)}}' +
        '.snackbar-text{flex:1;font-size:13px;}' +
        '.snackbar-action{background:transparent;border:none;color:' + Y + ';font-size:13px;font-weight:700;cursor:pointer;padding:4px 8px;border-radius:6px;}' +
        '.snackbar-action:hover{background:rgba(255,218,120,.12);}' +
        '.busy{pointer-events:none;opacity:.6;}' +
        '.tab-btn:focus-visible,.quick-btn:focus-visible,.step-btn:focus-visible,.size-step-btn:focus-visible,' +
        '.sched-delete:focus-visible,.add-btn:focus-visible,.apply-btn:focus-visible,' +
        '.feed-now-btn:focus-visible,.popup-close:focus-visible,.popup-save:focus-visible,.popup-cancel:focus-visible,' +
        '.seg-btn:focus-visible,.snackbar-action:focus-visible,' +
        '.color-reset:focus-visible{outline:2px solid ' + Y + ';outline-offset:2px;}' +
        '@media(prefers-reduced-motion:reduce){' +
          '.online-dot,.loading-ring,.loading-dot,.skel-dot,.skel-time,.skel-line,.skel-status,.apply-btn.pulse,.badge-pending{animation:none!important;}' +
          '.tab-pane{animation:none!important;}' +
          '.popup{animation:none!important;}' +
          '.snackbar{animation:none!important;}' +
        '}';
      var icon = this._config.icon || '';
      var iconHtml;
      if (icon && (icon.startsWith('http') || icon.startsWith('data:'))) {
        iconHtml = '<img src="' + icon + '" alt="">';
      } else if (icon && icon.startsWith('/config/www/')) {
        var localPath = icon.replace('/config/www/', '/local/');
        iconHtml = '<img src="' + localPath + '" alt="">';
      } else if (icon && icon.startsWith('/')) {
        iconHtml = '<img src="' + icon + '" alt="">';
      } else {
        iconHtml = icon || '🐱';
      }
      var html =
        '<div class="card">' +
          '<div class="hdr">' +
            '<div class="hdr-icon">' + iconHtml + '</div>' +
            '<div class="hdr-info">' +
              '<div class="hdr-title">' + (this._config.title || 'Feeder') + '</div>' +
              '<div class="hdr-sub" id="hdr-sub" title="">Loading...</div>' +
            '</div>' +
            '<div class="hdr-badges" id="hdr-badges"></div>' +
          '</div>' +
          '<div class="stats" id="stats-row"></div>' +
          '<div class="tabs">' +
            '<button class="tab-btn active" data-tab="schedule"><div class="tab-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><span class="tab-label">' + this._lbl('label_schedule', 'Schedule') + '</span></button>' +
            '<button class="tab-btn" data-tab="feed"><div class="tab-icon"><svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div><span class="tab-label">' + this._lbl('label_feed', 'Feed now') + '</span></button>' +
            '<button class="tab-btn" data-tab="info"><div class="tab-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div><span class="tab-label">' + this._lbl('label_settings', 'Settings') + '</span></button>' +
          '</div>' +
          '<div class="content">' +
            '<div id="tab-schedule" class="tab-pane"></div>' +
            '<div id="tab-feed" class="tab-pane" style="display:none"></div>' +
            '<div id="tab-info" class="tab-pane" style="display:none"></div>' +
          '</div>' +
        '</div>';
      var styleEl = document.createElement('style');
      styleEl.textContent = css;
      this._shadow.innerHTML = '';
      this._shadow.appendChild(styleEl);
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      this._shadow.appendChild(wrapper.firstChild);
      var self = this;
      var tabs = ['schedule', 'feed', 'info'];
      var switchTab = function(tab) {
        if (tabs.indexOf(tab) === -1) return;
        self._isLoading = false;
        self._shadow.querySelectorAll('.tab-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.tab === tab);
        });
        self._activeTab = tab;
        tabs.forEach(function(t) {
          var el = self._shadow.querySelector('#tab-' + t);
          if (el) el.style.display = t === tab ? '' : 'none';
        });
        self._renderTab(tab);
      };
      this._switchTab = switchTab;
      this._shadow.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          self._vibrate(10);
          switchTab(btn.dataset.tab);
        });
      });
      var content = this._shadow.querySelector('.content');
      if (content) {
        var startX = 0, startY = 0, tracking = false;
        content.addEventListener('touchstart', function(e) {
          if (e.touches.length !== 1) return;
          tracking = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }, { passive: true });
        content.addEventListener('touchend', function(e) {
          if (!tracking) return;
          tracking = false;
          var t = e.changedTouches[0];
          var dx = t.clientX - startX;
          var dy = t.clientY - startY;
          if (Math.abs(dx) < 50 || Math.abs(dy) > 50) return;
          if (self._shadow.querySelector('.popup-overlay')) return;
          var idx = tabs.indexOf(self._activeTab);
          if (idx < 0) return;
          if (dx < 0 && idx < tabs.length - 1) { self._vibrate(8); switchTab(tabs[idx + 1]); }
          else if (dx > 0 && idx > 0) { self._vibrate(8); switchTab(tabs[idx - 1]); }
        }, { passive: true });
      }
      this._updateDynamic();
    }
    _updateDynamic() {
      if (!this._hass) return;
      this._renderHeader();
      this._renderStats();
      if (this._isLoading) return;
      this._renderTab(this._activeTab);
    }
    _renderHeader() {
      var sub = this._shadow.querySelector('#hdr-sub');
      var badges = this._shadow.querySelector('#hdr-badges');
      var foodBar = this._shadow.querySelector('#food-bar');
      if (!sub || !badges) return;
      var mode = this._state(this._e('entity_mode'), 'unavailable');
      var error = this._state(this._e('entity_error')) === 'on';
      var online = mode !== 'unavailable' && mode !== 'unknown';
      var next = this._computeNextFeeding();
      if (next) {
        var cd = this._formatCountdown(next.seconds);
        sub.textContent = 'Next in ' + cd + ' · ' + this._pad(next.schedule.hour) + ':' + this._pad(next.schedule.minute);
      } else {
        var pretty = this._state(this._e('entity_schedule_pretty'), '');
        var text = (pretty && pretty !== 'unavailable' && pretty !== 'unknown') ? pretty : 'No schedule';
        sub.textContent = text;
      }
      sub.title = sub.textContent;
      var parts = [];
      parts.push(online ? '<div class="online-dot"></div>' : '<div class="offline-dot"></div>');
      if (online && mode === 'manual') parts.push('<span class="badge badge-mode">Manual</span>');
      if (this._pending) parts.push('<span class="badge badge-pending" title="Unsent local changes">● Pending</span>');
      if (error) parts.push('<span class="badge badge-error">Error</span>');
      badges.innerHTML = parts.join('');
      var foodEntity = this._e('entity_food_level');
      if (foodEntity && this._hass && this._hass.states[foodEntity]) {
        var pct = parseFloat(this._hass.states[foodEntity].state);
        if (!isNaN(pct)) {
          if (pct > 100) pct = 100;
          if (pct < 0) pct = 0;
          var levelClass = pct < 15 ? 'low' : pct < 35 ? 'mid' : 'ok';
          if (!foodBar) {
            var stats = this._shadow.querySelector('#stats-row');
            if (stats && stats.parentNode) {
              var bar = document.createElement('div');
              bar.id = 'food-bar';
              bar.className = 'food-bar ' + levelClass;
              bar.innerHTML = '<div class="food-bar-label">Food level</div><div class="food-bar-track"><div class="food-bar-fill" style="width:' + pct + '%;"></div></div><div class="food-bar-val">' + Math.round(pct) + '%</div>';
              stats.parentNode.insertBefore(bar, stats);
            }
          } else {
            foodBar.className = 'food-bar ' + levelClass;
            var fill = foodBar.querySelector('.food-bar-fill');
            var val = foodBar.querySelector('.food-bar-val');
            if (fill) fill.style.width = pct + '%';
            if (val) val.textContent = Math.round(pct) + '%';
          }
        }
      } else if (foodBar) {
        foodBar.remove();
      }
      this._ensureCountdownTimer();
    }
    _ensureCountdownTimer() {
      var self = this;
      if (this._countdownTimer) return;
      if (!this._computeNextFeeding()) return;
      this._countdownTimer = setInterval(function() {
        if (!self.isConnected) {
          clearInterval(self._countdownTimer);
          self._countdownTimer = null;
          return;
        }
        var sub = self._shadow.querySelector('#hdr-sub');
        if (!sub) return;
        var n = self._computeNextFeeding();
        if (!n) return;
        var cd = self._formatCountdown(n.seconds);
        sub.textContent = 'Next in ' + cd + ' · ' + self._pad(n.schedule.hour) + ':' + self._pad(n.schedule.minute);
      }, 30000);
    }
    _renderStats() {
      var el = this._shadow.querySelector('#stats-row');
      if (!el) return;
      var clean = function(v) { return (v === 'unknown' || v === 'unavailable') ? '-' : v; };
      var portions = clean(this._state(this._e('entity_portions_day'), '-'));
      var grams = clean(this._state(this._e('entity_weight_day'), '-'));
      var weight = clean(this._state(this._e('entity_portion_weight'), '-'));
      var gFmt = this._formatGrams(grams);
      var portionsClass = (portions === '0' || portions === '-') ? 'stat-val empty' : 'stat-val';
      var gramsClass = (gFmt.val === '0' || gFmt.val === '-') ? 'stat-val empty' : 'stat-val';
      el.innerHTML =
        '<div class="stat"><div class="' + portionsClass + '">' + portions + '</div><div class="stat-lbl">' + this._lbl('label_portions_today', 'Portions today') + '</div></div>' +
        '<div class="stat"><div class="' + gramsClass + '">' + gFmt.val + '<span>' + gFmt.unit + '</span></div><div class="stat-lbl">' + this._lbl('label_grams_today', 'Grams today') + '</div></div>' +
        '<div class="stat"><div class="stat-val">' + weight + '<span>g</span></div><div class="stat-lbl">' + this._lbl('label_per_portion', 'Per portion') + '</div></div>';
    }
    _renderTab(tab) {
      var el = this._shadow.querySelector('#tab-' + tab);
      if (!el) return;
      if (tab === 'schedule') this._renderScheduleTab(el);
      else if (tab === 'feed') this._renderFeedTab(el);
      else if (tab === 'info') this._renderInfoTab(el);
    }
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
      var sortedSchedules = indexed.map(function(item) { return item.s; });
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
          '<div class="sched-item" data-slot="' + idx + '" title="Tap to edit">' +
            '<div class="sched-dot ' + dotClass + '"></div>' +
            '<div class="sched-time ' + timeClass + '">' + self._pad(s.hour) + ':' + self._pad(s.minute) + '</div>' +
            '<div class="sched-info">' +
              '<div class="sched-portions">' + s.size + ' portions</div>' +
              '<div class="sched-grams">~' + grams + 'g</div>' +
            '</div>' +
            '<span class="sched-status ' + statusClass + '">' + statusText + '</span>' +
            '<span class="sched-edit-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>' +
            '<button class="sched-delete" data-del="' + idx + '" title="Remove"><div class="sched-delete-inner"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></button>' +
          '</div>';
      });
      html += '</div>';
      var diverges = this._hasDivergence();
      html += '<div class="sched-actions">';
      if (schedules.length < maxSchedules) {
        html += '<button class="add-btn" id="add-slot-btn">+ Add</button>';
      }
      html += '<button class="add-btn danger" id="clear-all-btn" aria-label="Clear all"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>';
      if (diverges) {
        html += '<button class="add-btn warn" id="sync-btn" title="Reload from feeder"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>';
      }
      html += '<button class="apply-btn' + (this._pending ? ' pulse' : '') + '" id="apply-btn">' + (this._pending ? 'Send changes' : 'Send to feeder') + '</button>';
      html += '</div>';
      container.innerHTML = html;
      container.querySelectorAll('.sched-item').forEach(function(el) {
        el.addEventListener('click', function(e) {
          if (e.target.closest && e.target.closest('.sched-delete')) return;
          self._vibrate(10);
          var sortedIdx = parseInt(el.dataset.slot, 10);
          var item = indexed[sortedIdx];
          if (!item) return;
          self._openEditPopup(item.i);
        });
      });
      var attachLongPress = function(btn, onTrigger) {
        var holdTimer = null;
        var fired = false;
        var start = function(ev) {
          ev.preventDefault();
          fired = false;
          btn.classList.add('holding');
          holdTimer = setTimeout(function() {
            fired = true;
            btn.classList.remove('holding');
            self._vibrate([20, 30, 20]);
            onTrigger();
          }, 550);
        };
        var cancel = function() {
          btn.classList.remove('holding');
          if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        };
        btn.addEventListener('pointerdown', start);
        btn.addEventListener('pointerup', cancel);
        btn.addEventListener('pointerleave', cancel);
        btn.addEventListener('pointercancel', cancel);
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!fired) self._showSnackbar('Hold to delete');
        });
      };
      container.querySelectorAll('.sched-delete').forEach(function(btn) {
        var sortedIdx = parseInt(btn.dataset.del, 10);
        var item = indexed[sortedIdx];
        if (!item) return;
        var origIdx = item.i;
        attachLongPress(btn, function() {
          var removed = self._schedules[origIdx];
          if (!removed) return;
          self._undo = { schedule: removed, index: origIdx };
          self._schedules = self._schedules.filter(function(_, i) { return i !== origIdx; });
          self._markPending();
          self._renderTab('schedule');
          self._showSnackbar('Feeding removed', 'Undo', function() {
            if (!self._undo) return;
            var u = self._undo;
            self._schedules.splice(Math.min(u.index, self._schedules.length), 0, u.schedule);
            self._undo = null;
            self._renderTab('schedule');
          });
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
      var clearBtn = container.querySelector('#clear-all-btn');
      if (clearBtn) {
        attachLongPress(clearBtn, function() {
          var backup = self._schedules.slice();
          self._undo = { all: backup };
          self._schedules = [];
          self._markPending();
          self._renderTab('schedule');
          self._showSnackbar('Cleared ' + backup.length + ' feedings', 'Undo', function() {
            if (!self._undo || !self._undo.all) return;
            self._schedules = self._undo.all.slice();
            self._undo = null;
            self._renderTab('schedule');
          });
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
      };
      document.addEventListener('keydown', onKey, true);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });
      var popup = document.createElement('div');
      popup.className = 'popup';
      popup.innerHTML =
        '<div class="popup-title">Feeding ' + (slot + 1) + '</div>' +
        '<button class="popup-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '<div class="popup-row">' +
          '<div class="popup-row-label">Time</div>' +
          '<div class="time-inputs">' +
            '<input class="num-input" id="p-hour" type="number" min="0" max="23" inputmode="numeric" value="' + Math.round(hour) + '">' +
            '<span class="time-sep">:</span>' +
            '<input class="num-input" id="p-min" type="number" min="0" max="59" inputmode="numeric" value="' + Math.round(minute) + '">' +
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
      popup.querySelector('#p-minus').addEventListener('click', function() {
        self._vibrate(5);
        if (size > 1) { size--; sizeEl.textContent = size; gramsEl.textContent = '~' + Math.round(size*portionWeight) + 'g'; }
      });
      popup.querySelector('#p-plus').addEventListener('click', function() {
        self._vibrate(5);
        if (size < 10) { size++; sizeEl.textContent = size; gramsEl.textContent = '~' + Math.round(size*portionWeight) + 'g'; }
      });
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
        self._lastSent = Date.now();
        self._sendSchedule();
        dismiss();
        self._showSent();
        setTimeout(function() { self._renderTab('schedule'); }, 400);
      });
      validate();
    }
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
      if (isNaN(favourite)) favourite = 2;
      if (this._customSize == null) this._customSize = this._lastFeedSize || favourite;
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
      var updateCustom = function() {
        self._customSize = customSize;
        valEl.textContent = customSize;
        btn.textContent = 'Feed now (' + customSize + ' por. ~' + Math.round(customSize*portionWeight) + 'g)';
      };
      container.querySelector('#c-minus').addEventListener('click', function() {
        if (customSize > 1) { customSize--; updateCustom(); }
      });
      container.querySelector('#c-plus').addEventListener('click', function() {
        if (customSize < 10) { customSize++; updateCustom(); }
      });
      container.querySelectorAll('.quick-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          if (b.dataset.busy === '1') return;
          self._vibrate(15);
          var size = parseInt(b.dataset.size, 10);
          if (isNaN(size)) return;
          b.dataset.busy = '1';
          b.classList.add('busy');
          self._showConfirmation(size, function() {
            self._feedNow(size);
            b.classList.remove('busy');
            b.classList.add('fed');
            setTimeout(function() {
              b.dataset.busy = '';
              self._renderTab('feed');
            }, 1800);
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
          self._feedNow(customSize);
          self._showFeedSuccess(btn);
        });
      });
    }
    _renderInfoTab(container) {
      if (!container) return;
      var self = this;
      var portionWeight = this._state(this._e('entity_portion_weight'), '-');
      var lock = this._state(this._e('entity_child_lock')) === 'on';
      var led = this._state(this._e('entity_led')) === 'on';
      var mode = this._state(this._e('entity_mode'), '-');
      var feedingSize = this._state(this._e('entity_feeding_size'), '-');
      var feedingSource = this._state(this._e('entity_feeding_source'), '-');
      var sourceLabel = { schedule: 'Auto schedule', manual: 'Manual', remote: 'Remote' }[feedingSource] || (feedingSource === '-' ? '-' : feedingSource);
      var updateEntity = this._e('entity_update');
      var fw = (this._hass && updateEntity && this._hass.states[updateEntity] && this._hass.states[updateEntity].attributes.installed_version) || '-';
      var actual = this._state(this._e('entity_schedule'), '-');
      var rawOpen = container.querySelector('.raw-details') && container.querySelector('.raw-details').open;
      var modeEntity = this._e('entity_mode');
      var modeAvailable = mode === 'schedule' || mode === 'manual';
      var modeRow = modeAvailable
        ? '<div class="info-row"><div class="info-row-label">Mode</div>' +
            '<div class="segmented" role="tablist" aria-label="Feeder mode">' +
              '<button class="seg-btn' + (mode === 'schedule' ? ' active' : '') + '" data-mode="schedule" role="tab" aria-selected="' + (mode === 'schedule') + '">Auto</button>' +
              '<button class="seg-btn' + (mode === 'manual' ? ' active' : '') + '" data-mode="manual" role="tab" aria-selected="' + (mode === 'manual') + '">Manual</button>' +
            '</div></div>'
        : '<div class="info-row"><div class="info-row-label">Mode</div><div class="info-row-val">-</div></div>';
      container.innerHTML =
        '<div class="info-grid">' +
          modeRow +
          '<div class="info-row"><div class="info-row-label">Haptic feedback</div><div class="toggle ' + (this._config.vibration_enabled !== false ? 'on' : '') + '" id="toggle-vibration" role="switch" aria-checked="' + (this._config.vibration_enabled !== false) + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">Sound feedback</div><div class="toggle ' + (this._config.sound_enabled === true ? 'on' : '') + '" id="toggle-sound" role="switch" aria-checked="' + (this._config.sound_enabled === true) + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">Portion weight</div>' +
            '<div class="info-row-val" style="display:flex;align-items:center;gap:8px;">' +
              '<button class="step-btn" id="pw-minus" style="width:36px;height:36px;font-size:14px;" aria-label="Decrease">−</button>' +
              '<span id="pw-val">' + portionWeight + '</span>g' +
              '<button class="step-btn" id="pw-plus" style="width:36px;height:36px;font-size:14px;" aria-label="Increase">+</button>' +
            '</div></div>' +
          '<div class="info-row"><div class="info-row-label">Last feeding source</div><div class="info-row-val">' + sourceLabel + '</div></div>' +
          '<div class="info-row"><div class="info-row-label">Last portion size</div><div class="info-row-val">' + feedingSize + ' por.</div></div>' +
          '<div class="info-row"><div class="info-row-label">Child lock</div><div class="toggle ' + (lock?'on':'') + '" id="toggle-lock" role="switch" aria-checked="' + lock + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">LED indicator</div><div class="toggle ' + (led?'on':'') + '" id="toggle-led" role="switch" aria-checked="' + led + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">Firmware</div><div class="info-row-val">' + fw + '</div></div>' +
          '<details class="raw-details"' + (rawOpen ? ' open' : '') + '><summary>Feeder schedule (raw)</summary><div class="raw-content">' + actual + '</div></details>' +
        '</div>';
      container.querySelectorAll('.seg-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (!modeEntity) return;
          var target = btn.dataset.mode;
          if (mode === target) return;
          self._vibrate(15);
          container.querySelectorAll('.seg-btn').forEach(function(b) {
            var on = b.dataset.mode === target;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on);
          });
          self._hass.callService('select', 'select_option', { entity_id: modeEntity, option: target });
        });
      });
      var parsedPw = parseFloat(portionWeight);
      var pw = isNaN(parsedPw) ? 5 : parsedPw;
      var pwAvailable = !isNaN(parsedPw);
      var pwEl = container.querySelector('#pw-val');
      var pwEntity = this._e('entity_portion_weight');
      container.querySelector('#pw-minus').addEventListener('click', function() {
        if (!pwAvailable || !pwEntity) return;
        if (pw > 1) { pw--; pwEl.textContent = pw; self._hass.callService('number', 'set_value', { entity_id: pwEntity, value: pw }); }
      });
      container.querySelector('#pw-plus').addEventListener('click', function() {
        if (!pwAvailable || !pwEntity) return;
        if (pw < 20) { pw++; pwEl.textContent = pw; self._hass.callService('number', 'set_value', { entity_id: pwEntity, value: pw }); }
      });
      var vibrationToggle = container.querySelector('#toggle-vibration');
      if (vibrationToggle) {
        vibrationToggle.addEventListener('click', function() {
          var isOn = this.classList.toggle('on');
          this.setAttribute('aria-checked', isOn);
          self._config.vibration_enabled = isOn;
          if (isOn && navigator.vibrate) navigator.vibrate([10, 20, 10]);
        });
      }
      var soundToggle = container.querySelector('#toggle-sound');
      if (soundToggle) {
        soundToggle.addEventListener('click', function() {
          var isOn = this.classList.toggle('on');
          this.setAttribute('aria-checked', isOn);
          self._config.sound_enabled = isOn;
          if (isOn) self._clickFeedback();
        });
      }
      var lockEntity = this._e('entity_child_lock');
      container.querySelector('#toggle-lock').addEventListener('click', function() {
        if (!lockEntity) return;
        self._vibrate([10, 20, 10]);
        var isOn = this.classList.toggle('on');
        this.setAttribute('aria-checked', isOn);
        self._hass.callService('switch', isOn ? 'turn_on' : 'turn_off', { entity_id: lockEntity });
      });
      var ledEntity = this._e('entity_led');
      container.querySelector('#toggle-led').addEventListener('click', function() {
        if (!ledEntity) return;
        self._vibrate([10, 20, 10]);
        var isOn = this.classList.toggle('on');
        this.setAttribute('aria-checked', isOn);
        self._hass.callService('switch', isOn ? 'turn_on' : 'turn_off', { entity_id: ledEntity });
      });
    }
  }
  customElements.define('aqara-feeder-card', AqaraFeederCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'aqara-feeder-card', name: 'Aqara Feeder Card', description: 'Aqara pet feeder via zigbee2mqtt' });
})();