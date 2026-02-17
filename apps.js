'use strict';

// ════════════════════════════════════════════
// EXPLORER (Проводник)
// ════════════════════════════════════════════
const FS = {
  'Рабочий стол': ['📄 AI_NeuralNetwork.cpp','📄 README.md','🖼️ wallpaper.png'],
  'Документы':    ['📄 Заметки.txt','📄 Отчёт.docx','📊 Данные.xlsx'],
  'Загрузки':     ['📦 ExianAI_v3.zip','🎵 music.mp3','🎬 video.mp4'],
  'Изображения':  ['🖼️ photo1.png','🖼️ photo2.jpg','🖼️ screenshot.png'],
  'Музыка':       ['🎵 track01.mp3','🎵 track02.flac','🎵 playlist.m3u'],
  'ExiWin':       ['⚙️ system32','📁 drivers','📁 fonts','📄 version.txt'],
};

let expCurrentFolder = 'Рабочий стол';

function initFileSys(){
  renderExpFiles('Рабочий стол');
}

function expNav(folder){
  expCurrentFolder = folder;
  document.querySelectorAll('.exp-side-item').forEach(i=>{
    i.classList.toggle('active', i.dataset.folder===folder);
  });
  renderExpFiles(folder);
  if(el('exp-path')) el('exp-path').value = 'ExiWin://' + folder;
}

function renderExpFiles(folder){
  const fc = el('exp-files-content');
  if(!fc) return;
  const files = FS[folder]||[];
  fc.innerHTML = files.map(f=>`
    <div class="file-item" ondblclick="expOpenFile('${f.replace(/'/g,"\\'")}')">
      <div class="ico">${f.split(' ')[0]}</div>
      <div class="fname">${f.split(' ').slice(1).join(' ')}</div>
    </div>`).join('');
  if(el('exp-status')) el('exp-status').textContent = `Объектов: ${files.length}`;
}

function expOpenFile(f){
  showNotif('Проводник','Открывается: '+f,'📂');
}

function expSearch(v){
  if(!v){ renderExpFiles(expCurrentFolder); return; }
  const all = Object.values(FS).flat();
  const found = all.filter(f=>f.toLowerCase().includes(v.toLowerCase()));
  const fc = el('exp-files-content');
  if(!fc) return;
  fc.innerHTML = found.map(f=>`
    <div class="file-item">
      <div class="ico">${f.split(' ')[0]}</div>
      <div class="fname">${f.split(' ').slice(1).join(' ')}</div>
    </div>`).join('') || '<div style="padding:20px;color:var(--text2)">Не найдено</div>';
}

function expNewFolder(){
  const name = prompt('Имя папки:');
  if(!name) return;
  if(!FS[expCurrentFolder]) FS[expCurrentFolder]=[];
  FS[expCurrentFolder].unshift('📁 '+name);
  renderExpFiles(expCurrentFolder);
  showNotif('Проводник','Папка создана: '+name,'📁');
}

// ════════════════════════════════════════════
// NOTEPAD (Блокнот)
// ════════════════════════════════════════════
let npUnsaved = false;
let npFontSize = 14;

function loadNotepadContent(){
  const saved = localStorage.getItem('exiwin_notepad');
  if(saved && el('np-area')) el('np-area').value = saved;
  npUpdateStatus();
}

function npChanged(){
  npUnsaved=true;
  npUpdateTitle();
  npUpdateStatus();
  localStorage.setItem('exiwin_notepad', el('np-area').value);
}

function npUpdateStatus(){
  const area = el('np-area');
  if(!area) return;
  const txt=area.value;
  const lines=txt.split('\n').length;
  const words=txt.trim()?txt.trim().split(/\s+/).length:0;
  if(el('np-status-ln')) el('np-status-ln').textContent=`Строк: ${lines} | Слов: ${words}`;
  const cp = txt.substr(0,area.selectionStart);
  const cl = cp.split('\n');
  if(el('np-status-pos')) el('np-status-pos').textContent=`Стр ${cl.length}, Стб ${cl[cl.length-1].length+1}`;
}

