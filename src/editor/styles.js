/** Shadow-DOM CSS for the config editor (base + help block). */
export function editorStyles() {
  var css =
    ':host{display:block;font-family:var(--primary-font-family,Roboto,sans-serif);color:var(--primary-text-color,#fff);}' +
    '*{box-sizing:border-box;}' +
    '.setup-card{display:flex;align-items:center;gap:12px;padding:14px 16px;margin:0 0 16px;border:1px solid var(--divider-color,rgba(255,255,255,.12));border-radius:10px;background:var(--secondary-background-color,rgba(255,255,255,.035));}' +
    '.setup-card.ready{border-color:rgba(99,214,140,.32);background:rgba(99,214,140,.055);}' +
    '.setup-card.partial{border-color:rgba(255,193,64,.32);background:rgba(255,193,64,.05);}' +
    '.setup-mark{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;background:rgba(99,214,140,.14);color:rgb(126,227,160);font-size:14px;font-weight:700;}' +
    '.setup-card.partial .setup-mark,.setup-card.idle .setup-mark{background:rgba(255,255,255,.08);color:var(--secondary-text-color,#9aa0a6);}' +
    '.setup-copy{min-width:0;display:flex;flex:1;flex-direction:column;gap:2px;}' +
    '.setup-copy strong{font-size:13px;font-weight:600;line-height:1.35;}' +
    '.setup-copy span{font-size:12px;line-height:1.45;color:var(--secondary-text-color,#9aa0a6);}' +
    '.setup-copy code{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px;background:transparent;padding:0;color:var(--secondary-text-color,#9aa0a6);}' +
    '.setup-count{font-variant-numeric:tabular-nums;font-size:12px;color:var(--secondary-text-color,#9aa0a6);padding-left:8px;}' +
    '.section{margin-bottom:8px;border:1px solid var(--divider-color,rgba(255,255,255,.12));border-radius:10px;overflow:hidden;background:var(--card-background-color,rgba(255,255,255,.025));}' +
    '.section-header{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;user-select:none;}' +
    '.section-header:hover{background:rgba(255,255,255,.035);}' +
    '.section-icon{flex-shrink:0;display:flex;align-items:center;color:var(--secondary-text-color,#89909a);}' +
    '.section-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;}' +
    '.section-title{font-size:13px;font-weight:600;color:var(--primary-text-color,#fff);}' +
    '.section-description{font-size:11px;line-height:1.4;color:var(--secondary-text-color,#89909a);}' +
    '.section-arrow{font-size:12px;color:var(--secondary-text-color,#888);transition:transform .2s;}' +
    '.section-arrow.open{transform:rotate(180deg);}' +
    '.section-body{padding:4px 14px 14px;display:none;flex-direction:column;gap:0;}' +
    '.section-body.open{display:flex;}' +
    '.section-body>div{padding:13px 0;border-top:1px solid var(--divider-color,rgba(255,255,255,.08));}' +
    '.section-body>div:first-child{border-top:0;}' +
    '.field-head{min-height:18px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;}' +
    '.field-label{display:block;font-size:12px;color:var(--secondary-text-color,#adb3bb);}' +
    '.field-status{flex:0 0 auto;font-size:10px;font-weight:600;line-height:18px;padding:0 7px;border-radius:9px;}' +
    '.field-status.ready{background:rgba(99,214,140,.12);color:rgb(126,227,160);}' +
    '.field-status.missing{background:rgba(255,145,138,.12);color:rgb(255,165,158);}' +
    '.field-status.muted{background:rgba(255,255,255,.06);color:var(--secondary-text-color,#9aa0a6);}' +
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
    '.note{display:flex;align-items:flex-start;gap:7px;margin-top:7px;padding:7px 9px;border-radius:6px;font-size:11px;line-height:1.5;}' +
    '.note.z2m{background:rgba(99,214,140,.08);border-left:3px solid rgba(99,214,140,.5);color:rgba(99,214,140,.9);}' +
    '.note.template{background:rgba(255,193,64,.08);border-left:3px solid rgba(255,193,64,.5);color:rgba(255,193,64,.9);}' +
    '.note-icon{flex-shrink:0;margin-top:1px;display:flex;align-items:center;}' +
    '.note code{background:rgba(255,255,255,.12);border-radius:3px;padding:1px 4px;font-family:monospace;font-size:10px;}' +
    '.color-row{display:flex;align-items:center;gap:8px;}' +
    '.color-swatch{width:36px;height:36px;border-radius:8px;border:1px solid var(--input-ink-color,rgba(255,255,255,.12));cursor:pointer;flex-shrink:0;padding:2px;background:transparent;}' +
    '.color-text{flex:1;padding:8px 10px;background:var(--input-fill-color,rgba(255,255,255,.08));border:1px solid var(--input-ink-color,rgba(255,255,255,.12));border-radius:8px;color:var(--primary-text-color,#fff);font-size:12px;font-family:monospace;outline:none;}' +
    '.color-text:focus{border-color:var(--primary-color,#f5c842);}' +
    '.color-reset{width:36px;height:36px;border-radius:8px;border:none;background:rgba(255,255,255,.06);color:#888;font-size:12px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
    '.color-reset:hover{background:rgba(255,255,255,.12);color:#fff;}' +
    '@media(max-width:420px){.setup-card{padding:12px}.setup-count{display:none}.section-header{padding:12px}.section-body{padding-left:12px;padding-right:12px;}}';
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
