'use strict';

// ════════════════════════════════════════════
// GLOBALS
// ════════════════════════════════════════════
let currentUser = null;
let nightMode = false;
let startOpen = false;
let trayOpen = false;
let selectedIcon = null;
let isLightTheme = false;
let selectedAvatarReg = '🧑';

const DAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
const MONTHS_G = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

function el(id){ return document.getElementById(id); }
function pad(x){ return String(x).padStart(2,'0'); }

// ════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════
window.addEventListener('load', () => {
  updateClock();
  setInterval(updateClock, 1000);
  loadTheme();
  setTimeout(afterBoot, 2600);
});

function afterBoot(){
  const boot = el('boot');
  boot.style.transition = 'opacity .5s';
  boot.style.opacity = '0';
  setTimeout(() => boot.remove(), 500);
  const saved = localStorage.getItem('exiwin_user');
  if(saved){ currentUser = JSON.parse(saved); showLockScreen(); }
  else showRegScreen();
}

// ════════════════════════════════════════════
// CLOCK
// ════════════════════════════════════════════
function updateClock(){
  const n = new Date();
  const hm = pad(n.getHours())+':'+pad(n.getMinutes());
  const hms = hm+':'+pad(n.getSeconds());
  const dateStr = pad(n.getDate())+'.'+pad(n.getMonth()+1)+'.'+n.getFullYear();
  const longDate = DAYS[n.getDay()]+', '+n.getDate()+' '+MONTHS_G[n.getMonth()];
  if(el('clock-time'))    el('clock-time').textContent = hm;
  if(el('clock-date-tb')) el('clock-date-tb').textContent = dateStr;
  if(el('lock-clock'))    el('lock-clock').textContent = hm;
  if(el('lock-date-lock'))el('lock-date-lock').textContent = longDate;
  if(el('tray-time-big')) el('tray-time-big').textContent = hms;
  if(el('tray-date-str')) el('tray-date-str').textContent = longDate+' '+n.getFullYear();
}

// ════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════
function loadTheme(){
  const t = localStorage.getItem('exiwin_theme');
  if(t === 'light'){
    isLightTheme = true;
    document.body.classList.add('light-theme');
  }
}

function toggleLightTheme(){
  if(isLightTheme) return;
  isLightTheme = true;
  document.body.classList.add('light-theme');
  el('tr-light-theme').classList.replace('off','on');
  el('tr-dark-theme').classList.replace('on','off');
  localStorage.setItem('exiwin_theme','light');
  showNotif('ExiWin','Светлая тема включена','☀️');
}

function toggleDarkTheme(){
  if(!isLightTheme) return;
  isLightTheme = false;
  document.body.classList.remove('light-theme');
  el('tr-dark-theme').classList.replace('off','on');
  el('tr-light-theme').classList.replace('on','off');
  localStorage.setItem('exiwin_theme','dark');
  showNotif('ExiWin','Тёмная тема включена','🌑');
}

function toggleNightMode(){
  nightMode = !nightMode;
  document.body.style.filter = nightMode ? 'sepia(0.25) hue-rotate(-20deg)' : '';
  el('tr-night').classList.toggle('off');
  el('tr-night').classList.toggle('on');
  showNotif('Ночной режим', nightMode ? 'Включён' : 'Выключён','🌙');
}

function toggleTile(id, label){
  const t = el(id);
  const wasOn = t.classList.contains('on');
  t.classList.toggle('off', wasOn);
  t.classList.toggle('on', !wasOn);
  showNotif(label, !wasOn ? label+' включён' : label+' выключен', !wasOn ? '✅' : '⭕');
}

function setBright(v){
  if(el('desktop')) el('desktop').style.filter = `brightness(${v/100})`;
  if(el('bright-val')) el('bright-val').textContent = v+'%';
}

function setVol(v){
  if(el('vol-val')) el('vol-val').textContent = v+'%';
}

// ════════════════════════════════════════════
// AUTH - REGISTER / LOGIN
// ════════════════════════════════════════════
function showRegScreen(){
  el('regscreen').style.display='flex';
  el('reg-box').style.display='block';
  el('login-box').style.display='none';
}

