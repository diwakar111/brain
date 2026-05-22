
   (function () {
    "use strict";
  
    function ready(fn) {
      if (document.readyState !== "loading") fn();
      else document.addEventListener("DOMContentLoaded", fn);
    }
  
    ready(function () {
  
      /* ====================================================
         1. INJECT CSS
      ==================================================== */
      var style = document.createElement("style");
      style.textContent = `
  
        /* ── Scroll progress bar ── */
        #bca-scroll-bar {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          width: 0%;
          background: linear-gradient(90deg, #00e5ff, #7b2fff, #ff2d9b);
          z-index: 10001;
          pointer-events: none;
          box-shadow: 0 0 8px rgba(0,229,255,0.6);
          transition: width 0.1s linear;
        }
  
        /* ── Hero canvas ── */
        #bca-hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.5;
        }
        .bcp-hero-content { position: relative; z-index: 2; }
        .bcp-hero { position: relative; overflow: hidden; }
  
        /* ── Hero text entrance ── */
        .bca-hero-anim .bcp-hero-eyebrow {
          opacity: 0;
          transform: translateY(-16px);
          animation: bcaFadeDown 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
        }
        .bca-hero-anim .bcp-hero-h1 {
          opacity: 0;
          transform: translateY(24px);
          animation: bcaFadeUp 1s cubic-bezier(0.22,1,0.36,1) 0.55s forwards;
        }
        .bca-hero-anim .bcp-hero-sub {
          opacity: 0;
          transform: translateY(16px);
          animation: bcaFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.8s forwards;
        }
        .bca-hero-anim .bcp-hero-chip {
          opacity: 0;
          transform: scale(0.85) translateY(10px);
          animation: bcaChipIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .bca-hero-anim .bcp-hero-chip:nth-child(1) { animation-delay: 1.05s; }
        .bca-hero-anim .bcp-hero-chip:nth-child(2) { animation-delay: 1.15s; }
        .bca-hero-anim .bcp-hero-chip:nth-child(3) { animation-delay: 1.25s; }
        .bca-hero-anim .bcp-hero-chip:nth-child(4) { animation-delay: 1.35s; }
        .bca-hero-anim .bcp-hero-chip:nth-child(5) { animation-delay: 1.45s; }
  
        @keyframes bcaFadeDown { to { opacity:1; transform:translateY(0); } }
        @keyframes bcaFadeUp   { to { opacity:1; transform:translateY(0); } }
        @keyframes bcaChipIn   { to { opacity:1; transform:scale(1) translateY(0); } }
  
        /* ── Extra hero blob ── */
        .bca-hero-blob-3 {
          position: absolute;
          width: clamp(120px,25vw,300px);
          height: clamp(120px,25vw,300px);
          top: 38%; left: 42%;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          background: rgba(255,45,155,0.07);
          animation: bcpBlob 22s ease-in-out infinite 4s;
          z-index: 0;
        }
  
        /* ── Stat cards scroll-in ── */
        .bca-stat-hidden {
          opacity: 0 !important;
          transform: translateY(22px) scale(0.96) !important;
        }
        .bcp-stat-card {
          transition: transform 0.55s cubic-bezier(0.34,1.46,0.64,1),
                      box-shadow 0.3s ease,
                      opacity 0.55s ease !important;
        }
        .bcp-stat-card:hover {
          transform: translateY(-6px) scale(1.02) !important;
          box-shadow: 0 16px 48px rgba(0,185,204,0.18),
                      0 0 0 1.5px rgba(0,185,204,0.25) !important;
        }
  
        /* ── Trust card scan-line hover ── */
        .bcp-trust-card { overflow: hidden; position: relative; }
        .bcp-trust-card::after {
          content: '';
          position: absolute;
          top: -100%; left: 0; right: 0;
          height: 100%;
          background: linear-gradient(to bottom,
            rgba(255,255,255,0) 0%,
            rgba(0,185,204,0.05) 50%,
            rgba(255,255,255,0) 100%);
          transition: top 0.5s ease;
          pointer-events: none;
        }
        .bcp-trust-card:hover::after { top: 100%; }
        .bcp-trust-icon-wrap {
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
        }
        .bcp-trust-card:hover .bcp-trust-icon-wrap {
          transform: rotate(8deg) scale(1.12);
          box-shadow: 0 8px 24px rgba(0,185,204,0.2);
        }
  
        /* ── Diff card shimmer ── */
        .bcp-diff-card { position: relative; overflow: hidden; }
        .bcp-diff-card::after {
          content: '';
          position: absolute;
          top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg,
            transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
          pointer-events: none;
          z-index: 0;
        }
        .bcp-diff-card:hover::after { left: 130%; }
        .bcp-diff-icon {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
        }
        .bcp-diff-card:hover .bcp-diff-icon { transform: rotate(-8deg) scale(1.15); }
  
        /* ── Leader pill spring ── */
        .bcp-leader-pill {
          transition: background 0.25s, border-color 0.25s,
                      transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
          cursor: default;
        }
        .bcp-leader-pill:hover {
          background: rgba(0,185,204,0.16) !important;
          border-color: rgba(0,185,204,0.5) !important;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 18px rgba(0,185,204,0.14);
        }
  
        /* ── Orbit rings ── */
        .bcp-leader-photo-wrap { position: relative; }
        .bca-orbit-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          animation: bcaOrbit linear infinite;
        }
        .bca-orbit-ring:nth-child(odd) {
          width: 115%; height: 115%;
          animation-duration: 12s;
          border: 1px dashed rgba(0,185,204,0.22);
        }
        .bca-orbit-ring:nth-child(even) {
          width: 132%; height: 132%;
          animation-duration: 20s;
          animation-direction: reverse;
          border: 1px dashed rgba(123,47,255,0.15);
        }
        .bca-orbit-ring::after {
          content: '';
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00b8cc;
          box-shadow: 0 0 8px #00b8cc;
          top: -3px; left: calc(50% - 3px);
        }
        .bca-orbit-ring:nth-child(even)::after {
          background: #7b2fff; box-shadow: 0 0 8px #7b2fff;
          top: auto; bottom: -3px; left: auto; right: calc(50% - 3px);
        }
        @keyframes bcaOrbit {
          from { transform: translate(-50%,-50%) rotate(0deg);   }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
  
        /* ── Timeline glowing axis ── */
        .bcp-timeline { position: relative; }
        .bcp-timeline::after {
          content: '';
          position: absolute;
          left: 10px; top: 0;
          width: 2px; height: 0%;
          background: linear-gradient(to bottom, #00b8cc, #7b2fff);
          box-shadow: 0 0 8px rgba(0,185,204,0.4);
          border-radius: 2px;
          transition: height 2s cubic-bezier(0.22,1,0.36,1);
          z-index: 2;
          pointer-events: none;
        }
        .bca-line-active::after { height: 100%; }
  
        /* ── Timeline dot pop ── */
        .bcp-tl-item.bcp-vis .bcp-tl-dot {
          animation: bcaDotPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes bcaDotPop {
          0%   { transform: scale(0);   }
          60%  { transform: scale(1.4); }
          100% { transform: scale(1);   }
        }
  
        /* ── Pstat slide-in ── */
        .bca-pstat-hidden {
          opacity: 0 !important;
          transform: translateX(-18px) !important;
        }
        .bcp-pstat {
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1),
                      background 0.25s, border-color 0.25s !important;
        }
        .bcp-pstat-icon {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        }
        .bcp-pstat:hover .bcp-pstat-icon {
          transform: scale(1.18) rotate(-6deg);
          box-shadow: 0 6px 20px rgba(0,185,204,0.3);
        }
  
        /* ── Floating particles ── */
        .bca-float-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: bcaFloatUp linear infinite;
          z-index: 0;
        }
        @keyframes bcaFloatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-100px) translateX(var(--dx,20px)); opacity: 0; }
        }
  
        /* ── CTA floating icons ── */
        .bca-cta-icon {
          position: absolute;
          pointer-events: none;
          color: rgba(0,229,255,0.15);
          animation: bcaIconRise ease-in-out infinite;
          z-index: 1;
        }
        @keyframes bcaIconRise {
          0%   { opacity:0; transform: translateY(20px) scale(0.8);   }
          15%  { opacity:0.7; }
          85%  { opacity:0.25; }
          100% { opacity:0; transform: translateY(-70px) scale(1.2); }
        }
  
        /* ── CTA pulse ring ── */
        .bca-cta-ring {
          position: absolute;
          inset: -5px;
          border-radius: 50px;
          border: 2px solid rgba(0,185,204,0.4);
          opacity: 0;
          animation: bcaRingPulse 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes bcaRingPulse {
          0%   { opacity:0; transform:scale(1);    }
          50%  { opacity:1; transform:scale(1.04); }
          100% { opacity:0; transform:scale(1.1);  }
        }
  
        /* ── Logo chip hover ── */
        .bcp-logo-chip {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.25s, border-color 0.25s !important;
        }
        .bcp-logo-chip:hover {
          transform: translateY(-5px) scale(1.05) !important;
          box-shadow: 0 10px 28px rgba(0,185,204,0.18) !important;
          border-color: rgba(0,185,204,0.4) !important;
        }
  
        /* ── Section title underline ── */
        .bcp-title span { position: relative; display: inline; }
        .bcp-title span::after {
          content: '';
          position: absolute;
          left: 0; bottom: -3px;
          height: 3px; width: 0%;
          background: linear-gradient(90deg, #00b8cc, #7b2fff);
          border-radius: 2px;
          transition: width 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s;
        }
        .bca-title-vis .bcp-title span::after { width: 100%; }
  
        /* ── Reduce motion ── */
        @media (prefers-reduced-motion: reduce) {
          .bca-hero-anim .bcp-hero-eyebrow,
          .bca-hero-anim .bcp-hero-h1,
          .bca-hero-anim .bcp-hero-sub,
          .bca-hero-anim .bcp-hero-chip,
          .bca-orbit-ring, .bca-hero-blob-3 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .bca-stat-hidden, .bca-pstat-hidden {
            opacity: 1 !important;
            transform: none !important;
          }
        }
  
        @media (max-width: 600px) {
          .bca-orbit-ring { display: none; }
          #bca-hero-canvas { opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);
  
  
      /* ====================================================
         2. SCROLL PROGRESS BAR
      ==================================================== */
      var bar = document.createElement("div");
      bar.id = "bca-scroll-bar";
      document.body.prepend(bar);
      window.addEventListener("scroll", function () {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
      }, { passive: true });
  
  
      /* ====================================================
         3. HERO — CANVAS + TEXT ENTRANCE
      ==================================================== */
      var hero = document.querySelector(".bcp-hero");
      if (hero) {
        var b3 = document.createElement("div");
        b3.className = "bca-hero-blob-3";
        hero.prepend(b3);
  
        if (hero.querySelector(".bcp-hero-content")) {
          hero.classList.add("bca-hero-anim");
        }
  
        var cv = document.createElement("canvas");
        cv.id = "bca-hero-canvas";
        hero.prepend(cv);
        var ctx = cv.getContext("2d");
        var W, H, traces = [], nodes = [], pkts = [], frame = 0;
  
        function resizeHero() {
          var r = hero.getBoundingClientRect();
          var d = window.devicePixelRatio || 1;
          W = cv.width  = r.width  * d;
          H = cv.height = r.height * d;
          cv.style.width  = r.width  + "px";
          cv.style.height = r.height + "px";
          ctx.setTransform(1,0,0,1,0,0);
          ctx.scale(d,d);
          buildHeroScene(r.width, r.height);
        }
  
        function buildHeroScene(w, h) {
          traces = []; nodes = [];
          var gx=58, gy=52, cols=Math.ceil(w/gx), rows=Math.ceil(h/gy);
          for (var c=0;c<cols;c++) {
            for (var r=0;r<rows;r++) {
              if (Math.random()>0.52) continue;
              var x1=c*gx+Math.random()*18, y1=r*gy+Math.random()*14;
              var horiz=Math.random()>0.5, len=18+Math.random()*38;
              traces.push({
                x1:x1, y1:y1,
                x2:horiz?x1+len:x1, y2:horiz?y1:y1+len,
                col:Math.random()>0.5?"rgba(0,80,120,":"rgba(60,20,140,",
                op:0.06+Math.random()*0.13,
              });
            }
          }
          [[0.5,0.52],[0.2,0.24],[0.78,0.2],[0.12,0.7],[0.85,0.64],
           [0.38,0.14],[0.62,0.82],[0.26,0.55],[0.74,0.46],[0.5,0.86]]
          .forEach(function(p,i){
            nodes.push({
              x:w*p[0],y:h*p[1],
              r:i===0?5:2.5+Math.random()*2,
              main:i===0,
              col:i===0?"#005a8a":(Math.random()>0.5?"#005a8a":"#4a1a9e"),
              ph:Math.random()*Math.PI*2,
            });
          });
        }
  
        function heroLoop() {
          var d=window.devicePixelRatio||1, w=W/d, h=H/d;
          ctx.clearRect(0,0,w,h);
  
          traces.forEach(function(t){
            ctx.beginPath(); ctx.moveTo(t.x1,t.y1); ctx.lineTo(t.x2,t.y2);
            ctx.strokeStyle=t.col+t.op+")"; ctx.lineWidth=1; ctx.stroke();
            ctx.beginPath(); ctx.arc(t.x1,t.y1,1.5,0,Math.PI*2);
            ctx.fillStyle=t.col+(t.op*1.4)+")"; ctx.fill();
            ctx.beginPath(); ctx.arc(t.x2,t.y2,1.5,0,Math.PI*2); ctx.fill();
          });
  
          var hq=nodes[0];
          nodes.slice(1).forEach(function(n){
            var g=ctx.createLinearGradient(hq.x,hq.y,n.x,n.y);
            g.addColorStop(0,"rgba(0,80,120,0.2)");
            g.addColorStop(1,"rgba(60,20,140,0.1)");
            ctx.beginPath(); ctx.moveTo(hq.x,hq.y); ctx.lineTo(n.x,n.y);
            ctx.strokeStyle=g; ctx.lineWidth=1;
            ctx.setLineDash([3,7]); ctx.stroke(); ctx.setLineDash([]);
          });
  
          if (frame%55===0&&nodes.length>1) {
            var n=nodes[1+Math.floor(Math.random()*(nodes.length-1))];
            pkts.push({x:hq.x,y:hq.y,tx:n.x,ty:n.y,t:0,col:n.col});
          }
          var done=[];
          pkts.forEach(function(p){
            p.t+=0.012;
            var px=p.x+(p.tx-p.x)*p.t, py=p.y+(p.ty-p.y)*p.t;
            ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
            ctx.fillStyle=p.col; ctx.globalAlpha=(1-p.t)*0.85;
            ctx.shadowBlur=10; ctx.shadowColor=p.col;
            ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
            if(p.t>=1) done.push(p);
          });
          done.forEach(function(p){pkts.splice(pkts.indexOf(p),1);});
  
          nodes.forEach(function(n){
            n.ph+=0.035;
            if(n.main){
              var pr=(Math.sin(n.ph)+1)*7+5;
              ctx.beginPath(); ctx.arc(n.x,n.y,pr,0,Math.PI*2);
              ctx.strokeStyle="rgba(0,80,120,0.25)"; ctx.lineWidth=1; ctx.stroke();
            }
            ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
            ctx.fillStyle=n.col; ctx.globalAlpha=0.5;
            ctx.shadowBlur=n.main?16:8; ctx.shadowColor=n.col;
            ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
          });
  
          frame++;
          requestAnimationFrame(heroLoop);
        }
  
        resizeHero(); heroLoop();
        var rt;
        window.addEventListener("resize",function(){
          clearTimeout(rt); rt=setTimeout(resizeHero,140);
        },{passive:true});
      }
  
  
      /* ====================================================
         4. ABOUT — FLOATING PARTICLES
      ==================================================== */
      var about = document.querySelector(".bcp-about");
      if (about) {
        for (var i=0;i<12;i++) {
          var fp=document.createElement("div");
          fp.className="bca-float-particle";
          var sz=3+Math.random()*5, dur=9+Math.random()*10;
          Object.assign(fp.style,{
            width:sz+"px", height:sz+"px",
            left:(Math.random()*96)+"%",
            bottom:(Math.random()*30)+"%",
            background:Math.random()>0.5
              ?"rgba(0,185,204,0.45)":"rgba(123,47,255,0.35)",
            animationDuration:dur+"s",
            animationDelay:"-"+(Math.random()*dur)+"s",
            "--dx":((Math.random()-0.5)*60)+"px",
          });
          about.appendChild(fp);
        }
      }
  
  
      /* ====================================================
         5. LEADER ORBIT RINGS
      ==================================================== */
      var photoWrap=document.querySelector(".bcp-leader-photo-wrap");
      if (photoWrap) {
        for (var ri=0;ri<2;ri++){
          var ring=document.createElement("div");
          ring.className="bca-orbit-ring";
          photoWrap.appendChild(ring);
        }
      }
  
  
      /* ====================================================
         6. STAT CARDS
      ==================================================== */
      var statCards=document.querySelectorAll(".bcp-stat-card");
      if (statCards.length) {
        statCards.forEach(function(c){c.classList.add("bca-stat-hidden");});
        var sObs=new IntersectionObserver(function(entries){
          entries.forEach(function(e){
            if(!e.isIntersecting) return;
            var idx=Array.from(statCards).indexOf(e.target);
            setTimeout(function(){
              e.target.classList.remove("bca-stat-hidden");
            }, idx*100);
            sObs.unobserve(e.target);
          });
        },{threshold:0.15});
        statCards.forEach(function(c){sObs.observe(c);});
      }
  
  
      /* ====================================================
         7. PSTATS
      ==================================================== */
      var pstats=document.querySelectorAll(".bcp-pstat");
      if (pstats.length) {
        pstats.forEach(function(p){p.classList.add("bca-pstat-hidden");});
        var psObs=new IntersectionObserver(function(entries){
          entries.forEach(function(e){
            if(!e.isIntersecting) return;
            var idx=Array.from(pstats).indexOf(e.target);
            setTimeout(function(){
              e.target.classList.remove("bca-pstat-hidden");
            }, idx*100);
            psObs.unobserve(e.target);
          });
        },{threshold:0.1});
        pstats.forEach(function(p){psObs.observe(p);});
      }
  
  
      /* ====================================================
         8. TIMELINE LINE
      ==================================================== */
      var tl=document.querySelector(".bcp-timeline");
      if (tl) {
        var tlObs=new IntersectionObserver(function(entries){
          if(entries[0].isIntersecting){
            tl.classList.add("bca-line-active");
            tlObs.disconnect();
          }
        },{threshold:0.05});
        tlObs.observe(tl);
      }
  
  
      /* ====================================================
         9. SECTION TITLE UNDERLINE
      ==================================================== */
      document.querySelectorAll(".bcp-section").forEach(function(sec){
        if(!sec.querySelector(".bcp-title")) return;
        var o=new IntersectionObserver(function(en){
          if(en[0].isIntersecting){
            en[0].target.classList.add("bca-title-vis");
            o.disconnect();
          }
        },{threshold:0.1});
        o.observe(sec);
      });
  
  
      /* ====================================================
         10. CTA ICONS + PULSE RING
      ==================================================== */
      var ctaStrip=document.querySelector(".bcp-cta-strip");
      if (ctaStrip) {
        var icons=["fa-microchip","fa-wifi","fa-bolt","fa-server",
                   "fa-satellite-dish","fa-memory","fa-code-branch","fa-circuit-board"];
        for (var ci=0;ci<10;ci++){
          var ico=document.createElement("i");
          ico.className="fa-solid "+icons[Math.floor(Math.random()*icons.length)]+" bca-cta-icon";
          var idur=7+Math.random()*8;
          Object.assign(ico.style,{
            left:(5+Math.random()*90)+"%",
            bottom:(Math.random()*50)+"px",
            fontSize:(0.65+Math.random()*0.9)+"rem",
            animationDuration:idur+"s",
            animationDelay:"-"+(Math.random()*idur)+"s",
          });
          ctaStrip.appendChild(ico);
        }
        var ctaBtn=ctaStrip.querySelector(".bcp-cta-primary");
        if (ctaBtn){
          var pRing=document.createElement("span");
          pRing.className="bca-cta-ring";
          ctaBtn.appendChild(pRing);
        }
      }
  
  
      /* ====================================================
         11. DIFF CARDS 3D TILT
      ==================================================== */
      if (window.innerWidth>=768) {
        document.querySelectorAll(".bcp-diff-card").forEach(function(card){
          card.addEventListener("mousemove",function(e){
            var r=card.getBoundingClientRect();
            var dx=((e.clientX-r.left)/r.width -0.5)*10;
            var dy=((e.clientY-r.top) /r.height-0.5)*8;
            card.style.transform="translateY(-4px) rotateY("+dx+"deg) rotateX("+(-dy)+"deg)";
          });
          card.addEventListener("mouseleave",function(){
            card.style.transform="";
          });
        });
      }
  
  
      /* ====================================================
         12. LOGO TOUCH
      ==================================================== */
      var lr=document.getElementById("bcpLogosRow");
      if (lr) {
        lr.addEventListener("touchstart",function(){
          lr.style.animationPlayState="paused";
        },{passive:true});
        lr.addEventListener("touchend",function(){
          lr.style.animationPlayState="running";
        },{passive:true});
      }
  
  
      /* ====================================================
         13. PARALLAX BLOBS
      ==================================================== */
      if (!window.matchMedia("(prefers-reduced-motion:reduce)").matches
          && window.innerWidth>=768) {
        var blobs=document.querySelectorAll(
          ".bcp-hero-blob-1,.bcp-hero-blob-2,.bca-hero-blob-3");
        window.addEventListener("scroll",function(){
          var y=window.scrollY;
          blobs.forEach(function(b,i){
            var f=i===0?0.1:i===1?-0.06:0.04;
            b.style.transform="translate(0,"+y*f+"px)";
          });
        },{passive:true});
      }
  
    }); /* end ready */
  })();


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";
  
    /* ─── Global helpers ──────────────────────────────────────── */
    const REDUCED = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const IS_MOBILE = window.innerWidth < 600;
  
    /** Inject a CSS string once */
    function injectCSS(id, css) {
      if (document.getElementById(id)) return;
      const s = document.createElement("style");
      s.id = id;
      s.textContent = css;
      document.head.appendChild(s);
    }
  
    /** Create a full-bleed canvas inside a relatively-positioned section */
    function makeCanvas(id, section) {
      if (document.getElementById(id)) return null;
      const cv = document.createElement("canvas");
      cv.id = id;
      cv.className = "bcbg-canvas";
      section.style.position = "relative";
      section.insertBefore(cv, section.firstChild);
      return cv;
    }
  
    /** Resize a canvas to its parent's physical size (DPR-aware) */
    function fitCanvas(cv) {
      const r = cv.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cv.width  = Math.round(r.width  * dpr);
      cv.height = Math.round(r.height * dpr);
      cv.style.width  = r.width  + "px";
      cv.style.height = r.height + "px";
      const ctx = cv.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      return { ctx, w: r.width, h: r.height };
    }
  
    /** RAF loop wrapper that auto-pauses when off-screen */
    function createLoop(cv, drawFn) {
      let raf = null;
      let visible = false;
  
      const obs = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible && !raf) tick();
      }, { threshold: 0 });
      obs.observe(cv);
  
      function tick() {
        if (!visible) { raf = null; return; }
        drawFn();
        raf = requestAnimationFrame(tick);
      }
    }
  
    /** Debounced resize */
    function onResize(fn) {
      let t;
      window.addEventListener("resize", () => {
        clearTimeout(t);
        t = setTimeout(fn, 180);
      }, { passive: true });
    }
  
    /* ─── Shared CSS ─────────────────────────────────────────── */
    injectCSS("bcbg-base-css", `
      .bcbg-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }
      /* Make sure section direct children (not the canvas) sit above */
      .bcp-about-inner,
      .bcp-leadership-inner,
      .bcp-achievements-inner,
      .bcp-timeline-inner,
      .bcp-diff-inner,
      .bcp-cta-strip-inner {
        position: relative;
        z-index: 1;
      }
    `);
  
    /* ════════════════════════════════════════════════════════════
       SECTION 1 — ABOUT + STATS
       Subtle drifting neural-net (nodes + edges) in light cyan/violet
    ════════════════════════════════════════════════════════════ */
    (function aboutAnim() {
      const sec = document.querySelector(".bcp-about");
      if (!sec) return;
      const cv = makeCanvas("bcbg-about", sec);
      if (!cv) return;
  
      const COUNT = IS_MOBILE ? 18 : 32;
      let pts = [], W = 0, H = 0, ctx;
  
      function init() {
        ({ ctx, w: W, h: H } = fitCanvas(cv));
        pts = Array.from({ length: COUNT }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.5 + Math.random() * 2,
          c: Math.random() > 0.5 ? "rgba(0,185,204," : "rgba(123,47,255,",
          a: 0.18 + Math.random() * 0.22,
        }));
      }
  
      function draw() {
        ctx.clearRect(0, 0, W, H);
        const LINK = IS_MOBILE ? 90 : 130;
  
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        });
  
        // edges
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < LINK) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `rgba(0,185,204,${0.06 * (1 - d / LINK)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
  
        // nodes
        pts.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.c + p.a + ")";
          ctx.fill();
        });
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       SECTION 2 — LEADERSHIP
       Soft concentric pulse rings emanating from centre-left
       + slowly drifting mesh grid lines
    ════════════════════════════════════════════════════════════ */
    (function leaderAnim() {
      const sec = document.querySelector(".bcp-leadership");
      if (!sec) return;
      const cv = makeCanvas("bcbg-leadership", sec);
      if (!cv) return;
  
      let W = 0, H = 0, ctx, frame = 0;
      const rings = Array.from({ length: 5 }, (_, i) => ({
        r: 60 + i * 55,
        phase: i * (Math.PI * 2 / 5),
      }));
  
      function init() {
        ({ ctx, w: W, h: H } = fitCanvas(cv));
      }
  
      function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;
        const t = frame * 0.008;
  
        // soft mesh grid
        const STEP = IS_MOBILE ? 50 : 70;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= W; x += STEP) {
          const ox = Math.sin(t + x * 0.015) * 4;
          ctx.beginPath();
          ctx.moveTo(x + ox, 0);
          ctx.lineTo(x + ox, H);
          ctx.strokeStyle = "rgba(0,185,204,0.04)";
          ctx.stroke();
        }
        for (let y = 0; y <= H; y += STEP) {
          const oy = Math.cos(t + y * 0.015) * 4;
          ctx.beginPath();
          ctx.moveTo(0, y + oy);
          ctx.lineTo(W, y + oy);
          ctx.strokeStyle = "rgba(123,47,255,0.03)";
          ctx.stroke();
        }
  
        // pulse rings from left-centre (near photo)
        const cx = IS_MOBILE ? W * 0.5 : W * 0.17;
        const cy = H * 0.5;
        rings.forEach(ring => {
          const phase = ((t * 0.6 + ring.phase) % (Math.PI * 2));
          const progress = (Math.sin(phase) + 1) / 2; // 0..1
          const radius = ring.r + progress * 35;
          const alpha  = 0.07 * (1 - progress);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,185,204,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       SECTION 3 — ACHIEVEMENTS (Trust cards + Logos)
       Floating orbs + subtle radial glow behind trust cards
    ════════════════════════════════════════════════════════════ */
    (function achieveAnim() {
      const sec = document.querySelector(".bcp-achievements");
      if (!sec) return;
      const cv = makeCanvas("bcbg-achieve", sec);
      if (!cv) return;
  
      const ORB_COUNT = IS_MOBILE ? 6 : 10;
      let orbs = [], W = 0, H = 0, ctx, frame = 0;
  
      function mkOrb(w, h) {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: IS_MOBILE ? 30 + Math.random() * 40 : 50 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          hue: Math.random() > 0.5 ? "0,185,204" : "123,47,255",
          phase: Math.random() * Math.PI * 2,
        };
      }
  
      function init() {
        ({ ctx, w: W, h: H } = fitCanvas(cv));
        orbs = Array.from({ length: ORB_COUNT }, () => mkOrb(W, H));
      }
  
      function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;
        const t = frame * 0.01;
  
        orbs.forEach(o => {
          o.x += o.vx; o.y += o.vy;
          if (o.x < -o.r) o.x = W + o.r;
          if (o.x > W + o.r) o.x = -o.r;
          if (o.y < -o.r) o.y = H + o.r;
          if (o.y > H + o.r) o.y = -o.r;
  
          const pulse = 0.8 + Math.sin(t + o.phase) * 0.2;
          const rad = o.r * pulse;
          const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rad);
          g.addColorStop(0, `rgba(${o.hue},0.06)`);
          g.addColorStop(1, `rgba(${o.hue},0)`);
          ctx.beginPath();
          ctx.arc(o.x, o.y, rad, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        });
  
        // faint horizontal band sweep
        const sweep = (Math.sin(t * 0.3) + 1) / 2;
        const bandY = H * sweep;
        const bandGrad = ctx.createLinearGradient(0, bandY - 40, 0, bandY + 40);
        bandGrad.addColorStop(0, "rgba(0,185,204,0)");
        bandGrad.addColorStop(0.5, "rgba(0,185,204,0.025)");
        bandGrad.addColorStop(1, "rgba(0,185,204,0)");
        ctx.fillStyle = bandGrad;
        ctx.fillRect(0, bandY - 40, W, 80);
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       SECTION 4 — TIMELINE
       Vertical flowing particles that drift upward along the
       timeline axis, plus circuit trace dots scattered around
    ════════════════════════════════════════════════════════════ */
    (function timelineAnim() {
      const sec = document.querySelector(".bcp-timeline-section");
      if (!sec) return;
      const cv = makeCanvas("bcbg-timeline", sec);
      if (!cv) return;
  
      let W = 0, H = 0, ctx, frame = 0;
      let particles = [], traces = [];
  
      function mkParticle(w, h) {
        return {
          x: 10 + Math.random() * (IS_MOBILE ? w * 0.3 : w * 0.18),
          y: h + Math.random() * h,
          vy: -(0.3 + Math.random() * 0.5),
          a: 0.1 + Math.random() * 0.3,
          r: 1 + Math.random() * 1.5,
          c: Math.random() > 0.5 ? "0,185,204" : "123,47,255",
        };
      }
  
      function mkTrace(w, h) {
        const x = (IS_MOBILE ? w * 0.15 : w * 0.08) + Math.random() * w * 0.7;
        const y = Math.random() * h;
        const horiz = Math.random() > 0.4;
        const len = 18 + Math.random() * 32;
        return {
          x1: x, y1: y,
          x2: horiz ? x + len : x,
          y2: horiz ? y       : y + len,
          c: Math.random() > 0.5 ? "rgba(0,185,204," : "rgba(123,47,255,",
          a: 0.04 + Math.random() * 0.07,
        };
      }
  
      function init() {
        ({ ctx, w: W, h: H } = fitCanvas(cv));
        const pCount = IS_MOBILE ? 20 : 38;
        particles = Array.from({ length: pCount }, () => mkParticle(W, H));
        traces    = Array.from({ length: IS_MOBILE ? 20 : 40 }, () => mkTrace(W, H));
      }
  
      function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;
  
        // static circuit traces
        traces.forEach(t => {
          ctx.beginPath();
          ctx.moveTo(t.x1, t.y1);
          ctx.lineTo(t.x2, t.y2);
          ctx.strokeStyle = t.c + t.a + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          // pad dot
          ctx.beginPath();
          ctx.arc(t.x2, t.y2, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = t.c + (t.a * 1.6) + ")";
          ctx.fill();
        });
  
        // drifting particles
        particles.forEach(p => {
          p.y += p.vy;
          p.a -= 0.0008;
          if (p.y < -10 || p.a <= 0) {
            Object.assign(p, mkParticle(W, H));
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.c},${Math.max(0, p.a)})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = `rgba(${p.c},0.4)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       SECTION 5 — DIFFERENTIATORS
       Diagonal light-beam sweep + subtle hex-dot grid pattern
    ════════════════════════════════════════════════════════════ */
    (function diffAnim() {
      const sec = document.querySelector(".bcp-differentiators");
      if (!sec) return;
      const cv = makeCanvas("bcbg-diff", sec);
      if (!cv) return;
  
      let W = 0, H = 0, ctx, frame = 0;
      let dots = [];
  
      function init() {
        ({ ctx, w: W, h: H } = fitCanvas(cv));
        // pre-compute dot positions on a staggered grid
        dots = [];
        const spacing = IS_MOBILE ? 36 : 48;
        for (let row = 0; row * spacing < H + spacing; row++) {
          for (let col = 0; col * spacing < W + spacing; col++) {
            dots.push({
              x: col * spacing + (row % 2 === 0 ? 0 : spacing / 2),
              y: row * spacing,
              phase: (col + row) * 0.4,
            });
          }
        }
      }
  
      function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;
        const t = frame * 0.012;
  
        // dot grid — each dot pulses gently in & out
        dots.forEach(d => {
          const pulse = (Math.sin(t + d.phase) + 1) / 2; // 0..1
          const alpha = 0.025 + pulse * 0.045;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,185,204,${alpha})`;
          ctx.fill();
        });
  
        // diagonal beam sweep across the section
        const BEAM_PERIOD = 280; // frames per cycle
        const progress = ((frame % BEAM_PERIOD) / BEAM_PERIOD); // 0..1
        const beamX = -W * 0.4 + (W * 1.8) * progress;
  
        const grd = ctx.createLinearGradient(beamX - 60, 0, beamX + 60, H);
        grd.addColorStop(0,   "rgba(0,185,204,0)");
        grd.addColorStop(0.4, "rgba(0,185,204,0.03)");
        grd.addColorStop(0.6, "rgba(123,47,255,0.03)");
        grd.addColorStop(1,   "rgba(123,47,255,0)");
  
        ctx.save();
        ctx.transform(1, 0, -0.4, 1, 0, 0); // skew to make it diagonal
        ctx.fillStyle = grd;
        ctx.fillRect(beamX - 60, 0, 120, H);
        ctx.restore();
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       SECTION 6 — CTA STRIP
       Dark background: animated star-field + wave ripple
       (complements the existing floating icon layer)
    ════════════════════════════════════════════════════════════ */
    (function ctaAnim() {
      const sec = document.querySelector(".bcp-cta-strip");
      if (!sec) return;
      const cv = makeCanvas("bcbg-cta", sec);
      if (!cv) return;
  
      let W = 0, H = 0, ctx, frame = 0;
      let stars = [], waveY = 0;
  
      function init() {
        ({ ctx, w: W, h: H } = fitCanvas(cv));
        waveY = H * 0.55;
        const sCount = IS_MOBILE ? 40 : 80;
        stars = Array.from({ length: sCount }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.4 + Math.random() * 1.1,
          a: 0.1 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          speed: 0.006 + Math.random() * 0.012,
        }));
      }
  
      function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;
        const t = frame * 0.018;
  
        // twinkling stars
        stars.forEach(s => {
          const twinkle = s.a * (0.5 + Math.sin(t * s.speed / 0.018 + s.phase) * 0.5);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
          ctx.fill();
        });
  
        // sine wave
        const WAVES = 2;
        for (let w = 0; w < WAVES; w++) {
          const amp   = 12 - w * 4;
          const freq  = 0.008 + w * 0.003;
          const speed = t * (0.6 + w * 0.3);
          const alpha = 0.05 - w * 0.015;
          ctx.beginPath();
          ctx.moveTo(0, waveY);
          for (let x = 0; x <= W; x += 3) {
            ctx.lineTo(x, waveY + Math.sin(x * freq + speed) * amp);
          }
          ctx.lineTo(W, H); ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fillStyle = `rgba(0,185,204,${alpha})`;
          ctx.fill();
        }
  
        // centre radial glow
        const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*0.55);
        grd.addColorStop(0, "rgba(0,185,204,0.05)");
        grd.addColorStop(1, "rgba(0,185,204,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       BONUS — ABOUT section: floating micro-circuit traces
       (complements the neural-net added above — second canvas layer)
    ════════════════════════════════════════════════════════════ */
    (function aboutCircuit() {
      const sec = document.querySelector(".bcp-about");
      if (!sec) return;
      // NOTE: re-use same canvas — we'll draw traces on top in same draw call
      // Actually create a second canvas with a higher z-index
      const cv = document.createElement("canvas");
      cv.id   = "bcbg-about-circuit";
      cv.className = "bcbg-canvas";
      cv.style.zIndex = "0";
      cv.style.opacity = "0.7";
      sec.insertBefore(cv, sec.children[1] || null); // behind content
  
      let W = 0, H = 0, ctx;
      let traces = [];
  
      function mkTrace(w, h) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const horiz = Math.random() > 0.45;
        const len   = 14 + Math.random() * 28;
        return {
          x1: x, y1: y,
          x2: horiz ? x + len : x,
          y2: horiz ? y       : y + len,
          c: Math.random() > 0.5 ? "rgba(0,185,204," : "rgba(123,47,255,",
          a: 0.04 + Math.random() * 0.06,
          pulse: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.012,
        };
      }
  
      function init() {
        const r = cv.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        cv.width  = Math.round(r.width  * dpr);
        cv.height = Math.round(r.height * dpr);
        cv.style.width  = r.width  + "px";
        cv.style.height = r.height + "px";
        ctx = cv.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        W = r.width; H = r.height;
        const count = IS_MOBILE ? 14 : 28;
        traces = Array.from({ length: count }, () => mkTrace(W, H));
      }
  
      let frame = 0;
      function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;
        const t = frame;
        traces.forEach(tr => {
          const a = tr.a * (0.5 + Math.sin(t * tr.speed + tr.pulse) * 0.5);
          ctx.beginPath();
          ctx.moveTo(tr.x1, tr.y1);
          ctx.lineTo(tr.x2, tr.y2);
          ctx.strokeStyle = tr.c + a + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(tr.x1, tr.y1, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = tr.c + (a * 1.8) + ")";
          ctx.fill();
        });
      }
  
      init();
      if (!REDUCED) createLoop(cv, draw);
      onResize(init);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       STAT CARD — number counter shimmer
       Adds a subtle shimmer flash when stat cards count up
    ════════════════════════════════════════════════════════════ */
    (function statShimmer() {
      injectCSS("bcbg-stat-shimmer", `
        @keyframes bcbgStatShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .bcp-stat-num.bcbg-shimmer {
          background: linear-gradient(
            90deg,
            #00b8cc 20%,
            #ffffff 40%,
            #7b2fff 60%,
            #00b8cc 80%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bcbgStatShimmer 1.4s linear 1;
        }
      `);
  
      if (REDUCED) return;
  
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          observer.unobserve(e.target);
          // slight delay so count-up starts, then apply shimmer
          setTimeout(() => {
            e.target.classList.add("bcbg-shimmer");
            e.target.addEventListener("animationend", () => {
              e.target.classList.remove("bcbg-shimmer");
            }, { once: true });
          }, 400);
        });
      }, { threshold: 0.5 });
  
      document.querySelectorAll(".bcp-stat-num").forEach(el => observer.observe(el));
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       TRUST CARD — entry stagger + icon bounce
    ════════════════════════════════════════════════════════════ */
    (function trustCardEntry() {
      injectCSS("bcbg-trust-entry", `
        .bcp-trust-card.bcbg-trust-hidden {
          opacity: 0;
          transform: translateY(18px) scale(0.97);
        }
        .bcp-trust-card {
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.46,0.64,1) !important;
        }
        @keyframes bcbgIconBounce {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.18) rotate(-6deg); }
          65%  { transform: scale(0.94) rotate(4deg); }
          100% { transform: scale(1); }
        }
        .bcp-trust-icon-wrap.bcbg-bounce {
          animation: bcbgIconBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
      `);
  
      if (REDUCED) return;
  
      const cards = document.querySelectorAll(".bcp-trust-card");
      cards.forEach(c => c.classList.add("bcbg-trust-hidden"));
  
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const idx = Array.from(cards).indexOf(e.target);
          setTimeout(() => {
            e.target.classList.remove("bcbg-trust-hidden");
            const icon = e.target.querySelector(".bcp-trust-icon-wrap");
            if (icon) {
              icon.classList.add("bcbg-bounce");
              icon.addEventListener("animationend", () => {
                icon.classList.remove("bcbg-bounce");
              }, { once: true });
            }
          }, idx * 120);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.15 });
  
      cards.forEach(c => obs.observe(c));
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       DIFFERENTIATOR CARDS — stagger + border glow on entry
    ════════════════════════════════════════════════════════════ */
    (function diffCardEntry() {
      injectCSS("bcbg-diff-entry", `
        .bcp-diff-card.bcbg-diff-hidden {
          opacity: 0;
          transform: translateY(22px);
        }
        .bcp-diff-card {
          transition: opacity 0.6s ease,
                      transform 0.6s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.3s ease,
                      box-shadow 0.3s ease !important;
        }
        @keyframes bcbgBorderPulse {
          0%   { box-shadow: 0 0 0   0   rgba(0,185,204,0);    }
          40%  { box-shadow: 0 0 0   6px rgba(0,185,204,0.15); }
          100% { box-shadow: 0 0 0   0   rgba(0,185,204,0);    }
        }
        .bcp-diff-card.bcbg-diff-glow {
          animation: bcbgBorderPulse 0.7s ease both;
        }
      `);
  
      if (REDUCED) return;
  
      const cards = document.querySelectorAll(".bcp-diff-card");
      cards.forEach(c => c.classList.add("bcbg-diff-hidden"));
  
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const idx = Array.from(cards).indexOf(e.target);
          setTimeout(() => {
            e.target.classList.remove("bcbg-diff-hidden");
            e.target.classList.add("bcbg-diff-glow");
            e.target.addEventListener("animationend", () => {
              e.target.classList.remove("bcbg-diff-glow");
            }, { once: true });
          }, idx * 100);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.12 });
  
      cards.forEach(c => obs.observe(c));
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       TIMELINE ITEMS — left-slide + dot pop (additive to existing)
    ════════════════════════════════════════════════════════════ */
    (function tlExtra() {
      injectCSS("bcbg-tl-extra", `
        @keyframes bcbgTlLineGrow {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        .bcp-tl-item.bcp-vis .bcp-tl-year {
          animation: bcaFadeDown 0.5s ease both;
        }
        .bcp-tl-item.bcp-vis .bcp-tl-title {
          animation: bcaFadeUp 0.55s ease both 0.07s;
        }
        .bcp-tl-item.bcp-vis .bcp-tl-desc {
          animation: bcaFadeUp 0.6s ease both 0.14s;
        }
      `);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       CTA STRIP — gradient text shimmer on H2
    ════════════════════════════════════════════════════════════ */
    (function ctaTextAnim() {
      injectCSS("bcbg-cta-text", `
        @keyframes bcbgGradShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .bcp-cta-strip h2 span {
          background: linear-gradient(
            270deg,
            #00e5ff, #7b2fff, #ff2d9b, #00e5ff
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bcbgGradShift 5s ease infinite;
        }
      `);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       LOGO CHIP — subtle shimmer on the scrolling ticker
    ════════════════════════════════════════════════════════════ */
    (function logoChipAnim() {
      injectCSS("bcbg-logo-chip", `
        @keyframes bcbgChipShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .bcp-logo-chip:hover .bcp-logo-chip-name {
          background: linear-gradient(90deg, #0f1e3d 30%, #00b8cc 50%, #0f1e3d 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bcbgChipShimmer 0.8s linear 1;
        }
      `);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       LEADERSHIP card — soft gradient border breath animation
    ════════════════════════════════════════════════════════════ */
    (function leaderCardBreath() {
      injectCSS("bcbg-leader-breath", `
        @keyframes bcbgBorderBreath {
          0%,100% { border-color: rgba(0,185,204,0.12); }
          50%     { border-color: rgba(0,185,204,0.28); }
        }
        .bcp-leader-card {
          animation: bcbgBorderBreath 4s ease-in-out infinite;
        }
      `);
    })();
  
  
    /* ════════════════════════════════════════════════════════════
       SCROLL PROGRESS — section highlight flash
       When a section scrolls into view its title tag gets a brief
       colour flash to guide the reader's eye
    ════════════════════════════════════════════════════════════ */
    (function tagFlash() {
      injectCSS("bcbg-tag-flash", `
        @keyframes bcbgTagFlash {
          0%   { opacity: 0.4; letter-spacing: 6px; }
          60%  { opacity: 1;   letter-spacing: 4px; }
          100% { opacity: 1;   letter-spacing: 4px; }
        }
        .bcp-tag.bcbg-tag-animate {
          animation: bcbgTagFlash 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
      `);
  
      if (REDUCED) return;
  
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.classList.add("bcbg-tag-animate");
          obs.unobserve(e.target);
        });
      }, { threshold: 0.6 });
  
      document.querySelectorAll(".bcp-tag").forEach(el => obs.observe(el));
    })();
  
  })();