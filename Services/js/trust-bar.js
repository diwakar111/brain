/* ═══════════════════════════════════════════════════════
   SECTION JS: TRUST BAR
   File: js/trust-bar.js
   Handles: count-up animation when section enters viewport
            Animation pauses when out of view and restarts
            when visible again
   Independent: YES – touches only .bc-trust elements
═══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    var trustSection = document.getElementById('bc-trust');
    if (!trustSection) return; /* Guard */
  
    var stats     = trustSection.querySelectorAll('.bc-trust__stat');
    var animated  = false; /* Prevent re-running on re-enter */
  
    /* ── Count-up function ── */
    function countUp(el, target, suffix, duration) {
      var numEl   = el.querySelector('.bc-trust__num');
      if (!numEl) return;
  
      var start     = 0;
      var startTime = null;
  
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        /* Ease-out cubic */
        var eased    = 1 - Math.pow(1 - progress, 3);
        var current  = Math.floor(eased * target);
        numEl.textContent = current + suffix;
  
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          numEl.textContent = target + suffix;
        }
      }
  
      requestAnimationFrame(step);
    }
  
    /* ── Run all counters ── */
    function runCounters() {
      stats.forEach(function (stat, i) {
        var target  = parseInt(stat.getAttribute('data-count'), 10)  || 0;
        var suffix  = stat.getAttribute('data-suffix')               || '';
        var delay   = i * 120; /* stagger */
  
        /* Reveal animation via CSS class */
        setTimeout(function () {
          stat.classList.add('bc-in-view');
          countUp(stat, target, suffix, 1400);
        }, delay);
      });
    }
  
    /* ── Intersection Observer ── */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !animated) {
          animated = true;
          runCounters();
        }
      });
    }, { threshold: 0.3 });
  
    observer.observe(trustSection);
  
  })();
  