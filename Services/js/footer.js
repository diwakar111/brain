(function () {
    'use strict';
  
    /* ══════════════════════════════════════════
       CANVAS 1 — Particle network (background)
    ══════════════════════════════════════════ */
    (function () {
      var cv  = document.getElementById('bctf4-canvas-particles');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      var W, H, pts = [];
  
      function resize() {
        var r = cv.parentElement.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        W = cv.width  = r.width  * dpr;
        H = cv.height = r.height * dpr;
        cv.style.width  = r.width  + 'px';
        cv.style.height = r.height + 'px';
        ctx.scale(dpr, dpr);
        pts = [];
        for (var i = 0; i < 50; i++) pts.push(mkPt(r.width, r.height));
      }
  
      function mkPt(w, h) {
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
          r: Math.random() * 1.2 + .3,
          a: Math.random() * .2 + .04,
          c: Math.random() > .5 ? '#00e5ff' : '#7b2fff'
        };
      }
  
      function loop() {
        var dpr = window.devicePixelRatio || 1;
        var w = W / dpr, h = H / dpr;
        ctx.clearRect(0, 0, w, h);
        pts.forEach(function (p, i) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
          for (var j = i + 1; j < pts.length; j++) {
            var d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
            if (d < 90) {
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = p.c; ctx.globalAlpha = .025 * (1 - d / 90);
              ctx.lineWidth = .5; ctx.stroke();
            }
          }
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(loop);
      }
  
      resize();
      loop();
      window.addEventListener('resize', resize);
    })();
  
  
    /* ══════════════════════════════════════════
       CANVAS 2 — Circuit board traces (foreground layer)
    ══════════════════════════════════════════ */
    (function () {
      var cv  = document.getElementById('bctf4-canvas-circuit');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      var W, H, traces = [], frame = 0;
  
      function resize() {
        var r   = cv.parentElement.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        W = cv.width  = r.width  * dpr;
        H = cv.height = r.height * dpr;
        cv.style.width  = r.width  + 'px';
        cv.style.height = r.height + 'px';
        ctx.scale(dpr, dpr);
        buildTraces(r.width, r.height);
      }
  
      function buildTraces(w, h) {
        traces = [];
        var cols = Math.floor(w / 90), rows = Math.floor(h / 70);
        for (var c = 0; c < cols; c++) {
          for (var r = 0; r < rows; r++) {
            if (Math.random() < .35) {
              var x1 = 40 + c * 90 + Math.random() * 25;
              var y1 = 30 + r * 70 + Math.random() * 18;
              var bx = x1 + 30 + Math.random() * 35;
              var x2 = bx, y2 = y1 + 22 + Math.random() * 22;
              traces.push({
                x1: x1, y1: y1, bx: bx, by: y1, x2: x2, y2: y2,
                color: Math.random() > .55 ? 'rgba(0,229,255,' : 'rgba(123,47,255,',
                op: .06 + Math.random() * .1,
                pulse: Math.random(),
                speed: .002 + Math.random() * .003
              });
            }
          }
        }
      }
  
      function loop() {
        var dpr = window.devicePixelRatio || 1;
        var w = W / dpr, h = H / dpr;
        ctx.clearRect(0, 0, w, h);
  
        traces.forEach(function (t) {
          /* Static trace */
          ctx.beginPath();
          ctx.moveTo(t.x1, t.y1);
          ctx.lineTo(t.bx, t.by);
          ctx.lineTo(t.x2, t.y2);
          ctx.strokeStyle = t.color + t.op + ')';
          ctx.lineWidth = 1.2; ctx.stroke();
  
          /* Pads */
          [[t.x1,t.y1],[t.bx,t.by],[t.x2,t.y2]].forEach(function(pt) {
            ctx.beginPath(); ctx.arc(pt[0], pt[1], 2, 0, Math.PI * 2);
            ctx.fillStyle = t.color + (t.op * 1.6) + ')'; ctx.fill();
          });
  
          /* Travelling pulse dot */
          t.pulse += t.speed;
          if (t.pulse > 1) t.pulse = 0;
          var px, py;
          if (t.pulse < .5) {
            var s = t.pulse / .5;
            px = t.x1 + (t.bx - t.x1) * s;
            py = t.y1 + (t.by - t.y1) * s;
          } else {
            var s2 = (t.pulse - .5) / .5;
            px = t.bx + (t.x2 - t.bx) * s2;
            py = t.by + (t.y2 - t.by) * s2;
          }
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.globalAlpha = .55;
          ctx.shadowBlur = 8; ctx.shadowColor = t.color + '1)';
          ctx.fill();
          ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        });
  
        frame++;
        requestAnimationFrame(loop);
      }
  
      resize();
      loop();
      window.addEventListener('resize', resize);
    })();
  
  
    /* ══════════════════════════════════════════
       SCROLL REVEAL — columns
    ══════════════════════════════════════════ */
    var colObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('bctf4-vis');
          colObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
  
    document.querySelectorAll('.bctf4-col').forEach(function (el) {
      colObs.observe(el);
    });
  
  
    /* ══════════════════════════════════════════
       ANIMATED COUNT-UP — stats
    ══════════════════════════════════════════ */
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        statObs.unobserve(e.target);
        var el     = e.target;
        var target = parseFloat(el.dataset.f4Target);
        var suffix = el.dataset.f4Suffix || '';
        var dec    = parseInt(el.dataset.f4Dec || '0');
        var dur    = 1600;
        var t0     = performance.now();
        (function tick(now) {
          var p    = Math.min((now - t0) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = (ease * target).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      });
    }, { threshold: 0.5 });
  
    document.querySelectorAll('[data-f4-target]').forEach(function (el) {
      statObs.observe(el);
    });
  
  })();