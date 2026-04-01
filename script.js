const SECTIONS = ['download', 'preview', 'changelog', 'support', 'terms', 'purchase'];

function scrollToSection(id, smooth) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
}

function getSectionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view && SECTIONS.includes(view)) return view;
  return null;
}

function getActiveSectionId() {
  let active = null;
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
      active = id;
    }
  }
  return active;
}

function updateUrl(sectionId) {
  const newPath = sectionId ? '/' + sectionId : '/';
  if (window.location.pathname !== newPath) {
    history.replaceState(null, '', newPath);
  }
}

let navLockUntil = 0;

function navClick(e, id) {
  e.preventDefault();
  navLockUntil = Date.now() + 500;
  updateUrl(id);
  scrollToSection(id, true);
}

const hamburger = document.getElementById('navHamburger');
const mobileSidebar = document.getElementById('mobileSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

function openSidebar() {
  mobileSidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeSidebar() {
  mobileSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  document.body.classList.remove('modal-open');
}

hamburger.addEventListener('click', openSidebar);
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

function sidebarNavClick(e, id) {
  e.preventDefault();
  closeSidebar();
  navLockUntil = Date.now() + 500;
  updateUrl(id);
  setTimeout(() => scrollToSection(id, true), 60);
}

window.addEventListener('DOMContentLoaded', () => {
  const target = getSectionFromUrl();
  if (target) {
    updateUrl(target);
    setTimeout(() => scrollToSection(target, false), 0);
  }
});

const dotCanvas = document.getElementById('dotCanvas');
const ctx = dotCanvas.getContext('2d');
const DOT_SPACING = 36;
const DOT_RADIUS = 1;
const DOT_COLOR = '#3a3a45';
const DOT_OPACITY = 0.18;
let scrollY = 0;
let rafPending = false;

function resizeCanvas() {
  dotCanvas.width = window.innerWidth;
  dotCanvas.height = window.innerHeight;
}

function drawDots() {
  ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
  ctx.fillStyle = DOT_COLOR;
  ctx.globalAlpha = DOT_OPACITY;

  const offsetY = scrollY % DOT_SPACING;
  const cols = Math.ceil(dotCanvas.width / DOT_SPACING) + 1;
  const rows = Math.ceil(dotCanvas.height / DOT_SPACING) + 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * DOT_SPACING;
      const y = r * DOT_SPACING - offsetY;
      ctx.beginPath();
      ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  rafPending = false;
}

function scheduleDrawDots() {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(drawDots);
  }
}

resizeCanvas();
drawDots();

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  scheduleDrawDots();
  if (Date.now() > navLockUntil) {
    updateUrl(getActiveSectionId());
  }
}, { passive: true });

window.addEventListener('resize', () => {
  resizeCanvas();
  scheduleDrawDots();
});

function openLightbox(card) {
  const img = card.querySelector('img');
  const content = document.getElementById('lightboxContent');

  if (img) {
    const el = document.createElement('img');
    el.src = img.src;
    el.className = 'lightbox-img';
    content.innerHTML = '';
    content.appendChild(el);
  } else {
    content.innerHTML = `<div class="lightbox-placeholder">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="opacity:0.25">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 15l5-4 4 3.5 3-2.5 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Screenshot coming soon</span>
    </div>`;
  }

  document.getElementById('lightboxOverlay').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.remove('open');
  document.body.classList.remove('modal-open');
  lbDragStartedOnOverlay = false;
}

let lbDragStartedOnOverlay = false;

document.getElementById('lightboxCloseBtn').addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeLightbox();
});

const lbOverlay = document.getElementById('lightboxOverlay');
const lbContent = document.getElementById('lightboxContent');

lbOverlay.addEventListener('mousedown', (e) => {
  if (e.target === lbOverlay) {
    lbDragStartedOnOverlay = true;
    e.preventDefault();
  }
});

lbContent.addEventListener('mousedown', (e) => {
  e.stopPropagation();
});

lbOverlay.addEventListener('mouseup', () => {
  if (lbDragStartedOnOverlay) closeLightbox();
});

document.addEventListener('mouseup', () => {
  if (lbDragStartedOnOverlay) closeLightbox();
});

const ICONS = {
  download: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13M6 11l6 6 6-6" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 20h18" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`,
  discord: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  purchase: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 6h18" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M16 10a4 4 0 01-8 0" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  link: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="rgba(255,255,255,0.65)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

let pendingUrl = null;
let pendingAction = null;

function openModal(url, type) {
  pendingUrl = url;
  pendingAction = type;

  document.getElementById('modalUrl').textContent = url;
  document.getElementById('modalIconWrap').innerHTML = ICONS[type] || ICONS.link;

  const titles = { download: 'Download File', discord: 'Join Discord', purchase: 'Purchase Selenite' };
  const descs = {
    download: "You're about to download an executable file from:",
    discord: "You're about to open an external Discord invite at:",
    purchase: "You'll be redirected to an external store at:"
  };
  const confirms = { download: 'Download', discord: 'Join', purchase: 'Buy Now' };

  document.getElementById('modalTitle').textContent = titles[type] || 'External Link';
  document.getElementById('modalDesc').textContent = descs[type] || "You're about to visit:";
  document.getElementById('modalConfirmBtn').textContent = confirms[type] || 'Continue';

  document.getElementById('modalOverlay').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.classList.remove('modal-open');
  pendingUrl = null;
  pendingAction = null;
  dragStartedOnOverlay = false;
}

document.getElementById('modalConfirmBtn').addEventListener('click', () => {
  if (!pendingUrl) return;
  if (pendingAction === 'download') {
    const a = document.createElement('a');
    a.href = pendingUrl; a.download = '';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } else {
    window.open(pendingUrl, '_blank', 'noopener,noreferrer');
  }
  closeModal();
});

document.getElementById('modalCloseBtn').addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeModal();
});

document.getElementById('modalCancelBtn').addEventListener('click', closeModal);

let dragStartedOnOverlay = false;

const overlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');

overlay.addEventListener('mousedown', (e) => {
  if (e.target === overlay) {
    dragStartedOnOverlay = true;
    e.preventDefault();
  }
});

modalBox.addEventListener('mousedown', (e) => {
  e.stopPropagation();
});

overlay.addEventListener('mouseup', () => {
  if (dragStartedOnOverlay) closeModal();
});

document.addEventListener('mouseup', () => {
  if (dragStartedOnOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeLightbox();
    closeSidebar();
  }
});
