const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');

// КОНФИГУРАЦИЯ
// URL вашего API сервера на PythonAnywhere
const API_URL = 'https://iseenoev1l.pythonanywhere.com';

let rolls = [
  "Special Rolls",
  "Philadelphia Rolls",
  "California Rolls",
  "Baked Rolls",
  "Tempura Rolls",
  "Volcano Rolls",
  "Dragon Rolls"
];

let isSpinning = false;
let deviceFingerprint = null;

// --- Инициализация ---
console.log('%c🍱 Watta Sushi Roulette', 'font-size: 20px; font-weight: bold; color: #12522D;');
console.log('%cСистема защиты от повторных попыток активна', 'color: #1a6d3f;');
generateSegments();
generateFingerprint();
createFloatingEmojis();

// --- ПОЛНАЯ БЛОКИРОВКА СКРОЛЛА И ЗУМА ---
document.addEventListener('touchstart', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault(); // Предотвращаем зум при мультитаче
  }
}, { passive: false });

document.addEventListener('touchend', function(e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault(); // Предотвращаем зум при быстром двойном тапе
  }
  lastTouchEnd = now;
}, { passive: false });

// Убираем лишнее пространство и блокируем скролл везде КРОМЕ лидерборда
document.addEventListener('DOMContentLoaded', function() {
  // Убираем лишнее пространство
  document.documentElement.style.height = '100vh';
  document.documentElement.style.width = '100vw';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.height = '100vh';
  document.body.style.width = '100vw';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '0';
  document.body.style.left = '0';
});

