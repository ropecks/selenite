// ── ROUTER ──
const VIEWS = ["home", "download", "terms"];
const PATHS = { home: "/", download: "/download", terms: "/terms" };
const track = document.getElementById("track");

let currentView = "home";

function getIndexOf(v) { return VIEWS.indexOf(v); }

function slideTo(view, pushState = true) {
  if (view === currentView) return;
  const idx = getIndexOf(view);
  if (idx === -1) return;
  currentView = view;
  track.style.transform = `translateX(${-idx * 100}vw)`;
  document.querySelectorAll("nav a[data-view]").forEach(a => {
    a.classList.toggle("active", a.dataset.view === view);
  });
  if (pushState) history.pushState({ view }, "", PATHS[view]);
  const titles = {
    home: "Selenite Cheats",
    download: "Download — Selenite Cheats",
    terms: "Terms — Selenite Cheats"
  };
  document.title = titles[view] || "Selenite Cheats";
}

window.addEventListener("popstate", e => {
  const v = (e.state && e.state.view) ? e.state.view : viewFromPath();
  slideTo(v, false);
});

function viewFromPath() {
  const p = location.pathname;
  if (p.startsWith("/download")) return "download";
  if (p.startsWith("/terms")) return "terms";
  const q = new URLSearchParams(location.search).get("view");
  if (q === "download" || q === "terms") return q;
  return "home";
}

const initView = viewFromPath();
const initIdx = getIndexOf(initView);
currentView = initView;
track.style.transition = "none";
track.style.transform = `translateX(${-initIdx * 100}vw)`;
document.querySelectorAll("nav a[data-view]").forEach(a => a.classList.toggle("active", a.dataset.view === initView));
history.replaceState({ view: initView }, "", PATHS[initView]);
requestAnimationFrame(() => requestAnimationFrame(() => {
  track.style.transition = "";
}));

document.querySelectorAll("[data-view]").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    slideTo(el.dataset.view);
  });
});

document.getElementById("brandHome").addEventListener("click", () => slideTo("home"));
document.getElementById("brandHome").addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); slideTo("home"); }
});

document.getElementById("faqDownloadLink").addEventListener("click", () => slideTo("download"));
document.getElementById("goDownload").addEventListener("click", () => slideTo("download"));
document.getElementById("backHome").addEventListener("click", () => slideTo("home"));

// ── BUTTON GLOW ──
function bindGlow() {
  document.querySelectorAll(".btn-primary,.btn-green").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--bx", ((e.clientX - r.left) / r.width * 100) + "%");
      el.style.setProperty("--by", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  });
}
bindGlow();

// ── SCROLL REVEAL ──
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach(r => io.observe(r));

// ── SMOOTH SCROLL ──
let tScroll = window.scrollY, cScroll = window.scrollY, sRaf = null;
const EASE = 0.09, rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function animS() {
  cScroll += (tScroll - cScroll) * EASE;
  if (Math.abs(tScroll - cScroll) < 0.5) { cScroll = tScroll; window.scrollTo(0, cScroll); sRaf = null; return; }
  window.scrollTo(0, cScroll); sRaf = requestAnimationFrame(animS);
}
function ensureS() { if (!sRaf) sRaf = requestAnimationFrame(animS); }
window.addEventListener("wheel", e => {
  if (rm || e.ctrlKey) return; e.preventDefault();
  tScroll = clamp(tScroll + e.deltaY, 0, document.documentElement.scrollHeight - innerHeight);
  ensureS();
}, { passive: false });

document.getElementById("scrollPricing").addEventListener("click", () => {
  if (currentView !== "home") { slideTo("home"); setTimeout(() => { scrollToPricing(); }, 450); return; }
  scrollToPricing();
});
function scrollToPricing() {
  const el = document.getElementById("pricing"); if (!el) return;
  tScroll = clamp(el.getBoundingClientRect().top + window.scrollY - 80, 0, document.documentElement.scrollHeight - innerHeight);
  ensureS();
}

