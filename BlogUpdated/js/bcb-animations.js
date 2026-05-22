/**
 * ============================================================
 *  bcb-animations.js  —  BrainChild Tech | Blog Page Animations
 *  Style  : Tech-themed (scan lines, pulse, glitch, fade-rise)
 *  Rules  :
 *    • Animations run ONLY when the section is visible
 *    • Scrolling away PAUSES the animation mid-state
 *    • Scrolling back RESUMES from where it left off
 *    • Every section block is FULLY ISOLATED — zero cross-deps
 *    • One IntersectionObserver per section for performance
 * ============================================================
 */

;(function () {
    'use strict';
  
    /* ──────────────────────────────────────────────────────────
     *  SHARED UTILITY  —  used internally, not exposed globally
     * ────────────────────────────────────────────────────────── */
  
    /**
     * Observe an element; fire onEnter when ≥ threshold is visible,
     * fire onLeave when it drops below that threshold.
     * Returns the observer so callers can disconnect if needed.
     */
    function watchVisibility(el, onEnter, onLeave, threshold) {
      if (!el) return null;
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              onEnter && onEnter();
            } else {
              onLeave && onLeave();
            }
          });
        },
        { threshold: threshold || 0.15 }
      );
      obs.observe(el);
      return obs;
    }
  
    /**
     * rAF loop helper — returns a controller { start, stop, toggle }
     * The tick fn receives elapsed ms since last frame.
     */
    function makeLoop(tickFn) {
      var raf = null;
      var last = null;
      var running = false;
  
      function loop(ts) {
        if (!running) return;
        var dt = last === null ? 0 : ts - last;
        last = ts;
        tickFn(dt);
        raf = requestAnimationFrame(loop);
      }
  
      return {
        start: function () {
          if (running) return;
          running = true;
          last = null;
          raf = requestAnimationFrame(loop);
        },
        stop: function () {
          running = false;
          last = null;
          if (raf) { cancelAnimationFrame(raf); raf = null; }
        },
        isRunning: function () { return running; }
      };
    }
  
    /* ──────────────────────────────────────────────────────────────────────
     *  SECTION 1  —  HERO  (#bcb-hero-section)
     *
     *  Effects:
     *    1. Canvas particle field (floating dots connected by thin lines)
     *       — pauses/resumes with visibility
     *    2. Orbs pulse via CSS class toggle (CSS handles keyframe)
     *    3. Content elements slide + fade in on first enter
     *    4. Search bar gets a neon scan-line sweep on enter
     *    5. Pill chips stagger-pop in with scale bounce
     * ────────────────────────────────────────────────────────────────────── */
    (function heroSection() {
      var section  = document.getElementById('bcb-hero-section');
      var canvas   = document.getElementById('bcbHeroCanvas');
      if (!section) return;
  
      /* ── CSS for hero content animations (injected once) ── */
      var style = document.createElement('style');
      style.textContent = [
        /* slide-fade up */
        '@keyframes bcbHeroRise{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}',
        /* scan line sweep */
        '@keyframes bcbHeroScan{0%{background-position:-200% 0}100%{background-position:200% 0}}',
        /* pill pop */
        '@keyframes bcbHeroPillPop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}',
        /* orb pulse */
        '@keyframes bcbOrbPulse{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.18);opacity:.8}}',
  
        /* eyebrow */
        '.bcb-hero__eyebrow.bcb-anim-ready{opacity:0}',
        '.bcb-hero__eyebrow.bcb-anim-go{animation:bcbHeroRise .7s cubic-bezier(.22,1,.36,1) both}',
  
        /* title */
        '.bcb-hero__title.bcb-anim-ready{opacity:0}',
        '.bcb-hero__title.bcb-anim-go{animation:bcbHeroRise .8s .12s cubic-bezier(.22,1,.36,1) both}',
  
        /* subtitle */
        '.bcb-hero__subtitle.bcb-anim-ready{opacity:0}',
        '.bcb-hero__subtitle.bcb-anim-go{animation:bcbHeroRise .8s .22s cubic-bezier(.22,1,.36,1) both}',
  
        /* search bar */
        '.bcb-hero__search.bcb-anim-ready{opacity:0}',
        '.bcb-hero__search.bcb-anim-go{animation:bcbHeroRise .7s .32s cubic-bezier(.22,1,.36,1) both}',
  
        /* scan line on search */
        '.bcb-hero__search.bcb-scan-go::after{content:"";position:absolute;inset:0;border-radius:inherit;' +
          'background:linear-gradient(90deg,transparent 0%,rgba(0,229,255,.18) 50%,transparent 100%);' +
          'background-size:200% 100%;animation:bcbHeroScan 1.4s .9s ease both;pointer-events:none}',
  
        /* pills */
        '.bcb-hero__pill.bcb-anim-ready{opacity:0}',
        '.bcb-hero__pill.bcb-anim-go{animation:bcbHeroPillPop .55s cubic-bezier(.22,1,.36,1) both}',
  
        /* orbs — active class triggers pulse */
        '.bcb-hero__orb.bcb-orb-active{animation:bcbOrbPulse 3.5s ease-in-out infinite}',
        '.bcb-hero__orb--2.bcb-orb-active{animation-delay:.9s}',
        '.bcb-hero__orb--3.bcb-orb-active{animation-delay:1.8s}',
      ].join('');
      document.head.appendChild(style);
  
      /* ── Grab animatable elements ── */
      var eyebrow  = section.querySelector('.bcb-hero__eyebrow');
      var title    = section.querySelector('.bcb-hero__title');
      var subtitle = section.querySelector('.bcb-hero__subtitle');
      var search   = section.querySelector('.bcb-hero__search');
      var pills    = Array.from(section.querySelectorAll('.bcb-hero__pill'));
      var orbs     = Array.from(section.querySelectorAll('.bcb-hero__orb'));
  
      /* Mark elements as hidden until animation fires */
      [eyebrow, title, subtitle, search].forEach(function (el) {
        if (el) el.classList.add('bcb-anim-ready');
      });
      pills.forEach(function (p) { p.classList.add('bcb-anim-ready'); });
  
      var contentAnimated = false;
  
      function animateContent() {
        if (contentAnimated) return;
        contentAnimated = true;
  
        [eyebrow, title, subtitle, search].forEach(function (el) {
          if (!el) return;
          el.classList.remove('bcb-anim-ready');
          el.classList.add('bcb-anim-go');
        });
  
        if (search) search.classList.add('bcb-scan-go');
  
        pills.forEach(function (pill, i) {
          var delay = (pill.dataset.delay || i * 80);
          pill.style.animationDelay = (parseInt(delay) + 440) + 'ms';
          pill.classList.remove('bcb-anim-ready');
          pill.classList.add('bcb-anim-go');
        });
      }
  
      /* ── Canvas particle field ── */
      var ctx, W, H, particles = [];
      var PARTICLE_COUNT = 55;
      var MAX_DIST       = 120;
  
      function initCanvas() {
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        spawnParticles();
      }
  
      function resize() {
        if (!canvas) return;
        W = canvas.width  = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
      }
  
      function spawnParticles() {
        particles = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x : Math.random() * W,
            y : Math.random() * H,
            vx: (Math.random() - .5) * .4,
            vy: (Math.random() - .5) * .4,
            r : Math.random() * 2 + 1
          });
        }
      }
  
      var canvasLoop = makeLoop(function () {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
  
        /* move particles */
        particles.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;
        });
  
        /* draw connections */
        ctx.strokeStyle = 'rgba(0,229,255,0.12)';
        ctx.lineWidth   = 1;
        for (var i = 0; i < particles.length; i++) {
          for (var j = i + 1; j < particles.length; j++) {
            var dx = particles[i].x - particles[j].x;
            var dy = particles[i].y - particles[j].y;
            var d  = Math.sqrt(dx * dx + dy * dy);
            if (d < MAX_DIST) {
              ctx.globalAlpha = (1 - d / MAX_DIST) * 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
  
        /* draw dots */
        ctx.globalAlpha = 1;
        particles.forEach(function (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,229,255,0.55)';
          ctx.fill();
        });
      });
  
      initCanvas();
      window.addEventListener('resize', function () {
        resize();
        spawnParticles();
      });
  
      /* ── Visibility watcher ── */
      watchVisibility(
        section,
        function onEnter() {
          animateContent();
          canvasLoop.start();
          orbs.forEach(function (o) { o.classList.add('bcb-orb-active'); });
        },
        function onLeave() {
          canvasLoop.stop();
          orbs.forEach(function (o) { o.classList.remove('bcb-orb-active'); });
        },
        0.1
      );
    })();
  
  
    /* ──────────────────────────────────────────────────────────────────────
     *  SECTION 2  —  FEATURED POST  (#bcb-featured-section)
     *
     *  Effects:
     *    1. Card slides in from left (visual) + right (content) simultaneously
     *    2. Metrics count up with a scan-bar that sweeps left→right
     *    3. Badge pulses after enter
     *    4. Thumb grid gets a scanline flicker loop while visible
     * ────────────────────────────────────────────────────────────────────── */
    (function featuredSection() {
      var section = document.getElementById('bcb-featured-section');
      if (!section) return;
  
      var style = document.createElement('style');
      style.textContent = [
        '@keyframes bcbFeatSlideLeft{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:translateX(0)}}',
        '@keyframes bcbFeatSlideRight{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}',
        '@keyframes bcbFeatBadgePulse{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,.4)}60%{box-shadow:0 0 0 8px rgba(0,229,255,0)}}',
        '@keyframes bcbFeatScan{0%{left:-100%}100%{left:110%}}',
        '@keyframes bcbFeatGridFlicker{0%,100%{opacity:.18}50%{opacity:.28}}',
  
        /* visual side */
        '.bcb-featured__visual.bcb-anim-ready{opacity:0;transform:translateX(-48px)}',
        '.bcb-featured__visual.bcb-anim-go{animation:bcbFeatSlideLeft .75s cubic-bezier(.22,1,.36,1) both}',
  
        /* content side */
        '.bcb-featured__content.bcb-anim-ready{opacity:0;transform:translateX(48px)}',
        '.bcb-featured__content.bcb-anim-go{animation:bcbFeatSlideRight .75s .1s cubic-bezier(.22,1,.36,1) both}',
  
        /* badge pulse */
        '.bcb-featured__badge.bcb-badge-pulse{animation:bcbFeatBadgePulse 2s 1s ease-in-out infinite}',
  
        /* scan bar on metrics */
        '.bcb-featured__metrics{position:relative;overflow:hidden}',
        '.bcb-featured__metrics .bcb-scan-bar{position:absolute;top:0;bottom:0;width:60px;' +
          'background:linear-gradient(90deg,transparent,rgba(0,229,255,.18),transparent);' +
          'animation:bcbFeatScan 1.8s .6s ease both;pointer-events:none}',
  
        /* thumb grid flicker while visible */
        '.bcb-featured__thumb-grid.bcb-grid-flicker{animation:bcbFeatGridFlicker 3s ease-in-out infinite}',
      ].join('');
      document.head.appendChild(style);
  
      var visual  = section.querySelector('.bcb-featured__visual');
      var content = section.querySelector('.bcb-featured__content');
      var badge   = section.querySelector('.bcb-featured__badge');
      var metrics = section.querySelector('.bcb-featured__metrics');
      var grid    = section.querySelector('.bcb-featured__thumb-grid');
  
      if (visual)  visual.classList.add('bcb-anim-ready');
      if (content) content.classList.add('bcb-anim-ready');
  
      var entered = false;
  
      /* Metric count-up */
      var metricDefs = [
        { el: section.querySelector('.bcb-featured__metric:nth-child(1) .bcb-featured__metric-val'), target: 73,  suffix: '%',  prefix: '' },
        { el: section.querySelector('.bcb-featured__metric:nth-child(2) .bcb-featured__metric-val'), target: 12,  suffix: 'L',  prefix: '₹' },
        { el: section.querySelector('.bcb-featured__metric:nth-child(3) .bcb-featured__metric-val'), target: 14,  suffix: ' Days', prefix: '' },
      ];
  
      function countUp() {
        metricDefs.forEach(function (m) {
          if (!m.el) return;
          var start   = 0;
          var duration = 1400;
          var startTs  = null;
          function step(ts) {
            if (!startTs) startTs = ts;
            var progress = Math.min((ts - startTs) / duration, 1);
            var val = Math.round(progress * m.target);
            m.el.textContent = m.prefix + val + m.suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }
  
      function onEnter() {
        if (!entered) {
          entered = true;
          if (visual)  { visual.classList.remove('bcb-anim-ready');  visual.classList.add('bcb-anim-go'); }
          if (content) { content.classList.remove('bcb-anim-ready'); content.classList.add('bcb-anim-go'); }
  
          /* inject scan bar */
          if (metrics && !metrics.querySelector('.bcb-scan-bar')) {
            var bar = document.createElement('div');
            bar.className = 'bcb-scan-bar';
            metrics.appendChild(bar);
          }
  
          setTimeout(countUp, 400);
        }
  
        if (badge) badge.classList.add('bcb-badge-pulse');
        if (grid)  grid.classList.add('bcb-grid-flicker');
      }
  
      function onLeave() {
        if (badge) badge.classList.remove('bcb-badge-pulse');
        if (grid)  grid.classList.remove('bcb-grid-flicker');
      }
  
      watchVisibility(section, onEnter, onLeave, 0.2);
    })();
  
  
    /* ──────────────────────────────────────────────────────────────────────
     *  SECTION 3  —  BLOG GRID + SIDEBAR  (#bcb-layout-section)
     *
     *  Effects:
     *    1. Cards stagger fade-rise in batches of 3
     *    2. Card thumb gets a CSS scan-pulse on enter
     *    3. Sidebar widgets slide in from right, staggered
     *    4. Stat counters in sidebar animate up while visible
     *    5. Tags pop in with scale stagger while visible
     * ────────────────────────────────────────────────────────────────────── */
    (function gridSidebarSection() {
      var section = document.getElementById('bcb-layout-section');
      if (!section) return;
  
      var style = document.createElement('style');
      style.textContent = [
        '@keyframes bcbCardRise{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}',
        '@keyframes bcbCardThumbScan{0%{opacity:0;left:-100%}30%{opacity:1}100%{opacity:0;left:110%}}',
        '@keyframes bcbSideSlide{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}',
        '@keyframes bcbTagPop{0%{opacity:0;transform:scale(.5)}70%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}',
  
        /* cards */
        '.bcb-grid__card.bcb-anim-ready{opacity:0;transform:translateY(36px)}',
        '.bcb-grid__card.bcb-anim-go{animation:bcbCardRise .65s cubic-bezier(.22,1,.36,1) both}',
  
        /* thumb scan overlay */
        '.bcb-grid__thumb{position:relative;overflow:hidden}',
        '.bcb-grid__thumb .bcb-thumb-scan{position:absolute;inset:0;' +
          'background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);' +
          'width:60%;pointer-events:none}',
        '.bcb-grid__thumb .bcb-thumb-scan.bcb-scan-active{animation:bcbCardThumbScan 1s ease both}',
  
        /* sidebar widgets */
        '.bcb-sidebar__widget.bcb-anim-ready{opacity:0;transform:translateX(40px)}',
        '.bcb-sidebar__widget.bcb-anim-go{animation:bcbSideSlide .7s cubic-bezier(.22,1,.36,1) both}',
  
        /* tags */
        '.bcb-sidebar__tag.bcb-anim-ready{opacity:0;transform:scale(.5)}',
        '.bcb-sidebar__tag.bcb-anim-go{animation:bcbTagPop .45s cubic-bezier(.22,1,.36,1) both}',
      ].join('');
      document.head.appendChild(style);
  
      var cards    = Array.from(section.querySelectorAll('.bcb-grid__card'));
      var widgets  = Array.from(section.querySelectorAll('.bcb-sidebar__widget'));
      var tags     = Array.from(section.querySelectorAll('.bcb-sidebar__tag'));
      var statEls  = Array.from(section.querySelectorAll('.bcb-sidebar__stat-val[data-target]'));
  
      /* Mark hidden */
      cards.forEach(function (c) { c.classList.add('bcb-anim-ready'); });
      widgets.forEach(function (w) { w.classList.add('bcb-anim-ready'); });
      tags.forEach(function (t) { t.classList.add('bcb-anim-ready'); });
  
      var cardsAnimated   = false;
      var widgetsAnimated = false;
      var statsAnimated   = false;
      var tagsAnimated    = false;
  
      /* Per-card IntersectionObserver for stagger */
      cards.forEach(function (card, i) {
        var cardObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                card.classList.remove('bcb-anim-ready');
                card.classList.add('bcb-anim-go');
  
                /* thumb scan sweep */
                var thumb = card.querySelector('.bcb-grid__thumb');
                if (thumb) {
                  var scan = thumb.querySelector('.bcb-thumb-scan');
                  if (!scan) {
                    scan = document.createElement('div');
                    scan.className = 'bcb-thumb-scan';
                    thumb.appendChild(scan);
                  }
                  scan.classList.remove('bcb-scan-active');
                  void scan.offsetWidth; /* reflow to restart */
                  scan.classList.add('bcb-scan-active');
                }
              }, (i % 3) * 120);
              cardObs.disconnect();
            }
          });
        }, { threshold: 0.18 });
        cardObs.observe(card);
      });
  
      /* Sidebar widgets stagger */
      var sideObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !widgetsAnimated) {
            widgetsAnimated = true;
            widgets.forEach(function (w, i) {
              setTimeout(function () {
                w.classList.remove('bcb-anim-ready');
                w.classList.add('bcb-anim-go');
              }, i * 130);
            });
          }
        });
      }, { threshold: 0.1 });
      var sidebar = section.querySelector('.bcb-sidebar');
      if (sidebar) sideObs.observe(sidebar);
  
      /* Stat counters */
      var statObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statEls.forEach(function (el) {
              var target   = parseFloat(el.dataset.target) || 0;
              var suffix   = el.nextElementSibling && el.nextElementSibling.textContent || '';
              var duration = 1200;
              var startTs  = null;
              function step(ts) {
                if (!startTs) startTs = ts;
                var p   = Math.min((ts - startTs) / duration, 1);
                var val = Math.round(p * target);
                el.textContent = val;
                if (p < 1) requestAnimationFrame(step);
              }
              requestAnimationFrame(step);
            });
          }
        });
      }, { threshold: 0.3 });
      if (sidebar) statObs.observe(sidebar);
  
      /* Tags pop stagger */
      var tagObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !tagsAnimated) {
            tagsAnimated = true;
            tags.forEach(function (tag, i) {
              setTimeout(function () {
                tag.classList.remove('bcb-anim-ready');
                tag.classList.add('bcb-anim-go');
              }, i * 55);
            });
          }
        });
      }, { threshold: 0.2 });
      var tagWidget = section.querySelector('.bcb-sidebar__tags');
      if (tagWidget) tagObs.observe(tagWidget);
    })();
  
  
    /* ──────────────────────────────────────────────────────────────────────
     *  SECTION 4  —  TRUST  (#bcb-trust-section)
     *
     *  Effects:
     *    1. Header title gets a glitch flicker on enter
     *    2. Cards rise in with stagger (left → center → right)
     *    3. Card icons get a rotating "radar sweep" while section visible
     *    4. Card border pulses with neon glow on hover (CSS-only fallback)
     *    5. Loop: radar sweep restarts every time section re-enters viewport
     * ────────────────────────────────────────────────────────────────────── */
    (function trustSection() {
      var section = document.getElementById('bcb-trust-section');
      if (!section) return;
  
      var style = document.createElement('style');
      style.textContent = [
        /* glitch title */
        '@keyframes bcbTrustGlitch{' +
          '0%,100%{clip-path:inset(0 0 100% 0);transform:translateX(0)}' +
          '10%{clip-path:inset(10% 0 80% 0);transform:translateX(-3px)}' +
          '20%{clip-path:inset(30% 0 50% 0);transform:translateX(3px)}' +
          '30%{clip-path:inset(60% 0 20% 0);transform:translateX(-2px)}' +
          '40%{clip-path:inset(80% 0 5% 0);transform:translateX(0)}' +
          '50%{clip-path:inset(0 0 0 0);transform:translateX(0)}' +
        '}',
  
        /* card rise */
        '@keyframes bcbTrustCardRise{from{opacity:0;transform:translateY(40px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}',
  
        /* radar sweep on icon */
        '@keyframes bcbTrustRadar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
  
        /* title reveal */
        '.bcb-trust__title.bcb-anim-ready{opacity:0}',
        '.bcb-trust__title.bcb-anim-go{opacity:1;animation:bcbHeroRise .7s cubic-bezier(.22,1,.36,1) both}',
  
        '.bcb-trust__subtitle.bcb-anim-ready{opacity:0}',
        '.bcb-trust__subtitle.bcb-anim-go{animation:bcbHeroRise .7s .12s cubic-bezier(.22,1,.36,1) both}',
  
        /* trust card */
        '.bcb-trust__card.bcb-anim-ready{opacity:0;transform:translateY(40px) scale(.96)}',
        '.bcb-trust__card.bcb-anim-go{animation:bcbTrustCardRise .7s cubic-bezier(.22,1,.36,1) both}',
  
        /* radar conic on icon container while visible */
        '.bcb-trust__card-icon.bcb-radar-active{position:relative;overflow:hidden}',
        '.bcb-trust__card-icon.bcb-radar-active::after{' +
          'content:"";position:absolute;inset:-50%;' +
          'background:conic-gradient(from 0deg,transparent 0deg,rgba(0,229,255,.25) 60deg,transparent 60deg);' +
          'animation:bcbTrustRadar 2.4s linear infinite;pointer-events:none}',
  
        /* glitch pseudo element */
        '.bcb-trust__title{position:relative}',
        '.bcb-trust__title .bcb-glitch-layer{' +
          'position:absolute;inset:0;color:#00e5ff;pointer-events:none;' +
          'animation:bcbTrustGlitch .6s .3s steps(1) both}',
      ].join('');
      document.head.appendChild(style);
  
      var titleEl    = section.querySelector('.bcb-trust__title');
      var subtitleEl = section.querySelector('.bcb-trust__subtitle');
      var cards      = Array.from(section.querySelectorAll('.bcb-trust__card'));
      var icons      = Array.from(section.querySelectorAll('.bcb-trust__card-icon'));
  
      if (titleEl)    titleEl.classList.add('bcb-anim-ready');
      if (subtitleEl) subtitleEl.classList.add('bcb-anim-ready');
      cards.forEach(function (c) { c.classList.add('bcb-anim-ready'); });
  
      var entered = false;
  
      function onEnter() {
        if (!entered) {
          entered = true;
  
          /* glitch layer on title */
          if (titleEl) {
            var ghost = document.createElement('span');
            ghost.className       = 'bcb-glitch-layer';
            ghost.textContent     = titleEl.textContent;
            ghost.setAttribute('aria-hidden', 'true');
            titleEl.appendChild(ghost);
            titleEl.classList.remove('bcb-anim-ready');
            titleEl.classList.add('bcb-anim-go');
          }
  
          if (subtitleEl) {
            subtitleEl.classList.remove('bcb-anim-ready');
            subtitleEl.classList.add('bcb-anim-go');
          }
  
          cards.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.remove('bcb-anim-ready');
              card.classList.add('bcb-anim-go');
            }, i * 150);
          });
        }
  
        /* radar icons always active while visible */
        icons.forEach(function (ic) { ic.classList.add('bcb-radar-active'); });
      }
  
      function onLeave() {
        icons.forEach(function (ic) { ic.classList.remove('bcb-radar-active'); });
      }
  
      watchVisibility(section, onEnter, onLeave, 0.2);
    })();
  
  
    /* ──────────────────────────────────────────────────────────────────────
     *  SECTION 5  —  CTA BANNER  (#bcb-cta-section)
     *
     *  Effects:
     *    1. Orbs animate in with scale + opacity while visible
     *    2. Eyebrow label types itself in (typewriter) on enter
     *    3. Title rises with a neon text-shadow pulse
     *    4. Subtitle fades in
     *    5. CTA buttons pop in with a spring scale + glow sweep
     *    6. Continuous neon border pulse on primary button while visible
     * ────────────────────────────────────────────────────────────────────── */
    (function ctaSection() {
      var section = document.getElementById('bcb-cta-section');
      if (!section) return;
  
      var style = document.createElement('style');
      style.textContent = [
        '@keyframes bcbCtaOrbIn{from{opacity:0;transform:scale(.4)}to{opacity:.7;transform:scale(1)}}',
        '@keyframes bcbCtaTitleRise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}',
        '@keyframes bcbCtaSubFade{from{opacity:0}to{opacity:1}}',
        '@keyframes bcbCtaBtnPop{0%{opacity:0;transform:scale(.8)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}',
        '@keyframes bcbCtaBtnGlow{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,.5)}50%{box-shadow:0 0 18px 4px rgba(0,229,255,.25)}}',
        '@keyframes bcbCtaOrbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}',
  
        /* orbs */
        '.bcb-cta__orb.bcb-anim-ready{opacity:0;transform:scale(.4)}',
        '.bcb-cta__orb.bcb-anim-go{animation:bcbCtaOrbIn .9s cubic-bezier(.22,1,.36,1) both}',
        '.bcb-cta__orb.bcb-cta-orb-pulse{animation:bcbCtaOrbPulse 3s ease-in-out infinite}',
        '.bcb-cta__orb--2.bcb-cta-orb-pulse{animation-delay:1.2s}',
  
        /* eyebrow */
        '.bcb-cta__eyebrow.bcb-anim-ready{opacity:0}',
  
        /* title */
        '.bcb-cta__title.bcb-anim-ready{opacity:0;transform:translateY(28px)}',
        '.bcb-cta__title.bcb-anim-go{animation:bcbCtaTitleRise .75s .2s cubic-bezier(.22,1,.36,1) both}',
  
        /* subtitle */
        '.bcb-cta__subtitle.bcb-anim-ready{opacity:0}',
        '.bcb-cta__subtitle.bcb-anim-go{animation:bcbCtaSubFade .7s .35s ease both}',
  
        /* buttons */
        '.bcb-cta__btn.bcb-anim-ready{opacity:0;transform:scale(.8)}',
        '.bcb-cta__btn.bcb-anim-go{animation:bcbCtaBtnPop .55s cubic-bezier(.22,1,.36,1) both}',
  
        /* primary button glow pulse while visible */
        '.bcb-cta__btn--primary.bcb-btn-glow{animation:bcbCtaBtnGlow 2.2s ease-in-out infinite}',
      ].join('');
      document.head.appendChild(style);
  
      var orbs     = Array.from(section.querySelectorAll('.bcb-cta__orb'));
      var eyebrow  = section.querySelector('.bcb-cta__eyebrow');
      var titleEl  = section.querySelector('.bcb-cta__title');
      var subtitle = section.querySelector('.bcb-cta__subtitle');
      var btns     = Array.from(section.querySelectorAll('.bcb-cta__btn'));
      var primaryBtn = section.querySelector('.bcb-cta__btn--primary');
  
      orbs.forEach(function (o) { o.classList.add('bcb-anim-ready'); });
      if (eyebrow)  eyebrow.classList.add('bcb-anim-ready');
      if (titleEl)  titleEl.classList.add('bcb-anim-ready');
      if (subtitle) subtitle.classList.add('bcb-anim-ready');
      btns.forEach(function (b) { b.classList.add('bcb-anim-ready'); });
  
      var entered   = false;
      var typeTimer = null;
  
      function typewrite(el, text, speed) {
        el.textContent = '';
        el.style.opacity = '1';
        var i = 0;
        function next() {
          if (i < text.length) {
            el.textContent += text[i++];
            typeTimer = setTimeout(next, speed);
          }
        }
        next();
      }
  
      function onEnter() {
        if (!entered) {
          entered = true;
  
          /* orbs pop in staggered */
          orbs.forEach(function (o, i) {
            o.style.animationDelay = (i * 200) + 'ms';
            o.classList.remove('bcb-anim-ready');
            o.classList.add('bcb-anim-go');
          });
  
          /* eyebrow typewriter */
          if (eyebrow) {
            var text = eyebrow.textContent.trim();
            typewrite(eyebrow, text, 42);
          }
  
          /* title, subtitle */
          if (titleEl)  titleEl.classList.remove('bcb-anim-ready'),  titleEl.classList.add('bcb-anim-go');
          if (subtitle) subtitle.classList.remove('bcb-anim-ready'), subtitle.classList.add('bcb-anim-go');
  
          /* buttons stagger */
          btns.forEach(function (btn, i) {
            setTimeout(function () {
              btn.classList.remove('bcb-anim-ready');
              btn.classList.add('bcb-anim-go');
            }, 500 + i * 120);
          });
        }
  
        /* continuous while visible */
        orbs.forEach(function (o) { o.classList.add('bcb-cta-orb-pulse'); });
        if (primaryBtn) primaryBtn.classList.add('bcb-btn-glow');
      }
  
      function onLeave() {
        orbs.forEach(function (o) { o.classList.remove('bcb-cta-orb-pulse'); });
        if (primaryBtn) primaryBtn.classList.remove('bcb-btn-glow');
        if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
      }
  
      watchVisibility(section, onEnter, onLeave, 0.2);
    })();
  
  
    /* ──────────────────────────────────────────────────────────────────────
     *  GLOBAL  —  Scroll-aware "data-delay" card re-trigger guard
     *
     *  Ensures that if a user rapidly scrolls through cards that were
     *  already mid-animation, they are not double-applied.
     *  Also adds a subtle "hover neon border" to every .bcb-grid__card
     *  and .bcb-trust__card via a single injected style block.
     * ────────────────────────────────────────────────────────────────────── */
    (function globalPolish() {
      var style = document.createElement('style');
      style.textContent = [
        /* neon border hover — grid cards */
        '.bcb-grid__card{transition:box-shadow .3s ease,transform .3s ease}',
        '.bcb-grid__card:hover{box-shadow:0 0 0 1.5px rgba(0,229,255,.35),0 8px 32px rgba(0,0,0,.12);transform:translateY(-4px)}',
  
        /* neon border hover — trust cards */
        '.bcb-trust__card{transition:box-shadow .3s ease,transform .3s ease}',
        '.bcb-trust__card:hover{box-shadow:0 0 0 1.5px rgba(123,47,255,.35),0 8px 32px rgba(0,0,0,.1);transform:translateY(-4px)}',
  
        /* featured card hover */
        '.bcb-featured__card{transition:box-shadow .35s ease}',
        '.bcb-featured__card:hover{box-shadow:0 0 0 1.5px rgba(0,229,255,.25),0 12px 40px rgba(0,0,0,.12)}',
  
        /* CTA buttons hover */
        '.bcb-cta__btn{transition:transform .25s ease,box-shadow .25s ease}',
        '.bcb-cta__btn:hover{transform:translateY(-2px) scale(1.03)}',
      ].join('');
      document.head.appendChild(style);
    })();
  
  })();