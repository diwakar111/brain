/* ============================================================
   bcb-filter.js — CATEGORY FILTER TABS JAVASCRIPT
   Section ID:  #bcb-filter-section
   Controls:    Tab click switching, sliding indicator bar position,
                Dispatches 'bcbFilterChange' event for bcb-grid.js
   Edit this file to change: active tab logic, indicator animation,
   custom filter categories
   ============================================================ */

(function () {
  'use strict';

  /* --- Guard: exit if filter section not on page --- */
  const filterSection = document.getElementById('bcb-filter-section');
  if (!filterSection) return;

  /* ============================================================
     ELEMENT REFERENCES
  ============================================================ */

  /* Tab buttons container */
  const tabsWrapper = document.getElementById('bcbFilterTabs');

  /* All tab buttons */
  const tabs = filterSection.querySelectorAll('.bcb-filter__tab');

  /* Sliding indicator bar */
  const indicator = document.getElementById('bcbFilterIndicator');

  /* Currently active filter value */
  let activeFilter = 'all';

  /* ============================================================
     INDICATOR POSITION
     Moves the sliding bar to align with the active tab
  ============================================================ */

  /* --- Move indicator to match a given tab element --- */
  function moveIndicator(tabEl) {
    if (!indicator || !tabEl || !tabsWrapper) return;

    /* Get position relative to the tabs wrapper */
    const wrapperLeft = tabsWrapper.getBoundingClientRect().left;
    const tabLeft     = tabEl.getBoundingClientRect().left;
    const tabWidth    = tabEl.offsetWidth;

    indicator.style.left  = (tabLeft - wrapperLeft + tabsWrapper.scrollLeft) + 'px';
    indicator.style.width = tabWidth + 'px';
  }

  /* ============================================================
     TAB CLICK HANDLER
     Updates active state, moves indicator, dispatches filter event
  ============================================================ */

  function activateTab(clickedTab) {
    if (!clickedTab) return;

    const filterValue = clickedTab.dataset.filter;
    if (filterValue === activeFilter) return; /* No change needed */

    activeFilter = filterValue;

    /* --- Update tab active classes and aria-selected --- */
    tabs.forEach(function (tab) {
      const isActive = tab === clickedTab;
      tab.classList.toggle('bcb-filter__tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    /* --- Slide indicator to new active tab --- */
    moveIndicator(clickedTab);

    /* --- Notify bcb-grid.js of the filter change --- */
    document.dispatchEvent(
      new CustomEvent('bcbFilterChange', { detail: { filter: filterValue } })
    );
  }

  /* ============================================================
     EVENT LISTENERS — Tab clicks
  ============================================================ */

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateTab(tab);
    });

    /* Keyboard support — Enter and Space activate tab */
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(tab);
      }
    });
  });

  /* ============================================================
     LISTEN FOR HERO SEARCH EVENT
     When user searches in hero, auto-reset filter to "all"
  ============================================================ */

  document.addEventListener('bcbHeroSearch', function () {
    const allTab = filterSection.querySelector('[data-filter="all"]');
    if (allTab) activateTab(allTab);
  });

  /* ============================================================
     INIT — Position indicator on the default active tab
  ============================================================ */

  /* --- Run after fonts/layout is ready --- */
  function initIndicator() {
    const defaultTab = filterSection.querySelector('.bcb-filter__tab--active');
    if (defaultTab) {
      /* No transition on initial placement */
      if (indicator) indicator.style.transition = 'none';
      moveIndicator(defaultTab);
      /* Re-enable transition after first placement */
      setTimeout(function () {
        if (indicator) indicator.style.transition = '';
      }, 50);
    }
  }

  /* Wait for layout to settle before measuring tab positions */
  if (document.readyState === 'complete') {
    initIndicator();
  } else {
    window.addEventListener('load', initIndicator);
  }

  /* Re-measure on resize (tab widths may change) */
  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const activeTab = filterSection.querySelector('.bcb-filter__tab--active');
      moveIndicator(activeTab);
    }, 150);
  });

})();
