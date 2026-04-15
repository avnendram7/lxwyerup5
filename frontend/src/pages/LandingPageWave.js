import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, useInView, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import {
    ArrowRight, Shield, Zap, Users, Brain,
    Clock, FileText, Gavel, BookOpen,
    MessageSquare, Search, UserCheck, Menu, X, ChevronDown, Scale, AlertTriangle, Sparkles
} from 'lucide-react';
import CountUp from 'react-countup';
import { NavbarWave } from '../components/NavbarWave';
import { GradientOrbs } from '../components/GradientOrbs';
import { Button } from '../components/ui/button';
import MagicButton from '../components/ui/MagicButton';
import { useLang } from '../context/LanguageContext';
import { ParticleTextEffect } from '../components/ui/particle-text-effect';
import GrainHeroSection from '../components/ui/grain-gradient-hero-section';
import AnimatedTextCycle from '../components/ui/animated-text-cycle';
import { LogoCloud } from '../components/ui/logo-cloud-3';
import { InfiniteSlider } from '../components/ui/infinite-slider';
import { Hero } from '../components/ui/hero';
import { BeamsBackground } from '../components/ui/beams-background';

/* ─────────────────────────────────────────────
   CSS KEYFRAMES
   ───────────────────────────────────────────── */

const pageKeyframes = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@1,700&display=swap');

/* ── LxwyerAI button — exact copy from NavbarWave ── */
@keyframes borderPulse {
  0%, 100% { border-color: rgba(255,255,255,0.12); box-shadow: 0 0 0px rgba(255,255,255,0), inset 0 1px 0 rgba(255,255,255,0.04); }
  50%       { border-color: rgba(255,255,255,0.45); box-shadow: 0 0 10px rgba(255,255,255,0.15), 0 0 24px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08); }
}
@keyframes shimmerSlide {
  0%        { transform: translateX(-160%) skewX(-16deg); opacity: 0; }
  6%        { opacity: 1; }
  35%       { transform: translateX(260%) skewX(-16deg); opacity: 1; }
  36%, 100% { opacity: 0; transform: translateX(260%) skewX(-16deg); }
}
@keyframes textFlicker {
  0%, 90%, 100% { opacity: 1; }
  92%            { opacity: 0.75; }
  94%            { opacity: 1; }
  96%            { opacity: 0.85; }
}
.lxwyer-wrap {
  position: relative;
  display: inline-flex;
  border-radius: 9999px;
  overflow: hidden;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.12);
  animation: borderPulse 2s ease-in-out infinite;
  transition: transform 0.2s;
}
.lxwyer-wrap:hover {
  transform: scale(1.04);
  animation: borderPulse 1s ease-in-out infinite;
}
.lxwyer-spin {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 50%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(200,200,200,0.05) 25%,
    rgba(255,255,255,0.22) 50%,
    rgba(200,200,200,0.05) 75%,
    transparent 100%
  );
  animation: shimmerSlide 2.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
.lxwyer-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 9999px;
}
.lxwyer-text { animation: textFlicker 6s ease-in-out infinite; }


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




/* ── 3D Animated Sphere ── */
@keyframes morphSphere {
  0%   { transform: rotate(0deg)   scale(1);   }
  25%  { transform: rotate(90deg)  scale(1.03); }
  50%  { transform: rotate(180deg) scale(0.97); }
  75%  { transform: rotate(270deg) scale(1.02); }
  100% { transform: rotate(360deg) scale(1);   }
}
@keyframes sphereColorShift {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.92; }
}
@keyframes sphereShine {
  0%   { transform: rotate(0deg); opacity: 0.6; }
  50%  { opacity: 0.9; }
  100% { transform: rotate(360deg); opacity: 0.6; }
}
@keyframes orbitRing1 {
  0%   { transform: rotateX(70deg) rotateZ(0deg); }
  100% { transform: rotateX(70deg) rotateZ(360deg); }
}
@keyframes orbitRing2 {
  0%   { transform: rotateX(70deg) rotateY(60deg) rotateZ(0deg); }
  100% { transform: rotateX(70deg) rotateY(60deg) rotateZ(-360deg); }
}
@keyframes orbitRing3 {
  0%   { transform: rotateX(50deg) rotateY(-30deg) rotateZ(0deg); }
  100% { transform: rotateX(50deg) rotateY(-30deg) rotateZ(360deg); }
}
@keyframes particleDrift1 {
  0%   { transform: translate(0,0) scale(1); opacity: 0.5; }
  25%  { transform: translate(30px,-40px) scale(1.3); opacity: 0.8; }
  50%  { transform: translate(-20px,-70px) scale(0.8); opacity: 0.4; }
  75%  { transform: translate(40px,-30px) scale(1.1); opacity: 0.7; }
  100% { transform: translate(0,0) scale(1); opacity: 0.5; }
}
@keyframes particleDrift2 {
  0%   { transform: translate(0,0) scale(0.8); opacity: 0.3; }
  30%  { transform: translate(-40px,20px) scale(1.2); opacity: 0.7; }
  60%  { transform: translate(30px,50px) scale(0.6); opacity: 0.5; }
  100% { transform: translate(0,0) scale(0.8); opacity: 0.3; }
}
@keyframes crystalFloat {
  0%   { transform: translateY(0) rotate(0deg); opacity: 0.4; }
  25%  { transform: translateY(-20px) rotate(90deg); opacity: 0.7; }
  50%  { transform: translateY(-10px) rotate(180deg); opacity: 0.5; }
  75%  { transform: translateY(-25px) rotate(270deg); opacity: 0.8; }
  100% { transform: translateY(0) rotate(360deg); opacity: 0.4; }
}
@keyframes sphereShadow {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.2; }
  50% { transform: translateX(-50%) scale(1.1); opacity: 0.12; }
}
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes spinReverse {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}
@keyframes convergeToCenter {
  0%   { transform: translate(var(--startX), var(--startY)) scale(0.8); opacity: 0; }
  10%  { opacity: 1; }
  80%  { opacity: 0.8; }
  100% { transform: translate(0, 0) scale(0.2); opacity: 0; }
}
@keyframes rayPulse {
  0%   { opacity: 0; transform: scaleX(0); }
  30%  { opacity: 0.6; transform: scaleX(1); }
  70%  { opacity: 0.4; }
  100% { opacity: 0; transform: scaleX(1.1); }
}
@keyframes dotGlow {
  0%, 100% { box-shadow: 0 0 4px rgba(59,130,246,0.4); }
  50% { box-shadow: 0 0 12px rgba(59,130,246,0.8), 0 0 24px rgba(96,165,250,0.3); }
}
@keyframes labelFloat {
  0%   { opacity: 0; transform: translateY(5px); }
  20%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(-5px); }
}
@keyframes balanceBeam {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(6deg); }
  75% { transform: rotate(-6deg); }
}
@keyframes counterRotate {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-6deg); }
  75% { transform: rotate(6deg); }
}
@keyframes expandRay {
  0% { width: 0px; opacity: 0; }
  10% { opacity: 0.5; }
  80% { opacity: 0.3; }
  100% { width: var(--dist); opacity: 0; }
}
@keyframes floatOut {
  0% { transform: translateX(0) scale(0); opacity: 0; }
  10% { opacity: 1; transform: translateX(20px) scale(0.5); }
  90% { opacity: 1; transform: translateX(var(--dist)) scale(1); }
  100% { transform: translateX(var(--dist)) scale(0); opacity: 0; }
}
@keyframes shardFly {
  0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  40%  { opacity: 0.9; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.3); opacity: 0; }
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
@keyframes breathe {
  0%, 100% { transform: scale(1) translate3d(0, 0, 0); opacity: 0.6; }
  50% { transform: scale(1.06) translate3d(10px, -8px, 0); opacity: 0.75; }
}
@keyframes shimmerBorder {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes nodePing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.8); opacity: 0; }
}
@keyframes heroBlob {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  25% { transform: translate3d(18px, -12px, 0) scale(1.04); }
  50% { transform: translate3d(-12px, 18px, 0) scale(0.97); }
  75% { transform: translate3d(10px, -6px, 0) scale(1.02); }
}
@keyframes arrowBounce {
  0%, 100% { transform: translateY(0px); opacity: 0.5; }
  50% { transform: translateY(6px); opacity: 1; }
}
@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

const StyleInjector = () => {
    useEffect(() => {
        const id = 'wave-landing-v2-keyframes';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.textContent = pageKeyframes;
            document.head.appendChild(style);
        }
        return () => {
            const el = document.getElementById(id);
            if (el) el.remove();
        };
    }, []);
    return null;
};

// Initialize Lenis for smooth scrolling
const SmoothScrolling = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.85,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
        });

        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return null;
};

/* ─────────────────────────────────────────────
   MOUSE-REACTIVE GRADIENT ORBS (full page)
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   MOUSE-REACTIVE GRADIENT ORBS (full page)
   ───────────────────────────────────────────── */

// GradientOrbs component is now imported safely



