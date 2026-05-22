
;(function () {
    'use strict';
  
    /* ════════════════════════════════════════════════════════════════════════
       00. INIT — Entry point
       Fires once on DOMContentLoaded; calls every module in sequence.
    ════════════════════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {
      embHeroCanvas();    // Section 1 · 3D circuit canvas
      embScrollReveal();  // All sections · scroll-triggered reveal
      embCounters();      // Section 8 · animated stat counters
      embFaqAccordion();  // Section 9 · FAQ open/close
      embSmoothScroll();  // Global · anchor smooth scroll
    });
  
  
    /* ════════════════════════════════════════════════════════════════════════
       01. HERO CANVAS — 3D animated circuit-board line system
       ─────────────────────────────────────────────────────────────────────
       Creates an animated canvas of:
         • Floating nodes (PCB via holes)
         • Connecting trace lines between nearby nodes
         • Gentle 3D-perspective depth simulation via z-coordinate
         • Pauses rendering when hero is not visible (IntersectionObserver)
    ════════════════════════════════════════════════════════════════════════ */
    function embHeroCanvas() {
      /* ── Get canvas element ── */
      var canvas = document.getElementById('embHeroCanvas');
      if (!canvas) return; // Guard: canvas may not exist if hero isn't present
  
      var ctx = canvas.getContext('2d');
      var rafId = null;         // requestAnimationFrame ID
      var isRunning = false;    // Whether animation loop is active
      var nodes = [];           // Array of circuit node objects
  
      /* ── Design tokens (matching CSS variables) ── */
      var COLORS = {
        node:     'rgba(32, 30, 90, 0.25)',     /* navy nodes */
        nodeAcc:  'rgba(229, 45, 95, 0.35)',    /* accent (red) nodes */
        line:     'rgba(32, 30, 90, 0.10)',     /* trace lines */
        lineAcc:  'rgba(106, 90, 255, 0.12)',   /* purple trace lines */
      };
      var NODE_COUNT  = 55;    /* Total circuit nodes */
      var CONNECT_DIST = 160;  /* Max distance to draw a trace line */
      var SPEED_SCALE  = 0.25; /* Node movement speed multiplier */
  
      /* ── Resize canvas to fill parent ── */
      function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      resize();
      window.addEventListener('resize', function () {
        resize();
        initNodes(); // Re-seed nodes on resize
      });
  
      /* ── Node factory ── */
      function createNode() {
        var depth = Math.random(); /* 0 = far (small, faint), 1 = close (large, vivid) */
        return {
          x:  Math.random() * canvas.width,
          y:  Math.random() * canvas.height,
          z:  depth,
          vx: (Math.random() - 0.5) * SPEED_SCALE * (0.5 + depth * 0.5),
          vy: (Math.random() - 0.5) * SPEED_SCALE * (0.5 + depth * 0.5),
          r:  1.5 + depth * 3.5,   /* Radius grows with depth */
          isAccent: Math.random() < 0.15, /* 15% are accent-coloured */
          /* Square vs round: 20% are square "pads" (PCB style) */
          shape: Math.random() < 0.20 ? 'square' : 'circle',
        };
      }
  
      /* ── Seed node array ── */
      function initNodes() {
        nodes = [];
        for (var i = 0; i < NODE_COUNT; i++) {
          nodes.push(createNode());
        }
      }
      initNodes();
  
      /* ── Draw a single node ── */
      function drawNode(n) {
        ctx.beginPath();
        ctx.fillStyle = n.isAccent ? COLORS.nodeAcc : COLORS.node;
        if (n.shape === 'square') {
          /* Small square pad */
          var s = n.r * 1.8;
          ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
        } else {
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
  
      /* ── Draw trace lines between nodes that are close enough ── */
      function drawLines() {
        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var a = nodes[i], b = nodes[j];
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
  
            if (dist < CONNECT_DIST) {
              /* Line fades as distance grows */
              var alpha = (1 - dist / CONNECT_DIST) * 0.6;
              /* Trace style: mostly straight H/V lines (PCB style) */
              var useAccent = a.isAccent && b.isAccent;
              ctx.beginPath();
              ctx.strokeStyle = useAccent
                ? 'rgba(106, 90, 255, ' + (alpha * 0.6) + ')'
                : 'rgba(32, 30, 90, '  + (alpha * 0.45) + ')';
              ctx.lineWidth = 0.8 + (a.z + b.z) * 0.4;
  
              /* Manhattan-style routing: go horizontal then vertical */
              if (Math.random() < 0.5) {
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, a.y); /* horizontal segment */
                ctx.lineTo(b.x, b.y); /* vertical segment */
              } else {
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(a.x, b.y); /* vertical first */
                ctx.lineTo(b.x, b.y); /* then horizontal */
              }
              ctx.stroke();
            }
          }
        }
      }
  
      /* ── Update node positions each frame ── */
      function updateNodes() {
        nodes.forEach(function (n) {
          n.x += n.vx;
          n.y += n.vy;
  
          /* Bounce off canvas walls */
          if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
          if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        });
      }
  
      /* ── Main animation loop ── */
      function animate() {
        if (!isRunning) return; /* Honour pause state */
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateNodes();
        drawLines();
        nodes.forEach(drawNode);
  
        rafId = requestAnimationFrame(animate);
      }
  
      /* ── Start / stop helpers (called by IntersectionObserver below) ── */
      function startAnim() {
        if (isRunning) return;
        isRunning = true;
        animate();
      }
      function stopAnim() {
        isRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
  
      /* ── Observe hero section visibility ── */
      /* Canvas pauses when hero scrolls off-screen → saves CPU/battery */
      var heroSection = document.getElementById('emb-hero');
      if (heroSection && 'IntersectionObserver' in window) {
        var heroObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            entry.isIntersecting ? startAnim() : stopAnim();
          });
        }, { threshold: 0.05 });
        heroObs.observe(heroSection);
      } else {
        /* Fallback: always run */
        startAnim();
      }
    }
    /* END: 01. HERO CANVAS */
  
  
    /* ════════════════════════════════════════════════════════════════════════
       02. SCROLL REVEAL — IntersectionObserver-based reveal system
       ─────────────────────────────────────────────────────────────────────
       • Elements with class  .emb-reveal  start hidden (opacity:0, translated)
       • When they enter the viewport, class .emb-is-visible  is added
       • When they LEAVE the viewport (scrolled past), .emb-is-visible is
         removed so they can re-animate on next scroll-back-into-view
       • When off-screen, .emb-anim-paused is added to stop any CSS
         animation running (reduces GPU load)
    ════════════════════════════════════════════════════════════════════════ */
    function embScrollReveal() {
      var reveals = document.querySelectorAll('.emb-reveal');
      if (!reveals.length) return;
  
      if (!('IntersectionObserver' in window)) {
        /* Fallback for old browsers: show everything immediately */
        reveals.forEach(function (el) {
          el.classList.add('emb-is-visible');
        });
        return;
      }
  
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Element entered viewport: reveal it, remove pause */
            entry.target.classList.add('emb-is-visible');
            entry.target.classList.remove('emb-anim-paused');
          } else {
            /* Element left viewport: hide again + pause animations */
            entry.target.classList.remove('emb-is-visible');
            entry.target.classList.add('emb-anim-paused');
          }
        });
      }, {
        threshold: 0.12,   /* Trigger when 12% of element is visible */
        rootMargin: '0px 0px -40px 0px', /* Slight offset from bottom edge */
      });
  
      reveals.forEach(function (el) {
        revealObs.observe(el);
      });
    }
    /* END: 02. SCROLL REVEAL */
  
  
    /* ════════════════════════════════════════════════════════════════════════
       03. COUNTER ANIMATION — Animated numbers in the "Why" stats bar
       ─────────────────────────────────────────────────────────────────────
       • Reads  data-emb-count  (target number) and data-emb-suffix
       • Uses easeOutCubic easing over ~1.8 seconds
       • Triggers once when element enters viewport (does NOT replay on
         re-entry to avoid flickering)
    ════════════════════════════════════════════════════════════════════════ */
    function embCounters() {
      var counters = document.querySelectorAll('[data-emb-count]');
      if (!counters.length) return;
  
      /* ── Easing function: ease-out cubic ── */
      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }
  
      /* ── Animate a single counter element ── */
      function animateCounter(el) {
        var target  = parseFloat(el.getAttribute('data-emb-count')) || 0;
        var suffix  = el.getAttribute('data-emb-suffix') || '';
        var duration = 1800; /* milliseconds */
        var startTime = null;
  
        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed  = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var eased    = easeOutCubic(progress);
          var current  = Math.round(eased * target);
  
          el.textContent = current + suffix;
  
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            /* Ensure final value is exact */
            el.textContent = target + suffix;
          }
        }
        requestAnimationFrame(step);
      }
  
      if (!('IntersectionObserver' in window)) {
        /* Fallback: animate immediately */
        counters.forEach(animateCounter);
        return;
      }
  
      /* ── Observe each counter; fire animation ONCE on first enter ── */
      var counterObs = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target); /* Don't replay */
          }
        });
      }, { threshold: 0.5 });
  
      counters.forEach(function (el) {
        counterObs.observe(el);
      });
    }
    /* END: 03. COUNTER ANIMATION */
  
  
    /* ════════════════════════════════════════════════════════════════════════
       04. FAQ ACCORDION — Accessible open/close toggle
       ─────────────────────────────────────────────────────────────────────
       • Toggles class  .emb-faq--open  on the parent  .emb-faq__item
       • Updates  aria-expanded  on the button for screen-reader support
       • Removes  [hidden]  attribute before CSS transition (max-height trick)
       • Closes all other items when one opens (single-open mode)
    ════════════════════════════════════════════════════════════════════════ */
    function embFaqAccordion() {
      var faqItems = document.querySelectorAll('.emb-faq__item');
      if (!faqItems.length) return;
  
      /* ── Close a specific item ── */
      function closeItem(item) {
        var btn    = item.querySelector('.emb-faq__q');
        var answer = item.querySelector('.emb-faq__a');
        if (!btn || !answer) return;
  
        item.classList.remove('emb-faq--open');
        btn.setAttribute('aria-expanded', 'false');
        /* Set max-height to 0 then restore hidden after transition */
        answer.style.maxHeight = '0px';
        setTimeout(function () {
          answer.setAttribute('hidden', '');
        }, 400); /* Match CSS transition duration */
      }
  
      /* ── Open a specific item ── */
      function openItem(item) {
        var btn    = item.querySelector('.emb-faq__q');
        var answer = item.querySelector('.emb-faq__a');
        if (!btn || !answer) return;
  
        /* Remove hidden so the element exists in layout before animating */
        answer.removeAttribute('hidden');
        /* Force reflow so transition fires from height 0 */
        answer.offsetHeight; /* eslint-disable-line no-unused-expressions */
  
        item.classList.add('emb-faq--open');
        btn.setAttribute('aria-expanded', 'true');
      }
  
      /* ── Wire click handlers to all FAQ buttons ── */
      faqItems.forEach(function (item) {
        var btn = item.querySelector('.emb-faq__q');
        if (!btn) return;
  
        btn.addEventListener('click', function () {
          var isOpen = item.classList.contains('emb-faq--open');
  
          /* Close all items first (accordion single-open mode) */
          faqItems.forEach(function (otherItem) {
            if (otherItem !== item) closeItem(otherItem);
          });
  
          /* Toggle clicked item */
          if (isOpen) {
            closeItem(item);
          } else {
            openItem(item);
          }
        });
  
        /* Keyboard: support Enter and Space ── */
        btn.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
          }
        });
      });
    }
    /* END: 04. FAQ ACCORDION */
  
  
    /* ════════════════════════════════════════════════════════════════════════
       05. SMOOTH SCROLL — Anchor link smooth scrolling
       ─────────────────────────────────────────────────────────────────────
       • Intercepts clicks on  href="#..."  links within the emb-page
       • Offsets scroll by 80px to account for fixed navbar height
       • Native CSS scroll-behavior:smooth used if supported
    ════════════════════════════════════════════════════════════════════════ */
    function embSmoothScroll() {
      var page = document.querySelector('.emb-page');
      if (!page) return;
  
      var NAV_OFFSET = 80; /* px — adjust to match your navbar height */
  
      page.addEventListener('click', function (e) {
        /* Walk up from click target to find an <a> element */
        var target = e.target.closest('a[href^="#"]');
        if (!target) return;
  
        var hash = target.getAttribute('href');
        if (!hash || hash === '#') return;
  
        var dest = document.querySelector(hash);
        if (!dest) return;
  
        e.preventDefault();
  
        /* Calculate scroll position with navbar offset */
        var destTop = dest.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
  
        window.scrollTo({
          top:      destTop,
          behavior: 'smooth',
        });
      });
    }
    /* END: 05. SMOOTH SCROLL */
  
  })(); /* End IIFE */