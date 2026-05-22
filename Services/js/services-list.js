/* ═══════════════════════════════════════════════════════
   SECTION JS: SERVICES LIST
   File: js/services-list.js
   Handles:
     1. Scroll-triggered reveal animation per service card
        (animation only plays when card enters viewport;
         paused / reset when out of view until re-entered)
     2. Click on service card → redirect to service page
     3. Icon hover micro-animation (CSS handles most, JS
        adds class for chained effects)
   Independent: YES – touches only .bc-svc elements
═══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    var svcSection = document.getElementById('bc-services');
    if (!svcSection) return; /* Guard */
  
    /* ── 1. Header reveal ── */
    var header = svcSection.querySelector('.bc-svc__header');
  
    var headerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('bc-in-view');
          headerObserver.unobserve(entry.target); /* Only animate once */
        }
      });
    }, { threshold: 0.2 });
  
    if (header) headerObserver.observe(header);
  
    /* ── 2. Service items reveal (staggered) ── */
    var items = svcSection.querySelectorAll('.bc-svc__item');
  
    var itemObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Small delay so it feels intentional on scroll */
          setTimeout(function () {
            entry.target.classList.add('bc-in-view');
          }, 80);
          itemObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
  
    items.forEach(function (item) {
      itemObserver.observe(item);
    });
  
    /* ── 3. Click → redirect to service page ── */
    items.forEach(function (item) {
      var href = item.getAttribute('data-href');
      if (!href) return;
  
      item.addEventListener('click', function (e) {
        /* Don't double-fire if clicking the <a> link directly */
        if (e.target.closest('.bc-svc__link')) return;
        window.location.href = href;
      });
  
      /* Pointer cursor so users know it's clickable */
      item.style.cursor = 'pointer';
    });
  
    /* ── 4. Keyboard accessibility for card click ── */
    items.forEach(function (item) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
  
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var href = item.getAttribute('data-href');
          if (href) window.location.href = href;
        }
      });
    });
  
  })();
  