/* ─────────────────────────────────────────────
   NAVBAR – minimal, clean, pill buttons
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   NAVBAR – minimal, clean, pill buttons
   ───────────────────────────────────────────── */

// Navbar component is now imported as NavbarWave


/* ─────────────────────────────────────────────
   HERO SECTION – large orb, bold headline
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   SCALES OF JUSTICE INTRO – zooms out on scroll
   ───────────────────────────────────────────── */

// Orbiting labels — reduced to 8 for better frame rate
const legalDataItems = [
    // ── Platform Features ──────────────────────────────────────────
    { label: 'Lxwyer AI', type: 'feature', angle: 15, dist: 270, delay: 1.0, dur: 7.5 },
    { label: 'SOS', type: 'feature', angle: 200, dist: 275, delay: 3.5, dur: 7.0 },
    { label: 'Signature Lawyers', type: 'feature', angle: 300, dist: 260, delay: 2.8, dur: 7.8 },
    { label: 'Consult', type: 'feature', angle: 100, dist: 272, delay: 1.8, dur: 7.6 },
    { label: 'Documents', type: 'feature', angle: 165, dist: 255, delay: 1.4, dur: 8.2 },
    { label: 'Booking', type: 'feature', angle: 230, dist: 285, delay: 3.2, dur: 7.3 },
    { label: 'AI Dashboards', type: 'feature', angle: 50, dist: 265, delay: 2.2, dur: 8.0 },
    { label: 'Apex Lawyers', type: 'feature', angle: 335, dist: 275, delay: 1.5, dur: 8.4 },
    // ── Practice Areas ─────────────────────────────────────────────
    { label: 'Family Law', type: 'law', angle: 60, dist: 340, delay: 1.5, dur: 8.0 },
    { label: 'Criminal Law', type: 'law', angle: 140, dist: 330, delay: 2.2, dur: 8.8 },
    { label: 'Corporate Law', type: 'law', angle: 250, dist: 320, delay: 1.2, dur: 8.5 },
    { label: 'Cyber Law', type: 'law', angle: 340, dist: 315, delay: 2.6, dur: 9.0 },
    { label: 'Property Law', type: 'law', angle: 30, dist: 355, delay: 0.9, dur: 9.2 },
    { label: 'Civil Law', type: 'law', angle: 110, dist: 345, delay: 3.0, dur: 8.6 },
    { label: 'Labour Law', type: 'law', angle: 185, dist: 360, delay: 2.0, dur: 9.5 },
    { label: 'Tax Law', type: 'law', angle: 270, dist: 350, delay: 3.6, dur: 8.3 },
    { label: 'Consumer Law', type: 'law', angle: 315, dist: 338, delay: 0.8, dur: 9.8 },
    { label: 'IPR Law', type: 'law', angle: 80, dist: 362, delay: 2.5, dur: 9.1 },
    { label: 'Matrimonial Law', type: 'law', angle: 220, dist: 375, delay: 1.7, dur: 10.0 },
];

// Minimal ray set — 4 instead of 8 for better frame rate
const rays = [
    { angle: 0, len: 320, w: 1.5 },
    { angle: 90, len: 300, w: 1 },
    { angle: 180, len: 320, w: 1.5 },
    { angle: 270, len: 300, w: 1 },
];

const TRANSLATIONS = {
    'Lxwyer AI': 'लॉयर एआई',
    'SOS': 'एसओएस',
    'Signature Lawyers': 'सिग्नेचर वकील',
    'Consult': 'परामर्श',
    'Documents': 'दस्तावेज़',
    'Booking': 'बुकिंग',
    'AI Dashboards': 'AI डैशबोर्ड',
    'Apex Lawyers': 'शीर्ष वकील',
    'Family Law': 'पारिवारिक कानून',
    'Criminal Law': 'आपराधिक कानून',
    'Corporate Law': 'कॉर्पोरेट कानून',
    'Cyber Law': 'साइबर कानून',
    'Property Law': 'संपत्ति कानून',
    'Civil Law': 'नागरिक कानून',
    'Labour Law': 'श्रम कानून',
    'Tax Law': 'कर कानून',
    'Consumer Law': 'उपभोक्ता कानून',
    'IPR Law': 'बौद्धिक संपदा',
    'Matrimonial Law': 'वैवाहिक कानून',
    "India's First Legal Tech Ecosystem": 'भारत का पहला लीगल टेक इकोसिस्टम',
    'Trusted by experts.': 'विशेषज्ञों द्वारा विश्वसनीय',
    'Used by the leaders.': 'नेताओं द्वारा प्रयुक्त'
};

