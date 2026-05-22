(() => {
    const canvas = document.getElementById("bcbHeroCanvas");
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
  
    let particles = [];
    let animationId;
    let running = true;
    let mouse = { x: null, y: null };
  
    // ---------------------------
    // RESIZE
    // ---------------------------
    function resizeCanvas() {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  
    // ---------------------------
    // PARTICLE
    // ---------------------------
    class Particle {
      constructor() {
        this.reset();
      }
  
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
  
        this.baseX = this.x;
        this.baseY = this.y;
  
        this.size = Math.random() * 3 + 0.5;
  
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
  
        this.opacity = Math.random() * 0.6 + 0.4;
  
        this.depth = Math.random();
      }
  
      move(time) {
        // base movement
        this.x += this.speedX;
        this.y += this.speedY;
  
        // wave motion (premium feel)
        this.x += Math.sin(time * 0.001 + this.depth * 5) * 0.3;
        this.y += Math.cos(time * 0.001 + this.depth * 5) * 0.3;
  
        // mouse interaction (subtle)
        if (mouse.x && mouse.y) {
          let dx = this.x - mouse.x;
          let dy = this.y - mouse.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
  
          if (dist < 120) {
            this.x += dx * 0.01;
            this.y += dy * 0.01;
          }
        }
  
        // wrap edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
  
      draw(time) {
        const pulse = Math.sin(time * 0.002) * 0.5 + 0.5;
  
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
  
        // glow
        ctx.shadowBlur = 20 * this.depth;
        ctx.shadowColor = `rgba(0, 229, 255, ${pulse})`;
  
        ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity})`;
        ctx.fill();
  
        ctx.shadowBlur = 0;
      }
    }
  
    // ---------------------------
    // INIT
    // ---------------------------
    function initParticles() {
      particles = [];
      const count = window.innerWidth < 768 ? 60 : 140;
  
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();
  
    // ---------------------------
    // CONNECTION LINES
    // ---------------------------
    function connectParticles(time) {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = dx * dx + dy * dy;
  
          if (dist < 140 * 140) {
            let opacity = 1 - dist / (140 * 140);
  
            ctx.strokeStyle = `rgba(123, 47, 255, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
  
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }
  
    // ---------------------------
    // GRADIENT FLOW (ULTRA PREMIUM)
    // ---------------------------
    function drawGradient(time) {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
  
      gradient.addColorStop(
        0,
        `rgba(0, 229, 255, ${0.05 + Math.sin(time * 0.001) * 0.02})`
      );
      gradient.addColorStop(
        1,
        `rgba(123, 47, 255, ${0.05 + Math.cos(time * 0.001) * 0.02})`
      );
  
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    // ---------------------------
    // ANIMATION LOOP
    // ---------------------------
    function animate(time = 0) {
      if (!running) return;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      drawGradient(time);
  
      particles.forEach(p => {
        p.move(time);
        p.draw(time);
      });
  
      connectParticles(time);
  
      animationId = requestAnimationFrame(animate);
    }
  
    animate();
  
    // ---------------------------
    // MOUSE
    // ---------------------------
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  
    // ---------------------------
    // VISIBILITY
    // ---------------------------
    const hero = document.getElementById("bcb-hero-section");
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            running = true;
            animate();
          } else {
            running = false;
            cancelAnimationFrame(animationId);
          }
        });
      },
      { threshold: 0.2 }
    );
  
    if (hero) observer.observe(hero);
  
    // ---------------------------
    // TAB SWITCH
    // ---------------------------
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(animationId);
      } else {
        running = true;
        animate();
      }
    });
  
  })();