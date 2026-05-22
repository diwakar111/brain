/* ============================================================
   bcb-sidebar.js — Sidebar Animations + Counter + Newsletter
   Fully self-contained. No globals polluted.
   ============================================================ */

   (function () {
    'use strict';
  
    /* ── 1. SCROLL-IN ANIMATION FOR WIDGETS ─────────────────── */
    const bcsbObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bcb--sb-visible');
            bcsbObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
  
    function bcsbObserveWidgets() {
      document.querySelectorAll('.bcb-sidebar__widget').forEach((w) => {
        bcsbObserver.observe(w);
      });
    }
  
    /* ── 2. ANIMATED COUNTER FOR STATS ──────────────────────── */
    function bcsbAnimateCounters() {
      const statsWidget = document.getElementById('bcbStatsWidget');
      if (!statsWidget) return;
  
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.querySelectorAll('.bcb-sidebar__stat-val[data-target]').forEach((el) => {
                const target = parseInt(el.dataset.target, 10);
                const duration = 1400;
                const start = performance.now();
  
                function tick(now) {
                  const elapsed = now - start;
                  const progress = Math.min(elapsed / duration, 1);
                  /* Ease out cubic */
                  const eased = 1 - Math.pow(1 - progress, 3);
                  el.textContent = Math.floor(eased * target);
                  if (progress < 1) requestAnimationFrame(tick);
                  else el.textContent = target;
                }
                requestAnimationFrame(tick);
              });
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
  
      counterObserver.observe(statsWidget);
    }
  
    /* ── 3. NEWSLETTER SUBSCRIBE ─────────────────────────────── */
    function bcsbInitNewsletter() {
      const btn = document.getElementById('bcbNewsletterBtn');
      const input = document.getElementById('bcbNewsletterEmail');
      const msg = document.getElementById('bcbNewsletterMsg');
      if (!btn || !input || !msg) return;
  
      btn.addEventListener('click', () => {
        const email = input.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msg.style.color = '#e05252';
          msg.textContent = 'Please enter a valid email.';
          input.focus();
          return;
        }
        btn.textContent = '✓ Subscribed!';
        btn.style.background = 'linear-gradient(135deg, #06d6a0, #048c68)';
        btn.disabled = true;
        input.value = '';
        msg.style.color = '#3a8f6f';
        msg.textContent = 'You\'re in! Welcome to the BrainChild community.';
      });
  
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
      });
    }
  
    /* ── INIT ── */
    function bcsbInit() {
      bcsbObserveWidgets();
      bcsbAnimateCounters();
      bcsbInitNewsletter();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bcsbInit);
    } else {
      bcsbInit();
    }
  
  })();