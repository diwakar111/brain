/* ============================================================
   FILE: js/iot-techstack.js
   SECTION: Tech Stack — #iot-techstack
   PURPOSE: Assigns random float animation delays to each chip
            so they bob at different speeds. Pauses all chip
            animations when section is off-screen via
            IntersectionObserver, resumes when visible.
   ============================================================ */

(function () {
  "use strict";

  const section = document.getElementById("iot-techstack");
  if (!section) return;

  const chips = section.querySelectorAll(".iot-tech__chip");

  /* ── Assign unique float timing to every chip ── */
  chips.forEach((chip, i) => {
    /* Duration between 3.5s and 6s */
    const dur   = (3.5 + Math.random() * 2.5).toFixed(2) + "s";
    /* Delay staggered + slight randomness */
    const delay = (i * 0.18 + Math.random() * 0.5).toFixed(2) + "s";
    chip.style.setProperty("--iot-chip-dur",   dur);
    chip.style.setProperty("--iot-chip-delay", delay);
  });

  /* ── IntersectionObserver: pause off-screen, resume on-screen ── */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        chips.forEach(chip => {
          if (entry.isIntersecting) {
            chip.classList.remove("iot-chip-paused");
          } else {
            chip.classList.add("iot-chip-paused");
          }
        });
      });
    }, { threshold: 0.1 }).observe(section);
  }

})();
