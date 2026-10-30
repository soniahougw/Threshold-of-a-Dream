// ---- Settings ----------------------------------------------------------
// Add more scenes here; each one plays a transition from `from` to `to`.
const SCENES = [
  { id: "motion-blur", from: "images/0a.jpg", to: "images/1a.jpg" },
  { id: "darker", from: "images/cl.jpg", to: "images/cld.jpg" },
  { id: "brighter", from: "images/b.jpg", to: "images/e.jpg" },
  { id: "black-and-white", from: "images/pl.jpg", to: "images/plb.jpg" },
  { id: "flying", from: "images/fly.jpg", to: "images/flyw.jpg" },
];

const DURATION = 5;             // seconds for one full transition
const SQUEEZE_SECONDS = 6;      // seconds of squeezing to reach the fully transformed photo

// Google Apps Script web app that saves answers to the Google Drive folder
// (see apps-script/Code.gs). Leave empty to only save answers on this device (see ?results).
const SUBMIT_URL = "https://script.google.com/macros/s/AKfycbwRsLe9YOyFp9YZf_AcPj0f3lWJXHRyvBqraYDUmNly3qwHGW7mnbE3ZEu95dZwPwFl4w/exec";

const STORAGE_KEY = "threshold-of-a-dream-responses";

// ---- Helpers ------------------------------------------------------------
const $ = (id) => document.getElementById(id);

// ---- Language -------------------------------------------------------------
// English text lives in index.html; elements marked data-i18n="key" use ZH[key] in Traditional Mandarin.
// Text that changes while the page runs is listed in both EN and ZH.
const LANG_KEY = "threshold-of-a-dream-lang";
const HTML_LANG = { en: "en", zh: "zh-Hant" };

const EN = {
  pageTitle: "Threshold of a Dream",
  nameError: "Please describe yourself in a few words.",
  trialCount: (i, n) => `Transition ${i} of ${n}`,
  oneScene: "The scene",
  nextTransition: "Next transition",
  continue: "Continue",
  send: "Send",
  sending: "Sending…",
  sendError: "Couldn’t send your answers. Please check your connection and try again.",
  frozenAlt: (p) => `The scene at ${p}`,
  frozenFullAlt: "The fully transformed scene",
};

const ZH = {
  pageTitle: "夢的門檻",
  nameError: "請用幾個字形容一下你自己。",
  trialCount: (i, n) => `轉換 ${i} / ${n}`,
  oneScene: "場景",
  nextTransition: "下一個轉換",
  continue: "繼續",
  send: "送出",
  sending: "傳送中…",
  sendError: "沒有送出成功，請檢查網路連線後再試一次。",
  frozenAlt: (p) => `場景轉變到 ${p} 時的樣子`,
  frozenFullAlt: "完全轉變後的場景",

  // Welcome
  introEyebrow: "論文後續訪談 · 喬治華盛頓大學 · 互動設計科",
  title: "<em>夢</em>的門檻",
  intro1: "哈囉！我是 Sonia，這是我的論文計畫 <span class=\"thesis-name\">夢境翻譯器 × 互動空間</span>（最終名稱還沒決定！）的後續訪談。",
  intro2: "我現在正進入設計階段，很想聽聽你對這個計畫的想法、回饋，或任何想分享的事。",
  intro3: "謝謝每一位參與之前訪談的人，讓我收集到許多美好的夢。現在，我想探索如何把這些珍貴的夢融入我的裝置中。",
  intro4: "在這次訪談中，你會看到一系列範例照片，有些是我拍攝的，有些是 AI 生成的，用來呈現一個場景如何漸漸轉變成像夢一樣的樣子。在看著照片變化的同時，你要拉動一個旋鈕，標記出這個場景開始讓你覺得像夢的那一刻。",
  describe: "我該怎麼形容你？",
  describePlaceholder: "例如：20 多歲、設計系學生",
  start: "開始回答",
  duration: "大約 3 分鐘",

  // Trial
  trialTitle: "當它開始讓你覺得像夢時，按下按鈕",
  trialHint: "按下播放，看著照片慢慢改變。沒有標準答案。",
  imgFromAlt: "原始照片",
  imgToAlt: "加上夢境效果的同一張照片",
  play: "播放",
  original: "原始",
  transformed: "完全轉變",
  dreamBtn: "✦ 感覺像夢了",
  markedBefore: "你在轉變的",
  markedAfter: "處標記了夢。",
  ballLabel: "按住擠壓，讓夢變得更強烈",
  squeezeHint: "想微調嗎？<strong>按住擠壓</strong>這顆球。擠得越久，夢就越強烈。覺得剛好時就放開。",
  retry: "再看一次",
  confirm: "就是這一刻",
  noMark: "場景播完了，沒有標記。",
  never: "從來沒有像夢的感覺",
  back: "上一步",

  // Reflection
  reflectEyebrow: "在那一刻…",
  reflectTitle: "感覺如何？",
  feelingLegend: "在你標記的那一刻，你覺得自己…",
  aboutToEnter: "快要進入夢境",
  inside: "已經在夢裡了",
  unsure: "不確定／其他感覺",

  // Your dreams
  dreamsEyebrow: "你的夢",
  dreamsTitle: "你的夢通常是什麼樣子？",
  pickAll: "可複選。",
  clearSight: "視線清晰",
  motionBlur: "動態模糊",
  darkSight: "視線昏暗",
  brightWorld: "明亮的世界",
  blackWhite: "黑白色調",
  dreamMemory: "這次訪談有讓你想起任何做過的夢嗎？",

  // Feedback and thanks
  feedbackEyebrow: "快完成了",
  feedbackTitle: "還有什麼想分享的嗎？",
  feedbackHint: "對這個計畫或裝置的想法、回饋或點子。",
  feedbackLabel: "想法、回饋或點子",
  sentEyebrow: "已送出",
  thanks: "謝謝你",
  thanksBody: "你的回答會幫助我決定，在裝置中現實在哪裡結束、夢又從哪裡開始。真的很感謝你撥出時間。",
};

