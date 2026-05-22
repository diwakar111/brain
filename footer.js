/**
 * BCT FOOTER — footer.js
 * Usage: <script src="assets/js/footer.js"></script>
 * Place just before </body>.
 * Requires: Font Awesome 6 and Google Fonts (Syne, Outfit, Space Mono)
 *           — injected automatically if not already present.
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
    /* ══════════════════════════════════════════════════════════
       BCT FOOTER — PREMIUM v4  |  Prefix: bctf4-
    ══════════════════════════════════════════════════════════ */
    .bctf4-root {
      position: relative;
      height: 100vh;
      min-height: 600px;
      max-height: 960px;
      background: #f0f4ff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-family: "Outfit", sans-serif;
  
      --f4-cyan:  #00b8cc;
      --f4-vio:   #7b2fff;
      --f4-pink:  #ff2d9b;
      --f4-green: #10b981;
      --f4-amber: #f59e0b;
      --f4-text:  #3a4257;
      --f4-muted: #6b7696;
      --f4-bord:  rgba(0,150,200,.14);
      --f4-grad:  linear-gradient(135deg,#00b8cc,#7b2fff);
      --f4-gradt: linear-gradient(90deg,#0094aa,#7b2fff);
      --f4-glass: rgba(255,255,255,.6);
    }
  
    #bctf4-canvas-particles,
    #bctf4-canvas-circuit {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; opacity: .18;
    }
    #bctf4-canvas-particles { z-index: 0; }
    #bctf4-canvas-circuit   { z-index: 1; }
  
    .bctf4-root::before {
      content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
      background-size: 160px; opacity: .3;
    }
  
    .bctf4-glow { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 1; }
    .bctf4-g1 {
      width: 500px; height: 500px; top: -180px; left: -100px;
      background: radial-gradient(circle,rgba(0,185,204,.1) 0%,transparent 70%);
      animation: bctf4float 16s ease-in-out infinite;
    }
    .bctf4-g2 {
      width: 420px; height: 420px; bottom: -100px; right: -80px;
      background: radial-gradient(circle,rgba(123,47,255,.08) 0%,transparent 70%);
      animation: bctf4float 20s ease-in-out infinite reverse;
    }
    .bctf4-g3 {
      width: 300px; height: 300px; top: 50%; left: 48%;
      background: radial-gradient(circle,rgba(255,45,155,.06) 0%,transparent 70%);
      animation: bctf4float 12s ease-in-out infinite 3s;
    }
    @keyframes bctf4float {
      0%,100% { transform: translate(0,0) scale(1); }
      40%     { transform: translate(16px,-12px) scale(1.06); }
      70%     { transform: translate(-8px,8px) scale(.96); }
    }
  
    /* Top accent line */
    .bctf4-topline {
      position: relative; z-index: 10; height: 3px; flex-shrink: 0;
      background: linear-gradient(90deg,transparent 0%,#00b8cc 25%,#7b2fff 55%,#ff2d9b 80%,transparent 100%);
      animation: bctf4scan 5s ease-in-out infinite;
    }
    @keyframes bctf4scan {
      0%,100% { opacity: .7; filter: blur(0px); }
      50%     { opacity: 1; filter: blur(.5px) drop-shadow(0 0 4px #00b8cc); }
    }
  
    /* Brand bar */
    .bctf4-brand {
      position: relative; z-index: 10;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px; padding: 14px 52px;
      background: rgba(255,255,255,.85);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--f4-bord); flex-shrink: 0;
      box-shadow: 0 1px 0 rgba(0,0,0,.06);
    }
    .bctf4-logo-link { display: flex; align-items: center; gap: 12px; text-decoration: none; flex-shrink: 0; }
    .bctf4-logo-wrap {
      width: 42px; height: 42px; border-radius: 11px;
      background: rgba(0,185,204,.08); border: 1px solid rgba(0,185,204,.22);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 14px rgba(0,185,204,.1); transition: box-shadow .3s;
    }
    .bctf4-logo-link:hover .bctf4-logo-wrap { box-shadow: 0 0 24px rgba(0,185,204,.25); }
    .bctf4-logo-wrap img {
      width: 26px; height: 26px; object-fit: contain;
      filter: drop-shadow(0 0 5px rgba(0,185,204,.4));
    }
    .bctf4-logo-text { display: flex; flex-direction: column; gap: 1px; }
    .bctf4-logo-name {
      font-family: "Syne", sans-serif; font-weight: 800; font-size: .95rem;
      color: #0f1e3d; letter-spacing: .3px; line-height: 1;
    }
    .bctf4-logo-sub {
      font-family: "Space Mono", monospace; font-size: .44rem;
      letter-spacing: 3px; text-transform: uppercase;
      background: var(--f4-gradt);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .bctf4-brand-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  
    /* Socials */
    .bctf4-socials { display: flex; gap: 6px; }
    .bctf4-soc {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.05); border: 1px solid rgba(0,0,0,.1);
      color: #6b7696; text-decoration: none; font-size: 11px;
      transition: all .25s cubic-bezier(.22,1,.36,1); position: relative; overflow: hidden;
    }
    .bctf4-soc::before {
      content: ""; position: absolute; inset: 0;
      background: var(--f4-grad); opacity: 0; transition: opacity .25s;
    }
    .bctf4-soc:hover { transform: translateY(-3px); border-color: transparent; color: #fff; box-shadow: 0 8px 20px rgba(0,185,204,.25); }
    .bctf4-soc:hover::before { opacity: 1; }
    .bctf4-soc i { position: relative; z-index: 1; }
  
    /* CTA button */
    .bctf4-cta-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 20px; border-radius: 50px; border: none;
      background: var(--f4-grad); color: #fff;
      font-family: "Outfit", sans-serif; font-size: .8rem; font-weight: 600;
      text-decoration: none; cursor: pointer; white-space: nowrap;
      box-shadow: 0 6px 22px rgba(0,185,204,.22);
      transition: all .3s ease; position: relative; overflow: hidden;
    }
    .bctf4-cta-btn::after {
      content: ""; position: absolute; top: -50%; left: -70%;
      width: 40%; height: 200%;
      background: rgba(255,255,255,.2); transform: skewX(-20deg); transition: left .5s ease;
    }
    .bctf4-cta-btn:hover::after { left: 130%; }
    .bctf4-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,185,204,.35); }
  
    /* 4-column grid */
    .bctf4-cols {
      position: relative; z-index: 10;
      display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr;
      flex: 1; overflow: hidden;
    }
    .bctf4-col {
      padding: 22px 26px 16px;
      border-right: 1px solid var(--f4-bord);
      overflow: hidden; background: var(--f4-glass);
      opacity: 0; transform: translateY(28px);
      transition: opacity .7s ease, transform .7s ease, background .3s ease;
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    }
    .bctf4-col:last-child { border-right: none; }
    .bctf4-col.bctf4-vis { opacity: 1; transform: translateY(0); }
    .bctf4-col:nth-child(1) { transition-delay: .05s; }
    .bctf4-col:nth-child(2) { transition-delay: .15s; }
    .bctf4-col:nth-child(3) { transition-delay: .25s; }
    .bctf4-col:nth-child(4) { transition-delay: .35s; }
    .bctf4-col:hover { background: rgba(255,255,255,.85); }
  
    /* Column heading */
    .bctf4-ch {
      font-family: "Syne", sans-serif; font-size: .82rem; font-weight: 800;
      color: #0f1e3d; margin: 0 0 14px; padding-bottom: 10px;
      position: relative; display: inline-block;
    }
    .bctf4-ch::after {
      content: ""; position: absolute; bottom: 0; left: 0;
      width: 28px; height: 2px; border-radius: 2px;
      background: var(--f4-grad); transition: width .35s ease;
    }
    .bctf4-col:hover .bctf4-ch::after { width: 50px; }
  
    /* Col 1 — address + contact */
    .bctf4-address {
      font-size: .75rem; line-height: 1.8; color: #5a6a94; font-style: normal; margin: 0 0 10px;
    }
    .bctf4-clinks { display: flex; flex-direction: column; gap: 3px; }
    .bctf4-clink {
      display: flex; align-items: center; gap: 9px;
      font-size: .74rem; color: #3a4257; text-decoration: none;
      padding: 5px 8px; border-radius: 7px; border: 1px solid transparent;
      transition: all .22s ease;
    }
    .bctf4-clink:hover {
      background: rgba(0,185,204,.07); border-color: rgba(0,185,204,.2);
      color: #0f1e3d; transform: translateX(4px);
    }
    .bctf4-ci {
      flex-shrink: 0; width: 22px; height: 22px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center; font-size: 9px;
    }
    .bctf4-ci-em  { background: rgba(0,185,204,.1);   color: #00a0b5; }
    .bctf4-ci-ph  { background: rgba(16,185,129,.1);  color: #10b981; }
    .bctf4-ci-wa  { background: rgba(37,211,102,.1);  color: #25d366; }
    .bctf4-ci-loc { background: rgba(123,47,255,.1);  color: #7b2fff; }
    .bctf4-ci-sup { background: rgba(245,158,11,.1);  color: #f59e0b; }
  
    /* Col 2 — Why us bullets */
    .bctf4-why { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .bctf4-wi {
      display: flex; align-items: flex-start; gap: 9px;
      font-size: .73rem; line-height: 1.6; color: #3a4257;
      padding: 8px 10px; border-radius: 9px;
      background: rgba(255,255,255,.7); border: 1px solid rgba(0,150,200,.1);
      transition: all .22s ease;
    }
    .bctf4-wi:hover { background: rgba(255,255,255,.95); border-color: rgba(0,185,204,.22); transform: translateX(3px); }
    .bctf4-wd {
      flex-shrink: 0; width: 5px; height: 5px; border-radius: 50%; margin-top: 5px;
      background: var(--f4-grad); box-shadow: 0 0 6px rgba(0,185,204,.5);
      animation: bctf4dotpulse 2.5s ease-in-out infinite;
    }
    @keyframes bctf4dotpulse {
      0%,100% { box-shadow: 0 0 5px rgba(0,185,204,.5); }
      50%     { box-shadow: 0 0 12px rgba(0,185,204,.9); }
    }
  
    /* Col 3 & 4 — nav links */
    .bctf4-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
    .bctf4-links a {
      display: flex; align-items: center; gap: 0;
      font-size: .76rem; color: #3a4257; text-decoration: none;
      padding: 6px 10px; border-radius: 7px; border: 1px solid transparent; transition: all .2s ease;
    }
    .bctf4-arr { font-size: .6rem; color: var(--f4-cyan); opacity: 0; margin-right: 0; flex-shrink: 0; transition: opacity .18s, margin-right .18s, transform .18s; }
    .bctf4-links a:hover { background: rgba(0,185,204,.07); border-color: rgba(0,185,204,.18); color: #0f1e3d; padding-left: 14px; }
    .bctf4-links a:hover .bctf4-arr { opacity: 1; margin-right: 5px; transform: translateX(2px); }
  
    /* CTA card inside col 4 */
    .bctf4-ctacard {
      margin-top: 14px; padding: 14px 16px; border-radius: 13px;
      background: rgba(255,255,255,.8); border: 1px solid rgba(0,185,204,.2);
      position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(0,185,204,.08);
    }
    .bctf4-ctacard::before {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg,transparent,#00b8cc,#7b2fff,transparent);
    }
    .bctf4-ctacard p {
      font-size: .7rem; color: #5a6a94; margin: 0 0 10px; line-height: 1.55; text-align: center;
    }
    .bctf4-ctacard-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; padding: 9px; border-radius: 9px; border: none;
      background: var(--f4-grad); color: #fff;
      font-family: "Outfit", sans-serif; font-size: .75rem; font-weight: 600;
      text-decoration: none; cursor: pointer;
      box-shadow: 0 5px 18px rgba(0,185,204,.2); transition: all .25s ease;
      position: relative; overflow: hidden;
    }
    .bctf4-ctacard-btn::after {
      content: ""; position: absolute; top: -50%; left: -70%;
      width: 40%; height: 200%;
      background: rgba(255,255,255,.2); transform: skewX(-20deg); transition: left .45s ease;
    }
    .bctf4-ctacard-btn:hover::after { left: 130%; }
    .bctf4-ctacard-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,185,204,.32); }
  
    /* Stats row */
    .bctf4-stats {
      position: relative; z-index: 10; flex-shrink: 0;
      display: grid; grid-template-columns: repeat(4,1fr);
      background: rgba(255,255,255,.9);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(0,150,200,.12);
      border-bottom: 1px solid rgba(0,150,200,.12);
      box-shadow: 0 -1px 0 rgba(255,255,255,.8);
    }
    .bctf4-stat {
      display: flex; flex-direction: column; align-items: center; padding: 11px 16px;
      border-right: 1px solid rgba(0,150,200,.12); transition: background .25s; cursor: default;
    }
    .bctf4-stat:last-child { border-right: none; }
    .bctf4-stat:hover { background: rgba(0,185,204,.05); }
    .bctf4-sico { font-size: 9px; margin-bottom: 3px; background: var(--f4-gradt); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .bctf4-snum {
      font-family: "Syne", sans-serif; font-size: 1.6rem; font-weight: 800; line-height: 1;
      background: linear-gradient(135deg,#00b8cc,#7b2fff);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      filter: drop-shadow(0 0 8px rgba(0,185,204,.2));
    }
    .bctf4-slbl {
      font-family: "Space Mono", monospace; font-size: .42rem;
      letter-spacing: 2px; text-transform: uppercase; color: #6b7696; margin-top: 3px;
    }
  
    /* Bottom bar */
    .bctf4-bottom {
      position: relative; z-index: 10; flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px; padding: 11px 52px;
      background: rgba(230,237,255,.95);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(0,150,200,.1);
    }
    .bctf4-copy {
      font-family: "Space Mono", monospace; font-size: .48rem;
      letter-spacing: 1.5px; text-transform: uppercase; color: #6b7696;
    }
    .bctf4-copy b {
      background: var(--f4-gradt);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; font-weight: 700;
    }
    .bctf4-policy { display: flex; align-items: center; gap: 16px; }
    .bctf4-policy a {
      font-family: "Space Mono", monospace; font-size: .46rem;
      letter-spacing: 1.5px; text-transform: uppercase;
      color: #6b7696; text-decoration: none; transition: color .2s;
    }
    .bctf4-policy a:hover { color: #00a0b5; }
    .bctf4-live { display: flex; align-items: center; gap: 6px; font-family: "Space Mono", monospace; font-size: .44rem; letter-spacing: 2px; text-transform: uppercase; color: #6b7696; }
    .bctf4-livdot {
      width: 6px; height: 6px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 8px #10b981; animation: bctf4livdot 1.8s ease-in-out infinite;
    }
    @keyframes bctf4livdot {
      0%,100% { box-shadow: 0 0 5px #10b981; }
      50%     { box-shadow: 0 0 14px #10b981; }
    }
  
    /* Responsive */
    @media (max-width: 1100px) {
      .bctf4-root { height: auto; max-height: none; }
      .bctf4-cols { grid-template-columns: 1fr 1fr; }
      .bctf4-col:nth-child(2) { border-right: none; }
      .bctf4-col:nth-child(3) { border-top: 1px solid var(--f4-bord); }
      .bctf4-col:nth-child(4) { border-top: 1px solid var(--f4-bord); border-right: none; }
      .bctf4-brand  { padding: 12px 32px; }
      .bctf4-bottom { padding: 10px 32px; }
    }
    @media (max-width: 680px) {
      .bctf4-cols { grid-template-columns: 1fr; }
      .bctf4-col  { border-right: none; border-top: 1px solid var(--f4-bord); padding: 16px 20px; }
      .bctf4-col:first-child { border-top: none; }
      .bctf4-stats { grid-template-columns: 1fr 1fr; }
      .bctf4-stat:nth-child(2) { border-right: none; }
      .bctf4-stat:nth-child(3),
      .bctf4-stat:nth-child(4) { border-top: 1px solid var(--f4-bord); }
      .bctf4-stat:nth-child(4) { border-right: none; }
      .bctf4-brand  { flex-direction: column; align-items: flex-start; padding: 12px 20px; }
      .bctf4-bottom { flex-direction: column; align-items: center; text-align: center; padding: 10px 20px; }
      .bctf4-live   { display: none; }
    }
    @media (max-width: 992px) {
      .bctf4-brand  { padding: 12px 28px; }
      .bctf4-bottom { padding: 10px 28px; }
    }
    `;
  
    var styleTag = document.createElement('style');
    styleTag.id = 'bct-footer-styles';
    styleTag.textContent = CSS;
    document.head.appendChild(styleTag);
  
    /* ── 3. Inject HTML ── */
    var HTML = `
    <footer class="bctf4-root" id="bctf4-footer">
  
      <!-- Dual canvas layers -->
      <canvas id="bctf4-canvas-particles"></canvas>
      <canvas id="bctf4-canvas-circuit"></canvas>
  
      <!-- Atmosphere -->
      <div class="bctf4-glow bctf4-g1"></div>
      <div class="bctf4-glow bctf4-g2"></div>
      <div class="bctf4-glow bctf4-g3"></div>
  
      <!-- Top accent line -->
      <div class="bctf4-topline"></div>
  
      <!-- Brand bar -->
      <div class="bctf4-brand">
        <a class="bctf4-logo-link" href="index.html">
          <div class="bctf4-logo-wrap">
            <img src="assets/images/BCT_logo_transparent.png" alt="BrainChild Technology" onerror="this.style.display='none'" />
          </div>
          <div class="bctf4-logo-text">
            <span class="bctf4-logo-name">Brain Child Technology</span>
            <span class="bctf4-logo-sub">Innovate · Engineer · Deliver</span>
          </div>
        </a>
        <div class="bctf4-brand-right">
          <div class="bctf4-socials">
            <a class="bctf4-soc" href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
              <i class="fa-brands fa-linkedin-in"></i>
            </a>
            <a class="bctf4-soc" href="#" aria-label="X / Twitter">
              <i class="fa-brands fa-x-twitter"></i>
            </a>
            <a class="bctf4-soc" href="#" aria-label="YouTube">
              <i class="fa-brands fa-youtube"></i>
            </a>
            <a class="bctf4-soc" href="https://wa.me/919845760779" target="_blank" rel="noopener" aria-label="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
          <a class="bctf4-cta-btn" href="contact.html">
            <i class="fa-solid fa-paper-plane" style="font-size:9px;"></i>
            Contact Us
          </a>
        </div>
      </div>
  
      <!-- 4 columns -->
      <div class="bctf4-cols">
  
        <!-- Col 1 — Company -->
        <div class="bctf4-col">
          <h4 class="bctf4-ch">Brainchild Technologies</h4>
          <address class="bctf4-address">
            #20, 2nd Cross, Gowndanapalya,<br/>
            Subramaniapura Post,<br/>
            Bangalore – 560 061
          </address>
          <div class="bctf4-clinks">
            <a class="bctf4-clink" href="mailto:vijay.n@brainchildtech.com">
              <span class="bctf4-ci bctf4-ci-em"><i class="fa-solid fa-envelope"></i></span>
              vijay.n@brainchildtech.com
            </a>
            <a class="bctf4-clink" href="mailto:sales@brainchildtech.com">
              <span class="bctf4-ci bctf4-ci-em"><i class="fa-solid fa-tag"></i></span>
              sales@brainchildtech.com
            </a>
            <a class="bctf4-clink" href="mailto:support@brainchildtech.com">
              <span class="bctf4-ci bctf4-ci-sup"><i class="fa-solid fa-headset"></i></span>
              support@brainchildtech.com
            </a>
            <a class="bctf4-clink" href="tel:+919845760779">
              <span class="bctf4-ci bctf4-ci-ph"><i class="fa-solid fa-phone"></i></span>
              +91-98457-60779
            </a>
            <a class="bctf4-clink" href="https://wa.me/919845760779" target="_blank" rel="noopener">
              <span class="bctf4-ci bctf4-ci-wa"><i class="fa-brands fa-whatsapp"></i></span>
              Chat on WhatsApp
            </a>
            <a class="bctf4-clink" href="https://maps.google.com/?q=Gowndanapalya+Bangalore+560061" target="_blank" rel="noopener">
              <span class="bctf4-ci bctf4-ci-loc"><i class="fa-solid fa-location-dot"></i></span>
              View on Google Maps
            </a>
          </div>
        </div>
  
        <!-- Col 2 — Why Us -->
        <div class="bctf4-col">
          <h4 class="bctf4-ch">Why us?</h4>
          <ul class="bctf4-why">
            <li class="bctf4-wi">
              <span class="bctf4-wd"></span>
              More than one decade of embedded product &amp; service development expertise.
            </li>
            <li class="bctf4-wi">
              <span class="bctf4-wd"></span>
              Complete in-company support for Embedded, IoT, Cloud &amp; Mobile.
            </li>
            <li class="bctf4-wi">
              <span class="bctf4-wd"></span>
              Field Proven Electronics trusted by global brands worldwide.
            </li>
            <li class="bctf4-wi">
              <span class="bctf4-wd"></span>
              Make in India, Made for the World — world-class quality.
            </li>
          </ul>
        </div>
  
        <!-- Col 3 — Services -->
        <div class="bctf4-col">
          <h4 class="bctf4-ch">Services</h4>
          <ul class="bctf4-links">
            <li><a href="service.html#embedded"><span class="bctf4-arr">›</span>Embedded Systems</a></li>
            <li><a href="service.html#iot"><span class="bctf4-arr">›</span>IoT &amp; Smart Sensors</a></li>
            <li><a href="service.html#cloud"><span class="bctf4-arr">›</span>Cloud Development</a></li>
            <li><a href="service.html#mobile"><span class="bctf4-arr">›</span>Mobile App Development</a></li>
            <li><a href="service.html#boxbuild"><span class="bctf4-arr">›</span>Box Build Assembly</a></li>
            <li><a href="service.html#hardware"><span class="bctf4-arr">›</span>Hardware Design</a></li>
          </ul>
        </div>
  
        <!-- Col 4 — Industries + CTA card -->
        <div class="bctf4-col">
          <h4 class="bctf4-ch">Industries</h4>
          <ul class="bctf4-links">
            <li><a href="industry.html#automotive"><span class="bctf4-arr">›</span>Automotive</a></li>
            <li><a href="industry.html#food"><span class="bctf4-arr">›</span>Food &amp; Beverage</a></li>
            <li><a href="industry.html#home"><span class="bctf4-arr">›</span>Home Appliance</a></li>
            <li><a href="industry.html#industrial"><span class="bctf4-arr">›</span>Industrial IoT</a></li>
          </ul>
          <div class="bctf4-ctacard">
            <p>Ready to build your next intelligent product?</p>
            <a class="bctf4-ctacard-btn" href="contact.html">
              <i class="fa-solid fa-bolt" style="font-size:9px;"></i>
              Get a Free Quote
            </a>
          </div>
        </div>
  
      </div><!-- /cols -->
  
      <!-- Stats row -->
      <div class="bctf4-stats">
        <div class="bctf4-stat">
          <div class="bctf4-sico"><i class="fa-solid fa-calendar-check"></i></div>
          <div class="bctf4-snum" data-f4-target="19" data-f4-suffix="+" data-f4-dec="0">0</div>
          <div class="bctf4-slbl">Years Expertise</div>
        </div>
        <div class="bctf4-stat">
          <div class="bctf4-sico"><i class="fa-solid fa-users"></i></div>
          <div class="bctf4-snum" data-f4-target="2000" data-f4-suffix="+" data-f4-dec="0">0</div>
          <div class="bctf4-slbl">Happy Clients</div>
        </div>
        <div class="bctf4-stat">
          <div class="bctf4-sico"><i class="fa-solid fa-star"></i></div>
          <div class="bctf4-snum" data-f4-target="4.7" data-f4-suffix="★" data-f4-dec="1">0</div>
          <div class="bctf4-slbl">Google Rating</div>
        </div>
        <div class="bctf4-stat">
          <div class="bctf4-sico"><i class="fa-solid fa-microchip"></i></div>
          <div class="bctf4-snum" data-f4-target="360" data-f4-suffix="+" data-f4-dec="0">0</div>
          <div class="bctf4-slbl">Projects Delivered</div>
        </div>
      </div>
  
      <!-- Bottom bar -->
      <div class="bctf4-bottom">
        <p class="bctf4-copy">© 2026 <b>Brainchild Technologies.</b> All Rights Reserved.</p>
        <div class="bctf4-policy">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="bctf4-live">
          <div class="bctf4-livdot"></div>
          All Systems Operational
        </div>
      </div>
  
    </footer>
    `;
  
    var target = document.querySelector('bct-footer');
    if (target) {
      target.innerHTML = HTML;
    } else {
      // fallback: append at bottom of body
      var wrapper = document.createElement('div');
      wrapper.id = 'bct-footer-root';
      wrapper.innerHTML = HTML;
      document.body.appendChild(wrapper);
    }
  
    /* ── 4. Init JS ── */
    function initFooter() {
  
      /* ── Canvas 1: Particle network ── */
      (function () {
        var cv = document.getElementById('bctf4-canvas-particles');
        if (!cv) return;
        var ctx = cv.getContext('2d');
        var W, H, pts = [];
  
        function resize() {
          var r = cv.parentElement.getBoundingClientRect();
          var dpr = window.devicePixelRatio || 1;
          W = cv.width  = r.width  * dpr;
          H = cv.height = r.height * dpr;
          cv.style.width  = r.width  + 'px';
          cv.style.height = r.height + 'px';
          ctx.scale(dpr, dpr);
          pts = [];
          for (var i = 0; i < 50; i++) pts.push(mkPt(r.width, r.height));
        }
  
        function mkPt(w, h) {
          return {
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
            r: Math.random() * 1.2 + .3,
            a: Math.random() * .2 + .04,
            c: Math.random() > .5 ? '#00e5ff' : '#7b2fff'
          };
        }
  
        function loop() {
          var dpr = window.devicePixelRatio || 1;
          var w = W / dpr, h = H / dpr;
          ctx.clearRect(0, 0, w, h);
          pts.forEach(function (p, i) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
            for (var j = i + 1; j < pts.length; j++) {
              var d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
              if (d < 90) {
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y);
                ctx.strokeStyle = p.c; ctx.globalAlpha = .025 * (1 - d / 90);
                ctx.lineWidth = .5; ctx.stroke();
              }
            }
          });
          ctx.globalAlpha = 1;
          requestAnimationFrame(loop);
        }
  
        resize(); loop();
        window.addEventListener('resize', resize);
      })();
  
      /* ── Canvas 2: Circuit traces ── */
      (function () {
        var cv = document.getElementById('bctf4-canvas-circuit');
        if (!cv) return;
        var ctx = cv.getContext('2d');
        var W, H, traces = [];
  
        function resize() {
          var r   = cv.parentElement.getBoundingClientRect();
          var dpr = window.devicePixelRatio || 1;
          W = cv.width  = r.width  * dpr;
          H = cv.height = r.height * dpr;
          cv.style.width  = r.width  + 'px';
          cv.style.height = r.height + 'px';
          ctx.scale(dpr, dpr);
          buildTraces(r.width, r.height);
        }
  
        function buildTraces(w, h) {
          traces = [];
          var cols = Math.floor(w / 90), rows = Math.floor(h / 70);
          for (var c = 0; c < cols; c++) {
            for (var r = 0; r < rows; r++) {
              if (Math.random() < .35) {
                var x1 = 40 + c * 90 + Math.random() * 25;
                var y1 = 30 + r * 70 + Math.random() * 18;
                var bx = x1 + 30 + Math.random() * 35;
                var x2 = bx, y2 = y1 + 22 + Math.random() * 22;
                traces.push({
                  x1: x1, y1: y1, bx: bx, by: y1, x2: x2, y2: y2,
                  color: Math.random() > .55 ? 'rgba(0,229,255,' : 'rgba(123,47,255,',
                  op: .06 + Math.random() * .1,
                  pulse: Math.random(),
                  speed: .002 + Math.random() * .003
                });
              }
            }
          }
        }
  
        function loop() {
          var dpr = window.devicePixelRatio || 1;
          var w = W / dpr, h = H / dpr;
          ctx.clearRect(0, 0, w, h);
          traces.forEach(function (t) {
            ctx.beginPath();
            ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.bx, t.by); ctx.lineTo(t.x2, t.y2);
            ctx.strokeStyle = t.color + t.op + ')'; ctx.lineWidth = 1.2; ctx.stroke();
            [[t.x1,t.y1],[t.bx,t.by],[t.x2,t.y2]].forEach(function (pt) {
              ctx.beginPath(); ctx.arc(pt[0], pt[1], 2, 0, Math.PI * 2);
              ctx.fillStyle = t.color + (t.op * 1.6) + ')'; ctx.fill();
            });
            t.pulse += t.speed;
            if (t.pulse > 1) t.pulse = 0;
            var px, py, s;
            if (t.pulse < .5) {
              s = t.pulse / .5;
              px = t.x1 + (t.bx - t.x1) * s; py = t.y1 + (t.by - t.y1) * s;
            } else {
              s = (t.pulse - .5) / .5;
              px = t.bx + (t.x2 - t.bx) * s; py = t.by + (t.y2 - t.by) * s;
            }
            ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff'; ctx.globalAlpha = .55;
            ctx.shadowBlur = 8; ctx.shadowColor = t.color + '1)';
            ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
          });
          requestAnimationFrame(loop);
        }
  
        resize(); loop();
        window.addEventListener('resize', resize);
      })();
  
      /* ── Scroll reveal — columns ── */
      var colObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('bctf4-vis'); colObs.unobserve(e.target); }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('#bctf4-footer .bctf4-col').forEach(function (el) { colObs.observe(el); });
  
      /* ── Animated count-up — stats ── */
      var statObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          statObs.unobserve(e.target);
          var el     = e.target;
          var target = parseFloat(el.dataset.f4Target);
          var suffix = el.dataset.f4Suffix || '';
          var dec    = parseInt(el.dataset.f4Dec || '0');
          var dur    = 1600, t0 = performance.now();
          (function tick(now) {
            var p    = Math.min((now - t0) / dur, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            el.textContent = (ease * target).toFixed(dec) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          })(performance.now());
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('#bctf4-footer [data-f4-target]').forEach(function (el) { statObs.observe(el); });
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFooter);
    } else {
      initFooter();
    }
  
  })();