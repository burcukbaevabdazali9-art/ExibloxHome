'use strict';

// ════════════════════════════════════════════
// WINDOW MANAGER
// ════════════════════════════════════════════
let zCounter = 200;
let openWindows = {};

const APP_MAP = {
  explorer: 'win-explorer',
  notepad:  'win-notepad',
  calc:     'win-calc',
  settings: 'win-settings',
  browser:  'win-browser',
  paint:    'win-paint',
  taskman:  'win-taskman',
  exianai:  'win-exianai',
};

function openApp(key){
  hideAll();
  const winId = APP_MAP[key];
  if(!winId) return;
  const win = el(winId);
  if(!win) return;

  if(win.style.display==='flex' && win.dataset.minimized !== '1'){
    bringFront(winId); return;
  }

  win.style.display='flex';
  win.dataset.minimized='0';
  bringFront(winId);

  const tb = el('tb-'+key);
  if(tb){ tb.classList.add('running','active-win'); }

  openWindows[key] = true;

  // Callback при открытии
  if(key==='taskman') tmRender('processes');
  if(key==='exianai') loadExianCode();
  if(key==='paint') initPaint();
}

function closeWin(key){
  const winId = APP_MAP[key];
  if(!winId) return;
  const win = el(winId);
  if(!win) return;

  win.style.animation='winClose .12s ease forwards';
  setTimeout(()=>{
    win.style.display='none';
    win.style.animation='';
    win.dataset.minimized='0';
  },120);

  const tb = el('tb-'+key);
  if(tb) tb.classList.remove('running','active-win');
  delete openWindows[key];

  if(key==='exianai') saveExianCode();
}

function minimizeWin(key){
  const winId = APP_MAP[key];
  if(!winId) return;
  const win = el(winId);
  win.style.transition='transform .2s,opacity .2s';
  win.style.transform='translateY(20px) scale(0.95)';
  win.style.opacity='0';
  setTimeout(()=>{
    win.style.display='none';
    win.style.transform='';
    win.style.opacity='';
    win.style.transition='';
    win.dataset.minimized='1';
  },200);
  const tb = el('tb-'+key);
  if(tb){ tb.classList.remove('active-win'); }
}

function bringFront(winId){
  zCounter++;
  el(winId).style.zIndex = zCounter;
  document.querySelectorAll('.tb-btn').forEach(b=>b.classList.remove('active-win'));
  // Найти ключ по winId
  for(let k in APP_MAP){
    if(APP_MAP[k]===winId){
      const tb=el('tb-'+k);
      if(tb) tb.classList.add('active-win');
    }
  }
}

function toggleMax(winId){
  const win=el(winId);
  if(win.classList.contains('maximized')){
    win.classList.remove('maximized');
    if(win._prevStyle){
      win.style.cssText=win._prevStyle;
    }
  } else {
    win._prevStyle=win.style.cssText;
    win.classList.add('maximized');
  }
}

// ════════════════════════════════════════════
// DRAG
// ════════════════════════════════════════════
function dragWin(e, winId){
  if(e.target.closest('.wb')) return;
  const win=el(winId);
  if(win.classList.contains('maximized')) return;
  bringFront(winId);
  const sx=e.clientX-win.offsetLeft;
  const sy=e.clientY-win.offsetTop;

  function onMove(ev){
    let x=ev.clientX-sx, y=ev.clientY-sy;
    x=Math.max(0,Math.min(x,window.innerWidth-win.offsetWidth));
    y=Math.max(0,Math.min(y,window.innerHeight-win.offsetHeight-48));
    win.style.left=x+'px'; win.style.top=y+'px';
  }
  function onUp(){ document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); }
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
}

// ════════════════════════════════════════════
// RESIZE
// ════════════════════════════════════════════
function resizeWin(e, winId){
  e.stopPropagation();
  const win=el(winId);
  const sx=e.clientX, sy=e.clientY;
  const sw=win.offsetWidth, sh=win.offsetHeight;

  function onMove(ev){
    win.style.width=Math.max(400,sw+(ev.clientX-sx))+'px';
    win.style.height=Math.max(280,sh+(ev.clientY-sy))+'px';
  }
  function onUp(){ document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); }
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
}

// ════════════════════════════════════════════
// TASKBAR CLICK (показать/скрыть окно)
// ════════════════════════════════════════════
function tbClick(key){
  const winId=APP_MAP[key];
  if(!winId) return;
  const win=el(winId);
  if(!win) return;
  if(win.style.display==='flex' && win.dataset.minimized!=='1'){
    minimizeWin(key);
  } else {
    openApp(key);
  }
}