const I18N_ATTRS = ["placeholder", "alt", "aria-label"];

// Read the English text out of the page once, so it only has to be written in index.html.
document.querySelectorAll("[data-i18n]").forEach((el) => { EN[el.dataset.i18n] ??= el.innerHTML; });
I18N_ATTRS.forEach((attr) =>
  document.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => {
    EN[el.getAttribute(`data-i18n-${attr}`)] ??= el.getAttribute(attr);
  })
);

function pickInitialLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl in HTML_LANG) return fromUrl;
  try { const saved = localStorage.getItem(LANG_KEY); if (saved in HTML_LANG) return saved; } catch {}
  for (const l of navigator.languages || [navigator.language || ""]) {
    if (/^zh/i.test(l)) return "zh";
    if (/^en/i.test(l)) return "en";
  }
  return "en";
}
let lang = pickInitialLang();
const T = (key) => (lang === "zh" && ZH[key]) || EN[key];

// Show an error by key, so it can be re-translated if the language changes while it's showing.
function setError(id, key) {
  const el = $(id);
  if (key) { el.dataset.err = key; el.textContent = T(key); }
  else { delete el.dataset.err; el.textContent = ""; }
}

function applyLang() {
  document.documentElement.lang = HTML_LANG[lang];
  document.title = T("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.innerHTML = T(el.dataset.i18n)));
  I18N_ATTRS.forEach((attr) =>
    document.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) =>
      el.setAttribute(attr, T(el.getAttribute(`data-i18n-${attr}`)))
    )
  );
  document.querySelectorAll(".error[data-err]").forEach((el) => (el.textContent = T(el.dataset.err)));
  document.querySelectorAll("#lang [data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  setTrialCount();
  setReflectText();
  if (current) $("frozen").alt = frozenAlt(current);
  $("submit").textContent = T($("submit").disabled ? "sending" : "send");
}

$("lang").addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (!b) return;
  lang = b.dataset.lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  // keep ?lang= in the address bar so a copied link opens in this language
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
  applyLang();
});

// Progress dots in the top bar: a trial and a reflection per scene, then the dream questions and feedback.
const progressBar = $("progress");
progressBar.innerHTML = "<span></span>".repeat(SCENES.length * 2 + 2);

function stepIndex(id) {
  if (id === "screen-trial") return sceneIndex * 2;
  if (id === "screen-reflect") return sceneIndex * 2 + 1;
  if (id === "screen-dreams") return SCENES.length * 2;
  if (id === "screen-feedback") return SCENES.length * 2 + 1;
  return -1;
}

function show(id, { resume = false } = {}) {
  const cur = document.querySelector(".screen.active");
  if (cur.classList.contains("leaving")) return; // ignore double clicks mid-transition
  cur.classList.add("leaving");
  setTimeout(() => {
    cur.classList.remove("active", "leaving");
    $(id).classList.add("active");
    window.scrollTo({ top: 0 });
    const si = stepIndex(id);
    progressBar.classList.toggle("show", si >= 0);
    [...progressBar.children].forEach((d, k) => { d.className = k < si ? "done" : k === si ? "now" : ""; });
    if (id === "screen-trial" && !resume) startScene();
    if (id === "screen-thanks") setTimeout(() => $("door").classList.add("open"), 900);
  }, 330);
}

