/* ============================================================
   FILE: js/iot-reveal.js
   SECTION: Global scroll-reveal for ALL sections on this page
   PURPOSE: Observes every [data-iot-reveal] element and adds
            .iot-revealed when it enters the viewport.
            Runs once per element — no repeated triggers.
   ============================================================ */

(function () {
  "use strict";

  /* Select all reveal targets within the iot-page wrapper */
  const targets = document.querySelectorAll(".iot-page [data-iot-reveal]");
  if (!targets.length) return;

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.iotDelay || 0, 10);
        /* Apply optional stagger delay */
        setTimeout(() => el.classList.add("iot-revealed"), delay);
        obs.unobserve(el); /* fire once only */
      });
    }, { threshold: 0.14 });

    targets.forEach(el => obs.observe(el));
  } else {
    /* Fallback: reveal immediately */
    targets.forEach(el => el.classList.add("iot-revealed"));
  }

})();
