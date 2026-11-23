/** Shadow-DOM CSS for the config editor (base + help block). */
export function editorStyles() {
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
    '.field-label{display:block;font-size:12px;color:var(--secondary-text-color,#888);margin-bottom:4px;}' +
    'ha-entity-picker{display:block;}' +
    '.device-select{width:100%;padding:9px 10px;background:var(--input-fill-color,rgba(255,255,255,.08));' +
      'border:1px solid var(--input-ink-color,rgba(255,255,255,.12));border-radius:8px;' +
      'color:var(--primary-text-color,#fff);font-size:13px;}' +
    '.device-select option{background:var(--card-background-color,#202127);color:var(--primary-text-color,#fff);}' +
    '.device-status{font-size:11px;line-height:1.45;color:var(--secondary-text-color,#888);margin-top:5px;}' +
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
    '.color-reset{width:36px;height:36px;border-radius:8px;border:none;background:rgba(255,255,255,.06);color:#888;font-size:12px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
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
  return css + helpCss;
}
