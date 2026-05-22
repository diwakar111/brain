/* ═══════════════════════════════════════════════════════════════
   Landingpage.js  —  BrainChild Technology
   FIX SUMMARY (v2):
   • VisCtrl stop() now correctly kills makeCanvasAnim RAF loops
   • makeCanvasAnim uses a shared token object {alive} so VisCtrl
     can flip it from outside — eliminates duplicate-loop bug
   • All canvas animations capped at 30 FPS (halves CPU load)
   • Tab-hidden correctly pauses every loop
   • Restart on re-entry works reliably
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   VISIBILITY CONTROLLER  (rewritten — now owns the alive token)
───────────────────────────────────────────────────────────────*/
const VisCtrl = (function () {
  // Map: HTMLElement → { startFn, stopFn }
  const registry = new Map();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const rec = registry.get(entry.target);
        if (!rec) return;
        if (entry.isIntersecting) {
          rec.start();
        } else {
          rec.stop();
        }
      });
    },
    { threshold: 0.2 }
  );

  // Pause ALL when tab hidden, resume visible ones when shown
  document.addEventListener("visibilitychange", () => {
    registry.forEach((rec) => {
      if (document.hidden) {
        rec.stop();
      } else {
        // IO will re-fire for visible elements; for currently
        // intersecting ones we need to restart manually
        if (rec.wasIntersecting) rec.start();
      }
    });
  });

  return {
    /**
     * Register a canvas animation with external start/stop control.
     * Returns the token object { alive } that the animation loop
     * should check on every frame.
     *
     * @param {HTMLElement} el       Element to observe
     * @param {Function}    startFn  Called to (re)start the loop
     * @param {Function}    stopFn   Called to kill the loop
     */
    register(el, startFn, stopFn) {
      const rec = {
        start() {
          rec.wasIntersecting = true;
          startFn();
        },
        stop() {
          rec.wasIntersecting = false;
          stopFn();
        },
        wasIntersecting: false,
      };
      registry.set(el, rec);
      io.observe(el);
    },
  };
})();

/* ─────────────────────────────────────────────────────────────
   INTRO OVERLAY  —  show only once per session
───────────────────────────────────────────────────────────────*/
const introOverlay = document.getElementById("introOverlay");
if (introOverlay) {
  if (sessionStorage.getItem("bct_intro_played")) {
    introOverlay.style.display = "none";
    introOverlay.remove();
    document.body.classList.add("no-intro");
  } else {
    sessionStorage.setItem("bct_intro_played", "1");
    setTimeout(() => {
      introOverlay.style.opacity = "0";
      introOverlay.style.pointerEvents = "none";
      setTimeout(() => introOverlay.remove(), 500);
    }, 2500);
  }
}

/* ─────────────────────────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────────────────────────────*/
const cDot  = document.getElementById("cDot");
const cRing = document.getElementById("cRing");
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
(function tickCursor() {
  cDot.style.left  = mx + "px";
  cDot.style.top   = my + "px";
  rx += (mx - rx) * 0.5;
  ry += (my - ry) * 0.5;
  cRing.style.left = rx + "px";
  cRing.style.top  = ry + "px";
  requestAnimationFrame(tickCursor);
})();
document.querySelectorAll("a, button, .bct-drop-card, .mob-acc-card").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cRing.style.transform   = "translate(-50%,-50%) scale(1.7)";
    cRing.style.borderColor = "rgba(0,229,255,.8)";
  });
  el.addEventListener("mouseleave", () => {
    cRing.style.transform   = "translate(-50%,-50%) scale(1)";
    cRing.style.borderColor = "rgba(0,229,255,.45)";
  });
});

/* ─────────────────────────────────────────────────────────────
   2. HERO BACKGROUND PARTICLE CANVAS (always running)
───────────────────────────────────────────────────────────────*/
(function heroParticles() {
  const cvs = document.getElementById("pCanvas");
  if (!cvs) return;
  const ctx = cvs.getContext("2d");
  let W, H, pts = [];

  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const mkP = () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
    r: Math.random() * 1.3 + .3,
    a: Math.random() * .3 + .07,
    c: Math.random() > .5 ? "#00e5ff" : "#7b2fff",
  });
  for (let i = 0; i < 65; i++) pts.push(mkP());

  let lastHeroT = 0;
  const HERO_FPS = 30, HERO_INTERVAL = 1000 / HERO_FPS;

  (function draw(ts) {
    requestAnimationFrame(draw);
    if (ts - lastHeroT < HERO_INTERVAL) return;
    lastHeroT = ts;

    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
        if (d < 95) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = p.c; ctx.globalAlpha = .03 * (1 - d / 95);
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
  })(0);
})();

/* ─────────────────────────────────────────────────────────────
   3. NAVBAR  — sticky dark glass on scroll
───────────────────────────────────────────────────────────────*/
window.addEventListener("scroll", () => {
  document.getElementById("bctNav")
    .classList.toggle("scrolled", window.scrollY > 60);
});

/* ─────────────────────────────────────────────────────────────
   4. DESKTOP DROPDOWN
───────────────────────────────────────────────────────────────*/
document.addEventListener("click", (e) => {
  document.querySelectorAll(".has-drop").forEach((el) => {
    if (!el.contains(e.target)) el.classList.remove("open");
  });
});
document.querySelectorAll(".has-drop > span").forEach((span) => {
  span.addEventListener("click", (e) => {
    e.stopPropagation();
    const li = span.parentElement;
    const wasOpen = li.classList.contains("open");
    document.querySelectorAll(".has-drop").forEach((el) => el.classList.remove("open"));
    if (!wasOpen) li.classList.add("open");
  });
});

/* ─────────────────────────────────────────────────────────────
   5. MOBILE OVERLAY
───────────────────────────────────────────────────────────────*/
document.getElementById("ham").addEventListener("click", () => {
  document.getElementById("mobOverlay").classList.add("open");
});
document.getElementById("mobClose").addEventListener("click", () => {
  document.getElementById("mobOverlay").classList.remove("open");
});
document.querySelectorAll(".mob-link, .mob-acc-card").forEach((a) => {
  a.addEventListener("click", () => {
    document.getElementById("mobOverlay").classList.remove("open");
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document.getElementById("mobOverlay").classList.remove("open");
});

/* ─────────────────────────────────────────────────────────────
   6. MOBILE ACCORDION
───────────────────────────────────────────────────────────────*/
document.querySelectorAll(".mob-accordion .mob-acc-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const accordion = btn.parentElement;
    const isOpen = accordion.classList.contains("open");
    document.querySelectorAll(".mob-accordion").forEach((a) => a.classList.remove("open"));
    if (!isOpen) accordion.classList.add("open");
  });
});

/* ─────────────────────────────────────────────────────────────
   7. HERO WORD CYCLING
───────────────────────────────────────────────────────────────*/
(function heroWordCycle() {
  const SERVICES = ["IoT", "Embedded", "Mobile Apps", "Cloud", "Box Build", "Smart Sensors"];
  const stage = document.getElementById("wordStage");
  if (!stage) return;

  SERVICES.forEach((s) => {
    const el = document.createElement("div");
    el.className = "word-el";
    el.textContent = s;
    stage.appendChild(el);
  });

  const wordEls = [...stage.querySelectorAll(".word-el")];
  let curWord = 0, intervalId = null;

  function setWordStageHeight() {
    let max = 0;
    wordEls.forEach((el) => {
      el.style.position = "relative"; el.style.opacity = "0"; el.style.transform = "none";
      const h = el.getBoundingClientRect().height;
      if (h > max) max = h;
      el.style.position = ""; el.style.opacity = ""; el.style.transform = "";
    });
    if (max < 50) max = Math.min(window.innerWidth * 0.1, 120);
    stage.style.height = max + "px";
  }

  function startCycle() {
    wordEls.forEach((el) => el.classList.remove("in", "out"));
    curWord = 0;
    wordEls[0].classList.add("in");
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      const prev = curWord;
      curWord = (curWord + 1) % SERVICES.length;
      wordEls[prev].classList.remove("in"); wordEls[prev].classList.add("out");
      setTimeout(() => {
        wordEls[prev].classList.remove("out");
        wordEls[curWord].classList.add("in");
      }, 400);
    }, 3000);
  }

  function stopCycle() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    wordEls.forEach((el) => el.classList.remove("in", "out"));
  }

  const heroEl = document.getElementById("bctHero");
  if (heroEl) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting ? startCycle() : stopCycle();
      });
    }, { threshold: 0.2 }).observe(heroEl);
  }

  document.fonts.ready.then(() => {
    setWordStageHeight();
    window.addEventListener("resize", setWordStageHeight);
  });
})();

/* ─────────────────────────────────────────────────────────────
   8. SERVICES SCROLL REVEAL
───────────────────────────────────────────────────────────────*/
const bctsObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("bcts-in-view"); });
}, { threshold: 0.2 });
document.querySelectorAll(".bcts-panel").forEach((p) => bctsObs.observe(p));

/* ═══════════════════════════════════════════════════════════════
   CANVAS ANIMATION HELPER  (v2 — fixed)

   Changes vs original:
   • token = { alive: bool } is shared between this closure and
     VisCtrl, so VisCtrl.stop() actually kills the RAF loop
   • Guard is `if (!token.alive) return` checked each frame
   • start() always resets token.alive = true then calls init + loop
   • 30 FPS cap via lastTime / interval delta
═══════════════════════════════════════════════════════════════ */
const TARGET_FPS      = 30;
const FRAME_INTERVAL  = 1000 / TARGET_FPS;

function makeCanvasAnim(canvasId, initFn, drawFn) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  function getSize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    canvas.width       = rect.width  * dpr;
    canvas.height      = rect.height * dpr;
    canvas.style.width  = rect.width  + "px";
    canvas.style.height = rect.height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
  }

  // Shared token — VisCtrl flips token.alive to kill the loop
  const token = { alive: false };

  function start() {
    if (token.alive) return;   // already running, skip
    token.alive = true;

    const { ctx, w, h } = getSize();
    const state = { frame: 0 };
    initFn(ctx, w, h, state);

    let lastTime = 0;
    function loop(ts) {
      if (!token.alive) return;           // killed from outside
      if (ts - lastTime >= FRAME_INTERVAL) {
        lastTime = ts;
        drawFn(ctx, w, h, state);
        state.frame++;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function stop() {
    token.alive = false;
  }

  // Wire into VisCtrl
  VisCtrl.register(canvas, start, stop);

  // Resize: stop → restart (debounced)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (token.alive) { stop(); start(); }
    }, 250);
  });
}

/* ═══════════════════════════════════════════════════════════════
   9.  SERVICE PANEL CANVAS ANIMATIONS
═══════════════════════════════════════════════════════════════ */

