/* ═══════════════════════════════════════════════════════
   SECTION JS: CTA BANNER
   File: js/cta-banner.js
   Handles: reveal animation on scroll into viewport
   Independent: YES – touches only .bc-cta elements
═══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    var ctaSection = document.getElementById('bc-cta');
    if (!ctaSection) return; /* Guard */
  
    var inner = ctaSection.querySelector('.bc-cta__inner');
  
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (inner) inner.classList.add('bc-in-view');
          observer.unobserve(ctaSection);
        }
      });
    }, { threshold: 0.25 });
  
    observer.observe(ctaSection);
  
  })();
  