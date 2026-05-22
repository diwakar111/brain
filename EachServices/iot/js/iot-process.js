/* ============================================================
   FILE: js/iot-process.js
   SECTION: How We Work — #iot-process
   PURPOSE: Animates the horizontal progress line and activates
            each step circle sequentially when section enters
            the viewport. Resets when section leaves viewport.
            Pauses animation when off-screen.
   ============================================================ */

(function () {
  "use strict";

  const section = document.getElementById("iot-process");
  if (!section) return;

  const progressLine = section.querySelector(".iot-process__progress-line");
  const steps        = section.querySelectorAll(".iot-process__step");

  let activated = false;

  /* ── Activate all steps with staggered delay ── */
  function activateSteps() {
    if (activated) return;
    activated = true;

    /* Grow the progress line */
    if (progressLine) {
      /* Small delay so element is painted before transition starts */
      setTimeout(() => progressLine.classList.add("iot-line-active"), 100);
    }

    /* Activate each step circle sequentially */
    steps.forEach((step, i) => {
      setTimeout(() => {
        step.classList.add("iot-step-active");
      }, 200 + i * 280); /* 280ms stagger between each step */
    });
  }

  /* ── Reset steps (when section leaves viewport) ── */
  function resetSteps() {
    activated = false;
    if (progressLine) progressLine.classList.remove("iot-line-active");
    steps.forEach(step => step.classList.remove("iot-step-active"));
  }

  /* ── IntersectionObserver: play when visible, reset when not ── */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activateSteps();
        } else {
          resetSteps(); /* reset so it re-plays next time */
        }
      });
    }, { threshold: 0.3 }).observe(section);
  } else {
    activateSteps(); /* fallback */
  }

})();
