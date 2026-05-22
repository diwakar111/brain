/**
 * BCT NAVBAR — header.js
 * Usage: <script src="assets/js/header.js"></script>
 * Place just after <body> opens (or anywhere before </body>).
 * Requires: Font Awesome 6 and Google Fonts (Syne, Outfit, Space Mono)
 *           loaded in <head> — or let this script inject them.
 */
(function () {
    'use strict';
  
    /* ── 1. Inject Google Fonts + Font Awesome if not already present ── */
    function loadLink(href, id) {
      if (document.getElementById(id)) return;
      var l = document.createElement('link');
      l.id   = id;
      l.rel  = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    }
    loadLink(
      'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap',
      'bct-gfonts'
    );
    loadLink(
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
      'bct-fa'
    );
  
    /* ── 2. Inject scoped CSS ── */
    var CSS = `
    /* ════════════════════════════════════════════════
       BCT NAVBAR — ISOLATED CSS
       All variables prefixed --bct-
       box-sizing scoped to .bct-nav * and cursor elements
       NO global resets. Safe to drop into any page.
    ════════════════════════════════════════════════ */
  
    .bct-nav *,
    .bct-nav *::before,
    .bct-nav *::after,
    .mob-overlay *,
    .mob-overlay *::before,
    .mob-overlay *::after,
    #cDot, #cRing {
      box-sizing: border-box;
    }
  
    .bct-nav,
    .mob-overlay,
    #cDot, #cRing {
      --bct-cyan:  #00e5ff;
      --bct-vio:   #7b2fff;
      --bct-pink:  #ff2d9b;
      --bct-gradh: linear-gradient(90deg, #00e5ff, #7b2fff);
      --bct-text:  #e8eeff;
      --bct-mute:  #5a6a94;
      --bct-bord:  rgba(0, 229, 255, 0.15);
    }
  
    /* ── Custom cursor ── */
    #cDot {
      position: fixed; width: 7px; height: 7px;
      background: #00e5ff; border-radius: 50%;
      pointer-events: none; z-index: 99999;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #00e5ff;
    }
    #cRing {
      position: fixed; width: 26px; height: 26px;
      border: 1.5px solid rgba(0, 229, 255, 0.45);
      border-radius: 50%; pointer-events: none;
      z-index: 99998; transform: translate(-50%, -50%);
      transition: all 0.12s ease;
    }
    @media (max-width: 992px), (hover: none), (pointer: coarse) {
      #cDot, #cRing { display: none !important; }
      body { cursor: auto !important; }
    }
  
    /* ════ NAVBAR ════ */
    .bct-nav {
      position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
      transition: background 0.4s ease, backdrop-filter 0.4s ease,
                  border-bottom 0.4s ease, box-shadow 0.4s ease;
    }
    .bct-nav.scrolled {
      background: rgba(5, 11, 24, 0.88);
      backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
      border-bottom: 1px solid rgba(0, 229, 255, 0.15);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
    }
    .bct-nav .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 52px; width: 100%; max-width: 100%;
      background: rgba(0, 0, 0, 0.88);
    }
  
    /* ── Logo ── */
    .bct-nav .bct-logo {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0;
    }
    .bct-nav .bct-logo img { height: 34px; filter: drop-shadow(0 0 8px rgba(0,229,255,.4)); }
    .bct-nav .bct-logo-name {
      font-family: 'Syne', sans-serif; font-weight: 700;
      font-size: 1.05rem; color: #fff; letter-spacing: 0.5px;
    }
  
    /* ── Desktop menu ── */
    .bct-nav .bct-menu {
      display: flex; align-items: center; gap: 4px; list-style: none; margin: 0; padding: 0;
    }
    .bct-nav .bct-menu li > a,
    .bct-nav .bct-menu li > span {
      display: block; font-size: 0.86rem; font-weight: 500;
      color: rgba(232,238,255,.65); text-decoration: none;
      padding: 8px 13px; border-radius: 8px; cursor: pointer; white-space: nowrap;
      transition: color .25s, background .25s; font-family: 'Outfit', sans-serif;
    }
    .bct-nav .bct-menu li > a:hover,
    .bct-nav .bct-menu li > span:hover { color: #fff; background: rgba(0,229,255,.07); }
    .bct-nav .bct-menu li > a.active { color: #fff; background: rgba(0,229,255,.07); }
  
    /* ── Dropdown ── */
    .bct-nav .has-drop { position: relative; }
    .bct-nav .bct-drop {
      position: absolute; top: calc(100% + 10px); left: 50%;
      transform: translateX(-50%) translateY(8px);
      min-width: 380px;
      background: rgba(6,12,28,.98);
      backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
      border: 1px solid rgba(0,229,255,.15);
      border-radius: 16px; padding: 14px;
      opacity: 0; pointer-events: none; visibility: hidden;
      transition: opacity .22s cubic-bezier(.22,1,.36,1),
                  transform .22s cubic-bezier(.22,1,.36,1),
                  visibility 0s linear .22s;
      box-shadow: 0 20px 50px rgba(0,0,0,.55), 0 0 0 1px rgba(0,229,255,.04);
      z-index: 999;
    }
    @media (hover: hover) {
      .bct-nav .has-drop:hover .bct-drop {
        opacity: 1; pointer-events: all; visibility: visible;
        transform: translateX(-50%) translateY(0);
        transition: opacity .22s cubic-bezier(.22,1,.36,1),
                    transform .22s cubic-bezier(.22,1,.36,1),
                    visibility 0s linear 0s;
      }
    }
    .bct-nav .has-drop.open .bct-drop {
      opacity: 1; pointer-events: all; visibility: visible;
      transform: translateX(-50%) translateY(0);
      transition: opacity .22s cubic-bezier(.22,1,.36,1),
                  transform .22s cubic-bezier(.22,1,.36,1),
                  visibility 0s linear 0s;
    }
    .bct-nav .bct-drop-head {
      font-family: 'Space Mono', monospace;
      font-size: .58rem; letter-spacing: 3px; text-transform: uppercase;
      color: rgba(0,229,255,.5);
      padding: 0 4px 10px;
      border-bottom: 1px solid rgba(255,255,255,.06);
      margin-bottom: 10px; margin-top: 0;
    }
    .bct-nav .bct-drop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    .bct-nav .bct-drop-card {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 12px; border-radius: 11px;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.05);
      text-decoration: none; cursor: pointer;
      transition: background .2s, border-color .2s, transform .2s;
    }
    .bct-nav .bct-drop-card:hover {
      background: rgba(0,229,255,.07);
      border-color: rgba(0,229,255,.22);
      transform: translateX(3px);
    }
    .bct-nav .bct-drop-icon {
      flex-shrink: 0; width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      position: relative; transition: box-shadow .25s;
    }
    .bct-nav .bct-drop-icon::before {
      content: ""; position: absolute; inset: 0; border-radius: 9px;
      background: var(--di-grad); opacity: .16; transition: opacity .22s;
    }
    .bct-nav .bct-drop-card:hover .bct-drop-icon::before { opacity: .3; }
    .bct-nav .bct-drop-icon::after {
      content: ""; position: absolute; inset: 0; border-radius: 9px;
      border: 1px solid var(--di-border); opacity: .8;
    }
    .bct-nav .bct-drop-icon i {
      position: relative; z-index: 1; font-size: 13px;
      background: var(--di-grad);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .bct-nav .bct-drop-card:hover .bct-drop-icon { box-shadow: 0 0 14px var(--di-glow); }
  
    /* Icon colour tokens */
    .bct-di--iot    { --di-grad: linear-gradient(135deg,#00e5ff,#3b82f6); --di-glow: rgba(0,229,255,.3);   --di-border: rgba(0,229,255,.28); }
    .bct-di--emb    { --di-grad: linear-gradient(135deg,#7b2fff,#00e5ff); --di-glow: rgba(123,47,255,.3);  --di-border: rgba(123,47,255,.28); }
    .bct-di--cloud  { --di-grad: linear-gradient(135deg,#38bdf8,#7b2fff); --di-glow: rgba(56,189,248,.3);  --di-border: rgba(56,189,248,.28); }
    .bct-di--mobile { --di-grad: linear-gradient(135deg,#ff2d9b,#7b2fff); --di-glow: rgba(255,45,155,.3);  --di-border: rgba(255,45,155,.28); }
    .bct-di--box    { --di-grad: linear-gradient(135deg,#f59e0b,#ef4444); --di-glow: rgba(245,158,11,.3);  --di-border: rgba(245,158,11,.28); }
    .bct-di--hw     { --di-grad: linear-gradient(135deg,#10b981,#00e5ff); --di-glow: rgba(16,185,129,.3);  --di-border: rgba(16,185,129,.28); }
    .bct-di--auto   { --di-grad: linear-gradient(135deg,#f97316,#ef4444); --di-glow: rgba(249,115,22,.3);  --di-border: rgba(249,115,22,.28); }
    .bct-di--home   { --di-grad: linear-gradient(135deg,#a855f7,#ff2d9b); --di-glow: rgba(168,85,247,.3);  --di-border: rgba(168,85,247,.28); }
    .bct-di--food   { --di-grad: linear-gradient(135deg,#10b981,#84cc16); --di-glow: rgba(16,185,129,.3);  --di-border: rgba(16,185,129,.28); }
    .bct-di--ind    { --di-grad: linear-gradient(135deg,#00e5ff,#f59e0b); --di-glow: rgba(0,229,255,.3);   --di-border: rgba(0,229,255,.28); }
  
    .bct-nav .bct-drop-texts { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .bct-nav .bct-drop-label {
      font-family: 'Outfit', sans-serif; font-size: .82rem; font-weight: 500;
      color: rgba(232,238,255,.78); line-height: 1.2; white-space: nowrap; transition: color .2s;
    }
    .bct-nav .bct-drop-card:hover .bct-drop-label { color: #fff; }
    .bct-nav .bct-drop-sub {
      font-family: 'Space Mono', monospace; font-size: .5rem;
      letter-spacing: .8px; color: rgba(232,238,255,.28);
      text-transform: uppercase; white-space: nowrap;
    }
  
    /* ── CTA button ── */
    .bct-nav .bct-btn-cta {
      font-family: 'Outfit', sans-serif; font-size: .84rem; font-weight: 600;
      padding: 9px 22px; border-radius: 50px; border: none;
      background: linear-gradient(90deg,#00e5ff,#7b2fff);
      color: #fff; cursor: pointer; position: relative; overflow: hidden;
      box-shadow: 0 0 20px rgba(0,229,255,.2);
      transition: all .3s ease; white-space: nowrap; flex-shrink: 0;
    }
    .bct-nav .bct-btn-cta::after {
      content: ""; position: absolute; top: -50%; left: -70%;
      width: 45%; height: 200%;
      background: rgba(255,255,255,.18); transform: skewX(-20deg);
      transition: left .5s ease;
    }
    .bct-nav .bct-btn-cta:hover::after { left: 130%; }
    .bct-nav .bct-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,229,255,.35); }
  
    /* ── Hamburger ── */
    .bct-nav .hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; padding: 5px; background: none; border: none;
    }
    .bct-nav .hamburger span {
      width: 23px; height: 2px; background: #e8eeff;
      border-radius: 2px; transition: background .3s; display: block;
    }
  
    /* ════ MOBILE OVERLAY ════ */
    .mob-overlay {
      position: fixed; inset: 0;
      background: rgba(5,11,24,.97);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      z-index: 99997; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      visibility: hidden; opacity: 0; transform: translateY(-100%);
      transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .55s ease, visibility 0s linear .55s;
      overflow-y: auto; padding: 60px 20px 40px;
    }
    .mob-overlay.open {
      visibility: visible; opacity: 1; transform: translateY(0);
      transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .55s ease, visibility 0s linear 0s;
    }
    
   .mob-overlay .mob-close {
        position: fixed; top: 16px; right: 16px;
        width: 44px; height: 44px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0, 229, 255, 0.15);
        border: 1.5px solid rgba(0, 229, 255, 0.5);
        color: #00e5ff; font-size: 1.1rem;
        cursor: pointer; z-index: 100000;
        transition: all 0.25s ease;
        box-shadow: 0 0 20px rgba(0, 229, 255, 0.3), inset 0 0 10px rgba(0,229,255,0.05);
        pointer-events: all;
    }
    .mob-overlay .mob-close:hover {
        background: rgba(0, 229, 255, 0.2);
        border-color: #00e5ff;
        box-shadow: 0 0 24px rgba(0, 229, 255, 0.4);
        transform: rotate(90deg) scale(1.1);
    }
    .mob-overlay .mob-link {
      font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 700;
      color: rgba(232,238,255,.55) !important;
      -webkit-text-fill-color: rgba(232,238,255,.55) !important;
      text-decoration: none !important;
      display: block; text-align: center; padding: 10px 0;
      transition: color .2s; width: 100%;
    }
    .mob-overlay .mob-link:hover,
    .mob-overlay .mob-link:active {
      color: #00e5ff !important;
      -webkit-text-fill-color: #00e5ff !important;
    }
    .mob-overlay .mob-accordion { width: 100%; text-align: center; }
    .mob-overlay .mob-acc-btn {
      font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 700;
      color: rgba(232,238,255,.55) !important;
      -webkit-text-fill-color: rgba(232,238,255,.55) !important;
      background: none; border: none; cursor: pointer;
      width: 100%; padding: 10px 0;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: color .2s;
    }
    .mob-overlay .mob-acc-btn:hover {
      color: #00e5ff !important;
      -webkit-text-fill-color: #00e5ff !important;
    }
    .mob-overlay .mob-acc-arrow { font-size: 1rem; transition: transform .3s ease; color: rgba(0,229,255,.5); }
    .mob-overlay .mob-accordion.open .mob-acc-arrow { transform: rotate(180deg); }
    .mob-overlay .mob-acc-panel { max-height: 0; overflow: hidden; transition: max-height .4s ease; }
    .mob-overlay .mob-accordion.open .mob-acc-panel { max-height: 600px; }
    .mob-overlay .mob-acc-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px 0 16px;
    }
    .mob-overlay .mob-acc-card {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 12px; border-radius: 10px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.06);
      text-decoration: none; transition: background .2s, border-color .2s;
    }
    .mob-overlay .mob-acc-card:hover,
    .mob-overlay .mob-acc-card:active { background: rgba(0,229,255,.08); border-color: rgba(0,229,255,.2); }
    .mob-overlay .mob-acc-icon {
      flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; position: relative;
    }
    .mob-overlay .mob-acc-icon::before {
      content: ""; position: absolute; inset: 0; border-radius: 8px;
      background: var(--di-grad); opacity: .2;
    }
    .mob-overlay .mob-acc-icon::after {
      content: ""; position: absolute; inset: 0; border-radius: 8px;
      border: 1px solid var(--di-border); opacity: .7;
    }
    .mob-overlay .mob-acc-icon i {
      position: relative; z-index: 1; font-size: 11px;
      background: var(--di-grad);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .mob-overlay .mob-acc-label {
      font-family: 'Outfit', sans-serif; font-size: .75rem; font-weight: 500;
      color: rgba(232,238,255,.7); line-height: 1.2; text-align: left;
    }
    .mob-overlay .mob-divider {
      width: 60px; height: 1px; background: rgba(255,255,255,.08); margin: 6px auto;
    }
  
    /* Logo text style */
    .bct-logo-name {
      display: flex; align-items: center;
      font-family: 'Syne', sans-serif; font-weight: 800;
      font-size: 1.1rem; letter-spacing: 2px; color: #ffffff;
    }
    .bct-logo-icon { height: 18px; width: auto; margin: 0 4px; display: inline-block; }
    .bct-logo-i { color: #ff2d55; }
  
    /* ── Responsive ── */
    @media (max-width: 992px) {
      .bct-nav .bct-menu, .bct-nav .bct-btn-cta { display: none; }
      .bct-nav .hamburger { display: flex; }
      .bct-nav .nav-inner { padding: 14px 20px; }
    }
    @media (max-width: 768px) {
      .bct-logo-name { font-size: .95rem; letter-spacing: 1.5px; }
      .bct-logo-icon { height: 16px; }
    }
    @media (max-width: 520px) {
      .mob-overlay .mob-acc-grid { grid-template-columns: 1fr; }
    }
    `;
  
    var styleTag = document.createElement('style');
    styleTag.id = 'bct-navbar-styles';
    styleTag.textContent = CSS;
    document.head.appendChild(styleTag);
  
    /* ── 3. Detect current page for active link ── */
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
    function activeAttr(page) {
      return currentPage === page ? ' class="active"' : '';
    }
  
    /* ── 4. Inject HTML ── */
    var HTML = `
    <!-- Custom cursor -->
    <div id="cDot"></div>
    <div id="cRing"></div>
  
    <!-- NAVBAR -->
    <header class="bct-nav" id="bctNav">
      <div class="nav-inner">
  
        <!-- Logo -->
        <a href="index.html" class="bct-logo">
          <span class="bct-logo-name">
            BR
            <span class="bct-logo-i">A</span>
            INCH
            <span class="bct-logo-i">I</span>
            LD
          </span>
        </a>
  
        <!-- Desktop menu -->
        <nav>
          <ul class="bct-menu">
            <li><a href="/combained/LandingAssets/index.html">Home</a></li>
            <li><a href="/combained/CompanyBCT/company.html">Company</a></li>
  
            <!-- Services dropdown -->
            <li class="has-drop" id="dropServices">
              <span>Services</span>
              <div class="bct-drop">
                <p class="bct-drop-head">Our Services</p>
                <div class="bct-drop-grid">
                  <a class="bct-drop-card" href="/combained/EachServices/iot/iot-solution.html">
                    <div class="bct-drop-icon bct-di--iot"><i class="fa-solid fa-wifi"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">IoT Solutions</span>
                      <span class="bct-drop-sub">Hardware · Sensors</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="/combained/EachServices/EmbeddedSystem/EmbeddedSystem.html">
                    <div class="bct-drop-icon bct-di--emb"><i class="fa-solid fa-microchip"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Embedded Systems</span>
                      <span class="bct-drop-sub">Firmware · RTOS</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="/combained/EachServices/cloud/cloud.html">
                    <div class="bct-drop-icon bct-di--cloud"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Cloud Development</span>
                      <span class="bct-drop-sub">AWS · Azure · GCP</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="/combained/EachServices/MobileAppDevelopment/mobile.html">
                    <div class="bct-drop-icon bct-di--mobile"><i class="fa-solid fa-mobile-screen-button"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Mobile Apps</span>
                      <span class="bct-drop-sub">Android · Flutter</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="/combained/EachServices/BoxBuilding/boxBuilding.html">
                    <div class="bct-drop-icon bct-di--box"><i class="fa-solid fa-boxes-stacked"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Box Build Assembly</span>
                      <span class="bct-drop-sub">PCB · Wiring · QA</span>
                    </div>
                  </a>
                  
                </div>
              </div>
            </li>
  
            <!-- Industry dropdown -->
            <li class="has-drop" id="dropIndustry">
              <span>Industry</span>
              <div class="bct-drop">
                <p class="bct-drop-head">Industries We Serve</p>
                <div class="bct-drop-grid">
                  <a class="bct-drop-card" href="industry.html#automotive">
                    <div class="bct-drop-icon bct-di--auto"><i class="fa-solid fa-car-side"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Automotive</span>
                      <span class="bct-drop-sub">ECU · Infotainment</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="industry.html#home">
                    <div class="bct-drop-icon bct-di--home"><i class="fa-solid fa-house-signal"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Home Appliance</span>
                      <span class="bct-drop-sub">Smart · Connected</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="industry.html#food">
                    <div class="bct-drop-icon bct-di--food"><i class="fa-solid fa-mug-hot"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Food &amp; Beverage</span>
                      <span class="bct-drop-sub">Vending · IoT</span>
                    </div>
                  </a>
                  <a class="bct-drop-card" href="industry.html#industrial">
                    <div class="bct-drop-icon bct-di--ind"><i class="fa-solid fa-industry"></i></div>
                    <div class="bct-drop-texts">
                      <span class="bct-drop-label">Industrial IoT</span>
                      <span class="bct-drop-sub">Automation · Edge</span>
                    </div>
                  </a>
                </div>
              </div>
            </li>
  
            <li><a href="/combained/BlogUpdated/blog.html">Blog</a></li>
            <li><a href="/combained/LandingAssets/index.html">Projects</a></li>
            <li><a href="/combained/Contact/contact.html">Contact Us</a></li>
          </ul>
        </nav>
  
        <!-- CTA + Hamburger -->
        <button class="bct-btn-cta" onclick="location.href='contact.html'">Get Quote</button>
        <div class="hamburger" id="ham"><span></span><span></span><span></span></div>
      </div>
    </header>
  
    <!-- Mobile overlay -->
    <div class="mob-overlay" id="mobOverlay">
        <button class="mob-close" id="mobClose">
    <i class="fa-solid fa-xmark"></i>
    </button>
  
      <a href="/combained/LandingAssets/index.html" class="mob-link">Home</a>
      <div class="mob-divider"></div>
      <a href="/combained/CompanyBCT/company.html" class="mob-link">Company</a>
      <div class="mob-divider"></div>
  
      <!-- Services accordion -->
      <div class="mob-accordion" id="mobAccServices">
        <button class="mob-acc-btn">Services <span class="mob-acc-arrow">▾</span></button>
        <div class="mob-acc-panel">
          <div class="mob-acc-grid">
            <a class="mob-acc-card" href="/combained/EachServices/iot/iot-solution.html">
              <div class="mob-acc-icon bct-di--iot"><i class="fa-solid fa-wifi"></i></div>
              <span class="mob-acc-label">IoT Solutions</span>
            </a>
            <a class="mob-acc-card" href="/combained/EachServices/EmbeddedSystem/EmbeddedSystem.html">
              <div class="mob-acc-icon bct-di--emb"><i class="fa-solid fa-microchip"></i></div>
              <span class="mob-acc-label">Embedded Systems</span>
            </a>
            <a class="mob-acc-card" href="/combained/EachServices/cloud/cloud.html">
              <div class="mob-acc-icon bct-di--cloud"><i class="fa-solid fa-cloud-arrow-up"></i></div>
              <span class="mob-acc-label">Cloud Development</span>
            </a>
            <a class="mob-acc-card" href="/combained/EachServices/MobileAppDevelopment/mobile.html">
              <div class="mob-acc-icon bct-di--mobile"><i class="fa-solid fa-mobile-screen-button"></i></div>
              <span class="mob-acc-label">Mobile Apps</span>
            </a>
            <a class="mob-acc-card" href="/combained/EachServices/BoxBuilding/boxBuilding.html">
              <div class="mob-acc-icon bct-di--box"><i class="fa-solid fa-boxes-stacked"></i></div>
              <span class="mob-acc-label">Box Build Assembly</span>
            </a>
            
          </div>
        </div>
      </div>
      <div class="mob-divider"></div>
  
      <!-- Industry accordion -->
      <div class="mob-accordion" id="mobAccIndustry">
        <button class="mob-acc-btn">Industry <span class="mob-acc-arrow">▾</span></button>
        <div class="mob-acc-panel">
          <div class="mob-acc-grid">
            <a class="mob-acc-card" href="industry.html#automotive">
              <div class="mob-acc-icon bct-di--auto"><i class="fa-solid fa-car-side"></i></div>
              <span class="mob-acc-label">Automotive</span>
            </a>
            <a class="mob-acc-card" href="industry.html#home">
              <div class="mob-acc-icon bct-di--home"><i class="fa-solid fa-house-signal"></i></div>
              <span class="mob-acc-label">Home Appliance</span>
            </a>
            <a class="mob-acc-card" href="industry.html#food">
              <div class="mob-acc-icon bct-di--food"><i class="fa-solid fa-mug-hot"></i></div>
              <span class="mob-acc-label">Food &amp; Beverage</span>
            </a>
            <a class="mob-acc-card" href="industry.html#industrial">
              <div class="mob-acc-icon bct-di--ind"><i class="fa-solid fa-industry"></i></div>
              <span class="mob-acc-label">Industrial IoT</span>
            </a>
          </div>
        </div>
      </div>
      <div class="mob-divider"></div>
  
      <a href="/combained/BlogUpdated/blog.html" class="mob-link">Blog</a>
      <div class="mob-divider"></div>
      <a href="/combained/LandingAssets/index.html" class="mob-link">Projects</a>
      <div class="mob-divider"></div>
      <a href="/combained/Contact/contact.html" class="mob-link">Contact Us</a>
    </div>
    `;
  
    /* Insert at beginning of body */
    var target = document.querySelector('bct-header');
    if (target) {
      target.innerHTML = HTML;
    } else {
      // fallback: inject at top of body
      var wrapper = document.createElement('div');
      wrapper.id = 'bct-nav-root';
      wrapper.innerHTML = HTML;
      document.body.insertBefore(wrapper, document.body.firstChild);
    }
  
    /* ── 5. Init JS (runs after DOM is injected) ── */
    function initNavbar() {
      /* Custom cursor */
      var cDot  = document.getElementById('cDot');
      var cRing = document.getElementById('cRing');
      if (cDot && cRing) {
        var mx = 0, my = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
        (function tickCursor() {
          cDot.style.left = mx + 'px';
          cDot.style.top  = my + 'px';
          rx += (mx - rx) * 0.5;
          ry += (my - ry) * 0.5;
          cRing.style.left = rx + 'px';
          cRing.style.top  = ry + 'px';
          requestAnimationFrame(tickCursor);
        })();
        document.querySelectorAll('a, button, .bct-drop-card, .mob-acc-card').forEach(function (el) {
          el.addEventListener('mouseenter', function () {
            cRing.style.transform   = 'translate(-50%,-50%) scale(1.3)';
            cRing.style.borderColor = 'rgba(0,229,255,.9)';
            cRing.style.background  = 'rgba(0,229,255,.06)';
          });
          el.addEventListener('mouseleave', function () {
            cRing.style.transform   = 'translate(-50%,-50%) scale(1)';
            cRing.style.borderColor = 'rgba(0,229,255,.45)';
            cRing.style.background  = 'transparent';
          });
        });
      }
  
      /* Scroll: dark glass */
      window.addEventListener('scroll', function () {
        var nav = document.getElementById('bctNav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
      });
  
      /* Desktop dropdown: close on outside click */
      document.addEventListener('click', function (e) {
        document.querySelectorAll('.has-drop').forEach(function (el) {
          if (!el.contains(e.target)) el.classList.remove('open');
        });
      });
      document.querySelectorAll('.has-drop > span').forEach(function (span) {
        span.addEventListener('click', function (e) {
          e.stopPropagation();
          var li = span.parentElement;
          var wasOpen = li.classList.contains('open');
          document.querySelectorAll('.has-drop').forEach(function (el) { el.classList.remove('open'); });
          if (!wasOpen) li.classList.add('open');
        });
      });
  
      /* Mobile overlay */
      var ham     = document.getElementById('ham');
      var overlay = document.getElementById('mobOverlay');
      var close   = document.getElementById('mobClose');
      if (ham)   ham.addEventListener('click', function () { overlay.classList.add('open'); });
      if (close) close.addEventListener('click', function () { overlay.classList.remove('open'); });
      document.querySelectorAll('.mob-link, .mob-acc-card').forEach(function (a) {
        a.addEventListener('click', function () { overlay.classList.remove('open'); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') overlay.classList.remove('open');
      });
  
      /* Mobile accordions */
      document.querySelectorAll('.mob-accordion .mob-acc-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var acc = btn.parentElement;
          var isOpen = acc.classList.contains('open');
          document.querySelectorAll('.mob-accordion').forEach(function (a) { a.classList.remove('open'); });
          if (!isOpen) acc.classList.add('open');
        });
      });
  
      /* Auto active link */
      var pg = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.bct-nav .bct-menu a').forEach(function (link) {
        var lp = link.getAttribute('href').split('#')[0];
        if (lp === pg) link.classList.add('active');
      });
    }
  
    /* Run after current script finishes so the injected DOM is ready */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
      initNavbar();
    }
  
  })();