document.querySelectorAll("[data-go]").forEach((btn) =>
  btn.addEventListener("click", () => show(btn.dataset.go))
);
// The "How do I describe you?" answer is required before starting.
function start() {
  const input = $("name");
  if (!input.value.trim()) {
    setError("name-error", "nameError");
    input.focus();
    return;
  }
  setError("name-error", null);
  show("screen-trial");
}
$("start").addEventListener("click", start);
$("name").addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
$("name").addEventListener("input", () => setError("name-error", null));


function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveAll(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

function download(filename, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const pct = (p) => Math.round(p * 100) + "%";

// ---- Response ----------------------------------------------------------
const response = {
  id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
  startedAt: new Date().toISOString(),
  lang: "",        // language the participant answered in ("en" or "zh")
  name: "",
  scenes: [],
  dreamLike: [],    // "How's your dream usually like?" (multiple choice)
  dreamMemory: "",  // "Does this interview remind you of any dream you've had?"
  feedback: "",
};
let sceneIndex = 0;
let current = null; // answer for the scene in progress

// ---- Playback -----------------------------------------------------------
const imgFrom = $("img-from");
const imgTo = $("img-to");
const fill = $("timeline-fill");
const markDot = $("timeline-mark");
const overlay = $("stage-overlay");
const dreamBtn = $("dream-btn");

// The photo frame takes the shape of each scene's photos (portrait or landscape).
imgFrom.addEventListener("load", () =>
  document.documentElement.style.setProperty("--ar", imgFrom.naturalWidth / imgFrom.naturalHeight)
);

let progress = 0;
let playing = false;
let lastTime = 0;
let marked = false;

function render(p) {
  progress = Math.min(1, Math.max(0, p));
  imgTo.style.opacity = progress;
  fill.style.width = progress * 100 + "%";
}

function tick(now) {
  if (!playing) return;
  render(progress + (now - lastTime) / 1000 / DURATION);
  lastTime = now;
  if (progress >= 1) {
    playing = false;
    if (!marked) { dreamBtn.hidden = true; $("after-none").hidden = false; }
    return;
  }
  requestAnimationFrame(tick);
}

function play() {
  overlay.classList.add("hidden");
  playing = true;
  dreamBtn.disabled = false;
  lastTime = performance.now();
  requestAnimationFrame(tick);
  dreamBtn.focus({ preventScroll: true });
}

function resetPlayback() {
  playing = false;
  marked = false;
  if (current) current.neverDream = false;
  render(0);
  markDot.style.display = "none";
  overlay.classList.remove("hidden");
  $("after-mark").hidden = true;
  $("after-none").hidden = true;
  dreamBtn.hidden = false;
  dreamBtn.disabled = true;
}

function startScene() {
  const scene = SCENES[sceneIndex];
  current = {
    scene: scene.id,
    from: scene.from,
    to: scene.to,
    attempts: 0,
    markProgress: null,
    markSeconds: null,
    finalProgress: null,
    neverDream: false,
  };
  imgFrom.src = scene.from;
  imgTo.src = scene.to;
  setTrialCount();
  resetPlayback();
}

function setTrialCount() {
  $("trial-count").textContent =
    SCENES.length > 1 ? T("trialCount")(Math.min(sceneIndex, SCENES.length - 1) + 1, SCENES.length) : T("oneScene");
}

// Show a scene's trial the way the participant left it (used when going back).
function restoreTrial(ans) {
  imgFrom.src = ans.from;
  imgTo.src = ans.to;
  playing = false;
  marked = !ans.neverDream;
  overlay.classList.add("hidden");
  dreamBtn.hidden = true;
  $("after-mark").hidden = ans.neverDream;
  $("after-none").hidden = !ans.neverDream;
  markDot.style.display = marked ? "block" : "none";
  setMoment(ans.neverDream ? 1 : ans.finalProgress);
}

$("play").addEventListener("click", () => {
  current.attempts++;
  play();
});

function mark() {
  if (!playing || marked) return;
  marked = true;
  playing = false;
  current.markProgress = progress;
  current.markSeconds = +(progress * DURATION).toFixed(2);
  markDot.style.display = "block";
  markDot.style.left = progress * 100 + "%";
  $("mark-pct").textContent = pct(progress);
  ball.style.setProperty("--squeeze", progress);
  $("after-mark").hidden = false;
  dreamBtn.hidden = true;
  $("after-mark").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---- Squeeze ball (fine-tune) ---------------------------------------------
// Each squeeze starts from the original photo; holding longer makes the dream stronger.
const ball = $("ball");
let squeezing = false;
let squeezeStart = 0;

function setMoment(p) {
  render(p);
  markDot.style.left = progress * 100 + "%";
  $("mark-pct").textContent = pct(progress);
  ball.style.setProperty("--squeeze", progress);
}

function squeezeTick(now) {
  if (!squeezing) return;
  setMoment((now - squeezeStart) / 1000 / SQUEEZE_SECONDS);
  requestAnimationFrame(squeezeTick);
}

function squeezeOn() {
  if (squeezing) return;
  squeezing = true;
  ball.classList.add("squeezing");
  squeezeStart = performance.now();
  requestAnimationFrame(squeezeTick);
}

function squeezeOff() {
  if (!squeezing) return;
  squeezing = false;
  ball.classList.remove("squeezing");
}

ball.addEventListener("pointerdown", (e) => { ball.setPointerCapture(e.pointerId); squeezeOn(); });
ball.addEventListener("pointerup", squeezeOff);
ball.addEventListener("pointercancel", squeezeOff);
ball.addEventListener("contextmenu", (e) => e.preventDefault());
ball.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); e.stopPropagation(); squeezeOn(); }
});
ball.addEventListener("keyup", (e) => { if (e.code === "Space" || e.code === "Enter") squeezeOff(); });