/* ── Panel 1: IoT Sensor Network ── */
makeCanvasAnim(
  "bcts-iot-canvas",
  (ctx, W, H, state) => {
    const COLORS = ["#00e5ff","#7b2fff","#10b981","#3b82f6","#f59e0b"];
    function Node(x,y,color){
      this.x=x; this.y=y; this.color=color;
      this.r=6+Math.random()*4;
      this.pulse=Math.random()*Math.PI*2;
      this.pulseSpeed=.03+Math.random()*.02;
      this.rings=[]; this.ringTimer=Math.random()*80;
      this.label=["TEMP","HUM","PRES","GAS","DIST","LIGHT"][Math.floor(Math.random()*6)];
      this.data=Math.floor(Math.random()*100); this.dataTimer=0;
    }
    const nodes=[];
    const hub=new Node(W*.5,H*.5,"#00e5ff"); hub.r=10; hub.label="HUB";
    nodes.push(hub);
    [[.18,.22],[.82,.2],[.12,.65],[.88,.7],[.45,.15],[.55,.85],[.22,.78],[.8,.45]]
      .forEach((p,i)=>nodes.push(new Node(W*p[0],H*p[1],COLORS[i%COLORS.length])));
    state.nodes=nodes; state.packets=[]; state.pTimer=0;
  },
  (ctx, W, H, state) => {
    const { nodes, packets } = state;
    ctx.clearRect(0, 0, W, H);
    nodes.forEach((a,i)=>nodes.forEach((b,j)=>{
      if(j<=i) return;
      const d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<W*.45){
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle="#00e5ff"; ctx.globalAlpha=.08+.05*(1-d/(W*.45));
        ctx.lineWidth=1; ctx.stroke();
      }
    }));
    ctx.globalAlpha=1;
    state.pTimer++;
    if(state.pTimer>25){
      state.pTimer=0;
      const hub=nodes[0];
      const target=nodes[1+Math.floor(Math.random()*(nodes.length-1))];
      state.packets.push(Math.random()>.5
        ?{x1:hub.x,y1:hub.y,x2:target.x,y2:target.y,t:0,speed:.006+Math.random()*.006,color:target.color,size:3+Math.random()*2}
        :{x1:target.x,y1:target.y,x2:hub.x,y2:hub.y,t:0,speed:.006+Math.random()*.006,color:"#00e5ff",size:3+Math.random()*2});
    }
    state.packets=state.packets.filter(p=>p.t<1);
    state.packets.forEach(p=>{
      p.t+=p.speed;
      const x=p.x1+(p.x2-p.x1)*p.t, y=p.y1+(p.y2-p.y1)*p.t;
      ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.globalAlpha=.9; ctx.fill();
      for(let i=1;i<=4;i++){
        const tt=Math.max(0,p.t-p.speed*i*3);
        const tx=p.x1+(p.x2-p.x1)*tt, ty=p.y1+(p.y2-p.y1)*tt;
        ctx.beginPath(); ctx.arc(tx,ty,p.size*(1-i*.2),0,Math.PI*2);
        ctx.globalAlpha=.3/i; ctx.fill();
      }
      ctx.globalAlpha=1;
    });
    nodes.forEach(n=>{
      n.pulse+=n.pulseSpeed; n.ringTimer--;
      if(n.ringTimer<=0){ n.rings.push({r:n.r,alpha:.7}); n.ringTimer=60+Math.random()*80; }
      n.rings=n.rings.filter(r=>{ r.r+=1.8; r.alpha-=.015; return r.alpha>0; });
      n.dataTimer++; if(n.dataTimer>90){ n.data=Math.floor(Math.random()*100); n.dataTimer=0; }
      n.rings.forEach(r=>{
        ctx.beginPath(); ctx.arc(n.x,n.y,r.r,0,Math.PI*2);
        ctx.strokeStyle=n.color; ctx.globalAlpha=r.alpha; ctx.lineWidth=1.5; ctx.stroke();
      });
      const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3);
      g.addColorStop(0,n.color+"40"); g.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3,0,Math.PI*2);
      ctx.fillStyle=g; ctx.globalAlpha=.6; ctx.fill();
      const pulse=Math.sin(n.pulse)*.3+1;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r*pulse,0,Math.PI*2);
      ctx.fillStyle=n.color; ctx.globalAlpha=.9; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r*.45,0,Math.PI*2);
      ctx.fillStyle="#fff"; ctx.globalAlpha=.85; ctx.fill();
      ctx.globalAlpha=.7; ctx.fillStyle="#0f1e3d";
      ctx.font="bold 9px Space Mono,monospace"; ctx.textAlign="center";
      ctx.fillText(n.label,n.x,n.y-n.r-6);
      ctx.font="9px Space Mono,monospace"; ctx.fillStyle=n.color; ctx.globalAlpha=.9;
      ctx.fillText(n.data+"%",n.x,n.y+n.r+14); ctx.globalAlpha=1;
    });
  }
);

/* ── Panel 2: Embedded Circuit ── */
makeCanvasAnim(
  "bcts-emb-canvas",
  (ctx, W, H, state) => {
    const COPPER="#7b2fff", COPPER2="#00e5ff";
    const traces=[],components=[];
    const cols=Math.floor(W/70), rows=Math.floor(H/65);
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++) if(Math.random()<.5){
      const x1=30+c*70+Math.random()*20, y1=30+r*65+Math.random()*20;
      const bx=x1+30+Math.random()*30, x2=bx, y2=y1+30+Math.random()*25;
      traces.push({x1,y1,bx,by:y1,x2,y2,
        color:Math.random()>.5?COPPER:COPPER2,
        opacity:.12+Math.random()*.18, pulse:Math.random(), speed:.003+Math.random()*.004});
    }
    for(let i=0;i<14;i++) components.push({
      x:50+Math.random()*(W-100), y:50+Math.random()*(H-100),
      type:["resistor","cap","ic","led"][Math.floor(Math.random()*4)]
    });
    state.traces=traces; state.components=components;
  },
  (ctx, W, H, state) => {
    const COPPER="#7b2fff", COPPER2="#00e5ff", SOLDER="#f59e0b";
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="rgba(123,47,255,.06)";
    for(let x=20;x<W;x+=20) for(let y=20;y<H;y+=20){
      ctx.beginPath(); ctx.arc(x,y,1,0,Math.PI*2); ctx.fill();
    }
    state.traces.forEach(t=>{
      ctx.strokeStyle=t.color; ctx.lineWidth=1.5; ctx.globalAlpha=t.opacity;
      ctx.beginPath(); ctx.moveTo(t.x1,t.y1); ctx.lineTo(t.bx,t.by); ctx.lineTo(t.x2,t.y2); ctx.stroke();
      ctx.globalAlpha=t.opacity*1.5; ctx.fillStyle=t.color;
      [[t.x1,t.y1],[t.bx,t.by],[t.x2,t.y2]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill();
      });
      t.pulse+=t.speed; if(t.pulse>1) t.pulse=0;
      let px,py;
      if(t.pulse<.5){ const s=t.pulse/.5; px=t.x1+(t.bx-t.x1)*s; py=t.y1+(t.by-t.y1)*s; }
      else{ const s=(t.pulse-.5)/.5; px=t.bx+(t.x2-t.bx)*s; py=t.by+(t.y2-t.by)*s; }
      ctx.globalAlpha=.9; ctx.shadowBlur=8; ctx.shadowColor=t.color;
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0; ctx.globalAlpha=1;
    });
    state.components.forEach(c=>{
      ctx.save(); ctx.translate(c.x,c.y);
      if(c.type==="resistor"){
        ctx.fillStyle="#d97706"; ctx.strokeStyle=COPPER; ctx.lineWidth=1;
        ctx.fillRect(-14,-5,28,10); ctx.strokeRect(-14,-5,28,10);
        ctx.beginPath(); ctx.moveTo(-20,0); ctx.lineTo(-14,0); ctx.moveTo(14,0); ctx.lineTo(20,0);
        ctx.strokeStyle=COPPER; ctx.lineWidth=2; ctx.stroke();
      }
      if(c.type==="cap"){
        ctx.strokeStyle=COPPER2; ctx.lineWidth=2;
        [[-10,0,-3,0],[3,0,10,0],[-3,-10,-3,10],[3,-10,3,10]].forEach(([x1,y1,x2,y2])=>{
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
      }
      if(c.type==="ic"){
        ctx.fillStyle="#1e1b4b"; ctx.strokeStyle=COPPER; ctx.lineWidth=1;
        ctx.fillRect(-18,-12,36,24); ctx.strokeRect(-18,-12,36,24);
        for(let p=-2;p<=2;p++){
          ctx.beginPath(); ctx.moveTo(-18,p*4); ctx.lineTo(-24,p*4);
          ctx.moveTo(18,p*4); ctx.lineTo(24,p*4);
          ctx.strokeStyle=COPPER; ctx.lineWidth=1.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(-12,-8,2,0,Math.PI*2); ctx.fillStyle=SOLDER; ctx.fill();
      }
      if(c.type==="led"){
        ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fillStyle=COPPER2;
        ctx.globalAlpha=.5+.5*Math.abs(Math.sin(state.frame*.04+c.x)); ctx.fill(); ctx.globalAlpha=1;
        ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.strokeStyle=COPPER2; ctx.lineWidth=1; ctx.stroke();
      }
      ctx.restore();
    });
  }
);

/* ── Panel 3: Cloud Development ── */
makeCanvasAnim(
  "bcts-cloud-canvas",
  (ctx, W, H, state) => {
    state.clouds=[
      {x:W*.25,y:H*.25,scale:1,bob:0,bobSpeed:.015},
      {x:W*.75,y:H*.22,scale:.8,bob:1,bobSpeed:.012},
      {x:W*.5,y:H*.15,scale:1.1,bob:2,bobSpeed:.018},
    ];
    state.databases=[
      {x:W*.2,y:H*.7,color:"#00e5ff",label:"SQL"},
      {x:W*.5,y:H*.75,color:"#7b2fff",label:"NoSQL"},
      {x:W*.8,y:H*.7,color:"#10b981",label:"Cache"},
    ];
    state.packets=[]; state.pTimer=0;
  },
  (ctx, W, H, state) => {
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(0,229,255,.04)"; ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    state.clouds.forEach(cl=>state.databases.forEach(db=>{
      ctx.beginPath(); ctx.moveTo(cl.x,cl.y+30); ctx.lineTo(db.x,db.y-32);
      ctx.strokeStyle="rgba(0,229,255,.1)"; ctx.lineWidth=1; ctx.setLineDash([4,8]); ctx.stroke(); ctx.setLineDash([]);
    }));
    for(let i=0;i<state.clouds.length-1;i++){
      ctx.beginPath(); ctx.moveTo(state.clouds[i].x,state.clouds[i].y); ctx.lineTo(state.clouds[i+1].x,state.clouds[i+1].y);
      ctx.strokeStyle="rgba(123,47,255,.1)"; ctx.lineWidth=1; ctx.stroke();
    }
    state.clouds.forEach(cl=>{
      cl.bob+=cl.bobSpeed; const y=cl.y+Math.sin(cl.bob)*8;
      ctx.save(); ctx.translate(cl.x,y); ctx.scale(cl.scale,cl.scale); ctx.globalAlpha=.92;
      ctx.beginPath(); ctx.arc(0,0,28,0,Math.PI*2); ctx.arc(-28,8,20,0,Math.PI*2);
      ctx.arc(28,8,20,0,Math.PI*2); ctx.arc(-14,-14,22,0,Math.PI*2); ctx.arc(14,-14,22,0,Math.PI*2);
      ctx.fillStyle="rgba(230,248,255,.95)"; ctx.fill(); ctx.fillRect(-44,8,88,24);
      ctx.globalAlpha=.4; ctx.strokeStyle="#00e5ff"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.globalAlpha=.8; ctx.fillStyle="#0f1e3d"; ctx.font="bold 9px Space Mono,monospace"; ctx.textAlign="center"; ctx.fillText("CLOUD",0,20);
      ctx.restore();
    });
    state.databases.forEach(db=>{
      ctx.save(); ctx.translate(db.x,db.y); ctx.globalAlpha=.9;
      const cw=36,ch=16;
      ctx.fillStyle=db.color+"25"; ctx.strokeStyle=db.color; ctx.lineWidth=1.5;
      ctx.fillRect(-cw/2,-30,cw,60); ctx.strokeRect(-cw/2,-30,cw,60);
      ctx.beginPath(); ctx.ellipse(0,-30,cw/2,ch/2,0,0,Math.PI*2);
      ctx.fillStyle=db.color+"50"; ctx.fill(); ctx.stroke();
      [-10,10].forEach(dy=>{ ctx.beginPath(); ctx.ellipse(0,dy,cw/2,ch/2,0,0,Math.PI); ctx.stroke(); });
      ctx.beginPath(); ctx.ellipse(0,30,cw/2,ch/2,0,0,Math.PI*2); ctx.fillStyle=db.color+"50"; ctx.fill(); ctx.stroke();
      ctx.globalAlpha=.7; ctx.fillStyle=db.color; ctx.font="bold 8px Space Mono,monospace"; ctx.textAlign="center"; ctx.fillText(db.label,0,48);
      ctx.restore();
    });
    state.pTimer++;
    if(state.pTimer>30){
      state.pTimer=0;
      const cl=state.clouds[Math.floor(Math.random()*state.clouds.length)];
      const db=state.databases[Math.floor(Math.random()*state.databases.length)];
      state.packets.push({x1:cl.x,y1:cl.y+32,x2:db.x,y2:db.y-32,t:0,speed:.004+Math.random()*.005,color:db.color});
      if(Math.random()>.5) state.packets.push({x1:db.x,y1:db.y-32,x2:cl.x,y2:cl.y+32,t:0,speed:.004+Math.random()*.005,color:"#00e5ff"});
    }
    state.packets=state.packets.filter(p=>p.t<1);
    state.packets.forEach(p=>{
      p.t+=p.speed; const x=p.x1+(p.x2-p.x1)*p.t, y=p.y1+(p.y2-p.y1)*p.t;
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle=p.color;
      ctx.globalAlpha=.9; ctx.shadowBlur=10; ctx.shadowColor=p.color; ctx.fill();
      ctx.shadowBlur=0; ctx.globalAlpha=1;
    });
  }
);

