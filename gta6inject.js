// gta6_inject.js — Adds GTA 6 into ExiWin 12 desktop
(function () {
  function inject() {
    // ── Desktop icon ──────────────────────────────────────────────
    const desktop = document.getElementById('desktop');
    if (desktop && !document.getElementById('desk-icon-gta6')) {
      const icon = document.createElement('div');
      icon.className = 'desk-icon';
      icon.id = 'desk-icon-gta6';
      icon.style.cssText = 'top:490px;left:118px';
      icon.innerHTML = '<div class="dico">🎮</div><span>GTA 6</span>';
      icon.ondblclick = () => openApp('gta6');
      icon.onclick = (e) => { e.stopPropagation(); if (typeof selectIcon === 'function') selectIcon(icon); };
      icon.onmousedown = (e) => { if (typeof iconDragStart === 'function') iconDragStart(e, icon); };
      desktop.appendChild(icon);
    }

    // ── Taskbar button ────────────────────────────────────────────
    const tbCenter = document.getElementById('tb-center');
    if (tbCenter && !document.getElementById('tb-gta6')) {
      const btn = document.createElement('div');
      btn.className = 'tb-btn';
      btn.id = 'tb-gta6';
      btn.title = 'GTA 6';
      btn.textContent = '🎮';
      btn.onclick = () => { if (typeof tbClick === 'function') tbClick('gta6'); else toggleGTA6(); };
      tbCenter.appendChild(btn);
    }

    // ── Window ────────────────────────────────────────────────────
    if (!document.getElementById('win-gta6')) {
      const win = document.createElement('div');
      win.className = 'window';
      win.id = 'win-gta6';
      win.style.cssText = 'width:1020px;height:680px;top:18px;left:30px;';
      win.onclick = () => { if (typeof bringFront === 'function') bringFront('win-gta6'); };
      win.innerHTML = `
        <div class="titlebar" onmousedown="if(typeof dragWin==='function')dragWin(event,'win-gta6')">
          <span class="tb-icon">🎮</span>
          <span class="tb-title" id="gta6-title">GTA 6 — ExiWin City</span>
          <div class="win-btns">
            <div class="wb" onclick="if(typeof minimizeWin==='function')minimizeWin('gta6')">─</div>
            <div class="wb" onclick="if(typeof toggleMax==='function')toggleMax('win-gta6')">⬜</div>
            <div class="wb cls" onclick="gta6Close()">✕</div>
          </div>
        </div>
        <div class="win-body" id="gta6-root" style="overflow:hidden;padding:0;"></div>
        <div class="resize-handle" onmousedown="if(typeof resizeWin==='function')resizeWin(event,'win-gta6')"></div>
      `;
      (document.getElementById('desktop') || document.body).appendChild(win);
    }

    // ── Patch openApp ─────────────────────────────────────────────
    const _orig = window.openApp;
    window.openApp = function (app) {
      if (app === 'gta6') {
        const w = document.getElementById('win-gta6');
        const root = document.getElementById('gta6-root');
        if (w) {
          w.style.display = 'flex';
          if (typeof bringFront === 'function') bringFront('win-gta6');
          const tb = document.getElementById('tb-gta6');
          if (tb) tb.classList.add('running', 'active-win');
          if (!GTA6._started && root) {
            GTA6.init(root);
            GTA6._started = true;
          }
        }
        return;
      }
      if (_orig) _orig.call(window, app);
    };

    // ── Patch closeWin / tbClick ──────────────────────────────────
    const _origClose = window.closeWin;
    window.closeWin = function (app) {
      if (app === 'gta6') { gta6Close(); return; }
      if (_origClose) _origClose.call(window, app);
    };
    window.gta6Close = function () {
      const w = document.getElementById('win-gta6');
      if (w) w.style.display = 'none';
      const tb = document.getElementById('tb-gta6');
      if (tb) tb.classList.remove('running', 'active-win');
      if (window.GTA6 && GTA6._started) { GTA6.stop(); GTA6._started = false; }
    };

    const _origTb = window.tbClick;
    window.tbClick = function (app) {
      if (app === 'gta6') {
        const w = document.getElementById('win-gta6');
        if (!w) return;
        if (w.style.display === 'none' || !w.style.display) openApp('gta6');
        else if (typeof bringFront === 'function') bringFront('win-gta6');
        return;
      }
      if (_origTb) _origTb.call(window, app);
    };

    // ── Add to Start Menu pinned apps ─────────────────────────────
    const pinned = document.querySelector('.pinned-apps');
    if (pinned && !document.getElementById('sm-pin-gta6')) {
      const pin = document.createElement('div');
      pin.className = 'pin-app';
      pin.id = 'sm-pin-gta6';
      pin.innerHTML = '<div class="ico">🎮</div><div class="lbl">GTA 6</div>';
      pin.onclick = () => { openApp('gta6'); if (typeof hideAll === 'function') hideAll(); };
      pinned.insertBefore(pin, pinned.firstChild);
    }
  }

  // Run after DOM + app scripts are ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(inject, 200));
  } else {
    setTimeout(inject, 200);
  }
})();
