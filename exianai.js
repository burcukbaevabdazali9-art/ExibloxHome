'use strict';

// ════════════════════════════════════════════
// EXIAN.AI 3.0 — УМНЫЙ ЧАТ
// ════════════════════════════════════════════
let chatHistory = [];
let chatSessions = [];
let currentSessionId = null;
let isTyping = false;

function initExianChat() {
  loadChatSessions();
  loadCurrentSession();
  renderSessionList();
  if (chatHistory.length === 0) {
    addBotMessage('Привет! Я **Exian.AI 3.0** — умный ассистент в ExiWin 12.\n\nЗадай любой вопрос — отвечу как ChatGPT! 🤖');
  } else {
    renderAllMessages();
  }
  const input = el('exian-chat-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); exianSendMessage(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }
}

// ── ОТПРАВКА ─────────────────────────────────
async function exianSendMessage() {
  const input = el('exian-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text || isTyping) return;
  input.value = '';
  input.style.height = 'auto';

  const time = new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
  chatHistory.push({ role:'user', content:text, time });
  appendUserMessage(text, time);

  isTyping = true;
  showTypingIndicator();
  updateSendBtn(false);

  try {
    const reply = await callExianAPI();
    hideTypingIndicator();
    const bt = new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
    chatHistory.push({ role:'assistant', content:reply, time:bt });
    appendBotMessage(reply, bt, true);
    saveCurrentSession();
  } catch(err) {
    hideTypingIndicator();
    appendBotMessage('⚠️ Ошибка соединения. Попробуй ещё раз.','',false);
  }
  isTyping = false;
  updateSendBtn(true);
}

// ── API ───────────────────────────────────────
async function callExianAPI() {
  const messages = chatHistory
    .filter(m => m.role==='user'||m.role==='assistant')
    .slice(-20)
    .map(m => ({ role:m.role, content:m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      system: 'Ты — Exian.AI 3.0, умный ассистент встроенный в операционную систему ExiWin 12. Отвечай на русском языке, дружелюбно и развёрнуто. Помогай с любыми вопросами: программирование, математика, наука, творчество, советы. Используй **жирный** текст для выделения. Будь как ChatGPT — полезным и умным.',
      messages
    })
  });

  const data = await response.json();
  if (data.content && data.content[0]) return data.content[0].text;
  throw new Error('Empty');
}

// ── РЕНДЕР ────────────────────────────────────
function appendUserMessage(text, time) {
  const list = el('exian-chat-messages');
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'echat-msg echat-user';
  div.innerHTML = `
    <div class="echat-bubble echat-bubble-user">${escHtml(text)}</div>
    <div class="echat-time">${time}</div>`;
  list.appendChild(div);
  scrollChatBottom();
}

function appendBotMessage(text, time, animate) {
  const list = el('exian-chat-messages');
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'echat-msg echat-bot' + (animate?' echat-animate':'');
  div.innerHTML = `
    <div class="echat-avatar-bot">🤖</div>
    <div class="echat-bot-wrap">
      <div class="echat-bot-name">Exian.AI 3.0</div>
      <div class="echat-bubble echat-bubble-bot">${fmtMd(text)}</div>
      <div class="echat-msg-footer">
        <span class="echat-time">${time}</span>
        <span class="echat-action" onclick="copyBotMsg(this)" title="Копировать">📋</span>
        <span class="echat-action" onclick="regenMsg()" title="Ещё раз">🔄</span>
      </div>
    </div>`;
  list.appendChild(div);
  scrollChatBottom();
}

function addBotMessage(text) {
  const t = new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
  chatHistory.push({ role:'assistant', content:text, time:t });
  appendBotMessage(text, t, false);
}

function renderAllMessages() {
  const list = el('exian-chat-messages');
  if (!list) return;
  list.innerHTML = '';
  chatHistory.forEach(m => {
    if (m.role==='user') appendUserMessage(m.content, m.time||'');
    else if (m.role==='assistant') appendBotMessage(m.content, m.time||'', false);
  });
}

function scrollChatBottom() {
  const list = el('exian-chat-messages');
  if (list) setTimeout(()=> list.scrollTop=list.scrollHeight, 60);
}

// ── TYPING ────────────────────────────────────
function showTypingIndicator() {
  const list = el('exian-chat-messages');
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'echat-msg echat-bot';
  div.id = 'echat-typing';
  div.innerHTML = `
    <div class="echat-avatar-bot">🤖</div>
    <div class="echat-bot-wrap">
      <div class="echat-bot-name">Exian.AI 3.0</div>
      <div class="echat-bubble echat-bubble-bot echat-typing">
        <span class="edot"></span><span class="edot"></span><span class="edot"></span>
      </div>
    </div>`;
  list.appendChild(div);
  scrollChatBottom();
}

function hideTypingIndicator() {
  const t = el('echat-typing'); if(t) t.remove();
}

function updateSendBtn(on) {
  const b = el('exian-send-btn');
  if(b) { b.style.opacity=on?'1':'0.4'; b.style.pointerEvents=on?'auto':'none'; }
}

// ── СЕССИИ ────────────────────────────────────
function loadChatSessions() {
  const s = localStorage.getItem('exiwin_chat_sessions');
  chatSessions = s ? JSON.parse(s) : [];
}

function saveChatSessions() {
  localStorage.setItem('exiwin_chat_sessions', JSON.stringify(chatSessions));
}

function loadCurrentSession() {
  const s = localStorage.getItem('exiwin_chat_current');
  if(s) { const d=JSON.parse(s); chatHistory=d.messages||[]; currentSessionId=d.id||null; }
}

function saveCurrentSession() {
  const firstUser = chatHistory.find(m=>m.role==='user');
  const title = firstUser ? firstUser.content.slice(0,42)+'...' : 'Новый чат';
  const date = new Date().toLocaleDateString('ru');
  if (!currentSessionId) {
    currentSessionId = Date.now().toString();
    chatSessions.unshift({ id:currentSessionId, title, date, messages:chatHistory });
  } else {
    const idx = chatSessions.findIndex(s=>s.id===currentSessionId);
    if(idx>=0) chatSessions[idx].messages=chatHistory;
    else chatSessions.unshift({ id:currentSessionId, title, date, messages:chatHistory });
  }
  localStorage.setItem('exiwin_chat_current', JSON.stringify({id:currentSessionId, messages:chatHistory}));
  saveChatSessions();
  renderSessionList();
}

function renderSessionList() {
  const list = el('exian-sessions-list');
  if(!list) return;
  if(chatSessions.length===0) {
    list.innerHTML='<div style="padding:12px;font-size:11px;color:var(--text2);text-align:center">Нет сохранённых чатов</div>';
    return;
  }
  list.innerHTML = chatSessions.slice(0,30).map(s=>`
    <div class="echat-session ${s.id===currentSessionId?'active':''}" onclick="loadSession('${s.id}')">
      <div class="echat-session-t">${escHtml(s.title)}</div>
      <div class="echat-session-d">${s.date}</div>
      <div class="echat-session-del" onclick="delSession(event,'${s.id}')">✕</div>
    </div>`).join('');
}

function loadSession(id) {
  const s = chatSessions.find(x=>x.id===id); if(!s) return;
  chatHistory=s.messages; currentSessionId=id;
  localStorage.setItem('exiwin_chat_current', JSON.stringify({id, messages:chatHistory}));
  renderAllMessages(); renderSessionList();
}

function delSession(e, id) {
  e.stopPropagation();
  chatSessions = chatSessions.filter(s=>s.id!==id);
  saveChatSessions();
  if(currentSessionId===id) newExianChat(); else renderSessionList();
}

function newExianChat() {
  chatHistory=[]; currentSessionId=null;
  localStorage.removeItem('exiwin_chat_current');
  const list=el('exian-chat-messages'); if(list) list.innerHTML='';
  renderSessionList();
  addBotMessage('Привет! Я **Exian.AI 3.0**. Задай любой вопрос! 🤖');
}

function clearAllChats() {
  if(!confirm('Удалить все чаты?')) return;
  chatSessions=[]; saveChatSessions(); newExianChat();
}

// ── ДЕЙСТВИЯ ─────────────────────────────────
function copyBotMsg(btn) {
  const bubble = btn.closest('.echat-bot-wrap').querySelector('.echat-bubble');
  navigator.clipboard.writeText(bubble.innerText).then(()=>{
    btn.textContent='✅'; setTimeout(()=>btn.textContent='📋',1500);
  });
}

async function regenMsg() {
  if(isTyping) return;
  const lastUser = [...chatHistory].reverse().find(m=>m.role==='user');
  if(!lastUser) return;
  const li = chatHistory.map(m=>m.role).lastIndexOf('assistant');
  if(li>=0) chatHistory.splice(li,1);
  renderAllMessages();
  isTyping=true; showTypingIndicator(); updateSendBtn(false);
  try {
    const reply = await callExianAPI();
    hideTypingIndicator();
    const t=new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
    chatHistory.push({role:'assistant',content:reply,time:t});
    appendBotMessage(reply,t,true);
    saveCurrentSession();
  } catch(e) {
    hideTypingIndicator();
    appendBotMessage('⚠️ Ошибка','',false);
  }
  isTyping=false; updateSendBtn(true);
}

function exianQuickPrompt(text) {
  const i=el('exian-chat-input'); if(i){i.value=text; exianSendMessage();}
}

// ── УТИЛИТЫ ──────────────────────────────────
function escHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtMd(text) {
  return escHtml(text)
    .replace(/```([\w]*)\n?([\s\S]*?)```/g,'<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\n/g,'<br>');
}

// ── Заглушки для совместимости ────────────────
function loadExianCode() { setTimeout(initExianChat, 100); }
function saveExianCode() {}
