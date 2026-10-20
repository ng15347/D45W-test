/* =========================================================
   D45W 首頁 V2（已確認版）程式
   只在首頁 index.html 載入。
   ========================================================= */
/* =====================================================
   ★ 管理者設定區：之後只需要改這裡 ★
   ===================================================== */

/* 外部連結：把 Google 簡報或網站網址貼在引號中間。空白 = 顯示「連結尚未設定」 */
var D45W_LINKS = {
  tips: '',          // 操作技巧（Google 簡報）
  notice: '',        // 聯盟公告圖（Google 簡報）
  otherGuides: ''    // 其他攻略網站
};

/* 預覽模式：true = 點選單項目時顯示佔位頁面；正式頁面做好後改成 false，就會直接前往對應檔案 */
var D45W_PREVIEW = true;

/* 聯盟精神語錄：main = 主語，sub = 次語 */
var D45W_SPIRIT = [
  { main: '輸過，沒怕過！',       sub: '打不贏就一起回家，明天繼續出發。' },
  { main: '現實優先，快樂遊戲。', sub: '生活要好好過，遊戲要開心玩。' },
  { main: '戰力不夠，氣勢來湊！', sub: '打架不一定贏，聊天不能輸。' },
  { main: '世界很大，相遇不容易。', sub: '能一起走過這段旅程，就是緣分。' }
];
var D45W_SPIRIT_INTERVAL = 8000;   // 自動切換間隔（毫秒）

/* 常規活動選單（page = 未來獨立頁面的檔名） */
var D45W_EVENTS = [
  { name: 'V.S同盟對決', page: 'events/vs-duel.html' },
  { name: '軍備競賽',     page: 'events/arms-race.html' },
  { name: '同盟軍演',     page: 'events/alliance-drill.html' },
  { name: '屍潮攻城',     page: 'events/zombie-siege.html' },
  { name: '冬日對決',     page: 'events/winter-duel.html' },
  { name: '沙漠對決',     page: 'events/desert-duel.html' },
  { name: '戰區對決',     page: 'events/warzone-duel.html' },
  { name: '隕鐵爭奪戰',   page: 'events/meteorite.html' },
  { name: '鯊魚飛船',     page: 'events/shark-airship.html' },
  { name: '金幣殭屍',     page: 'events/gold-zombie.html' },
  { name: '將軍試煉',     page: 'events/general-trial.html' },
  { name: '怒鯊號',       page: 'events/fury-shark.html' },
  { name: '國會爭奪',     page: 'events/capitol.html' }
];

/* 賽季專區選單 */
var D45W_SEASONS = [
  { name: 'S1血泊之災', page: 'seasons/s1.html' },
  { name: 'S2極地風暴', page: 'seasons/s2.html' },
  { name: '石油時代',   page: 'seasons/oil-age.html' },
  { name: 'S3黃金帝國', page: 'seasons/s3.html' },
  { name: 'S4永夜之島', page: 'seasons/s4.html' },
  { name: 'S5荒野西部', page: 'seasons/s5.html' },
  { name: 'S6暗影雨林', page: 'seasons/s6.html' },
  { name: '待更新',     page: 'seasons/coming-soon.html', pending: true }
];

/* 聯盟資訊獨立頁面 */
var D45W_PAGES = {
  'alliance-rules': { name: '聯盟規範',   cat: 'ALLIANCE RULES', page: 'rules/alliance.html' },
  'server-rules':   { name: '伺服器規範', cat: 'SERVER RULES',   page: 'rules/server.html' }
};

/* 吉祥物台詞 */
var D45W_MASCOT_LINES = [
  '輸過，沒怕過！',
  '戰力不夠，氣勢來湊！',
  '今天記得開防護罩！',
  '基地飛了，記得飛回家！',
  '打不贏就跑，跑不掉就笑！',
  '歡迎回到 D45W！',
  '今天也是努力活著的一天！',
  '先別打架，我還沒睡醒！'
];