/* ── Panel 4: Mobile App ── */
makeCanvasAnim(
  "bcts-app-canvas",
  (ctx, W, H, state) => {
    state.buildProgress=0; state.codeLines=[];
    for(let i=0;i<8;i++) state.codeLines.push({
      x:W*.05, y:H*.1+i*22, width:60+Math.random()*80,
      color:["#7b2fff","#00e5ff","#10b981","#f59e0b"][i%4], alpha:0, delay:i*20
    });
  },
  (ctx, W, H, state) => {
    ctx.clearRect(0,0,W,H);
    state.buildProgress=Math.min(1,state.buildProgress+.003);
    state.codeLines.forEach(line=>{
      if(state.frame>line.delay) line.alpha=Math.min(.6,line.alpha+.02);
      const bW=line.width*Math.min(1,(state.frame-line.delay)*.02);
      ctx.fillStyle=line.color; ctx.globalAlpha=line.alpha;
      ctx.beginPath(); ctx.roundRect(line.x,line.y,bW,8,2); ctx.fill();
    });
    ctx.globalAlpha=1;
    const pw=Math.min(W*.4,180), ph=pw*2, px=(W-pw)/2, py=(H-ph)/2, r=20;
    const prog=state.buildProgress;
    ctx.save(); ctx.shadowBlur=30; ctx.shadowColor="rgba(123,47,255,.15)";
    ctx.fillStyle="#ffffff"; ctx.strokeStyle="rgba(123,47,255,.3)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(px,py,pw,ph,r); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.clip();
    if(prog>.05){
      const a=Math.min(1,(prog-.05)*10);
      ctx.fillStyle=`rgba(123,47,255,${a*.9})`; ctx.fillRect(px,py,pw,28);
      ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.font="8px Space Mono,monospace"; ctx.textAlign="left";
      ctx.fillText("9:41",px+10,py+18); ctx.textAlign="right"; ctx.fillText("●●●",px+pw-10,py+18);
    }
    ctx.fillStyle="#f4f8ff"; ctx.beginPath(); ctx.roundRect(px+pw*.3,py,pw*.4,14,[0,0,10,10]); ctx.fill();
    if(prog>.15){
      const a=Math.min(1,(prog-.15)*8);
      ctx.fillStyle=`rgba(240,250,255,${a})`; ctx.fillRect(px,py+28,pw,40);
      ctx.fillStyle=`rgba(15,30,61,${a})`; ctx.font="bold 10px Outfit,sans-serif"; ctx.textAlign="left";
      ctx.fillText("BCT Monitor",px+14,py+53);
    }
    [{label:"TEMP",val:"28°C",color:"#f59e0b"},{label:"HUM",val:"62%",color:"#00e5ff"}].forEach((card,i)=>{
      const cp=.25+i*.15;
      if(prog>cp){
        const a=Math.min(1,(prog-cp)*8), cy=py+78+i*62;
        ctx.fillStyle=`rgba(255,255,255,${a})`;
        ctx.strokeStyle=`rgba(${card.color==="#f59e0b"?"245,158,11":"0,229,255"},${a*.3})`;
        ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect(px+10,cy,pw-20,50,10); ctx.fill(); ctx.stroke();
        ctx.fillStyle=`rgba(107,118,150,${a})`; ctx.font="7px Space Mono,monospace"; ctx.textAlign="left"; ctx.fillText(card.label,px+18,cy+16);
        ctx.fillStyle=`rgba(15,30,61,${a})`; ctx.font="bold 16px Outfit,sans-serif"; ctx.fillText(card.val,px+18,cy+36);
      }
    });
    ctx.restore();
    if(Math.floor(state.frame/30)%2===0){
      ctx.fillStyle="#7b2fff";
      ctx.fillRect(state.codeLines[state.codeLines.length-1]?.x||20,H*.1+state.codeLines.length*22,2,10);
    }
  }
);