function npUpdateTitle(){
  const win = el('win-notepad');
  if(!win) return;
  const t = win.querySelector('.tb-title');
  if(t) t.textContent = (npUnsaved?'● ':'')+'Блокнот';
}

function npToggleMenu(item){
  document.querySelectorAll('.np-menu-item').forEach(m=>{ if(m!==item) m.classList.remove('open'); });
  item.classList.toggle('open');
  event.stopPropagation();
}

function npNew(){
  if(npUnsaved && !confirm('Несохранённые изменения. Создать новый файл?')) return;
  el('np-area').value=''; npUnsaved=false; npUpdateTitle(); npUpdateStatus();
  hideAll();
}

function npSave(){
  localStorage.setItem('exiwin_notepad', el('np-area').value);
  npUnsaved=false; npUpdateTitle();
  showNotif('Блокнот','Файл сохранён','💾');
  hideAll();
}

function npCopy(){ document.execCommand('copy'); showNotif('Блокнот','Скопировано','📋'); hideAll(); }
function npSelectAll(){ el('np-area').select(); hideAll(); }

function npFind(){
  const q = prompt('Найти:');
  if(!q) return;
  const area=el('np-area'), txt=area.value, idx=txt.indexOf(q);
  if(idx>=0){ area.focus(); area.setSelectionRange(idx,idx+q.length); showNotif('Блокнот','Найдено на позиции '+idx,'🔍'); }
  else showNotif('Блокнот','Не найдено: '+q,'🔍');
  hideAll();
}

function npFontUp(){ npFontSize=Math.min(32,npFontSize+2); if(el('np-area')) el('np-area').style.fontSize=npFontSize+'px'; hideAll(); }
function npFontDown(){ npFontSize=Math.max(8,npFontSize-2); if(el('np-area')) el('np-area').style.fontSize=npFontSize+'px'; hideAll(); }

function npWrap(){
  const area=el('np-area');
  if(area) area.style.whiteSpace = area.style.whiteSpace==='pre'?'pre-wrap':'pre';
  hideAll();
}

// ════════════════════════════════════════════
// CALCULATOR
// ════════════════════════════════════════════
let calcExpr='', calcResult='0', calcMode='standard';

function calcPress(val){
  if(val==='C'){ calcExpr=''; calcResult='0'; }
  else if(val==='⌫'){ calcExpr=calcExpr.slice(0,-1); }
  else if(val==='='){ calcEval(); }
  else if(val==='±'){ calcExpr=calcExpr?String(-parseFloat(calcExpr)):'0'; }
  else if(val==='%'){ try{calcExpr=String(eval(calcExpr)/100);}catch(e){} }
  else { calcExpr+=val; }
  if(el('calc-expr'))   el('calc-expr').textContent   = calcExpr||'';
  if(el('calc-result')) el('calc-result').textContent = calcResult;
}

function calcEval(){
  try {
    let expr=calcExpr.replace(/×/g,'*').replace(/÷/g,'/').replace(/π/g,Math.PI).replace(/e/g,Math.E);
    calcResult=String(parseFloat(eval(expr).toFixed(10)));
    if(calcResult==='Infinity') calcResult='∞';
    if(calcResult==='NaN') calcResult='Ошибка';
    calcExpr='';
  } catch(e){ calcResult='Ошибка'; calcExpr=''; }
}

