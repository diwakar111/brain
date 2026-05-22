/* ============================================================
   FILE: js/stats-counter.js
   SECTION: Stats / Numbers Section — Animated Count-Up
   PURPOSE: Counts numbers up from 0 to target when section enters
            the viewport. Pauses if section leaves, resets on re-entry
            (controlled via data attributes on each stat element).
   ============================================================ */

(function () {
  "use strict";

  /* ── Find all stat counter elements ── */
  const statEls = document.querySelectorAll("[data-count]");
  if (!statEls.length) return;

  const statsSection = document.getElementById("bc-stats-section");
  let countersStarted = false;

  /* ── Easing function for smooth count-up ── */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* ── Animate a single counter element ── */
  function animateCounter(el) {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || "";
    const prefix  = el.dataset.prefix || "";
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1800; // ms
    let startTime = null;
    let rafId = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const current  = target * eased;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
      el._rafId = rafId;
    }

    if (el._rafId) cancelAnimationFrame(el._rafId);
    rafId = requestAnimationFrame(step);
  }

  /* ── Observe stats section ── */
  if ("IntersectionObserver" in window && statsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            statEls.forEach((el, i) => {
              setTimeout(() => animateCounter(el), i * 150);
            });
          }
          /* Reset on leave so it re-animates next time */
          if (!entry.isIntersecting) {
            countersStarted = false;
            statEls.forEach((el) => {
              if (el._rafId) cancelAnimationFrame(el._rafId);
              const suffix = el.dataset.suffix || "";
              const prefix = el.dataset.prefix || "";
              el.textContent = prefix + "0" + suffix;
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsSection);
  } else {
    /* Fallback: just show final values */
    statEls.forEach((el) => {
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || "";
      const prefix   = el.dataset.prefix || "";
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    });
  }

})();
