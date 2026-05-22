    /* ── Custom cursor ── */
    const cDot  = document.getElementById('cDot');
    const cRing = document.getElementById('cRing');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function tickCursor() {
      cDot.style.left = mx + 'px';
      cDot.style.top  = my + 'px';
      rx += (mx - rx) * 0.5;
      ry += (my - ry) * 0.5;
      cRing.style.left = rx + 'px';
      cRing.style.top  = ry + 'px';
      requestAnimationFrame(tickCursor);
    })();
    document.querySelectorAll('a, button, .bct-drop-card, .mob-acc-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cRing.style.transform   = 'translate(-50%,-50%) scale(1.3)';
        cRing.style.borderColor = 'rgba(0,229,255,.9)';
        cRing.style.background  = 'rgba(0,229,255,.06)';
      });
      el.addEventListener('mouseleave', () => {
        cRing.style.transform   = 'translate(-50%,-50%) scale(1)';
        cRing.style.borderColor = 'rgba(0,229,255,.45)';
        cRing.style.background  = 'transparent';
      });
    });
  
    /* ── Navbar scroll: dark glass ── */
    window.addEventListener('scroll', () => {
      document.getElementById('bctNav').classList.toggle('scrolled', window.scrollY > 60);
    });
  
    /* ── Desktop dropdown: close on outside click ── */
    // document.addEventListener('click', e => {
    //   document.querySelectorAll('.has-drop').forEach(el => {
    //     if (!el.contains(e.target)) el.classList.remove('open');
    //   });
    // });


    /* Toggle on span click (touch/tablet) */
    // document.querySelectorAll('.has-drop > span').forEach(span => {
    //   span.addEventListener('click', e => {
    //     e.stopPropagation();
    //     const li = span.parentElement;
    //     const wasOpen = li.classList.contains('open');
    //     document.querySelectorAll('.has-drop').forEach(el => el.classList.remove('open'));
    //     if (!wasOpen) li.classList.add('open');
    //   });
    // });

    /* ════════════════════════════════════════════════
   DROPDOWN — JS hover with delay (fixes gap flicker)
   Independent: touches only .has-drop elements
════════════════════════════════════════════════ */
(function () {
  var closeTimers = new Map();

  document.querySelectorAll('.has-drop').forEach(function (li) {

    /* ── Mouse enters the <li> → open immediately ── */
    li.addEventListener('mouseenter', function () {
      /* Cancel any pending close for this item */
      if (closeTimers.has(li)) {
        clearTimeout(closeTimers.get(li));
        closeTimers.delete(li);
      }
      li.classList.add('open');
    });

    /* ── Mouse leaves the <li> → wait 150ms before closing ── */
    li.addEventListener('mouseleave', function () {
      var t = setTimeout(function () {
        li.classList.remove('open');
        closeTimers.delete(li);
      }, 150); /* 150ms grace period — cursor has time to reach dropdown */
      closeTimers.set(li, t);
    });

    /* ── Touch/tap on span (mobile/tablet) → toggle ── */
    var trigger = li.querySelector(':scope > span');
    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = li.classList.contains('open');
        document.querySelectorAll('.has-drop').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!wasOpen) li.classList.add('open');
      });
    }
  });

  /* ── Click outside closes all dropdowns ── */
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.has-drop').forEach(function (el) {
      if (!el.contains(e.target)) el.classList.remove('open');
    });
  });

})();
  
    /* ── Mobile overlay open/close ── */
    document.getElementById('ham').addEventListener('click', () => {
      document.getElementById('mobOverlay').classList.add('open');
    });
    document.getElementById('mobClose').addEventListener('click', () => {
      document.getElementById('mobOverlay').classList.remove('open');
    });
    document.querySelectorAll('.mob-link, .mob-acc-card').forEach(a => {
      a.addEventListener('click', () => {
        document.getElementById('mobOverlay').classList.remove('open');
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.getElementById('mobOverlay').classList.remove('open');
    });
  
    /* ── Mobile accordion ── */
    document.querySelectorAll('.mob-accordion .mob-acc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = btn.parentElement;
        const isOpen = acc.classList.contains('open');
        document.querySelectorAll('.mob-accordion').forEach(a => a.classList.remove('open'));
        if (!isOpen) acc.classList.add('open');
      });
    });

      // /* ── Auto active nav item based on current page URL ── *////////////////////////////////////////////////////////////
      (function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bct-nav .bct-menu a').forEach(link => {
    const linkPage = link.getAttribute('href').split('#')[0];
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
})();
