/* ============================================================
   FILE: js/contact-form.js
   SECTION: Contact Form — Validation, Submit Animation, UX
   PURPOSE: Handles field validation, animated submit state,
            success/error messages, and floating label behaviour.
            Works with new duotone icon field structure:
            .cf-field > .cf-field-icon + .cf-field-inner > input/label
   ============================================================ */

   (function () {
    "use strict";
  
    const form = document.getElementById("bc-contact-form");
    if (!form) return;
  
    const submitBtn  = form.querySelector(".cf-submit-btn");
    const btnText    = form.querySelector(".cf-btn-text");
    const btnSpinner = form.querySelector(".cf-btn-spinner");
    const successMsg = document.getElementById("cf-success-msg");
    const errorMsg   = document.getElementById("cf-error-msg");
  
    /* ── All interactive fields (inside .cf-field-inner) ── */
    const floatingFields = form.querySelectorAll(
      ".cf-field-inner input, .cf-field-inner textarea, .cf-field-inner select"
    );
  
    /* ── Floating label: add .filled on the parent .cf-field ── */
    floatingFields.forEach((field) => {
      checkFilled(field);
      field.addEventListener("input",  () => checkFilled(field));
      field.addEventListener("change", () => checkFilled(field));
      field.addEventListener("blur",   () => { checkFilled(field); validateField(field); });
      field.addEventListener("focus",  () => {
        field.closest(".cf-field").classList.remove("cf-error");
      });
    });
  
    function checkFilled(field) {
      const wrap = field.closest(".cf-field");
      if (!wrap) return;
      wrap.classList.toggle("filled", !!(field.value && field.value !== ""));
    }
  
    /* ── Per-field validation ── */
    function validateField(field) {
      const wrap  = field.closest(".cf-field");
      if (!wrap) return true;
      const errEl = wrap.querySelector(".cf-field-error");
      let valid = true, message = "";
  
      if (field.required && !field.value.trim()) {
        valid = false; message = "This field is required.";
      } else if (field.type === "email" && field.value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          valid = false; message = "Please enter a valid email address.";
        }
      } else if (field.name === "phone" && field.value) {
        if (!/^[+\d\s\-()]{7,20}$/.test(field.value)) {
          valid = false; message = "Please enter a valid phone number.";
        }
      }
  
      wrap.classList.toggle("cf-error", !valid);
      if (errEl) errEl.textContent = valid ? "" : message;
      return valid;
    }
  
    /* ── Full-form validation ── */
    function validateForm() {
      let allValid = true;
      floatingFields.forEach((field) => { if (!validateField(field)) allValid = false; });
      return allValid;
    }
  
    /* ── Submit handler ── */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessages();
      if (!validateForm()) {
        form.classList.add("cf-shake");
        setTimeout(() => form.classList.remove("cf-shake"), 600);
        return;
      }
      setLoading(true);
      try {
        await fakeSubmit(); /* Replace with real API call */
        setLoading(false);
        showSuccess();
        form.reset();
        floatingFields.forEach((f) => checkFilled(f));
      } catch {
        setLoading(false);
        showError();
      }
    });
  
    /* ── Fake submit — replace with real fetch() ── */
    function fakeSubmit() {
      return new Promise((resolve) => setTimeout(resolve, 1800));
    }
  
    function setLoading(state) {
      submitBtn.disabled    = state;
      btnText.style.opacity = state ? "0" : "1";
      btnSpinner.style.opacity = state ? "1" : "0";
    }
  
    function showSuccess() {
      if (successMsg) { successMsg.classList.add("visible"); setTimeout(() => successMsg.classList.remove("visible"), 5000); }
    }
    function showError() {
      if (errorMsg) { errorMsg.classList.add("visible"); setTimeout(() => errorMsg.classList.remove("visible"), 5000); }
    }
    function hideMessages() {
      if (successMsg) successMsg.classList.remove("visible");
      if (errorMsg)   errorMsg.classList.remove("visible");
    }
  
    /* ── Character counter for message textarea ── */
    const msgField = form.querySelector("textarea[name='message']");
    const charCount = form.querySelector(".cf-char-count");
    if (msgField && charCount) {
      msgField.addEventListener("input", () => {
        const len = msgField.value.length;
        const max = msgField.getAttribute("maxlength") || 1000;
        charCount.textContent = `${len} / ${max}`;
        charCount.classList.toggle("cf-char-warn", len > max * 0.9);
      });
    }
  
  })();

  // //////////////////////////////////////////////////////////////

  /* ============================================================
   FILE: js/form-floating-icons.js
   SECTION: Contact Form — Left Card Floating Tech Icons
   PURPOSE: Animates floating IoT / tech icons inside the left
            info card. Uses CSS animation classes toggled by an
            IntersectionObserver so animation pauses when the
            section is off-screen and resumes when visible.
   ============================================================ */