const ScalesOfJusticeIntro = React.memo(({ justTransitioned }) => {
    const ref = useRef(null);
    const { lang } = useLang();
    const isHi = lang === 'hi';
    const t = (text) => isHi ? (TRANSLATIONS[text] || text) : text;
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const scaleVal = useTransform(scrollYProgress, [0, 0.5], [1.6, 0.16]);
    const opacityVal = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const yVal = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const blurVal = useTransform(scrollYProgress, [0, 0.4], [0, 8]); // Reduced max blur from 20 to 8
    const filterVal = useTransform(blurVal, (v) => `blur(${v}px)`);

    // ── Hide floating labels after 20 s ───────────────────────────────
    const [labelsVisible, setLabelsVisible] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setLabelsVisible(false), 20000);
        return () => clearTimeout(t);
    }, []);

    // On mobile (≤768px) use 100vh so it doesn't waste 2 full screens
    const sectionHeight = typeof window !== 'undefined' && window.innerWidth <= 768 ? '100vh' : '160vh';

    return (
        <section ref={ref} className="relative bg-[#f8faff] dark:bg-black transition-colors duration-500 overflow-hidden" style={{ height: sectionHeight }}>
            <div
                className="sticky top-0 flex items-center justify-center"
                style={{ height: '100vh', zIndex: 20, pointerEvents: 'none', overflow: 'visible' }}
            >
                {/* Hero tubelight effect removed as requested */}
                <motion.div
                    style={{
                        scale: scaleVal,
                        opacity: opacityVal,
                        y: yVal,
                        filter: filterVal,
                    }}
                    className="relative flex flex-col items-center gap-6 w-full"
                >
                    <motion.div
                        initial={justTransitioned ? { opacity: 0, scale: 0.8, filter: 'blur(10px)' } : false}
                        animate={justTransitioned ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : false}
                        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                        className="relative flex flex-col items-center justify-center w-full"
                    >
                        {/* Radiating rays toward center */}
                        {rays.map((ray, i) => {
                            const rad = (ray.angle * Math.PI) / 180;
                            const endX = Math.cos(rad) * ray.len;
                            const endY = Math.sin(rad) * ray.len;
                            return (
                                <div
                                    key={`ray${i}`}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: `${ray.len}px`,
                                        height: `${ray.w}px`,
                                        transformOrigin: '0 50%',
                                        transform: `rotate(${ray.angle}deg) translateZ(0)`,
                                        background: `linear-gradient(90deg, rgba(59,130,246,0.01) 0%, rgba(59,130,246,0.12) 50%, rgba(96,165,250,0.25) 100%)`,
                                        animation: `rayPulse ${7 + i * 1.2}s ease-in-out ${i * 0.8}s infinite`,
                                        borderRadius: '2px',
                                        willChange: 'opacity',
                                    }}
                                />
                            );
                        })}


                        {/* Animated legal laws drifting slowly - continuous, not restarted on nav */}
                        {legalDataItems.map((item, i) => {
                            if (item.type === 'feature') return null;

                            const rad = (item.angle * Math.PI) / 180;
                            const startX = Math.cos(rad) * item.dist;
                            const startY = Math.sin(rad) * item.dist;
                            // Compute negative delay so animation appears always in-flight
                            const continuousDelay = `-${((performance.now() / 1000 + item.delay) % item.dur).toFixed(2)}s`;

                            return (
                                <div
                                    key={`data${i}`}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        zIndex: 10,
                                        '--startX': `${startX}px`,
                                        '--startY': `${startY}px`,
                                        animation: `convergeToCenter ${item.dur}s ease-in-out ${continuousDelay} infinite`,
                                        willChange: 'transform, opacity',
                                    }}
                                >
                                    <div
                                        className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 rounded-full border border-blue-500/30 bg-[#020510] text-blue-400 font-bold text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                    >
                                        {t(item.label)}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Glowing orb behind the icon */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '400px',
                                height: '400px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
                                filter: 'blur(8px)',
                                animation: 'pulseGlow 8s ease-in-out infinite',
                            }}
                        />

                        {/* Inner rings collecting data */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '220px',
                                height: '220px',
                                borderRadius: '50%',
                                border: '1px solid rgba(59,130,246,0.2)',
                                animation: 'spinSlow 40s linear infinite',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                width: '280px',
                                height: '280px',
                                borderRadius: '50%',
                                border: '1px dashed rgba(59,130,246,0.15)',
                                animation: 'spinSlow 55s linear infinite reverse',
                            }}
                        />

                        {/* SVG Scales of Justice - Full Blue */}
                        <svg
                            width="180"
                            height="180"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.3))', position: 'relative', zIndex: 5, width: 'clamp(110px, 22vw, 180px)', height: 'clamp(110px, 22vw, 180px)' }}
                        >
                            {/* Central pillar */}
                            <rect x="48" y="20" width="4" height="65" rx="2" fill="url(#pillarGrad)" />
                            {/* Base */}
                            <rect x="35" y="82" width="30" height="5" rx="2.5" fill="url(#baseGrad)" />

                            {/* Animated Beam Group */}
                            <g style={{ transformOrigin: '50px 20px', animation: 'balanceBeam 10s ease-in-out infinite' }}>
                                {/* Beam */}
                                <rect x="15" y="18" width="70" height="4" rx="2" fill="url(#beamGrad)" />

                                {/* Left Pan Group */}
                                <g style={{ transformOrigin: '20px 22px', animation: 'counterRotate 10s ease-in-out infinite' }}>
                                    <line x1="20" y1="22" x2="20" y2="45" stroke="#3b82f6" strokeWidth="1.5" />
                                    <line x1="15" y1="22" x2="15" y2="40" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
                                    <line x1="25" y1="22" x2="25" y2="40" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
                                    <path d="M10 45 Q20 55 30 45" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.15)" />
                                </g>

                                {/* Right Pan Group */}
                                <g style={{ transformOrigin: '80px 22px', animation: 'counterRotate 10s ease-in-out infinite' }}>
                                    <line x1="80" y1="22" x2="80" y2="45" stroke="#3b82f6" strokeWidth="1.5" />
                                    <line x1="75" y1="22" x2="75" y2="40" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
                                    <line x1="85" y1="22" x2="85" y2="40" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
                                    <path d="M70 45 Q80 55 90 45" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.15)" />
                                </g>
                            </g>

                            {/* Crown */}
                            <circle cx="50" cy="16" r="5" fill="url(#crownGrad)" />
                            <circle cx="50" cy="16" r="3" className="fill-[#0f172a]" />

                            <defs>
                                <linearGradient id="pillarGrad" x1="50" y1="20" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#60a5fa" />
                                    <stop offset="1" stopColor="#1e3a8a" />
                                </linearGradient>
                                <linearGradient id="baseGrad" x1="35" y1="84" x2="65" y2="84" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#3b82f6" />
                                    <stop offset="1" stopColor="#1e3a8a" />
                                </linearGradient>
                                <linearGradient id="beamGrad" x1="15" y1="20" x2="85" y2="20" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#93c5fd" />
                                    <stop offset="0.5" stopColor="#3b82f6" />
                                    <stop offset="1" stopColor="#93c5fd" />
                                </linearGradient>
                                <radialGradient id="crownGrad">
                                    <stop stopColor="#60a5fa" />
                                    <stop offset="1" stopColor="#1d4ed8" />
                                </radialGradient>
                            </defs>
                        </svg>

                        <h2
                            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors"
                            style={{ fontFamily: "'Outfit', sans-serif", position: 'relative', zIndex: 5 }}
                        >
                            Lxwyer Up
                        </h2>
                        <h3
                            className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', position: 'relative', zIndex: 5 }}
                        >
                            {t("India's First Legal Tech Ecosystem")}
                        </h3>
                        {/* Minimal modern scroll arrow */}
                        <div style={{ position: 'relative', zIndex: 5, marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ animation: 'arrowBounce 2.2s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <div style={{ width: '1px', height: '14px', background: 'linear-gradient(to bottom, transparent, rgba(100,116,139,0.5))', borderRadius: '1px' }} />
                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L7 8L13 1" stroke="rgba(100,116,139,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Modern Feature Marquee Pinned to Bottom powered by InfiniteSlider */}
                <div style={{
                    position: 'absolute',
                    bottom: '120px',
                    left: 0,
                    right: 0,
                    margin: '0 auto',
                    zIndex: 10,
                    width: '90%',
                    maxWidth: '700px',
                    padding: '10px 0',
                    maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
                    pointerEvents: 'none'
                }}>
                    <InfiniteSlider gap={30} duration={30} durationOnHover={30}>
                        {legalDataItems.filter(i => i.type === 'feature').map((item, i) => (
                            <div key={i} style={{
                                padding: '8px 24px',
                                color: '#64748b', // Slate 500 for light mode
                                fontSize: '15px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }} className="dark:text-slate-300"> {/* Slate 300 (off-white/grey) for dark mode */}
                                {t(item.label)}
                            </div>
                        ))}
                    </InfiniteSlider>
                </div>
            </div >
        </section >
    );
});

/* ─────────────────────────────────────────────
   SCROLL-REACTIVE SPHERE – transforms per section
   ───────────────────────────────────────────── */

// Isolated Solution Particles Component
const SolutionParticles = ({ xPos, yPos, opacity }) => {
    // AI Solution Particles
    const [particles, setParticles] = useState([]);

    // Generate particles
    useEffect(() => {
        const solutions = [
            'Bail Granted', 'Divorce Decree', 'Contract Vetted', 'Patent Filed',
            'Will Registered', 'Trademark', 'Refund Processed', 'Company Incorp',
            'Property Clean', 'Legal Notice Sent', 'Compliance Done', 'Rights Protected',
            'Dispute Resolved', 'Claim Settled'
        ];

        let idCounter = 0;
        const interval = setInterval(() => {
            if (Math.random() > 0.5) return; // Control density

            const id = idCounter++;
            const angle = Math.random() * 360;
            const distance = 150 + Math.random() * 100;

            const newItem = {
                id,
                label: solutions[Math.floor(Math.random() * solutions.length)],
                angle: angle,
                dist: distance,
                delay: 0,
                duration: 4 + Math.random() * 2,
            };

            setParticles(prev => [...prev.slice(-3), newItem]);
        }, 4500);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div style={{ opacity }}>
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        top: yPos, // MotionValue
                        left: xPos, // MotionValue
                        transform: `rotate(${p.angle}deg)`, // Rotate entire strip
                        transformOrigin: '0 0', // Pivot at center
                        zIndex: -1,
                    }}
                >
                    {/* Expanding Line from Center */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '1px',
                            '--dist': `${p.dist}px`,
                            background: 'linear-gradient(90deg, rgba(96,165,250,0.8), transparent)',
                            animation: `expandRay ${p.duration}s ease-out forwards`,
                            transformOrigin: '0 50%',
                        }}
                    />

                    {/* Moving Dot & Label */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-3px', // Center vertically on line
                            left: 0,
                            '--dist': `${p.dist}px`,
                            animation: `floatOut ${p.duration}s ease-out forwards`,
                        }}
                    >
                        {/* Dot */}
                        <div
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#60a5fa',
                                boxShadow: '0 0 8px rgba(96,165,250,0.8)',
                            }}
                        />

                        {/* Label (Counter-rotated) */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '10px',
                                whiteSpace: 'nowrap',
                                fontSize: '10px',
                                fontWeight: 600,
                                color: '#3b82f6',
                                background: 'rgba(255,255,255,0.85)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                backdropFilter: 'blur(4px)',
                                transform: `rotate(${-p.angle}deg)`, // Keep text upright
                            }}
                        >
                            {p.label}
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   EPIC EXPLOSION – Ethereal Glass-Fragment System
   ───────────────────────────────────────────── */

const serviceLabels = [
    'Court Representation', 'AI Legal Guidance', 'Document Review',
    'Find the Right Lawyer', 'Legal Consultation', 'Case Tracking',
    'Contract Drafting', 'Court Filing', 'Dispute Resolution',
    'Legal Research', 'Bail Application', 'Property Law',
];

