/* ============================================================
   FILE: js/map-section.js
   SECTION: Office Map — Lazy Load + Future Offices Expansion UI
   PURPOSE: Loads the Google Maps iframe only when section scrolls
            into view (saves bandwidth). Handles the "future office"
            placeholder cards with a coming-soon animation.
            Pauses heavy work when section is not visible.
   ============================================================ */

(function () {
  "use strict";

  /* ── Lazy-load the map iframe ── */
  const mapWrapper = document.getElementById("bc-map-wrapper");
  const mapIframe  = document.getElementById("bc-map-iframe");

  if (mapWrapper && mapIframe) {
    const mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            /* Move data-src to src to trigger load */
            const src = mapIframe.dataset.src;
            if (src && !mapIframe.src) {
              mapIframe.src = src;
              mapWrapper.classList.add("map-loaded");
            }
            mapObserver.unobserve(mapWrapper);
          }
        });
      },
      { threshold: 0.1 }
    );
    mapObserver.observe(mapWrapper);
  }

  /* ── Future office card: animated scanning line ── */
  const futureCards = document.querySelectorAll(".office-future-card");
  let scanAnimFrames = [];
  let futureCardsVisible = false;

  /* Start/stop scanning animation based on section visibility */
  const officeSection = document.getElementById("bc-offices-section");
  if (officeSection && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          futureCardsVisible = entry.isIntersecting;
          if (futureCardsVisible) {
            startScanAnimations();
          } else {
            stopScanAnimations();
          }
        });
      },
      { threshold: 0.1 }
    );
    sectionObserver.observe(officeSection);
  }

  function startScanAnimations() {
    futureCards.forEach((card) => {
      card.classList.add("scanning");
    });
  }

  function stopScanAnimations() {
    futureCards.forEach((card) => {
      card.classList.remove("scanning");
    });
  }

  /* ── Copy address to clipboard ── */
  const copyBtn = document.getElementById("bc-copy-address");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const address = copyBtn.dataset.address || "";
      navigator.clipboard.writeText(address).then(() => {
        copyBtn.classList.add("copied");
        copyBtn.querySelector(".copy-label").textContent = "Copied!";
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.querySelector(".copy-label").textContent = "Copy Address";
        }, 2000);
      });
    });
  }

})();