/* ── Panel 5: Box Build Assembly ── */
makeCanvasAnim(
  "bcts-box-canvas",
  (ctx, W, H, state) => {
    const pw=Math.min(W*.75,380), ph=pw*.6, px=(W-pw)/2, py=(H-ph)/2;
    state.pw=pw; state.ph=ph; state.px=px; state.py=py;
    state.components=[
      {x:px+pw*.2,y:py+ph*.25,type:"ic",color:"#7b2fff",placed:false,glow:0,delay:0},
      {x:px+pw*.7,y:py+ph*.25,type:"ic",color:"#7b2fff",placed:false,glow:0,delay:60},
      {x:px+pw*.15,y:py+ph*.65,type:"cap",color:"#00e5ff",placed:false,glow:0,delay:120},
      {x:px+pw*.4,y:py+ph*.65,type:"cap",color:"#00e5ff",placed:false,glow:0,delay:150},
      {x:px+pw*.65,y:py+ph*.65,type:"cap",color:"#00e5ff",placed:false,glow:0,delay:180},
      {x:px+pw*.85,y:py+ph*.65,type:"resistor",color:"#f59e0b",placed:false,glow:0,delay:210},
      {x:px+pw*.3,y:py+ph*.45,type:"resistor",color:"#f59e0b",placed:false,glow:0,delay:240},
      {x:px+pw*.55,y:py+ph*.45,type:"led",color:"#10b981",placed:false,glow:0,delay:270},
      {x:px+pw*.78,y:py+ph*.45,type:"led",color:"#ff2d9b",placed:false,glow:0,delay:300},
    ];
  },
  (ctx, W, H, state) => {
    const { pw, ph, px, py, components } = state;
    const COPPER="#7b2fff", SOLDER_GLOW=40;
    ctx.clearRect(0,0,W,H);
    if(state.frame>520){ state.frame=0; components.forEach(c=>{ c.placed=false; c.glow=0; }); }
    ctx.shadowBlur=20; ctx.shadowColor="rgba(0,229,255,.1)";
    ctx.fillStyle="#f0f4f0"; ctx.strokeStyle="rgba(0,180,0,.3)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(px,py,pw,ph,8); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    [[px+12,py+12],[px+pw-12,py+12],[px+12,py+ph-12],[px+pw-12,py+ph-12]].forEach(([x,y])=>{
      ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fillStyle="#d0d8d0"; ctx.fill(); ctx.strokeStyle="#aaa"; ctx.lineWidth=1; ctx.stroke();
    });
    [[px+pw*.2,py+ph*.25,px+pw*.4,py+ph*.25,"#f59e0b"],
     [px+pw*.4,py+ph*.25,px+pw*.4,py+ph*.45,"#f59e0b"],
     [px+pw*.4,py+ph*.45,px+pw*.55,py+ph*.45,"#7b2fff"],
     [px+pw*.7,py+ph*.25,px+pw*.78,py+ph*.45,"#00e5ff"],
     [px+pw*.15,py+ph*.65,px+pw*.3,py+ph*.45,"#10b981"],
     [px+pw*.65,py+ph*.65,px+pw*.78,py+ph*.45,"#ff2d9b"],
    ].forEach(([x1,y1,x2,y2,color])=>{
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle=color+"40"; ctx.lineWidth=3; ctx.lineCap="round"; ctx.stroke();
    });
    let cur=null;
    components.forEach(c=>{
      if(!c.placed&&state.frame>=c.delay){ c.placed=true; c.glow=SOLDER_GLOW; }
      if(c.glow>0&&c.placed) cur=c;
      if(!c.placed) return;
      ctx.save(); ctx.translate(c.x,c.y);
      if(c.glow>0){ ctx.shadowBlur=20*(c.glow/SOLDER_GLOW); ctx.shadowColor="#f59e0b"; }
      if(c.type==="ic"){
        ctx.fillStyle="#1e1b4b"; ctx.strokeStyle=c.color; ctx.lineWidth=1.5;
        ctx.fillRect(-20,-14,40,28); ctx.strokeRect(-20,-14,40,28);
        for(let i=-2;i<=2;i++){
          ctx.strokeStyle="#aaa"; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(-20,i*5); ctx.lineTo(-26,i*5); ctx.moveTo(20,i*5); ctx.lineTo(26,i*5); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(-14,-10,2.5,0,Math.PI*2); ctx.fillStyle="#f59e0b"; ctx.fill();
        ctx.fillStyle="#fff"; ctx.font="6px Space Mono,monospace"; ctx.textAlign="center"; ctx.fillText("MCU",0,3);
      }
      if(c.type==="cap"){
        ctx.strokeStyle=c.color; ctx.lineWidth=2;
        [[-10,0,-3,0],[3,0,10,0],[-3,-9,-3,9],[3,-9,3,9]].forEach(([x1,y1,x2,y2])=>{
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
      }
      if(c.type==="resistor"){
        ctx.fillStyle="#d97706"; ctx.strokeStyle=c.color; ctx.lineWidth=1.5;
        ctx.fillRect(-14,-5,28,10); ctx.strokeRect(-14,-5,28,10);
        [[-6,"#f00"],[-2,"#ff0"],[2,"#0a0"]].forEach(([bx,bc])=>{ ctx.fillStyle=bc; ctx.fillRect(bx,-5,3,10); });
      }
      if(c.type==="led"){
        const p=.6+.4*Math.sin(state.frame*.08+c.x*.1);
        ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fillStyle=c.color; ctx.globalAlpha=p; ctx.fill(); ctx.globalAlpha=1;
        ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*2); ctx.strokeStyle=c.color; ctx.lineWidth=1.5; ctx.stroke();
      }
      if(c.glow>0) c.glow--;
      ctx.restore();
    });
    if(cur){
      ctx.save(); ctx.strokeStyle="rgba(107,118,150,.3)"; ctx.lineWidth=3; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(W*.85,H*.1); ctx.quadraticCurveTo(W*.85-30,(H*.1+cur.y)/2,cur.x,cur.y); ctx.stroke();
      ctx.fillStyle="#f59e0b"; ctx.shadowBlur=15; ctx.shadowColor="#f59e0b";
      ctx.beginPath(); ctx.arc(cur.x,cur.y,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      ctx.restore();
    }
  }
);

/* ── Panel 6: Smart Sensors / Radar ── */
makeCanvasAnim(
  "bcts-sensor-canvas",
  (ctx, W, H, state) => {
    state.angle=0; state.blips=[];
    state.sensors=[
      {label:"DIST",value:.7,color:"#10b981"},
      {label:"TEMP",value:.4,color:"#00e5ff"},
      {label:"PRESS",value:.6,color:"#f59e0b"},
      {label:"MOTION",value:.3,color:"#ff2d9b"},
      {label:"GAS",value:.5,color:"#7b2fff"},
    ];
  },
  (ctx, W, H, state) => {
    ctx.clearRect(0,0,W,H);
    const cx=W*.38, cy=H*.5, maxR=Math.min(W*.28,H*.32,160);
    [1,.75,.5,.25].forEach(f=>{
      ctx.beginPath(); ctx.arc(cx,cy,maxR*f,0,Math.PI*2);
      ctx.strokeStyle="rgba(16,185,129,.15)"; ctx.lineWidth=1; ctx.stroke();
    });
    ctx.strokeStyle="rgba(16,185,129,.12)"; ctx.lineWidth=1;
    [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*maxR,cy+Math.sin(a)*maxR); ctx.stroke();
    });
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(state.angle);
    for(let i=0;i<60;i++){
      const a=-(i/60)*(Math.PI/2), alpha=(1-i/60)*.25;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,maxR,a-.05,a+.05); ctx.closePath();
      ctx.fillStyle=`rgba(16,185,129,${alpha})`; ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(maxR,0);
    ctx.strokeStyle="rgba(16,185,129,.8)"; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
    state.angle+=.025; if(state.angle>Math.PI*2) state.angle-=Math.PI*2;
    if(state.frame%45===0){
      const r=(.25+Math.random()*.7)*maxR, a=state.angle+(Math.random()-.5)*.1;
      state.blips.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,alpha:1,size:3+Math.random()*3,
        type:["OBJ","NEAR","FAR","SIG"][Math.floor(Math.random()*4)],
        color:["#10b981","#00e5ff","#f59e0b","#ff2d9b"][Math.floor(Math.random()*4)]});
      if(state.blips.length>15) state.blips.shift();
    }
    state.blips.forEach(b=>{
      b.alpha-=.008;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.size,0,Math.PI*2); ctx.fillStyle=b.color;
      ctx.globalAlpha=b.alpha; ctx.shadowBlur=10; ctx.shadowColor=b.color; ctx.fill();
      ctx.shadowBlur=0; ctx.fillStyle=b.color; ctx.font="7px Space Mono,monospace"; ctx.textAlign="center";
      ctx.fillText(b.type,b.x,b.y-b.size-3);
    });
    state.blips=state.blips.filter(b=>b.alpha>0); ctx.globalAlpha=1;
    const gaugeX=W*.75;
    ctx.fillStyle="rgba(16,185,129,.06)"; ctx.strokeStyle="rgba(16,185,129,.2)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(gaugeX-8,H*.32-10,100,state.sensors.length*24+20,8); ctx.fill(); ctx.stroke();
    state.sensors.forEach((s,i)=>{
      const sy=H*.32+i*24;
      ctx.fillStyle="rgba(107,118,150,.8)"; ctx.font="7px Space Mono,monospace"; ctx.textAlign="left"; ctx.fillText(s.label,gaugeX,sy+10);
      ctx.fillStyle="rgba(107,118,150,.1)"; ctx.beginPath(); ctx.roundRect(gaugeX+38,sy+2,48,8,2); ctx.fill();
      const anim=s.value*(.7+.3*Math.sin(state.frame*.03+i));
      ctx.fillStyle=s.color; ctx.beginPath(); ctx.roundRect(gaugeX+38,sy+2,48*anim,8,2); ctx.fill();
    });
    ctx.fillStyle="rgba(16,185,129,.6)"; ctx.font="bold 9px Space Mono,monospace"; ctx.textAlign="center";
    ctx.fillText("RADAR SWEEP",cx,cy+maxR+20);
  }
);

/* ═══════════════════════════════════════════════════════════════
   10. INDUSTRY CARD CANVAS ANIMATIONS
═══════════════════════════════════════════════════════════════ */

/* Automotive */
makeCanvasAnim(
  "bcti-auto-canvas",
  (ctx, W, H, state) => {
    state.carX=-120; state.roadLines=[]; state.sparks=[];
    for(let x=0;x<W+80;x+=80) state.roadLines.push({x,y:H*.68,w:40,speed:3+Math.random()});
  },
  (ctx, W, H, state) => {
    const ORANGE="#f97316", RED="#ef4444";
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(249,115,22,.04)"; ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    const roadGrad=ctx.createLinearGradient(0,H*.62,0,H);
    roadGrad.addColorStop(0,"rgba(249,115,22,.06)"); roadGrad.addColorStop(1,"rgba(0,0,0,.3)");
    ctx.fillStyle=roadGrad; ctx.fillRect(0,H*.62,W,H);
    ctx.beginPath(); ctx.moveTo(0,H*.63); ctx.lineTo(W,H*.63);
    ctx.strokeStyle="rgba(249,115,22,.25)"; ctx.lineWidth=1.5; ctx.stroke();
    state.roadLines.forEach(line=>{
      ctx.fillStyle="rgba(249,115,22,.35)"; ctx.fillRect(line.x,line.y,line.w,3);
      line.x-=line.speed; if(line.x+line.w<0) line.x=W+10;
    });
    state.carX+=1.4; if(state.carX>W+130) state.carX=-120;
    const carX=state.carX, carY=H*.62;
    if(state.frame%3===0){
      for(let i=0;i<2;i++) state.sparks.push({x:carX-55,y:carY-5,
        vx:-(1.5+Math.random()*2),vy:(Math.random()-.5)*1.2,life:1,
        color:Math.random()>.5?ORANGE:RED});
    }
    state.sparks=state.sparks.filter(s=>s.life>0);
    state.sparks.forEach(s=>{
      s.x+=s.vx; s.y+=s.vy; s.life-=.04;
      ctx.beginPath(); ctx.arc(s.x,s.y,1.5,0,Math.PI*2);
      ctx.fillStyle=s.color; ctx.globalAlpha=s.life*.8; ctx.fill();
    });
    ctx.globalAlpha=1;
    for(let i=0;i<4;i++){
      ctx.beginPath(); ctx.moveTo(carX-55-i*14,carY-8+((i%3)-1)*4); ctx.lineTo(carX-55-i*14-18,carY-8+((i%3)-1)*4);
      ctx.strokeStyle=`rgba(249,115,22,${.25-i*.05})`; ctx.lineWidth=1; ctx.stroke();
    }
    ctx.save(); ctx.translate(carX,carY);
    const grd=ctx.createRadialGradient(0,12,0,0,12,60);
    grd.addColorStop(0,"rgba(249,115,22,.25)"); grd.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.ellipse(0,18,55,14,0,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
    ctx.fillStyle="#1e1b4b"; ctx.strokeStyle=ORANGE; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(-50,-18,100,28,6); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#2d2a6e"; ctx.strokeStyle="rgba(249,115,22,.6)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(-28,-36,56,20,4); ctx.fill(); ctx.stroke();
    ctx.fillStyle="rgba(0,229,255,.12)"; ctx.strokeStyle="rgba(0,229,255,.3)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(-24,-34,48,16,3); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=14; ctx.shadowColor=ORANGE; ctx.fillStyle=ORANGE;
    ctx.beginPath(); ctx.ellipse(48,-6,5,3.5,0,0,Math.PI*2); ctx.fill();
    ctx.shadowColor=RED; ctx.fillStyle=RED;
    ctx.beginPath(); ctx.ellipse(-48,-6,4,3,0,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    [[-30,10],[30,10]].forEach(([wx,wy])=>{
      ctx.beginPath(); ctx.arc(wx,wy,11,0,Math.PI*2); ctx.fillStyle="#0f0e2a"; ctx.strokeStyle="#4a4785"; ctx.lineWidth=2; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(wx,wy,5,0,Math.PI*2); ctx.fillStyle="#888"; ctx.fill();
      for(let s=0;s<4;s++){
        const a=state.frame*.12+(s*Math.PI)/2;
        ctx.beginPath(); ctx.moveTo(wx+Math.cos(a)*2,wy+Math.sin(a)*2); ctx.lineTo(wx+Math.cos(a)*8,wy+Math.sin(a)*8);
        ctx.strokeStyle="#aaa"; ctx.lineWidth=1.5; ctx.stroke();
      }
    });
    ctx.restore();
  }
);

/* Food & Beverage */
makeCanvasAnim(
  "bcti-food-canvas",
  (ctx, W, H, state) => {
    state.steamPuffs=[]; state.bubbles=[];
    for(let i=0;i<8;i++) state.bubbles.push({
      x:W*.5+(Math.random()-.5)*50, y:H*.65+Math.random()*30,
      r:2+Math.random()*3, speed:.3+Math.random()*.4, alpha:.4+Math.random()*.4
    });
  },
  (ctx, W, H, state) => {
    const GREEN="#10b981";
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="rgba(16,185,129,.05)";
    for(let x=0;x<W;x+=30) for(let y=0;y<H;y+=30){ ctx.beginPath(); ctx.arc(x,y,1,0,Math.PI*2); ctx.fill(); }
    const cx=W*.5, cy=H*.3;
    if(state.frame%22===0) state.steamPuffs.push({
      x:cx+(Math.random()-.5)*20, y:cy-16, r:4+Math.random()*4,
      vx:(Math.random()-.5)*.4, vy:-.8-Math.random()*.4, alpha:.6
    });
    state.steamPuffs.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(16,185,129,${p.alpha*.5})`; ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.r+=.3; p.alpha-=.015;
    });
    state.steamPuffs=state.steamPuffs.filter(p=>p.alpha>0);
    ctx.beginPath(); ctx.ellipse(cx,cy+55,52,8,0,0,Math.PI*2);
    ctx.fillStyle="rgba(16,185,129,.12)"; ctx.fill(); ctx.strokeStyle=GREEN; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-38,cy-10); ctx.lineTo(cx-32,cy+50); ctx.lineTo(cx+32,cy+50); ctx.lineTo(cx+38,cy-10); ctx.closePath();
    ctx.fillStyle="rgba(15,30,61,.85)"; ctx.strokeStyle=GREEN; ctx.lineWidth=1.5; ctx.fill(); ctx.stroke();
    const liqGrad=ctx.createLinearGradient(0,cy,0,cy+50);
    liqGrad.addColorStop(0,"rgba(16,185,129,.35)"); liqGrad.addColorStop(1,"rgba(16,185,129,.1)");
    ctx.beginPath(); ctx.moveTo(cx-36,cy+8); ctx.lineTo(cx-31,cy+49); ctx.lineTo(cx+31,cy+49); ctx.lineTo(cx+36,cy+8); ctx.closePath();
    ctx.fillStyle=liqGrad; ctx.fill();
    ctx.beginPath(); ctx.arc(cx+44,cy+22,18,-Math.PI*.4,Math.PI*.5); ctx.strokeStyle=GREEN; ctx.lineWidth=3; ctx.stroke();
    state.bubbles.forEach(b=>{
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(16,185,129,${b.alpha})`; ctx.lineWidth=1; ctx.stroke();
      b.y-=b.speed; if(b.y<cy+8){ b.y=cy+50; b.x=cx+(Math.random()-.5)*50; }
    });
    const temp=72+Math.sin(state.frame*.03)*3;
    ctx.fillStyle="rgba(16,185,129,.08)"; ctx.strokeStyle="rgba(16,185,129,.25)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(cx+70,cy+10,90,42,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=GREEN; ctx.font="bold 18px Space Mono,monospace"; ctx.textAlign="left"; ctx.fillText(temp.toFixed(1)+"°C",cx+80,cy+36);
    ctx.fillStyle="rgba(16,185,129,.45)"; ctx.font="7px Space Mono,monospace"; ctx.fillText("TEMP SENSOR",cx+80,cy+48);
  }
);

