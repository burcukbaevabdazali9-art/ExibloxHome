'use strict';

// ════════════════════════════════════════════
// EXIBLOX v3 — Браузерная версия
// ════════════════════════════════════════════

const EXB = {
  user: null,
  users: {},
  games: [],
  tab: 'home',
  studioObjects: [],
  studioTool: 'block',
  studioColor: '#4a9a30',
  studioSelObj: null,
  studioDragging: null,
  studioProjectName: 'Новый проект',
  paintCtx: null,
  paintDrawing: false,
  aiHistory: [],
  TILE: 40,
};

const EXB_BASEPLATE = [
  {type:'block', x:0,   y:400, w:1600, h:40,  color:'#4a9a30'},
  {type:'spawn', x:80,  y:350, w:40,   h:40,  color:'#00b2ff'},
];

const EXB_ICONS = ['🎮','🎯','🏆','⚡','🌟','🔥','💎','🎲','🚀','🦊'];
const EXB_COLORS = ['#7c3aed','#1a6fa8','#b8860b','#ba5a00','#8b0000','#2d5a1b'];

// ── INIT ─────────────────────────────────────
function initExiblox() {
  EXB.users = JSON.parse(localStorage.getItem('exiblox_users') || '{}');
  EXB.games = JSON.parse(localStorage.getItem('exiblox_games') || '[]');
  EXB.user  = JSON.parse(localStorage.getItem('exiblox_curuser') || 'null');
  exbRender();
}

function exbSaveUsers() { localStorage.setItem('exiblox_users', JSON.stringify(EXB.users)); }
function exbSaveGames()  { localStorage.setItem('exiblox_games', JSON.stringify(EXB.games)); }
function exbSaveCurUser(){ localStorage.setItem('exiblox_curuser', JSON.stringify(EXB.user)); }

// ── ROOT RENDER ──────────────────────────────
function exbRender() {
  const root = el('exiblox-root');
  if (!root) return;
  if (!EXB.user) {
    exbRenderAuth(root);
  } else {
    exbRenderMain(root);
  }
}