// Блокируем скролл везде КРОМЕ лидерборда
document.addEventListener('wheel', function(e) {
  // Разрешаем скролл только в лидерборде
  if (e.target.closest('.leaderboard-list') || e.target.closest('.leaderboard')) {
    return; // Не блокируем скролл в лидерборде
  }
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function(e) {
  // Разрешаем скролл только в лидерборде
  if (e.target.closest('.leaderboard-list') || e.target.closest('.leaderboard')) {
    return; // Не блокируем скролл в лидерборде
  }
  e.preventDefault();
}, { passive: false });

document.addEventListener('keydown', function(e) {
  // Разрешаем клавиши скролла только в лидерборде
  if (e.target.closest('.leaderboard-list') || e.target.closest('.leaderboard')) {
    return; // Не блокируем клавиши в лидерборде
  }
  
  // Блокируем клавиши скролла везде кроме лидерборда
  if ([32, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}, { passive: false });

let lastTouchEnd = 0;

// Загружаем лучший результат игрока при загрузке страницы
loadPlayerBestScore();

// Запускаем анимацию хедера
function startHeaderAnimation() {
  const animatedHeader = document.querySelector('.animated-header');
  if (animatedHeader) {
    // Запускаем анимацию через небольшую задержку
    setTimeout(() => {
      animatedHeader.classList.add('animate');
    }, 1000); // 1 секунда задержки
  }
}

// Функция для обновления позиций текста при изменении размера окна
function updateTextPositions() {
  const textElements = document.querySelectorAll('.prize-text');
  const numSegments = rolls.length;
  const degPerSeg = 360 / numSegments;
  
  textElements.forEach((textDiv, i) => {
    const angle = (i * degPerSeg) + (degPerSeg / 2);
    
    // Адаптивное расстояние от центра в зависимости от размера экрана
    const screenWidth = window.innerWidth;
    let distanceFromCenter;
    if (screenWidth < 400) {
      distanceFromCenter = '100px';
    } else if (screenWidth < 600) {
      distanceFromCenter = '120px';
    } else if (screenWidth < 768) {
      distanceFromCenter = '140px';
    } else {
      distanceFromCenter = '150px';
    }
    
    textDiv.style.transform = `rotate(${angle}deg) translate(-50%, -${distanceFromCenter})`;
    
    // Также обновляем разбиение текста
    const text = rolls[i];
    let maxLength;
    if (screenWidth < 400) {
      maxLength = 8;
    } else if (screenWidth < 600) {
      maxLength = 10;
    } else if (screenWidth < 768) {
      maxLength = 12;
    } else {
      maxLength = 12;
    }
    
    if (text.length > maxLength) {
      const words = text.split(' ');
      if (words.length > 1) {
        textDiv.innerHTML = words.join('<br>');
      } else {
        const mid = Math.ceil(text.length / 2);
        textDiv.innerHTML = text.substring(0, mid) + '<br>' + text.substring(mid);
      }
    } else {
      textDiv.textContent = text;
    }
  });
}

// Обработчик изменения размера окна
window.addEventListener('resize', updateTextPositions);

// Функции для управления видимостью элементов
function hideControls() {
  const controls = document.querySelector('.controls');
  const input = document.getElementById('insta');
  const button = document.getElementById('spinBtn');
  
  // Скрываем контролы с анимацией
  controls.classList.add('hidden');
  controls.classList.remove('visible');
  
  // Скрываем результат
  resultEl.classList.add('hidden');
  resultEl.classList.remove('visible');
  
  // Отключаем интерактивность
  input.disabled = true;
  button.disabled = true;
}

function showResult() {
  // Показываем результат с анимацией
  resultEl.classList.remove('hidden');
  resultEl.classList.add('visible');
}

function showControls() {
  const controls = document.querySelector('.controls');
  const input = document.getElementById('insta');
  const button = document.getElementById('spinBtn');
  
  // Показываем контролы с анимацией
  controls.classList.remove('hidden');
  controls.classList.add('visible');
  
  // Скрываем результат и промо-секцию
  resultEl.classList.add('hidden');
  resultEl.classList.remove('visible');
  
  const promoSection = document.getElementById('promoSection');
  promoSection.classList.add('hide');
  promoSection.classList.remove('show');
  
  // Убираем класс hide после завершения анимации
  setTimeout(() => {
    promoSection.classList.remove('hide');
  }, 300);
  
  // Включаем интерактивность
  input.disabled = false;
  button.disabled = false;
  
  // Очищаем поле ввода
  input.value = '';
}

function showPromo() {
  const controls = document.querySelector('.controls');
  const promoSection = document.getElementById('promoSection');
  
  // Скрываем контролы
  controls.classList.add('hidden');
  controls.classList.remove('visible');
  
  // Скрываем результат
  resultEl.classList.add('hidden');
  resultEl.classList.remove('visible');
  
  // Показываем промо-секцию
  promoSection.classList.add('show');
}

// Запускаем анимацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  startHeaderAnimation();
  // Инициализируем состояние контролов
  showControls();
});

  // Функция для повторного запуска анимации
window.restartHeaderAnimation = function() {
  const animatedHeader = document.querySelector('.animated-header');
  if (animatedHeader) {
    // Сбрасываем анимацию
    animatedHeader.classList.remove('animate');
    
    // Запускаем заново через небольшую задержку
    setTimeout(() => {
      animatedHeader.classList.add('animate');
    }, 100);
  }
};

// --- Функция для сброса fingerprint (для тестирования) ---
// Откройте консоль и введите: resetFingerprint()
window.resetFingerprint = function() {
  localStorage.removeItem('wattasushi_device_fp');
  console.log('🔄 Fingerprint сброшен! Обновите страницу для генерации нового.');
};

// --- Функция для просмотра текущего fingerprint ---
window.showFingerprint = function() {
  if (deviceFingerprint) {
    console.log('🔐 Текущий fingerprint:', deviceFingerprint);
    return deviceFingerprint;
  } else {
    console.log('⚠️ Fingerprint еще не сгенерирован');
    return null;
  }
};

// --- Функция для отладки области клика креветок ---
window.debugShrimp = function() {
  const shrimps = document.querySelectorAll('.floating-emoji.shrimp');
  
  shrimps.forEach(shrimp => {
    const before = window.getComputedStyle(shrimp, '::before');
    
    // Временно показываем область клика
    shrimp.style.setProperty('--debug-mode', '1');
    const style = document.createElement('style');
    style.id = 'shrimp-debug';
    style.textContent = `
      .floating-emoji.shrimp::before {
        background: rgba(255, 0, 0, 0.2) !important;
        border: 2px dashed red !important;
      }
      .floating-emoji.shrimp {
        background: rgba(0, 255, 0, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
    
   
  });
  
  return shrimps.length;
};

// --- Функция для отключения отладки ---
window.debugOff = function() {
  const style = document.getElementById('shrimp-debug');
  if (style) {
    style.remove();
  
  }
};

// --- Функция для тестирования креветок ---
window.testShrimp = function() {
  const shrimps = document.querySelectorAll('.floating-emoji.shrimp');
 
  
  shrimps.forEach((shrimp, index) => {
   
    
    // Добавляем временную подсветку
    shrimp.style.background = 'rgba(255, 0, 0, 0.2)';
    shrimp.style.border = '2px solid red';
    
    setTimeout(() => {
      shrimp.style.background = '';
      shrimp.style.border = '';
    }, 3000);
  });
  
  return shrimps.length;
};

// --- Генерация сегментов рулетки ---
function generateSegments() {
  const numSegments = rolls.length;
  const degPerSeg = 360 / numSegments;
  
 
  const colors = [
    '#12522D', 
    '#1a6d3f', 
    '#0d3d1f', 
    '#228b51', 
    '#12522D', 
    '#1a6d3f',
    '#0d3d1f',
    '#228b51'
  ];


  for (let i = 0; i < numSegments; i++) {
    const seg = document.createElement('div');
    seg.className = 'segment';
    const rotation = i * degPerSeg;
    
    seg.style.transform = `rotate(${rotation}deg) skewY(${-(90 - degPerSeg)}deg)`;
    seg.style.backgroundColor = colors[i % colors.length];
    
    wheel.appendChild(seg);
  }
  
  // Создаем текст ОТДЕЛЬНО, поверх сегментов
  for (let i = 0; i < numSegments; i++) {
    const textDiv = document.createElement('div');
    textDiv.className = 'prize-text';
    
    // Угол для текста (центр сегмента)
    const angle = (i * degPerSeg) + (degPerSeg / 2);
    
    // Позиционируем текст с адаптивным расстоянием
    textDiv.style.position = 'absolute';
    textDiv.style.left = '50%';
    textDiv.style.top = '50%';
    
    // Адаптивное расстояние от центра в зависимости от размера экрана
    const screenWidth = window.innerWidth;
    let distanceFromCenter;
    if (screenWidth < 400) {
      distanceFromCenter = '100px'; // Ближе к центру для очень маленьких экранов
    } else if (screenWidth < 600) {
      distanceFromCenter = '120px'; // Ближе к центру для маленьких экранов
    } else if (screenWidth < 768) {
      distanceFromCenter = '140px'; // Среднее расстояние для планшетов
    } else {
      distanceFromCenter = '150px'; // Стандартное расстояние для больших экранов
    }
    
    textDiv.style.transform = `rotate(${angle}deg) translate(-50%, -${distanceFromCenter})`;
    textDiv.style.transformOrigin = '0 0';
    
    // Форматируем текст (разбиваем длинные названия)
    const text = rolls[i];
    
    // Адаптивная длина для разбиения в зависимости от размера экрана
    let maxLength;
    if (screenWidth < 400) {
      maxLength = 8; // Более агрессивное разбиение для очень маленьких экранов
    } else if (screenWidth < 600) {
      maxLength = 10; // Более агрессивное разбиение для маленьких экранов
    } else if (screenWidth < 768) {
      maxLength = 12; // Стандартное разбиение для планшетов
    } else {
      maxLength = 12; // Стандартное разбиение для больших экранов
    }
    
    if (text.length > maxLength) {
      // Разбиваем на 2 строки для длинных названий
      const words = text.split(' ');
      if (words.length > 1) {
        textDiv.innerHTML = words.join('<br>');
      } else {
        // Если это одно слово, разбиваем по символам
        const mid = Math.ceil(text.length / 2);
        textDiv.innerHTML = text.substring(0, mid) + '<br>' + text.substring(mid);
      }
    } else {
      textDiv.textContent = text;
    }
    
    wheel.appendChild(textDiv);
    
    
  }
  
 
}

// --- Генерация уникального fingerprint устройства ---
async function generateFingerprint() {
  // Проверяем есть ли уже сохраненный fingerprint
  const savedFingerprint = localStorage.getItem('wattasushi_device_fp');
  
  if (savedFingerprint) {
    deviceFingerprint = savedFingerprint;
    console.log('🔐 Device Fingerprint (saved):', deviceFingerprint.substring(0, 16) + '...');
    return;
  }
  
  // Генерируем новый fingerprint только если его нет
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  
  // Рисуем более сложный паттерн для уникальности
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('WattaSushi🍱', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Canvas Fingerprint', 4, 17);
  
  // Собираем стабильные компоненты (без canvas)
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.languages ? navigator.languages.join(',') : '',
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
    screen.availWidth + 'x' + screen.availHeight,
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown',
    navigator.platform,
    navigator.vendor || '',
    navigator.maxTouchPoints || 0,
    // Canvas добавляем в конце
    canvas.toDataURL()
  ];
  
  const fingerprint = await hashString(components.join('###WATTA###'));
  deviceFingerprint = fingerprint;
  
  // Сохраняем в localStorage для следующих визитов
  try {
    localStorage.setItem('wattasushi_device_fp', fingerprint);
   
  } catch (e) {
    console.warn('⚠️ Не удалось сохранить fingerprint:', e);
  }
}

async function hashString(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Основная логика рулетки ---
spinBtn.onclick = async () => {
  if (isSpinning) return;
  
  const insta = document.getElementById('insta').value.trim().replace('@', '');
  
  // Проверка на админ-код
  if (insta.toLowerCase() === 'admin') {
    openAdminPanel();
    return;
  }
  
  // Проверка на отключение админки
  if (insta.toLowerCase() === 'disableadmin') {
    await disableAdminPermanently();
    return;
  }
  
  if (!insta) {
    alert('❌ Будь ласка, введіть ваш Instagram!');
    return;
  }
  
  if (insta.length < 3) {
    alert('❌ Instagram повинен містити мінімум 3 символи!');
    return;
  }

  // Скрываем контролы и показываем индикатор проверки
  hideControls();
  
  // Показываем индикатор проверки
  resultEl.textContent = '🔍 Перевірка...';
  resultEl.style.color = '#12522D';
  showResult();
  
  try {
    const checkResponse = await fetch(`${API_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fingerprint: deviceFingerprint,
        instagram: insta
      })
    });
    
    const checkResult = await checkResponse.json();
    
    if (!checkResult.allowed) {
      resultEl.textContent = '⚠️ Ви вже взяли участь в розіграші!';
      resultEl.style.color = '#e74c3c';
      
      let reason = '';
      if (checkResult.reason === 'fingerprint') {
        reason = 'Ви вже крутили рулетку з цього пристрою!';
      } else if (checkResult.reason === 'instagram') {
        reason = 'Цей Instagram аккаунт вже взяв участь!';
      }
      
      alert(`⚠️ ${reason}\n\n` +
            `Instagram: @${checkResult.data.instagram}\n` +
            `Приз: ${checkResult.data.prize}\n` +
            `Дата: ${checkResult.data.timestamp}`);
      
      // Показываем промо-секцию
      setTimeout(() => {
        showPromo();
      }, 1000);
      return;
    }
  } catch (error) {
    console.error('❌ Ошибка проверки:', error);
    alert('❌ Помилка з сервером. Перевірте підключення до інтернету.');
    resultEl.textContent = '❌ Помилка з сервером';
    resultEl.style.color = '#e74c3c';
    
    // Показываем промо-секцию
    setTimeout(() => {
      showPromo();
    }, 1000);
    return;
  }

  // Начинаем прокрутку
  isSpinning = true;
  resultEl.textContent = '🎰 Крутимо...';
  resultEl.style.color = '#12522D';

  const numSegments = rolls.length;
  const degPerSeg = 360 / numSegments;
  const randomIndex = Math.floor(Math.random() * numSegments);
  const stopAngle = 3600 + (randomIndex * degPerSeg) + degPerSeg / 2;

  wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
  wheel.style.transform = `rotate(-${stopAngle}deg)`;

  setTimeout(async () => {
    const prize = rolls[randomIndex];
    
    // Показываем результат с анимацией
    resultEl.textContent = `🎉 Ви виграли: ${prize}!`;
    resultEl.style.color = '#12522D';
    
    await saveResult(insta, prize);
    
    // Показываем модальное окно через небольшую задержку
    setTimeout(() => {
      showPrizeModal(prize);
    }, 500);
    
    isSpinning = false;
  }, 4100);
};