$("retry").addEventListener("click", resetPlayback);
$("retry-none").addEventListener("click", resetPlayback);

$("confirm").addEventListener("click", () => {
  current.finalProgress = +progress.toFixed(3);
  current.markProgress = +current.markProgress.toFixed(3);
  goReflect();
});

$("never").addEventListener("click", () => {
  current.neverDream = true;
  goReflect();
});

// ---- Dream button -------------------------------------------------------
dreamBtn.addEventListener("click", mark);

document.addEventListener("keydown", (e) => {
  if (!$("screen-trial").classList.contains("active") || e.code !== "Space") return;
  e.preventDefault();
  if (!playing && !marked && !overlay.classList.contains("hidden")) $("play").click();
  else mark();
});

// ---- Reflection ----------------------------------------------------------
function goReflect() {
  const frozen = $("frozen");
  // Snapshot the chosen frame so the participant can see what they marked.
  const c = document.createElement("canvas");
  c.height = 480;
  c.width = Math.round(480 * imgFrom.naturalWidth / imgFrom.naturalHeight);
  const ctx = c.getContext("2d");
  const p = current.neverDream ? 1 : current.finalProgress;
  ctx.drawImage(imgFrom, 0, 0, c.width, c.height);
  ctx.globalAlpha = p;
  ctx.drawImage(imgTo, 0, 0, c.width, c.height);
  frozen.src = c.toDataURL("image/jpeg", 0.85);
  frozen.alt = frozenAlt(current);

  fillReflect(current);
  setReflectText();
  show("screen-reflect");
}

function frozenAlt(ans) {
  return ans.neverDream ? T("frozenFullAlt") : T("frozenAlt")(pct(ans.finalProgress));
}

// Snapshots of each scene's chosen frame, kept out of the saved answers.
const frozenShots = [];

function setReflectText() {
  $("next-scene").textContent = T(sceneIndex < SCENES.length - 1 ? "nextTransition" : "continue");
}

function fillReflect(ans) {
  document.querySelectorAll('input[name="feeling"]').forEach((r) => (r.checked = r.value === ans.feeling));
}

function readReflect() {
  const checked = document.querySelector('input[name="feeling"]:checked');
  current.feeling = checked ? checked.value : null;
}

$("next-scene").addEventListener("click", () => {
  readReflect();
  frozenShots[sceneIndex] = $("frozen").src;
  response.scenes.push(current);
  sceneIndex++;
  show(sceneIndex < SCENES.length ? "screen-trial" : "screen-dreams");
});

// ---- Back ----------------------------------------------------------------
// Return to the previous scene's reflection, with its answers filled back in.
function backToPreviousReflect() {
  sceneIndex--;
  current = response.scenes.pop();
  fillReflect(current);
  $("frozen").src = frozenShots[sceneIndex];
  $("frozen").alt = frozenAlt(current);
  setReflectText();
  show("screen-reflect");
}

