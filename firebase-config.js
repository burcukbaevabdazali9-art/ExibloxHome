// ════════════════════════════════════════════
// FIREBASE CONFIG — Настоящее облако для Exiblox
// ════════════════════════════════════════════

// ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
// 1. Иди на https://console.firebase.google.com
// 2. Создай новый проект (бесплатно!)
// 3. Добавь Web App (</> кнопка)
// 4. Скопируй config отсюда и вставь ниже
// 5. В Realtime Database включи тестовый режим (Rules):
//    {
//      "rules": {
//        ".read": true,
//        ".write": true
//      }
//    }

// ──────────────────────────────────────────
// ВСТАВЬ СВОЙ CONFIG СЮДА ↓
// ──────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "ТВОЙ_API_KEY",
  authDomain: "твой-проект.firebaseapp.com",
  databaseURL: "https://твой-проект-default-rtdb.firebaseio.com",
  projectId: "твой-проект",
  storageBucket: "твой-проект.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// ──────────────────────────────────────────
// НЕ ТРОГАЙ КОД НИЖЕ!
// ──────────────────────────────────────────

// Загрузка Firebase SDK
const FIREBASE_SCRIPTS = [
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js'
];

let firebaseReady = false;
let firebaseDB = null;

// Инициализация Firebase
async function initFirebase() {
  if (firebaseReady) return true;
  
  try {
    // Проверка что config заполнен
    if (FIREBASE_CONFIG.apiKey === "ТВОЙ_API_KEY") {
      console.warn('⚠️ Firebase не настроен! Используется localStorage.');
      return false;
    }
    
    // Загрузка скриптов
    for (const src of FIREBASE_SCRIPTS) {
      await loadScript(src);
    }
    
    // Инициализация
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK не загрузился');
      return false;
    }
    
    firebase.initializeApp(FIREBASE_CONFIG);
    firebaseDB = firebase.database();
    firebaseReady = true;
    
    console.log('✅ Firebase подключен! Облачное хранилище активно.');
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    return false;
  }
}

// Загрузка скрипта
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ════════════════════════════════════════════
// API ДЛЯ EXIBLOX
// ════════════════════════════════════════════

// Проверка доступности Firebase
window.exbFirebaseAvailable = () => firebaseReady;

// Загрузить все игры из облака
window.exbFirebaseLoadGames = async () => {
  if (!firebaseReady) {
    console.log('Firebase не готов, загрузка из localStorage');
    return JSON.parse(localStorage.getItem('exiblox_games') || '[]');
  }
  
  try {
    const snapshot = await firebaseDB.ref('games').once('value');
    const gamesObj = snapshot.val() || {};
    const games = Object.values(gamesObj);
    console.log(`✅ Загружено ${games.length} игр из Firebase`);
    return games;
  } catch (error) {
    console.error('❌ Ошибка загрузки игр:', error);
    return JSON.parse(localStorage.getItem('exiblox_games') || '[]');
  }
};

// Сохранить игру в облако
window.exbFirebaseSaveGame = async (game) => {
  if (!firebaseReady) {
    console.log('Firebase не готов, сохранение в localStorage');
    const games = JSON.parse(localStorage.getItem('exiblox_games') || '[]');
    
    // Проверка дубликата
    const idx = games.findIndex(g => g.id === game.id || (g.author === game.author && g.name === game.name));
    if (idx >= 0) {
      games[idx] = game;
    } else {
      games.unshift(game);
    }
    
    localStorage.setItem('exiblox_games', JSON.stringify(games));
    return true;
  }
  
  try {
    // Сохранение по ID игры
    await firebaseDB.ref(`games/${game.id}`).set(game);
    console.log(`✅ Игра "${game.name}" сохранена в Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения игры:', error);
    return false;
  }
};

// Удалить игру из облака
window.exbFirebaseDeleteGame = async (gameId) => {
  if (!firebaseReady) {
    const games = JSON.parse(localStorage.getItem('exiblox_games') || '[]');
    const filtered = games.filter(g => g.id !== gameId);
    localStorage.setItem('exiblox_games', JSON.stringify(filtered));
    return true;
  }
  
  try {
    await firebaseDB.ref(`games/${gameId}`).remove();
    console.log(`✅ Игра удалена из Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка удаления игры:', error);
    return false;
  }
};

// Подписаться на обновления игр (real-time)
window.exbFirebaseOnGamesChange = (callback) => {
  if (!firebaseReady) return;
  
  firebaseDB.ref('games').on('value', (snapshot) => {
    const gamesObj = snapshot.val() || {};
    const games = Object.values(gamesObj);
    callback(games);
  });
};

// Отписаться от обновлений
window.exbFirebaseOffGamesChange = () => {
  if (!firebaseReady) return;
  firebaseDB.ref('games').off();
};

// ════════════════════════════════════════════
// СТАТИСТИКА
// ════════════════════════════════════════════

// Получить количество онлайн игроков (пример)
window.exbFirebaseGetOnlineCount = async () => {
  if (!firebaseReady) return 0;
  
  try {
    const snapshot = await firebaseDB.ref('presence').once('value');
    return Object.keys(snapshot.val() || {}).length;
  } catch {
    return 0;
  }
};

// Установить статус онлайн
window.exbFirebaseSetOnline = (username) => {
  if (!firebaseReady) return;
  
  const userRef = firebaseDB.ref(`presence/${username}`);
  userRef.set(true);
  userRef.onDisconnect().remove();
};

// ════════════════════════════════════════════
console.log('🔥 Firebase config загружен. Вызови initFirebase() для подключения.');
