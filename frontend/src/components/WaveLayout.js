
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { GradientOrbs } from './GradientOrbs';
import { NavbarWave } from './NavbarWave';

/* ─────────────────────────────────────────────
   CSS KEYFRAMES
   ───────────────────────────────────────────── */
const pageKeyframes = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

@keyframes orbFloat1 {
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(-60px, 40px) scale(1.05); }
  50%  { transform: translate(30px, -30px) scale(0.97); }
  75%  { transform: translate(-40px, -20px) scale(1.03); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes orbFloat2 {
  0%   { transform: translate(0, 0) scale(1.02); }
  30%  { transform: translate(50px, -50px) scale(0.96); }
  60%  { transform: translate(-40px, 30px) scale(1.04); }
  100% { transform: translate(0, 0) scale(1.02); }
}
@keyframes orbFloat3 {
  0%   { transform: translate(0, 0) scale(0.98); }
  35%  { transform: translate(-70px, 20px) scale(1.06); }
  70%  { transform: translate(50px, -40px) scale(0.94); }
  100% { transform: translate(0, 0) scale(0.98); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
@keyframes spinSlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes morphSphere {
  0%   { border-radius: 42% 58% 55% 45% / 56% 45% 55% 44%; transform: rotate(0deg) scale(1); }
  14%  { border-radius: 52% 48% 42% 58% / 48% 62% 38% 52%; transform: rotate(51deg) scale(1.04); }
  28%  { border-radius: 38% 62% 56% 44% / 55% 38% 62% 45%; transform: rotate(103deg) scale(0.97); }
  42%  { border-radius: 58% 42% 48% 52% / 42% 56% 44% 58%; transform: rotate(154deg) scale(1.06); }
  57%  { border-radius: 45% 55% 62% 38% / 52% 44% 56% 48%; transform: rotate(206deg) scale(0.98); }
  71%  { border-radius: 55% 45% 38% 62% / 44% 58% 42% 56%; transform: rotate(257deg) scale(1.03); }
  85%  { border-radius: 48% 52% 45% 55% / 58% 42% 58% 42%; transform: rotate(309deg) scale(1.01); }
  100% { border-radius: 42% 58% 55% 45% / 56% 45% 55% 44%; transform: rotate(360deg) scale(1); }
}
@keyframes sphereColorShift {
  0%   { background: radial-gradient(ellipse at 30% 20%, #60a5fa 0%, #2563eb 30%, #1d4ed8 55%, #1e3a8a 80%, #0f172a 100%); }
  25%  { background: radial-gradient(ellipse at 60% 30%, #93c5fd 0%, #3b82f6 30%, #2563eb 55%, #1d4ed8 80%, #172554 100%); }
  50%  { background: radial-gradient(ellipse at 40% 60%, #bfdbfe 0%, #60a5fa 30%, #3b82f6 55%, #1e40af 80%, #0f172a 100%); }
  75%  { background: radial-gradient(ellipse at 70% 40%, #93c5fd 0%, #2563eb 30%, #1d4ed8 55%, #1e3a8a 80%, #172554 100%); }
  100% { background: radial-gradient(ellipse at 30% 20%, #60a5fa 0%, #2563eb 30%, #1d4ed8 55%, #1e3a8a 80%, #0f172a 100%); }
}
@keyframes textReveal {
  0%   { opacity: 0; transform: scale(0.6); filter: blur(10px); }
  50%  { opacity: 1; transform: scale(1.05); filter: blur(0px); }
  80%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.2); filter: blur(4px); }
}
@keyframes emergencyPulse {
  0%   { box-shadow: 0 6px 24px rgba(220,38,38,0.45), 0 0 0 0 rgba(239,68,68,0.4); }
  50%  { box-shadow: 0 6px 24px rgba(220,38,38,0.45), 0 0 0 10px rgba(239,68,68,0); }
  100% { box-shadow: 0 6px 24px rgba(220,38,38,0.45), 0 0 0 0 rgba(239,68,68,0); }
}
`;

const StyleInjector = () => {
  useEffect(() => {
    const id = 'wave-layout-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = pageKeyframes;
      document.head.appendChild(style);
    }
    return () => {
      // Optional: don't check for existence to avoid flickering if multiple pages use it
      // but here we keep it simple
    };
  }, []);
  return null;
};

const SmoothScrolling = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
};

export const WaveLayout = ({ children, hideNavbar = false, className = '', style = {} }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const defaultStyle = { fontFamily: "'Outfit', sans-serif" };
  const mergedStyle = { ...defaultStyle, ...style };

  return (
    <div className={`min-h-screen relative bg-[#f8faff] dark:bg-black transition-colors duration-300 ${className}`} style={mergedStyle}>
      <StyleInjector />
      <SmoothScrolling />
      <GradientOrbs />

      {/* Content Level */}
      <div className="relative" style={{ zIndex: 2 }}>
        {!hideNavbar && <NavbarWave />}
        {children}
      </div>
    </div>
  );
};
