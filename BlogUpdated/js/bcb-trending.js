/* ============================================================
   bcb-trending.js — TRENDING TOPICS MARQUEE JAVASCRIPT
   Section ID:  #bcb-trending-section
   Controls:    Duplicate marquee items for seamless loop,
                IntersectionObserver to start/pause CSS animation,
                Pause marquee on hover (better UX)
   Edit this file to change: marquee speed (see bcb-trending.css
   --bcb-tr-speed variable), item count behavior
   ============================================================ */

(function () {
  'use strict';

  /* --- Guard: exit if trending section not on page --- */
  const trendingSection = document.getElementById('bcb-trending-section');
  if (!trendingSection) return;

  /* ============================================================
     ELEMENT REFERENCES
  ============================================================ */

  /* Scrolling track element */
  const track = document.getElementById('bcbTrendingTrack');
  if (!track) return;

  /* ============================================================
     DUPLICATE ITEMS FOR SEAMLESS LOOP
     CSS animation moves track by -50%, so we need exactly
     double the items. JS clones the original set.
  ============================================================ */

  function duplicateTrackItems() {
    /* Get all original items */
    const originalItems = track.querySelectorAll('.bcb-trending__item');
    if (originalItems.length === 0) return;

    /* Clone each item and append to track */
    originalItems.forEach(function (item) {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true'); /* Hide duplicates from screen readers */
      track.appendChild(clone);
    });
  }

  /* ============================================================
     ANIMATION PLAY / PAUSE
     IntersectionObserver controls CSS animation state
  ============================================================ */

  let isPaused = false; /* Track hover-pause state */

  /* --- Start marquee animation --- */
  function startMarquee() {
    if (isPaused) return; /* Don't start if hover-paused */
    track.style.animationPlayState = 'running';
  }

  /* --- Stop marquee animation --- */
  function pauseMarquee() {
    track.style.animationPlayState = 'paused';
  }

  /* ============================================================
     INTERSECTION OBSERVER
     Starts marquee when section is visible;
     pauses when off-screen (saves CPU/GPU resources)
  ============================================================ */

  const trendingObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startMarquee();
        } else {
          pauseMarquee();
        }
      });
    },
    { threshold: 0.05 } /* Start as soon as even a sliver is visible */
  );

  trendingObserver.observe(trendingSection);

  /* ============================================================
     HOVER PAUSE / RESUME
     Pauses marquee while user hovers over the track (better UX —
     gives time to read items)
  ============================================================ */

  track.addEventListener('mouseenter', function () {
    isPaused = true;
    pauseMarquee();
  });

  track.addEventListener('mouseleave', function () {
    isPaused = false;
    /* Only resume if section is still visible */
    const rect = trendingSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      startMarquee();
    }
  });

  /* ============================================================
     INIT — Duplicate items then start if already in view
  ============================================================ */

  duplicateTrackItems();

  /* Start immediately if section is visible on page load */
  const initialRect = trendingSection.getBoundingClientRect();
  if (initialRect.top < window.innerHeight && initialRect.bottom > 0) {
    startMarquee();
  }

})();
