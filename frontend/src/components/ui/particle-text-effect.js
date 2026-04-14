import { useEffect, useRef } from "react";

// ─── Particle Class ────────────────────────────────────────────────────────────
class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };

    this.closeEnoughTarget = 80;
    this.maxSpeed = 3.5;
    this.maxForce = 0.18;
    this.radius = 1.5; // rendered radius in canvas px
    this.isKilled = false;

    this.startColor = { r: 0, g: 0, b: 0, a: 0 };
    this.targetColor = { r: 255, g: 255, b: 255, a: 1 };
    this.colorWeight = 0;
    this.colorBlendRate = 0.025;
  }

  move() {
    const dx = this.target.x - this.pos.x;
    const dy = this.target.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const proximityMult = distance < this.closeEnoughTarget
      ? distance / this.closeEnoughTarget
      : 1;

    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const desired = {
      x: (dx / mag) * this.maxSpeed * proximityMult,
      y: (dy / mag) * this.maxSpeed * proximityMult,
    };

    let steerX = desired.x - this.vel.x;
    let steerY = desired.y - this.vel.y;
    const steerMag = Math.sqrt(steerX * steerX + steerY * steerY) || 1;
    steerX = (steerX / steerMag) * this.maxForce;
    steerY = (steerY / steerMag) * this.maxForce;

    this.acc.x += steerX;
    this.acc.y += steerY;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }

    const r = Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight);
    const g = Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight);
    const b = Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight);
    const a = this.startColor.a + (this.targetColor.a - this.startColor.a) * this.colorWeight;

    // Glow layer (soft, large)
    const glowRadius = this.radius * 3.5;
    const grd = ctx.createRadialGradient(
      this.pos.x, this.pos.y, 0,
      this.pos.x, this.pos.y, glowRadius
    );
    grd.addColorStop(0,   `rgba(${r},${g},${b},${(a * 0.45).toFixed(3)})`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},${(a * 0.15).toFixed(3)})`);
    grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a, 1).toFixed(3)})`;
    ctx.fill();
  }

  kill(width, height) {
    if (!this.isKilled) {
      const cx = width / 2, cy = height / 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = (width + height) / 2;
      this.target.x = cx + Math.cos(angle) * dist;
      this.target.y = cy + Math.sin(angle) * dist;

      // Snapshot current blended color as new start
      const cw = this.colorWeight;
      this.startColor = {
        r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * cw),
        g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * cw),
        b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * cw),
        a: this.startColor.a + (this.targetColor.a - this.startColor.a) * cw,
      };
      this.targetColor = { r: 0, g: 0, b: 0, a: 0 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }
}

// ─── Word-to-color map (cinematic palette) ──────────────────────────────────
const WORD_COLORS = [
  { r: 82,  g: 166, b: 255, a: 1 },  // "Artificial Intelligence" — electric blue
  { r: 218, g: 165, b: 32,  a: 1 },  // "Apex Lawyer"             — cinematic gold
  { r: 240, g: 240, b: 255, a: 1 },  // "Justice"                 — pearl white
];

const DEFAULT_WORDS = ["Artificial Intelligence", "Apex Lawyer", "Justice"];

