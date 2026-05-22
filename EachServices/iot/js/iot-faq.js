/* ============================================================
   FILE: js/iot-faq.js
   SECTION: FAQ Accordion — #iot-faq
   PURPOSE: Opens/closes FAQ items. Only one item open at a time.
            Scoped entirely to #iot-faq. No global side effects.
   ============================================================ */

(function () {
  "use strict";

  const section = document.getElementById("iot-faq");
  if (!section) return;

  const items = section.querySelectorAll(".iot-faq__item");

  /* ── Toggle a specific FAQ item ── */
  function toggle(item) {
    const isOpen = item.classList.contains("iot-faq-open");

    /* Close all items first */
    items.forEach(i => i.classList.remove("iot-faq-open"));

    /* Open clicked item unless it was already open */
    if (!isOpen) item.classList.add("iot-faq-open");
  }

  /* ── Bind click to each question button ── */
  items.forEach(item => {
    const btn = item.querySelector(".iot-faq__q");
    if (btn) btn.addEventListener("click", () => toggle(item));
  });

  /* ── Open first item by default ── */
  if (items[0]) items[0].classList.add("iot-faq-open");

})();