/* 吉祥物圖片（檔案放在 images 資料夾） */
var D45W_MASCOTS = [
  { id: 'trident',  src: 'images/mascot-trident.webp' },
  { id: 'sword',    src: 'images/mascot-sword.webp' },
  { id: 'treasure', src: 'images/mascot-treasure.webp' }
];

/* =====================================================
   以下為程式，一般不需要修改
   ===================================================== */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 提示 ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }

  /* ---------- 外部連結 ---------- */
  document.querySelectorAll('[data-link]').forEach(function (a) {
    var url = (D45W_LINKS[a.getAttribute('data-link')] || '').trim();
    var chip = a.querySelector('[data-chip]');
    if (url) {
      a.href = url;
      if (chip) chip.hidden = true;
    } else {
      a.removeAttribute('target');
      a.addEventListener('click', function (e) { e.preventDefault(); toast('連結尚未設定'); });
    }
  });

  /* ---------- 聯盟精神輪播 ---------- */
  var S = D45W_SPIRIT, bag = [], cur = -1, past = [], timer, shown = 0;
  var body = $('spirit-body'), mainEl = $('spirit-main'), subEl = $('spirit-sub'), prog = $('spirit-prog');
  prog.style.setProperty('--dur', D45W_SPIRIT_INTERVAL + 'ms');
  S.forEach(function () { prog.appendChild(document.createElement('i')); });

  function refill() {
    bag = S.map(function (_, i) { return i; });
    for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
    if (bag.length > 1 && bag[0] === cur) { bag.push(bag.shift()); }   // 新一輪第一句不和上一句相同
  }
  function fit(el, max, min) {           // 單行顯示：放不下才縮字，最小不低於 min
    el.style.fontSize = max + 'px';
    var size = max;
    while (el.scrollWidth > el.clientWidth + 1 && size > min) { size -= 1; el.style.fontSize = size + 'px'; }
  }
  function drawProgress() {              // 進度條：已播過的格子亮、目前這格依時間填滿
    var played = S.length - bag.length;  // 本輪已播放數（含目前這句）
    Array.prototype.forEach.call(prog.children, function (d, k) {
      d.classList.remove('on', 'done');
      if (k < played - 1) d.classList.add('done');
      else if (k === played - 1) { void d.offsetWidth; d.classList.add('on'); }
    });
  }
  function render(i) {
    cur = i;
    mainEl.textContent = S[i].main;
    subEl.textContent = S[i].sub;
    fit(mainEl, 24, 17);
    fit(subEl, 15, 12);
  }
  function show(i) {
    drawProgress();
    if (reduce) { render(i); return; }
    body.classList.add('is-fading');
    setTimeout(function () { render(i); body.classList.remove('is-fading'); }, 600);
  }
  function next() {
    if (!bag.length) refill();
    if (cur !== -1) past.push(cur);
    var i = bag.shift();
    show(i);
    restart();
  }
  function prev() {
    if (!past.length) { next(); return; }
    var p = past.pop();
    bag.unshift(cur);                    // 目前這句放回待播
    show(p);
    restart();
  }
  function restart() { clearInterval(timer); timer = setInterval(next, D45W_SPIRIT_INTERVAL); }
  $('spirit-next').addEventListener('click', next);
  $('spirit-prev').addEventListener('click', prev);
  refill(); render(bag.shift()); drawProgress(); restart();
  window.addEventListener('resize', function () { if (cur > -1) { fit(mainEl, 24, 17); fit(subEl, 15, 12); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { render(cur); });

  /* ---------- 彈出選單 ---------- */
  var MENUS = {
    events:  { title: '常規活動', en: 'REGULAR EVENTS · 13', cat: 'EVENTS',  list: D45W_EVENTS },
    seasons: { title: '賽季專區', en: 'SEASON ARCHIVE · 8',  cat: 'SEASONS', list: D45W_SEASONS }
  };
  var wrap = $('sheet-wrap'), listEl = $('sheet-list'), lastFocus = null;
  var ARROW = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2l5 5-5 5"/></svg>';

  function lock(on) { root.classList.toggle('is-locked', on); }

  function openMenu(key) {
    var m = MENUS[key];
    lastFocus = document.activeElement;
    var title = $('sheet-title');
    title.textContent = m.title;
    var sm = document.createElement('small'); sm.textContent = m.en; title.appendChild(sm);
    listEl.innerHTML = '';
    m.list.forEach(function (it, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sheet-item' + (it.pending ? ' is-pending' : '');
      b.innerHTML = '<span class="mk" aria-hidden="true"></span><span class="nm"></span>' + ARROW;
      b.querySelector('.nm').textContent = it.name;
      b.addEventListener('click', function () { goPage({ name: it.name, cat: m.cat, page: it.page }); });
      li.appendChild(b); listEl.appendChild(li);
    });
    listEl.scrollTop = 0;
    wrap.hidden = false;
    lock(true);
    requestAnimationFrame(function () { wrap.classList.add('is-open'); $('sheet-close').focus({ preventScroll: true }); });
  }
  function closeMenu() {
    if (wrap.hidden) return;
    wrap.classList.remove('is-open');
    setTimeout(function () { wrap.hidden = true; if ($('ph').hidden) lock(false); }, reduce ? 0 : 200);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-menu]').forEach(function (b) {
    b.addEventListener('click', function () { openMenu(b.getAttribute('data-menu')); });
  });
  $('sheet-close').addEventListener('click', closeMenu);
  wrap.addEventListener('click', function (e) { if (e.target === wrap) closeMenu(); });

  /* ---------- 佔位頁面 ---------- */
  function goPage(p) {
    if (!D45W_PREVIEW) { location.href = p.page; return; }
    $('ph-cat').textContent = p.cat;
    $('ph-title').textContent = p.name;
    $('ph-file').textContent = p.page;
    $('ph').hidden = false;
    $('ph').scrollTop = 0;
    lock(true);
    $('ph-back').focus({ preventScroll: true });
  }
  function closePage() {
    $('ph').hidden = true;
    if (wrap.hidden) lock(false);
  }
  $('ph-back').addEventListener('click', closePage);
  document.querySelectorAll('[data-page]').forEach(function (b) {
    b.addEventListener('click', function () { goPage(D45W_PAGES[b.getAttribute('data-page')]); });
  });

  /* ---------- 吉祥物彩蛋 ---------- */
  var layer = $('mascot-layer'), img = $('mascot-img');
  var lastMascot = -1, lastLine = -1, hideTimer, showing = false;
  D45W_MASCOTS.forEach(function (m) { var i = new Image(); i.src = m.src; });   // 預先載入

  function pick(n, last) {               // 隨機，不與上一次相同
    if (n <= 1) return 0;
    var i; do { i = Math.floor(Math.random() * n); } while (i === last);
    return i;
  }
  function showMascot() {
    clearTimeout(hideTimer);
    lastMascot = pick(D45W_MASCOTS.length, lastMascot);
    lastLine = pick(D45W_MASCOT_LINES.length, lastLine);
    img.src = D45W_MASCOTS[lastMascot].src;
    img.setAttribute('data-mascot', D45W_MASCOTS[lastMascot].id);
    $('bubble-text').textContent = D45W_MASCOT_LINES[lastLine];
    layer.classList.remove('is-on', 'is-leaving');
    layer.hidden = false;
    void layer.offsetWidth;              // 重新觸發動畫
    layer.classList.add('is-on');
    showing = true;
  }
  function hideMascot() {
    if (!showing) return;
    showing = false;
    layer.classList.add('is-leaving');
    hideTimer = setTimeout(function () { layer.hidden = true; layer.classList.remove('is-on', 'is-leaving'); }, reduce ? 0 : 360);
  }
  $('logo-btn').addEventListener('click', showMascot);
  $('mascot-btn').addEventListener('click', hideMascot);
  $('bubble-close').addEventListener('click', hideMascot);

  /* ---------- Esc 鍵關閉 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (showing) hideMascot();
    else if (!$('ph').hidden) closePage();
    else closeMenu();
  });
})();
