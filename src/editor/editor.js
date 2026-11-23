import { editorSections } from './sections.js';
import { editorStyles } from './styles.js';
import { HELP_HTML } from './help.js';

/** Visual config editor: <aqara-feeder-card-editor>. */
export class AqaraFeederCardEditor extends HTMLElement {
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
    return editorSections();
  }
  _render() {
    var self = this;
    var cfg = this._config;
    this._shadow.innerHTML = '<style>' + editorStyles() + '</style>';
    var helpEl = document.createElement('div');
    helpEl.className = 'help-block';
    helpEl.innerHTML = HELP_HTML;
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
        var fieldId = 'field-' + section.key + '-' + f.key;
        var isSimpleInput = f.type !== 'color' && f.type !== 'entity' && f.type !== 'checkbox';
        var lbl = document.createElement(isSimpleInput ? 'label' : 'div');
        lbl.className = 'field-label';
        if (isSimpleInput) lbl.htmlFor = fieldId;
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
          swatch.setAttribute('aria-label', f.label + ' color picker');
          var textInput = document.createElement('input');
          textInput.type = 'text';
          textInput.className = 'color-text';
          textInput.value = val || f.default;
          textInput.placeholder = f.default;
          textInput.spellcheck = false;
          textInput.setAttribute('aria-label', f.label + ' hex value');
          var resetBtn = document.createElement('button');
          resetBtn.className = 'color-reset';
          resetBtn.title = 'Reset to default';
          resetBtn.setAttribute('aria-label', 'Reset ' + f.label + ' to default');
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
          var checkboxWrapper = document.createElement('label');
          checkboxWrapper.style.cssText = 'display:flex;align-items:center;gap:10px;cursor:pointer;';
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
          inp.id = fieldId;
          inp.value = val !== undefined ? val : '';
          inp.placeholder = String(f.default);
          inp.addEventListener('change', function() {
            var v = inp.type === 'number' ? parseInt(inp.value, 10) : inp.value.trim();
            if (inp.type === 'number' && isNaN(v)) v = '';
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