(function () {
  "use strict";

  /* --- Target section and icon container --- */
  const section   = document.getElementById("bc-contact-form-section");
  const floatWrap = document.getElementById("cf-float-icons");
  if (!section || !floatWrap) return;

  /* --- Icons definition ---
       Each entry: { icon: SVG path string, label, color, bgColor }
       These represent Brainchild's 5 core tech domains             */
  const ICONS = [
    {
      /* IoT — wifi signal */
      label: "IoT",
      color: "#0A6EBD",
      bg: "rgba(10,110,189,0.10)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0114.08 0"/>
              <path d="M1.42 9a16 16 0 0121.16 0"/>
              <path d="M8.53 16.11a6 6 0 016.95 0"/>
              <circle cx="12" cy="20" r="1" fill="currentColor"/>
            </svg>`,
    },
    {
      /* Embedded — cpu chip */
      label: "Embedded",
      color: "#00858A",
      bg: "rgba(0,133,138,0.10)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <rect x="9" y="9" width="6" height="6"/>
              <line x1="9"  y1="1"  x2="9"  y2="4"/>
              <line x1="15" y1="1"  x2="15" y2="4"/>
              <line x1="9"  y1="20" x2="9"  y2="23"/>
              <line x1="15" y1="20" x2="15" y2="23"/>
              <line x1="20" y1="9"  x2="23" y2="9"/>
              <line x1="20" y1="15" x2="23" y2="15"/>
              <line x1="1"  y1="9"  x2="4"  y2="9"/>
              <line x1="1"  y1="15" x2="4"  y2="15"/>
            </svg>`,
    },
    {
      /* Mobile App — smartphone */
      label: "Mobile",
      color: "#5B4FCF",
      bg: "rgba(91,79,207,0.10)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>`,
    },
    {
      /* Cloud Services — cloud */
      label: "Cloud",
      color: "#0A6EBD",
      bg: "rgba(10,110,189,0.10)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>`,
    },
    {
      /* Box Building — package */
      label: "Box Build",
      color: "#D97706",
      bg: "rgba(217,119,6,0.10)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>`,
    },
    {
      /* Circuit / connectivity */
      label: "Connect",
      color: "#00858A",
      bg: "rgba(0,133,138,0.10)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                       M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>`,
    },
  ];

  /* --- Positions for each floating icon (% of container) ---
       Manually placed to look balanced and not overlap text     */
  const POSITIONS = [
    { top: "6%",  left: "8%",  delay: "0s",    dur: "4.2s" },
    { top: "18%",  right: "9%", delay: "0.6s",  dur: "5.1s" },
    { top: "44%",  left: "5%",  delay: "1.1s",  dur: "4.7s" },
    { top: "42%",  right: "6%", delay: "1.8s",  dur: "5.5s" },
    { top: "72%",  left: "10%", delay: "0.3s",  dur: "4.9s" },
    { top: "76%",  right: "8%", delay: "1.4s",  dur: "4.3s" },
  ];

  /* --- Build icon elements and inject into wrapper --- */
  ICONS.forEach((icon, i) => {
    const pos = POSITIONS[i];

    const chip = document.createElement("div");
    chip.className = "cfi-chip";
    chip.setAttribute("aria-hidden", "true");

    /* Position styles */
    chip.style.cssText = `
      top:   ${pos.top   || "auto"};
      left:  ${pos.left  || "auto"};
      right: ${pos.right || "auto"};
      bottom:${pos.bottom|| "auto"};
      --cfi-dur:   ${pos.dur};
      --cfi-delay: ${pos.delay};
      --cfi-color: ${icon.color};
      --cfi-bg:    ${icon.bg};
    `;

    chip.innerHTML = `
      <span class="cfi-icon" style="color:${icon.color};">${icon.svg}</span>
      <span class="cfi-label">${icon.label}</span>
    `;

    floatWrap.appendChild(chip);
  });

  /* --- IntersectionObserver: pause off-screen, resume on-screen ---
       Adds/removes .cfi-paused class which sets animation-play-state */
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          floatWrap.querySelectorAll(".cfi-chip").forEach((chip) => {
            if (entry.isIntersecting) {
              chip.classList.remove("cfi-paused");
            } else {
              chip.classList.add("cfi-paused");
            }
          });
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(section);
  }

})();