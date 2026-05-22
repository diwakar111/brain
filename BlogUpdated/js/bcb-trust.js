/* ============================================================
   bcb-trust.js — TRUST SECTION JAVASCRIPT
   Section ID:  #bcb-trust-section
   Controls:    IntersectionObserver stagger reveal for header
                and each trust card, pause when off-screen
   Edit this file to change: stagger delay between cards,
   observer threshold
   ============================================================ */

(function () {
  'use strict';

  /* --- Guard: exit if trust section not on page --- */
  const trustSection = document.getElementById('bcb-trust-section');
  if (!trustSection) return;

  /* ============================================================
     ELEMENT REFERENCES
  ============================================================ */

  /* Section header */
  const header = trustSection.querySelector('.bcb-trust__header');

  /* Individual trust cards */
  const cards  = trustSection.querySelectorAll('.bcb-trust__card');

  /* ============================================================
     INTERSECTION OBSERVER — HEADER
     Header fades in once when it enters viewport
  ============================================================ */

  if (header) {
    const headerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            header.classList.add('bcb-ts-visible');
            headerObserver.unobserve(header); /* Only reveal once */
          }
        });
      },
      { threshold: 0.2 }
    );

    headerObserver.observe(header);
  }

  /* ============================================================
     INTERSECTION OBSERVER — TRUST CARDS
     Cards reveal with stagger delay (data-delay attribute)
  ============================================================ */

  const cardObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const card  = entry.target;
        const delay = parseInt(card.dataset.delay || '0', 10);

        if (entry.isIntersecting) {
          /* Delay the visible class by card's stagger value */
          setTimeout(function () {
            card.classList.add('bcb-ts-visible');
          }, delay);

          /* Unobserve after reveal — cards only animate in once */
          cardObserver.unobserve(card);
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach(function (card) {
    cardObserver.observe(card);
  });

  /* ============================================================
     ICON GLOW ON HOVER — Icon pulse animation toggle
     CSS :hover handles the visual; JS starts/stops for touch
  ============================================================ */

  cards.forEach(function (card) {
    const icon = card.querySelector('.bcb-trust__card-icon');
    if (!icon) return;

    /* Touch device: toggle glow on tap */
    card.addEventListener('touchstart', function () {
      icon.style.boxShadow = '0 0 24px rgba(0, 180, 216, 0.3)';
    }, { passive: true });

    card.addEventListener('touchend', function () {
      setTimeout(function () {
        icon.style.boxShadow = '';
      }, 400);
    }, { passive: true });
  });

})();