async function saveResult(instagram, prize) {
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint: deviceFingerprint,
        instagram: instagram,
        prize: prize
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Результат збережений на сервері');
      
      if (result.is_duplicate) {
        console.warn('⚠️ Виявлено повторну спробу:', result.duplicate_reason);
      }
    } else {
      console.error('❌ Помилка збереження результату');
    }
  } catch (error) {
    console.error('❌ Помилка відправки результату:', error);
  }
}

function showPrizeModal(prize) {
  const modal = document.getElementById('prizeModal');
  const prizeText = document.getElementById('prizeText');
  const secretHint = document.getElementById('secretHint');
  
  prizeText.textContent = `Ви виграли: ${prize}!`;
  
  const hintShown = localStorage.getItem('shrimpHintShown');
  
  if (!hintShown) {     
    secretHint.style.display = 'block';
    localStorage.setItem('shrimpHintShown', 'true');
   
  } else {
    // Скрываем подсказку если уже показывали
    secretHint.style.display = 'none';
  }
  
  modal.classList.add('active');
}

window.closePrizeModal = function() {
  const modal = document.getElementById('prizeModal');
  modal.classList.remove('active');
  
  // Показываем промо-секцию после закрытия модального окна
  setTimeout(() => {
    showPromo();
  }, 300); // Небольшая задержка для плавности
};

