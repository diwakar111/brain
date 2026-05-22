/* ═══════════════════════════════════════════════════════
   SECTION JS: HERO
   File: js/hero.js
   Handles: animated text cycling in hero (if needed),
            smooth scroll CTA link
   Independent: YES – touches only .bc-hero elements
═══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    var hero = document.getElementById('bc-hero');
    if (!hero) return; /* Guard */
  
    /* ── Smooth scroll for CTA button ── */
    var heroBtn = hero.querySelector('.bc-hero__btn');
    if (heroBtn) {
      heroBtn.addEventListener('click', function (e) {
        var href = heroBtn.getAttribute('href');
        /* Only intercept same-page anchor links */
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }
  
    /* ── Parallax: subtle orb movement on mouse ── */
    var orb1 = hero.querySelector('.bc-hero__orb--1');
    var orb2 = hero.querySelector('.bc-hero__orb--2');
  
    hero.addEventListener('mousemove', function (e) {
      var rect  = hero.getBoundingClientRect();
      var cx    = rect.width  / 2;
      var cy    = rect.height / 2;
      var dx    = (e.clientX - rect.left - cx) / cx;
      var dy    = (e.clientY - rect.top  - cy) / cy;
  
      if (orb1) {
        orb1.style.transform = 'translate(' + (dx * 20) + 'px, ' + (dy * 14) + 'px) scale(1)';
      }
      if (orb2) {
        orb2.style.transform = 'translate(' + (-dx * 14) + 'px, ' + (-dy * 10) + 'px) scale(1)';
      }
    });
  
    /* Reset on mouse leave */
    hero.addEventListener('mouseleave', function () {
      if (orb1) orb1.style.transform = '';
      if (orb2) orb2.style.transform = '';
    });
  
  })();
  