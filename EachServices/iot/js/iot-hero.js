/* ============================================================
   FILE: js/iot-hero.js
   SECTION: Hero — #iot-hero
   PURPOSE: Canvas particle-network animation. IoT-themed nodes
            connected by lines, pulsing signals along edges.
            Pauses via IntersectionObserver when off-screen.
   ============================================================ */

(function () {
  "use strict";

  /* ── DOM refs ── */
  const canvas  = document.getElementById("iot-hero-canvas");
  const section = document.getElementById("iot-hero");
  if (!canvas || !section) return;
  const ctx = canvas.getContext("2d");

  /* ── Config ── */
  const CFG = {
    nodes:          80,
    connectDist:    150,
    speed:          0.38,
    nodeR:          2.2,
    primaryColor:   "#0A6EBD",
    accentColor:    "#00C2C7",
    lineAlphaMax:   0.16,
    pulseInterval:  2000,
  };

  let W = 0, H = 0, nodes = [], rafId = null, isVisible = false;

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }

  /* ── Create nodes ── */
  function initNodes() {
    nodes = Array.from({ length: CFG.nodes }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * CFG.speed,
      vy: (Math.random() - 0.5) * CFG.speed,
      r:  CFG.nodeR + Math.random(),
      pulse: 0, pulsing: false,
    }));
  }

  /* ── Update node positions ── */
  function update() {
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      if (n.pulsing) {
        n.pulse += 0.025;
        if (n.pulse >= 1) { n.pulse = 0; n.pulsing = false; }
      }
    });
  }

  /* ── Draw connections ── */
  function drawEdges() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CFG.connectDist) {
          const a = (1 - d / CFG.connectDist) * CFG.lineAlphaMax;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(10,110,189,${a})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Draw nodes ── */
  function drawNodes() {
    nodes.forEach(n => {
      /* core dot */
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = CFG.primaryColor;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;

      /* pulse ring */
      if (n.pulsing) {
        const ring = n.r + n.pulse * 16;
        ctx.beginPath();
        ctx.arc(n.x, n.y, ring, 0, Math.PI * 2);
        ctx.strokeStyle = CFG.accentColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = (1 - n.pulse) * 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }

  /* ── Render loop ── */
  function render() {
    ctx.clearRect(0, 0, W, H);
    update();
    drawEdges();
    drawNodes();
    rafId = requestAnimationFrame(render);
  }

  /* ── Start / stop ── */
  function start() { if (!rafId) render(); }
  function stop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  /* ── Random pulse trigger ── */
  setInterval(() => {
    if (!isVisible) return;
    const n = nodes[Math.floor(Math.random() * nodes.length)];
    n.pulsing = true; n.pulse = 0;
  }, CFG.pulseInterval);

  /* ── IntersectionObserver: pause off-screen ── */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        isVisible = e.isIntersecting;
        isVisible ? start() : stop();
      });
    }, { threshold: 0.1 }).observe(section);
  } else {
    start();
  }

  /* ── Init ── */
  resize();
  initNodes();
  window.addEventListener("resize", () => { resize(); initNodes(); });

})();