// --- Секретная миниигра ---
function openMinigame() {
 
  const overlay = document.getElementById('minigameOverlay');
  const startTitle = document.getElementById('gameStartTitle');
  const startText1 = document.getElementById('gameStartText1');
  const startText2 = document.getElementById('gameStartText2');
  
  // Проверяем, показывали ли подсказку про креветку
  const hintShown = localStorage.getItem('shrimpHintShown');
  
  if (!hintShown) {
    startTitle.textContent = '🤫 Тсс...';
    startText1.textContent = 'Ти схоже знайшов секретну мінігру раніше ніж треба!';
    startText2.textContent = ' Щасти в риболовлі! 🎣';
  } else {
    startTitle.textContent = '🎣 Риболовля!';
    startText1.textContent = 'Ви знайшли секретну мінігру!';
    startText2.innerHTML = 'Тапайте по кнопці, щоб утримати<br>індикатор в зеленій зоні!';
  }

  overlay.classList.add('active');
  
}

window.closeMinigame = function() {
  const overlay = document.getElementById('minigameOverlay');
  overlay.classList.remove('active');
  
  // Останавливаем игру если она идет
  if (gameState.isPlaying) {
    stopGame();
  }
  
  // Показываем стартовый экран
  document.getElementById('gameStart').style.display = 'block';
  document.getElementById('gamePlay').style.display = 'none';
  document.getElementById('gameEnd').style.display = 'none';
  
  // Показываем промо-секцию после закрытия миниигры
  setTimeout(() => {
    showPromo();
  }, 300);
  
  
}

  const gameState = {
  isPlaying: false,
  score: 0,
  time: 10,
  indicatorPosition: 50, // процент від висоти
  indicatorVelocity: 0,
  zonePosition: 50,
  gameLoop: null,
  timerInterval: null
};

