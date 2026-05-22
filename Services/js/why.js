/* ═══════════════════════════════════════════════════════
   SECTION JS: WHY TRUST US
   File: js/why.js
   Handles: staggered card reveal on scroll into viewport
            Each card animates independently with delay
            Animation pauses until section is visible
   Independent: YES – touches only .bc-why elements
═══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    var whySection = document.getElementById('bc-why');
    if (!whySection) return; /* Guard */
  
    /* ── Header reveal ── */
    var header = whySection.querySelector('.bc-why__header');
  
    var headerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('bc-in-view');
          headerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
  
    if (header) headerObserver.observe(header);
  
    /* ── Cards reveal (staggered by data-delay) ── */
    var cards = whySection.querySelectorAll('.bc-why__card');
  
    var cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay'), 10) || 0;
  
          setTimeout(function () {
            /* Apply CSS transition timing based on delay */
            entry.target.style.transitionDelay = delay + 'ms';
            entry.target.classList.add('bc-in-view');
          }, delay);
  
          cardObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });
  
    cards.forEach(function (card) {
      cardObserver.observe(card);
    });
  
  })();
  