function calcSci(fn){
  try{
    const v=parseFloat(calcExpr||calcResult);
    let res;
    switch(fn){
      case 'sin': res=Math.sin(v*Math.PI/180); break;
      case 'cos': res=Math.cos(v*Math.PI/180); break;
      case 'tan': res=Math.tan(v*Math.PI/180); break;
      case 'sqrt': res=Math.sqrt(v); break;
      case 'log': res=Math.log10(v); break;
      case 'ln':  res=Math.log(v); break;
      case 'x2':  res=v*v; break;
      case 'x3':  res=v*v*v; break;
      case '1/x': res=1/v; break;
      case 'abs': res=Math.abs(v); break;
      case 'pi':  calcExpr=String(Math.PI); if(el('calc-expr'))el('calc-expr').textContent=calcExpr; return;
      default: res=v;
    }
    calcResult=String(parseFloat(res.toFixed(10)));
    if(el('calc-result')) el('calc-result').textContent=calcResult;
    calcExpr='';
  }catch(e){ calcResult='Ошибка'; if(el('calc-result'))el('calc-result').textContent=calcResult; }
}

function calcSetMode(mode){
  calcMode=mode;
  document.querySelectorAll('.calc-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  const sci=el('calc-sci');
  if(sci) sci.style.display=mode==='scientific'?'grid':'none';
}

// ════════════════════════════════════════════
// BROWSER
// ════════════════════════════════════════════
let brHistory=[];
let brHistIdx=-1;

function brNavigate(url){
  if(!url) url=el('br-url')?.value||'';
  if(!url.startsWith('http')) url='https://'+url;
  el('br-url').value=url;
  brHistory=brHistory.slice(0,brHistIdx+1);
  brHistory.push(url);
  brHistIdx++;
  el('br-newtab').style.display='none';
  el('br-frame').style.display='block';
  el('br-frame').src=url;
  showNotif('Edge','Загрузка: '+url,'🌐');
}

function brBack(){ if(brHistIdx>0){ brHistIdx--; el('br-frame').src=brHistory[brHistIdx]; el('br-url').value=brHistory[brHistIdx]; } }
function brForward(){ if(brHistIdx<brHistory.length-1){ brHistIdx++; el('br-frame').src=brHistory[brHistIdx]; el('br-url').value=brHistory[brHistIdx]; } }
function brRefresh(){ if(el('br-frame').src) el('br-frame').src=el('br-frame').src; }

function brSearch(q){
  brNavigate('https://www.google.com/search?q='+encodeURIComponent(q));
}

function brNewTab(){
  el('br-newtab').style.display='flex';
  el('br-frame').style.display='none';
  el('br-frame').src='';
  el('br-url').value='';
  brHistIdx=-1;
}

function brShortcut(url){
  brNavigate(url);
}

function brKeyNav(e){
  if(e.key==='Enter') brNavigate(el('br-url').value);
}

// ════════════════════════════════════════════
// PAINT
// ════════════════════════════════════════════
let paintCtx, paintDrawing=false;
let paintTool='pen', paintColor='#0078d4', paintSize=4;

function initPaint(){
  const canvas=el('paint-canvas');
  if(!canvas) return;
  const wrap=el('paint-canvas-wrap');
  if(!wrap) return;
  canvas.width=wrap.offsetWidth||800;
  canvas.height=wrap.offsetHeight||500;
  paintCtx=canvas.getContext('2d');
  paintCtx.fillStyle='#ffffff';
  paintCtx.fillRect(0,0,canvas.width,canvas.height);

  canvas.onmousedown=e=>{ paintDrawing=true; paintStart(e); };
  canvas.onmousemove=e=>{ if(paintDrawing) paintDraw(e); };
  canvas.onmouseup=e=>{ paintDrawing=false; paintCtx.beginPath(); };
  canvas.onmouseleave=()=>{ paintDrawing=false; paintCtx.beginPath(); };
}

function paintStart(e){
  const r=el('paint-canvas').getBoundingClientRect();
  paintCtx.beginPath();
  paintCtx.moveTo(e.clientX-r.left,e.clientY-r.top);
}

function paintDraw(e){
  const r=el('paint-canvas').getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  if(paintTool==='eraser'){
    paintCtx.fillStyle='#ffffff';
    paintCtx.fillRect(x-paintSize,y-paintSize,paintSize*2,paintSize*2);
    return;
  }
  if(paintTool==='fill'){
    paintCtx.fillStyle=paintColor;
    paintCtx.fillRect(0,0,el('paint-canvas').width,el('paint-canvas').height);
    return;
  }
  paintCtx.strokeStyle=paintColor;
  paintCtx.lineWidth=paintSize;
  paintCtx.lineCap='round';
  paintCtx.lineTo(x,y);
  paintCtx.stroke();
  paintCtx.beginPath();
  paintCtx.moveTo(x,y);
}

function selectPaintTool(t, elem){
  paintTool=t;
  document.querySelectorAll('.paint-tool').forEach(b=>b.classList.remove('active'));
  if(elem) elem.classList.add('active');
  const c=el('paint-canvas');
  if(c) c.style.cursor=t==='eraser'?'cell':t==='fill'?'crosshair':'crosshair';
}

function selectPaintColor(c, elem){
  paintColor=c;
  document.querySelectorAll('.paint-color').forEach(b=>b.classList.remove('active'));
  if(elem) elem.classList.add('active');
}

function setPaintSize(v){
  paintSize=parseInt(v);
  if(el('paint-size-val')) el('paint-size-val').textContent=v+'px';
}

function paintClear(){
  if(!paintCtx) return;
  paintCtx.fillStyle='#ffffff';
  paintCtx.fillRect(0,0,el('paint-canvas').width,el('paint-canvas').height);
}

function paintSave(){
  const canvas=el('paint-canvas');
  if(!canvas) return;
  const a=document.createElement('a');
  a.download='рисунок.png';
  a.href=canvas.toDataURL();
  a.click();
  showNotif('Paint','Сохранено как рисунок.png','🎨');
}

// ════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════
function setPage(page){
  document.querySelectorAll('.set-page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.set-side-item').forEach(i=>i.classList.remove('active'));
  const pg=el('set-'+page);
  if(pg) pg.classList.add('active');
  const si=document.querySelector(`.set-side-item[data-page="${page}"]`);
  if(si) si.classList.add('active');
}

function setResetUser(){
  if(!confirm('Сбросить аккаунт? Все данные будут удалены.')) return;
  localStorage.clear();
  location.reload();
}

// ════════════════════════════════════════════
// TASK MANAGER
// ════════════════════════════════════════════
let tmInterval=null;

const TM_PROCESSES = [
  {name:'ExiWin Explorer',cpu:1.2,ram:48,pid:1001,status:'Работает'},
  {name:'Exian.AI 3.0',cpu:0.5,ram:120,pid:1002,status:'Работает'},
  {name:'Edge Browser',cpu:3.1,ram:210,pid:1003,status:'Работает'},
  {name:'Paint',cpu:0.1,ram:32,pid:1004,status:'Работает'},
  {name:'Блокнот',cpu:0.0,ram:12,pid:1005,status:'Работает'},
  {name:'Калькулятор',cpu:0.0,ram:8,pid:1006,status:'Работает'},
  {name:'Диспетчер задач',cpu:0.8,ram:28,pid:1007,status:'Работает'},
  {name:'ExiWin Runtime',cpu:0.2,ram:64,pid:1008,status:'Работает'},
  {name:'Служба обновлений',cpu:0.0,ram:22,pid:1009,status:'Ожидание'},
  {name:'Аудио служба',cpu:0.1,ram:18,pid:1010,status:'Работает'},
];

function tmRender(tab){
  document.querySelectorAll('.tm-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));

  if(tab==='processes') tmRenderProcesses();
  else if(tab==='performance') tmRenderPerf();
  else if(tab==='startup') tmRenderStartup();

  if(tmInterval) clearInterval(tmInterval);
  if(tab==='performance') tmInterval=setInterval(tmRenderPerf,2000);
}

function tmRenderProcesses(){
  const tbody=el('tm-proc-body');
  if(!tbody) return;
  const rows=TM_PROCESSES.map((p,i)=>{
    const cpu=(p.cpu+Math.random()*0.5).toFixed(1);
    const ram=p.ram+Math.floor(Math.random()*4-2);
    return `<tr>
      <td>${p.name}</td>
      <td><div class="tm-bar"><div class="tm-fill" style="width:${cpu*10}%;background:${cpu>5?'#e74c3c':'var(--accent)'}"></div></div> ${cpu}%</td>
      <td><div class="tm-bar"><div class="tm-fill" style="width:${ram/4}%"></div></div> ${ram} MB</td>
      <td>${p.pid}</td>
      <td style="color:${p.status==='Работает'?'#2ecc71':'#f1c40f'}">${p.status}</td>
    </tr>`;
  });
  tbody.innerHTML=rows.join('');
}

function tmRenderPerf(){
  const cpuPct=Math.floor(Math.random()*30+5);
  const ramPct=Math.floor(Math.random()*20+45);
  const diskPct=Math.floor(Math.random()*10+2);
  const netPct=Math.floor(Math.random()*5+1);
  const body=el('tm-perf-body');
  if(!body) return;
  body.innerHTML=`
    <div class="tm-perf-grid">
      <div class="tm-perf-card">
        <div class="tm-perf-title">ЦП — ExiWin CPU</div>
        <div class="tm-perf-big">${cpuPct}%</div>
        <div class="tm-perf-bar"><div style="width:${cpuPct}%;height:100%;background:var(--accent);border-radius:3px;transition:width .5s"></div></div>
        <div class="tm-perf-info">4 ядра · 3.6 ГГц · x64</div>
      </div>
      <div class="tm-perf-card">
        <div class="tm-perf-title">ОЗУ</div>
        <div class="tm-perf-big">${ramPct}%</div>
        <div class="tm-perf-bar"><div style="width:${ramPct}%;height:100%;background:#9b59b6;border-radius:3px;transition:width .5s"></div></div>
        <div class="tm-perf-info">${Math.floor(ramPct*0.08)} GB / 8 GB</div>
      </div>
      <div class="tm-perf-card">
        <div class="tm-perf-title">Диск</div>
        <div class="tm-perf-big">${diskPct}%</div>
        <div class="tm-perf-bar"><div style="width:${diskPct}%;height:100%;background:#27ae60;border-radius:3px;transition:width .5s"></div></div>
        <div class="tm-perf-info">SSD 256 GB · NVMe</div>
      </div>
      <div class="tm-perf-card">
        <div class="tm-perf-title">Сеть</div>
        <div class="tm-perf-big">${netPct} Мбит</div>
        <div class="tm-perf-bar"><div style="width:${netPct*10}%;height:100%;background:#e67e22;border-radius:3px;transition:width .5s"></div></div>
        <div class="tm-perf-info">Wi-Fi · 100 Мбит/с</div>
      </div>
    </div>`;
}

function tmRenderStartup(){
  const body=el('tm-startup-body');
  if(!body) return;
  const apps=[
    {name:'ExiWin Explorer',impact:'Низкое',enabled:true},
    {name:'Exian.AI Service',impact:'Среднее',enabled:true},
    {name:'Edge Browser',impact:'Высокое',enabled:false},
    {name:'Аудио служба',impact:'Низкое',enabled:true},
    {name:'Служба обновлений',impact:'Низкое',enabled:true},
  ];
  body.innerHTML=apps.map(a=>`
    <tr>
      <td>${a.name}</td>
      <td style="color:${a.impact==='Высокое'?'#e74c3c':a.impact==='Среднее'?'#f1c40f':'#2ecc71'}">${a.impact}</td>
      <td><span style="cursor:pointer;color:${a.enabled?'#2ecc71':'var(--text2)'}" onclick="showNotif('Диспетчер','${a.name}: изменено','📊')">${a.enabled?'Включено':'Отключено'}</span></td>
    </tr>`).join('');
}