/* ── Glass Fragment (a single piece of the shattered sphere) ─── */
const GlassFragment = ({ progress, fragment, index, total }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseAngle = fragment.angle;
    const finalDist = fragment.dist;

    // Phase 1 (0-0.2): Fly outward FAST from center 
    const flyOut = useTransform(progress, [0, 0.20], [0, 1]);
    const radius = useTransform(flyOut, [0, 1], [0, finalDist]);

    // Phase 2 (0.20-1): Drift further out slowly while orbiting
    const rotation = useTransform(progress, [0, 0.20, 1], [baseAngle, baseAngle, baseAngle + 120 + (index % 2 === 0 ? 40 : -40)]);

    const x = useTransform([radius, rotation], ([r, a]) => Math.cos((a * Math.PI) / 180) * r);
    const y = useTransform([radius, rotation], ([r, a]) => Math.sin((a * Math.PI) / 180) * r);

    // Spin the fragment itself as it flies
    const selfRotate = useTransform(progress, [0, 0.25, 1], [0, fragment.spin, fragment.spin + 90]);

    // Opacity: appear instantly, stay visible much longer, fade late
    const opacity = useTransform(progress, [0, 0.05, 0.85, 1], [0, 0.9, 0.7, 0]);

    // Scale: start small, grow big, stay  
    const scale = useTransform(progress, [0, 0.15, 0.5, 1], [0.4, 1.3, 1.1, 0.7]);

    return (
        <motion.div style={{
            position: 'absolute',
            x, y, rotate: selfRotate, opacity, scale,
            width: fragment.size,
            height: fragment.size * 0.45,
            borderRadius: `${fragment.size * 0.5}px ${fragment.size * 0.15}px`,
            background: isDark
                ? `linear-gradient(${135 + index * 15}deg, rgba(30,58,138,${0.6 + fragment.brightness * 0.2}), rgba(15,23,42,${0.4 + fragment.brightness * 0.1}), rgba(30,58,138,${0.5 + fragment.brightness * 0.2}))`
                : `linear-gradient(${135 + index * 15}deg, rgba(147,197,253,${0.4 + fragment.brightness * 0.3}), rgba(96,165,250,${0.15 + fragment.brightness * 0.15}), rgba(219,234,254,${0.3 + fragment.brightness * 0.2}))`,
            border: isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.3)',
            willChange: 'transform, opacity',
        }}>
            {/* Service label on larger fragments */}
            {fragment.hasLabel && (
                <motion.span style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '1rem', // Increased size for readability
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: isDark ? '#bfdbfe' : '#1e3a8a', // Light blue in dark mode, Dark blue in light mode
                    textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.8)' : '0 2px 10px rgba(255,255,255,0.8)',
                    fontFamily: "'Outfit', sans-serif",
                }}>
                    {fragment.label}
                </motion.span>
            )}
        </motion.div>
    );
};

/* ── Fragment Ring (all shattered pieces together) ─── */
const FragmentRing = ({ progress }) => {
    const fragments = React.useMemo(() => {
        return Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * 360 + (Math.random() - 0.5) * 20;
            // Massive scatter: fly extremely far across the viewport
            const dist = 500 + Math.random() * 600;
            // Large readable pieces
            const size = 70 + Math.random() * 90;
            const spin = 80 + Math.random() * 200;
            const brightness = Math.random();
            const hasLabel = i < serviceLabels.length;
            const label = hasLabel ? serviceLabels[i] : '';
            return { angle, dist, size, spin, brightness, hasLabel, label };
        });
    }, []);

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, overflow: 'visible' }}>
            {fragments.map((f, i) => (
                <GlassFragment key={i} fragment={f} index={i} total={fragments.length} progress={progress} />
            ))}
        </div>
    );
};

/* ── Mist Particles (ethereal sparkles during explosion) ─── */
const MistParticle = ({ progress, config }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const x = useTransform(progress, [0, 1], [0, config.dx]);
    const y = useTransform(progress, [0, 1], [0, config.dy]);
    const opacity = useTransform(progress, [0, 0.1, 0.4, 0.8], [0, config.peak, config.peak * 0.6, 0]);
    const scale = useTransform(progress, [0, 0.2, 1], [0, 1, 0.3]);

    return (
        <motion.div style={{
            position: 'absolute', x, y, opacity, scale,
            width: config.size,
            height: config.size,
            borderRadius: '50%',
            background: isDark
                ? `radial-gradient(circle, rgba(59,130,246,${config.peak * 0.8}) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(147,197,253,${config.peak}) 0%, transparent 70%)`,
            filter: `blur(${config.blur}px)`,
        }} />
    );
};

const MistCloud = ({ progress }) => {
    const particles = React.useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => {
            const angle = Math.random() * 360;
            const speed = 100 + Math.random() * 250;
            return {
                dx: Math.cos(angle * Math.PI / 180) * speed,
                dy: Math.sin(angle * Math.PI / 180) * speed,
                size: 6 + Math.random() * 20,
                peak: 0.3 + Math.random() * 0.5,
                blur: 2 + Math.random() * 6,
            };
        });
    }, []);

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, overflow: 'visible' }}>
            {particles.map((p, i) => (
                <MistParticle key={i} config={p} progress={progress} />
            ))}
        </div>
    );
};

/* ── Easy & Efficient Revolving Reveal Component ─── */
const EasyEfficientReveal = ({ scrollProgress }) => {
    // Activates AFTER the blast is well underway
    const opacity = useTransform(scrollProgress, [0.44, 0.48, 0.56, 0.60], [0, 1, 1, 0]);
    // SIMPLIFIED: Just a gentle scale up, no rotation
    const scale = useTransform(scrollProgress, [0.44, 0.50], [0.95, 1]);
    const y = useTransform(scrollProgress, [0.44, 0.50], [20, 0]);

    return (
        <motion.div style={{
            position: 'absolute',
            zIndex: 25,
            opacity,
            scale,
            y,
            pointerEvents: 'none'
        }}>
            <div className="flex flex-col items-center gap-2.5 px-14 py-8 rounded-[28px] border-2 border-blue-500/15 dark:border-blue-500/30 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_25px_80px_rgba(37,99,235,0.25),0_0_0_1px_rgba(255,255,255,0.6),0_0_120px_rgba(96,165,250,0.15)] dark:shadow-[0_25px_80px_rgba(30,58,138,0.4),0_0_0_1px_rgba(255,255,255,0.1),0_0_120px_rgba(30,58,138,0.2)]">
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontFamily: "'Outfit', sans-serif",
                }}>
                    Legal Assistance
                </span>
                <span style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #2563eb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    fontFamily: "'Outfit', sans-serif",
                    whiteSpace: 'nowrap'
                }}>
                    Easy & Efficient
                </span>
                <div style={{
                    marginTop: '14px',
                    width: '80px',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)'
                }} />
            </div>
        </motion.div>
    );
};

/* ── The Main Explosion Component ─── */
const SphereExplosion = () => {
    const { scrollYProgress } = useScroll();

    // ── ANIMATION TIMELINE (extended for more scroll space) ──
    // 0.30: Explosion container fades in
    // 0.32: BLAST — fragments + mist fly out, "Lxwyer Up" text emerges
    // 0.32 - 0.48: Orbiting phase with "Lxwyer Up" visible
    // 0.48 - 0.52: "Lxwyer Up" blurs out — "Easy & Efficient" takes over
    // 0.52 - 0.68: "Easy & Efficient" is prominent
    // 0.68 - 0.73: Everything fades out

    const visibleRange = useTransform(scrollYProgress, [0.30, 0.32, 0.68, 0.73], [0, 1, 1, 0]);
    const fragmentProgress = useTransform(scrollYProgress, [0.32, 0.68], [0, 1]);
    const mistProgress = useTransform(scrollYProgress, [0.31, 0.52], [0, 1]);

    // White flash at moment of blast
    const flashOpacity = useTransform(scrollYProgress, [0.31, 0.32, 0.36], [0, 0.22, 0]);

    // Shockwave rings (expanding circles)
    const ring1Scale = useTransform(scrollYProgress, [0.32, 0.40], [0.3, 4]);
    const ring1Opacity = useTransform(scrollYProgress, [0.32, 0.34, 0.40], [0, 0.4, 0]);
    const ring2Scale = useTransform(scrollYProgress, [0.34, 0.42], [0.3, 3]);
    const ring2Opacity = useTransform(scrollYProgress, [0.34, 0.36, 0.42], [0, 0.25, 0]);

    // "Lxwyer Up" Text Reveal — appears then BLURS AWAY when Easy & Efficient comes
    const textScaleRaw = useTransform(scrollYProgress, [0.32, 0.37, 0.48, 0.54], [0, 1.05, 1, 0.8]);
    const textOpacity = useTransform(scrollYProgress, [0.32, 0.36, 0.48, 0.54], [0, 1, 1, 0]);
    const textBlur = useTransform(scrollYProgress, [0.32, 0.37, 0.48, 0.54], [30, 0, 0, 30]);
    const textGlow = useTransform(scrollYProgress, [0.32, 0.37, 0.46], [40, 15, 0]);
    const textScaleSpring = useSpring(textScaleRaw, { stiffness: 180, damping: 18 });
    const filterBlur = useTransform(textBlur, v => `blur(${v}px)`);


    return (
        <motion.div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: visibleRange,
        }}>
            {/* NEW: Easy & Efficient Revolving Reveal */}
            <EasyEfficientReveal scrollProgress={scrollYProgress} />

            {/* White Flash */}
            <motion.div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, rgba(200,220,255,0.35) 0%, rgba(147,197,253,0.15) 45%, transparent 75%)',
                opacity: flashOpacity,
            }} />

            {/* Shockwave Ring 1 */}
            <motion.div style={{
                position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                border: '2px solid rgba(147,197,253,0.5)',
                scale: ring1Scale, opacity: ring1Opacity,
                boxShadow: '0 0 30px rgba(147,197,253,0.15)',
            }} />

            {/* Shockwave Ring 2 (delayed) */}
            <motion.div style={{
                position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
                border: '1.5px solid rgba(96,165,250,0.3)',
                scale: ring2Scale, opacity: ring2Opacity,
            }} />

            {/* Mist / Sparkle Cloud */}
            <MistCloud progress={mistProgress} />

            {/* Glass Fragment Ring */}
            <FragmentRing progress={fragmentProgress} />

            {/* Central Text */}
            <motion.div style={{
                position: 'relative', zIndex: 5,
                scale: textScaleSpring,
                opacity: textOpacity,
                filter: filterBlur,
                textAlign: 'center',
            }}>
                <motion.h1 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 'clamp(3rem, 9vw, 7rem)',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #1e293b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    marginBottom: '12px',
                    textShadow: 'none',
                }}>
                    Lxwyer Up
                </motion.h1>
                {/* Glow behind text */}
                <motion.div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px', height: '120px',
                    background: 'radial-gradient(ellipse, rgba(96,165,250,0.25) 0%, transparent 70%)',
                    filter: useTransform(textGlow, v => `blur(${v}px)`),
                    zIndex: -1,
                }} />
                <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.85rem', fontWeight: 600,
                    color: '#64748b',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                }}>
                    Every Legal Problem, One Platform
                </p>
            </motion.div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   ETHEREAL SPHERE – light, misty, alive
   ───────────────────────────────────────────── */

