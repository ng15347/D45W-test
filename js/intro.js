/* =========================================================
   D45W 歡迎開場動畫 v5（已確認版）
   只在首頁 index.html 載入。
   身份確認只是視覺動畫，不登入、不讀取任何使用者資料。
   ========================================================= */

/* ====== 歡迎語庫：要新增就照格式加一行，用英文逗號隔開 ====== */
var D45W_WELCOME_LINES = [
  '歡迎回到聯盟，準備好開始生存了嗎？',
  '指揮官，歡迎歸隊。今天也要平安回家。',
  '外面的世界很危險，還好我們有彼此。',
  '防護罩檢查好了嗎？別又被打飛啦！',
  '不論戰力高低，這裡都有你的位置。',
  '2134 已連線，D45W 等你很久了。'
];

/* ====== 動畫設定 ====== */
var D45W_INTRO_CONFIG = {
  speed: 1,              // 播放速度：1 = 標準，2 = 兩倍快，0.5 = 慢一倍
  steps: [               // 三個確認步驟：顯示文字 / 完成後狀態
    { label: '確認 2134 伺服器', done: '完成' },
    { label: '選定聯盟 D45W',    done: '完成' },
    { label: '身份確認',          done: '完成' }
  ],
  checkingText: '確認中',
  checkTime: 1000,       // 每個步驟「確認中」持續時間（毫秒）
  stepGap: 350,          // 完成後到下一步的間隔（毫秒）
  typeTime: 90,          // 歡迎語每個字的輸入時間（毫秒）
  fadeOut: 700,          // 結束淡出時間（毫秒）
  particles: 12          // 背景漂浮光點數量，0 = 不顯示
};

(function () {
  var CFG = D45W_INTRO_CONFIG;
  var LINES = D45W_WELCOME_LINES;
  var root = document.documentElement;
  var intro = document.getElementById('d45w-intro');
  var stepsEl = document.getElementById('d45w-steps');
  var countEl = document.getElementById('d45w-count');
  var textEl = document.getElementById('d45w-welcome-text');
  var enterBtn = document.getElementById('d45w-enter');
  var skipBtn = document.getElementById('d45w-skip');
  var bgfx = document.getElementById('d45w-bgfx');
  var home = document.getElementById('d45w-home');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var runId = 0, closing = false, lastIndex = -1;
  if (!intro) return;

  /* 背景漂浮光點 */
  for (var p = 0; p < (CFG.particles || 0); p++) {
    var d = document.createElement('span');
    d.className = 'd45w-dot';
    d.style.left = (Math.random() * 100).toFixed(1) + '%';
    d.style.setProperty('--dur', (5 + Math.random() * 5).toFixed(1) + 's');
    d.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
    bgfx.appendChild(d);
  }

  /* 建立三個步驟 */
  var ICON = '<svg class="d45w-icon" viewBox="0 0 36 36" aria-hidden="true">' +
    '<circle class="track" cx="18" cy="18" r="15"/>' +
    '<circle class="arc" cx="18" cy="18" r="15" pathLength="100"/>' +
    '<circle class="disc" cx="18" cy="18" r="16"/>' +
    '<path class="tick" pathLength="1" d="M11 18.5l5 5 9-10"/></svg>';
  var stepEls = CFG.steps.map(function (s) {
    var li = document.createElement('li');
    li.className = 'd45w-step';
    li.setAttribute('data-state', 'idle');
    li.innerHTML = ICON + '<span class="d45w-step-label"></span><span class="d45w-step-status"></span><span class="d45w-step-bar"></span>';
    li.querySelector('.d45w-step-label').textContent = s.label;
    stepsEl.appendChild(li);
    return li;
  });

  function setStep(i, state) {
    var li = stepEls[i];
    li.style.setProperty('--d45w-check', Math.round(CFG.checkTime / (CFG.speed || 1)) + 'ms');
    li.setAttribute('data-state', state);
    li.querySelector('.d45w-step-status').textContent =
      state === 'checking' ? CFG.checkingText : state === 'done' ? CFG.steps[i].done : '';
    var done = stepEls.filter(function (x) { return x.getAttribute('data-state') === 'done'; }).length;
    countEl.textContent = done + '/' + stepEls.length;
  }

  /* 隨機挑一句，避免和上一次相同 */
  function pickLine() {
    try { var saved = parseInt(localStorage.getItem('d45wLastWelcome'), 10); if (!isNaN(saved)) lastIndex = saved; } catch (e) {}
    var n = LINES.length, i = 0;
    if (n > 1) { do { i = Math.floor(Math.random() * n); } while (i === lastIndex); }
    lastIndex = i;
    try { localStorage.setItem('d45wLastWelcome', String(i)); } catch (e) {}
    return LINES[i] || '';
  }

  function wait(ms, id) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () { id === runId ? resolve() : reject('stop'); }, ms / (CFG.speed || 1));
    });
  }

  function showReady() {
    intro.classList.remove('is-typing');
    intro.classList.add('is-ready');
    try { enterBtn.focus({ preventScroll: true }); } catch (e) {}
  }

  async function play(id) {
    var line = pickLine();
    if (reduce) {                         // 減少動態：直接顯示完成畫面
      stepEls.forEach(function (_, i) { setStep(i, 'done'); });
      textEl.textContent = line;
      showReady();
      return;
    }
    await wait(500, id);
    for (var i = 0; i < stepEls.length; i++) {
      setStep(i, 'checking');
      await wait(CFG.checkTime, id);
      setStep(i, 'done');
      await wait(CFG.stepGap, id);
    }
    intro.classList.add('is-typing');
    var chars = Array.from(line);
    for (var c = 0; c < chars.length; c++) {
      textEl.textContent += chars[c];
      await wait(CFG.typeTime, id);
    }
    await wait(300, id);
    showReady();
  }

  function start() {
    runId++;
    closing = false;
    intro.style.setProperty('--d45w-fade', (CFG.fadeOut / 1000) + 's');
    intro.classList.remove('is-ready', 'is-typing', 'is-leaving');
    stepEls.forEach(function (_, i) { setStep(i, 'idle'); });
    textEl.textContent = '';
    intro.scrollTop = 0;
    root.classList.add('d45w-intro-on', 'd45w-lock');
    if (home) home.setAttribute('inert', '');
    var id = runId;
    play(id).catch(function (e) { if (e !== 'stop') close(); });  // 出錯時直接進入網站
  }

  function close() {
    if (closing) return;
    closing = true;
    runId++;                               // 停止正在播放的動畫
    intro.classList.add('is-leaving');
    setTimeout(function () {
      root.classList.remove('d45w-intro-on', 'd45w-lock');
      if (home) home.removeAttribute('inert');
    }, reduce ? 0 : CFG.fadeOut);
  }

  enterBtn.addEventListener('click', close);
  skipBtn.addEventListener('click', close);

  window.D45W_playIntro = start;
  start();
})();
