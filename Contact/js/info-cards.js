/* ============================================================
   FILE: js/info-cards.js
   SECTION: Info Cards + General Scroll Reveal Animation
   PURPOSE: Animates contact info cards and any element with
            [data-reveal] attribute into view when scrolled to.
            Pauses/resumes per-section using IntersectionObserver.
   ============================================================ */

(function () {
  "use strict";

  /* ── Scroll-reveal: add .bc-revealed when element enters viewport ──
     Usage: add  data-reveal  and optionally  data-delay="200"  (ms)   */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || 0, 10);
            setTimeout(() => el.classList.add("bc-revealed"), delay);
            revealObserver.unobserve(el); // only animate once
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    /* fallback for old browsers */
    revealEls.forEach((el) => el.classList.add("bc-revealed"));
  }

  /* ── Info cards hover tilt effect ──
     Gives a subtle 3-D tilt on mouse move inside each card          */
  const infoCards = document.querySelectorAll(".ci-card");
  infoCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
      const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
      card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  /* ── FAQ / Accordion toggle (Why Choose Us section) ── */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-question");
    if (!trigger) return;
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("faq-open");
      /* close all */
      faqItems.forEach((i) => i.classList.remove("faq-open"));
      /* open clicked unless it was already open */
      if (!isOpen) item.classList.add("faq-open");
    });
  });

  /* ── Services tag hover pulse (in form select area) ── */
  const serviceTags = document.querySelectorAll(".svc-tag");
  serviceTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const select = document.getElementById("service-select");
      if (select) {
        select.value = tag.dataset.value || "";
        select.dispatchEvent(new Event("change"));
        select.closest(".cf-field").classList.add("filled");
        /* scroll to form */
        const formSection = document.getElementById("bc-contact-form-section");
        if (formSection) formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

})();
