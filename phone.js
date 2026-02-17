/* =====================================================
   ExiWin 12 — PHONE INTERFACE MODULE
   ===================================================== */

(function () {
  const deviceCSS = `
  #device-select-overlay{position:fixed;inset:0;z-index:9995;background:radial-gradient(ellipse at 30% 40%, #061428 0%, #020810 100%);display:none;align-items:center;justify-content:center;flex-direction:column;gap:0;}
  .ds-title{font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:48px;}
  .ds-cards{display:flex;gap:40px;align-items:flex-end;}
  .ds-card{display:flex;flex-direction:column;align-items:center;gap:18px;cursor:pointer;padding:32px 28px;border-radius:24px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);transition:all .22s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden;}
  .ds-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(0,120,212,.18) 0%,transparent 70%);opacity:0;transition:opacity .22s;}
  .ds-card:hover{border-color:rgba(0,120,212,.5);background:rgba(0,120,212,.08);transform:translateY(-6px) scale(1.02);box-shadow:0 24px 60px rgba(0,100,200,.25);}
  .ds-card:hover::before{opacity:1;}
  .ds-card-icon{font-size:64px;filter:drop-shadow(0 8px 24px rgba(0,0,0,.6));}
  .ds-card-name{font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;font-weight:500;color:rgba(255,255,255,.85);letter-spacing:.5px;}
  .ds-card-desc{font-size:11px;color:rgba(255,255,255,.35);text-align:center;max-width:130px;line-height:1.5;}
  .ds-badge{position:absolute;top:12px;right:12px;background:var(--accent,#0078d4);color:#fff;font-size:9px;padding:2px 7px;border-radius:10px;letter-spacing:.5px;font-weight:600;}
  #phone-shell{position:fixed;inset:0;z-index:9996;background:#000;display:none;align-items:center;justify-content:center;}
  .phone-device{width:390px;height:844px;max-height:98vh;background:#0a0a0f;border-radius:54px;box-shadow:0 0 0 2px #1a1a2e,0 0 0 4px #252540,0 40px 120px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.06);position:relative;overflow:hidden;display:flex;flex-direction:column;font-family:-apple-system,'SF Pro Display','Segoe UI',sans-serif;}
  .phone-island{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:120px;height:36px;background:#000;border-radius:20px;z-index:100;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .3s cubic-bezier(.34,1.2,.64,1);cursor:pointer;}
  .phone-island:hover{width:200px;background:#111;}
  .phone-island-cam{width:10px;height:10px;border-radius:50%;background:#1a1a1a;border:1.5px solid #333;}
  .phone-statusbar{height:54px;padding:14px 28px 0;display:flex;align-items:center;justify-content:space-between;z-index:50;flex-shrink:0;}
  .phone-time{font-size:15px;font-weight:600;color:#fff;letter-spacing:-.3px;}
  .phone-status-icons{display:flex;align-items:center;gap:5px;}
  .phone-sig{font-size:11px;color:#fff;letter-spacing:-1px;}
  .phone-bat{width:25px;height:12px;border:1.5px solid rgba(255,255,255,.6);border-radius:3px;position:relative;display:flex;align-items:center;padding:1px;}
  .phone-bat::after{content:'';position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:2.5px;height:5px;background:rgba(255,255,255,.6);border-radius:0 1px 1px 0;}
  .phone-bat-fill{height:100%;background:#4cd964;border-radius:1.5px;width:75%;}
  #phone-lock{position:absolute;inset:0;z-index:40;background:linear-gradient(170deg,#080e1f 0%,#0d1528 50%,#06090f 100%);display:flex;flex-direction:column;align-items:center;transition:transform .4s cubic-bezier(.4,0,.2,1),opacity .4s;}
  .phone-lock-blur-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
  .phone-lock-orb{position:absolute;border-radius:50%;filter:blur(80px);animation:orbFloat 8s ease-in-out infinite;}
  @keyframes orbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,-20px)}}
  .phone-lock-time{font-size:72px;font-weight:200;color:#fff;letter-spacing:-2px;margin-top:90px;text-align:center;line-height:1;text-shadow:0 0 60px rgba(0,120,212,.3);}
  .phone-lock-date{font-size:16px;color:rgba(255,255,255,.6);margin-top:8px;font-weight:400;letter-spacing:.3px;}
  .phone-lock-notifs{margin-top:32px;width:340px;display:flex;flex-direction:column;gap:8px;}
  .phone-lock-notif{background:rgba(255,255,255,.1);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;}
  .phone-lock-notif .ico{font-size:20px;}
  .phone-lock-notif .txt .app{font-size:10px;color:rgba(255,255,255,.5);margin-bottom:1px;}
  .phone-lock-notif .txt .msg{font-size:12px;color:#fff;}
  .phone-swipe-hint{position:absolute;bottom:28px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:6px;animation:swipeHintAnim 2s ease-in-out infinite;}
  @keyframes swipeHintAnim{0%,100%{opacity:.5;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}
  .phone-swipe-line{width:134px;height:5px;background:rgba(255,255,255,.3);border-radius:3px;}
  .phone-swipe-text{font-size:11px;color:rgba(255,255,255,.4);}
  #phone-home{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;background:linear-gradient(160deg,#060d1f 0%,#091422 50%,#060b18 100%);transform:translateY(0);transition:transform .35s cubic-bezier(.4,0,.2,1);}
  .phone-wallpaper-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
  .phone-wp-orb{position:absolute;border-radius:50%;filter:blur(70px);animation:orbFloat2 10s ease-in-out infinite;}
  @keyframes orbFloat2{0%,100%{transform:scale(1)}50%{transform:scale(1.08) translate(-5px,10px)}}
  .phone-home-content{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;z-index:10;}
  .phone-widget-row{padding:20px 16px 8px;}
  .phone-clock-widget{background:rgba(255,255,255,.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
  .phone-clock-widget .time{font-size:38px;font-weight:200;color:#fff;letter-spacing:-1px;}
  .phone-clock-widget .date{font-size:11px;color:rgba(255,255,255,.55);margin-top:2px;}
  .phone-clock-widget .weather{text-align:right;}
  .phone-clock-widget .weather .temp{font-size:28px;font-weight:200;color:#fff;}
  .phone-clock-widget .weather .cond{font-size:10px;color:rgba(255,255,255,.5);}
  .phone-pages-dots{display:flex;justify-content:center;gap:5px;margin:6px 0 2px;}
  .phone-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);}
  .phone-dot.active{background:rgba(255,255,255,.85);width:18px;border-radius:3px;}
  .phone-app-grid{flex:1;padding:8px 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:0;align-content:start;overflow:hidden;}
  .phone-app{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 4px 8px;cursor:pointer;border-radius:16px;transition:all .15s;-webkit-tap-highlight-color:transparent;}
  .phone-app:active{transform:scale(.9);}
  .phone-app-ico{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;position:relative;box-shadow:0 4px 16px rgba(0,0,0,.4);overflow:hidden;}
  .phone-app-ico::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 60%);pointer-events:none;}
  .phone-app-name{font-size:10.5px;color:rgba(255,255,255,.85);text-align:center;line-height:1.2;}
  .phone-app-badge{position:absolute;top:-2px;right:-2px;background:#e74c3c;color:#fff;font-size:9px;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;font-weight:700;border:1.5px solid #0a0a0f;}
  .phone-dock{background:rgba(255,255,255,.1);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,.15);border-radius:30px;margin:0 16px 8px;padding:10px 12px;display:flex;justify-content:space-around;align-items:center;position:relative;z-index:10;}
  .phone-home-indicator{height:34px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:10;}
  .phone-home-bar{width:134px;height:5px;background:rgba(255,255,255,.3);border-radius:3px;cursor:pointer;transition:background .2s;}
  .phone-home-bar:active{background:rgba(255,255,255,.5);}
  #phone-shade{position:absolute;top:0;left:0;right:0;z-index:30;background:rgba(8,12,20,.92);backdrop-filter:blur(40px);border-radius:0 0 32px 32px;padding:60px 16px 20px;transform:translateY(-100%);transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:0 20px 60px rgba(0,0,0,.6);}
  #phone-shade.open{transform:translateY(0);}
  .phone-shade-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
  .phone-shade-tile{background:rgba(255,255,255,.1);border-radius:14px;padding:10px 6px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:background .15s;}
  .phone-shade-tile.on{background:rgba(0,120,212,.4);}
  .phone-shade-tile:active{transform:scale(.95);}
  .phone-shade-tile .ico{font-size:16px;}
  .phone-shade-tile .lbl{font-size:9px;color:rgba(255,255,255,.6);}
  .phone-shade-sliders{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
  .phone-shade-sl{display:flex;align-items:center;gap:10px;}
  .phone-shade-sl .ico{font-size:14px;flex-shrink:0;}
  .phone-shade-sl input{flex:1;accent-color:#0078d4;height:4px;-webkit-appearance:none;}
  .phone-notif-list{display:flex;flex-direction:column;gap:6px;}
  .phone-shade-notif{background:rgba(255,255,255,.07);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;}
  #phone-app-container{position:absolute;inset:0;z-index:25;pointer-events:none;}
  .phone-app-win{position:absolute;inset:0;background:linear-gradient(160deg,#06101e 0%,#08121e 100%);display:flex;flex-direction:column;transform:translateY(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);pointer-events:all;}
  .phone-app-win.open{transform:translateY(0);}
  .phone-win-header{height:54px;padding:0 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
  .phone-win-back{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:background .15s;}
  .phone-win-back:active{background:rgba(255,255,255,.15);}
  .phone-win-title{flex:1;font-size:15px;font-weight:600;color:#fff;}
  .phone-win-body{flex:1;overflow:hidden;display:flex;flex-direction:column;}
  .dialpad{padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px;}
  .dial-display{background:rgba(255,255,255,.06);border-radius:16px;padding:16px 20px;text-align:center;width:100%;min-height:64px;display:flex;align-items:center;justify-content:center;}
  .dial-number{font-size:28px;font-weight:200;color:#fff;letter-spacing:4px;min-height:36px;}
  .dial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;}
  .dial-key{background:rgba(255,255,255,.08);border-radius:50%;width:72px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;margin:0 auto;}
  .dial-key:active{background:rgba(255,255,255,.2);transform:scale(.92);}
  .dial-key .num{font-size:22px;font-weight:300;color:#fff;}
  .dial-key .letters{font-size:8px;color:rgba(255,255,255,.4);letter-spacing:1px;}
  .dial-call-btn{background:linear-gradient(135deg,#27ae60,#2ecc71);width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;box-shadow:0 8px 24px rgba(46,204,113,.4);transition:all .15s;}
  .dial-call-btn:active{transform:scale(.92);}
  .msg-list{flex:1;overflow-y:auto;padding:8px;}
  .msg-thread{display:flex;align-items:center;gap:12px;padding:12px 8px;border-radius:14px;cursor:pointer;transition:background .12s;}
  .msg-thread:active{background:rgba(255,255,255,.07);}
  .msg-avatar{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
  .msg-thread-info{flex:1;min-width:0;}
  .msg-thread-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}
  .msg-thread-name{font-size:14px;font-weight:500;color:#fff;}
  .msg-thread-time{font-size:11px;color:rgba(255,255,255,.4);}
  .msg-thread-preview{font-size:12px;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .msg-unread-badge{background:#0078d4;color:#fff;font-size:10px;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;font-weight:700;}
  .camera-view{flex:1;background:linear-gradient(135deg,#0a0a14 0%,#141428 100%);position:relative;display:flex;align-items:center;justify-content:center;font-size:80px;overflow:hidden;}
  .camera-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:33.33% 33.33%;}
  .camera-focus{position:absolute;width:80px;height:80px;border:2px solid #f1c40f;animation:focusPulse 2s ease-in-out infinite;}
  .camera-focus::before,.camera-focus::after{content:'';position:absolute;width:12px;height:12px;border-color:#f1c40f;border-style:solid;}
  .camera-focus::before{top:-2px;left:-2px;border-width:2px 0 0 2px;}
  .camera-focus::after{bottom:-2px;right:-2px;border-width:0 2px 2px 0;}
  @keyframes focusPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.05)}}
  .camera-controls{height:120px;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:space-around;padding:0 20px;flex-shrink:0;}
  .cam-thumb{width:50px;height:50px;border-radius:12px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:22px;}
  .cam-shutter{width:70px;height:70px;border-radius:50%;border:4px solid #fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;position:relative;}
  .cam-shutter::after{content:'';width:52px;height:52px;border-radius:50%;background:#fff;transition:all .15s;}
  .cam-shutter:active::after{width:44px;height:44px;}
  .cam-flip{width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;transition:all .15s;}
  .cam-flip:active{transform:rotate(180deg);}
  .notes-list{flex:1;overflow-y:auto;padding:8px;}
  .note-item{background:rgba(255,255,255,.06);border-radius:14px;padding:14px;margin-bottom:8px;cursor:pointer;transition:background .12s;}
  .note-item:active{background:rgba(255,255,255,.1);}
  .note-item .title{font-size:14px;font-weight:500;color:#fff;margin-bottom:4px;}
  .note-item .preview{font-size:12px;color:rgba(255,255,255,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .note-item .date{font-size:10px;color:rgba(255,255,255,.3);margin-top:6px;}
  .note-editor{flex:1;display:flex;flex-direction:column;padding:16px;gap:10px;}
  .note-editor textarea{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;color:#fff;font-size:14px;font-family:inherit;resize:none;outline:none;line-height:1.7;user-select:text;}
  .note-editor textarea::placeholder{color:rgba(255,255,255,.3);}
  .phone-settings-list{flex:1;overflow-y:auto;padding:12px;}
  .phone-settings-section{margin-bottom:8px;}
  .phone-settings-header{font-size:12px;color:rgba(255,255,255,.4);padding:6px 12px;letter-spacing:.5px;text-transform:uppercase;}
  .phone-settings-card{background:rgba(255,255,255,.07);border-radius:14px;overflow:hidden;margin-bottom:2px;}
  .phone-setting-row{display:flex;align-items:center;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .12s;}
  .phone-setting-row:last-child{border:none;}
  .phone-setting-row:active{background:rgba(255,255,255,.08);}
  .phone-setting-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-right:12px;flex-shrink:0;}
  .phone-setting-text{flex:1;}
  .phone-setting-text .n{font-size:13px;color:#fff;}
  .phone-setting-text .d{font-size:11px;color:rgba(255,255,255,.4);margin-top:1px;}
  .phone-toggle{width:44px;height:24px;border-radius:12px;background:rgba(255,255,255,.15);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}
  .phone-toggle.on{background:#34c759;}
  .phone-toggle::after{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.3);}
  .phone-toggle.on::after{transform:translateX(20px);}
  .music-player{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px 16px;gap:16px;}
  .music-album{width:220px;height:220px;border-radius:24px;background:linear-gradient(135deg,#1a0535,#0d1f5c,#071428);display:flex;align-items:center;justify-content:center;font-size:80px;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:albumFloat 4s ease-in-out infinite;}
  @keyframes albumFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .music-info{text-align:center;}
  .music-info .track{font-size:18px;font-weight:600;color:#fff;}
  .music-info .artist{font-size:13px;color:rgba(255,255,255,.5);margin-top:3px;}
  .music-progress{width:100%;}
  .music-progress-bar{height:4px;background:rgba(255,255,255,.15);border-radius:2px;position:relative;cursor:pointer;margin-bottom:6px;}
  .music-progress-fill{height:100%;background:linear-gradient(90deg,#0078d4,#60cdff);border-radius:2px;width:35%;transition:width .5s;}
  .music-times{display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.4);}
  .music-controls{display:flex;align-items:center;justify-content:center;gap:28px;}
  .music-ctrl{font-size:22px;cursor:pointer;color:rgba(255,255,255,.7);transition:all .15s;}
  .music-ctrl:active{transform:scale(.85);}
  .music-ctrl.main{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#0078d4,#60cdff);display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;box-shadow:0 8px 28px rgba(0,120,212,.5);}
  .gallery-grid{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;overflow-y:auto;padding:2px;align-content:start;}
  .gallery-item{aspect-ratio:1;border-radius:4px;overflow:hidden;cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;transition:transform .15s;}
  .gallery-item:active{transform:scale(.95);}
  .phone-browser-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;}
  .phone-browser-input{flex:1;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:8px 14px;color:#fff;font-size:12px;outline:none;font-family:inherit;user-select:text;}
  .phone-browser-go{width:34px;height:34px;border-radius:10px;background:rgba(0,120,212,.6);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;}
  .phone-browser-frame{flex:1;width:100%;border:none;background:#fff;}
  .phone-exit-btn{position:absolute;top:18px;right:18px;z-index:200;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;color:rgba(255,255,255,.6);transition:background .15s;}
  .phone-exit-btn:hover{background:rgba(220,50,50,.5);color:#fff;}
  @keyframes phoneShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-1deg)}75%{transform:rotate(1deg)}}
  `;

  const style = document.createElement('style');
  style.textContent = deviceCSS;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
  <div id="device-select-overlay">
    <div class="ds-title">Выберите устройство</div>
    <div class="ds-cards">
      <div class="ds-card" onclick="PhoneModule.selectDevice('computer')">
        <div class="ds-badge">ПК</div>
        <div class="ds-card-icon">🖥️</div>
        <div class="ds-card-name">Компьютер</div>
        <div class="ds-card-desc">Рабочий стол ExiWin 12 с полным интерфейсом</div>
      </div>
      <div class="ds-card" onclick="PhoneModule.selectDevice('phone')">
        <div class="ds-card-icon">📱</div>
        <div class="ds-card-name">Телефон</div>
        <div class="ds-card-desc">Мобильный интерфейс ExiWin Mobile 12</div>
      </div>
    </div>
  </div>`);

  // Build phone HTML
  const dialKeys = [['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];
  const msgThreads = [['🧑','Алекс','Привет! Как дела?','2 мин',2],['👩','Мария','Спасибо за помощь!','14:30',0],['🤖','Exian.AI','Готов помочь','сейчас',1],['👨‍💻','Дима','Код работает, спасибо','вчера',0],['🎮','Игровой чат','Играем сегодня?','вчера',3]];

  document.body.insertAdjacentHTML('beforeend', `
  <div id="phone-shell">
    <div class="phone-device" id="phone-device">
      <div class="phone-exit-btn" onclick="PhoneModule.exitPhone()" title="Сменить устройство">⎋</div>
      <div class="phone-island"><div class="phone-island-cam"></div></div>
      <div id="phone-lock">
        <div class="phone-lock-blur-bg">
          <div class="phone-lock-orb" style="width:300px;height:300px;background:rgba(0,80,200,.18);top:5%;left:-20%;"></div>
          <div class="phone-lock-orb" style="width:250px;height:250px;background:rgba(80,0,200,.1);bottom:20%;right:-10%;animation-delay:-4s"></div>
        </div>
        <div class="phone-statusbar" style="position:relative;z-index:5;width:100%;">
          <span class="phone-time" id="phone-lock-time">12:00</span>
          <div class="phone-status-icons"><span class="phone-sig">●●●</span><span style="font-size:11px;color:#fff;margin-left:2px;">5G</span><div class="phone-bat"><div class="phone-bat-fill"></div></div></div>
        </div>
        <div class="phone-lock-time" id="phone-lock-bigtime">12:00</div>
        <div class="phone-lock-date" id="phone-lock-date">Вторник, 17 февраля</div>
        <div class="phone-lock-notifs">
          <div class="phone-lock-notif"><div class="ico">🤖</div><div class="txt"><div class="app">Exian.AI</div><div class="msg">Готов помочь вам сегодня!</div></div></div>
          <div class="phone-lock-notif"><div class="ico">📱</div><div class="txt"><div class="app">ExiWin Mobile</div><div class="msg">Добро пожаловать в ExiWin 12</div></div></div>
        </div>
        <div class="phone-swipe-hint"><div class="phone-swipe-line"></div><div class="phone-swipe-text">Проведите вверх для разблокировки</div></div>
      </div>
      <div id="phone-home">
        <div class="phone-wallpaper-layer">
          <div class="phone-wp-orb" style="width:280px;height:280px;background:rgba(0,90,200,.12);top:-60px;left:-80px;"></div>
          <div class="phone-wp-orb" style="width:200px;height:200px;background:rgba(80,0,180,.08);bottom:30%;right:-60px;animation-delay:-5s"></div>
        </div>
        <div class="phone-statusbar" style="position:relative;z-index:10;">
          <span class="phone-time" id="phone-home-time">12:00</span>
          <div class="phone-status-icons"><span class="phone-sig">●●●</span><span style="font-size:11px;color:#fff;margin-left:2px;">5G</span><div class="phone-bat"><div class="phone-bat-fill" style="width:75%"></div></div></div>
        </div>
        <div id="phone-shade-drag" style="position:absolute;top:54px;left:0;right:0;height:20px;z-index:30;cursor:grab;"></div>
        <div class="phone-home-content">
          <div class="phone-widget-row">
            <div class="phone-clock-widget">
              <div><div class="time" id="widget-time">12:00</div><div class="date" id="widget-date">Вт, 17 февраля</div></div>
              <div class="weather"><div class="temp">-3°</div><div class="cond">☁️ Облачно</div></div>
            </div>
          </div>
          <div class="phone-pages-dots"><div class="phone-dot active"></div><div class="phone-dot"></div></div>
          <div class="phone-app-grid" id="phone-app-grid"></div>
        </div>
        <div class="phone-dock" id="phone-dock"></div>
        <div class="phone-home-indicator"><div class="phone-home-bar" onclick="PhoneModule.goHome()"></div></div>
      </div>
      <div id="phone-shade">
        <div class="phone-statusbar" style="position:absolute;top:0;left:0;right:0;padding-top:12px;">
          <span class="phone-time" id="phone-shade-time">12:00</span>
          <div class="phone-status-icons"><span class="phone-sig">●●●</span><div class="phone-bat"><div class="phone-bat-fill" style="width:75%"></div></div></div>
        </div>
        <div class="phone-shade-tiles">
          <div class="phone-shade-tile on" onclick="PhoneModule.toggleShTile(this)"><div class="ico">📶</div><div class="lbl">Wi-Fi</div></div>
          <div class="phone-shade-tile on" onclick="PhoneModule.toggleShTile(this)"><div class="ico">🔵</div><div class="lbl">Bluetooth</div></div>
          <div class="phone-shade-tile" onclick="PhoneModule.toggleShTile(this)"><div class="ico">✈️</div><div class="lbl">Авиарежим</div></div>
          <div class="phone-shade-tile on" onclick="PhoneModule.toggleShTile(this)"><div class="ico">🔁</div><div class="lbl">Поворот</div></div>
          <div class="phone-shade-tile" onclick="PhoneModule.toggleShTile(this)"><div class="ico">🌙</div><div class="lbl">Ночной</div></div>
          <div class="phone-shade-tile on" onclick="PhoneModule.toggleShTile(this)"><div class="ico">🔊</div><div class="lbl">Звук</div></div>
          <div class="phone-shade-tile" onclick="PhoneModule.toggleShTile(this)"><div class="ico">🎯</div><div class="lbl">Фокус</div></div>
          <div class="phone-shade-tile on" onclick="PhoneModule.toggleShTile(this)"><div class="ico">📍</div><div class="lbl">GPS</div></div>
        </div>
        <div class="phone-shade-sliders">
          <div class="phone-shade-sl"><span class="ico">🔆</span><input type="range" min="10" max="100" value="80"></div>
          <div class="phone-shade-sl"><span class="ico">🔊</span><input type="range" min="0" max="100" value="65"></div>
        </div>
        <div class="phone-notif-list">
          <div class="phone-shade-notif"><span style="font-size:20px;">🤖</span><div><div style="font-size:11px;color:rgba(255,255,255,.5)">Exian.AI · сейчас</div><div style="font-size:13px;color:#fff;margin-top:2px;">Привет! Чем могу помочь?</div></div></div>
        </div>
      </div>
      <div id="phone-app-container">
        <!-- DIALER -->
        <div class="phone-app-win" id="pwin-dialer">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-dialer">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('dialer')">‹</div><div class="phone-win-title">📞 Телефон</div></div>
          <div class="phone-win-body"><div class="dialpad">
            <div class="dial-display"><div class="dial-number" id="dial-num"></div></div>
            <div class="dial-grid">${dialKeys.map(([n,l])=>`<div class="dial-key" onclick="PhoneModule.dialPress('${n}')"><span class="num">${n}</span>${l?`<span class="letters">${l}</span>`:''}</div>`).join('')}</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:40px;margin-top:4px;">
              <div style="width:72px;height:72px;"></div>
              <div class="dial-call-btn" onclick="PhoneModule.dialCall()">📞</div>
              <div class="dial-key" style="background:rgba(200,50,50,.2)" onclick="PhoneModule.dialBackspace()"><span class="num" style="font-size:18px;">⌫</span></div>
            </div>
          </div></div>
        </div>
        <!-- MESSAGES -->
        <div class="phone-app-win" id="pwin-messages">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-messages">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('messages')">‹</div><div class="phone-win-title">💬 Сообщения</div><span style="font-size:18px;cursor:pointer;">✏️</span></div>
          <div class="phone-win-body"><div class="msg-list">${msgThreads.map(([av,name,msg,time,unread])=>`<div class="msg-thread"><div class="msg-avatar" style="background:rgba(0,120,212,.2)">${av}</div><div class="msg-thread-info"><div class="msg-thread-top"><span class="msg-thread-name">${name}</span><span class="msg-thread-time">${time}</span></div><div class="msg-thread-preview">${msg}</div></div>${unread?`<div class="msg-unread-badge">${unread}</div>`:''}</div>`).join('')}</div></div>
        </div>
        <!-- CAMERA -->
        <div class="phone-app-win" id="pwin-camera">
          <div class="phone-win-body" style="display:flex;flex-direction:column;">
            <div class="camera-view" id="camera-view">
              <div class="camera-grid"></div><div class="camera-focus"></div>
              <div style="position:absolute;top:16px;left:0;right:0;display:flex;justify-content:space-between;padding:0 16px;z-index:5;">
                <div style="font-size:20px;cursor:pointer;" onclick="PhoneModule.closeApp('camera')">✕</div><div style="font-size:20px;">⚡</div><div style="font-size:20px;">⚙️</div>
              </div>
              <div style="position:absolute;bottom:130px;left:0;right:0;display:flex;justify-content:center;gap:20px;">
                <div style="font-size:13px;color:rgba(255,255,255,.4);cursor:pointer;">ВИДЕО</div>
                <div style="font-size:13px;color:#f1c40f;font-weight:600;cursor:pointer;">ФОТО</div>
                <div style="font-size:13px;color:rgba(255,255,255,.4);cursor:pointer;">ПОРТРЕТ</div>
              </div>
            </div>
            <div class="camera-controls">
              <div class="cam-thumb" id="cam-last">📷</div>
              <div class="cam-shutter" onclick="PhoneModule.takePhoto()"></div>
              <div class="cam-flip" onclick="PhoneModule.flipCamera()">🔄</div>
            </div>
          </div>
        </div>
        <!-- NOTES -->
        <div class="phone-app-win" id="pwin-notes">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-notes">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('notes')">‹</div><div class="phone-win-title">📒 Заметки</div><span style="font-size:20px;cursor:pointer;" onclick="PhoneModule.newNote()">✏️</span></div>
          <div class="phone-win-body" id="notes-body"><div class="notes-list" id="notes-list"></div></div>
        </div>
        <!-- MUSIC -->
        <div class="phone-app-win" id="pwin-music">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-music">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('music')">‹</div><div class="phone-win-title">🎵 Музыка</div></div>
          <div class="phone-win-body"><div class="music-player">
            <div class="music-album" id="music-album-art">🎵</div>
            <div class="music-info"><div class="track" id="music-track">Exian Synthwave</div><div class="artist" id="music-artist">ExiWin Sounds</div></div>
            <div class="music-progress" style="width:100%;"><div class="music-progress-bar" onclick="PhoneModule.seekMusic(event)"><div class="music-progress-fill" id="music-fill"></div></div><div class="music-times"><span id="music-cur">1:14</span><span id="music-dur">3:27</span></div></div>
            <div class="music-controls">
              <div class="music-ctrl" onclick="PhoneModule.prevTrack()">⏮</div>
              <div class="music-ctrl main" id="music-play-btn" onclick="PhoneModule.toggleMusic()">▶</div>
              <div class="music-ctrl" onclick="PhoneModule.nextTrack()">⏭</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;width:100%;"><span style="font-size:14px;color:rgba(255,255,255,.4);">🔇</span><input type="range" min="0" max="100" value="70" style="flex:1;accent-color:#0078d4"><span style="font-size:14px;color:rgba(255,255,255,.4);">🔊</span></div>
          </div></div>
        </div>
        <!-- GALLERY -->
        <div class="phone-app-win" id="pwin-gallery">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-gallery">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('gallery')">‹</div><div class="phone-win-title">🖼️ Галерея</div></div>
          <div class="phone-win-body"><div class="gallery-grid" id="gallery-grid"></div></div>
        </div>
        <!-- BROWSER -->
        <div class="phone-app-win" id="pwin-phonebrowser">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-phonebrowser">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('phonebrowser')">‹</div><div class="phone-win-title">🌐 Edge</div></div>
          <div class="phone-win-body" style="overflow:hidden;">
            <div class="phone-browser-bar"><input class="phone-browser-input" id="phone-br-url" placeholder="Поиск или адрес..." onkeydown="if(event.key==='Enter')PhoneModule.phoneBrGo()"><div class="phone-browser-go" onclick="PhoneModule.phoneBrGo()">→</div></div>
            <iframe class="phone-browser-frame" id="phone-br-frame" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
          </div>
        </div>
        <!-- SETTINGS -->
        <div class="phone-app-win" id="pwin-phonesettings">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-phonesettings">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('phonesettings')">‹</div><div class="phone-win-title">⚙️ Настройки</div></div>
          <div class="phone-win-body"><div class="phone-settings-list">
            <div style="text-align:center;padding:16px 0 20px;"><div id="phone-settings-avatar" style="font-size:60px;margin-bottom:8px;">🧑</div><div id="phone-settings-name" style="font-size:16px;font-weight:500;color:#fff;">Пользователь</div><div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px;">Аккаунт ExiWin</div></div>
            <div class="phone-settings-section"><div class="phone-settings-header">Подключения</div><div class="phone-settings-card">
              <div class="phone-setting-row"><div class="phone-setting-ico" style="background:rgba(0,120,212,.2);">📶</div><div class="phone-setting-text"><div class="n">Wi-Fi</div><div class="d">ExiWin-Network</div></div><div class="phone-toggle on" onclick="this.classList.toggle('on')"></div></div>
              <div class="phone-setting-row"><div class="phone-setting-ico" style="background:rgba(0,150,255,.2);">🔵</div><div class="phone-setting-text"><div class="n">Bluetooth</div></div><div class="phone-toggle on" onclick="this.classList.toggle('on')"></div></div>
              <div class="phone-setting-row"><div class="phone-setting-ico" style="background:rgba(200,100,0,.2);">✈️</div><div class="phone-setting-text"><div class="n">Авиарежим</div></div><div class="phone-toggle" onclick="this.classList.toggle('on')"></div></div>
            </div></div>
            <div class="phone-settings-section"><div class="phone-settings-header">О телефоне</div><div class="phone-settings-card">
              <div class="phone-setting-row"><div class="phone-setting-ico" style="background:rgba(0,120,212,.2);">📱</div><div class="phone-setting-text"><div class="n">ExiPhone 12 Pro</div><div class="d">ExiWin Mobile 12.0</div></div></div>
              <div class="phone-setting-row"><div class="phone-setting-ico" style="background:rgba(100,200,0,.2);">🔋</div><div class="phone-setting-text"><div class="n">Батарея</div><div class="d">75% · ~8 часов</div></div></div>
            </div></div>
            <div class="phone-settings-section"><div class="phone-settings-card"><div class="phone-setting-row" style="justify-content:center;" onclick="PhoneModule.exitPhone()"><div style="font-size:13px;color:#e74c3c;font-weight:500;">⎋ Сменить устройство</div></div></div></div>
          </div></div>
        </div>
        <!-- EXIAN AI -->
        <div class="phone-app-win" id="pwin-phonechat">
          <div class="phone-statusbar" style="background:rgba(0,0,0,.3);flex-shrink:0;"><span class="phone-time" id="pwin-time-phonechat">12:00</span><div class="phone-status-icons"><div class="phone-bat"><div class="phone-bat-fill"></div></div></div></div>
          <div class="phone-win-header"><div class="phone-win-back" onclick="PhoneModule.closeApp('phonechat')">‹</div><div class="phone-win-title">🤖 Exian.AI</div><div style="width:10px;height:10px;border-radius:50%;background:#2ecc71;margin-left:auto;"></div></div>
          <div class="phone-win-body" style="overflow:hidden;display:flex;flex-direction:column;">
            <div id="phone-chat-msgs" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;"></div>
            <div style="padding:10px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;background:rgba(0,0,0,.2);">
              <textarea id="phone-chat-input" placeholder="Сообщение..." rows="1" style="flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:10px 14px;color:#fff;font-size:13px;font-family:inherit;resize:none;outline:none;user-select:text;max-height:80px;" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();PhoneModule.phoneChatSend();}"></textarea>
              <div onclick="PhoneModule.phoneChatSend()" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0078d4,#60cdff);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;flex-shrink:0;align-self:flex-end;">➤</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`);

  /* ─── CORE MODULE ────────────────────────────────── */
  const PhoneModule = window.PhoneModule = {
    currentApp: null, dialNumber: '', musicPlaying: false, musicIdx: 0, musicProgress: 35, musicTimer: null, phoneChatHistory: [],
    notes: [
      { id:1, title:'Список дел', body:'✅ Обновить ExiWin\n⬜ Позвонить маме\n⬜ Купить хлеб', date:'Сегодня' },
      { id:2, title:'Идеи для проекта', body:'Сделать мобильный интерфейс для ExiWin — ГОТОВО!', date:'Вчера' },
      { id:3, title:'Пароли', body:'Это заметка для примера. Храните пароли надёжно!', date:'15 фев' },
    ],
    musicTracks: [
      { title:'Exian Synthwave', artist:'ExiWin Sounds', emoji:'🎵', dur:'3:27' },
      { title:'Digital Horizon', artist:'Exian Music', emoji:'🎸', dur:'4:12' },
      { title:'Night Protocol', artist:'ExiWin OST', emoji:'🌙', dur:'2:58' },
    ],
    phoneApps: [
      { id:'dialer',   name:'Телефон',   bg:'#1a2e1a', emoji:'📞', badge:0 },
      { id:'messages', name:'Сообщения', bg:'#1a1a2e', emoji:'💬', badge:3 },
      { id:'camera',   name:'Камера',    bg:'#1a1a1a', emoji:'📷', badge:0 },
      { id:'gallery',  name:'Галерея',   bg:'#2e1a2a', emoji:'🖼️', badge:0 },
      { id:'music',    name:'Музыка',    bg:'#1a0e2e', emoji:'🎵', badge:0 },
      { id:'notes',    name:'Заметки',   bg:'#2e2a0e', emoji:'📒', badge:0 },
      { id:'phonechat',name:'Exian.AI',  bg:'#0e1a2e', emoji:'🤖', badge:1 },
      { id:'phonebrowser', name:'Edge',  bg:'#0a1e1e', emoji:'🌐', badge:0 },
    ],
    dockApps: [
      { id:'dialer',  emoji:'📞', bg:'#1a2e1a' },
      { id:'messages',emoji:'💬', bg:'#1a1a2e' },
      { id:'phonechat',emoji:'🤖',bg:'#0e1a2e' },
      { id:'phonesettings',emoji:'⚙️',bg:'#1e1e1e' },
    ],
    showDeviceSelect() {
      const o = document.getElementById('device-select-overlay');
      if (o) o.style.display = 'flex';
    },
    selectDevice(type) {
      const o = document.getElementById('device-select-overlay');
      if (o) o.style.display = 'none';
      const desktop = document.getElementById('desktop');
      const taskbar = document.getElementById('taskbar');
      const phone = document.getElementById('phone-shell');
      if (type === 'computer') {
        if (desktop) desktop.style.display = '';
        if (taskbar) taskbar.style.display = '';
        if (phone) phone.style.display = 'none';
      } else {
        if (desktop) desktop.style.display = 'none';
        if (taskbar) taskbar.style.display = 'none';
        if (phone) phone.style.display = 'flex';
        this.initPhone();
      }
    },
    exitPhone() {
      const phone = document.getElementById('phone-shell');
      const desktop = document.getElementById('desktop');
      const taskbar = document.getElementById('taskbar');
      if (phone) phone.style.display = 'none';
      if (desktop) desktop.style.display = 'none';
      if (taskbar) taskbar.style.display = 'none';
      this.showDeviceSelect();
    },
    initPhone() {
      this.renderAppGrid(); this.renderDock(); this.renderNotes(); this.renderGallery();
      this.setupLockSwipe(); this.setupShadeSwipe(); this.updatePhoneTime();
      if (!this._timerId) this._timerId = setInterval(() => this.updatePhoneTime(), 1000);
      if (this.phoneChatHistory.length === 0) this.addPhoneMessage('bot', 'Привет! Я Exian.AI 3.0. Чем могу помочь? 🤖');
      const user = this._getUser();
      const ua = document.getElementById('phone-settings-avatar');
      const un = document.getElementById('phone-settings-name');
      if (ua && user) ua.textContent = user.avatar || '🧑';
      if (un && user) un.textContent = user.name || 'Пользователь';
    },
    _getUser() { try { const u = localStorage.getItem('exiwin_user'); return u ? JSON.parse(u) : null; } catch(e){ return null; } },
    updatePhoneTime() {
      const now = new Date();
      const t = now.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
      ['phone-lock-time','phone-home-time','phone-shade-time','widget-time'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = t; });
      document.querySelectorAll('[id^="pwin-time-"]').forEach(el => el.textContent = t);
      const lb = document.getElementById('phone-lock-bigtime'); if(lb) lb.textContent = t;
      const ld = document.getElementById('phone-lock-date'); if(ld) ld.textContent = now.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' });
      const wd = document.getElementById('widget-date'); if(wd) wd.textContent = now.toLocaleDateString('ru-RU', { weekday:'short', day:'numeric', month:'long' });
    },
    renderAppGrid() {
      const g = document.getElementById('phone-app-grid'); if(!g) return;
      g.innerHTML = this.phoneApps.map(a => `<div class="phone-app" onclick="PhoneModule.openApp('${a.id}')"><div class="phone-app-ico" style="background:${a.bg};">${a.emoji}${a.badge?`<div class="phone-app-badge">${a.badge}</div>`:''}</div><div class="phone-app-name">${a.name}</div></div>`).join('');
    },
    renderDock() {
      const d = document.getElementById('phone-dock'); if(!d) return;
      d.innerHTML = this.dockApps.map(a => `<div class="phone-app" onclick="PhoneModule.openApp('${a.id}')" style="padding:8px;"><div class="phone-app-ico" style="background:${a.bg};width:54px;height:54px;">${a.emoji}</div></div>`).join('');
    },
    setupLockSwipe() {
      const lock = document.getElementById('phone-lock'); if(!lock || lock._sw) return; lock._sw = true;
      let sy = 0;
      lock.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive:true });
      lock.addEventListener('touchmove', e => { const d = sy-e.touches[0].clientY; if(d>0) lock.style.transform=`translateY(-${Math.min(d*.5,100)}px)`; }, { passive:true });
      lock.addEventListener('touchend', e => { if(sy-e.changedTouches[0].clientY>60) this.unlock(); else lock.style.transform=''; });
      let smy = 0;
      lock.addEventListener('mousedown', e => { smy = e.clientY; lock._d = true; });
      document.addEventListener('mousemove', e => { if(!lock._d) return; const d=smy-e.clientY; if(d>0) lock.style.transform=`translateY(-${Math.min(d*.5,100)}px)`; });
      document.addEventListener('mouseup', e => { if(!lock._d) return; lock._d=false; if(smy-e.clientY>60) this.unlock(); else lock.style.transform=''; });
      lock.addEventListener('click', () => this.unlock());
    },
    unlock() {
      const lock = document.getElementById('phone-lock');
      if(lock) { lock.style.transform='translateY(-100%)'; lock.style.opacity='0'; setTimeout(()=>{ lock.style.display='none'; }, 400); }
    },
    setupShadeSwipe() {
      const drag = document.getElementById('phone-shade-drag'), shade = document.getElementById('phone-shade');
      if(!drag||!shade||drag._s) return; drag._s = true;
      let sy = 0;
      drag.addEventListener('mousedown', e => { sy=e.clientY; drag._d=true; });
      document.addEventListener('mousemove', e => { if(!drag._d) return; if(e.clientY-sy>30){ shade.classList.add('open'); drag._d=false; } });
      document.addEventListener('mouseup', () => { drag._d=false; });
      document.getElementById('phone-home')?.addEventListener('click', e => { if(!e.target.closest('#phone-shade')&&!e.target.closest('#phone-shade-drag')) shade.classList.remove('open'); });
    },
    openApp(id) {
      document.getElementById('phone-shade')?.classList.remove('open');
      const win = document.getElementById('pwin-'+id); if(!win) return;
      document.querySelectorAll('.phone-app-win').forEach(w=>w.classList.remove('open'));
      win.classList.add('open');
      document.getElementById('phone-app-container').style.pointerEvents = 'all';
      this.currentApp = id;
      const app = this.phoneApps.find(a=>a.id===id); if(app){ app.badge=0; this.renderAppGrid(); }
    },
    closeApp(id) {
      const win = document.getElementById('pwin-'+id); if(win) win.classList.remove('open');
      this.currentApp = null;
      if(!document.querySelectorAll('.phone-app-win.open').length) document.getElementById('phone-app-container').style.pointerEvents='none';
    },
    goHome() {
      document.querySelectorAll('.phone-app-win').forEach(w=>w.classList.remove('open'));
      document.getElementById('phone-app-container').style.pointerEvents='none';
      this.currentApp=null; document.getElementById('phone-shade')?.classList.remove('open');
    },
    toggleShTile(el) { el.classList.toggle('on'); },
    dialPress(key) { this.dialNumber+=key; const e=document.getElementById('dial-num'); if(e) e.textContent=this.dialNumber; },
    dialBackspace() { this.dialNumber=this.dialNumber.slice(0,-1); const e=document.getElementById('dial-num'); if(e) e.textContent=this.dialNumber; },
    dialCall() { if(!this.dialNumber) return; this._showPhoneNotif('📞','Вызов',`Звоним на ${this.dialNumber}...`); },
    renderNotes() {
      const l = document.getElementById('notes-list'); if(!l) return;
      l.innerHTML = this.notes.map(n=>`<div class="note-item" onclick="PhoneModule.openNote(${n.id})"><div class="title">${n.title}</div><div class="preview">${n.body.substring(0,60)}</div><div class="date">${n.date}</div></div>`).join('');
    },
    openNote(id) {
      const note=this.notes.find(n=>n.id===id); if(!note) return;
      document.getElementById('notes-body').innerHTML=`<div class="note-editor"><input type="text" value="${note.title}" id="note-edit-title" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;color:#fff;font-size:16px;font-weight:500;outline:none;font-family:inherit;user-select:text;"><textarea id="note-edit-body">${note.body}</textarea><div style="display:flex;gap:8px;"><div onclick="PhoneModule.saveNote(${id})" style="flex:1;background:rgba(0,120,212,.4);border-radius:12px;padding:12px;text-align:center;cursor:pointer;font-size:13px;color:#fff;">💾 Сохранить</div><div onclick="PhoneModule.deleteNote(${id})" style="background:rgba(200,50,50,.3);border-radius:12px;padding:12px 16px;text-align:center;cursor:pointer;font-size:13px;color:#e74c3c;">🗑️</div><div onclick="PhoneModule.backToNotesList()" style="background:rgba(255,255,255,.08);border-radius:12px;padding:12px 16px;text-align:center;cursor:pointer;font-size:13px;color:rgba(255,255,255,.7);">‹ Назад</div></div></div>`;
    },
    saveNote(id) { const n=this.notes.find(n=>n.id===id); if(!n) return; n.title=document.getElementById('note-edit-title')?.value||n.title; n.body=document.getElementById('note-edit-body')?.value||n.body; n.date='Сейчас'; this.backToNotesList(); this._showPhoneNotif('📒','Заметки','Сохранено!'); },
    deleteNote(id) { this.notes=this.notes.filter(n=>n.id!==id); this.backToNotesList(); },
    newNote() { const id=Date.now(); this.notes.unshift({id,title:'Новая заметка',body:'',date:'Сейчас'}); this.openNote(id); },
    backToNotesList() { document.getElementById('notes-body').innerHTML='<div class="notes-list" id="notes-list"></div>'; this.renderNotes(); },
    renderGallery() {
      const g=document.getElementById('gallery-grid'); if(!g) return;
      const emojis=['🌅','🏔️','🌊','🌸','🦋','🌙','⭐','🎆','🌃','🏙️','🌺','🦊','🐬','🎨','🌈','🎭','🎪','🌿'];
      const colors=['#1a0a2e','#0a1a2e','#0e1a0e','#2e1a0a','#1a0e0e','#0a2e2e'];
      g.innerHTML=emojis.map((em,i)=>`<div class="gallery-item" style="background:${colors[i%colors.length]};" onclick="PhoneModule._showPhoneNotif('🖼️','Галерея','Просмотр фото')"><span style="font-size:40px;">${em}</span></div>`).join('');
    },
    takePhoto() {
      const v=document.getElementById('camera-view'); v.style.background='#fff';
      setTimeout(()=>{ v.style.background='linear-gradient(135deg,#0a0a14 0%,#141428 100%)'; const t=document.getElementById('cam-last'); if(t) t.textContent=['🌅','🎆','🌙','🌈','🎨'][Math.floor(Math.random()*5)]; this._showPhoneNotif('📷','Камера','Фото сохранено'); },120);
    },
    flipCamera() { const v=document.getElementById('camera-view'); v.style.animation='phoneShake .3s ease'; setTimeout(()=>v.style.animation='',300); this._showPhoneNotif('📷','Камера','Фронтальная камера'); },
    toggleMusic() {
      this.musicPlaying=!this.musicPlaying;
      const btn=document.getElementById('music-play-btn'); if(btn) btn.textContent=this.musicPlaying?'⏸':'▶';
      if(this.musicPlaying) {
        this.musicTimer=setInterval(()=>{
          this.musicProgress=Math.min(100,this.musicProgress+0.3);
          const f=document.getElementById('music-fill'); if(f) f.style.width=this.musicProgress+'%';
          const c=document.getElementById('music-cur'); if(c){ const s=Math.floor(207*this.musicProgress/100); c.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
          if(this.musicProgress>=100) this.nextTrack();
        },200);
      } else clearInterval(this.musicTimer);
    },
    nextTrack() { clearInterval(this.musicTimer); this.musicPlaying=false; this.musicProgress=0; this.musicIdx=(this.musicIdx+1)%this.musicTracks.length; this._updateMusicUI(); },
    prevTrack() { clearInterval(this.musicTimer); this.musicPlaying=false; this.musicProgress=0; this.musicIdx=(this.musicIdx-1+this.musicTracks.length)%this.musicTracks.length; this._updateMusicUI(); },
    _updateMusicUI() {
      const t=this.musicTracks[this.musicIdx];
      ['music-track','music-artist','music-album-art','music-dur'].forEach((id,i)=>{ const el=document.getElementById(id); if(el) el.textContent=[t.title,t.artist,t.emoji,t.dur][i]; });
      const f=document.getElementById('music-fill'); if(f) f.style.width='0%';
      const c=document.getElementById('music-cur'); if(c) c.textContent='0:00';
      const b=document.getElementById('music-play-btn'); if(b) b.textContent='▶';
    },
    seekMusic(e) { const r=e.currentTarget.getBoundingClientRect(); this.musicProgress=((e.clientX-r.left)/r.width)*100; const f=document.getElementById('music-fill'); if(f) f.style.width=this.musicProgress+'%'; },
    phoneBrGo() {
      const i=document.getElementById('phone-br-url'), f=document.getElementById('phone-br-frame'); if(!i||!f) return;
      let url=i.value.trim(); if(!url) return;
      if(!url.startsWith('http')) url='https://www.google.com/search?q='+encodeURIComponent(url);
      f.style.display='block'; f.src=url;
    },
    phoneChatSend() {
      const i=document.getElementById('phone-chat-input'); if(!i) return;
      const text=i.value.trim(); if(!text) return; i.value='';
      this.addPhoneMessage('user',text);
      setTimeout(()=>{
        this.addPhoneMessage('bot',null,true);
        const tid=Date.now();
        setTimeout(()=>{
          const r=['Отличный вопрос! Я Exian.AI 3.0. Чем ещё могу помочь?','Понял вас! Давайте разберёмся вместе.','ExiWin 12 — лучшая система для работы! 🚀','Я могу помочь с кодом, идеями и многим другим.'][Math.floor(Math.random()*4)];
          const t=document.getElementById('phone-typing-'+tid); if(t) t.remove();
          this.addPhoneMessage('bot',r);
        },1200);
      },100);
    },
    addPhoneMessage(role,text,isTyping) {
      const msgs=document.getElementById('phone-chat-msgs'); if(!msgs) return;
      const id=Date.now(), isBot=role==='bot';
      const div=document.createElement('div');
      div.style.cssText=`display:flex;align-items:flex-end;gap:8px;${isBot?'':'flex-direction:row-reverse;'}`;
      if(isTyping) {
        div.id='phone-typing-'+id;
        div.innerHTML=`<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#0078d4,#60cdff);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">🤖</div><div style="background:rgba(255,255,255,.08);border-radius:14px 14px 14px 2px;padding:12px 16px;"><span class="edot"></span><span class="edot"></span><span class="edot"></span></div>`;
      } else {
        const bs=isBot?'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:4px 14px 14px 14px;max-width:80%;':'background:linear-gradient(135deg,#0078d4,#006cbf);border-radius:14px 14px 4px 14px;max-width:80%;';
        div.innerHTML=`${isBot?`<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#0078d4,#60cdff);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">🤖</div>`:''}<div style="${bs}padding:10px 14px;font-size:13px;line-height:1.5;color:#fff;">${text}</div>${!isBot?`<div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">${this._getUser()?.avatar||'🧑'}</div>`:''}`;
      }
      msgs.appendChild(div); msgs.scrollTop=msgs.scrollHeight;
      this.phoneChatHistory.push({role,text});
    },
    _showPhoneNotif(ico,title,text) {
      const n=document.createElement('div');
      n.style.cssText='position:absolute;top:70px;left:12px;right:12px;z-index:200;background:rgba(20,26,44,.96);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 8px 30px rgba(0,0,0,.5);';
      n.innerHTML=`<span style="font-size:22px;">${ico}</span><div><div style="font-size:12px;font-weight:600;color:#fff;">${title}</div><div style="font-size:11px;color:rgba(255,255,255,.6);">${text}</div></div>`;
      document.getElementById('phone-device')?.appendChild(n);
      setTimeout(()=>{ n.style.opacity='0'; n.style.transition='opacity .3s'; setTimeout(()=>n.remove(),300); },2500);
    },
  };

  /* ═══════════════════════════════════════════════════
     ПЕРЕХВАТ: ПОСЛЕ ВХОДА → ПОКАЗАТЬ ВЫБОР УСТРОЙСТВА
     ═══════════════════════════════════════════════════ */
  function hookLoginFlow() {
    // 1. Патчим showDesktop (вызывается при клике на lockscreen)
    const orig = window.showDesktop;
    if (typeof orig === 'function' && !window._phonePatch) {
      window._phonePatch = true;
      window.showDesktop = function() {
        orig.apply(this, arguments);
        setTimeout(() => {
          const desktop = document.getElementById('desktop');
          const taskbar = document.getElementById('taskbar');
          if (desktop) desktop.style.display = 'none';
          if (taskbar) taskbar.style.display = 'none';
          PhoneModule.showDeviceSelect();
        }, 30);
      };
    }

    // 2. Запасной перехват клика на lockscreen
    const lockEl = document.getElementById('lockscreen');
    if (lockEl && !lockEl._pp) {
      lockEl._pp = true;
      lockEl.addEventListener('click', () => {
        setTimeout(() => {
          const desktop = document.getElementById('desktop');
          const overlay = document.getElementById('device-select-overlay');
          const phone   = document.getElementById('phone-shell');
          if (desktop && overlay && phone) {
            const dv = desktop.style.display !== 'none' && desktop.style.display !== '';
            if (dv && overlay.style.display !== 'flex' && phone.style.display !== 'flex') {
              desktop.style.display = 'none';
              const tb = document.getElementById('taskbar'); if(tb) tb.style.display = 'none';
              PhoneModule.showDeviceSelect();
            }
          }
        }, 150);
      });
    }
  }

  // Запускаем патч
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookLoginFlow);
  } else {
    setTimeout(hookLoginFlow, 50);
  }

  // 3. Наблюдатель на desktop — если он вдруг появится напрямую
  setTimeout(() => {
    const desktop = document.getElementById('desktop');
    if (desktop && !desktop._pobs) {
      desktop._pobs = true;
      new MutationObserver((_, obs) => {
        const overlay = document.getElementById('device-select-overlay');
        const phone   = document.getElementById('phone-shell');
        if (!overlay || !phone) return;
        const dv = (desktop.style.display===''||desktop.style.display==='block'||desktop.style.display==='flex');
        if (dv && overlay.style.display !== 'flex' && phone.style.display !== 'flex') {
          obs.disconnect();
          desktop.style.display = 'none';
          const tb = document.getElementById('taskbar'); if(tb) tb.style.display = 'none';
          PhoneModule.showDeviceSelect();
        }
      }).observe(desktop, { attributes:true, attributeFilter:['style'] });
    }
  }, 300);

})();
