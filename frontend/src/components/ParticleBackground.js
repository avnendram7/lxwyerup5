import React, { useEffect, useRef } from 'react';

// Performance-optimised: uses squared-distance (no sqrt), visibility API pause,
// mousemove throttle, and GPU layer hint on canvas.
const ParticleBackground = ({ darkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let frameCount = 0;
    let paused = false;

    // === Helpers ===
    const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

    // === Resize ===
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // === Particles ===
    const initParticles = () => {
      particles = [];
      // Fewer particles: 1 per 12 000 px² (was 9000)
      const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
      for (let i = 0; i < count; i++) particles.push(createParticle());
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2 + 1.2,
      color: darkMode
        ? `rgba(56,189,248,${(Math.random() * 0.4 + 0.25).toFixed(2)})`
        : `rgba(30,58,138,${(Math.random() * 0.3 + 0.15).toFixed(2)})`,
    });

    // === Update ===
    const updateParticle = (p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Mouse repulsion — squared distance avoids sqrt
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distSq = dx * dx + dy * dy;
      const maxDistSq = 160 * 160; // 160px radius

      if (distSq < maxDistSq && distSq > 0) {
        const dist = Math.sqrt(distSq); // sqrt only when inside radius
        const force = (1 - dist / 160) * 0.7;
        p.vx -= (dx / dist) * force;
        p.vy -= (dy / dist) * force;
      }

      // Friction + min velocity jitter
      p.vx *= 0.99;
      p.vy *= 0.99;
      if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.08;
      if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.08;

      // Speed cap
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }
    };

    // === Connections — squared distance, no sqrt, skip draw if alpha tiny ===
    const LINE_DIST = 110;
    const LINE_DIST_SQ = LINE_DIST * LINE_DIST;

    const connectParticles = () => {
      const n = particles.length;
      for (let a = 0; a < n - 1; a++) {
        for (let b = a + 1; b < n; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < LINE_DIST_SQ) {
            const alpha = (1 - dSq / LINE_DIST_SQ) * (darkMode ? 0.45 : 0.18);
            ctx.strokeStyle = darkMode
              ? `rgba(56,189,248,${alpha.toFixed(2)})`
              : `rgba(30,58,138,${alpha.toFixed(2)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    // === Animation loop ===
    const animate = () => {
      if (paused) { animationFrameId = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        updateParticle(p);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    // === Events ===
    const onMouseMove = (e) => {
      frameCount++;
      // Throttle: update mouse coords every 2 events only
      if (frameCount % 2 === 0) { mouse.x = e.clientX; mouse.y = e.clientY; }
    };
    const onVisibility = () => { paused = document.hidden; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        background: 'transparent',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    />
  );
};

export default ParticleBackground;
