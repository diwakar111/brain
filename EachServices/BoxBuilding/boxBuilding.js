/**
 * ============================================================================
 *  BOX BUILD & ASSEMBLY — PAGE JAVASCRIPT
 *  File    : box-build.js
 *  Scope   : All code inside a single IIFE → zero global variables exported.
 *            Nothing attaches to window or document at the global level.
 *
 *  TABLE OF CONTENTS
 *  ─────────────────────────────────────────────────────────────────────────
 *  00. INIT           — DOMContentLoaded entry point; wires all modules
 *  01. HERO CANVAS    — 3D BoxBuild Motion animation (boxes, PCBs, wires)
 *  02. SCROLL REVEAL  — IntersectionObserver-based reveal + pause system
 *  03. FAQ ACCORDION  — Accessible single-open accordion toggle
 *  04. SMOOTH SCROLL  — Anchor-link smooth scrolling with navbar offset
 * ============================================================================
 */

;(function () {
    'use strict';
  
    /* ══════════════════════════════════════════════════════════════════════════
       00. INIT
       ────────────────────────────────────────────────────────────────────────
       Entry point: fires once when the DOM is fully parsed.
       Calls every module in order so dependencies are always satisfied.
    ══════════════════════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {
      bbaHeroCanvas();    /* Section 1  — 3D animated canvas                   */
      bbaScrollReveal();  /* All sections — scroll-triggered element reveal     */
      bbaFaqAccordion();  /* Section 9  — FAQ open/close accordion              */
      bbaSmoothScroll();  /* Global     — smooth anchor-link navigation         */
    });
  
  
    /* ══════════════════════════════════════════════════════════════════════════
       01. HERO CANVAS — 3D BoxBuild Motion Animation
       ────────────────────────────────────────────────────────────────────────
       What it draws (every animation frame):
         • 3D isometric floating BOXES (cuboid wireframes with depth shading)
         • PCB boards (flat rectangles with trace lines) sliding in and out
         • WIRING lines connecting nearby objects (like harness connections)
         • SCREWS / BOLTS orbiting around boxes (small circles with cross)
         • Objects have x/y drift AND slow 3D rotation on all axes
         • Depth (z-axis) controls size, opacity, and line weight
         • Objects that exit the canvas wrap around to the opposite side
  
       Performance:
         • Uses requestAnimationFrame — pauses automatically when tab hidden
         • IntersectionObserver pauses / resumes when hero scrolls off-screen
         • Canvas is resized on window resize and objects are re-seeded
  
       Colour palette (IoT blue + teal on light hero gradient):
         • Boxes:  rgba(255,255,255, …) wireframes (white on blue bg)
         • PCBs:   rgba(0, 194, 199, …) teal boards
         • Wires:  rgba(255,255,255, …) semi-transparent lines
         • Screws: rgba(255,255,255, …) small circles
    ══════════════════════════════════════════════════════════════════════════ */
    function bbaHeroCanvas() {
  
      /* ── Get canvas element; bail if not found ── */
      var canvas = document.getElementById('bbaHeroCanvas');
      if (!canvas) return;
  
      var ctx = canvas.getContext('2d');
  
      /* ── Animation state flags ── */
      var rafId     = null;   /* requestAnimationFrame ID (used to cancel)       */
      var isRunning = false;  /* true when animation loop is active              */
  
      /* ── Scene configuration constants ── */
      var BOX_COUNT   = 8;    /* Number of 3D floating boxes                     */
      var PCB_COUNT   = 5;    /* Number of floating PCB boards                   */
      var SCREW_COUNT = 12;   /* Number of orbiting screw/bolt particles          */
      var SPEED       = 0.30; /* Base movement speed multiplier                  */
  
      /* ── Scene object arrays ── */
      var boxes  = [];  /* Box object array                                       */
      var pcbs   = [];  /* PCB board object array                                 */
      var screws = [];  /* Screw/bolt particle array                              */
  
      /* ════════════════════════════════════════════════════════════════════════
         RESIZE — sets canvas pixel dimensions to match CSS layout size
         Called on init and on every window resize event.
      ════════════════════════════════════════════════════════════════════════ */
      function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      resize();
  
      window.addEventListener('resize', function () {
        resize();
        seedObjects(); /* Re-seed so objects are distributed in new dimensions  */
      });
  
      /* ════════════════════════════════════════════════════════════════════════
         FACTORY FUNCTIONS — create new scene object with randomised properties
      ════════════════════════════════════════════════════════════════════════ */
  
      /* Creates a single 3D box object.
         depth: 0 = far (small, faint), 1 = near (large, vivid)                */
      function makeBox() {
        var depth = 0.2 + Math.random() * 0.8;
        return {
          /* Position — random start point across the canvas                   */
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          /* Velocity — slow drift in a random direction                       */
          vx: (Math.random() - 0.5) * SPEED * 0.6,
          vy: (Math.random() - 0.5) * SPEED * 0.6,
          /* Depth / perspective scale                                         */
          depth: depth,
          size:  16 + depth * 32,           /* Box half-width                  */
          /* 3D rotation angles in radians (rotates slowly each frame)         */
          rotX:  Math.random() * Math.PI * 2,
          rotY:  Math.random() * Math.PI * 2,
          rotZ:  Math.random() * Math.PI * 2,
          /* Angular velocity — unique slow spin per box                       */
          rotVX: (Math.random() - 0.5) * 0.008,
          rotVY: (Math.random() - 0.5) * 0.012,
          rotVZ: (Math.random() - 0.5) * 0.005,
          /* Opacity based on depth (far = more transparent)                   */
          alpha: 0.15 + depth * 0.45,
        };
      }
  
      /* Creates a PCB board object (flat rectangle floating in 3D)            */
      function makePCB() {
        var depth = 0.2 + Math.random() * 0.8;
        return {
          x:     Math.random() * canvas.width,
          y:     Math.random() * canvas.height,
          vx:    (Math.random() - 0.5) * SPEED * 0.4,
          vy:    (Math.random() - 0.5) * SPEED * 0.4,
          depth: depth,
          w:     40 + depth * 50,           /* PCB width                       */
          h:     26 + depth * 30,           /* PCB height                      */
          rotY:  Math.random() * Math.PI * 2,
          rotVY: (Math.random() - 0.5) * 0.014,
          alpha: 0.20 + depth * 0.40,
        };
      }
  
      /* Creates a screw/bolt particle (small circle + cross)                  */
      function makeScrew() {
        var depth = 0.1 + Math.random() * 0.9;
        return {
          x:     Math.random() * canvas.width,
          y:     Math.random() * canvas.height,
          vx:    (Math.random() - 0.5) * SPEED,
          vy:    (Math.random() - 0.5) * SPEED,
          depth: depth,
          r:     2 + depth * 4,             /* Screw head radius               */
          alpha: 0.15 + depth * 0.50,
        };
      }
  
      /* ════════════════════════════════════════════════════════════════════════
         SEED — populate all scene object arrays
      ════════════════════════════════════════════════════════════════════════ */
      function seedObjects() {
        boxes  = [];
        pcbs   = [];
        screws = [];
        for (var i = 0; i < BOX_COUNT;   i++) boxes.push(makeBox());
        for (var j = 0; j < PCB_COUNT;   j++) pcbs.push(makePCB());
        for (var k = 0; k < SCREW_COUNT; k++) screws.push(makeScrew());
      }
      seedObjects();
  
      /* ════════════════════════════════════════════════════════════════════════
         DRAW FUNCTIONS — each draws one instance of its object type
      ════════════════════════════════════════════════════════════════════════ */
  
      /* Draws one isometric 3D box using 2D canvas transforms.
         The box is approximated with isometric projection:
           • Top face    (lighter shade)
           • Left face   (medium shade)
           • Right face  (slightly darker)
         All three faces are drawn as parallelograms using fillRect + transform. */
      function drawBox(b) {
        /* Isometric projection factors derived from rotation angles            */
        var cosY  = Math.cos(b.rotY);
        var sinY  = Math.sin(b.rotY);
        var cosX  = Math.cos(b.rotX) * 0.5;  /* Flatten X rotation for iso    */
        var s     = b.size;
  
        /* The three face colours — white wireframe on gradient background      */
        var baseAlpha = b.alpha;
  
        ctx.save();
        ctx.translate(b.x, b.y);
  
        /* ── Top face of the box ── */
        ctx.beginPath();
        /* Iso top: four points of the top rhombus                              */
        var tx0 = -s * cosY,  ty0 = -s * cosX - s * 0.5;
        var tx1 =  s * cosY,  ty1 = -s * cosX - s * 0.5;
        var tx2 =  s * cosY + s * sinY, ty2 = -s * cosX;
        var tx3 = -s * cosY + s * sinY, ty3 = -s * cosX;
        ctx.moveTo(tx0, ty0);
        ctx.lineTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.lineTo(tx3, ty3);
        ctx.closePath();
        ctx.fillStyle   = 'rgba(255,255,255,' + (baseAlpha * 0.20) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,' + (baseAlpha * 0.80) + ')';
        ctx.lineWidth   = 0.8 + b.depth * 0.6;
        ctx.stroke();
  
        /* ── Left face of the box ── */
        ctx.beginPath();
        ctx.moveTo(tx0, ty0);
        ctx.lineTo(tx3, ty3);
        ctx.lineTo(tx3, ty3 + s);  /* Drop straight down by height             */
        ctx.lineTo(tx0, ty0 + s);
        ctx.closePath();
        ctx.fillStyle   = 'rgba(255,255,255,' + (baseAlpha * 0.10) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,' + (baseAlpha * 0.65) + ')';
        ctx.stroke();
  
        /* ── Right face of the box ── */
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.lineTo(tx2, ty2 + s);
        ctx.lineTo(tx1, ty1 + s);
        ctx.closePath();
        ctx.fillStyle   = 'rgba(200,240,255,' + (baseAlpha * 0.08) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,' + (baseAlpha * 0.55) + ')';
        ctx.stroke();
  
        /* ── Bottom two vertical edges ── */
        ctx.beginPath();
        ctx.moveTo(tx3, ty3 + s);
        ctx.lineTo(tx2, ty2 + s);
        ctx.strokeStyle = 'rgba(255,255,255,' + (baseAlpha * 0.45) + ')';
        ctx.stroke();
  
        ctx.restore();
      }
  
      /* Draws one PCB board — a flat rectangle with teal colour and traces.
         The board is perspective-skewed using rotY (horizontal flip effect).   */
      function drawPCB(p) {
        var scaleX = Math.abs(Math.cos(p.rotY));  /* 0–1 perspective scale      */
        var visW   = p.w * scaleX;                /* Apparent width after rotate */
  
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.alpha;
  
        /* PCB base board (teal-tinted rectangle) */
        ctx.fillStyle   = 'rgba(0, 194, 199, 0.20)';
        ctx.strokeStyle = 'rgba(0, 194, 199, 0.70)';
        ctx.lineWidth   = 1 + p.depth * 0.5;
        ctx.beginPath();
        ctx.roundRect(-visW / 2, -p.h / 2, visW, p.h, 3);
        ctx.fill();
        ctx.stroke();
  
        /* Only draw internal details when board is wide enough to see them     */
        if (visW > 20) {
          /* Trace line 1 — horizontal */
          ctx.beginPath();
          ctx.moveTo(-visW * 0.4, -p.h * 0.2);
          ctx.lineTo( visW * 0.4, -p.h * 0.2);
          ctx.strokeStyle = 'rgba(0, 194, 199, 0.50)';
          ctx.lineWidth   = 0.7;
          ctx.stroke();
  
          /* Trace line 2 — horizontal */
          ctx.beginPath();
          ctx.moveTo(-visW * 0.4, p.h * 0.2);
          ctx.lineTo( visW * 0.1, p.h * 0.2);
          ctx.stroke();
  
          /* Mini IC chip block in centre */
          ctx.fillStyle = 'rgba(0, 100, 120, 0.60)';
          ctx.fillRect(-visW * 0.15, -p.h * 0.25, visW * 0.30, p.h * 0.50);
        }
  
        ctx.globalAlpha = 1;
        ctx.restore();
      }
  
      /* Draws one screw/bolt particle — small circle with crosshair.          */
      function drawScrew(s) {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
        ctx.lineWidth   = 0.8;
  
        /* Outer circle (screw head) */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.stroke();
  
        /* Cross slot on screw head */
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 0.6, s.y);
        ctx.lineTo(s.x + s.r * 0.6, s.y);
        ctx.moveTo(s.x, s.y - s.r * 0.6);
        ctx.lineTo(s.x, s.y + s.r * 0.6);
        ctx.stroke();
  
        ctx.globalAlpha = 1;
        ctx.restore();
      }
  
      /* Draws wiring lines between nearby boxes and PCBs.
         Lines are drawn only when two objects are within CONNECTION_DIST of each other.
         Alpha fades linearly as distance increases (nearer = more opaque).     */
      function drawWires() {
        var CONNECTION_DIST = 180;  /* Maximum pixel distance to draw a wire    */
  
        /* Check all box-to-PCB pairs */
        for (var i = 0; i < boxes.length; i++) {
          for (var j = 0; j < pcbs.length; j++) {
            var bx  = boxes[i];
            var pc  = pcbs[j];
            var dx  = bx.x - pc.x;
            var dy  = bx.y - pc.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
  
            if (dist < CONNECTION_DIST) {
              /* Wire opacity: strongest when close, fades to 0 at max dist    */
              var wireAlpha = (1 - dist / CONNECTION_DIST) * 0.35;
  
              ctx.beginPath();
              /* Use a slight curve for the wire (quadratic bezier)            */
              var midX = (bx.x + pc.x) / 2;
              var midY = (bx.y + pc.y) / 2 - 20;  /* Control point offset     */
              ctx.moveTo(bx.x, bx.y);
              ctx.quadraticCurveTo(midX, midY, pc.x, pc.y);
              ctx.strokeStyle = 'rgba(255,255,255,' + wireAlpha + ')';
              ctx.lineWidth   = 0.8;
              ctx.setLineDash([4, 4]);   /* Dashed wire (harness style)        */
              ctx.stroke();
              ctx.setLineDash([]);        /* Reset dash for other draws         */
            }
          }
        }
      }
  
      /* ════════════════════════════════════════════════════════════════════════
         UPDATE — move all objects each frame and handle canvas boundary wrap
      ════════════════════════════════════════════════════════════════════════ */
      function update() {
        var W = canvas.width;
        var H = canvas.height;
  
        /* Update 3D boxes: position + rotation */
        boxes.forEach(function (b) {
          b.x    += b.vx;
          b.y    += b.vy;
          b.rotX += b.rotVX;   /* Increment 3D rotation angles each frame      */
          b.rotY += b.rotVY;
          b.rotZ += b.rotVZ;
          /* Wrap around canvas edges (objects re-enter from opposite side)     */
          if (b.x < -b.size * 2)      b.x = W + b.size * 2;
          if (b.x >  W + b.size * 2)  b.x = -b.size * 2;
          if (b.y < -b.size * 2)      b.y = H + b.size * 2;
          if (b.y >  H + b.size * 2)  b.y = -b.size * 2;
        });
  
        /* Update PCB boards: position + rotation */
        pcbs.forEach(function (p) {
          p.x    += p.vx;
          p.y    += p.vy;
          p.rotY += p.rotVY;   /* Only rotate around Y (horizontal perspective) */
          if (p.x < -p.w)       p.x = W + p.w;
          if (p.x >  W + p.w)   p.x = -p.w;
          if (p.y < -p.h)        p.y = H + p.h;
          if (p.y >  H + p.h)    p.y = -p.h;
        });
  
        /* Update screw particles: position only */
        screws.forEach(function (s) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < -s.r * 2)      s.x = W + s.r * 2;
          if (s.x >  W + s.r * 2)  s.x = -s.r * 2;
          if (s.y < -s.r * 2)      s.y = H + s.r * 2;
          if (s.y >  H + s.r * 2)  s.y = -s.r * 2;
        });
      }
  
      /* ════════════════════════════════════════════════════════════════════════
         DRAW — render one full frame
      ════════════════════════════════════════════════════════════════════════ */
      function draw() {
        /* Clear canvas completely before redraw                                */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        /* Sort boxes by depth so far objects are drawn behind near ones        */
        var sortedBoxes = boxes.slice().sort(function (a, b) { return a.depth - b.depth; });
  
        /* Draw wires first (behind everything else)                           */
        drawWires();
  
        /* Draw PCB boards (middle layer)                                      */
        pcbs.forEach(drawPCB);
  
        /* Draw sorted boxes (depth order — far first)                         */
        sortedBoxes.forEach(drawBox);
  
        /* Draw screws on top of everything                                    */
        screws.forEach(drawScrew);
      }
  
      /* ════════════════════════════════════════════════════════════════════════
         ANIMATION LOOP — update + draw, then request next frame
      ════════════════════════════════════════════════════════════════════════ */
      function animate() {
        if (!isRunning) return;   /* Exit if paused by IntersectionObserver     */
        update();
        draw();
        rafId = requestAnimationFrame(animate);
      }
  
      /* ════════════════════════════════════════════════════════════════════════
         START / STOP — called by IntersectionObserver to save CPU
         Animation pauses when the hero section is NOT visible on screen.
      ════════════════════════════════════════════════════════════════════════ */
      function startAnim() {
        if (isRunning) return;    /* Guard against double-start                 */
        isRunning = true;
        animate();
      }
      function stopAnim() {
        isRunning = false;
        if (rafId) {
          cancelAnimationFrame(rafId);  /* Stop the rAF loop immediately        */
          rafId = null;
        }
      }
  
      /* ════════════════════════════════════════════════════════════════════════
         VISIBILITY OBSERVER — pause canvas when hero is off-screen
         threshold:0.05 means "hero is at least 5% visible → start"
      ════════════════════════════════════════════════════════════════════════ */
      var heroSection = document.getElementById('bba-hero');
      if (heroSection && 'IntersectionObserver' in window) {
        var heroObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              startAnim();  /* Hero visible → start animation                  */
            } else {
              stopAnim();   /* Hero off-screen → pause animation               */
            }
          });
        }, { threshold: 0.05 });
        heroObs.observe(heroSection);
      } else {
        /* Fallback for browsers without IntersectionObserver                  */
        startAnim();
      }
  
    } /* END bbaHeroCanvas */
  
  
    /* ══════════════════════════════════════════════════════════════════════════
       02. SCROLL REVEAL
       ────────────────────────────────────────────────────────────────────────
       Handles the reveal animation for all elements with class .bba-reveal.
  
       Behaviour:
         • Elements start with opacity:0 + translated (from CSS)
         • When element enters viewport → adds .bba-is-visible (CSS animates it)
         • When element leaves viewport → removes .bba-is-visible (hides again)
           AND adds .bba-anim-paused (disables CSS transition so GPU animation
           stops consuming resources while element is off-screen)
         • --bba-delay CSS custom property on elements creates stagger timing
  
       threshold: 0.12 = element must be 12% in view before triggering
       rootMargin: -40px bottom offset avoids early trigger near scroll bottom
    ══════════════════════════════════════════════════════════════════════════ */
    function bbaScrollReveal() {
      /* Select all elements that need scroll-based reveal */
      var reveals = document.querySelectorAll('.bba-reveal');
      if (!reveals.length) return;
  
      /* Fallback for browsers without IntersectionObserver support            */
      if (!('IntersectionObserver' in window)) {
        reveals.forEach(function (el) {
          el.classList.add('bba-is-visible');   /* Show everything immediately  */
        });
        return;
      }
  
      /* Create observer — fires when each element crosses the visibility threshold */
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Element entered viewport:
               - Remove paused class (re-enable CSS transitions)
               - Add visible class (CSS transition animates element in)         */
            entry.target.classList.remove('bba-anim-paused');
            entry.target.classList.add('bba-is-visible');
          } else {
            /* Element left viewport:
               - Remove visible class (element will hide)
               - Add paused class (disables GPU-consuming transitions while hidden) */
            entry.target.classList.remove('bba-is-visible');
            entry.target.classList.add('bba-anim-paused');
          }
        });
      }, {
        threshold:  0.12,              /* 12% visibility triggers the change    */
        rootMargin: '0px 0px -40px 0px',  /* 40px bottom offset                */
      });
  
      /* Attach observer to every reveal element */
      reveals.forEach(function (el) {
        revealObs.observe(el);
      });
  
    } /* END bbaScrollReveal */
  
  
    /* ══════════════════════════════════════════════════════════════════════════
       03. FAQ ACCORDION
       ────────────────────────────────────────────────────────────────────────
       Accessible single-open accordion for Section 9 (FAQ).
  
       Pattern:
         • Clicking a question button toggles .bba-faq--open on its parent item
         • Only ONE item can be open at a time (accordion mode)
         • ARIA attributes (aria-expanded) are updated for screen-readers
         • CSS max-height transition handles the smooth open/close animation
           The [hidden] attribute is removed BEFORE transition so CSS can animate
           from max-height:0 → max-height:700px
         • Keyboard: Enter and Space keys work as clicks (button element handles
           this natively, but we reinforce it with an explicit keydown handler)
    ══════════════════════════════════════════════════════════════════════════ */
    function bbaFaqAccordion() {
      /* Select all FAQ item containers */
      var faqItems = document.querySelectorAll('.bba-faq__item');
      if (!faqItems.length) return;
  
      /* ── closeItem: collapse a single FAQ item ── */
      function closeItem(item) {
        var btn    = item.querySelector('.bba-faq__q');
        var answer = item.querySelector('.bba-faq__a');
        if (!btn || !answer) return;
  
        /* Remove open class — CSS transitions answer back to max-height:0      */
        item.classList.remove('bba-faq--open');
        /* Update ARIA so screen-readers announce collapsed state               */
        btn.setAttribute('aria-expanded', 'false');
  
        /* After the CSS transition completes, restore [hidden] so the element
           is removed from accessibility tree and doesn't take up tab focus     */
        setTimeout(function () {
          answer.setAttribute('hidden', '');
        }, 420); /* Match the 0.42s CSS transition duration */
      }
  
      /* ── openItem: expand a single FAQ item ── */
      function openItem(item) {
        var btn    = item.querySelector('.bba-faq__q');
        var answer = item.querySelector('.bba-faq__a');
        if (!btn || !answer) return;
  
        /* Step 1: Remove [hidden] so the element enters the DOM layout.
           Without this, max-height transition has nothing to animate to.       */
        answer.removeAttribute('hidden');
  
        /* Step 2: Force a reflow so the browser registers the element exists
           before we apply the transition. This prevents the "snap" issue.      */
        void answer.offsetHeight;  /* eslint-disable-line no-void */
  
        /* Step 3: Apply open state — CSS transitions max-height from 0         */
        item.classList.add('bba-faq--open');
        /* Update ARIA expanded state for screen-readers                       */
        btn.setAttribute('aria-expanded', 'true');
      }
  
      /* ── Wire click events to all FAQ question buttons ── */
      faqItems.forEach(function (item) {
        var btn = item.querySelector('.bba-faq__q');
        if (!btn) return;
  
        /* Click handler — toggle current item, close all others               */
        btn.addEventListener('click', function () {
          var isCurrentlyOpen = item.classList.contains('bba-faq--open');
  
          /* Close ALL items (ensures only one is ever open at a time)         */
          faqItems.forEach(function (otherItem) {
            if (otherItem !== item) {
              closeItem(otherItem);
            }
          });
  
          /* Toggle the clicked item: open if closed, close if open            */
          if (isCurrentlyOpen) {
            closeItem(item);
          } else {
            openItem(item);
          }
        });
  
        /* Keyboard handler — explicitly handle Enter + Space on button.
           Native <button> elements handle this, but we include it for
           clarity and in case any CSS resets override default button behaviour. */
        btn.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();  /* Prevent page scroll on Space               */
            btn.click();         /* Trigger the click handler above            */
          }
        });
      });
  
    } /* END bbaFaqAccordion */
  
  
    /* ══════════════════════════════════════════════════════════════════════════
       04. SMOOTH SCROLL
       ────────────────────────────────────────────────────────────────────────
       Intercepts clicks on internal anchor links (href="#something") and
       scrolls smoothly to the target element, offsetting for the fixed navbar.
  
       NAV_OFFSET: adjust this value to match your navbar's height in pixels.
       It is subtracted from the target's top position so the section heading
       isn't hidden behind the fixed navigation bar.
    ══════════════════════════════════════════════════════════════════════════ */
    function bbaSmoothScroll() {
      var page = document.querySelector('.bba-page');
      if (!page) return;
  
      /* Navbar height offset — adjust to match your navbar height             */
      var NAV_OFFSET = 80;
  
      /* Delegate click listener on the page wrapper — handles all anchor clicks */
      page.addEventListener('click', function (e) {
        /* Walk up the DOM from click target to find an <a> element            */
        var anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;  /* Click wasn't on an anchor link                */
  
        var hash = anchor.getAttribute('href');
        /* Skip empty or pure-hash links                                       */
        if (!hash || hash === '#') return;
  
        /* Find the target element by its id                                   */
        var targetEl = document.querySelector(hash);
        if (!targetEl) return;  /* Target doesn't exist in DOM                 */
  
        e.preventDefault();  /* Stop default jump-to-anchor behaviour         */
  
        /* Calculate scroll position: element top + page scroll - navbar height */
        var targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
  
        /* Smooth scroll to calculated position                                */
        window.scrollTo({
          top:      targetTop,
          behavior: 'smooth',
        });
  
      });
  
    } /* END bbaSmoothScroll */
  
  
  })(); /* End IIFE — no globals exported */