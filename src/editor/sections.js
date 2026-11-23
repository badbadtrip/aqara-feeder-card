/** Field definitions for the visual config editor, grouped into collapsible sections. */
export function editorSections() {
  return [
    {
      key: 'general',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      title: 'General',
      description: 'Feeder, card identity and feedback',
      fields: [
        { key: 'device_id', label: 'Feeder device', type: 'device', default: '',
          note: { type: 'z2m', text: 'Choose the Aqara feeder once. The card will fill in its Zigbee2MQTT entities and MQTT topic automatically. You can still edit the topic below.' } },
        { key: 'title',         label: 'Card title', type: 'text',   default: 'Feeder' },
        { key: 'icon',          label: 'Icon (emoji or image URL)', type: 'text', default: '🐱',
          note: { type: 'template', text: 'Emoji: just paste the character. Image: provide the full path <code>/config/www/images/your_icon.png</code>. For a 3D effect use a PNG with transparent background — the icon will "float" above the circle.' } },
        { key: 'topic',         label: 'MQTT topic (set)',    type: 'text',   default: 'zigbee2mqtt/Feeder/set' },
        { key: 'max_schedules', label: 'Max schedules',       type: 'number', default: 6 },
        { key: 'quick_feed_default', label: 'Favourite quick portion', type: 'number', default: 0,
          note: { type: 'template', text: 'Portion size highlighted as favourite in the Feed-now grid (accent background + star). Set <code>0</code> to disable.' } },
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
      description: 'Visual theme for the card',
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
      description: 'Words shown on the card',
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
      description: 'Schedule source and fallback text',
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
          label: 'Schedule text (optional)',
          type: 'entity',
          default: '',
          note: { type: 'template', text: 'Optional, not needed. The card reads the schedule above directly. Only used as header text if the feeder schedule is unavailable.' }
        },
      ]
    },
    {
      key: 'entities_stats',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      title: 'Entities — Statistics',
      description: 'Daily portions, weight and latest feeding',
      fields: [
        {
          key: 'entity_portions_day',
          label: 'Portions today',
          type: 'entity',
          default: '',
          note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT when exposed by your feeder. The device picker fills it in; leave it empty only if your device does not provide daily portions.' }
        },
        {
          key: 'entity_weight_day',
          label: 'Grams today',
          type: 'entity',
          default: '',
          note: { type: 'z2m', text: 'Created automatically by Zigbee2MQTT when exposed by your feeder. The device picker fills it in; leave it empty only if your device does not provide daily weight.' }
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
      description: 'Portion size and feeding mode',
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
      description: 'Device switches, errors and firmware',
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
