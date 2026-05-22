/* ============================================================
   FILE: js/iot-stats.js
   SECTION: Stats Band — #iot-stats
   PURPOSE: Count-up animation on stat numbers when section
            enters viewport. Resets and replays each time the
            section re-enters. Pauses via IntersectionObserver.
   ============================================================ */

(function () {
  "use strict";

  const section = document.getElementById("iot-stats");
  if (!section) return;

  /* All elements with data-iot-count attribute */
  const counters = section.querySelectorAll("[data-iot-count]");
  let started    = false;

  /* ── Easing function for smooth finish ── */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* ── Animate a single counter ── */
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.iotCount);
    const suffix   = el.dataset.iotSuffix   || "";
    const prefix   = el.dataset.iotPrefix   || "";
    const decimals = parseInt(el.dataset.iotDec || 0);
    const duration = 1800;
    let startTime  = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const value    = target * easeOutExpo(progress);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) {
        el._raf = requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    if (el._raf) cancelAnimationFrame(el._raf);
    el._raf = requestAnimationFrame(step);
  }

  /* ── Reset all counters to zero ── */
  function resetCounters() {
    started = false;
    counters.forEach(el => {
      if (el._raf) cancelAnimationFrame(el._raf);
      const suffix = el.dataset.iotSuffix || "";
      const prefix = el.dataset.iotPrefix || "";
      const dec    = parseInt(el.dataset.iotDec || 0);
      el.textContent = prefix + (0).toFixed(dec) + suffix;
    });
  }

  /* ── IntersectionObserver ── */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          counters.forEach((el, i) => {
            setTimeout(() => animateCounter(el), i * 140);
          });
        }
        if (!entry.isIntersecting) {
          resetCounters(); /* reset so it re-plays next time */
        }
      });
    }, { threshold: 0.3 }).observe(section);
  } else {
    counters.forEach(el => animateCounter(el));
  }

})();