const ScrollReactiveSphere = () => {
    const { scrollYProgress } = useScroll();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Position: Right-center -> Center 
    const xRaw = useTransform(scrollYProgress, [0, 0.25, 0.35], [72, 72, 50]);
    const yRaw = useTransform(scrollYProgress, [0, 0.25, 0.35], [45, 45, 50]);

    // Size: Start medium, grow before burst - Smoother expansion
    const size = useTransform(scrollYProgress, [0, 0.30, 0.50], [126, 154, 560]);

    // Opacity: Fade in -> out at burst - Smoother fade out (extended range)
    const opacity = useTransform(scrollYProgress, [0, 0.06, 0.35, 0.55], [0, 1, 1, 0]);

    // Blur increases slightly before burst (tension)
    const blurVal = useTransform(scrollYProgress, [0.35, 0.50], [0, 12]);
    const sphereFilter = useTransform(blurVal, v => `blur(${v}px)`);

    // Glow intensity grows
    const glowIntensity = useTransform(scrollYProgress, [0, 0.30, 0.39], [0.15, 0.2, 0.5]);

    const xPos = useTransform(xRaw, v => `${v}%`);
    const yPos = useTransform(yRaw, v => `${v}%`);
    const glowSize = useTransform(size, s => `${s * 2.5}px`);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 3 }}>
            {/* Outer glow - very soft, large */}
            <motion.div style={{
                position: 'absolute', top: yPos, left: xPos,
                transform: 'translate(-50%, -50%)',
                width: glowSize, height: glowSize,
                background: isDark
                    ? 'radial-gradient(circle, rgba(30,58,138,0.15) 0%, rgba(15,23,42,0.0) 50%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(147,197,253,0.25) 0%, rgba(96,165,250,0.08) 40%, transparent 70%)',
                opacity,
            }} />

            {/* Main ethereal orb - translucent, layered */}
            <motion.div style={{
                position: 'absolute', top: yPos, left: xPos,
                transform: 'translate(-50%, -50%)',
                width: size, height: size, borderRadius: '50%',
                background: isDark
                    ? 'radial-gradient(circle at 35% 30%, rgba(59,130,246,0.2) 0%, rgba(30,58,138,0.1) 40%, rgba(15,23,42,0.05) 80%, transparent 100%)'
                    : 'radial-gradient(circle at 35% 30%, rgba(219,234,254,0.7) 0%, rgba(147,197,253,0.35) 30%, rgba(96,165,250,0.2) 55%, rgba(59,130,246,0.08) 80%, transparent 100%)',
                boxShadow: isDark
                    ? '0 0 60px rgba(30,58,138,0.1), 0 0 120px rgba(15,23,42,0.1), inset 0 0 60px rgba(255,255,255,0.05)'
                    : '0 0 60px rgba(96,165,250,0.15), 0 0 120px rgba(147,197,253,0.08), inset 0 0 60px rgba(255,255,255,0.3)',
                opacity,
                filter: sphereFilter,
            }} />

            {/* Inner highlight - white frost */}
            <motion.div style={{
                position: 'absolute', top: yPos, left: xPos,
                transform: 'translate(-50%, -50%)',
                width: useTransform(size, s => s * 0.65), height: useTransform(size, s => s * 0.65),
                borderRadius: '50%',
                background: isDark
                    ? 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.1) 0%, rgba(59,130,246,0.05) 50%, transparent 75%)'
                    : 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.5) 0%, rgba(219,234,254,0.15) 50%, transparent 75%)',
                opacity,
            }} />

            {/* Rotating ring 1 */}
            <motion.div style={{
                position: 'absolute', top: yPos, left: xPos,
                transform: 'translate(-50%, -50%)',
                width: useTransform(size, s => s * 0.85), height: useTransform(size, s => s * 0.85),
                borderRadius: '50%',
                border: isDark ? '1px solid rgba(59,130,246,0.1)' : '1px solid rgba(147,197,253,0.2)',
                animation: 'spinSlow 25s linear infinite',
                opacity: useTransform(opacity, v => v * 0.5),
            }} />

            {/* Rotating ring 2 (reverse) */}
            <motion.div style={{
                position: 'absolute', top: yPos, left: xPos,
                transform: 'translate(-50%, -50%)',
                width: useTransform(size, s => s * 1.1), height: useTransform(size, s => s * 1.1),
                borderRadius: '50%',
                border: isDark ? '1px dashed rgba(30,58,138,0.1)' : '1px dashed rgba(96,165,250,0.1)',
                animation: 'spinSlow 35s linear infinite reverse',
                opacity: useTransform(opacity, v => v * 0.3),
            }} />

            {/* Pulse animation overlay */}
            <motion.div style={{
                position: 'absolute', top: yPos, left: xPos,
                transform: 'translate(-50%, -50%)',
                width: size, height: size,
                borderRadius: '50%',
                background: isDark
                    ? 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)',
                animation: 'pulseGlow 3s ease-in-out infinite',
                opacity,
            }} />
        </div>
    );
};

/* ─────────────────────────────────────────────
   REVOLUTION WRITING SCROLL SECTION
   ClipPath left→right reveal + glowing pen tip
   ───────────────────────────────────────────── */
const RevolutionScrollSection = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.1'] });

    // Writing reveal — fast: 0.05→0.40 (full word written in first 35% of scroll)
    const writeProgress = useTransform(scrollYProgress, [0.05, 0.40], [0, 1]);
    const clipRight = useTransform(writeProgress, v => `inset(0 ${(1 - v) * 100}% 0 0)`);

    // Pen tip tracks the right edge of the reveal
    const penX = useTransform(writeProgress, v => `${v * 100}%`);
    const penOpacity = useTransform(writeProgress, [0, 0.03, 0.95, 1], [0, 1, 1, 0]);

    // "Bringing a" — appears immediately
    const bringOpacity = useTransform(scrollYProgress, [0.00, 0.10], [0, 1]);
    const bringY = useTransform(scrollYProgress, [0.00, 0.10], [14, 0]);

    // Tagline — appears after writing finishes
    const tagOpacity = useTransform(scrollYProgress, [0.38, 0.50], [0, 1]);
    const tagY = useTransform(scrollYProgress, [0.38, 0.50], [12, 0]);

    // Whole block fades out
    const blockOpacity = useTransform(scrollYProgress, [0.80, 0.95], [1, 0]);

    return (
        <section
            ref={ref}
            style={{ position: 'relative', width: '100%', height: '240vh', background: 'black' }}
        >
            <div style={{
                position: 'sticky', top: 0, height: '100vh',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {/* Ambient glow */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(30,58,138,0.10) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <motion.div style={{
                    opacity: blockOpacity,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0 5vw',
                    width: '100%',
                }}>
                    {/* Small label */}
                    <motion.p style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(0.55rem, 0.9vw, 0.82rem)',
                        fontWeight: 600,
                        letterSpacing: '0.5em',
                        textTransform: 'uppercase',
                        color: 'rgba(148,163,184,0.5)',
                        marginBottom: '0.8rem',
                        opacity: bringOpacity,
                        y: bringY,
                    }}>
                        Bringing&nbsp;a
                    </motion.p>

                    {/* REVOLUTION — writing clipPath + pen tip */}
                    <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>

                        {/* Ghost (stable layout placeholder) */}
                        <h2 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontStyle: 'italic',
                            fontSize: 'clamp(4.5rem, 16.9vw, 16.9rem)',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            margin: 0,
                            color: 'rgba(255,255,255,0.04)',
                            WebkitTextStroke: '1px rgba(255,255,255,0.05)',
                            userSelect: 'none',
                        }}>
                            Revolution
                        </h2>

                        {/* Revealed text — clips L→R */}
                        <motion.h2 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontStyle: 'italic',
                            fontSize: 'clamp(4.5rem, 16.9vw, 16.9rem)',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            margin: 0,
                            background: 'linear-gradient(135deg, #f8faff 0%, #bfdbfe 30%, #93c5fd 60%, #818cf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            clipPath: clipRight,
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                        }}>
                            Revolution
                        </motion.h2>

                        {/* Glowing pen tip */}
                        <motion.div style={{
                            position: 'absolute',
                            top: '5%', height: '90%',
                            left: penX,
                            width: '3px',
                            borderRadius: '2px',
                            background: 'linear-gradient(180deg, transparent 0%, rgba(147,197,253,0.9) 20%, #ffffff 50%, rgba(147,197,253,0.9) 80%, transparent 100%)',
                            boxShadow: '0 0 10px 3px rgba(147,197,253,0.5), 0 0 22px 7px rgba(99,102,241,0.22)',
                            opacity: penOpacity,
                            transform: 'translateX(-50%)',
                        }} />
                    </div>

                    {/* Tagline */}
                    <motion.p style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(0.8rem, 1.3vw, 1rem)',
                        fontWeight: 300,
                        letterSpacing: '0.18em',
                        color: 'rgba(148,163,184,0.45)',
                        marginTop: '1.4rem',
                        opacity: tagOpacity,
                        y: tagY,
                        lineHeight: 1.7,
                    }}>
                        in Indian Legal Services
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};

