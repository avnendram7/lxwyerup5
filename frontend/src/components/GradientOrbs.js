import React from 'react';

// Two orbs with GPU-composited CSS animation.
// Key perf choices:
//  • will-change:transform → own compositor layer, no relayout/repaint on animation
//  • contain:strict → browser won't check siblings when compositing
//  • blur reduced to 30px (was 40px) — each extra px is expensive on large surfaces
//  • position:fixed so they don't scroll-repaint
const ORBS = [
  {
    color: 'rgba(59,130,246,0.16)',
    size: '36vw',
    top: '5%',
    left: '20%',
    anim: 'orbFloat1 28s ease-in-out infinite',
  },
  {
    color: 'rgba(37,99,235,0.10)',
    size: '34vw',
    top: '58%',
    left: '54%',
    anim: 'orbFloat3 32s ease-in-out infinite',
  },
];

export const GradientOrbs = () => (
  <div
    style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    {ORBS.map((orb, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: orb.top,
          left: orb.left,
          width: orb.size,
          height: orb.size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          animation: orb.anim,
          willChange: 'transform',
          transform: 'translateZ(0)',
          contain: 'strict',
        }}
      />
    ))}
  </div>
);
