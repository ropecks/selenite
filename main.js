(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  let mouse = { x: -9999, y: -9999 };
  let targetMouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST = 130;
  const MOUSE_REPEL = 100;
  let particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('mousemove', e => {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    targetMouse.x = -9999;
    targetMouse.y = -9999;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.ox = this.x;
      this.oy = this.y;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.4;
      this.alpha = Math.random() * 0.35 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;

      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
        this.x += (dx / dist) * force * 2.5;
        this.y += (dy / dist) * force * 2.5;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < CONNECT_DIST * 1.4) {
        const alpha = (1 - mdist / (CONNECT_DIST * 1.4)) * 0.18;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  function drawGlow() {
    if (mouse.x < 0) return;
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
    grad.addColorStop(0, 'rgba(255,255,255,0.04)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function loop() {
    mouse.x += (targetMouse.x - mouse.x) * 0.08;
    mouse.y += (targetMouse.y - mouse.y) * 0.08;

    ctx.clearRect(0, 0, W, H);
    drawGlow();
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  loop();
})();

let currentPage = 'home';

function navigateTo(page) {
  if (page === currentPage) return;

  const oldEl = document.getElementById('page-' + currentPage);
  const newEl = document.getElementById('page-' + page);
  if (!newEl) return;

  // Fade out the current page
  if (oldEl) {
    oldEl.classList.remove('visible');
    setTimeout(() => oldEl.classList.remove('active'), 400);
  }

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Strip visible first (page may have been visited before and still have it)
  newEl.classList.remove('visible');
  // Force browser to acknowledge the removed class before we set active + transition
  newEl.classList.add('active');

  // Double rAF ensures the browser has painted the translateY(18px) starting state
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newEl.classList.add('visible');
    });
  });

  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active-link', el.dataset.page === page);
  });

  updateNavbar();
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-page]');
  if (target && target.dataset.page) {
    e.preventDefault();
    navigateTo(target.dataset.page);
  }
});

(function() {
  const firstPage = document.getElementById('page-home');
  if (firstPage) {
    firstPage.classList.add('active');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        firstPage.classList.add('visible');
      });
    });
  }
})();

const overlay   = document.getElementById('modal-overlay');
const modalDesc  = document.getElementById('modal-desc');
const cancelBtn  = document.getElementById('modal-cancel');
const confirmBtn = document.getElementById('modal-confirm');
let pendingUrl = '';

function openModal(url, label) {
  pendingUrl = url;
  modalDesc.textContent = `You are about to leave Selenite and visit: ${label}. Continue?`;
  overlay.classList.add('active');
}

function closeModal() {
  overlay.classList.remove('active');
  pendingUrl = '';
}

cancelBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});
confirmBtn.addEventListener('click', () => {
  if (pendingUrl) window.open(pendingUrl, '_blank', 'noopener,noreferrer');
  closeModal();
});

const hamburger       = document.getElementById('hamburger-btn');
const sidebarEl       = document.getElementById('sidebar');
const sidebarOverlay  = document.getElementById('sidebar-overlay');
const sidebarClose    = document.getElementById('sidebar-close');
const sidebarSupportBtn = document.getElementById('sidebar-support-btn');

function openSidebar() {
  sidebarEl.classList.add('active');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebarEl.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', closeSidebar);
});

sidebarSupportBtn.addEventListener('click', () => {
  closeSidebar();
  openModal('https://discord.gg/y5m6EWUyQA', 'discord.gg/y5m6EWUyQA');
});

document.getElementById('support-btn').addEventListener('click', () => {
  openModal('https://discord.gg/y5m6EWUyQA', 'discord.gg/y5m6EWUyQA');
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-purchase');
  if (btn) {
    const url = btn.dataset.url;
    openModal(url, 'reseller.best');
  }
});

document.getElementById('download-btn').addEventListener('click', () => {
  window.location.href = 'https://wyvern.sh/public/loader/WyvernLoader.exe';
});

const lightbox      = document.getElementById('lightbox');
const lightboxBg    = document.getElementById('lightbox-bg');
const lightboxClose = document.getElementById('lightbox-close');
const uiCard        = document.getElementById('ui-card');

uiCard.addEventListener('click', () => {
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
});

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lightboxBg.addEventListener('click', closeLightbox);
lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeModal();
  }
});

function updateNavbar() {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 30) {
    nav.style.background = 'rgba(10,10,10,0.95)';
  } else {
    nav.style.background = 'rgba(10,10,10,0.7)';
  }
}

window.addEventListener('scroll', updateNavbar);

const applyForm    = document.getElementById('apply-form');
const applySuccess = document.getElementById('apply-success');
const submitBtn    = document.getElementById('submit-btn');

if (applyForm) {
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const csharpVal = document.querySelector('input[name="csharp"]:checked');
    if (!csharpVal || csharpVal.value === 'no') {
      alert('C# experience is required to apply. Applications without it cannot be considered.');
      return;
    }

    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    setTimeout(() => {
      applyForm.style.display = 'none';
      applySuccess.classList.add('visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  });
}
