'use strict';

// ════════════════════════════════════════════
// ExibloxOGStore — Оригинальный магазин Exiblox
// ЗАГЛУШКА v1.0
// ════════════════════════════════════════════

function initExibloxOGStore() {
  const root = document.getElementById('exibloxogstore-root');
  if (!root) return;

  root.innerHTML = `
  <style>
    #exibloxogstore-root {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(160deg, #08040f 0%, #0d0620 50%, #060410 100%);
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .ogs-bg-glow {
      position: absolute;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(160,0,255,0.12) 0%, transparent 70%);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: ogsPulse 4s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes ogsPulse {
      0%,100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
    }
    .ogs-logo {
      font-size: 56px;
      font-weight: 900;
      background: linear-gradient(135deg, #a000ff, #ff00cc, #00b2ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
      animation: ogsLogoShine 3s ease-in-out infinite;
    }
    @keyframes ogsLogoShine {
      0%,100% { filter: brightness(1); }
      50% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(160,0,255,0.6)); }
    }
    .ogs-subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }
    .ogs-badge {
      background: rgba(160,0,255,0.15);
      border: 1px solid rgba(160,0,255,0.35);
      border-radius: 24px;
      padding: 6px 20px;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }
    .ogs-progress-wrap {
      width: 280px;
      height: 4px;
      background: rgba(255,255,255,0.07);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 14px;
      position: relative;
      z-index: 1;
    }
    .ogs-progress-bar {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #a000ff, #ff00cc, #00b2ff, #a000ff);
      background-size: 200% 100%;
      animation: ogsBar 1.5s linear infinite;
      width: 60%;
    }
    @keyframes ogsBar {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    .ogs-status {
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      letter-spacing: 2px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .ogs-features {
      display: flex;
      gap: 16px;
      margin-top: 40px;
      position: relative;
      z-index: 1;
    }
    .ogs-feat {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      width: 110px;
      opacity: 0.5;
    }
    .ogs-feat-ico { font-size: 24px; margin-bottom: 6px; }
    .ogs-feat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); }
    .ogs-version {
      position: absolute;
      bottom: 14px;
      right: 16px;
      font-size: 10px;
      color: rgba(255,255,255,0.15);
      letter-spacing: 1px;
    }
  </style>
  <div class="ogs-bg-glow"></div>
  <div class="ogs-logo">✦ ExibloxOGStore</div>
  <div class="ogs-subtitle">Оригинальный магазин</div>
  <div class="ogs-badge">🔧 В разработке · Coming Soon</div>
  <div class="ogs-progress-wrap">
    <div class="ogs-progress-bar"></div>
  </div>
  <div class="ogs-status">Загрузка магазина...</div>
  <div class="ogs-features">
    <div class="ogs-feat"><div class="ogs-feat-ico">🛒</div><div class="ogs-feat-lbl">Магазин</div></div>
    <div class="ogs-feat"><div class="ogs-feat-ico">💎</div><div class="ogs-feat-lbl">Скины</div></div>
    <div class="ogs-feat"><div class="ogs-feat-ico">🎁</div><div class="ogs-feat-lbl">Бонусы</div></div>
    <div class="ogs-feat"><div class="ogs-feat-ico">⭐</div><div class="ogs-feat-lbl">VIP</div></div>
  </div>
  <div class="ogs-version">ExibloxOGStore v1.0 — STUB</div>
  `;
}