// ════════════════════════════════════════════
// AUTH SCREEN
// ════════════════════════════════════════════
function exbRenderAuth(root) {
  root.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(160deg,#0a0c14,#0f1824);">
    <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:40px 50px;width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);">
      <div style="font-size:52px;font-weight:900;background:linear-gradient(135deg,#00b2ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;">✦ Exiblox</div>
      <div style="color:rgba(255,255,255,.4);font-size:13px;margin-bottom:28px;">v3 — Game Platform</div>
      <div id="exb-auth-tabs" style="display:flex;background:rgba(255,255,255,.06);border-radius:10px;padding:4px;margin-bottom:24px;">
        <div class="exb-auth-tab active" onclick="exbAuthTab('login')" style="flex:1;padding:8px;border-radius:8px;cursor:pointer;font-size:13px;transition:.2s;">Войти</div>
        <div class="exb-auth-tab" onclick="exbAuthTab('register')" style="flex:1;padding:8px;border-radius:8px;cursor:pointer;font-size:13px;color:rgba(255,255,255,.5);transition:.2s;">Регистрация</div>
      </div>
      <div id="exb-auth-form"></div>
      <div style="margin-top:14px;">
        <div onclick="exbGuestLogin()" style="color:rgba(255,255,255,.4);font-size:12px;cursor:pointer;padding:8px;border-radius:8px;transition:.15s;" onmouseover="this.style.color='rgba(255,255,255,.7)'" onmouseout="this.style.color='rgba(255,255,255,.4)'">👤 Продолжить как гость</div>
      </div>
      <div id="exb-auth-err" style="color:#ff6b6b;font-size:12px;margin-top:8px;min-height:18px;"></div>
    </div>
  </div>
  <style>
    .exb-auth-tab.active{background:rgba(0,178,255,.25);color:#fff;}
    .exb-auth-tab:not(.active):hover{background:rgba(255,255,255,.08);}
    .exb-inp{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:11px 14px;color:#fff;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:10px;transition:border .2s;}
    .exb-inp:focus{border-color:#00b2ff;}
    .exb-inp::placeholder{color:rgba(255,255,255,.3);}
    .exb-btn{width:100%;padding:12px;border-radius:9px;border:none;font-size:13px;cursor:pointer;font-family:inherit;font-weight:600;transition:.2s;margin-top:4px;}
    .exb-btn-primary{background:linear-gradient(135deg,#00b2ff,#7c3aed);color:#fff;}
    .exb-btn-primary:hover{opacity:.85;}
    .exb-btn-secondary{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);}
    .exb-btn-secondary:hover{background:rgba(255,255,255,.12);}
  </style>`;
  exbAuthTab('login');
}

let exbCurrentAuthTab = 'login';
function exbAuthTab(tab) {
  exbCurrentAuthTab = tab;
  document.querySelectorAll('.exb-auth-tab').forEach((t,i) => {
    t.classList.toggle('active', (i===0&&tab==='login')||(i===1&&tab==='register'));
    t.style.color = t.classList.contains('active') ? '#fff' : 'rgba(255,255,255,.5)';
  });
  const form = el('exb-auth-form');
  if (!form) return;
  if (tab === 'login') {
    form.innerHTML = `
      <input class="exb-inp" id="exb-ln" placeholder="Никнейм">
      <input class="exb-inp" id="exb-lp" type="password" placeholder="Пароль" onkeydown="if(event.key==='Enter')exbLogin()">
      <button class="exb-btn exb-btn-primary" onclick="exbLogin()">Войти →</button>`;
  } else {
    form.innerHTML = `
      <input class="exb-inp" id="exb-rn" placeholder="Никнейм (мин. 3 символа)">
      <input class="exb-inp" id="exb-re" placeholder="Email">
      <input class="exb-inp" id="exb-rp" type="password" placeholder="Пароль (мин. 6 символов)">
      <input class="exb-inp" id="exb-rp2" type="password" placeholder="Повторите пароль" onkeydown="if(event.key==='Enter')exbRegister()">
      <button class="exb-btn exb-btn-primary" onclick="exbRegister()">Создать аккаунт →</button>`;
  }
}

function exbAuthErr(msg) {
  const e = el('exb-auth-err');
  if (e) e.textContent = msg;
  setTimeout(() => { if(el('exb-auth-err')) el('exb-auth-err').textContent=''; }, 3000);
}

function exbHashPw(pw) {
  let h = 0;
  for (let c of pw) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return h.toString(36);
}

function exbLogin() {
  const name = (el('exb-ln')?.value || '').trim();
  const pw   = el('exb-lp')?.value || '';
  if (!name || !pw) { exbAuthErr('Заполните все поля!'); return; }
  if (!EXB.users[name]) { exbAuthErr('Пользователь не найден!'); return; }
  if (EXB.users[name].pw !== exbHashPw(pw)) { exbAuthErr('Неверный пароль!'); return; }
  EXB.user = name;
  exbSaveCurUser();
  exbRender();
}

function exbRegister() {
  const name = (el('exb-rn')?.value || '').trim();
  const email= (el('exb-re')?.value || '').trim();
  const pw   = el('exb-rp')?.value || '';
  const pw2  = el('exb-rp2')?.value || '';
  if (!name || !email || !pw || !pw2) { exbAuthErr('Заполните все поля!'); return; }
  if (name.length < 3) { exbAuthErr('Никнейм >= 3 символа!'); return; }
  if (pw.length < 6)   { exbAuthErr('Пароль >= 6 символов!'); return; }
  if (pw !== pw2)      { exbAuthErr('Пароли не совпадают!'); return; }
  if (EXB.users[name]) { exbAuthErr('Ник уже занят!'); return; }
  const code = Math.random().toString(36).slice(2,10).toUpperCase();
  EXB.users[name] = { pw: exbHashPw(pw), email, code, robux: 0, friends:[], requests:[], projects:[], pubGames:[], isGuest:false };
  exbSaveUsers();
  EXB.user = name;
  exbSaveCurUser();
  exbRender();
}

function exbGuestLogin() {
  if (!EXB.users['Guest']) {
    EXB.users['Guest'] = { pw:'', email:'guest@exiblox.com', code:'GUEST000', robux:0, friends:[], requests:[], projects:[], pubGames:[], isGuest:true };
    exbSaveUsers();
  }
  EXB.user = 'Guest';
  exbSaveCurUser();
  exbRender();
}

function exbLogout() {
  EXB.user = null;
  localStorage.removeItem('exiblox_curuser');
  exbRender();
}

// ════════════════════════════════════════════
// MAIN WINDOW
// ════════════════════════════════════════════
function exbRenderMain(root) {
  const me = EXB.users[EXB.user] || {};
  root.innerHTML = `
  <style>
    #exiblox-root{font-family:'Segoe UI',system-ui,sans-serif;color:#fff;}
    .exb-main{display:flex;height:100%;overflow:hidden;background:#111318;}
    .exb-topbar{height:56px;background:#0c0e14;display:flex;align-items:center;padding:0 20px;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
    .exb-logo{font-size:18px;font-weight:900;background:linear-gradient(135deg,#00b2ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;}
    .exb-search{flex:1;max-width:360px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:7px 14px;display:flex;align-items:center;gap:8px;}
    .exb-search input{background:none;border:none;outline:none;color:#fff;font-size:12px;width:100%;font-family:inherit;}
    .exb-search input::placeholder{color:rgba(255,255,255,.3);}
    .exb-user-info{margin-left:auto;display:flex;align-items:center;gap:12px;}
    .exb-robux{font-size:13px;font-weight:700;color:#FFD700;}
    .exb-sidebar{width:100px;background:#0a0c11;border-right:1px solid rgba(255,255,255,.05);display:flex;flex-direction:column;padding-top:8px;flex-shrink:0;}
    .exb-nav-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;cursor:pointer;border-radius:8px;margin:2px 6px;transition:.15s;font-size:10px;color:rgba(255,255,255,.5);}
    .exb-nav-btn:hover{background:rgba(255,255,255,.06);color:#fff;}
    .exb-nav-btn.exb-active{background:rgba(0,178,255,.15);color:#00b2ff;}
    .exb-nav-ico{font-size:20px;line-height:1;}
    .exb-content{flex:1;overflow-y:auto;padding:0;}
    .exb-content::-webkit-scrollbar{width:4px;}
    .exb-content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px;}
    .exb-section{padding:22px 28px 0;}
    .exb-sec-title{font-size:17px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
    .exb-cards-row{display:flex;gap:12px;flex-wrap:wrap;}
    .exb-game-card{width:192px;background:rgba(255,255,255,.05);border-radius:14px;overflow:hidden;cursor:pointer;transition:.15s;border:1px solid rgba(255,255,255,.07);flex-shrink:0;}
    .exb-game-card:hover{transform:translateY(-3px);border-color:rgba(0,178,255,.4);box-shadow:0 8px 24px rgba(0,178,255,.15);}
    .exb-card-thumb{height:120px;display:flex;align-items:center;justify-content:center;font-size:52px;}
    .exb-card-body{padding:10px 12px 12px;}
    .exb-card-name{font-size:12px;font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .exb-card-meta{font-size:10px;color:rgba(255,255,255,.4);display:flex;justify-content:space-between;}
    .exb-btn2{padding:8px 18px;border-radius:8px;border:none;font-size:12px;cursor:pointer;font-family:inherit;font-weight:600;transition:.15s;}
    .exb-btn2-blue{background:#00b2ff;color:#fff;}
    .exb-btn2-blue:hover{background:#0099e0;}
    .exb-btn2-red{background:#e74c3c;color:#fff;}
    .exb-btn2-red:hover{background:#c0392b;}
    .exb-btn2-gray{background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);}
    .exb-btn2-gray:hover{background:rgba(255,255,255,.17);}
    .exb-inp2{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;font-family:inherit;outline:none;transition:border .2s;}
    .exb-inp2:focus{border-color:#00b2ff;}
    .exb-inp2::placeholder{color:rgba(255,255,255,.3);}
    .exb-studio-wrap{display:flex;height:100%;overflow:hidden;}
    .exb-studio-side{width:120px;background:#0a0c11;border-right:1px solid rgba(255,255,255,.07);padding:8px;display:flex;flex-direction:column;gap:4px;flex-shrink:0;}
    .exb-tool-btn{padding:8px 6px;border-radius:8px;cursor:pointer;font-size:11px;text-align:center;transition:.15s;color:rgba(255,255,255,.6);border:1px solid transparent;}
    .exb-tool-btn:hover{background:rgba(255,255,255,.08);color:#fff;}
    .exb-tool-btn.exb-tool-active{background:rgba(0,178,255,.2);border-color:rgba(0,178,255,.4);color:#00b2ff;}
    .exb-canvas-wrap{flex:1;position:relative;overflow:hidden;background:#1a2040;cursor:crosshair;}
    .exb-ai-wrap{display:flex;flex-direction:column;height:100%;background:#0d0f18;}
    .exb-ai-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;}
    .exb-ai-bubble-bot{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);border-radius:4px 14px 14px 14px;padding:10px 14px;font-size:13px;line-height:1.6;max-width:80%;word-break:break-word;}
    .exb-ai-bubble-user{background:linear-gradient(135deg,#00b2ff,#0078d4);border-radius:14px 14px 4px 14px;padding:10px 14px;font-size:13px;line-height:1.6;max-width:70%;align-self:flex-end;}
    .exb-ai-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.2);}
    .exb-ai-input{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;color:#fff;font-size:13px;font-family:inherit;outline:none;}
    .exb-ai-input:focus{border-color:#00b2ff;}
    .exb-ai-input::placeholder{color:rgba(255,255,255,.3);}
    .exb-profile-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
  </style>
  <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">
    <!-- TOPBAR -->
    <div class="exb-topbar">
      <div class="exb-logo">✦ Exiblox v3</div>
      <div class="exb-search">
        <span style="font-size:12px;opacity:.4">🔍</span>
        <input id="exb-search" placeholder="Поиск игр..." onkeydown="if(event.key==='Enter')exbDoSearch(this.value)">
      </div>
      <div class="exb-user-info">
        <span class="exb-robux">💰 ${me.robux||0} R$</span>
        <span style="font-size:12px;color:rgba(255,255,255,.6);">${me.isGuest?'👤 Гость':('👤 '+EXB.user)}</span>
        <div class="exb-btn2 exb-btn2-gray" onclick="exbLogout()" style="padding:5px 12px;font-size:11px;">Выйти</div>
      </div>
    </div>
    <!-- MAIN -->
    <div class="exb-main" style="flex:1;overflow:hidden;">
      <!-- SIDEBAR -->
      <div class="exb-sidebar">
        ${[
          ['home','🏠','Главная'],
          ['store','🛒','Магазин'],
          ['studio','🛠','Studio'],
          ['friends','👥','Друзья'],
          ['publish','📤','Publish'],
          ['ai','🤖','AI'],
          ['profile','👤','Профиль'],
        ].map(([tab,ico,lbl])=>`
          <div class="exb-nav-btn ${EXB.tab===tab?'exb-active':''}" onclick="exbTab('${tab}')">
            <span class="exb-nav-ico">${ico}</span>
            <span>${lbl}</span>
          </div>`).join('')}
      </div>
      <!-- CONTENT -->
      <div class="exb-content" id="exb-content"></div>
    </div>
  </div>`;
  exbTabContent(EXB.tab);
}

function exbTab(tab) {
  EXB.tab = tab;
  document.querySelectorAll('.exb-nav-btn').forEach(b => {
    const t = b.getAttribute('onclick').match(/'(\w+)'/)[1];
    b.classList.toggle('exb-active', t === tab);
  });
  exbTabContent(tab);
}

function exbTabContent(tab) {
  const c = el('exb-content');
  if (!c) return;
  const fn = {home:exbHome, store:exbStore, studio:exbStudio, friends:exbFriends, publish:exbPublish, ai:exbAI, profile:exbProfile}[tab];
  if (fn) fn(c);
}

// ════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════
function exbHome(c) {
  const me = EXB.users[EXB.user] || {};
  const frs = me.friends || [];
  const allGames = EXB.games;
  c.innerHTML = `
  <div class="exb-section" style="padding-top:26px;">
    <div class="exb-sec-title">👥 Соединения (${frs.length})
      <button class="exb-btn2 exb-btn2-blue" onclick="exbTab('friends')" style="margin-left:auto;font-size:11px;">+ Добавить</button>
    </div>
    <div class="exb-cards-row" style="margin-bottom:28px;">
      ${frs.length ? frs.slice(0,8).map(f=>`
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:80px;">
          <div style="width:54px;height:54px;border-radius:50%;background:rgba(0,178,255,.2);display:flex;align-items:center;justify-content:center;font-size:24px;">👤</div>
          <span style="font-size:10px;color:rgba(255,255,255,.7);text-align:center;">${f.slice(0,10)}</span>
          <span style="font-size:9px;color:#2ecc71;">● Online</span>
        </div>`).join('') : '<span style="color:rgba(255,255,255,.3);font-size:13px;padding:16px 0;">Нет друзей. Добавьте по никнейму!</span>'}
    </div>

    ${allGames.length ? `
    <div class="exb-sec-title">🎮 Играть сейчас</div>
    <div class="exb-cards-row" style="margin-bottom:28px;">${exbGameCards(allGames.slice(0,4))}</div>
    ${allGames.length>4?`<div class="exb-sec-title">⭐ Популярные</div>
    <div class="exb-cards-row" style="margin-bottom:28px;">${exbGameCards(allGames.slice(4,8))}</div>`:''}
    ` : `
    <div style="text-align:center;padding:50px 0;color:rgba(255,255,255,.25);font-size:14px;">
      🎮 Пока нет опубликованных игр<br><br>
      <button class="exb-btn2 exb-btn2-blue" onclick="exbTab('studio')">Создать первую игру в Studio →</button>
    </div>`}
  </div>`;
}

function exbGameCards(games) {
  return games.map(g=>`
    <div class="exb-game-card" onclick="exbPlayGame('${g.id}')">
      <div class="exb-card-thumb" style="background:${g.color||'#1a2040'}">${g.icon||'🎮'}</div>
      <div class="exb-card-body">
        <div class="exb-card-name">${escHtmlExb(g.name)}</div>
        <div class="exb-card-meta"><span>by ${escHtmlExb(g.author)}</span><span>👍 ${g.rating}</span></div>
      </div>
    </div>`).join('');
}

// ════════════════════════════════════════════
// STORE
// ════════════════════════════════════════════
function exbStore(c) {
  c.innerHTML = `
  <div class="exb-section" style="padding-top:26px;">
    <div class="exb-sec-title">🛒 Магазин Exiblox</div>
    ${EXB.games.length ? `
    <div class="exb-sec-title" style="font-size:13px;color:rgba(255,255,255,.5);">Все игры (${EXB.games.length})</div>
    <div class="exb-cards-row">${exbGameCards(EXB.games)}</div>
    ` : '<div style="color:rgba(255,255,255,.3);font-size:13px;padding:40px 0;text-align:center;">Магазин пуст. Публикуйте игры в Studio!</div>'}
  </div>`;
}

// ════════════════════════════════════════════
// STUDIO
// ════════════════════════════════════════════
function exbStudio(c) {
  const me = EXB.users[EXB.user] || {};
  const projects = me.projects || [];

  c.innerHTML = `
  <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">
    <!-- Studio Toolbar -->
    <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:#0c0e14;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;">
      <button class="exb-btn2 exb-btn2-blue" onclick="exbStudioSave()" style="font-size:11px;">💾 Сохранить</button>
      <button class="exb-btn2 exb-btn2-gray" onclick="exbStudioLoad()" style="font-size:11px;">📂 Загрузить</button>
      <button class="exb-btn2 exb-btn2-gray" onclick="exbStudioBaseplate()" style="font-size:11px;">🏗 Baseplate</button>
      <button class="exb-btn2 exb-btn2-blue" style="background:#2ecc71;font-size:11px;" onclick="exbStudioTest()">▶ Тест</button>
      ${me.isGuest ? '' : `<button class="exb-btn2" style="background:#7c3aed;color:#fff;font-size:11px;" onclick="exbPublishDialog()">📤 Publish</button>`}
      <button class="exb-btn2 exb-btn2-red" onclick="exbStudioClear()" style="font-size:11px;">🗑 Очистить</button>
      <input id="exb-proj-name" class="exb-inp2" value="${escHtmlExb(EXB.studioProjectName)}" style="width:180px;font-size:12px;" oninput="EXB.studioProjectName=this.value">
      <span style="margin-left:auto;font-size:11px;color:rgba(255,255,255,.3);">Объектов: <span id="exb-obj-count">${EXB.studioObjects.length}</span></span>
    </div>
    <!-- Studio Body -->
    <div class="exb-studio-wrap" style="flex:1;overflow:hidden;">
      <!-- Tools -->
      <div class="exb-studio-side">
        <div style="font-size:10px;color:rgba(255,255,255,.4);padding:4px 6px 8px;letter-spacing:.5px;text-transform:uppercase;">Инструменты</div>
        ${['🖱 Выбор','🧱 Блок','📍 Спавн','🪙 Монета','💥 Враг','🧹 Ластик'].map((t,i)=>{
          const id=['select','block','spawn','coin','enemy','eraser'][i];
          return `<div class="exb-tool-btn ${EXB.studioTool===id?'exb-tool-active':''}" onclick="exbSetTool('${id}',this)">${t}</div>`;
        }).join('')}
        <div style="height:1px;background:rgba(255,255,255,.07);margin:8px 0;"></div>
        <div style="font-size:10px;color:rgba(255,255,255,.4);padding:4px 6px 6px;letter-spacing:.5px;text-transform:uppercase;">Цвет</div>
        <div id="exb-color-prev" style="width:36px;height:26px;border-radius:7px;background:${EXB.studioColor};border:2px solid rgba(255,255,255,.2);cursor:pointer;margin:0 auto;" onclick="exbPickColor()"></div>
        <input type="color" id="exb-color-pick" value="${EXB.studioColor}" oninput="EXB.studioColor=this.value;el('exb-color-prev').style.background=this.value" style="position:absolute;opacity:0;pointer-events:none;">
        <div style="height:1px;background:rgba(255,255,255,.07);margin:8px 0;"></div>
        <div style="font-size:10px;color:rgba(255,255,255,.4);padding:4px 6px 6px;letter-spacing:.5px;text-transform:uppercase;">Сетка</div>
        <div style="font-size:10px;color:rgba(255,255,255,.5);text-align:center;">40px</div>
      </div>
      <!-- Canvas -->
      <div class="exb-canvas-wrap" id="exb-studio-wrap">
        <canvas id="exb-studio-canvas" style="display:block;"></canvas>
      </div>
    </div>
  </div>`;
  requestAnimationFrame(exbStudioInitCanvas);
}

function exbStudioInitCanvas() {
  const wrap = el('exb-studio-wrap');
  const canvas = el('exb-studio-canvas');
  if (!wrap || !canvas) return;
  canvas.width = wrap.clientWidth || 800;
  canvas.height = wrap.clientHeight || 450;
  EXB.studioPaintCtx = canvas.getContext('2d');
  exbStudioRedraw();

  canvas.addEventListener('mousedown', exbStudioMouseDown);
  canvas.addEventListener('mousemove', exbStudioMouseMove);
  canvas.addEventListener('mouseup',   () => EXB.studioDragging = null);
  canvas.addEventListener('contextmenu', exbStudioRightClick);
  canvas.addEventListener('mouseleave', () => EXB.studioDragging = null);
}

function exbStudioMouseDown(e) {
  e.preventDefault();
  const {x,y} = exbStudioPos(e);
  const tool = EXB.studioTool;
  if (tool === 'eraser') {
    EXB.studioObjects = EXB.studioObjects.filter(o => !(x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h));
    exbStudioRedraw(); exbUpdateObjCount(); return;
  }
  if (tool === 'select') {
    EXB.studioSelObj = null;
    for (let i = EXB.studioObjects.length-1; i>=0; i--) {
      const o = EXB.studioObjects[i];
      if (x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h) { EXB.studioSelObj=o; EXB.studioDragging={ox:x-o.x,oy:y-o.y}; break; }
    }
    exbStudioRedraw(); return;
  }
  const TILE = EXB.TILE;
  const sx = Math.floor(x/TILE)*TILE, sy = Math.floor(y/TILE)*TILE;
  const colorMap = {block:'#4a9a30',spawn:'#00b2ff',coin:'#FFD700',enemy:'#e74c3c'};
  EXB.studioObjects.push({type:tool, x:sx, y:sy, w:TILE, h:TILE, color:EXB.studioColor||colorMap[tool]||'#888'});
  exbStudioRedraw(); exbUpdateObjCount();
}

function exbStudioMouseMove(e) {
  if (EXB.studioTool==='select' && EXB.studioSelObj && EXB.studioDragging) {
    const {x,y} = exbStudioPos(e);
    const TILE = EXB.TILE;
    EXB.studioSelObj.x = Math.floor((x-EXB.studioDragging.ox)/TILE)*TILE;
    EXB.studioSelObj.y = Math.floor((y-EXB.studioDragging.oy)/TILE)*TILE;
    exbStudioRedraw();
  }
}

function exbStudioRightClick(e) {
  e.preventDefault();
  const {x,y} = exbStudioPos(e);
  const idx = EXB.studioObjects.findLastIndex(o=>x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h);
  if (idx>=0) { EXB.studioObjects.splice(idx,1); exbStudioRedraw(); exbUpdateObjCount(); }
}

function exbStudioPos(e) {
  const r = el('exb-studio-canvas').getBoundingClientRect();
  return {x: e.clientX-r.left, y: e.clientY-r.top};
}

function exbStudioRedraw() {
  const cv = EXB.studioPaintCtx;
  if (!cv) return;
  const canvas = el('exb-studio-canvas');
  const W = canvas.width, H = canvas.height;
  const TILE = EXB.TILE;
  // BG
  for (let i=0;i<H;i++){
    const s = Math.floor(26+i*0.04);
    cv.fillStyle=`rgb(${s},${s+10},64)`;
    cv.fillRect(0,i,W,1);
  }
  // Grid
  cv.strokeStyle='rgba(255,255,255,.04)';
  cv.lineWidth=1;
  for(let x=0;x<W;x+=TILE){cv.beginPath();cv.moveTo(x,0);cv.lineTo(x,H);cv.stroke();}
  for(let y=0;y<H;y+=TILE){cv.beginPath();cv.moveTo(0,y);cv.lineTo(W,y);cv.stroke();}
  // Objects
  EXB.studioObjects.forEach(o=>{
    const sel = o===EXB.studioSelObj;
    cv.fillStyle=o.color||'#888';
    cv.fillRect(o.x,o.y,o.w,o.h);
    cv.strokeStyle=sel?'#fff':'rgba(255,255,255,.2)';
    cv.lineWidth=sel?2:1;
    cv.strokeRect(o.x,o.y,o.w,o.h);
    // Label
    const labels={block:'🧱',spawn:'📍',coin:'🪙',enemy:'💥'};
    if(labels[o.type]){
      cv.font='18px serif';
      cv.textAlign='center';
      cv.fillText(labels[o.type],o.x+o.w/2,o.y+o.h/2+6);
    }
  });
}

function exbUpdateObjCount() {
  const c = el('exb-obj-count');
  if(c) c.textContent = EXB.studioObjects.length;
}

function exbSetTool(tool, btn) {
  EXB.studioTool = tool;
  document.querySelectorAll('.exb-tool-btn').forEach(b=>b.classList.remove('exb-tool-active'));
  if(btn) btn.classList.add('exb-tool-active');
}

function exbPickColor() {
  const cp = el('exb-color-pick');
  if(cp) cp.click();
}

function exbStudioSave() {
  const name = EXB.studioProjectName.trim() || 'Без названия';
  const me = EXB.users[EXB.user];
  if(!me) return;
  const proj = me.projects || [];
  const idx = proj.findIndex(p=>p.name===name);
  const data = {name, objects: EXB.studioObjects, updated: new Date().toLocaleString('ru')};
  if(idx>=0) proj[idx]=data; else proj.unshift(data);
  me.projects = proj;
  exbSaveUsers();
  showNotif('ExiStudio','Проект "'+name+'" сохранён','💾');
}

function exbStudioLoad() {
  const me = EXB.users[EXB.user] || {};
  const projects = me.projects || [];
  if(!projects.length) { showNotif('ExiStudio','Нет сохранённых проектов','📂'); return; }
  const list = projects.map((p,i)=>`${i+1}. ${p.name}`).join('\n');
  const ans = prompt('Выберите номер проекта:\n'+list);
  const idx = parseInt(ans)-1;
  if(isNaN(idx)||!projects[idx]) return;
  const proj = projects[idx];
  EXB.studioObjects = proj.objects || [];
  EXB.studioProjectName = proj.name;
  const ni = el('exb-proj-name');
  if(ni) ni.value=proj.name;
  exbStudioRedraw();
  exbUpdateObjCount();
  showNotif('ExiStudio','Загружен: '+proj.name,'📂');
}

function exbStudioBaseplate() {
  EXB.studioObjects = EXB_BASEPLATE.map(o=>({...o}));
  EXB.studioProjectName = 'Baseplate';
  const ni = el('exb-proj-name');
  if(ni) ni.value='Baseplate';
  exbStudioRedraw();
  exbUpdateObjCount();
  showNotif('ExiStudio','Baseplate загружен!','🏗');
}

function exbStudioClear() {
  if(!confirm('Очистить все объекты?')) return;
  EXB.studioObjects = [];
  exbStudioRedraw();
  exbUpdateObjCount();
}

function exbStudioTest() {
  const game = {name:'Тест: '+EXB.studioProjectName, icon:'🛠', color:'#1a2040', objects:EXB.studioObjects};
  exbOpenGame(game);
}

// ════════════════════════════════════════════
// PUBLISH DIALOG
// ════════════════════════════════════════════
function exbPublishDialog() {
  const me = EXB.users[EXB.user] || {};
  if(me.isGuest) { showNotif('Exiblox','Гости не могут публиковать!','📤'); return; }

  const overlay = document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML=`
    <div style="background:#1a1e2a;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:36px;width:400px;box-shadow:0 24px 60px rgba(0,0,0,.7);">
      <div style="font-size:20px;font-weight:700;margin-bottom:20px;">📤 Опубликовать игру</div>
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px;">Название</div>
      <input id="exb-pub-name" class="exb-inp2" value="Untitled Game" style="width:100%;margin-bottom:14px;box-sizing:border-box;">
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px;">Описание</div>
      <textarea id="exb-pub-desc" class="exb-inp2" style="width:100%;height:80px;resize:none;box-sizing:border-box;">Описание вашей игры...</textarea>
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="exb-btn2 exb-btn2-blue" style="flex:1;" onclick="exbDoPublish()">🚀 Опубликовать</button>
        <button class="exb-btn2 exb-btn2-gray" onclick="this.closest('[style*=fixed]').remove()">Отмена</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function exbDoPublish() {
  const name = (el('exb-pub-name')?.value||'').trim() || 'Untitled Game';
  const desc = (el('exb-pub-desc')?.value||'').trim() || 'Без описания';
  const id = Math.random().toString(36).slice(2,10).toUpperCase();
  const game = {
    id, name, desc, author: EXB.user,
    objects: EXB.studioObjects,
    icon: EXB_ICONS[Math.floor(Math.random()*EXB_ICONS.length)],
    color: EXB_COLORS[Math.floor(Math.random()*EXB_COLORS.length)],
    rating: '100%', players: '0',
    created: new Date().toLocaleDateString('ru'),
  };
  EXB.games.unshift(game);
  exbSaveGames();
  const me = EXB.users[EXB.user];
  if(me){ me.pubGames = me.pubGames||[]; me.pubGames.push(id); exbSaveUsers(); }
  document.querySelector('[style*="position:fixed"]')?.remove();
  showNotif('Exiblox',`Игра "${name}" опубликована! 🎉`,'📤');
}

// ════════════════════════════════════════════
// FRIENDS
// ════════════════════════════════════════════
function exbFriends(c) {
  const me = EXB.users[EXB.user] || {};
  const frs = me.friends || [];
  const reqs = me.requests || [];
  c.innerHTML = `
  <div class="exb-section" style="padding-top:26px;">
    <div style="display:flex;align-items:center;margin-bottom:20px;">
      <div class="exb-sec-title" style="margin-bottom:0;">👥 Друзья</div>
      ${me.isGuest ? '' : `<button class="exb-btn2 exb-btn2-blue" style="margin-left:auto;font-size:11px;" onclick="exbAddFriendDlg()">+ Добавить</button>`}
    </div>
    ${!me.isGuest&&me.code ? `<div class="exb-profile-card"><span style="font-size:13px;">🎫 Ваш код: <strong style="color:#00b2ff;">${me.code}</strong></span><span style="font-size:11px;color:rgba(255,255,255,.4);">Поделитесь с друзьями</span></div>` : ''}
    ${reqs.length ? `
    <div class="exb-sec-title" style="font-size:14px;margin-top:18px;">📩 Запросы (${reqs.length})</div>
    ${reqs.map(r=>`
      <div class="exb-profile-card">
        <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">👤</span><span style="font-size:13px;font-weight:600;">${r}</span></div>
        <button class="exb-btn2 exb-btn2-blue" style="font-size:11px;" onclick="exbAcceptFriend('${r}')">Принять ✓</button>
      </div>`).join('')}` : ''}
    <div class="exb-sec-title" style="font-size:14px;margin-top:18px;">Мои друзья (${frs.length})</div>
    ${frs.length ? frs.map(f=>`
      <div class="exb-profile-card">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(0,178,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>
          <div><div style="font-size:13px;font-weight:600;">${f}</div><div style="font-size:11px;color:#2ecc71;">● Online</div></div>
        </div>
      </div>`).join('') : '<div style="color:rgba(255,255,255,.3);font-size:13px;padding:20px 0;">Нет друзей</div>'}
  </div>`;
}

function exbAddFriendDlg() {
  const me = EXB.users[EXB.user]||{};
  if(me.isGuest){showNotif('Exiblox','Гости не могут добавлять друзей!','👥');return;}
  const nick = prompt('Введите никнейм или код друга:');
  if(!nick) return;
  const target = Object.keys(EXB.users).find(u=>u===nick || EXB.users[u].code===nick.toUpperCase());
  if(!target){showNotif('Exiblox','Пользователь не найден!','❌');return;}
  if(target===EXB.user){showNotif('Exiblox','Нельзя добавить себя!','❌');return;}
  if(me.friends&&me.friends.includes(target)){showNotif('Exiblox','Уже в друзьях!','✅');return;}
  const them = EXB.users[target];
  them.requests = them.requests||[];
  if(them.requests.includes(EXB.user)){showNotif('Exiblox','Запрос уже отправлен!','📩');return;}
  them.requests.push(EXB.user);
  exbSaveUsers();
  showNotif('Exiblox',`Запрос отправлен: ${target}`,'📩');
}

function exbAcceptFriend(from) {
  const me = EXB.users[EXB.user];
  if(!me) return;
  me.requests = (me.requests||[]).filter(r=>r!==from);
  me.friends = me.friends||[];
  if(!me.friends.includes(from)) me.friends.push(from);
  const them = EXB.users[from];
  if(them){ them.friends=them.friends||[]; if(!them.friends.includes(EXB.user)) them.friends.push(EXB.user); }
  exbSaveUsers();
  exbTab('friends');
  showNotif('Exiblox',from+' добавлен в друзья!','✅');
}

// ════════════════════════════════════════════
// PUBLISH TAB
// ════════════════════════════════════════════
function exbPublish(c) {
  const me = EXB.users[EXB.user] || {};
  if(me.isGuest){c.innerHTML=`<div style="text-align:center;padding:80px;color:rgba(255,255,255,.3);">📤 Гости не могут публиковать игры.<br><br><button class="exb-btn2 exb-btn2-blue" onclick="exbLogout()">Создать аккаунт</button></div>`;return;}
  const myGames = EXB.games.filter(g=>g.author===EXB.user);
  c.innerHTML = `
  <div class="exb-section" style="padding-top:26px;">
    <div class="exb-sec-title">📤 Мои игры (${myGames.length})
      <button class="exb-btn2 exb-btn2-blue" style="margin-left:auto;font-size:11px;" onclick="exbTab('studio')">🛠 Открыть Studio</button>
    </div>
    ${myGames.length ? `<div class="exb-cards-row">${exbGameCards(myGames)}</div>` : '<div style="color:rgba(255,255,255,.3);font-size:13px;padding:30px 0;">У вас ещё нет опубликованных игр</div>'}
  </div>`;
}

// ════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════
function exbProfile(c) {
  const me = EXB.users[EXB.user] || {};
  c.innerHTML = `
  <div class="exb-section" style="padding-top:26px;max-width:520px;">
    <div class="exb-sec-title">👤 Профиль</div>
    <div class="exb-profile-card" style="flex-direction:column;align-items:flex-start;gap:10px;">
      <div style="font-size:18px;font-weight:700;">${me.isGuest?'👤 Гость':'👤 '+EXB.user}</div>
      ${!me.isGuest?`<div style="font-size:12px;color:rgba(255,255,255,.4);">📧 ${me.email||'—'}</div>`:''}
      ${!me.isGuest?`<div style="font-size:12px;color:#00b2ff;">🎫 Код: ${me.code||'—'}</div>`:''}
      <div style="font-size:12px;color:rgba(255,255,255,.4);">💰 ${me.robux||0} R$</div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);">👥 Друзей: ${(me.friends||[]).length}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);">🛠 Проектов: ${(me.projects||[]).length}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);">📤 Опубликовано: ${(me.pubGames||[]).length}</div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="exb-btn2 exb-btn2-red" onclick="exbLogout()">🚪 Выйти</button>
      ${me.isGuest?`<button class="exb-btn2 exb-btn2-blue" onclick="exbLogout()">Создать аккаунт</button>`:''}
    </div>
  </div>`;
}

// ════════════════════════════════════════════
// AI CHAT
// ════════════════════════════════════════════
function exbAI(c) {
  c.innerHTML = `
  <div class="exb-ai-wrap" style="height:calc(100vh - 160px);">
    <div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.07);font-size:16px;font-weight:700;background:#0c0e14;flex-shrink:0;">
      🤖 Exiblox AI — Умный помощник
      <span style="font-size:11px;color:#2ecc71;margin-left:10px;">● Online</span>
    </div>
    <div class="exb-ai-msgs" id="exb-ai-msgs"></div>
    <div style="padding:8px 16px;border-top:1px solid rgba(255,255,255,.06);background:#0c0e14;flex-shrink:0;display:flex;gap:8px;flex-wrap:wrap;">
      ${['Как создать игру?','Что такое Baseplate?','Как опубликовать?','Советы по Studio'].map(q=>`
        <div onclick="exbAIQuick('${q}')" style="padding:5px 12px;border-radius:16px;background:rgba(255,255,255,.07);font-size:11px;color:rgba(255,255,255,.6);cursor:pointer;border:1px solid rgba(255,255,255,.08);" onmouseover="this.style.background='rgba(0,178,255,.2)'" onmouseout="this.style.background='rgba(255,255,255,.07)'">${q}</div>`).join('')}
    </div>
    <div class="exb-ai-input-row" style="flex-shrink:0;">
      <input class="exb-ai-input" id="exb-ai-inp" placeholder="Задай вопрос Exiblox AI..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();exbAISend();}">
      <button class="exb-btn2 exb-btn2-blue" onclick="exbAISend()" style="padding:10px 18px;">➤ Отправить</button>
    </div>
  </div>`;
  exbAIMsg('bot','Привет! Я Exiblox AI 🤖 Помогу с созданием игр, Studio и всем остальным!');
  EXB.aiHistory = [];
}

function exbAIMsg(who, text) {
  const msgs = el('exb-ai-msgs');
  if(!msgs) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:10px;align-items:flex-start;' + (who==='user'?'flex-direction:row-reverse;':'');
  if(who==='bot'){
    div.innerHTML=`<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#00b2ff,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🤖</div>
    <div class="exb-ai-bubble-bot">${escHtmlExb(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}</div>`;
  } else {
    div.innerHTML=`<div class="exb-ai-bubble-user">${escHtmlExb(text)}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function exbAISend() {
  const inp = el('exb-ai-inp');
  if(!inp) return;
  const text = inp.value.trim();
  if(!text) return;
  inp.value = '';
  exbAIMsg('user', text);
  EXB.aiHistory.push({role:'user',content:text});

  // Typing indicator
  const msgs = el('exb-ai-msgs');
  const typing = document.createElement('div');
  typing.id = 'exb-typing';
  typing.style.cssText='display:flex;gap:10px;align-items:flex-start;';
  typing.innerHTML=`<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#00b2ff,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:16px;">🤖</div>
    <div class="exb-ai-bubble-bot" style="display:flex;gap:4px;align-items:center;">
      <span class="edot"></span><span class="edot"></span><span class="edot"></span>
    </div>`;
  if(msgs) msgs.appendChild(typing);
  if(msgs) msgs.scrollTop=msgs.scrollHeight;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-5-20250929',
        max_tokens:1000,
        system:'Ты — Exiblox AI, умный помощник игровой платформы Exiblox v3. Помогаешь с созданием игр в ExiStudio, публикацией, работой с друзьями. Отвечай по-русски, кратко и дружелюбно. Используй **жирный** для выделений.',
        messages: EXB.aiHistory.slice(-16)
      })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'Не удалось получить ответ.';
    typing.remove();
    EXB.aiHistory.push({role:'assistant',content:reply});
    exbAIMsg('bot', reply);
  } catch(e) {
    typing.remove();
    exbAIMsg('bot','⚠️ Ошибка соединения. Попробуй позже.');
  }
}

function exbAIQuick(q) {
  const inp = el('exb-ai-inp');
  if(inp) { inp.value = q; exbAISend(); }
}

// ════════════════════════════════════════════
// GAME PLAYER
// ════════════════════════════════════════════
function exbPlayGame(id) {
  const game = EXB.games.find(g=>g.id===id);
  if(!game) return;
  exbOpenGame(game);
}

function exbOpenGame(game) {
  const overlay = document.createElement('div');
  overlay.id='exb-game-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:99999;display:flex;flex-direction:column;';
  const W=800,H=480;
  overlay.innerHTML=`
  <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;background:#111;border-bottom:1px solid #222;">
    <span style="font-size:18px;">${game.icon||'🎮'}</span>
    <span style="font-size:14px;font-weight:700;">${escHtmlExb(game.name)}</span>
    <span style="font-size:11px;color:rgba(255,255,255,.4);margin-left:8px;">← → движение · Пробел прыжок</span>
    <button onclick="document.getElementById('exb-game-overlay').remove()" style="margin-left:auto;background:#e74c3c;border:none;color:#fff;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;">✕ Выйти</button>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a2040;">
    <canvas id="exb-game-canvas" width="${W}" height="${H}" style="border-radius:8px;box-shadow:0 0 40px rgba(0,0,0,.8);"></canvas>
    <div style="display:flex;gap:16px;margin-top:12px;align-items:center;">
      <button id="exb-g-left" style="background:#252850;border:none;color:#fff;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:20px;font-weight:700;">◀</button>
      <span id="exb-g-score" style="color:#FFD700;font-size:16px;font-weight:700;min-width:140px;text-align:center;">🪙 0</span>
      <button id="exb-g-jump" style="background:#c0392b;border:none;color:#fff;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:20px;font-weight:700;">▲</button>
      <button id="exb-g-right" style="background:#252850;border:none;color:#fff;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:20px;font-weight:700;">▶</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  exbRunGame(game, W, H);
}

function exbRunGame(game, W, H) {
  const canvas = el('exb-game-canvas');
  if(!canvas) return;
  const cv = canvas.getContext('2d');
  const FLOOR = H - 60;
  const GRAVITY = 0.55, JUMP_FORCE = -13, SPEED = 5;
  const RAINBOW = ['#ff0000','#ff7700','#ffff00','#00cc00','#0000ff','#8800cc'];

  let px=100,py=FLOOR-50,vx=0,vy=0,onGround=true,step=0;
  const keys={left:false,right:false};

  const objs = game.objects || [];
  const platforms = objs.filter(o=>o.type==='block').map(o=>({x:o.x,y:o.y,w:o.w,h:o.h,color:o.color||'#4a9a30'}));
  const coins = objs.filter(o=>o.type==='coin').map(o=>({x:o.x+o.w/2,y:o.y+o.h/2}));
  if(!platforms.length) platforms.push({x:0,y:FLOOR,w:W*3,h:40,color:'#4a9a30'},{x:200,y:340,w:140,h:18,color:'#4a9a30'},{x:420,y:270,w:140,h:18,color:'#4a9a30'},{x:600,y:200,w:140,h:18,color:'#4a9a30'});
  if(!coins.length) [{x:240,y:320},{x:460,y:250},{x:640,y:180},{x:330,y:150}].forEach(c=>coins.push(c));

  const collected = new Set();
  let scored = 0;

  // Controls
  const setKey=(k,v)=>keys[k]=v;
  el('exb-g-left').addEventListener('mousedown',()=>setKey('left',true));
  el('exb-g-left').addEventListener('mouseup',()=>setKey('left',false));
  el('exb-g-left').addEventListener('mouseleave',()=>setKey('left',false));
  el('exb-g-right').addEventListener('mousedown',()=>setKey('right',true));
  el('exb-g-right').addEventListener('mouseup',()=>setKey('right',false));
  el('exb-g-right').addEventListener('mouseleave',()=>setKey('right',false));
  el('exb-g-jump').addEventListener('click',doJump);
  document.addEventListener('keydown',onKey);
  document.addEventListener('keyup',onKeyUp);

  function onKey(e){
    if(e.key==='ArrowLeft') setKey('left',true);
    if(e.key==='ArrowRight') setKey('right',true);
    if(e.key===' '||e.key==='ArrowUp') doJump();
  }
  function onKeyUp(e){
    if(e.key==='ArrowLeft') setKey('left',false);
    if(e.key==='ArrowRight') setKey('right',false);
  }
  function doJump(){if(onGround){vy=JUMP_FORCE;onGround=false;}}

  function update(){
    if(keys.left) vx=-SPEED;
    else if(keys.right) vx=SPEED;
    else vx*=0.75;
    vy+=GRAVITY;
    px+=vx; py+=vy;
    px=Math.max(0,Math.min(px,W-40));
    if(py>H+100){py=FLOOR-50;px=100;vy=0;}
    onGround=false;
    for(const p of platforms){
      if(px+38>p.x&&px<p.x+p.w&&py+50>p.y&&py+50<p.y+p.h+vy+2&&vy>=0){
        py=p.y-50;vy=0;onGround=true;
      }
    }
    coins.forEach((c,i)=>{
      if(!collected.has(i)&&Math.abs(px+20-c.x)<24&&Math.abs(py+25-c.y)<24){
        collected.add(i);scored++;
        const sc=el('exb-g-score');
        if(sc)sc.textContent=`🪙 ${scored} / ${coins.length}`;
      }
    });
    step=(step+1)%60;
  }

  function draw(){
    // Sky gradient
    const grad=cv.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#1a2040');grad.addColorStop(1,'#0d1230');
    cv.fillStyle=grad;cv.fillRect(0,0,W,H);
    // Platforms
    for(const p of platforms){
      cv.fillStyle=p.color||'#4a9a30';
      cv.fillRect(p.x,p.y,p.w,p.h);
      cv.fillStyle='rgba(255,255,255,.15)';
      cv.fillRect(p.x,p.y,p.w,6);
    }
    // Coins
    coins.forEach((c,i)=>{
      if(!collected.has(i)){
        const pulse=1+0.08*Math.sin(step/8);
        const r=11*pulse;
        cv.beginPath();cv.arc(c.x,c.y,r,0,Math.PI*2);
        cv.fillStyle='#FFD700';cv.fill();
        cv.strokeStyle='#FFA500';cv.lineWidth=2;cv.stroke();
      }
    });
    // Player (rainbow)
    const rc=(o=0)=>RAINBOW[Math.floor((step/8+o))%RAINBOW.length];
    const bx=Math.round(px),by=Math.round(py);
    cv.fillStyle=rc(0);cv.beginPath();cv.ellipse(bx+20,by+35,20,18,0,0,Math.PI*2);cv.fill();
    cv.fillStyle=rc(1);cv.beginPath();cv.ellipse(bx+20,by+16,18,16,0,0,Math.PI*2);cv.fill();
    // HUD
    cv.fillStyle='rgba(0,0,0,.5)';cv.fillRect(0,0,W,28);
    cv.fillStyle='#fff';cv.font='bold 13px Segoe UI';
    cv.fillText(`🪙 ${scored}/${coins.length}`,12,19);
    cv.fillText(game.name||'Игра',W/2-40,19);
  }

  let running=true;
  function loop(){
    if(!el('exb-game-canvas')){
      document.removeEventListener('keydown',onKey);
      document.removeEventListener('keyup',onKeyUp);
      return;
    }
    update();draw();
    requestAnimationFrame(loop);
  }
  loop();
}

// ════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════
function exbDoSearch(query) {
  if(!query.trim()) return;
  const results = EXB.games.filter(g=>g.name.toLowerCase().includes(query.toLowerCase()));
  const c = el('exb-content');
  if(!c) return;
  EXB.tab = 'home';
  document.querySelectorAll('.exb-nav-btn').forEach(b=>b.classList.remove('exb-active'));
  c.innerHTML=`
  <div class="exb-section" style="padding-top:26px;">
    <div class="exb-sec-title">🔍 Поиск: "${escHtmlExb(query)}"</div>
    ${results.length ? `<div class="exb-cards-row">${exbGameCards(results)}</div>` : '<div style="color:rgba(255,255,255,.3);font-size:13px;padding:30px 0;">Ничего не найдено 😕</div>'}
    <button class="exb-btn2 exb-btn2-gray" style="margin-top:16px;" onclick="exbTab('home')">← Назад</button>
  </div>`;
}

// ════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════
function escHtmlExb(t) {
  return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
