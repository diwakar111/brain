/* ============================================================
   bcb-cta.js — CTA SECTION JAVASCRIPT
   Section ID:  #bcb-cta-section
   Controls:    IntersectionObserver fade-in for container,
                Orb animation start/pause via IntersectionObserver,
                Button click tracking (dispatches custom event)
   Edit this file to change: animation thresholds,
   button click behavior (add your real link/modal logic here)
   ============================================================ */

(function () {
  'use strict';

  /* --- Guard: exit if CTA section not on page --- */
  const ctaSection = document.getElementById('bcb-cta-section');
  if (!ctaSection) return;

  /* ============================================================
     ELEMENT REFERENCES
  ============================================================ */

  /* Main content container */
  const ctaContainer = ctaSection.querySelector('.bcb-cta__container');

  /* Background orbs */
  const ctaOrbs = ctaSection.querySelectorAll('.bcb-cta__orb');

  /* Buttons */
  const primaryBtn = ctaSection.querySelector('.bcb-cta__btn--primary');
  const outlineBtn = ctaSection.querySelector('.bcb-cta__btn--outline');

  /* ============================================================
     ORB ANIMATION CONTROL
     Orbs are CSS-animated; play/pause via JS IntersectionObserver
  ============================================================ */

  /* --- Start orb animations --- */
  function startCtaAnimations() {
    ctaOrbs.forEach(function (orb) {
      orb.style.animationPlayState = 'running';
    });
  }

  /* --- Pause orb animations --- */
  function pauseCtaAnimations() {
    ctaOrbs.forEach(function (orb) {
      orb.style.animationPlayState = 'paused';
    });
  }

  /* ============================================================
     INTERSECTION OBSERVER — CONTENT FADE-IN + ORB CONTROL
  ============================================================ */

  const ctaObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Reveal content container */
          if (ctaContainer) ctaContainer.classList.add('bcb-cta--visible');
          /* Start orb animations */
          startCtaAnimations();
        } else {
          /* Pause orbs when section leaves viewport */
          pauseCtaAnimations();
        }
      });
    },
    { threshold: 0.2 }
  );

  ctaObserver.observe(ctaSection);

  /* ============================================================
     BUTTON INTERACTIONS
     Dispatches events so other scripts / analytics can listen.
     Replace the href on the buttons in HTML with your real links.
  ============================================================ */

  /* --- Primary "Talk to Us" button --- */
  if (primaryBtn) {
    primaryBtn.addEventListener('click', function (e) {
      /* Dispatch event for analytics or modal triggers */
      document.dispatchEvent(new CustomEvent('bcbCtaPrimary'));

      /* Example: Scroll to contact section instead of navigating */
      /* Uncomment and adjust if you have a contact section */
      /*
      e.preventDefault();
      const contactSection = document.getElementById('bc-contact-section');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      */
    });
  }

  /* --- Outline "View Our Services" button --- */
  if (outlineBtn) {
    outlineBtn.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('bcbCtaOutline'));
    });
  }

  /* ============================================================
     BUTTON RIPPLE EFFECT ON CLICK
     Visual feedback on button press
  ============================================================ */

  function addRipple(btn, e) {
    const ripple  = document.createElement('span');
    const rect    = btn.getBoundingClientRect();
    const size    = Math.max(rect.width, rect.height);
    const x       = e.clientX - rect.left - size / 2;
    const y       = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      transform: scale(0);
      animation: bcbCtaRipple 0.5s ease-out forwards;
      pointer-events: none;
    `;

    /* Ensure button has relative positioning for ripple */
    const currentPosition = getComputedStyle(btn).position;
    if (currentPosition === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  }

  /* Inject ripple keyframe once */
  if (!document.getElementById('bcbCtaRippleStyle')) {
    const style = document.createElement('style');
    style.id = 'bcbCtaRippleStyle';
    style.textContent = `
      @keyframes bcbCtaRipple {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  [primaryBtn, outlineBtn].forEach(function (btn) {
    if (!btn) return;
    btn.addEventListener('click', function (e) { addRipple(btn, e); });
  });

})();
