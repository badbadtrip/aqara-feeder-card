/** Shadow-DOM CSS for the card. Colors come from the user config. */
export function cardStyles(cfg) {
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
    '.hdr-title{font-size:15px;font-weight:600;color:#fff;display:flex;align-items:center;gap:6px;}' +
    '.hdr-sub{font-size:11px;color:#8f94a3;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.hdr-badges{display:flex;gap:4px;align-items:center;flex-shrink:0;}' +
    '.hdr-status-dot{flex-shrink:0;}' +
    '.online-dot{width:8px;height:8px;border-radius:50%;background:rgb(206,245,149);box-shadow:0 0 0 0 rgba(206,245,149,.5);animation:pulse 2s infinite;}' +
    '.offline-dot{width:8px;height:8px;border-radius:50%;background:#9ea3b0;}' +
    '@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(206,245,149,.5)}70%{box-shadow:0 0 0 6px rgba(206,245,149,0)}100%{box-shadow:0 0 0 0 rgba(206,245,149,0)}}' +
    '.badge{padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;}' +
    '.badge-mode{background:' + BG1 + ';color:#969aa6;}' +
    '.badge-error{background:rgba(255,145,138,.2);color:' + R + ';}' +
    '.badge-ok{background:rgba(206,245,149,.15);color:' + G + ';}' +
    '.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 20px 16px;}' +
    '.stat{background:' + BG1 + ';border-radius:16px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;justify-content:space-between;}' +
    '.stat-val{font-size:20px;font-weight:500;color:#fff;line-height:1;}' +
    '.stat-val span{font-size:10px;opacity:.5;}' +
    '.stat-lbl{font-size:11px;color:#8f94a3;text-transform:uppercase;letter-spacing:.4px;text-align:center;}' +
    '.stat-val.empty{opacity:.35;}' +
    '.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 20px 14px;}' +
    '.tab-btn{padding:10px 4px 8px;border:1px solid ' + BG2 + ';border-radius:12px;background:' + BG1 + ';color:#8f94a3;font-size:11px;font-weight:500;cursor:pointer;transition:background .2s,border-color .2s,color .2s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:5px;}' +
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
    '.sched-edit-hint{font-size:11px;color:#8f94a3;opacity:0;transition:opacity .15s;flex-shrink:0;}' +
    '.sched-dot{width:10px;height:10px;border-radius:50%;background:' + BG2 + ';flex-shrink:0;transition:background .3s;}' +
    '.sched-dot.passed{background:' + Y + ';}' +
    '.sched-dot.next-d{background:' + G + ';box-shadow:0 0 8px ' + G + ';}' +
    '.sched-time{font-size:22px;font-weight:500;min-width:60px;color:#fff;}' +
    '.sched-time.passed{color:#9ea3b0;}' +
    '.sched-info{flex:1;}' +
    '.sched-portions{font-size:13px;color:#fff;}' +
    '.sched-grams{font-size:10px;color:#8f94a3;margin-top:1px;}' +
    '.sched-status{font-size:11px;padding:3px 8px;border-radius:20px;font-weight:600;}' +
    '.sched-status.done{background:rgba(255,218,120,.1);color:' + Y + ';}' +
    '.sched-status.next-s{background:rgba(206,245,149,.15);color:' + G + ';}' +
    '.sched-status.pending{background:' + BG2 + ';color:#9ea3b0;}' +
    '.sched-delete{width:44px;height:44px;border-radius:50%;background:transparent;border:none;color:#8f94a3;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:color .2s;margin:-8px -8px -8px 0;}' +
    '.sched-delete:hover{color:' + R + ';}' +
    '.sched-delete-inner{width:28px;height:28px;border-radius:50%;background:' + BG2 + ';display:flex;align-items:center;justify-content:center;pointer-events:none;transition:background .2s;}' +
    '.sched-delete:hover .sched-delete-inner{background:rgba(255,145,138,.2);}' +
    '.sched-actions{display:flex;gap:8px;margin-top:10px;}' +
    '.add-btn{flex:1;padding:11px;background:' + BG1 + ';border:1px dashed ' + BG2 + ';border-radius:14px;color:#8f94a3;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;}' +
    '.add-btn:hover{background:' + BG2 + ';border-color:' + Y + ';color:' + Y + ';}' +
    '.apply-btn{flex:2;padding:11px;background:' + Y + ';color:#000;border:none;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s;}' +
    '.apply-btn:hover{opacity:.85;}' +
    '.empty-state{text-align:center;padding:40px 16px;}' +
    '.empty-state.loading{padding:48px 16px;}' +
    '.empty-state-icon{margin-bottom:8px;display:flex;justify-content:center;}' +
    '.empty-state-text{font-size:13px;color:#8f94a3;line-height:1.5;}' +
    '.empty-state.loading .empty-state-text{font-size:12px;color:#8f94a3;}' +
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
    '.feed-section-title{font-size:10px;color:#8f94a3;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;font-weight:600;}' +
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
    '.quick-btn-lbl{font-size:10px;color:#8f94a3;text-transform:uppercase;letter-spacing:.3px;margin-top:2px;}' +
    '.quick-btn.favourite{background:linear-gradient(155deg,rgba(255,218,120,.18),' + BG1 + ' 80%);border-color:rgba(255,218,120,.5);box-shadow:0 0 0 1px rgba(255,218,120,.15),0 6px 14px rgba(0,0,0,.3);}' +
    '.quick-btn.favourite .quick-btn-val{color:' + Y + ';}' +
    '.quick-btn.favourite:hover{border-color:' + Y + ';background:linear-gradient(155deg,rgba(255,218,120,.28),' + BG2 + ' 80%);}' +
    '.quick-fav{position:absolute;top:6px;right:6px;color:' + Y + ';display:flex;align-items:center;justify-content:center;}' +
    '.quick-last-dot{position:absolute;top:8px;left:8px;width:6px;height:6px;border-radius:50%;background:' + G + ';box-shadow:0 0 0 2px ' + BG1 + ',0 0 6px ' + G + ';}' +
    '.quick-btn.favourite .quick-last-dot{box-shadow:0 0 0 2px rgba(255,218,120,.15),0 0 6px ' + G + ';}' +
    '.quick-btn.last-used:not(.favourite){border-color:rgba(206,245,149,.4);}' +
    '.quick-fed-mark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:' + G + ';color:#000;font-weight:700;font-size:12px;border-radius:13px;opacity:0;pointer-events:none;transform:scale(.85);transition:opacity .15s,transform .15s;}' +
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
    '.info-row-label{font-size:12px;color:#8f94a3;}' +
    '.info-row-val{font-size:12px;color:#fff;font-weight:500;text-align:right;}' +
    '.toggle{width:36px;height:20px;border-radius:10px;background:' + BG2 + ';position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}' +
    '.toggle::before{content:"";position:absolute;top:-12px;bottom:-12px;left:-4px;right:-4px;}' +
    '.toggle.on{background:' + G + ';}' +
    '.toggle-thumb{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:left .2s;}' +
    '.toggle.on .toggle-thumb{left:18px;}' +
    '.raw-details{background:' + BG1 + ';border-radius:14px;padding:12px 14px;}' +
    '.raw-details summary{font-size:12px;color:#8f94a3;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;}' +
    '.raw-details summary::-webkit-details-marker{display:none;}' +
    '.raw-details summary::after{content:"▸";transition:transform .2s;}' +
    '.raw-details[open] summary::after{content:"▾";}' +
    '.raw-content{font-size:11px;color:#9ea3b0;word-break:break-all;margin-top:8px;}' +
    '.popup-overlay{position:absolute;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10;}' +
    '.popup{background:' + BG1 + ';border-radius:20px;padding:24px 20px 20px;width:calc(100% - 40px);max-width:320px;position:relative;animation:popIn .2s ease;}' +
    '@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}' +
    '.popup-title{font-size:14px;font-weight:600;color:#fff;margin-bottom:20px;text-align:center;}' +
    '.popup-close{position:absolute;top:14px;right:14px;width:44px;height:44px;border-radius:50%;border:none;background:' + BG2 + ';color:#969aa6;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
    '.popup-row{margin-bottom:16px;}' +
    '.popup-row-label{font-size:10px;color:#8f94a3;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;font-weight:600;}' +
    '.time-inputs{display:flex;gap:8px;align-items:center;}' +
    '.time-sep{color:#8f94a3;font-size:20px;}' +
    '.num-input{flex:1;background:' + BG2 + ';border:1px solid ' + BG2 + ';border-radius:12px;color:#fff;font-size:24px;font-weight:500;text-align:center;padding:10px 6px;outline:none;-moz-appearance:textfield;}' +
    '.num-input::-webkit-inner-spin-button{display:none;}' +
    '.num-input:focus{border-color:' + Y + ';}' +
    '.size-stepper{display:flex;align-items:center;justify-content:center;gap:16px;}' +
    '.size-step-btn{width:44px;height:44px;border-radius:50%;background:' + BG2 + ';border:1px solid ' + BG2 + ';color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}' +
    '.size-step-btn:hover{background:' + BG2 + ';filter:brightness(1.3);border-color:' + Y + ';}' +
    '.size-val{font-size:32px;font-weight:500;min-width:48px;text-align:center;color:#fff;}' +
    '.size-sub{font-size:11px;color:#8f94a3;text-align:center;margin-top:4px;}' +
    '.popup-save{flex:2;padding:13px;background:' + Y + ';color:#000;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .2s;}' +
    '.popup-save:hover{opacity:.85;}' +
    '.popup-actions{display:flex;gap:8px;margin-top:20px;}' +
    '.popup-cancel{flex:1;padding:13px;background:' + BG2 + ';color:#fff;border:none;border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .2s,background .2s;}' +
    '.popup-cancel:hover{background:#373c4a;}' +
    '.mode-warn{display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:12px 14px;border-radius:16px;background:rgba(255,181,129,.12);border:1px solid rgba(255,181,129,.45);}' +
    '.mode-warn-text{flex:1;font-size:12px;line-height:1.45;color:#d6d9e0;}' +
    '.mode-warn-text strong{display:block;font-size:13px;color:' + O + ';margin-bottom:2px;}' +
    '.mode-warn-btn{flex-shrink:0;min-height:44px;padding:0 16px;border:none;border-radius:12px;background:' + O + ';color:#000;font-size:13px;font-weight:700;cursor:pointer;}' +
    '.mode-warn-btn:disabled{opacity:.6;cursor:default;}' +
    '.mode-warn-btn:focus-visible{outline:2px solid ' + Y + ';outline-offset:2px;}' +
    '.popup-warn{margin-top:8px;padding:6px 10px;border-radius:8px;background:rgba(255,145,138,.12);color:' + R + ';font-size:11px;line-height:1.4;}' +
    '.num-input.invalid{border-color:' + R + ';background:rgba(255,145,138,.08);}' +
    '.badge-pending{background:rgba(255,218,120,.18);color:' + Y + ';animation:badgePulse 1.6s ease-in-out infinite;}' +
    '@keyframes badgePulse{0%,100%{opacity:.7}50%{opacity:1}}' +
    '.apply-btn.pulse{animation:applyPulse 1.6s ease-in-out infinite;}' +
    '@keyframes applyPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,218,120,.5)}50%{box-shadow:0 0 0 6px rgba(255,218,120,0)}}' +
    '.add-btn.warn{flex:0 0 auto;padding:11px 13px;display:flex;align-items:center;justify-content:center;color:' + O + ';border-color:' + O + ';}' +
    '.add-btn.warn:hover{background:rgba(255,181,129,.12);}' +
    '.sched-skeleton{display:flex;align-items:center;gap:12px;background:' + BG1 + ';border-radius:16px;padding:12px 14px;overflow:hidden;}' +
    '.skel-dot,.skel-time,.skel-line,.skel-status{background:linear-gradient(90deg,' + BG2 + ' 0%,#3a3f4d 50%,' + BG2 + ' 100%);background-size:200% 100%;animation:skelShimmer 1.4s ease-in-out infinite;border-radius:6px;}' +
    '.skel-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}' +
    '.skel-time{width:60px;height:24px;}' +
    '.skel-info{flex:1;display:flex;flex-direction:column;gap:6px;}' +
    '.skel-line-1{height:12px;width:60%;}' +
    '.skel-line-2{height:10px;width:35%;}' +
    '.skel-status{width:54px;height:18px;border-radius:20px;}' +
    '.skel-hint{text-align:center;font-size:11px;color:#8f94a3;margin-top:10px;}' +
    '@keyframes skelShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}' +
    '.food-bar{margin:0 20px 12px;padding:10px 14px;background:' + BG1 + ';border-radius:14px;display:flex;align-items:center;gap:10px;}' +
    '.food-bar-label{font-size:11px;color:#8f94a3;text-transform:uppercase;letter-spacing:.4px;flex-shrink:0;}' +
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
    '.step-btn:disabled,.size-step-btn:disabled{opacity:.3;cursor:not-allowed;}' +
    '.tab-btn:active,.add-btn:active,.apply-btn:active,.feed-now-btn:active,.popup-save:active,' +
    '.popup-cancel:active,.size-step-btn:not(:disabled):active,.step-btn:not(:disabled):active,' +
    '.seg-btn:active,.sched-delete:active{transform:scale(.96);}' +
    '.tab-btn:focus-visible,.quick-btn:focus-visible,.step-btn:focus-visible,.size-step-btn:focus-visible,' +
    '.sched-delete:focus-visible,.add-btn:focus-visible,.apply-btn:focus-visible,' +
    '.feed-now-btn:focus-visible,.popup-close:focus-visible,.popup-save:focus-visible,.popup-cancel:focus-visible,' +
    '.seg-btn:focus-visible,.snackbar-action:focus-visible,.toggle:focus-visible,.sched-item:focus-visible,' +
    '.color-reset:focus-visible{outline:2px solid ' + Y + ';outline-offset:2px;}' +
    '@media(prefers-reduced-motion:reduce){' +
      '.online-dot,.loading-ring,.loading-dot,.skel-dot,.skel-time,.skel-line,.skel-status,.apply-btn.pulse,.badge-pending{animation:none!important;}' +
      '.tab-pane{animation:none!important;}' +
      '.popup{animation:none!important;}' +
      '.snackbar{animation:none!important;}' +
    '}';
  return css;
}
