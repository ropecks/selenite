/* ============================================================
   SELENITE 3.0 — main.js
   ============================================================ */

// ── Background Canvas ──────────────────────────────────────
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
      // drift
      this.x += this.vx;
      this.y += this.vy;

      // bounce
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;

      // mouse repulsion
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

      // draw line from particle to mouse cursor
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
    // smooth mouse follow
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


// ── Modal System ───────────────────────────────────────────
const overlay  = document.getElementById('modal-overlay');
const modalDesc   = document.getElementById('modal-desc');
const cancelBtn   = document.getElementById('modal-cancel');
const confirmBtn  = document.getElementById('modal-confirm');
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


// ── Mobile Sidebar ─────────────────────────────────────────
const hamburger      = document.getElementById('hamburger-btn');
const sidebarEl      = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarClose   = document.getElementById('sidebar-close');
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

// close sidebar when a link is tapped
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


// ── Purchase Buttons ───────────────────────────────────────
document.querySelectorAll('.btn-purchase').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.url;
    openModal(url, 'reseller.best');
  });
});


// ── Download Button ────────────────────────────────────────
document.getElementById('download-btn').addEventListener('click', () => {
  window.location.href = 'https://wyvern.sh/public/loader/WyvernLoader.exe';
});


// ── UI Image Lightbox ──────────────────────────────────────
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
  if (e.key === 'Escape') closeLightbox();
});


// ── Navbar scroll effect ───────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 30) {
    nav.style.background = 'rgba(10,10,10,0.95)';
  } else {
    nav.style.background = 'rgba(10,10,10,0.7)';
  }
});


// ── Scroll reveal ──────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.plan-card, .preview-card, .step, .terms-block, .download-box').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