// Spread spawn across the whole canvas edge, not just center
function edgeSpawn(width, height) {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: return { x: Math.random() * width, y: -20 };
    case 1: return { x: Math.random() * width, y: height + 20 };
    case 2: return { x: -20,         y: Math.random() * height };
    default: return { x: width + 20, y: Math.random() * height };
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export function ParticleTextEffect({ words = DEFAULT_WORDS }) {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const particlesRef = useRef([]);
  const frameRef     = useRef(0);
  const wordIdxRef   = useRef(0);
  const mouseRef     = useRef({ x: -9999, y: -9999, pressed: false, right: false });

  // Internal logical canvas size (high-res)
  const W = 1400;
  const H = 560;
  const PIXEL_STEP = 3; // sample every 3rd pixel → dense but not absurd

  function buildWord(wordIndex, canvas) {
    const word   = words[wordIndex];
    const color  = WORD_COLORS[wordIndex % WORD_COLORS.length];
    const ctx    = canvas.getContext("2d");

    // Off-screen for text sampling
    const off    = document.createElement("canvas");
    off.width    = W;
    off.height   = H;
    const octx   = off.getContext("2d");

    // Auto-fit font size
    let fs = 160;
    octx.font = `800 ${fs}px 'Outfit', 'Helvetica Neue', Arial, sans-serif`;
    while (octx.measureText(word).width > W * 0.90 && fs > 40) {
      fs -= 4;
      octx.font = `800 ${fs}px 'Outfit', 'Helvetica Neue', Arial, sans-serif`;
    }
    octx.fillStyle    = "white";
    octx.textAlign    = "center";
    octx.textBaseline = "middle";
    octx.fillText(word, W / 2, H / 2);

    const { data: pixels } = octx.getImageData(0, 0, W, H);

    const particles   = particlesRef.current;
    let   pIdx        = 0;
    const hit         = [];

    for (let i = 0; i < pixels.length; i += PIXEL_STEP * 4) {
      if (pixels[i + 3] > 128) hit.push(i);
    }

    // Fisher-Yates shuffle → fluid swarm emergence
    for (let i = hit.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [hit[i], hit[j]] = [hit[j], hit[i]];
    }

    for (const idx of hit) {
      const x = (idx / 4) % W;
      const y = ((idx / 4) / W) | 0;

      let p;
      if (pIdx < particles.length) {
        p = particles[pIdx];
        p.isKilled = false;
        pIdx++;
      } else {
        p = new Particle();
        const spawn = edgeSpawn(W, H);
        p.pos.x = spawn.x;
        p.pos.y = spawn.y;
        p.maxSpeed      = 3 + Math.random() * 5;
        p.maxForce      = p.maxSpeed * 0.055;
        p.radius        = 0.9 + Math.random() * 1.4;   // 0.9–2.3 px
        p.colorBlendRate = 0.018 + Math.random() * 0.022;
        particles.push(p);
      }

      // Colour transition: snap current blend as start
      const cw = p.colorWeight;
      p.startColor = {
        r: Math.round(p.startColor.r + (p.targetColor.r - p.startColor.r) * cw),
        g: Math.round(p.startColor.g + (p.targetColor.g - p.startColor.g) * cw),
        b: Math.round(p.startColor.b + (p.targetColor.b - p.startColor.b) * cw),
        a: p.startColor.a + (p.targetColor.a - p.startColor.a) * cw,
      };
      p.targetColor  = color;
      p.colorWeight  = 0;
      p.target.x     = x;
      p.target.y     = y;
    }

    // Kill surplus particles
    for (let i = pIdx; i < particles.length; i++) {
      particles[i].kill(W, H);
    }
  }

  function animate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Deep motion blur (cinematic trail effect)
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(0, 0, W, H);

    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.move();
      p.draw(ctx);

      if (p.isKilled) {
        if (p.pos.x < -60 || p.pos.x > W + 60 || p.pos.y < -60 || p.pos.y > H + 60) {
          particles.splice(i, 1);
        }
      }
    }

    // Mouse scatter (right-click hold)
    const m = mouseRef.current;
    if (m.pressed && m.right) {
      const RADIUS = 80;
      for (const p of particles) {
        const dx = p.pos.x - m.x;
        const dy = p.pos.y - m.y;
        if (Math.sqrt(dx * dx + dy * dy) < RADIUS) p.kill(W, H);
      }
    }

    // Advance word every 5 s (300 frames)
    frameRef.current++;
    if (frameRef.current % 300 === 0) {
      wordIdxRef.current = (wordIdxRef.current + 1) % words.length;
      buildWord(wordIdxRef.current, canvas);
    }

    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set logical size (drawn at high res, CSS scales down)
    canvas.width  = W;
    canvas.height = H;

    buildWord(0, canvas);
    animate();

    // Scale mouse coords to logical canvas space
    function toLogical(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width)  * W,
        y: ((e.clientY - rect.top)  / rect.height) * H,
      };
    }

    function onDown(e) {
      const c = toLogical(e);
      mouseRef.current = { x: c.x, y: c.y, pressed: true, right: e.button === 2 };
    }
    function onUp() { mouseRef.current.pressed = false; mouseRef.current.right = false; }
    function onMove(e) {
      const c = toLogical(e);
      mouseRef.current.x = c.x;
      mouseRef.current.y = c.y;
    }
    function onCtx(e) { e.preventDefault(); }

    canvas.addEventListener("mousedown",   onDown);
    canvas.addEventListener("mouseup",     onUp);
    canvas.addEventListener("mousemove",   onMove);
    canvas.addEventListener("contextmenu", onCtx);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown",   onDown);
      canvas.removeEventListener("mouseup",     onUp);
      canvas.removeEventListener("mousemove",   onMove);
      canvas.removeEventListener("contextmenu", onCtx);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        width:          "100%",
        height:         "100vh",
        background:     "#000000",
        position:       "relative",
        overflow:       "hidden",
      }}
    >
      {/* Cinematic vignette */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          background:     "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.82) 100%)",
          pointerEvents:  "none",
          zIndex:         2,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          width:    "100%",
          height:   "100%",
          display:  "block",
          position: "relative",
          zIndex:   1,
        }}
      />

      {/* Bottom hint */}
      <p
        style={{
          position:      "absolute",
          bottom:        "28px",
          left:          "50%",
          transform:     "translateX(-50%)",
          color:         "rgba(255,255,255,0.18)",
          fontSize:      "11px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          fontFamily:    "'Outfit', sans-serif",
          pointerEvents: "none",
          zIndex:        3,
          whiteSpace:    "nowrap",
        }}
      >
        Words change every 5 seconds &nbsp;·&nbsp; Right-click drag to scatter
      </p>
    </div>
  );
}

export default ParticleTextEffect;