/* Home Appliances */
makeCanvasAnim(
  "bcti-home-canvas",
  (ctx, W, H, state) => {
    state.packets=[]; state.devices=[];
    const cx=W*.5, cy=H*.45;
    [Math.PI*.1,Math.PI*.5,Math.PI*.85,Math.PI*1.3,Math.PI*1.7].forEach((a,i)=>{
      const r=Math.min(W,H)*.32;
      state.devices.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,
        icon:["💡","🌡","🔒","📷","🔌"][i],
        color:["#a855f7","#ff2d9b","#00e5ff","#f59e0b","#10b981"][i],
        pulse:Math.random()*Math.PI*2});
    });
  },
  (ctx, W, H, state) => {
    const VIO="#a855f7";
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(168,85,247,.04)"; ctx.lineWidth=1;
    for(let x=0;x<W;x+=35){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=35){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    const cx=W*.5, cy=H*.45, s=Math.min(W,H)*.18;
    state.devices.forEach(d=>{
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(d.x,d.y);
      ctx.strokeStyle="rgba(168,85,247,.12)"; ctx.lineWidth=1; ctx.setLineDash([4,8]); ctx.stroke(); ctx.setLineDash([]);
    });
    if(state.frame%35===0&&state.devices.length){
      const d=state.devices[Math.floor(Math.random()*state.devices.length)];
      state.packets.push({x:cx,y:cy,tx:d.x,ty:d.y,t:0,color:d.color});
    }
    state.packets=state.packets.filter(p=>p.t<1);
    state.packets.forEach(p=>{
      p.t+=.025; const x=p.x+(p.tx-p.x)*p.t, y=p.y+(p.ty-p.y)*p.t;
      ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fillStyle=p.color;
      ctx.globalAlpha=.9; ctx.shadowBlur=10; ctx.shadowColor=p.color; ctx.fill();
      ctx.shadowBlur=0; ctx.globalAlpha=1;
    });
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,s*1.5);
    g.addColorStop(0,"rgba(168,85,247,.15)"); g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(cx,cy,s*1.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle="rgba(15,14,42,.9)"; ctx.strokeStyle=VIO; ctx.lineWidth=2;
    ctx.beginPath(); ctx.rect(cx-s*.6,cy-s*.1,s*1.2,s*.8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-s*.75,cy-s*.1); ctx.lineTo(cx,cy-s*.75); ctx.lineTo(cx+s*.75,cy-s*.1); ctx.closePath();
    ctx.fillStyle="rgba(30,27,74,.95)"; ctx.fill(); ctx.stroke();
    [1,.65,.35].forEach((f,i)=>{
      const a=(Math.sin(state.frame*.04-i*.3)+1)/2;
      ctx.beginPath(); ctx.arc(cx,cy-s*.55,s*f*.5,Math.PI*1.1,Math.PI*1.9);
      ctx.strokeStyle=`rgba(168,85,247,${a*.7})`; ctx.lineWidth=1.5; ctx.stroke();
    });
    state.devices.forEach(d=>{
      d.pulse+=.04; const pulse=Math.sin(d.pulse)*.2+1;
      ctx.beginPath(); ctx.arc(d.x,d.y,14*pulse,0,Math.PI*2);
      ctx.fillStyle="rgba(15,14,42,.9)"; ctx.strokeStyle=d.color; ctx.lineWidth=1.5;
      ctx.shadowBlur=10; ctx.shadowColor=d.color; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
      ctx.font="12px sans-serif"; ctx.textAlign="center"; ctx.fillText(d.icon,d.x,d.y+4);
    });
  }
);

/* Industrial IoT */
makeCanvasAnim(
  "bcti-ind-canvas",
  (ctx, W, H, state) => { state.particles=[]; },
  (ctx, W, H, state) => {
    const CYAN="#00e5ff", AMBER="#f59e0b";
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(0,229,255,.04)"; ctx.lineWidth=1;
    for(let x=0;x<W;x+=38){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=38){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    const cx=W*.38, cy=H*.46, t=state.frame*.018;
    function drawGear(x,y,outerR,innerR,teeth,angle,color){
      ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.beginPath();
      for(let i=0;i<teeth;i++){
        const a1=(i/teeth)*Math.PI*2-(Math.PI/teeth)*.4, a2=(i/teeth)*Math.PI*2+(Math.PI/teeth)*.4;
        const a3=((i+.5)/teeth)*Math.PI*2-(Math.PI/teeth)*.3, a4=((i+.5)/teeth)*Math.PI*2+(Math.PI/teeth)*.3;
        ctx.lineTo(Math.cos(a1)*outerR,Math.sin(a1)*outerR); ctx.lineTo(Math.cos(a2)*outerR,Math.sin(a2)*outerR);
        ctx.lineTo(Math.cos(a3)*innerR,Math.sin(a3)*innerR); ctx.lineTo(Math.cos(a4)*innerR,Math.sin(a4)*innerR);
      }
      ctx.closePath(); ctx.fillStyle="rgba(15,14,42,.92)"; ctx.strokeStyle=color; ctx.lineWidth=1.5;
      ctx.shadowBlur=8; ctx.shadowColor=color; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
      ctx.beginPath(); ctx.arc(0,0,innerR*.55,0,Math.PI*2); ctx.strokeStyle=color+"60"; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); ctx.restore();
    }
    drawGear(cx,cy,48,36,12,t,CYAN); drawGear(cx+78,cy-14,28,21,8,-t*1.71,AMBER); drawGear(cx+38,cy+62,22,16,7,t*2.18,"#10b981");
    [[cx,cy,cx+78,cy-14],[cx,cy,cx+38,cy+62]].forEach(([x1,y1,x2,y2])=>{
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle="rgba(0,229,255,.12)"; ctx.lineWidth=1; ctx.setLineDash([4,8]); ctx.stroke(); ctx.setLineDash([]);
    });
    if(state.frame%18===0){
      state.particles.push(
        {x:cx,y:cy,tx:cx+78,ty:cy-14,t:0,color:AMBER},
        {x:cx,y:cy,tx:cx+38,ty:cy+62,t:0,color:"#10b981"}
      );
    }
    state.particles=state.particles.filter(p=>p.t<1);
    state.particles.forEach(p=>{
      p.t+=.02; const px2=p.x+(p.tx-p.x)*p.t, py2=p.y+(p.ty-p.y)*p.t;
      ctx.beginPath(); ctx.arc(px2,py2,3,0,Math.PI*2); ctx.fillStyle=p.color;
      ctx.globalAlpha=1-p.t*.5; ctx.shadowBlur=8; ctx.shadowColor=p.color; ctx.fill();
      ctx.shadowBlur=0; ctx.globalAlpha=1;
    });
    function drawGauge(x,y,value,label,color){
      const r=26; ctx.save(); ctx.translate(x,y);
      ctx.beginPath(); ctx.arc(0,0,r,Math.PI*.75,Math.PI*2.25);
      ctx.strokeStyle="rgba(255,255,255,.1)"; ctx.lineWidth=4; ctx.lineCap="round"; ctx.stroke();
      const endA=Math.PI*.75+value*Math.PI*1.5;
      ctx.beginPath(); ctx.arc(0,0,r,Math.PI*.75,endA); ctx.strokeStyle=color; ctx.lineWidth=4; ctx.stroke();
      ctx.shadowBlur=12; ctx.shadowColor=color;
      ctx.beginPath(); ctx.arc(0,0,r,endA-.05,endA); ctx.strokeStyle="#fff"; ctx.lineWidth=5; ctx.stroke(); ctx.shadowBlur=0;
      ctx.fillStyle=color; ctx.font="bold 11px Space Mono,monospace"; ctx.textAlign="center"; ctx.fillText(Math.round(value*100),0,5);
      ctx.fillStyle="rgba(255,255,255,.3)"; ctx.font="6px Space Mono,monospace"; ctx.fillText(label,0,16); ctx.restore();
    }
    const gx=W*.75;
    drawGauge(gx,H*.22,.55+Math.sin(state.frame*.025)*.22,"PRESS",CYAN);
    drawGauge(gx,H*.5,.7+Math.cos(state.frame*.02)*.18,"TEMP",AMBER);
    drawGauge(gx,H*.78,.45+Math.sin(state.frame*.03+1)*.25,"RPM","#10b981");
  }
);

