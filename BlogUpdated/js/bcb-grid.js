/* ============================================================
   bcb-grid.js — Blog Grid Animations + Filter + Load More
   Fully self-contained. No globals polluted.
   ============================================================ */

   (function () {
    'use strict';
  
    /* ── 1. SCROLL-TRIGGERED CARD REVEAL ─────────────────────── */
    const bcgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const delay = parseInt(card.dataset.delay, 10) || 0;
            setTimeout(() => {
              card.classList.add('bcb--visible');
            }, delay);
            bcgObserver.unobserve(card);
          }
        });
      },
      { threshold: 0.12 }
    );
  
    function bcgObserveCards() {
      const cards = document.querySelectorAll('.bcb-grid__card:not(.bcb--visible)');
      cards.forEach((card) => bcgObserver.observe(card));
    }
  
    /* ── 2. 3D TILT ON HOVER ─────────────────────────────────── */
    function bcgInitTilt() {
      document.querySelectorAll('.bcb-grid__card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) / (rect.width / 2);
          const dy = (e.clientY - cy) / (rect.height / 2);
          card.style.transform = `translateY(-6px) scale(1.012) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }
  
    /* ── 3. CATEGORY FILTER ──────────────────────────────────── */
    function bcgInitFilter() {
      const tabs = document.querySelectorAll('.bcb-filter__tab');
      const wrapper = document.getElementById('bcbGridWrapper');
      if (!wrapper) return;
  
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          /* Update active tab */
          tabs.forEach((t) => {
            t.classList.remove('bcb-filter__tab--active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('bcb-filter__tab--active');
          tab.setAttribute('aria-selected', 'true');
  
          /* Move indicator */
          bcgMoveIndicator(tab);
  
          const filter = tab.dataset.filter;
          const cards = wrapper.querySelectorAll('.bcb-grid__card');
  
          cards.forEach((card) => {
            const match = filter === 'all' || card.dataset.category === filter;
            if (match) {
              card.style.display = '';
              /* Re-trigger animation */
              card.classList.remove('bcb--visible');
              void card.offsetWidth; /* reflow */
              setTimeout(() => card.classList.add('bcb--visible'), parseInt(card.dataset.delay, 10) || 0);
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
  
      /* Init indicator on load */
      const activeTab = document.querySelector('.bcb-filter__tab--active');
      if (activeTab) bcgMoveIndicator(activeTab);
    }
  
    function bcgMoveIndicator(tab) {
      const indicator = document.getElementById('bcbFilterIndicator');
      if (!indicator) return;
      indicator.style.width  = tab.offsetWidth  + 'px';
      indicator.style.left   = tab.offsetLeft   + 'px';
    }
  
    /* ── 4. LOAD MORE (stub — reveals hidden cards or triggers fetch) ── */
    function bcgInitLoadMore() {
      const btn = document.getElementById('bcbLoadMore');
      if (!btn) return;
  
      btn.addEventListener('click', () => {
        /* Visual feedback */
        btn.textContent = 'Loading…';
        btn.disabled = true;
  
        setTimeout(() => {
          btn.innerHTML = `
            Load More Articles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>`;
          btn.disabled = false;
          /* In production: fetch and append new cards here */
        }, 1200);
      });
    }
  
    /* ── 5. RE-OBSERVE ON WINDOW RESIZE (debounced) ─────────── */
    let bcgResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(bcgResizeTimer);
      bcgResizeTimer = setTimeout(() => {
        const activeTab = document.querySelector('.bcb-filter__tab--active');
        if (activeTab) bcgMoveIndicator(activeTab);
      }, 100);
    });
  
    /* ── INIT ── */
    function bcgInit() {
      bcgObserveCards();
      bcgInitTilt();
      bcgInitFilter();
      bcgInitLoadMore();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bcgInit);
    } else {
      bcgInit();
    }
  
  })();