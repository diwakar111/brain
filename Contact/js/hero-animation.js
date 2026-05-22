/* ============================================================
   FILE: js/hero-animation.js
   SECTION: Hero Section — Canvas Particle Network Animation
   PURPOSE: Draws animated IoT-inspired node network on canvas.
            Pauses when section is off-screen, resumes on visibility.
   ============================================================ */

(function () {
  "use strict";

  /* --- CONFIG: tweak these values to adjust look & feel --- */
  const CONFIG = {
    particleCount: 90,         // number of nodes
    connectionDistance: 140,   // max px distance to draw a line
    particleSpeed: 0.45,       // movement speed
    particleRadius: 2.5,       // dot size
    accentColor: "#0A6EBD",    // node & line base color
    pulseColor: "#00C2C7",     // pulsing highlight color
    backgroundColor: "transparent",
    lineOpacityMax: 0.18,      // max line alpha
    pulseInterval: 2200,       // ms between random pulse triggers
  };

  /* --- DOM refs --- */
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  /* --- State --- */
  let animFrameId = null;
  let isVisible = false;
  let particles = [];
  let pulseNodes = new Set();
  let W = 0, H = 0;

  /* ── Resize canvas to fill hero section ── */
  function resizeCanvas() {
    const hero = document.getElementById("bc-hero");
    W = canvas.width = hero ? hero.offsetWidth : window.innerWidth;
    H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }

  /* ── Create a single particle object ── */
  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * CONFIG.particleSpeed,
      vy: (Math.random() - 0.5) * CONFIG.particleSpeed,
      r: CONFIG.particleRadius + Math.random() * 1.2,
      pulse: 0,        // 0–1 pulse animation progress
      pulsing: false,
    };
  }

  /* ── Initialise particle array ── */
  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle());
    }
  }

  /* ── Move particles, bounce off walls ── */
  function updateParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      /* advance pulse animation */
      if (p.pulsing) {
        p.pulse += 0.03;
        if (p.pulse >= 1) { p.pulse = 0; p.pulsing = false; }
      }
    });
  }

  /* ── Draw connections between nearby particles ── */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const alpha = (1 - dist / CONFIG.connectionDistance) * CONFIG.lineOpacityMax;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(10,110,189,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Draw each particle dot ── */
  function drawParticles() {
    particles.forEach((p) => {
      /* base dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.accentColor;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;

      /* pulse ring */
      if (p.pulsing) {
        const ringRadius = p.r + p.pulse * 18;
        const ringAlpha = (1 - p.pulse) * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.pulseColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = ringAlpha;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }

  /* ── Main render loop ── */
  function render() {
    ctx.clearRect(0, 0, W, H);
    updateParticles();
    drawConnections();
    drawParticles();
    animFrameId = requestAnimationFrame(render);
  }

  /* ── Start / stop animation based on visibility ── */
  function startAnimation() {
    if (!animFrameId) {
      render();
    }
  }

  function stopAnimation() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  /* ── Random pulse trigger ── */
  let pulseTimer = null;
  function startPulseTrigger() {
    pulseTimer = setInterval(() => {
      if (!isVisible) return;
      const idx = Math.floor(Math.random() * particles.length);
      particles[idx].pulsing = true;
      particles[idx].pulse = 0;
    }, CONFIG.pulseInterval);
  }

  /* ── IntersectionObserver: pause off-screen, resume on-screen ── */
  const heroSection = document.getElementById("bc-hero");
  if (heroSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(heroSection);
  } else {
    startAnimation(); // fallback: always run
  }

  /* ── Init ── */
  resizeCanvas();
  initParticles();
  startPulseTrigger();
  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });
})();