document.querySelectorAll("[data-back]").forEach((btn) => btn.addEventListener("click", () => {
  const screen = document.querySelector(".screen.active").id;
  if (screen === "screen-trial") {
    playing = false;
    squeezeOff();
    if (sceneIndex === 0) show("screen-intro");
    else backToPreviousReflect();
  } else if (screen === "screen-reflect") {
    readReflect();
    restoreTrial(current);
    show("screen-trial", { resume: true });
  } else if (screen === "screen-dreams") {
    backToPreviousReflect();
  } else if (screen === "screen-feedback") {
    show("screen-dreams");
  }
}));

// ---- Submit ---------------------------------------------------------------
let savedLocally = false;

$("submit").addEventListener("click", async () => {
  const btn = $("submit");
  btn.disabled = true;
  setError("submit-error", null);
  response.lang = lang;
  response.name = $("name").value.trim();
  response.dreamLike = [...document.querySelectorAll('input[name="dream-like"]:checked')].map((c) => c.value);
  response.dreamMemory = $("dream-memory").value.trim();
  response.feedback = $("feedback").value.trim();
  response.submittedAt = new Date().toISOString();

  // Keep a backup on this device too (see ?results).
  if (!savedLocally) {
    saveAll([...loadSaved(), response]);
    savedLocally = true;
  }

  if (SUBMIT_URL) {
    btn.textContent = T("sending");
    try {
      // Apps Script doesn't send CORS headers, so the response is opaque; a network failure still throws.
      await fetch(SUBMIT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(response),
      });
    } catch {
      setError("submit-error", "sendError");
      btn.disabled = false;
      btn.textContent = T("send");
      return;
    }
  }
  show("screen-thanks");
});

// ---- Results view (?results) ------------------------------------------------
function flatten(list) {
  return list.flatMap((r) =>
    r.scenes.map((s) => ({
      submitted: r.submittedAt,
      name: r.name,
      scene: s.scene,
      mark: s.neverDream ? "never" : pct(s.finalProgress),
      firstPull: s.neverDream ? "" : pct(s.markProgress),
      seconds: s.markSeconds ?? "",
      attempts: s.attempts,
      feeling: s.feeling || "",
      dreamLike: (r.dreamLike || []).join(", "),
      dreamMemory: r.dreamMemory || "",
      feedback: r.feedback,
    }))
  );
}

function renderResults() {
  const rows = flatten(loadSaved());
  const table = $("results-table");
  if (!rows.length) {
    table.innerHTML = "<tr><td>No responses saved on this device yet.</td></tr>";
    return;
  }
  const cols = Object.keys(rows[0]);
  table.innerHTML = "";
  const head = table.insertRow();
  cols.forEach((c) => { const th = document.createElement("th"); th.textContent = c; head.appendChild(th); });
  rows.forEach((r) => {
    const tr = table.insertRow();
    cols.forEach((c) => (tr.insertCell().textContent = r[c] ?? ""));
  });
}

$("export-csv").addEventListener("click", () => {
  const rows = flatten(loadSaved());
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  download("threshold-responses.csv", csv, "text/csv");
});
$("export-json").addEventListener("click", () =>
  download("threshold-responses.json", JSON.stringify(loadSaved(), null, 2), "application/json")
);
$("clear-results").addEventListener("click", () => {
  if (confirm("Delete all responses saved on this device?")) { saveAll([]); renderResults(); }
});

// ---- Starry sky -------------------------------------------------------------
const cv = $("sky"), sky = cv.getContext("2d");
let stars = [], W, H;
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
function resizeSky() {
  const dpr = devicePixelRatio || 1;
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  sky.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.round(W * H / 5000) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .2,
    p: Math.random() * Math.PI * 2, s: Math.random() * .02 + .005, v: Math.random() * .08 + .02,
  }));
}
let mx = 0, my = 0;
addEventListener("pointermove", (e) => { mx = e.clientX / W - .5; my = e.clientY / H - .5; });
function skyFrame() {
  sky.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.p += s.s; s.y -= s.v; if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
    sky.globalAlpha = .35 + Math.sin(s.p) * .35 + .3;
    sky.fillStyle = "#f6f4e9";
    sky.beginPath();
    sky.arc(s.x + mx * s.r * 14, s.y + my * s.r * 14, s.r, 0, Math.PI * 2);
    sky.fill();
  }
  if (!still) requestAnimationFrame(skyFrame);
}
addEventListener("resize", resizeSky);
resizeSky(); skyFrame();

applyLang();

if (new URLSearchParams(location.search).has("results")) {
  renderResults();
  show("screen-results");
}