function showLogin(){
  const u = JSON.parse(localStorage.getItem('exiwin_user')||'null');
  if(!u){ showRegScreen(); return; }
  el('login-avatar').textContent = u.avatar||'🧑';
  el('login-name-disp').textContent = u.name;
  el('reg-box').style.display='none';
  el('login-box').style.display='block';
}

function showRegister(){
  el('reg-box').style.display='block';
  el('login-box').style.display='none';
}

function pickAv(elem){
  document.querySelectorAll('.av-opt').forEach(a=>a.classList.remove('sel'));
  elem.classList.add('sel');
  selectedAvatarReg = elem.dataset.av;
}

function doRegister(){
  const name = el('reg-name').value.trim();
  const pass = el('reg-pass').value;
  const pass2 = el('reg-pass2').value;
  if(!name){ el('reg-err').textContent='Введите имя'; return; }
  if(pass.length<4){ el('reg-err').textContent='Пароль минимум 4 символа'; return; }
  if(pass!==pass2){ el('reg-err').textContent='Пароли не совпадают'; return; }
  const user = { name, pass, avatar:selectedAvatarReg };
  localStorage.setItem('exiwin_user', JSON.stringify(user));
  currentUser = user;
  el('regscreen').style.display='none';
  enterDesktop();
}

function doLogin(){
  const saved = JSON.parse(localStorage.getItem('exiwin_user')||'{}');
  if(el('login-pass').value !== saved.pass){ el('login-err').textContent='Неверный пароль'; return; }
  currentUser = saved;
  el('regscreen').style.display='none';
  el('lockscreen').style.display='none';
  enterDesktop();
}

// ════════════════════════════════════════════
// LOCK SCREEN
// ════════════════════════════════════════════
function showLockScreen(){
  if(!currentUser) currentUser = JSON.parse(localStorage.getItem('exiwin_user'));
  el('lock-avatar').textContent = currentUser.avatar||'🧑';
  el('lock-username-disp').textContent = currentUser.name;
  const ls = el('lockscreen');
  ls.style.display='flex';
  ls.onclick = () => {
    ls.style.transition='opacity .4s';
    ls.style.opacity='0';
    setTimeout(()=>{ ls.style.display='none'; enterDesktop(); }, 400);
  };
}

function lockScreen(){
  hideAll();
  el('lock-avatar').textContent = currentUser.avatar||'🧑';
  el('lock-username-disp').textContent = currentUser.name;
  const ls = el('lockscreen');
  ls.style.opacity='0';
  ls.style.display='flex';
  ls.style.transition='opacity .4s';
  setTimeout(()=> ls.style.opacity='1', 10);
}

// ════════════════════════════════════════════
// DESKTOP ENTER
// ════════════════════════════════════════════
function enterDesktop(){
  updateUserUI();
  loadNotepadContent();
  loadExianCode();
  initPaint();
  tmRender('processes');
  initFileSys();
  showNotif('ExiWin 12','Добро пожаловать, '+currentUser.name+'!','E✦');
  setTimeout(()=>showNotif('Exian.AI 3.0','C++ IDE готов к работе','🤖'),1800);
  setTimeout(()=>showNotif('ExiWin Update','Система обновлена до версии 24H2','✅'),3200);
}

function updateUserUI(){
  if(!currentUser) return;
  if(el('sm-username')) el('sm-username').textContent = currentUser.name;
  if(el('sm-avatar'))   el('sm-avatar').textContent   = currentUser.avatar||'🧑';
}

// ════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════
function showNotif(title, msg, icon='🔔'){
  const stack = el('notif-stack');
  const n = document.createElement('div');
  n.className='notif';
  n.innerHTML=`<div class="nico">${icon}</div>
    <div class="notif-txt"><div class="nt">${title}</div><div class="nd">${msg}</div></div>
    <div class="notif-close" onclick="this.parentElement.remove()">✕</div>`;
  stack.appendChild(n);
  setTimeout(()=>{
    n.style.transition='opacity .4s,transform .4s';
    n.style.opacity='0'; n.style.transform='translateX(30px)';
    setTimeout(()=>n.remove(),400);
  },4000);
}