window.startFishingGame = function() {

  document.getElementById('gameStart').style.display = 'none';
  document.getElementById('gamePlay').style.display = 'block';
  document.getElementById('gameEnd').style.display = 'none';
  
  
  gameState.isPlaying = true;
  gameState.score = 0;
  gameState.time = 10;
  gameState.indicatorPosition = 50;
  gameState.indicatorVelocity = 0;
  gameState.zonePosition = Math.random() * 60 + 20; // 20-80%
  
  
  document.getElementById('gameScore').textContent = '0';
  document.getElementById('gameTimer').textContent = '10';
  
   
  const tapButton = document.getElementById('tapButton');
  
  
  tapButton.addEventListener('touchstart', function(e) {
    e.preventDefault();
    handleTap();
  }, { passive: false });
  
 
  tapButton.onclick = handleTap;
  
  
  startGameLoop();
  
 
  gameState.timerInterval = setInterval(() => {
    gameState.time--;
    document.getElementById('gameTimer').textContent = gameState.time;
    
    if (gameState.time <= 0) {
      endGame();
    }
  }, 1000);
  
 
}

function handleTap() {
  if (!gameState.isPlaying) return;
  
 
  gameState.indicatorVelocity = -2.5; // Було -4, стало -2.5 (слабее)
}

function startGameLoop() {
  const barHeight = 400; // висота в пікселях
  const indicator = document.getElementById('fishingIndicator');
  const zone = document.getElementById('fishingZone');
  const zoneHeight = 80; // висота зони в пікселях
  
  gameState.gameLoop = setInterval(() => {
    if (!gameState.isPlaying) return;
    
    
    gameState.indicatorVelocity += 0.3;
    
   
    gameState.indicatorPosition += gameState.indicatorVelocity;
    
   
    if (gameState.indicatorPosition < 0) {
      gameState.indicatorPosition = 0;
      gameState.indicatorVelocity = 0;
    }
    if (gameState.indicatorPosition > 100) {
      gameState.indicatorPosition = 100;
      gameState.indicatorVelocity = 0;
    }
    
   
    if (Math.random() < 0.02) { // 2% шанс каждый кадр
      gameState.zonePosition = Math.random() * 60 + 20; // 20-80%
    }
    
   
    indicator.style.top = `${gameState.indicatorPosition}%`;
    zone.style.top = `${gameState.zonePosition}%`;
    
   
    const indicatorTop = gameState.indicatorPosition;
    const zoneTop = gameState.zonePosition;
    const zoneBottom = gameState.zonePosition + (zoneHeight / barHeight * 100);
    
    if (indicatorTop >= zoneTop && indicatorTop <= zoneBottom) {
     
      gameState.score += 1;
      document.getElementById('gameScore').textContent = gameState.score;
      
      
      zone.style.background = 'rgba(76, 175, 80, 0.6)';
    } else {
      zone.style.background = 'rgba(76, 175, 80, 0.4)';
    }
  }, 1000 / 60); 
}

function stopGame() {
  gameState.isPlaying = false;
  clearInterval(gameState.gameLoop);
  clearInterval(gameState.timerInterval);
}

async function endGame() {
  stopGame();
  
  
  document.getElementById('gamePlay').style.display = 'none';
  document.getElementById('gameEnd').style.display = 'block';
  
  
  document.getElementById('finalScore').textContent = gameState.score;
  
  
  const endTitle = document.getElementById('gameEndTitle');
  const endEmoji = document.getElementById('gameEndEmoji');
  
  if (gameState.score >= 500) {
    endTitle.textContent = '🏆 Неймовірно!';
    endEmoji.textContent = '🦐✨';
  } else if (gameState.score >= 300) {
    endTitle.textContent = '🎉 Чудово!';
    endEmoji.textContent = '🦐';
  } else if (gameState.score >= 150) {
    endTitle.textContent = '😊 Добре!';
    endEmoji.textContent = '🐟';
  } else {
    endTitle.textContent = '😅 Спробуй ще!';
    endEmoji.textContent = '🦀';
  }
  
  
  await saveMinigameScore(gameState.score);
  
  
}


