/* ============================================================
   bcb-featured.js — FEATURED POST SECTION JAVASCRIPT
   Section ID:  #bcb-featured-section
   Controls:    IntersectionObserver fade-in for label and card,
                floating icon animation start/stop,
                badge pulse animation start/stop
   Edit this file to change: fade timing, animation thresholds
   ============================================================ */

(function () {
  'use strict';

  /* --- Guard: exit if section not on page --- */
  const featSection = document.getElementById('bcb-featured-section');
  if (!featSection) return;

  /* ============================================================
     ELEMENT REFERENCES
  ============================================================ */

  /* Section label (divider row) */
  const label = featSection.querySelector('.bcb-featured__label');

  /* Main featured card */
  const card  = document.getElementById('bcbFeaturedCard');

  /* Icon that floats inside the thumbnail */
  const icon  = featSection.querySelector('.bcb-featured__thumb-icon');

  /* Pulsing result badge */
  const badge = featSection.querySelector('.bcb-featured__badge');

  /* ============================================================
     START / STOP ANIMATIONS
     Called by IntersectionObserver — pause when off-screen
  ============================================================ */

  /* --- Start floating icon and badge pulse --- */
  function startFeaturedAnimations() {
    if (icon)  icon.style.animationPlayState  = 'running';
    if (badge) badge.style.animationPlayState = 'running';
  }

  /* --- Pause floating icon and badge pulse --- */
  function pauseFeaturedAnimations() {
    if (icon)  icon.style.animationPlayState  = 'paused';
    if (badge) badge.style.animationPlayState = 'paused';
  }

  /* ============================================================
     INTERSECTION OBSERVER — LABEL
     Fades in the section label when it enters viewport
  ============================================================ */

  const labelObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Add visible class to trigger CSS transition */
          label.classList.add('bcb-featured--visible');
          /* Unobserve — label only animates once */
          labelObserver.unobserve(label);
        }
      });
    },
    { threshold: 0.2 }
  );

  if (label) labelObserver.observe(label);

  /* ============================================================
     INTERSECTION OBSERVER — CARD
     Fades in the card and starts internal animations
  ============================================================ */

  const cardObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Add visible class to trigger CSS transition on card */
          card.classList.add('bcb-featured--visible');
          /* Start thumbnail icon float + badge pulse */
          startFeaturedAnimations();
        } else {
          /* Pause animations when card scrolled off screen */
          pauseFeaturedAnimations();
        }
      });
    },
    { threshold: 0.15 }
  );

  if (card) cardObserver.observe(card);

  /* ============================================================
     METRIC VALUES — highlight on hover (visual touch)
  ============================================================ */

  const metrics = featSection.querySelectorAll('.bcb-featured__metric');

  metrics.forEach(function (metric) {
    metric.addEventListener('mouseenter', function () {
      metric.style.transform = 'scale(1.06)';
      metric.style.transition = 'transform 0.2s ease';
    });
    metric.addEventListener('mouseleave', function () {
      metric.style.transform = 'scale(1)';
    });
  });

})();