const ExplosionSpacer = () => {
    return (
        <section className="relative w-full bg-[#f8faff] dark:bg-black transition-colors duration-500" style={{ height: '160vh' }}>
            {/* Dedicated scroll space for sphere explosion */}
        </section>
    );
};

/* ─────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────── */

const HeroSection = () => {
    const navigate = useNavigate();
    const { t } = useLang();

    // Ambient blobs
    const blobs = [
        { color: 'rgba(59,130,246,0.13)', size: 600, x: '10%', y: '20%', dur: 18, delay: 0 },
        { color: 'rgba(139,92,246,0.10)', size: 500, x: '70%', y: '60%', dur: 22, delay: 4 },
        { color: 'rgba(6,182,212,0.08)', size: 400, x: '50%', y: '10%', dur: 16, delay: 8 },
        { color: 'rgba(59,130,246,0.07)', size: 350, x: '85%', y: '15%', dur: 25, delay: 2 },
        { color: 'rgba(167,139,250,0.09)', size: 450, x: '5%', y: '70%', dur: 20, delay: 6 },
        { color: 'rgba(34,211,238,0.07)', size: 300, x: '60%', y: '80%', dur: 14, delay: 10 },
    ];

    return (
        <section className="relative py-16 sm:py-28 px-6 lg:px-8 bg-[#f8faff] dark:bg-[#040810] transition-colors duration-500 overflow-hidden">
            {/* Animated ambient blobs */}
            {blobs.map((b, i) => (
                <div key={i} style={{
                    position: 'absolute', left: b.x, top: b.y,
                    width: b.size, height: b.size,
                    background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
                    animation: `heroBlob ${b.dur}s ease-in-out ${b.delay}s infinite`,
                    filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
                    transform: 'translate(-50%, -50%)',
                }} />
            ))}

            {/* Cinematic grid background */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.06) 1px, transparent 0)', backgroundSize: '48px 48px', zIndex: 0 }} />

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>

                    {/* Headline */}
                    <h2
                        className="text-6xl md:text-8xl font-black mb-8 tracking-tight text-slate-900 dark:text-white transition-colors leading-[1.02]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                            {t('landing_hero_title_1')}{' '}
                        </motion.span>
                        <br className="hidden sm:block" />
                        <motion.span
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.85 }}
                            className="relative inline-block"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400">
                                {t('landing_hero_title_2')}
                            </span>
                            <motion.span
                                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full origin-left"
                            />
                        </motion.span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
                        className="text-lg sm:text-xl max-w-2xl mx-auto mb-14 leading-relaxed text-slate-900 dark:text-slate-500 dark:text-slate-400 font-light transition-colors"
                    >
                        {t('landing_hero_subtitle')}
                    </motion.p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <button
                                onClick={() => navigate('/user-get-started')}
                                className="group relative inline-flex items-center gap-3 h-14 px-10 rounded-2xl text-base font-bold transition-all duration-300
                                bg-blue-600 hover:bg-blue-700 text-white
                                shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50
                                hover:scale-105 active:scale-95"
                            >
                                {t('landing_find_lawyer')}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                            <div className="lxwyer-wrap">
                                <div className="lxwyer-spin" />
                                <button
                                    onClick={() => navigate('/lxwyerai')}
                                    className="lxwyer-inner h-14 px-9 text-base font-bold whitespace-nowrap"
                                >
                                    <Sparkles className="w-4 h-4 text-white/60" />
                                    <span className="lxwyer-text text-white font-black tracking-[0.04em]">Lxwyer<span className="text-blue-400">AI</span></span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="mt-14 pl-1">
                        <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-600" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};


/* ─────────────────────────────────────────────
   FEATURE BENTO GRID – numbered cards, glassmorphic
   ───────────────────────────────────────────── */