function createFloatingEmojis() {
  const emojis = ['🍣', '🍱', '🦐', '🦀', '🐟', '🥢', '🍙'];
          
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024;
  const emojiCount = isMobile ? 10 : (isTablet ? 14 : 18); // Больше эмоджи для лучшего эффекта

  // Создаем контейнер для эмоджи, чтобы они не влияли на размер страницы
  let emojiContainer = document.getElementById('emoji-container');
  if (!emojiContainer) {
    emojiContainer = document.createElement('div');
    emojiContainer.id = 'emoji-container';
    emojiContainer.style.position = 'fixed';
    emojiContainer.style.top = '0';
    emojiContainer.style.left = '0';
    emojiContainer.style.width = '100vw';
    emojiContainer.style.height = '100vh';
    emojiContainer.style.pointerEvents = 'none';
    emojiContainer.style.zIndex = '0';
    emojiContainer.style.overflow = 'hidden';
    document.body.appendChild(emojiContainer);
  } else {
    // Очищаем старые эмоджи при перезагрузке
    emojiContainer.innerHTML = '';
  }

  const emojiPool = [...emojis];
  
  // РОВНО 3 креветки на всех экранах
  const shrimpCount = 3; // Всегда 3 креветки
  for (let i = 0; i < shrimpCount; i++) {
    emojiPool.push('🦐');
  }
  
  // Заполняем остальными эмоджи
  while (emojiPool.length < emojiCount) {
    emojiPool.push(emojis[Math.floor(Math.random() * emojis.length)]);
  }

  for (let i = emojiPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emojiPool[i], emojiPool[j]] = [emojiPool[j], emojiPool[i]];
  }

  for (let i = 0; i < emojiCount; i++) {
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'floating-emoji';
    const emoji = emojiPool[i];
    emojiDiv.textContent = emoji;

    if (emoji === '🦐') {
      emojiDiv.classList.add('shrimp');

      let isActivated = false;

      // Упрощенный обработчик активации
      const activateShrimp = function() {
        if (isActivated) return;
        isActivated = true;
        

        // Вибрация на мобильных
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        // Визуальный эффект
        emojiDiv.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        emojiDiv.style.animation = 'none';
        emojiDiv.style.transform = 'scale(3) rotate(1080deg)';
        emojiDiv.style.filter = 'drop-shadow(0 0 50px rgba(255,235,59,1))';
        emojiDiv.style.zIndex = '10000';
        emojiDiv.style.opacity = '1';

        // Открываем миниигру
        setTimeout(() => {
          try {
            openMinigame();
          } catch (err) {
          
          }
        }, 200);

        // Сброс через 3 секунды
        setTimeout(() => {
          isActivated = false;
          emojiDiv.style.transition = '';
          emojiDiv.style.transform = '';
          emojiDiv.style.filter = '';
          emojiDiv.style.zIndex = '';
          emojiDiv.style.opacity = '';
          emojiDiv.style.animation = '';
        }, 3000);
      };

      // ПРЕДОТВРАЩАЕМ ЗУМ НА КРЕВЕТКАХ
      emojiDiv.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Блокируем зум на креветках
      }, { passive: false });

      // ПРОСТАЯ обработка touch - только touchend
      emojiDiv.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        activateShrimp();
      }, { passive: false });

      // Click для десктопа
      emojiDiv.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        activateShrimp();
      }, { passive: false });

    
    }

    // --- визуальные параметры ---
    // Креветки размещаем по бокам для удобства нажатия
    const randomX = (emoji === '🦐') 
      ? (i % 2 === 0 ? 15 : 75)  // Фиксированные позиции: 15% или 75%
      : 20 + (i * 5) % 60;      // Равномерное распределение 20-80%
    
    emojiDiv.style.left = `${randomX}vw`;
    emojiDiv.style.top = '100vh'; // Начинаем снизу экрана
    emojiDiv.style.animationDelay = `-${i * 3}s`; // Увеличенные задержки для более плавного появления
    
    // Медленные длительности анимации для плавного движения
    const duration = (emoji === '🦐') 
      ? 45  // Очень медленно для креветок
      : 35;  // Медленно для обычных эмоджи
    
    emojiDiv.style.animationDuration = `${duration}s`;
    
    // Фиксированные горизонтальные смещения
    const xOffset = (emoji === '🦐')
      ? (i % 2 === 0 ? -30 : 30)  // Фиксированные смещения для креветок
      : (i % 3 === 0 ? -50 : (i % 3 === 1 ? 0 : 50));  // Фиксированные смещения для обычных
    
    emojiDiv.style.setProperty('--x-offset', `${xOffset}px`);
    
    if (emoji !== '🦐') {
      emojiDiv.style.fontSize = `${45}px`; // Фиксированный размер
      emojiDiv.style.opacity = 0.15; // Фиксированная прозрачность
    }

    emojiContainer.appendChild(emojiDiv);
  }

  console.log('✨ Плавающие эмоджи созданы');
}

