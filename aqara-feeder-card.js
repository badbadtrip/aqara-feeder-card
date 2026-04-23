// Aqara Feeder Card - custom Lovelace card for Home Assistant
// Dynamic schedules, sends directly via MQTT to zigbee2mqtt

(function () {
  if (customElements.get('aqara-feeder-card')) return;

  // --- Config editor element ---
  class AqaraFeederCardEditor extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._config = {};
      this._hass = null;
      // track which accordion sections are open
      this._open = { general: true, colors: false, labels: false, entities_schedule: false, entities_stats: false, entities_control: false, entities_device: false };
    }

    set hass(hass) {
      this._hass = hass;
      // pass hass down to all entity pickers already in shadow
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

    // sections definition
    _sections() {
      return [
        {
          key: 'general',
          icon: '⚙️',
          title: 'General',
          fields: [
            { key: 'title',         label: 'Card title', type: 'text',   default: 'Feed the cat' },
            { key: 'icon',          label: 'Icon (emoji or image URL)', type: 'text', default: '🐱',
              note: { type: 'template', text: 'Emoji: just paste the character. Image: provide the full path <code>/config/www/images/your_icon.png</code>. For a 3D effect use a PNG with transparent background — the icon will "float" above the circle.' } },
            { key: 'topic',         label: 'MQTT topic (set)',    type: 'text',   default: 'zigbee2mqtt/Feeder/set' },
            { key: 'max_schedules', label: 'Max schedules',       type: 'number', default: 6 },
            { key: 'vibration_enabled', label: 'Haptic feedback', type: 'checkbox', default: true },
          ]
        },
        {
          key: 'colors',
          icon: '🎨',
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
          icon: '✏️',
          title: 'Labels',
          fields: [
            { key: 'label_schedule',    label: 'Tab "Schedule"',            type: 'text', default: 'Schedule' },
            { key: 'label_feed',        label: 'Tab "Feed now"',            type: 'text', default: 'Feed now' },
            { key: 'label_settings',    label: 'Tab "Settings"',            type: 'text', default: 'Settings' },
            { key: 'label_portions_today', label: 'Stat: Portions today',   type: 'text', default: 'Portions today' },
            { key: 'label_grams_today', label: 'Stat: Grams today',         type: 'text', default: 'Grams today' },
            { key: 'label_per_portion', label: 'Stat: Per portion',         type: 'text', default: 'Per portion' },
          ]
        },
        {
          key: 'entities_schedule',
          icon: '📅',
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
          icon: '📊',
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
          icon: '🎛️',
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
          icon: '🔧',
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
        '.section-icon{font-size:16px;flex-shrink:0;}' +
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
        '.note-icon{flex-shrink:0;font-size:13px;margin-top:1px;}' +
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
        '.help-title-icon{font-size:16px;}' +
        '.help-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;' +
          'border-bottom:1px solid var(--divider-color,rgba(255,255,255,.07));}' +
        '.help-row:last-child{border-bottom:none;padding-bottom:0;}' +
        '.help-row-icon{font-size:18px;flex-shrink:0;width:24px;text-align:center;margin-top:1px;}' +
        '.help-row-body{}' +
        '.help-row-label{font-size:12px;font-weight:600;color:var(--primary-text-color,#fff);margin-bottom:2px;}' +
        '.help-row-desc{font-size:11px;color:var(--secondary-text-color,#888);line-height:1.5;}' +
        'code{font-family:monospace;background:rgba(255,255,255,.1);border-radius:4px;padding:1px 5px;font-size:11px;}';

      // build DOM directly instead of innerHTML to allow proper element creation
      this._shadow.innerHTML = '<style>' + css + helpCss + '</style>';

      // Help block
      var helpEl = document.createElement('div');
      helpEl.className = 'help-block';
      helpEl.innerHTML =
        '<div class="help-title"><span class="help-title-icon">ℹ️</span>How to configure the card</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon">📡</div>' +
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
          '<div class="help-row-icon">🔗</div>' +
          '<div class="help-row-body">' +
            '<div class="help-row-label">Device entity IDs</div>' +
            '<div class="help-row-desc">' +
              'Entity IDs are created automatically by Zigbee2MQTT when the device is added.<br>' +
              'Find them: Settings → Devices & Services → Zigbee2MQTT → your feeder.' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon">🔌</div>' +
          '<div class="help-row-body">' +
            '<div class="help-row-label" style="color:rgba(99,214,140,.9);">Green note — entity already exists</div>' +
            '<div class="help-row-desc">' +
              'Created automatically by Zigbee2MQTT. Nothing to add.' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-row">' +
          '<div class="help-row-icon">📝</div>' +
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
            var icon = f.note.type === 'z2m' ? '🔌' : '📝';
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

  // --- Main card element ---
  class AqaraFeederCard extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._hass = null;
      this._config = {};
      this._built = false;
      this._activeTab = 'schedule';
      this._timer = null;
      this._schedules = null;
    }

    static getConfigElement() {
      return document.createElement('aqara-feeder-card-editor');
    }

    static getStubConfig() {
      return {
        title: 'Feed the cat',
        icon: '🐱',
        topic: 'zigbee2mqtt/Feeder/set',
        max_schedules: 6,
        vibration_enabled: true,
        // labels
        label_schedule:       'Schedule',
        label_feed:           'Feed now',
        label_settings:       'Settings',
        label_portions_today: 'Portions today',
        label_grams_today:    'Grams today',
        label_per_portion:    'Per portion',
        // colors
        color_accent:     'rgb(255,218,120)',
        color_positive:   'rgb(206,245,149)',
        color_danger:     'rgb(255,145,138)',
        color_warning:    'rgb(255,181,129)',
        color_card_bg:    '#111318',
        color_block_bg:   '#1c1f27',
        color_block_bg2:  '#262a35',
        // entities
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
      };
    }

    setConfig(config) {
      var defaults = AqaraFeederCard.getStubConfig();
      this._config = Object.assign({}, defaults, config);
      this._built = false;
      this._schedules = null;
      if (this._hass) this._render();
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._built) { this._render(); return; }
      if (this._timer) return;
      this._timer = setTimeout(function() { this._timer = null; this._updateDynamic(); }.bind(this), 300);
    }

    getCardSize() { return 5; }

    // Helpers that use configurable entity IDs and labels
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
      if (this._schedules === null) {
        var raw = this._state(this._e('entity_schedule'), null);
        if (raw === null || raw === 'unavailable' || raw === 'unknown') {
          return [];
        }
        var actual = this._getActualSchedule();
        if (actual.length > 0) {
          this._schedules = actual.map(function(a) {
            return { hour: a.hour, minute: a.minute, size: a.size };
          });
        } else {
          this._schedules = [{ hour: 8, minute: 0, size: 3 }];
        }
      }
      return this._schedules;
    }

    _pad(n) { return String(Math.round(n)).padStart(2, '0'); }

    _sendSchedule() {
      var schedules = this._getSchedules();
      var payload = {
        schedule: schedules.map(function(s) {
          return { days: 'everyday', hour: Math.round(s.hour), minute: Math.round(s.minute), size: Math.round(s.size) };
        })
      };
      this._hass.callService('mqtt', 'publish', { topic: this._config.topic, payload: JSON.stringify(payload) });
    }

    _feedNow(size) {
      var servingEntity = this._e('entity_serving_size');
      if (servingEntity && this._hass.states[servingEntity]) {
        this._hass.callService('number', 'set_value', { entity_id: servingEntity, value: size });
      }
      this._hass.callService('mqtt', 'publish', { topic: this._config.topic, payload: JSON.stringify({ feed: 'START' }) });
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
      var badges = this._shadow.getElementById('hdr-badges');
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

    _showConfirmation(size, onConfirm) {
      var self = this;
      var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;
      var grams = Math.round(size * portionWeight);

      var existing = this._shadow.querySelector('.popup-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.className = 'popup-overlay';
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

      var popup = document.createElement('div');
      popup.className = 'popup';
      popup.innerHTML =
        '<div class="popup-title">Feed the cat?</div>' +
        '<button class="popup-close" aria-label="Close">✕</button>' +
        '<div style="text-align:center;font-size:13px;color:#969aa6;margin-bottom:20px;">' +
          'Will dispense <strong style="color:#fff;">' + size + ' por.</strong> (~' + grams + 'g)' +
        '</div>' +
        '<button class="popup-save" id="confirm-feed-btn" style="background:rgb(206,245,149);color:#000;">Feed</button>';

      overlay.appendChild(popup);
      this._shadow.querySelector('.card').appendChild(overlay);

      popup.querySelector('.popup-close').addEventListener('click', function() { overlay.remove(); });
      popup.querySelector('#confirm-feed-btn').addEventListener('click', function() {
        overlay.remove();
        onConfirm();
      });
    }

    _vibrate(pattern) {
      // haptic feedback via navigator.vibrate if available
      if (this._config.vibration_enabled !== false && navigator.vibrate) {
        navigator.vibrate(pattern || 10);
      }
    }

    _render() {
      this._built = true;
      var cfg = this._config;
      var Y = cfg.color_accent    || 'rgb(255,218,120)';
      var G = cfg.color_positive  || 'rgb(206,245,149)';
      var R = cfg.color_danger    || 'rgb(255,145,138)';
      var O = cfg.color_warning   || 'rgb(255,181,129)';
      var BG  = cfg.color_card_bg   || '#111318';
      var BG1 = cfg.color_block_bg  || '#1c1f27';
      var BG2 = cfg.color_block_bg2 || '#262a35';

      var css =
        ':host{display:block;font-family:Roboto,sans-serif;}' +
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
        '.badge{padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;}' +
        '.badge-mode{background:' + BG1 + ';color:#969aa6;}' +
        '.badge-error{background:rgba(255,145,138,.2);color:' + R + ';}' +
        '.badge-ok{background:rgba(206,245,149,.15);color:' + G + ';}' +
        '.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 20px 16px;}' +
        '.stat{background:' + BG1 + ';border-radius:16px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;justify-content:space-between;}' +
        '.stat-val{font-size:20px;font-weight:500;color:#fff;line-height:1;}' +
        '.stat-val span{font-size:10px;opacity:.5;}' +
        '.stat-lbl{font-size:9px;color:#636774;text-transform:uppercase;letter-spacing:.4px;text-align:center;}' +
        '.stat-val.empty{opacity:.35;}' +
        '.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 20px 14px;}' +
        '.tab-btn{padding:10px 4px 8px;border:1px solid ' + BG2 + ';border-radius:12px;background:' + BG1 + ';color:#636774;font-size:11px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:5px;}' +
        '.tab-btn.active{background:' + Y + ';color:#000;border-color:' + Y + ';box-shadow:0 4px 12px rgba(255,218,120,.3),0 2px 4px rgba(0,0,0,.4);}' +
        '.tab-btn:not(.active):hover{background:' + BG2 + ';border-color:' + BG2 + ';}' +
        '.tab-icon{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1.5px rgba(255,255,255,.12),0 2px 4px rgba(0,0,0,.5);filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));}' +
        '.tab-icon svg{width:14px;height:14px;fill:none;stroke:#969aa6;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
        '.tab-btn.active .tab-icon{background:rgba(0,0,0,.20);box-shadow:0 0 0 1.5px rgba(0,0,0,.15),0 2px 4px rgba(0,0,0,.3);}' +
        '.tab-btn.active .tab-icon svg{stroke:#000;}' +
        '.tab-label{font-size:10px;font-weight:500;line-height:1;}' +
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
        '.sched-status{font-size:10px;padding:3px 8px;border-radius:20px;font-weight:600;}' +
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
        '.empty-state{text-align:center;padding:32px 16px;color:#535865;}' +
        '.empty-state-icon{font-size:32px;margin-bottom:8px;}' +
        '.empty-state-text{font-size:13px;}' +
        '.feed-section-title{font-size:10px;color:#636774;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;font-weight:600;}' +
        '.quick-btns{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}' +
        '.quick-btn{background:' + BG1 + ';border:1px solid ' + BG2 + ';border-radius:14px;padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;}' +
        '.quick-btn:hover{background:' + BG2 + ';border-color:' + Y + ';}' +
        '.quick-btn.fed{background:rgba(206,245,149,.15);border-color:' + G + ';}' +
        '.quick-btn-val{font-size:22px;font-weight:500;color:#fff;}' +
        '.quick-btn-lbl{font-size:9px;color:#636774;text-transform:uppercase;}' +
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
        '.raw-content{font-size:10px;color:#535865;word-break:break-all;margin-top:8px;}' +
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
        '.popup-save{width:100%;padding:13px;background:' + Y + ';color:#000;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;margin-top:20px;transition:opacity .2s;}' +
        '.popup-save:hover{opacity:.85;}' +
        '';

      var icon = this._config.icon || '';
      var iconHtml;
      if (icon && (icon.startsWith('http') || icon.startsWith('data:'))) {
        iconHtml = '<img src="' + icon + '" alt="">';
      } else if (icon && icon.startsWith('/config/www/')) {
        // convert /config/www/... path to /local/... for Home Assistant
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
      this._shadow.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          self._vibrate(10);
          self._shadow.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          self._activeTab = btn.dataset.tab;
          ['schedule','feed','info'].forEach(function(t) {
            var el = self._shadow.getElementById('tab-' + t);
            if (el) el.style.display = t === self._activeTab ? '' : 'none';
          });
          self._renderTab(self._activeTab);
        });
      });

      this._updateDynamic();
    }

    _updateDynamic() {
      if (!this._hass) return;
      this._renderHeader();
      this._renderStats();
      this._renderTab(this._activeTab);
    }

    _renderHeader() {
      var sub = this._shadow.getElementById('hdr-sub');
      var badges = this._shadow.getElementById('hdr-badges');
      if (!sub || !badges) return;
      var mode = this._state(this._e('entity_mode'), 'unavailable');
      var error = this._state(this._e('entity_error')) === 'on';
      var online = mode !== 'unavailable' && mode !== 'unknown';
      var pretty = this._state(this._e('entity_schedule_pretty'), '');
      var text = pretty || 'No schedule';
      sub.textContent = text;
      sub.title = text;
      var dotHtml = online ? '<div class="online-dot"></div>' : '<div class="offline-dot"></div>';
      badges.innerHTML = error
        ? dotHtml + '<span class="badge badge-error">Error</span>'
        : dotHtml;
    }

    _renderStats() {
      var el = this._shadow.getElementById('stats-row');
      if (!el) return;
      var clean = function(v) { return (v === 'unknown' || v === 'unavailable') ? '-' : v; };
      var portions = clean(this._state(this._e('entity_portions_day'), '-'));
      var grams = clean(this._state(this._e('entity_weight_day'), '-'));
      var weight = clean(this._state(this._e('entity_portion_weight'), '-'));
      var portionsClass = (portions === '0' || portions === '-') ? 'stat-val empty' : 'stat-val';
      var gramsClass = (grams === '0' || grams === '-') ? 'stat-val empty' : 'stat-val';
      el.innerHTML =
        '<div class="stat"><div class="' + portionsClass + '">' + portions + '</div><div class="stat-lbl">' + this._lbl('label_portions_today', 'Portions today') + '</div></div>' +
        '<div class="stat"><div class="' + gramsClass + '">' + grams + '<span>g</span></div><div class="stat-lbl">' + this._lbl('label_grams_today', 'Grams today') + '</div></div>' +
        '<div class="stat"><div class="stat-val">' + weight + '<span>g</span></div><div class="stat-lbl">' + this._lbl('label_per_portion', 'Per portion') + '</div></div>';
    }

    _renderTab(tab) {
      var el = this._shadow.getElementById('tab-' + tab);
      if (!el) return;
      if (tab === 'schedule') this._renderScheduleTab(el);
      else if (tab === 'feed') this._renderFeedTab(el);
      else if (tab === 'info') this._renderInfoTab(el);
    }

    _renderScheduleTab(container) {
      var self = this;
      var now = new Date();
      var nowMin = now.getHours() * 60 + now.getMinutes();
      var schedules = this._getSchedules();
      var maxSchedules = this._config.max_schedules || 6;

      var sensorRaw = this._state(this._e('entity_schedule'), null);
      if (this._schedules === null && (sensorRaw === null || sensorRaw === 'unavailable' || sensorRaw === 'unknown')) {
        container.innerHTML =
          '<div class="empty-state">' +
            '<div class="empty-state-icon">⏳</div>' +
            '<div class="empty-state-text">Loading schedule from feeder...</div>' +
          '</div>';
        return;
      }

      if (schedules.length === 0) {
        container.innerHTML =
          '<div class="empty-state">' +
            '<div class="empty-state-icon">🗓</div>' +
            '<div class="empty-state-text">No feedings scheduled yet.<br>Add one below.</div>' +
          '</div>' +
          '<div class="sched-actions">' +
            '<button class="add-btn" id="add-slot-btn">+ Add feeding</button>' +
            '<button class="apply-btn" id="apply-btn">Send to feeder</button>' +
          '</div>';
        container.querySelector('#add-slot-btn').addEventListener('click', function() {
          self._schedules.push({ hour: 8, minute: 0, size: 3 });
          self._renderTab('schedule');
          setTimeout(function() { self._openEditPopup(0); }, 50);
        });
        container.querySelector('#apply-btn').addEventListener('click', function() {
          self._vibrate([10, 20, 10]);
          self._sendSchedule();
          self._showSent();
        });
        return;
      }

      var sorted = schedules.slice().sort(function(a, b) {
        return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
      });

      var nextIdx = -1;
      var minDiff = Infinity;
      sorted.forEach(function(s, i) {
        var sm = s.hour * 60 + s.minute;
        var diff = sm > nowMin ? sm - nowMin : sm + 1440 - nowMin;
        if (diff < minDiff) { minDiff = diff; nextIdx = i; }
      });

      var html = '<div class="schedule-list" id="sched-list">';
      sorted.forEach(function(s, i) {
        var sm = s.hour * 60 + s.minute;
        var passed = sm <= nowMin;
        var isNext = i === nextIdx;
        var statusClass = passed ? 'done' : isNext ? 'next-s' : 'pending';
        var statusText = passed ? 'Passed' : isNext ? 'Next' : 'Pending';
        var dotClass = passed ? 'passed' : isNext ? 'next-d' : '';
        var timeClass = passed ? 'passed' : '';
        var portionWeight = parseFloat(self._state(self._e('entity_portion_weight'), '5')) || 5;
        var grams = Math.round(s.size * portionWeight);
        var origIdx = schedules.indexOf(s);
        html +=
          '<div class="sched-item" data-slot="' + origIdx + '" title="Tap to edit">' +
            '<div class="sched-dot ' + dotClass + '"></div>' +
            '<div class="sched-time ' + timeClass + '">' + self._pad(s.hour) + ':' + self._pad(s.minute) + '</div>' +
            '<div class="sched-info">' +
              '<div class="sched-portions">' + s.size + ' portions</div>' +
              '<div class="sched-grams">~' + grams + 'g</div>' +
            '</div>' +
            '<span class="sched-status ' + statusClass + '">' + statusText + '</span>' +
            '<span class="sched-edit-hint">✎</span>' +
            '<button class="sched-delete" data-del="' + origIdx + '" title="Remove"><div class="sched-delete-inner">✕</div></button>' +
          '</div>';
      });
      html += '</div>';

      html += '<div class="sched-actions">';
      if (schedules.length < maxSchedules) {
        html += '<button class="add-btn" id="add-slot-btn">+ Add feeding</button>';
      }
      html += '<button class="apply-btn" id="apply-btn">Send to feeder</button>';
      html += '</div>';

      container.innerHTML = html;

      container.querySelectorAll('.sched-item').forEach(function(el) {
        el.addEventListener('click', function(e) {
          if (e.target.classList.contains('sched-delete') || e.target.classList.contains('sched-delete-inner')) return;
          self._vibrate(10);
          self._openEditPopup(parseInt(el.dataset.slot));
        });
      });

      container.querySelectorAll('.sched-delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          self._vibrate(20);
          var idx = parseInt(btn.dataset.del);
          self._schedules.splice(idx, 1);
          self._renderTab('schedule');
        });
      });

      var addBtn = container.querySelector('#add-slot-btn');
      if (addBtn) {
        addBtn.addEventListener('click', function() {
          self._vibrate(10);
          var last = self._schedules[self._schedules.length - 1];
          var newHour = last ? (last.hour + 2) % 24 : 8;
          self._schedules.push({ hour: newHour, minute: 0, size: 3 });
          self._renderTab('schedule');
          setTimeout(function() { self._openEditPopup(self._schedules.length - 1); }, 50);
        });
      }

      var applyBtn = container.querySelector('#apply-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', function() {
          self._sendSchedule();
          self._showSent();
        });
      }
    }

    _openEditPopup(slot) {
      var self = this;
      var existing = this._shadow.querySelector('.popup-overlay');
      if (existing) existing.remove();

      var s = this._schedules[slot];
      if (!s) return;
      var hour = s.hour, minute = s.minute, size = s.size;
      var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;

      var overlay = document.createElement('div');
      overlay.className = 'popup-overlay';
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

      var popup = document.createElement('div');
      popup.className = 'popup';
      popup.innerHTML =
        '<div class="popup-title">Feeding ' + (slot + 1) + '</div>' +
        '<button class="popup-close" aria-label="Close">✕</button>' +
        '<div class="popup-row">' +
          '<div class="popup-row-label">Time</div>' +
          '<div class="time-inputs">' +
            '<input class="num-input" id="p-hour" type="number" min="0" max="23" value="' + Math.round(hour) + '">' +
            '<span class="time-sep">:</span>' +
            '<input class="num-input" id="p-min" type="number" min="0" max="59" value="' + Math.round(minute) + '">' +
          '</div>' +
        '</div>' +
        '<div class="popup-row">' +
          '<div class="popup-row-label">Portions</div>' +
          '<div class="size-stepper">' +
            '<button class="size-step-btn" id="p-minus" aria-label="Decrease">−</button>' +
            '<div><div class="size-val" id="p-size">' + Math.round(size) + '</div><div class="size-sub" id="p-grams">~' + Math.round(size*portionWeight) + 'g</div></div>' +
            '<button class="size-step-btn" id="p-plus" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="popup-save" id="p-save">Save and send</button>';

      overlay.appendChild(popup);
      this._shadow.querySelector('.card').appendChild(overlay);

      var sizeEl = popup.querySelector('#p-size');
      var gramsEl = popup.querySelector('#p-grams');

      popup.querySelector('.popup-close').addEventListener('click', function() { overlay.remove(); });

      popup.querySelector('#p-minus').addEventListener('click', function() {
        self._vibrate(5);
        if (size > 1) { size--; sizeEl.textContent = size; gramsEl.textContent = '~' + Math.round(size*portionWeight) + 'g'; }
      });
      popup.querySelector('#p-plus').addEventListener('click', function() {
        self._vibrate(5);
        if (size < 10) { size++; sizeEl.textContent = size; gramsEl.textContent = '~' + Math.round(size*portionWeight) + 'g'; }
      });

      popup.querySelector('#p-save').addEventListener('click', function() {
        self._vibrate([10, 20, 10]);
        hour = parseInt(popup.querySelector('#p-hour').value, 10);
        minute = parseInt(popup.querySelector('#p-min').value, 10);
        if (isNaN(hour) || hour < 0 || hour > 23) hour = 0;
        if (isNaN(minute) || minute < 0 || minute > 59) minute = 0;

        self._schedules[slot] = { hour: hour, minute: minute, size: size };
        self._sendSchedule();

        overlay.remove();
        self._showSent();
        setTimeout(function() { self._renderTab('schedule'); }, 400);
      });
    }

    _renderFeedTab(container) {
      var self = this;
      var portionWeight = parseFloat(this._state(this._e('entity_portion_weight'), '5')) || 5;
      var customSize = 1;
      var html =
        '<div class="feed-section-title">Quick feed</div>' +
        '<div class="quick-btns">';
      [1,2,3,4,5,6].forEach(function(n) {
        html += '<div class="quick-btn" data-size="' + n + '"><div class="quick-btn-val">' + n + '</div><div class="quick-btn-lbl">~' + Math.round(n*portionWeight) + 'g</div></div>';
      });
      html += '</div>' +
        '<div class="feed-section-title">Custom</div>' +
        '<div class="custom-feed">' +
          '<div class="custom-label">Number of portions</div>' +
          '<div class="stepper">' +
            '<button class="step-btn" id="c-minus" aria-label="Decrease">−</button>' +
            '<div class="step-val" id="c-val">1</div>' +
            '<button class="step-btn" id="c-plus" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="feed-now-btn" id="feed-now-btn">Feed now (1 por. ~' + Math.round(portionWeight) + 'g)</button>';

      container.innerHTML = html;

      var valEl = container.querySelector('#c-val');
      var btn = container.querySelector('#feed-now-btn');

      container.querySelector('#c-minus').addEventListener('click', function() {
        if (customSize > 1) { customSize--; valEl.textContent = customSize; btn.textContent = 'Feed now (' + customSize + ' por. ~' + Math.round(customSize*portionWeight) + 'g)'; }
      });
      container.querySelector('#c-plus').addEventListener('click', function() {
        if (customSize < 10) { customSize++; valEl.textContent = customSize; btn.textContent = 'Feed now (' + customSize + ' por. ~' + Math.round(customSize*portionWeight) + 'g)'; }
      });

      container.querySelectorAll('.quick-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          self._vibrate(15);
          var size = parseInt(b.dataset.size);
          self._showConfirmation(size, function() {
            self._feedNow(size);
            b.classList.add('fed');
            var origHtml = b.innerHTML;
            b.querySelector('.quick-btn-lbl').textContent = '✓ Fed!';
            setTimeout(function() {
              b.classList.remove('fed');
              b.innerHTML = origHtml;
            }, 2000);
          });
        });
      });

      btn.addEventListener('click', function() {
        self._vibrate(15);
        self._showConfirmation(customSize, function() {
          self._feedNow(customSize);
          self._showFeedSuccess(btn);
        });
      });
    }

    _renderInfoTab(container) {
      var self = this;
      var portionWeight = this._state(this._e('entity_portion_weight'), '-');
      var lock = this._state(this._e('entity_child_lock')) === 'on';
      var led = this._state(this._e('entity_led')) === 'on';
      var mode = this._state(this._e('entity_mode'), '-');
      var feedingSize = this._state(this._e('entity_feeding_size'), '-');
      var updateEntity = this._e('entity_update');
      var fw = (this._hass && updateEntity && this._hass.states[updateEntity] && this._hass.states[updateEntity].attributes.installed_version) || '-';
      var actual = this._state(this._e('entity_schedule'), '-');

      var rawOpen = container.querySelector('.raw-details') && container.querySelector('.raw-details').open;

      container.innerHTML =
        '<div class="info-grid">' +
          '<div class="info-row"><div class="info-row-label">Mode</div><div class="info-row-val">' + (mode === 'schedule' ? 'Auto schedule' : 'Manual') + '</div></div>' +
          '<div class="info-row"><div class="info-row-label">Haptic feedback</div><div class="toggle ' + (this._config.vibration_enabled !== false ? 'on' : '') + '" id="toggle-vibration" role="switch" aria-checked="' + (this._config.vibration_enabled !== false) + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">Portion weight</div>' +
            '<div class="info-row-val" style="display:flex;align-items:center;gap:8px;">' +
              '<button class="step-btn" id="pw-minus" style="width:36px;height:36px;font-size:14px;" aria-label="Decrease">−</button>' +
              '<span id="pw-val">' + portionWeight + '</span>g' +
              '<button class="step-btn" id="pw-plus" style="width:36px;height:36px;font-size:14px;" aria-label="Increase">+</button>' +
            '</div></div>' +
          '<div class="info-row"><div class="info-row-label">Last portion size</div><div class="info-row-val">' + feedingSize + ' por.</div></div>' +
          '<div class="info-row"><div class="info-row-label">Child lock</div><div class="toggle ' + (lock?'on':'') + '" id="toggle-lock" role="switch" aria-checked="' + lock + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">Disable LED at night</div><div class="toggle ' + (led?'on':'') + '" id="toggle-led" role="switch" aria-checked="' + led + '"><div class="toggle-thumb"></div></div></div>' +
          '<div class="info-row"><div class="info-row-label">Firmware</div><div class="info-row-val">' + fw + '</div></div>' +
          '<details class="raw-details"' + (rawOpen ? ' open' : '') + '><summary>Feeder schedule (raw)</summary><div class="raw-content">' + actual + '</div></details>' +
        '</div>';

      var pw = parseFloat(portionWeight) || 5;
      var pwEl = container.querySelector('#pw-val');
      var pwEntity = this._e('entity_portion_weight');
      container.querySelector('#pw-minus').addEventListener('click', function() {
        if (pw > 1) { pw--; pwEl.textContent = pw; self._hass.callService('number', 'set_value', { entity_id: pwEntity, value: pw }); }
      });
      container.querySelector('#pw-plus').addEventListener('click', function() {
        if (pw < 20) { pw++; pwEl.textContent = pw; self._hass.callService('number', 'set_value', { entity_id: pwEntity, value: pw }); }
      });

      var vibrationToggle = container.querySelector('#toggle-vibration');
      if (vibrationToggle) {
        vibrationToggle.addEventListener('click', function() {
          var isOn = this.classList.toggle('on');
          this.setAttribute('aria-checked', isOn);
          self._config.vibration_enabled = isOn;
          self._vibrate(isOn ? [10, 20, 10] : null);
        });
      }

      var lockEntity = this._e('entity_child_lock');
      container.querySelector('#toggle-lock').addEventListener('click', function() {
        self._vibrate([10, 20, 10]);
        var isOn = this.classList.toggle('on');
        this.setAttribute('aria-checked', isOn);
        self._hass.callService('switch', isOn ? 'turn_on' : 'turn_off', { entity_id: lockEntity });
      });

      var ledEntity = this._e('entity_led');
      container.querySelector('#toggle-led').addEventListener('click', function() {
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
