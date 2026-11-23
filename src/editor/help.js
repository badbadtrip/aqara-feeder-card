/** Static "How to configure the card" help block shown on top of the editor. */
export const HELP_HTML =
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