// --- Админ-панель ---
function addAdminLog(message, type = 'success') {
  const log = document.getElementById('adminLog');
  const entry = document.createElement('div');
  entry.className = `admin-log-entry ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

async function openAdminPanel() {
  const panel = document.getElementById('adminPanel');
  
  // Проверяем, не отключена ли админка
  try {
    const response = await fetch(`${API_URL}/admin/status`);
    const data = await response.json();
    
    if (!data.enabled) {
      alert('⛔ Админ-панель отключена навсегда!');
      document.getElementById('insta').value = '';
      return;
    }
  } catch (error) {
    console.error('❌ Ошибка проверки статуса админки:', error);
  }
  
  panel.classList.add('active');
  document.getElementById('insta').value = '';
  
  // Загружаем статистику
  await loadAdminStats();
  addAdminLog('Админ-панель открыта', 'success');
}

window.closeAdminPanel = function() {
  const panel = document.getElementById('adminPanel');
  panel.classList.remove('active');
  document.getElementById('adminLog').innerHTML = '';
};

async function loadAdminStats() {
  try {
    const response = await fetch(`${API_URL}/admin/stats`);
    const data = await response.json();
    
    document.getElementById('totalSpins').textContent = data.total_spins || 0;
    document.getElementById('totalFingerprints').textContent = data.total_fingerprints || 0;
    document.getElementById('totalInstagram').textContent = data.total_instagram || 0;
    
    addAdminLog('Статистика загружена', 'success');
  } catch (error) {
    console.error('❌ Ошибка загрузки статистики:', error);
    addAdminLog('Ошибка загрузки статистики', 'error');
  }
}

window.clearFingerprints = async function() {
  if (!confirm('⚠️ Вы уверены? Это удалит все fingerprints!')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/clear/fingerprints`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      addAdminLog(`✅ Удалено fingerprints: ${data.deleted}`, 'success');
      await loadAdminStats();
    } else {
      addAdminLog('❌ Ошибка удаления fingerprints', 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    addAdminLog('❌ Ошибка запроса', 'error');
  }
};

window.clearInstagram = async function() {
  if (!confirm('⚠️ Вы уверены? Это удалит все Instagram аккаунты!')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/clear/instagram`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      addAdminLog(`✅ Удалено Instagram: ${data.deleted}`, 'success');
      await loadAdminStats();
    } else {
      addAdminLog('❌ Ошибка удаления Instagram', 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    addAdminLog('❌ Ошибка запроса', 'error');
  }
};

window.clearAll = async function() {
  if (!confirm('⚠️⚠️⚠️ ВНИМАНИЕ! Это удалит ВСЕ данные безвозвратно!')) return;
  if (!confirm('Вы точно уверены? Это действие необратимо!')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/clear/all`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      addAdminLog(`✅ Удалено всего записей: ${data.deleted}`, 'warning');
      await loadAdminStats();
    } else {
      addAdminLog('❌ Ошибка удаления данных', 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    addAdminLog('❌ Ошибка запроса', 'error');
  }
};

window.exportData = async function() {
  try {
    const response = await fetch(`${API_URL}/admin/export`);
    const data = await response.json();
    
    // Создаем blob и скачиваем
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roulette_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addAdminLog('✅ Данные экспортированы', 'success');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    addAdminLog('❌ Ошибка экспорта', 'error');
  }
};

window.disableAdmin = async function() {
  if (!confirm('⚠️ ВНИМАНИЕ! Это НАВСЕГДА отключит админ-панель!')) return;
  if (!confirm('Вы точно уверены? Это действие НЕОБРАТИМО!')) return;
  if (!confirm('ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ! После этого доступ будет невозможен!')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/disable`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      addAdminLog('🔒 АДМИН-ПАНЕЛЬ ОТКЛЮЧЕНА НАВСЕГДА', 'error');
      alert('🔒 Админ-панель отключена навсегда! Больше вход невозможен.');
      setTimeout(() => {
        closeAdminPanel();
      }, 2000);
    } else {
      addAdminLog('❌ Ошибка отключения админки', 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    addAdminLog('❌ Ошибка запроса', 'error');
  }
};

async function disableAdminPermanently() {
  if (!confirm('⚠️ Вы вводите команду ОТКЛЮЧЕНИЯ АДМИНКИ! Продолжить?')) return;
  if (!confirm('Это НАВСЕГДА отключит доступ к админ-панели. Вы уверены?')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/disable`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      alert('🔒 Админ-панель успешно отключена навсегда!\n\nТеперь никто не сможет получить к ней доступ.');
      document.getElementById('insta').value = '';
    } else {
      alert('❌ Ошибка отключения админки');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    alert('❌ Ошибка связи с сервером');
  }
  
  document.getElementById('insta').value = '';
}

// --- Загрузка лучшего результата игрока ---
async function loadPlayerBestScore() {
  try {
    const response = await fetch(`${API_URL}/minigame/player-score?fingerprint=${deviceFingerprint}`);
    const data = await response.json();
    
    if (data.success && data.best_score !== null) {
      localStorage.setItem('playerBestScore', data.best_score);
    
    }
  } catch (error) {
    console.error('❌ Помилка завантаження найкращого результату:', error);
  }
}

// --- Лидерборд миниигры ---
async function loadLeaderboard() {
  try {
   
    const response = await fetch(`${API_URL}/minigame/leaderboard?fingerprint=${deviceFingerprint}`);
    
    const data = await response.json();
    
    
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (data.success && data.leaderboard && data.leaderboard.length > 0) {
      leaderboardList.innerHTML = '';
      
      data.leaderboard.forEach((player, index) => {
        
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // Подсвечиваем текущего игрока
        if (player.is_current_player) {
          item.classList.add('current-player');
        }
        
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'first';
        else if (rank === 2) rankClass = 'second';
        else if (rank === 3) rankClass = 'third';
        
        item.innerHTML = `
          <div class="rank ${rankClass}">${rank}</div>
          <div class="player-info">
            <div class="player-instagram clickable-instagram" data-instagram="${player.instagram}">@${player.instagram}</div>
          </div>
          <div class="score">${player.score}</div>
        `;
        
        leaderboardList.appendChild(item);
      });
      
      // Добавляем обработчики кликов для Instagram ников
      const instagramElements = document.querySelectorAll('.clickable-instagram');
      instagramElements.forEach(element => {
        element.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const instagram = this.getAttribute('data-instagram');
          if (instagram) {
            // Открываем Instagram профиль в новой вкладке
            const instagramUrl = `https://instagram.com/${instagram}`;
            window.open(instagramUrl, '_blank', 'noopener,noreferrer');
          }
        });
      });
    
    } else {
      leaderboardList.innerHTML = '<div class="loading">Пока нет гравців</div>';
    
    }
  } catch (error) {
    console.error('❌ Помилка завантаження лідерборда:', error);
    document.getElementById('leaderboardList').innerHTML = '<div class="loading">Помилка завантаження</div>';
  }
}