const BentoCard = ({ number, icon: Icon, title, description, span = 1, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className={`group relative p-8 rounded-3xl transition-all duration-500 cursor-default ${span === 2 ? 'md:col-span-2' : ''} bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-black/5 dark:border-slate-200 dark:border-white/10 shadow-sm`}
            onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid rgba(59,130,246,0.2)';
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(59,130,246,0.08)';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(0,0,0,0.06)';
                e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Number badge */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-6 text-sm font-bold"
                style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))',
                    color: '#2563eb',
                    border: '1px solid rgba(59,130,246,0.15)',
                }}
            >
                {number}
            </div>

            <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-800 dark:text-slate-100 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-500 dark:text-slate-400 transition-colors">{description}</p>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturesSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const { t } = useLang();

    const features = [
        { icon: Brain, title: t('landing_feat1_title'), description: t('landing_feat1_desc'), span: 2 },
        { icon: Search, title: t('landing_feat2_title'), description: t('landing_feat2_desc') },
        { icon: FileText, title: t('landing_feat3_title'), description: t('landing_feat3_desc') },
        { icon: MessageSquare, title: t('landing_feat4_title'), description: t('landing_feat4_desc'), span: 2 },
        { icon: Shield, title: t('landing_feat5_title'), description: t('landing_feat5_desc') },
    ];

    return (
        <section
            id="features"
            ref={ref}
            className="relative py-28 px-6 lg:px-8 bg-slate-50 dark:bg-[#060b14] transition-colors duration-500"
        >
            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block text-blue-600 dark:text-blue-500">{t('landing_features_title')}</span>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-5 text-slate-900 dark:text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {t('landing_features_title')}
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto text-slate-900 dark:text-slate-500 dark:text-slate-400">
                        {t('landing_features_sub')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <BentoCard key={f.title} number={String(i + 1).padStart(2, '0')} {...f} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ─────────────────────────────────────────────
   SERVICES – expanded cards
   ───────────────────────────────────────────── */

const ServiceCard = ({ icon: Icon, title, description, index }) => {
    const cardRef = useRef(null);
    const cardInView = useInView(cardRef, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            animate={cardInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group p-7 rounded-3xl transition-all duration-500 flex flex-col items-center text-center"
            style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.border = '1px solid rgba(59,130,246,0.2)';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(59,130,246,0.12)' }}
            >
                <Icon className="w-6 h-6" style={{ color: '#60a5fa' }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{description}</p>
        </motion.div>
    );
};

const ServicesSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const services = [
        { icon: Gavel, title: 'Court Representation', description: 'Professional representation in courts across India by experienced advocates.' },
        { icon: BookOpen, title: 'Legal Documentation', description: 'Expert assistance in drafting and reviewing legal documents and contracts.' },
        { icon: UserCheck, title: 'Lawyer Verification', description: 'All lawyers on our platform are verified with bar council credentials and client reviews.' },
        { icon: Clock, title: 'Quick Resolution', description: 'Fast-track your cases with efficient legal strategies and experienced counsel.' },
    ];

    return (
        <section
            id="services"
            ref={ref}
            className="relative py-28 px-6 lg:px-8 bg-[#040810] dark:bg-[#020508] transition-colors duration-500"
        >
            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block" style={{ color: '#60a5fa' }}>Services</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Services We Offer
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(148,163,184,0.8)' }}>
                        Professional legal services tailored for every Indian citizen
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {services.map((s, i) => (
                        <ServiceCard key={s.title} {...s} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ─────────────────────────────────────────────
   ECOSYSTEM / WHY US – connectivity visual
   ───────────────────────────────────────────── */

const EcosystemSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-10%' });
    const { t } = useLang();

    // Generate floating particles once — reduced to 10 for performance
    const particles = React.useMemo(() => Array.from({ length: 10 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        color: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#6366f1' : '#06b6d4',
        dur: 4 + Math.random() * 6, delay: Math.random() * 5,
    })), []);

    const steps = [
        { num: '01', title: t('eco_s1_title'), desc: t('eco_s1_desc') },
        { num: '02', title: t('eco_s2_title'), desc: t('eco_s2_desc') },
        { num: '03', title: t('eco_s3_title'), desc: t('eco_s3_desc') },
        { num: '04', title: t('eco_s4_title'), desc: t('eco_s4_desc') },
        { num: '05', title: t('eco_s5_title'), desc: t('eco_s5_desc') },
    ];

    return (
        <section ref={ref} className="relative py-32 px-6 lg:px-8 bg-[#f8faff] dark:bg-black transition-colors duration-500 overflow-hidden">

            {/* Twinkling floating particles */}
            {particles.map(p => (
                <div key={p.id} style={{
                    position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
                    width: p.size, height: p.size, borderRadius: '50%',
                    background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                    animation: `twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
                    pointerEvents: 'none', zIndex: 0,
                }} />
            ))}

            {/* Breathing orbs */}
            <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'breathe 14s ease-in-out infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'breathe 18s ease-in-out 6s infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '60%', left: '50%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'breathe 22s ease-in-out 3s infinite', pointerEvents: 'none' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Animated headline */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="text-center mb-32"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {t('eco_from').split('').map((ch, i) => (
                            <motion.span key={`f${i}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + i * 0.04, duration: 0.4 }}>{ch}</motion.span>
                        ))}
                        <span className="text-slate-600 dark:text-white italic font-medium pr-2">{t('eco_confused')}</span>
                        <br />
                        <motion.span initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}>{t('eco_to')}</motion.span>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 1.1, type: 'spring', stiffness: 100 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 text-6xl md:text-8xl"
                        >{t('eco_confident')}</motion.span>
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-500 dark:text-slate-400 font-light max-w-2xl mx-auto"
                    >
                        {t('eco_sub')}
                    </motion.p>
                </motion.div>

                {/* Cinematic Vertical Timeline */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Glowing vertical line */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={isInView ? { scaleY: 1 } : {}}
                        transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
                        className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] md:-translate-x-1/2 bg-gradient-to-b from-transparent via-blue-500/50 dark:via-blue-400/50 to-transparent origin-top"
                    />

                    {steps.map((step, i) => {
                        const isEven = i % 2 !== 0;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.7, delay: 0.5 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                                className={`relative flex flex-col md:flex-row items-center justify-between mb-24 last:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Center Node with ripple */}
                                <div className="absolute left-6 md:left-1/2 -translate-x-[calc(50%-0.5px)] z-10">
                                    {/* Ripple rings */}
                                    <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.4)', animation: `nodePing 2.5s ${i * 0.4}s ease-out infinite` }} />
                                    <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.2)', animation: `nodePing 2.5s ${i * 0.4 + 0.8}s ease-out infinite` }} />
                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center">
                                        <div className="absolute inset-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                                    </div>
                                </div>

                                {/* Content Box */}
                                <motion.div
                                    className={`ml-16 md:ml-0 md:w-5/12 ${isEven ? 'md:pl-12 text-left' : 'md:pr-12 md:text-right'}`}
                                    whileHover={{ y: -6 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="group relative p-8 rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-100 dark:border-white/5 hover:border-blue-500/40 dark:hover:border-blue-400/40 transition-all duration-500"
                                        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.06)' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.15), 0 4px 30px rgba(0,0,0,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.06)'}
                                    >
                                        <div className={`text-blue-600 dark:text-blue-500 font-mono text-sm mb-3 tracking-[0.2em] font-bold opacity-80 ${isEven ? 'text-left' : 'md:text-right text-left'}`}>
                                            {t('eco_phase')} {step.num}
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{step.title}</h3>
                                        <p className="text-base text-slate-600 dark:text-slate-500 dark:text-slate-400 leading-relaxed font-light">{step.desc}</p>
                                    </div>
                                </motion.div>
                                <div className="hidden md:block md:w-5/12" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};





/* ─────────────────────────────────────────────
   STATS – animated counters
   ───────────────────────────────────────────── */

const AnimatedCounter = ({ target, suffix = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.8 });
    const endValue = parseInt(target.replace(/,/g, ''));

    return (
        <span ref={ref}>
            {isInView ? <CountUp end={endValue} duration={6} separator="," /> : '0'}
            {suffix}
        </span>
    );
};

const StatsSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const { t } = useLang();

    const stats = [
        { value: '1000', suffix: '+', label: t('landing_stats_lawyers') },
        { value: '10000', suffix: '+', label: t('landing_stats_cases') },
        { value: '3', suffix: '+', label: 'States Covered' },
    ];

    return (
        <section ref={ref} className="relative py-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600">

            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto"
                >
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                <AnimatedCounter target={s.value} suffix={s.suffix} />
                            </div>
                            <div className="text-xs uppercase tracking-[0.25em] font-medium text-blue-100/80">{s.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

/* ─────────────────────────────────────────────
   CTA SECTION – clean, bold
   ───────────────────────────────────────────── */

const CTASection = () => {
    const navigate = useNavigate();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const { t } = useLang();

    return (
        <section
            ref={ref}
            className="relative py-32 px-6 lg:px-8 overflow-hidden bg-[#040810] dark:bg-[#020508] transition-colors duration-500"
        >
            {/* Glow behind CTA */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block" style={{ color: '#60a5fa' }}>{t('landing_cta_title')}</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {t('landing_cta_sub')}
                    </h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(148,163,184,0.7)' }}>
                        {t('landing_cta_sub')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                onClick={() => navigate('/user-get-started')}
                                className="h-14 px-10 rounded-full text-slate-900 dark:text-white text-lg font-semibold transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                    boxShadow: '0 8px 30px rgba(37,99,235,0.3)',
                                }}
                            >
                                {t('landing_cta_btn')}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

/* ─────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────── */

const Footer = () => {
    const navigate = useNavigate();
    const { t } = useLang();
    return (
        <footer
            className="relative py-16 px-6 lg:px-8 bg-[#060a14] dark:bg-black border-t border-slate-100 dark:border-white/5 dark:border-slate-100 dark:border-white/5 transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="mb-5 flex items-center gap-2">
                            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 object-contain rounded" style={{ mixBlendMode: "screen" }} />
                            <span className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Lxwyer Up</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            {t('footer_tagline')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{t('footer_company')}</h4>
                        <ul className="space-y-3">
                            {[
                                { label: t('nav_about'), path: '/about' },
                                { label: t('nav_contact'), path: '/contact' },
                                { label: t('nav_features'), path: '/features' },
                            ].map(l => (
                                <li key={l.label}>
                                    <button onClick={() => navigate(l.path)} className="text-sm transition-colors" style={{ color: 'rgba(148,163,184,0.5)' }}
                                        onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(148,163,184,0.5)'}
                                    >
                                        {l.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{t('nav_features')}</h4>
                        <ul className="space-y-3 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            <li>{t('consult_browse_title')}</li>
                            <li>{t('landing_feat1_title')}</li>
                            <li>{t('sos_emergency')}</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{t('nav_contact')}</h4>
                        <ul className="space-y-3 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            <li>avnendram.7@gmail.com</li>
                            <li>+91 8318216968</li>
                            <li>Sonipat, Haryana</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.3)' }}>
                    {t('footer_rights')}
                </div>
            </div>
        </footer>
    );
};

/* ── Floating Emergency Button (bottom-right) ─── */
const FloatingEmergencyButton = () => {
    const navigate = useNavigate();
    return (
        <motion.button
            onClick={() => navigate('/emergency')}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={{
                position: 'fixed',
                bottom: '28px',
                right: '28px',
                zIndex: 999,
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 6px 24px rgba(220,38,38,0.45), 0 0 0 0 rgba(239,68,68,0.4)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'emergencyPulse 2s ease-in-out infinite',
            }}
            title="Emergency Legal Help"
        >
            <AlertTriangle size={24} strokeWidth={2.5} />
        </motion.button>
    );
};

/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────── */

const StackedSection = ({ children, zIndex, bg = "" }) => (
    <div className={`sticky top-0 w-full h-screen overflow-hidden ${bg}`} style={{ zIndex }}>
        {children}
    </div>
);

/* ─────────────────────────────────────────────
   REUSABLE 2-SCENE CINEMATIC PUSH BRIDGE
   Scene A stays full until 40%, then shrinks+dims.
   Scene B slides up from below 40→85%.
   Two independent 200vh containers = no overlap.
   ───────────────────────────────────────────── */
const TwoScenePushBridge = ({ sceneA, sceneB }) => {
    const ref = useRef(null);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth <= 768 : false
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    // Scene A: full until 40%, then shrinks + dims + gets rounded corners
    const aScale = useTransform(scrollYProgress, [0.40, 0.85], [1, 0.92]);
    const aBright = useTransform(scrollYProgress, [0.40, 0.85], [1, 0.40]);
    const aRadius = useTransform(scrollYProgress, [0.40, 0.85], [0, 20]);
    const aFilter = useTransform(aBright, v => `brightness(${v})`);
    const aBorderRadius = useTransform(aRadius, v => `${v}px`);

    // Scene B: slides in from below starting at 40%
    const bY = useTransform(scrollYProgress, [0.40, 0.85], ['100%', '0%']);
    const bShadow = useTransform(scrollYProgress, [0.40, 0.85],
        ['0 0px 0px rgba(0,0,0,0)', '0 -40px 100px rgba(0,0,0,0.85)']);

    if (isMobile) {
        return (
            <div className="flex flex-col w-full bg-black relative z-10">
                <div className="relative w-full h-auto">{sceneA}</div>
                <div className="relative w-full h-auto">{sceneB}</div>
            </div>
        );
    }

    return (
        // 200vh: first 100vh is the dwell on Scene A, next 100vh is the transition
        <div ref={ref} style={{ position: 'relative', height: '200vh', background: 'black' }}>
            {/* Scene A — sticky, shrinks + dims as Scene B arrives */}
            <motion.div style={{
                position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
                scale: aScale, filter: aFilter, borderRadius: aBorderRadius,
                zIndex: 10, willChange: 'transform, filter', transformOrigin: 'center center',
            }}>
                {sceneA}
            </motion.div>

            {/* Scene B — slides up from below with deep shadow */}
            <motion.div style={{
                position: 'sticky', top: 0, height: '100vh',
                y: bY, boxShadow: bShadow,
                zIndex: 11, overflow: 'hidden', willChange: 'transform',
                marginTop: '-100vh',
            }}>
                {sceneB}
            </motion.div>
        </div>
    );
};



const LandingPageWave = () => {
    const navigate = useNavigate();
    const [justTransitioned, setJustTransitioned] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('fromLanding') === 'true') {
            setJustTransitioned(true);
            sessionStorage.removeItem('fromLanding');
        }
        window.scrollTo(0, 0);
    }, []);

    const grainHeroContent = (
        <GrainHeroSection>
            <div style={{
                textAlign: 'center',
                padding: '0 clamp(1rem, 5vw, 2.5rem)',
                maxWidth: '52rem',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
            }}>
                {/* Headline */}
                <h1 style={{
                    fontFamily: "'Outfit','Inter',sans-serif",
                    fontSize: 'clamp(2rem, 8vw, 5rem)',
                    fontWeight: 900,
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    margin: '0 0 0.5rem 0',
                    color: '#fff',
                    wordBreak: 'break-word',
                }}>
                    Justice You&nbsp;
                    <span style={{
                        backgroundImage: 'linear-gradient(135deg,#93c5fd 0%,#60a5fa 45%,#818cf8 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>Understand,</span>
                    <br />
                    Technology You&nbsp;
                    <span style={{
                        backgroundImage: 'linear-gradient(135deg,#818cf8 0%,#60a5fa 55%,#93c5fd 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>Trust.</span>
                </h1>

                {/* Accent line */}
                <div style={{ width: 60, height: 2, borderRadius: 2, background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.9),transparent)', margin: 'clamp(0.6rem,2vw,1rem) auto' }} />

                {/* Subtitle */}
                <p style={{
                    fontFamily: "'Outfit','Inter',sans-serif",
                    fontSize: 'clamp(0.82rem, 2.2vw, 1rem)',
                    fontWeight: 300,
                    lineHeight: 1.75,
                    color: 'rgba(203,213,225,0.80)',
                    maxWidth: '30rem',
                    margin: '0 auto',
                    marginBottom: 'clamp(1.4rem, 4vw, 2rem)',
                    padding: '0 0.5rem',
                }}>
                    Connect with verified lawyers, get instant AI legal guidance, and access legal help in your language — all in one platform.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <button
                        onClick={() => navigate('/user-get-started')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: 'clamp(9px,2vw,12px) clamp(18px,4vw,28px)',
                            borderRadius: 9999, border: 'none', background: '#2563eb', color: '#fff',
                            fontSize: 'clamp(0.78rem,2vw,0.9rem)', fontWeight: 800, letterSpacing: '0.03em',
                            fontFamily: "'Outfit',sans-serif", cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(37,99,235,0.45)', transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'none'; }}
                    >
                        Find Lawyer
                        {/* Bouncing arrow — matches navbar style */}
                        <span style={{ display: 'inline-flex', animation: 'arrowBounce 1.6s ease-in-out infinite' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </span>
                    </button>
                    <div className="lxwyer-wrap">
                        <div className="lxwyer-spin" />
                        <button
                            onClick={() => navigate('/lxwyerai')}
                            className="lxwyer-inner font-bold whitespace-nowrap"
                            style={{ padding: 'clamp(9px,2vw,11px) clamp(16px,4vw,24px)', fontSize: 'clamp(0.78rem,2vw,0.88rem)' }}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-white/60" />
                            <span className="lxwyer-text text-white font-black tracking-[0.04em]">Lxwyer<span className="text-blue-400">AI</span></span>
                        </button>
                    </div>
                </div>

                {/* Trust row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(0.6rem,2vw,1.2rem)', justifyContent: 'center', marginTop: 'clamp(1rem,3vw,1.6rem)', opacity: 0.5 }}>
                    {['✓ Verified Lawyers', '✓ AI Legal Guidance', '✓ Your Language'].map(txt => (
                        <span key={txt} style={{ fontSize: 'clamp(0.62rem,1.5vw,0.72rem)', color: '#cbd5e1', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{txt}</span>
                    ))}
                </div>
            </div>
        </GrainHeroSection>
    );

    const beamsContent = (
        <BeamsBackground className="w-full h-full">
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 clamp(1.5rem,6vw,4rem)',
                textAlign: 'left',
            }}>
                {/* Subtle ambient glow */}
                <div style={{ position: 'absolute', top: '30%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '48rem', width: '100%' }}>
                    {/* Eyebrow */}
                    <p style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: 'clamp(0.65rem,1.5vw,0.75rem)',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'rgba(148,163,184,0.5)',
                        marginBottom: 'clamp(1rem,3vw,1.4rem)',
                    }}>India&apos;s Legal Future</p>

                    {/* Main cycling statement */}
                    <h2 style={{
                        fontFamily: "'Outfit','Inter',sans-serif",
                        fontSize: 'clamp(1.45rem, 6.5vw, 5rem)',
                        fontWeight: 300,
                        lineHeight: 1.12,
                        letterSpacing: '-0.02em',
                        color: 'rgba(226,232,240,0.75)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                    }}>
                        Driven by{' '}
                        <AnimatedTextCycle
                            words={['Artificial Intelligence', 'Faster Justice', 'Apex Lawyers']}
                            interval={3000}
                            className="text-blue-500"
                        />
                    </h2>

                    {/* Second line */}
                    <p style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: 'clamp(1.4rem,4vw,2.8rem)',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: '#fff',
                        marginTop: 'clamp(0.3rem,1vw,0.5rem)',
                    }}>
                        Built for every Indian.
                    </p>

                    {/* Divider */}
                    <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2, marginTop: 'clamp(1.4rem,4vw,2.2rem)' }} />

                    {/* Sub text */}
                    <p style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: 'clamp(0.82rem,1.8vw,0.95rem)',
                        fontWeight: 300,
                        lineHeight: 1.75,
                        color: 'rgba(148,163,184,0.6)',
                        marginTop: 'clamp(0.8rem,2vw,1.2rem)',
                        maxWidth: '32rem',
                    }}>
                        AI-matched lawyers &middot; SOS legal help &middot; Verified advocates &middot; Your language
                    </p>
                </div>
            </div>
        </BeamsBackground>
    );

    return (
        <motion.div
            initial={justTransitioned ? { opacity: 0, scale: 0.98, y: 20 } : false}
            animate={justTransitioned ? { opacity: 1, scale: 1, y: 0 } : false}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="min-h-screen relative bg-[#f8faff] dark:bg-[#040810] transition-colors duration-500"
        >
            <StyleInjector />
            <SmoothScrolling />
            <GradientOrbs />
            <FloatingEmergencyButton />
            <div className="relative" style={{ zIndex: 2 }}>
                <NavbarWave />
                <ScalesOfJusticeIntro justTransitioned={justTransitioned} />

                {/* Wrap in negative margin on desktop only to eliminate blank space without overlapping on mobile where section is 100vh */}
                <div className="relative z-10 md:-mt-[25vh]">
                    <TwoScenePushBridge
                        sceneA={grainHeroContent}
                        sceneB={beamsContent}
                    />
                </div>

                {/* Normal Scrolling Content */}
                {/* Once the user finishes the cinematic scroll, the rest of the page flows naturally */}
                <div className="relative w-full z-[20] bg-white dark:bg-black">
                    <div className="pt-20 pb-20 bg-black text-white">
                        <StatsSection />
                    </div>
                    <div className="bg-[#f8faff] dark:bg-[#040810]">
                        <EcosystemSection />
                    </div>
                    <div className="bg-white dark:bg-[#0a0a0a]">
                        <CTASection />
                    </div>
                    <div className="bg-[#f8faff] dark:bg-[#040810]">
                        <Footer />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LandingPageWave;