/* ═══════════════════════════════════════════════════════════════
   11. WHY CHOOSE US — canvas icons + reviews + counters
═══════════════════════════════════════════════════════════════ */

/* Reviews */
(function(){
  const R1=[
    {name:"Muthu Krishna S",meta:"Local Guide · 5 reviews",r:5,txt:"Good friendly environment with smart learning & work.",col:"#10b981"},
    {name:"Vishwa D",meta:"Local Guide · 63 reviews",r:5,txt:"Makes vending products like coffee vending machines — excellent quality.",col:"#00e5ff"},
    {name:"Mohammed Yusuff",meta:"4 reviews",r:4,txt:"Best for RND projects. Team is excellent and very responsive.",col:"#7b2fff"},
    {name:"Pradeep S B",meta:"8 reviews",r:5,txt:"Very good super — professional service delivered on time.",col:"#f59e0b"},
    {name:"Venkataprasad M",meta:"Local Guide · 38 reviews",r:5,txt:"Professional people with good ethics in business.",col:"#ff2d9b"},
    {name:"Arjun R",meta:"12 reviews",r:5,txt:"Outstanding embedded systems team. Delivered beyond expectations.",col:"#38bdf8"},
    {name:"Deepak Nair",meta:"7 reviews",r:5,txt:"Highly skilled IoT engineers. Our product shipped on schedule.",col:"#a855f7"},
  ];
  const R2=[
    {name:"Sudeep Sabat",meta:"Local Guide · 17 reviews",r:4,txt:"Good service from Mr. Vijay. Very knowledgeable team.",col:"#f97316"},
    {name:"Ramesh K",meta:"6 reviews",r:5,txt:"Excellent hardware design team. PCB quality is absolutely top notch.",col:"#00e5ff"},
    {name:"Ananya S",meta:"3 reviews",r:5,txt:"BrainChild built our smart home device from scratch. Amazing work.",col:"#10b981"},
    {name:"Kartik Menon",meta:"9 reviews",r:5,txt:"Very professional. The firmware quality was exceptional.",col:"#7b2fff"},
    {name:"Shruti Patel",meta:"11 reviews",r:4,txt:"Great team for cloud-IoT integration. Would definitely recommend.",col:"#f59e0b"},
    {name:"Harish V",meta:"Local Guide · 22 reviews",r:5,txt:"Trusted partner for our automotive ECU project. Impressive delivery.",col:"#ff2d9b"},
    {name:"Neha Gupta",meta:"5 reviews",r:5,txt:"Make-in-India quality matches global standards. Proud to work with them.",col:"#38bdf8"},
  ];
  const GSVG=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;
  function sHtml(n){ let h=""; for(let i=1;i<=5;i++) h+=`<span style="color:${i<=n?"#f59e0b":"rgba(232,238,255,.15)"}">★</span>`; return h; }
  function aColor(name){
    const c=["#00e5ff","#7b2fff","#ff2d9b","#10b981","#f59e0b","#38bdf8","#a855f7","#f97316"];
    let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))%c.length; return c[h];
  }
  function makeCard(rev){
    const init=rev.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const bg=aColor(rev.name), d=document.createElement("div");
    d.className="bcwc-rcard";
    d.innerHTML=`<div class="bcwc-rtop"><div class="bcwc-ravatar" style="background:${bg}20;border-color:${bg}40;color:${bg}">${init}</div><div><div class="bcwc-rname">${rev.name}</div><div class="bcwc-rmeta">${rev.meta}</div></div></div><div class="bcwc-rstars">${sHtml(rev.r)}</div><p class="bcwc-rtext">${rev.txt}</p><div class="bcwc-gbadge">${GSVG}<span>Verified Google Review</span></div>`;
    return d;
  }
  function fill(id,revs){ const el=document.getElementById(id); [...revs,...revs].forEach(r=>el.appendChild(makeCard(r))); }
  fill("bcwcRow1",R1); fill("bcwcRow2",R2);
})();

/* Why Choose Us — icon canvases */
makeCanvasAnim("bcwc-cv1",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2,R=w*.3,ri=w*.22,t=12;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(state.frame*.02);
    ctx.beginPath();
    for(let i=0;i<t;i++){
      const a1=(i/t)*Math.PI*2-(Math.PI/t)*.4, a2=(i/t)*Math.PI*2+(Math.PI/t)*.4;
      const a3=((i+.5)/t)*Math.PI*2-(Math.PI/t)*.3, a4=((i+.5)/t)*Math.PI*2+(Math.PI/t)*.3;
      ctx.lineTo(Math.cos(a1)*R,Math.sin(a1)*R); ctx.lineTo(Math.cos(a2)*R,Math.sin(a2)*R);
      ctx.lineTo(Math.cos(a3)*ri,Math.sin(a3)*ri); ctx.lineTo(Math.cos(a4)*ri,Math.sin(a4)*ri);
    }
    ctx.closePath(); ctx.strokeStyle="#00e5ff"; ctx.lineWidth=1.5; ctx.shadowBlur=8; ctx.shadowColor="#00e5ff"; ctx.stroke(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(0,0,w*.1,0,Math.PI*2); ctx.fillStyle="#00e5ff"; ctx.fill(); ctx.restore();
  }
);

makeCanvasAnim("bcwc-cv2",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2,p=(Math.sin(state.frame*.05)+1)/2;
    ctx.beginPath(); ctx.arc(cx,cy,w*.36,0,Math.PI*2);
    ctx.strokeStyle=`rgba(16,185,129,${.12+p*.2})`; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx,cy-w*.28); ctx.quadraticCurveTo(cx+w*.28,cy-w*.15,cx+w*.28,cy+w*.05);
    ctx.quadraticCurveTo(cx+w*.2,cy+w*.28,cx,cy+w*.32); ctx.quadraticCurveTo(cx-w*.2,cy+w*.28,cx-w*.28,cy+w*.05);
    ctx.quadraticCurveTo(cx-w*.28,cy-w*.15,cx,cy-w*.28);
    ctx.strokeStyle="#10b981"; ctx.lineWidth=1.5; ctx.shadowBlur=8; ctx.shadowColor="#10b981"; ctx.stroke(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(cx-w*.1,cy); ctx.lineTo(cx-w*.02,cy+w*.1); ctx.lineTo(cx+w*.13,cy-w*.1);
    ctx.strokeStyle="#10b981"; ctx.lineWidth=2; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke();
  }
);

makeCanvasAnim("bcwc-cv3",
  (ctx,w,h,state)=>{
    state.dots=[];
    for(let i=0;i<5;i++) state.dots.push({x:w*.3+Math.random()*w*.4,y:h*.85,speed:.4+Math.random()*.5,a:.8});
  },
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h*.38;
    ctx.beginPath(); ctx.arc(cx,cy,w*.2,0,Math.PI*2); ctx.arc(cx-w*.16,cy+w*.06,w*.14,0,Math.PI*2);
    ctx.arc(cx+w*.16,cy+w*.06,w*.14,0,Math.PI*2);
    ctx.fillStyle="rgba(56,189,248,.1)"; ctx.fill(); ctx.strokeStyle="#38bdf8"; ctx.lineWidth=1.5;
    ctx.shadowBlur=8; ctx.shadowColor="#38bdf8"; ctx.stroke(); ctx.shadowBlur=0;
    state.dots.forEach(d=>{
      ctx.beginPath(); ctx.arc(d.x,d.y,2.5,0,Math.PI*2); ctx.fillStyle="#38bdf8"; ctx.globalAlpha=d.a; ctx.fill();
      d.y-=d.speed; d.a-=.012;
      if(d.a<=0){ d.y=h*.85+Math.random()*8; d.x=w*.25+Math.random()*w*.5; d.a=.8; }
    });
    ctx.globalAlpha=1;
  }
);

makeCanvasAnim("bcwc-cv4",
  (ctx,w,h,state)=>{ state.bars=[.3,.55,.75,.45,.9]; },
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const bw=w*.1,gap=w*.04,tot=(bw+gap)*state.bars.length-gap,sx=(w-tot)/2,by=h*.82;
    state.bars.forEach((b,i)=>{
      const th=b*h*.65, ah=th*(.5+.5*Math.sin(state.frame*.025+i*.6)), x=sx+i*(bw+gap);
      const g=ctx.createLinearGradient(0,by-ah,0,by); g.addColorStop(0,"#7b2fff"); g.addColorStop(1,"#ff2d9b");
      ctx.fillStyle=g; ctx.shadowBlur=6; ctx.shadowColor="#7b2fff";
      ctx.beginPath(); ctx.roundRect(x,by-ah,bw,ah,3); ctx.fill(); ctx.shadowBlur=0;
    });
    ctx.beginPath(); ctx.moveTo(sx-4,h*.12); ctx.lineTo(sx-4,by+2); ctx.lineTo(w-sx+4,by+2);
    ctx.strokeStyle="rgba(123,47,255,.25)"; ctx.lineWidth=1; ctx.stroke();
  }
);

makeCanvasAnim("bcwc-cv5",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2,R=w*.27;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.strokeStyle="#f59e0b"; ctx.lineWidth=1.5;
    ctx.shadowBlur=8; ctx.shadowColor="#f59e0b"; ctx.stroke(); ctx.shadowBlur=0;
    [-R*.45,0,R*.45].forEach(dy=>{
      const rr=Math.sqrt(R*R-dy*dy);
      ctx.beginPath(); ctx.ellipse(cx,cy+dy,rr,rr*.35,0,0,Math.PI*2);
      ctx.strokeStyle="rgba(245,158,11,.25)"; ctx.lineWidth=1; ctx.stroke();
    });
    ctx.beginPath(); ctx.ellipse(cx,cy,R*.4,R,0,0,Math.PI*2); ctx.strokeStyle="rgba(245,158,11,.25)"; ctx.lineWidth=1; ctx.stroke();
    const oa=state.frame*.035, ox=cx+Math.cos(oa)*R*1.3, oy=cy+Math.sin(oa)*R*.45;
    ctx.beginPath(); ctx.ellipse(cx,cy,R*1.3,R*.45,0,0,Math.PI*2);
    ctx.strokeStyle="rgba(245,158,11,.18)"; ctx.lineWidth=1; ctx.setLineDash([3,6]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(ox,oy,3.5,0,Math.PI*2); ctx.fillStyle="#f59e0b"; ctx.shadowBlur=10; ctx.shadowColor="#f59e0b"; ctx.fill(); ctx.shadowBlur=0;
    const pr=(Math.sin(state.frame*.06)+1)*3+2;
    ctx.beginPath(); ctx.arc(cx+R*.12,cy+R*.15,pr,0,Math.PI*2);
    ctx.strokeStyle=`rgba(239,68,68,${.7-pr*.07})`; ctx.lineWidth=1; ctx.stroke();
  }
);