async function saveMinigameScore(score) {
  try {
   
    let instagram = document.getElementById('insta').value.trim().replace('@', '');
    
    if (!instagram) {
     
      instagram = localStorage.getItem('minigameInstagram');
      
      if (!instagram) {
       
        instagram = prompt('🎣 Відмінно! Ви знайшли секретну мінігру!\n\nВведіть ваш Instagram для участі в лідерборді:');
        
        if (!instagram) {
         
          return;
        }
        
        instagram = instagram.trim().replace('@', '');
        
        if (instagram.length < 3) {
          alert('❌ Instagram повинен містити мінімум 3 символи!');
          return;
        }
        
       
        localStorage.setItem('minigameInstagram', instagram);
       
      } else {
       
      }
    }
    

    const hintShown = localStorage.getItem('shrimpHintShown');
    const foundBeforeRoulette = !hintShown;
    
    const storedBestScore = localStorage.getItem('playerBestScore');
    const currentBestScore = storedBestScore ? parseInt(storedBestScore) : 0;
    
    console.log(`🎣 Поточний рахунок: ${score}, найкращий: ${currentBestScore}`);
    
    const response = await fetch(`${API_URL}/minigame/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint: deviceFingerprint,
        instagram: instagram,
        score: score,
        found_before_roulette: foundBeforeRoulette,
        current_best: currentBestScore
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.message === 'Score not improved') {
        console.log(`🎣 Результат не покращений: ${score} балів (найкращий: ${result.current_best})`);
        // Показываем сообщение игроку
        const endTitle = document.getElementById('gameEndTitle');
        const endEmoji = document.getElementById('gameEndEmoji');
        endTitle.textContent = 'Ти можеш краще!';
        endEmoji.textContent = '🎯';
        
        // Добавляем информацию о лучшем результате
        const finalScore = document.getElementById('finalScore');
        finalScore.innerHTML = `${score}<br><small>Найкращий: ${result.current_best}</small>`;
      } else {
        console.log(`🎣 Результат сохранен: ${score} очков для @${instagram}`);
        // Обновляем лучший результат в localStorage
        localStorage.setItem('playerBestScore', score);
      }
      
      // Обновляем лидерборд
      await loadLeaderboard();
    } else {
      console.error('❌ Помилка збереження результату мінігри:', result.error);
    }
  } catch (error) {
    console.error('❌ Помилка відправки результату мінігри:', error);
  }
}
