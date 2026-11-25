import { AqaraFeederCardEditor } from './editor/editor.js';
import { AqaraFeederCard } from './card/card.js';

console.info(
  `%c AQARA-FEEDER-CARD %c v${__VERSION__} `,
  'color: white; background: #f5a623; font-weight: bold;',
  'color: #f5a623; background: white; font-weight: bold;'
);

if (!customElements.get('aqara-feeder-card')) {
  customElements.define('aqara-feeder-card-editor', AqaraFeederCardEditor);
  customElements.define('aqara-feeder-card', AqaraFeederCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'aqara-feeder-card', name: 'Кормушка Aqara', description: 'Расписание и ручное кормление через Zigbee2MQTT' });
}
