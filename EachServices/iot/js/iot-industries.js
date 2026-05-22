/* ============================================================
   FILE: js/iot-industries.js
   SECTION: Industries We Serve — #iot-industries
   PURPOSE: Tab switching logic. Clicking a tab activates its
            matching panel with a fade-in animation.
            No dependency on any other section JS.
   ============================================================ */

(function () {
  "use strict";

  const section = document.getElementById("iot-industries");
  if (!section) return;

  /* All tab buttons and panels */
  const tabs   = section.querySelectorAll(".iot-ind__tab");
  const panels = section.querySelectorAll(".iot-ind__panel");

  /* ── Switch to a tab by index ── */
  function activateTab(index) {
    /* Deactivate all */
    tabs.forEach(t   => t.classList.remove("iot-tab-active"));
    panels.forEach(p => p.classList.remove("iot-panel-active"));

    /* Activate selected */
    if (tabs[index])   tabs[index].classList.add("iot-tab-active");
    if (panels[index]) panels[index].classList.add("iot-panel-active");
  }

  /* ── Bind click events ── */
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(i));
  });

  /* ── Activate first tab by default ── */
  activateTab(0);

})();