// ── MODALS ──
function makeModal(overlayId, openIds, closeIds, confirmId, url) {
  const ov = document.getElementById(overlayId);
  const open = () => ov.classList.add("show");
  const close = () => ov.classList.remove("show");
  openIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener("click", e => { e.preventDefault(); open(); }); });
  closeIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener("click", close); });
  let downOnModal = false;
  ov.addEventListener("mousedown", e => { downOnModal = e.target !== ov; });
  ov.addEventListener("click", e => { if (e.target === ov && !downOnModal) close(); });
  if (confirmId) document.getElementById(confirmId).addEventListener("click", () => { window.open(url, "_blank", "noopener,noreferrer"); close(); });
}
makeModal("supportBack", ["openSupportLink", "openSupportFooter", "openSupportFooter2", "openSupportFooter3"], ["closeSupport", "cancelSupport"], "confirmSupport", "https://discord.gg/BPMkRjs7AP");
makeModal("stripeBack", ["openStripePurchase"], ["closeStripe", "cancelStripe"], "confirmStripe", "https://buy.stripe.com/8x28wQcmNawNesyepadfG00");
makeModal("wyvernBack", ["downloadPrimary"], ["closeWyvern", "cancelWyvern"], "confirmWyvern", "https://wyvern.sh/public/loader/WyvernLoader.exe");

// ── YEAR ──
const yr = new Date().getFullYear();
document.querySelectorAll(".yr").forEach(e => e.textContent = yr);

// ── STARS ──
const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
let dpr = 1, cw = 0, ch = 0;
function resize() {
  const w = innerWidth, h = innerHeight, scale = Math.min(1.5, Math.sqrt(1_600_000 / Math.max(1, w * h)));
  dpr = scale; cw = w; ch = h;
  canvas.width = Math.floor(cw * dpr); canvas.height = Math.floor(ch * dpr);
  canvas.style.width = cw + "px"; canvas.style.height = ch + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", () => { if (!document.hidden) resize(); }, { passive: true });

const N = 45;
const sx = new Float32Array(N), sy = new Float32Array(N), sr = new Float32Array(N);
const svy = new Float32Array(N), sa = new Float32Array(N), sft = new Float32Array(N);
const cr = new Uint8Array(N), cg = new Uint8Array(N), cb = new Uint8Array(N);
const rnd = (a, b) => Math.random() * (b - a) + a;
const lerp = (a, b, t) => a + (b - a) * t;
function initStar(i, bot = true) {
  sx[i] = rnd(0, cw); sy[i] = bot ? rnd(ch * .85, ch + 30) : rnd(-30, ch + 30);
  sr[i] = rnd(.6, 1.6); svy[i] = rnd(12, 32); sa[i] = rnd(.06, .18); sft[i] = rnd(.14, .24);
  const t = cw > 1 ? sx[i] / cw : .5;
  const base = (lerp(140, 175, t) + .5) | 0;
  cr[i] = base; cg[i] = base; cb[i] = (base + 8) | 0;
}
let stRaf = null, lastT = 0;
function draw(t) {
  if (document.hidden) { stop(); return; }
  const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t;
  ctx.clearRect(0, 0, cw, ch);
  for (let i = 0; i < N; i++) {
    sy[i] -= svy[i] * dt;
    let a = sa[i];
    const top = ch * sft[i];
    if (sy[i] < top) a *= Math.max(0, sy[i] / top);
    if (sy[i] > ch - 24) a *= Math.min(1, (ch - sy[i]) / 24);
    if (sy[i] < -40) { initStar(i, true); continue; }
    ctx.fillStyle = `rgba(${cr[i]},${cg[i]},${cb[i]},${a})`;
    ctx.beginPath(); ctx.arc(sx[i], sy[i], sr[i], 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(${cr[i]},${cg[i]},${cb[i]},${a * .15})`;
    ctx.beginPath(); ctx.arc(sx[i], sy[i], sr[i] * 2.6, 0, Math.PI * 2); ctx.fill();
  }
  stRaf = requestAnimationFrame(draw);
}
function start() { if (stRaf) return; resize(); for (let i = 0; i < N; i++) initStar(i, false); lastT = performance.now(); stRaf = requestAnimationFrame(draw); }
function stop() { if (!stRaf) return; cancelAnimationFrame(stRaf); stRaf = null; ctx.clearRect(0, 0, cw, ch); canvas.width = 0; canvas.height = 0; }
function freezeAll() { document.body.classList.add("frozen"); stop(); }
function unfreezeAll() { document.body.classList.remove("frozen"); if (!document.hidden) start(); }
document.addEventListener("visibilitychange", () => document.hidden ? freezeAll() : unfreezeAll());
window.addEventListener("pagehide", freezeAll);
window.addEventListener("pageshow", unfreezeAll);
start();