/* Card scroll reveal */
const cObs=new IntersectionObserver((en)=>{
  en.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("vis"); cObs.unobserve(e.target); } });
},{ threshold:.2 });
document.querySelectorAll(".bcwc-card").forEach(c=>cObs.observe(c));

/* Star + client counter */
const pObs=new IntersectionObserver((en)=>{
  en.forEach(e=>{
    if(!e.isIntersecting) return; pObs.unobserve(e.target);
    const rEl=document.getElementById("bcwcRatingNum"), stars=document.querySelectorAll("#bcwcStars .bcwc-star");
    const d1=1800,s1=performance.now();
    (function tr(now){
      const p=Math.min((now-s1)/d1,1),ease=1-Math.pow(1-p,3),val=ease*4.7;
      rEl.textContent=val.toFixed(1)+" / 5";
      stars.forEach((s,i)=>{
        if(val>=i+1){ s.classList.add("lit"); s.classList.remove("half"); }
        else if(val>=i+.5){ s.classList.add("half"); s.classList.remove("lit"); }
        else s.classList.remove("lit","half");
      });
      if(p<1) requestAnimationFrame(tr);
    })(performance.now());
    const cEl=document.getElementById("bcwcClientNum"),d2=2400,s2=performance.now();
    (function tc(now){
      const p=Math.min((now-s2)/d2,1),ease=1-Math.pow(1-p,3);
      cEl.textContent=Math.round(ease*2000)+(p>=1?"+":"");
      if(p<1) requestAnimationFrame(tc);
    })(performance.now());
  });
},{ threshold:.3 });
const pb=document.getElementById("bcwcProofBar");
if(pb) pObs.observe(pb);

/* ═══════════════════════════════════════════════════════════════
   12. HOW WE WORK — step icon canvases + timeline
═══════════════════════════════════════════════════════════════ */

makeCanvasAnim("bchw-ic1",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2-4,bw=w*.52,bh=h*.38,br=10;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,bw*.7);
    g.addColorStop(0,"rgba(0,229,255,.12)"); g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(cx,cy,bw*.65,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx-bw/2,cy-bh/2,bw,bh,br);
    ctx.fillStyle="rgba(0,229,255,.1)"; ctx.strokeStyle="#00e5ff"; ctx.lineWidth=1.8;
    ctx.shadowBlur=8; ctx.shadowColor="#00e5ff"; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(cx-bw*.15,cy+bh/2); ctx.lineTo(cx-bw*.3,cy+bh/2+h*.1); ctx.lineTo(cx+bw*.05,cy+bh/2);
    ctx.fillStyle="rgba(0,229,255,.1)"; ctx.strokeStyle="#00e5ff"; ctx.lineWidth=1.5; ctx.fill(); ctx.stroke();
    [0,Math.PI*.66,Math.PI*1.33].forEach((phase,i)=>{
      const pulse=Math.sin(state.frame*.08+phase),dy=-3+pulse*3,x=cx+(i-1)*w*.1;
      ctx.beginPath(); ctx.arc(x,cy+dy,3.5,0,Math.PI*2); ctx.fillStyle="#00e5ff";
      ctx.globalAlpha=.5+.5*((pulse+1)/2); ctx.fill();
    });
    ctx.globalAlpha=1;
  }
);

makeCanvasAnim("bchw-ic2",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h*.46,R=w*.24;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*2.2);
    g.addColorStop(0,"rgba(123,47,255,.18)"); g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(cx,cy,R*2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    for(let i=0;i<8;i++){
      const angle=(i/8)*Math.PI*2+state.frame*.015, pulse=.6+.4*Math.sin(state.frame*.06+i*.8);
      ctx.beginPath(); ctx.moveTo(cx+Math.cos(angle)*R*1.35,cy+Math.sin(angle)*R*1.35);
      ctx.lineTo(cx+Math.cos(angle)*R*(1.7+.2*pulse),cy+Math.sin(angle)*R*(1.7+.2*pulse));
      ctx.strokeStyle=`rgba(123,47,255,${.25*pulse})`; ctx.lineWidth=1.5; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.fillStyle="rgba(123,47,255,.1)"; ctx.strokeStyle="#7b2fff"; ctx.lineWidth=1.8;
    ctx.shadowBlur=10; ctx.shadowColor="#7b2fff"; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(cx-R*.35,cy+R*.1); ctx.lineTo(cx-R*.18,cy-R*.25); ctx.lineTo(cx,cy+R*.1); ctx.lineTo(cx+R*.18,cy-R*.25); ctx.lineTo(cx+R*.35,cy+R*.1);
    ctx.strokeStyle="#7b2fff"; ctx.lineWidth=1.8; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke();
    [[-0.2,.2],[-0.15,.15]].forEach(([lx,rx],i)=>{
      ctx.beginPath(); ctx.moveTo(cx+R*lx,cy+R*(.42+i*.12)); ctx.lineTo(cx+R*rx,cy+R*(.42+i*.12));
      ctx.strokeStyle="#7b2fff"; ctx.lineWidth=1.5; ctx.stroke();
    });
  }
);

makeCanvasAnim("bchw-ic3",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w*.44,cy=h*.44,R=w*.23;
    const scanY=cy-R+((Math.sin(state.frame*.05)+1)/2)*R*2;
    const scanHW=Math.sqrt(Math.max(0,R*R-(scanY-cy)*(scanY-cy)));
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
    ctx.beginPath(); ctx.moveTo(cx-scanHW,scanY); ctx.lineTo(cx+scanHW,scanY);
    ctx.strokeStyle="rgba(255,45,155,.6)"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle="rgba(255,45,155,.05)"; ctx.fillRect(cx-R,cy-R,R*2,scanY-(cy-R)); ctx.restore();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.fillStyle="rgba(255,45,155,.08)"; ctx.strokeStyle="#ff2d9b"; ctx.lineWidth=2;
    ctx.shadowBlur=10; ctx.shadowColor="#ff2d9b"; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    const ha=Math.PI*.78;
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(ha)*R,cy+Math.sin(ha)*R);
    ctx.lineTo(cx+Math.cos(ha)*(R+w*.22),cy+Math.sin(ha)*(R+h*.22));
    ctx.strokeStyle="#ff2d9b"; ctx.lineWidth=3; ctx.lineCap="round"; ctx.shadowBlur=8; ctx.shadowColor="#ff2d9b"; ctx.stroke(); ctx.shadowBlur=0;
    ctx.strokeStyle="rgba(255,45,155,.3)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx-R*.7,cy); ctx.lineTo(cx+R*.7,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-R*.7); ctx.lineTo(cx,cy+R*.7); ctx.stroke();
  }
);

makeCanvasAnim("bchw-ic4",
  (ctx,w,h,state)=>{},
  (ctx,w,h,state)=>{
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2,R=w*.28,ri=w*.19,t=10;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.8);
    g.addColorStop(0,"rgba(245,158,11,.14)"); g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(cx,cy,R*1.6,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(state.frame*.022); ctx.beginPath();
    for(let i=0;i<t;i++){
      const a1=(i/t)*Math.PI*2-(Math.PI/t)*.4, a2=(i/t)*Math.PI*2+(Math.PI/t)*.4;
      const a3=((i+.5)/t)*Math.PI*2-(Math.PI/t)*.3, a4=((i+.5)/t)*Math.PI*2+(Math.PI/t)*.3;
      ctx.lineTo(Math.cos(a1)*R,Math.sin(a1)*R); ctx.lineTo(Math.cos(a2)*R,Math.sin(a2)*R);
      ctx.lineTo(Math.cos(a3)*ri,Math.sin(a3)*ri); ctx.lineTo(Math.cos(a4)*ri,Math.sin(a4)*ri);
    }
    ctx.closePath(); ctx.fillStyle="rgba(245,158,11,.1)"; ctx.strokeStyle="#f59e0b"; ctx.lineWidth=1.8;
    ctx.shadowBlur=10; ctx.shadowColor="#f59e0b"; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0; ctx.restore();
    const ay=Math.sin(state.frame*.07)*4;
    ctx.save(); ctx.translate(cx,cy+ay);
    ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(0,5);
    ctx.strokeStyle="#f59e0b"; ctx.lineWidth=2; ctx.shadowBlur=6; ctx.shadowColor="#f59e0b"; ctx.lineCap="round"; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6,1); ctx.lineTo(0,8); ctx.lineTo(6,1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7,10); ctx.lineTo(7,10); ctx.stroke(); ctx.shadowBlur=0; ctx.restore();
  }
);

/* How-we-work step reveal */
const sObs=new IntersectionObserver((en)=>{
  en.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("bchw-vis"); sObs.unobserve(e.target); } });
},{ threshold:.2 });
document.querySelectorAll(".bchw-step").forEach(s=>sObs.observe(s));