// ════════════════════════════════════════════
// START / TRAY / MENUS
// ════════════════════════════════════════════
function toggleStart(e){
  e.stopPropagation();
  startOpen=!startOpen;
  const sm=el('start-menu');
  sm.style.display=startOpen?'flex':'none';
  setTimeout(()=>sm.classList.toggle('show',startOpen),10);
  if(startOpen){ trayOpen=false; el('tray-popup').style.display='none'; }
}

function toggleTray(e){
  e.stopPropagation();
  trayOpen=!trayOpen;
  el('tray-popup').style.display=trayOpen?'block':'none';
  if(trayOpen){ startOpen=false; el('start-menu').style.display='none'; el('start-menu').classList.remove('show'); }
}

function hideAll(){
  startOpen=false; trayOpen=false;
  el('start-menu').style.display='none';
  el('start-menu').classList.remove('show');
  el('tray-popup').style.display='none';
  el('ctx-menu').style.display='none';
  document.querySelectorAll('.np-menu-item.open').forEach(m=>m.classList.remove('open'));
}

function desktopClick(e){
  hideAll();
  if(selectedIcon && !e.target.closest('.desk-icon')){
    selectedIcon.classList.remove('selected');
    selectedIcon=null;
  }
}

function selectIcon(elem){
  if(selectedIcon) selectedIcon.classList.remove('selected');
  elem.classList.add('selected');
  selectedIcon=elem;
}

// ════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════
const APP_SEARCH = [
  {name:'Проводник',key:'explorer',ico:'📁'},
  {name:'Блокнот',key:'notepad',ico:'📝'},
  {name:'Браузер Edge',key:'browser',ico:'🌐'},
  {name:'Калькулятор',key:'calc',ico:'🧮'},
  {name:'Paint',key:'paint',ico:'🎨'},
  {name:'Параметры',key:'settings',ico:'⚙️'},
  {name:'Диспетчер задач',key:'taskman',ico:'📊'},
  {name:'Exian.AI 3.0',key:'exianai',ico:'🤖'},
];

function smSearch(v){
  const sec = el('sm-pinned-sec');
  const rec = el('sm-rec-list');
  if(!v.trim()){ sec.style.display=''; rec.style.display=''; el('sm-search-results').innerHTML=''; return; }
  sec.style.display='none'; rec.style.display='none';
  const q = v.toLowerCase();
  const found = APP_SEARCH.filter(a=>a.name.toLowerCase().includes(q));
  const r = el('sm-search-results');
  r.innerHTML = found.length
    ? found.map(a=>`<div class="rec-row" ondblclick="openApp('${a.key}');hideAll()"><div class="ico">${a.ico}</div><div class="rec-info"><div class="n">${a.name}</div></div></div>`).join('')
    : '<div style="padding:14px 18px;color:var(--text2);font-size:13px;">Ничего не найдено</div>';
}

// ════════════════════════════════════════════
// CONTEXT MENU
// ════════════════════════════════════════════
function showCtxMenu(e, type){
  e.preventDefault();
  const m=el('ctx-menu');
  m.style.display='block';
  m.style.left=Math.min(e.clientX,window.innerWidth-220)+'px';
  m.style.top=Math.min(e.clientY,window.innerHeight-180)+'px';
  el('ctx-new-file').style.display = type==='explorer'?'flex':'none';
}

function ctxNewFile(){ showNotif('Проводник','Новый файл создан','📄'); hideAll(); }
function ctxRefresh(){ showNotif('ExiWin','Обновлено','🔃'); hideAll(); }

// ════════════════════════════════════════════
// POWER
// ════════════════════════════════════════════
function reboot(){
  showNotif('ExiWin 12','Перезагрузка...','🔄');
  setTimeout(()=>location.reload(),1500);
}

function shutdown(){
  document.body.innerHTML=`<div style="background:#000;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:20px;color:#fff;">
    <div style="font-size:72px;background:linear-gradient(135deg,#0078d4,#60cdff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">E✦</div>
    <div style="color:rgba(255,255,255,.5);font-size:16px;">Выключение ExiWin 12...</div>
  </div>`;
  setTimeout(()=>location.reload(),2500);
}

document.addEventListener('click', hideAll);