/* Timeline line canvas */
(function(){
  function initLine(){
    const lineCv=document.getElementById("bchw-line-canvas");
    const tl=document.getElementById("bchwTimeline");
    const steps=document.querySelectorAll(".bchw-step");
    if(!lineCv||!tl||window.innerWidth<900) return;
    const tlR=tl.getBoundingClientRect(),W=tlR.width-104,H=140,dpr=window.devicePixelRatio||1;
    lineCv.width=W*dpr; lineCv.height=H*dpr;
    lineCv.style.width=W+"px"; lineCv.style.height=H+"px";
    const ctx=lineCv.getContext("2d"); ctx.scale(dpr,dpr);
    const pts=[...steps].map(s=>{
      const sr=s.getBoundingClientRect(),tr=tl.getBoundingClientRect();
      return {x:sr.left+sr.width/2-tr.left-52,y:60};
    });
    const segC=[["#00e5ff","#7b2fff"],["#7b2fff","#ff2d9b"],["#ff2d9b","#f59e0b"]];
    const PKTS=[]; let prog=0,filled=false,ptimer=0,frame=0,alive=true,lastT=0;

    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
      ctx.strokeStyle="rgba(0,229,255,.1)"; ctx.lineWidth=3; ctx.setLineDash([6,10]); ctx.stroke(); ctx.setLineDash([]);
      const totLen=pts.reduce((s,p,i)=>i===0?0:s+Math.hypot(p.x-pts[i-1].x,p.y-pts[i-1].y),0);
      let drawn=0;
      for(let i=1;i<pts.length;i++){
        const sL=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
        const ss=drawn/totLen,se=(drawn+sL)/totLen; drawn+=sL;
        if(prog<=ss) break;
        const sp=Math.min((prog-ss)/(se-ss),1);
        const x1=pts[i-1].x,y1=pts[i-1].y,x2=pts[i].x,y2=pts[i].y;
        const ex=x1+(x2-x1)*sp,ey=y1+(y2-y1)*sp;
        const g=ctx.createLinearGradient(x1,y1,x2,y2);
        g.addColorStop(0,segC[i-1][0]); g.addColorStop(1,segC[i-1][1]);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey);
        ctx.strokeStyle=g; ctx.lineWidth=3; ctx.shadowBlur=8; ctx.shadowColor=segC[i-1][0]; ctx.lineCap="round"; ctx.stroke(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(ex,ey,5,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.shadowBlur=12; ctx.shadowColor=segC[i-1][1]; ctx.fill(); ctx.shadowBlur=0;
      }
      pts.forEach((p,i)=>{
        if(prog*(pts.length-1)>=i){
          const pulse=.5+.5*Math.sin(frame*.06+i);
          ctx.beginPath(); ctx.arc(p.x,p.y,7+pulse*2,0,Math.PI*2); ctx.fillStyle="rgba(0,229,255,.08)"; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.strokeStyle="#00e5ff"; ctx.lineWidth=2;
          ctx.shadowBlur=10; ctx.shadowColor="#00e5ff"; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
        }
      });
      PKTS.forEach(pk=>{
        ctx.beginPath(); ctx.arc(pk.x,pk.y,pk.r,0,Math.PI*2); ctx.fillStyle=pk.color; ctx.globalAlpha=pk.alpha;
        ctx.shadowBlur=8; ctx.shadowColor=pk.color; ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
        pk.t+=.012; pk.alpha-=.005;
        pk.x=pts[pk.seg].x+(pts[pk.seg+1].x-pts[pk.seg].x)*pk.t;
        pk.y=pts[pk.seg].y+(pts[pk.seg+1].y-pts[pk.seg].y)*pk.t;
      });
      PKTS.splice(0,PKTS.filter(p=>p.t>=1||p.alpha<=0).length);
    }

    (function loop(ts){
      if(!alive) return;
      if(ts-lastT>=FRAME_INTERVAL){
        lastT=ts;
        if(!filled){ prog=Math.min(prog+.008,1); if(prog>=1) filled=true; }
        ptimer++;
        if(ptimer>28){ ptimer=0; if(filled&&pts.length>1){ const seg=Math.floor(Math.random()*(pts.length-1)); PKTS.push({x:pts[seg].x,y:pts[seg].y,t:0,seg,r:3.5+Math.random()*2,alpha:1,color:segC[seg][0]}); } }
        draw(); frame++;
      }
      requestAnimationFrame(loop);
    })(0);

    new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        alive=e.isIntersecting;
        if(e.isIntersecting&&prog>=1){ prog=0; filled=false; PKTS.length=0; }
      });
    },{ threshold:.2 }).observe(lineCv);
  }

  new IntersectionObserver((en)=>{
    en.forEach(e=>{ if(e.isIntersecting){ initLine(); } });
  },{ threshold:.2 }).observe(document.getElementById("bchw-how")||document.body);
  let rt; window.addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(initLine,300); });
})();

/* ═══════════════════════════════════════════════════════════════
   13. INDUSTRY CARDS — scroll reveal + count-up
═══════════════════════════════════════════════════════════════ */
const bctiCardObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("bcti-visible"); bctiCardObs.unobserve(e.target); } });
},{ threshold:.2 });
document.querySelectorAll(".bcti-card").forEach(c=>bctiCardObs.observe(c));

const bctiNumObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target,target=+el.dataset.target,dur=1400,start=performance.now();
    (function tick(now){
      const progress=Math.min((now-start)/dur,1),eased=1-Math.pow(1-progress,3);
      el.textContent=Math.round(eased*target)+"+"; if(progress<1) requestAnimationFrame(tick);
    })(performance.now());
    bctiNumObs.unobserve(el);
  });
},{ threshold:.5 });
document.querySelectorAll(".bcti-proj-num").forEach(n=>bctiNumObs.observe(n));

/* ═══════════════════════════════════════════════════════════════
   14. CTA CONTACT SECTION
═══════════════════════════════════════════════════════════════ */

makeCanvasAnim("bctc-particles",
  (ctx,W,H,state)=>{
    state.pts=[];
    for(let i=0;i<35;i++) state.pts.push({
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,
      r:.7+Math.random()*1.1,a:.03+Math.random()*.06,
      c:Math.random()>.5?"#00e5ff":"#7b2fff"
    });
  },
  (ctx,W,H,state)=>{
    ctx.clearRect(0,0,W,H);
    state.pts.forEach((p,i)=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.c; ctx.globalAlpha=p.a; ctx.fill();
      for(let j=i+1;j<state.pts.length;j++){
        const d=Math.hypot(p.x-state.pts[j].x,p.y-state.pts[j].y);
        if(d<90){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(state.pts[j].x,state.pts[j].y);
          ctx.strokeStyle=p.c; ctx.globalAlpha=.02*(1-d/90); ctx.lineWidth=.5; ctx.stroke(); }
      }
    });
    ctx.globalAlpha=1;
  }
);

/* Ripple on Get Quote */
const gqBtn=document.getElementById("bctcGetQuote");
if(gqBtn){ gqBtn.addEventListener("click",function(e){
  const rp=document.createElement("span"); rp.className="bctc-ripple";
  const r=this.getBoundingClientRect(); rp.style.left=e.clientX-r.left+"px"; rp.style.top=e.clientY-r.top+"px";
  this.appendChild(rp); setTimeout(()=>rp.remove(),700);
}); }

/* Form submit */
const form=document.getElementById("bctcForm");
if(form){ form.addEventListener("submit",function(e){
  e.preventDefault(); let ok=true;
  ["bctcName","bctcEmail","bctcMsg"].forEach(id=>{
    const el=document.getElementById(id);
    if(el&&!el.value.trim()){
      el.style.borderColor="rgba(255,45,155,.55)"; el.style.boxShadow="0 0 0 3px rgba(255,45,155,.09)"; ok=false;
      setTimeout(()=>{ el.style.borderColor=""; el.style.boxShadow=""; },2200);
    }
  });
  if(!ok) return;
  const btn=document.getElementById("bctcSubmitBtn"),txt=document.getElementById("bctcBtnTxt");
  btn.classList.add("sending"); txt.textContent="Sending...";
  setTimeout(()=>{ form.style.display="none"; const s=document.getElementById("bctcSuccess"); if(s) s.style.display="block"; },1400);
}); }

/* CTA scroll reveal */
const rObs=new IntersectionObserver((en)=>{
  en.forEach(e=>{ if(e.isIntersecting){ e.target.style.opacity="1"; e.target.style.transform="translateY(0)"; rObs.unobserve(e.target); } });
},{ threshold:.2 });
["#bctcLeft","#bctcRight"].forEach((sel,i)=>{
  const el=document.querySelector(sel);
  if(el){ el.style.cssText+=`opacity:0;transform:translateY(28px);transition:opacity .7s ease ${i*.15}s,transform .7s ease ${i*.15}s;`; rObs.observe(el); }
});

/* ═══════════════════════════════════════════════════════════════
   15. FOOTER CANVASES
═══════════════════════════════════════════════════════════════ */

makeCanvasAnim("bctf4-canvas-particles",
  (ctx,W,H,state)=>{
    state.pts=[];
    for(let i=0;i<50;i++) state.pts.push({
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,
      r:Math.random()*1.2+.3,a:Math.random()*.2+.04,
      c:Math.random()>.5?"#00e5ff":"#7b2fff"
    });
  },
  (ctx,W,H,state)=>{
    ctx.clearRect(0,0,W,H);
    state.pts.forEach((p,i)=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.c; ctx.globalAlpha=p.a; ctx.fill();
      for(let j=i+1;j<state.pts.length;j++){
        const d=Math.hypot(p.x-state.pts[j].x,p.y-state.pts[j].y);
        if(d<90){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(state.pts[j].x,state.pts[j].y);
          ctx.strokeStyle=p.c; ctx.globalAlpha=.025*(1-d/90); ctx.lineWidth=.5; ctx.stroke(); }
      }
    });
    ctx.globalAlpha=1;
  }
);

makeCanvasAnim("bctf4-canvas-circuit",
  (ctx,W,H,state)=>{
    state.traces=[];
    const cols=Math.floor(W/90),rows=Math.floor(H/70);
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++) if(Math.random()<.35){
      const x1=40+c*90+Math.random()*25,y1=30+r*70+Math.random()*18;
      const bx=x1+30+Math.random()*35,x2=bx,y2=y1+22+Math.random()*22;
      state.traces.push({x1,y1,bx,by:y1,x2,y2,
        color:Math.random()>.55?"rgba(0,229,255,":"rgba(123,47,255,",
        op:.06+Math.random()*.1,pulse:Math.random(),speed:.002+Math.random()*.003});
    }
  },
  (ctx,W,H,state)=>{
    ctx.clearRect(0,0,W,H);
    state.traces.forEach(t=>{
      ctx.beginPath(); ctx.moveTo(t.x1,t.y1); ctx.lineTo(t.bx,t.by); ctx.lineTo(t.x2,t.y2);
      ctx.strokeStyle=t.color+t.op+")"; ctx.lineWidth=1.2; ctx.stroke();
      [[t.x1,t.y1],[t.bx,t.by],[t.x2,t.y2]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fillStyle=t.color+t.op*1.6+")"; ctx.fill();
      });
      t.pulse+=t.speed; if(t.pulse>1) t.pulse=0;
      let px,py;
      if(t.pulse<.5){ const s=t.pulse/.5; px=t.x1+(t.bx-t.x1)*s; py=t.y1+(t.by-t.y1)*s; }
      else{ const s=(t.pulse-.5)/.5; px=t.bx+(t.x2-t.bx)*s; py=t.by+(t.y2-t.by)*s; }
      ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.globalAlpha=.55;
      ctx.shadowBlur=8; ctx.shadowColor=t.color+"1)"; ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
    });
  }
);

/* Footer column reveal */
const colObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("bctf4-vis"); colObs.unobserve(e.target); } });
},{ threshold:.2 });
document.querySelectorAll(".bctf4-col").forEach(el=>colObs.observe(el));

/* Footer stat count-up */
const statObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return; statObs.unobserve(e.target);
    const el=e.target,target=parseFloat(el.dataset.f4Target);
    const suffix=el.dataset.f4Suffix||"",dec=parseInt(el.dataset.f4Dec||"0"),dur=1600,t0=performance.now();
    (function tick(now){
      const p=Math.min((now-t0)/dur,1),ease=1-Math.pow(1-p,3);
      el.textContent=(ease*target).toFixed(dec)+suffix; if(p<1) requestAnimationFrame(tick);
    })(performance.now());
  });
},{ threshold:.5 });
document.querySelectorAll("[data-f4-target]").forEach(el=>statObs.observe(el));