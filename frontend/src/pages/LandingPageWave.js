import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, useInView, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import {
    ArrowRight, Shield, Zap, Users, Brain,
    Clock, FileText, Gavel, BookOpen,
    MessageSquare, Search, UserCheck, Menu, X, ChevronDown, Scale, AlertTriangle
} from 'lucide-react';
import { NavbarWave } from '../components/NavbarWave';
import { GradientOrbs } from '../components/GradientOrbs';
import { Button } from '../components/ui/button';
import MagicButton from '../components/ui/MagicButton';

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

/* ── 3D Animated Sphere ── */
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
@keyframes convergeToCenter {
  0%   { transform: translate(var(--startX), var(--startY)) scale(1); opacity: 0; }
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

// Legal data labels with positions (distributed around the scales) - 30% FASTER
const legalDataItems = [
    { label: 'Family Law', angle: 30, dist: 280, delay: 0, dur: 2.8 },
    { label: 'Criminal Law', angle: 75, dist: 310, delay: 0.6, dur: 3.2 },
    { label: 'Contracts', angle: 120, dist: 260, delay: 1.2, dur: 2.7 },
    { label: 'Property Law', angle: 165, dist: 300, delay: 0.3, dur: 2.9 },
    { label: 'Tax Law', angle: 210, dist: 270, delay: 1.5, dur: 2.5 },
    { label: 'IP Rights', angle: 250, dist: 320, delay: 0.9, dur: 3.4 },
    { label: 'Corporate', angle: 290, dist: 290, delay: 1.8, dur: 2.8 },
    { label: 'Civil Rights', angle: 340, dist: 250, delay: 0.4, dur: 2.5 },
    { label: 'Labor Law', angle: 55, dist: 340, delay: 2.1, dur: 3.0 },
    { label: 'Banking Law', angle: 145, dist: 330, delay: 1.1, dur: 2.7 },
    { label: 'Cyber Law', angle: 195, dist: 260, delay: 2.4, dur: 2.9 },
    { label: 'Consumer Law', angle: 310, dist: 300, delay: 0.7, dur: 2.6 },
];

// Rays pointing toward center
const rays = [
    { angle: 0, len: 350, w: 2 },
    { angle: 45, len: 300, w: 1.5 },
    { angle: 90, len: 320, w: 1 },
    { angle: 135, len: 280, w: 1.5 },
    { angle: 180, len: 340, w: 2 },
    { angle: 225, len: 300, w: 1 },
    { angle: 270, len: 310, w: 1.5 },
    { angle: 315, len: 290, w: 1 },
];

const ScalesOfJusticeIntro = React.memo(() => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const scaleVal = useTransform(scrollYProgress, [0, 0.5], [1.6, 0.16]);
    const opacityVal = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const yVal = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const blurVal = useTransform(scrollYProgress, [0, 0.4], [0, 20]);

    // Create a template motion value for the filter string
    const filterVal = useTransform(blurVal, (v) => `blur(${v}px)`);

    return (
        <section ref={ref} className="relative bg-[#f8faff] dark:bg-black transition-colors duration-500" style={{ height: '160vh' }}>
            <div
                className="sticky top-0 flex items-center justify-center"
                style={{ height: '100vh', zIndex: 20, pointerEvents: 'none', overflow: 'visible' }}
            >
                <motion.div
                    style={{
                        scale: scaleVal,
                        opacity: opacityVal,
                        y: yVal,
                        filter: filterVal,
                    }}
                    className="relative flex flex-col items-center gap-6"
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
                                    transform: `rotate(${ray.angle}deg)`,
                                    background: `linear-gradient(90deg, rgba(59,130,246,0.01) 0%, rgba(59,130,246,0.15) 50%, rgba(96,165,250,0.3) 100%)`,
                                    animation: `rayPulse ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
                                    borderRadius: '2px',
                                }}
                            />
                        );
                    })}

                    {/* Animated legal data dots with labels */}
                    {legalDataItems.map((item, i) => {
                        const rad = (item.angle * Math.PI) / 180;
                        const startX = Math.cos(rad) * item.dist;
                        const startY = Math.sin(rad) * item.dist;
                        return (
                            <div
                                key={`data${i}`}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    '--startX': `${startX}px`,
                                    '--startY': `${startY}px`,
                                    animation: `convergeToCenter ${item.dur}s ease-in ${item.delay}s infinite`,
                                    zIndex: 10,
                                }}
                            >
                                {/* Glowing dot */}
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                                        boxShadow: '0 0 8px rgba(59,130,246,0.6), 0 0 20px rgba(96,165,250,0.2)',
                                        animation: `dotGlow ${1.5 + i * 0.2}s ease-in-out infinite`,
                                    }}
                                />
                                {/* Label */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: startY > 0 ? '-22px' : '12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        whiteSpace: 'nowrap',
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        fontFamily: "'Outfit', sans-serif",
                                        color: '#3b82f6',
                                        backdropFilter: 'blur(4px)',
                                        animation: `labelFloat ${item.dur}s ease-in ${item.delay}s infinite`,
                                        letterSpacing: '0.3px',
                                    }}
                                    className="bg-[rgba(248,250,255,0.85)] dark:bg-[rgba(15,23,42,0.85)] border border-[rgba(59,130,246,0.15)] dark:border-blue-900/30 px-2 py-0.5 rounded-[10px]"
                                >
                                    {item.label}
                                </div>
                                {/* Trail line from dot to center */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: `${Math.sqrt(startX * startX + startY * startY) * 0.3}px`,
                                        height: '1px',
                                        transformOrigin: '0 50%',
                                        transform: `rotate(${Math.atan2(-startY, -startX) * (180 / Math.PI)}deg)`,
                                        background: `linear-gradient(90deg, rgba(96,165,250,0.4), transparent)`,
                                    }}
                                />
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
                            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(96,165,250,0.08) 50%, transparent 70%)',
                            filter: 'blur(40px)',
                            animation: 'pulseGlow 4s ease-in-out infinite',
                        }}
                    />

                    {/* Inner ring collecting data */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '220px',
                            height: '220px',
                            borderRadius: '50%',
                            border: '1px solid rgba(59,130,246,0.12)',
                            animation: 'spinSlow 20s linear infinite',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: '280px',
                            height: '280px',
                            borderRadius: '50%',
                            border: '1px dashed rgba(96,165,250,0.08)',
                            animation: 'spinSlow 30s linear infinite reverse',
                        }}
                    />

                    {/* SVG Scales of Justice */}
                    <svg
                        width="180"
                        height="180"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.4))', position: 'relative', zIndex: 5 }}
                    >
                        {/* Central pillar (static) */}
                        <rect x="48" y="20" width="4" height="65" rx="2" fill="url(#pillarGrad)" />
                        {/* Base (static) */}
                        <rect x="35" y="82" width="30" height="5" rx="2.5" fill="url(#baseGrad)" />

                        {/* Animated Beam Group - SWAYING */}
                        <g style={{ transformOrigin: '50px 20px', animation: 'balanceBeam 6s ease-in-out infinite' }}>
                            {/* Beam */}
                            <rect x="15" y="18" width="70" height="4" rx="2" fill="url(#beamGrad)" />

                            {/* Left Pan Group - COUNTER ROTATE */}
                            <g style={{ transformOrigin: '20px 22px', animation: 'counterRotate 6s ease-in-out infinite' }}>
                                {/* Left pan chain */}
                                <line x1="20" y1="22" x2="20" y2="45" stroke="#60a5fa" strokeWidth="1.5" />
                                <line x1="15" y1="22" x2="15" y2="40" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
                                <line x1="25" y1="22" x2="25" y2="40" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
                                {/* Left pan */}
                                <path d="M10 45 Q20 55 30 45" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.15)" />
                            </g>

                            {/* Right Pan Group - COUNTER ROTATE */}
                            <g style={{ transformOrigin: '80px 22px', animation: 'counterRotate 6s ease-in-out infinite' }}>
                                {/* Right pan chain */}
                                <line x1="80" y1="22" x2="80" y2="45" stroke="#60a5fa" strokeWidth="1.5" />
                                <line x1="75" y1="22" x2="75" y2="40" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
                                <line x1="85" y1="22" x2="85" y2="40" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
                                {/* Right pan */}
                                <path d="M70 45 Q80 55 90 45" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.15)" />
                            </g>
                        </g>

                        {/* Crown/top */}
                        <circle cx="50" cy="16" r="5" fill="url(#crownGrad)" />
                        <circle cx="50" cy="16" r="3" className="fill-[#f8faff] dark:fill-black" />
                        {/* Gradients */}
                        <defs>
                            <linearGradient id="pillarGrad" x1="50" y1="20" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#3b82f6" />
                                <stop offset="1" stopColor="#1d4ed8" />
                            </linearGradient>
                            <linearGradient id="baseGrad" x1="35" y1="84" x2="65" y2="84" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#2563eb" />
                                <stop offset="1" stopColor="#1e40af" />
                            </linearGradient>
                            <linearGradient id="beamGrad" x1="15" y1="20" x2="85" y2="20" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#60a5fa" />
                                <stop offset="0.5" stopColor="#3b82f6" />
                                <stop offset="1" stopColor="#60a5fa" />
                            </linearGradient>
                            <radialGradient id="crownGrad">
                                <stop stopColor="#60a5fa" />
                                <stop offset="1" stopColor="#2563eb" />
                            </radialGradient>
                        </defs>
                    </svg>

                    <h2
                        className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors"
                        style={{ fontFamily: "'Outfit', sans-serif", position: 'relative', zIndex: 5 }}
                    >
                        Lxwyer Up
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors" style={{ position: 'relative', zIndex: 5 }}>Scroll to explore</p>
                </motion.div>
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
            if (Math.random() > 0.4) return; // Control density

            const id = idCounter++;
            const angle = Math.random() * 360;
            const distance = 150 + Math.random() * 100; // How far they travel

            const newItem = {
                id,
                label: solutions[Math.floor(Math.random() * solutions.length)],
                angle: angle, // Store angle for rotation
                dist: distance, // Total distance
                delay: 0,
                duration: 4 + Math.random() * 2,
            };

            setParticles(prev => [...prev.slice(-15), newItem]);
        }, 600);

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
            backdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.3)',
            boxShadow: isDark
                ? `0 0 ${12 + fragment.size * 0.3}px rgba(37,99,235,${0.15 + fragment.brightness * 0.1}), inset 0 0 ${fragment.size * 0.2}px rgba(255,255,255,0.05)`
                : `0 0 ${12 + fragment.size * 0.3}px rgba(96,165,250,${0.2 + fragment.brightness * 0.15}), inset 0 0 ${fragment.size * 0.2}px rgba(255,255,255,0.2)`,
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
        return Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * 360 + (Math.random() - 0.5) * 20;
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
        return Array.from({ length: 30 }).map((_, i) => {
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
    // 0.32 - 0.42: Orbiting phase with "Lxwyer Up" visible
    // 0.42 - 0.44: "Lxwyer Up" blurs out — "Easy & Efficient" takes over
    // 0.44 - 0.58: "Easy & Efficient" is prominent
    // 0.58 - 0.62: Everything fades out

    const visibleRange = useTransform(scrollYProgress, [0.30, 0.32, 0.58, 0.62], [0, 1, 1, 0]);
    const fragmentProgress = useTransform(scrollYProgress, [0.32, 0.58], [0, 1]);
    const mistProgress = useTransform(scrollYProgress, [0.31, 0.45], [0, 1]);

    // White flash at moment of blast
    const flashOpacity = useTransform(scrollYProgress, [0.31, 0.32, 0.34], [0, 0.7, 0]);

    // Shockwave rings (expanding circles)
    const ring1Scale = useTransform(scrollYProgress, [0.32, 0.37], [0.3, 4]);
    const ring1Opacity = useTransform(scrollYProgress, [0.32, 0.33, 0.37], [0, 0.4, 0]);
    const ring2Scale = useTransform(scrollYProgress, [0.33, 0.38], [0.3, 3]);
    const ring2Opacity = useTransform(scrollYProgress, [0.33, 0.34, 0.38], [0, 0.25, 0]);

    // "Lxwyer Up" Text Reveal — appears then BLURS AWAY when Easy & Efficient comes
    const textScaleRaw = useTransform(scrollYProgress, [0.32, 0.35, 0.42, 0.46], [0, 1.05, 1, 0.8]);
    const textOpacity = useTransform(scrollYProgress, [0.32, 0.34, 0.42, 0.46], [0, 1, 1, 0]);
    const textBlur = useTransform(scrollYProgress, [0.32, 0.35, 0.42, 0.46], [30, 0, 0, 30]);
    const textGlow = useTransform(scrollYProgress, [0.32, 0.35, 0.40], [40, 15, 0]);
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
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(219,234,254,0.4) 50%, transparent 80%)',
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
    const size = useTransform(scrollYProgress, [0, 0.30, 0.50], [180, 220, 800]);

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

const ExplosionSpacer = () => {
    return (
        <section className="relative w-full bg-[#f8faff] dark:bg-black transition-colors duration-500" style={{ height: '280vh' }}>
            {/* Dedicated scroll space — extended for blast + Easy & Efficient + breathing room */}
        </section>
    );
};

/* ─────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────── */

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-24 px-6 lg:px-8 bg-[#f8faff] dark:bg-black transition-colors duration-500">
            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
                    {/* Pill badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10 bg-blue-500/10 border border-blue-500/20 dark:bg-slate-900/50 dark:border-blue-500/30 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        <span className="text-xs font-medium tracking-wide uppercase text-blue-600 dark:text-blue-400">India's First Legal Tech Ecosystem</span>
                    </motion.div>

                    <h2
                        className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-slate-900 dark:text-slate-100 transition-colors leading-tight"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Justice You Understand,{' '}
                        <br className="hidden sm:block" />
                        <span className="text-blue-600 dark:text-blue-500">Technology</span> You Trust
                    </h2>

                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                        Connect with verified lawyers, get instant AI-powered legal guidance, and navigate the Indian legal system with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <button
                                onClick={() => navigate('/role-selection')}
                                className="group relative inline-flex items-center gap-3 h-14 px-10 rounded-full text-lg font-bold transition-all duration-300 
                                bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-800 dark:to-slate-950
                                text-slate-800 dark:text-white
                                border-t border-l border-white/50 dark:border-white/10
                                shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),4px_4px_10px_rgba(0,0,0,0.1)] 
                                dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),4px_4px_10px_rgba(0,0,0,0.5)]
                                hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
                                hover:scale-105 active:scale-95"
                            >
                                Get Started
                                <span className="flex items-center justify-center w-8 h-8 rounded-full 
                                    bg-slate-200 dark:bg-slate-800 
                                    group-hover:bg-blue-500 dark:group-hover:bg-cyan-500 
                                    group-hover:text-white transition-all duration-300
                                    shadow-inner group-hover:translate-x-1">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <button
                                onClick={() => navigate('/quick-chat')}
                                className="ai-btn-glow ai-btn-shimmer group relative inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-lg font-bold text-white overflow-hidden transition-all duration-300 active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)',
                                    border: '1px solid rgba(196,181,253,0.5)',
                                }}
                            >
                                <span className="text-base" style={{ filter: 'drop-shadow(0 0 6px rgba(216,180,254,1))' }}>✦</span>
                                LxwyerAI
                            </button>
                        </motion.div>
                    </div>

                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="mt-20">
                        <ChevronDown className="w-6 h-6 mx-auto" style={{ color: '#94a3b8' }} />
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
            className={`group relative p-8 rounded-3xl transition-all duration-500 cursor-default ${span === 2 ? 'md:col-span-2' : ''} bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm`}
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
                    <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">{description}</p>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturesSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const features = [
        { icon: Brain, title: 'AI Legal Assistant', description: 'Get instant answers to your legal queries powered by AI trained on Indian law and procedures.', span: 2 },
        { icon: Search, title: 'Find Lawyers', description: 'Connect with verified lawyers across India specializing in your specific legal needs.' },
        { icon: FileText, title: 'Case Management', description: 'Track your case progress, documents, and timelines in one secure platform.' },
        { icon: MessageSquare, title: 'Legal Consultation', description: 'Book online or offline consultations with experienced legal professionals.', span: 2 },
        { icon: Shield, title: 'Secure & Private', description: 'Your data and communications are protected with end-to-end encryption.' },
    ];

    return (
        <section
            id="features"
            ref={ref}
            className="relative py-28 px-6 lg:px-8 bg-slate-50/80 dark:bg-black transition-colors duration-500"
        >
            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block text-blue-600 dark:text-blue-500">Features</span>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-5 text-slate-900 dark:text-slate-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Everything You Need
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto text-slate-500 dark:text-slate-400">
                        Comprehensive legal solutions designed for modern India
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-5">
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
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
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
            className="relative py-28 px-6 lg:px-8"
            style={{ background: '#000000' }}
        >
            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block" style={{ color: '#60a5fa' }}>Services</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Services We Offer
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(148,163,184,0.8)' }}>
                        Professional legal services tailored for every Indian citizen
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
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
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const points = [
        { icon: Users, label: 'Connect with lawyers in your city' },
        { icon: Shield, label: 'Transparent pricing with no hidden costs' },
        { icon: Clock, label: 'Track your case progress in real-time' },
        { icon: FileText, label: 'Secure document management' },
    ];

    return (
        <section
            ref={ref}
            className="relative py-28 px-6 lg:px-8 bg-[#f8faff] dark:bg-black transition-colors duration-500"
        >
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex flex-col gap-16 items-center">
                    {/* Visual – connectivity */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.7 }}
                        className="relative flex items-center justify-center order-2 lg:order-1"
                    >
                        {/* Central hub */}
                        <div className="relative" style={{ width: '320px', height: '320px' }}>
                            {/* Rotating ring */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    border: '1px dashed rgba(59,130,246,0.2)',
                                    animation: 'spinSlow 30s linear infinite',
                                }}
                            />
                            {/* Inner ring */}
                            <div
                                className="absolute rounded-full"
                                style={{
                                    top: '20%', left: '20%', right: '20%', bottom: '20%',
                                    border: '1px solid rgba(59,130,246,0.1)',
                                    animation: 'spinSlow 20s linear infinite reverse',
                                }}
                            />
                            {/* Center logo */}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                    boxShadow: '0 8px 30px rgba(37,99,235,0.3)',
                                }}
                            >
                                <span className="text-white text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>LU</span>
                            </div>

                            {/* Orbiting nodes */}
                            {[
                                { angle: 0, icon: '⚖️', label: 'Legal' },
                                { angle: 72, icon: '🤖', label: 'AI' },
                                { angle: 144, icon: '📋', label: 'Docs' },
                                { angle: 216, icon: '👥', label: 'Clients' },
                                { angle: 288, icon: '🔒', label: 'Secure' },
                            ].map((node, i) => {
                                const rad = (node.angle * Math.PI) / 180;
                                const radius = 130;
                                const x = Math.cos(rad) * radius;
                                const y = Math.sin(rad) * radius;
                                return (
                                    <div
                                        key={i}
                                        className="absolute flex items-center justify-center"
                                        style={{
                                            top: `calc(50% + ${y}px - 22px)`,
                                            left: `calc(50% + ${x}px - 22px)`,
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(59,130,246,0.12)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                            animation: `float ${5 + i}s ease-in-out infinite`,
                                            animationDelay: `${i * 0.3}s`,
                                        }}
                                    >
                                        <span className="text-lg">{node.icon}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Text content – centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="text-center order-1 lg:order-2"
                    >
                        <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block text-blue-600 dark:text-blue-500">Why Lxwyer Up</span>
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-slate-900 dark:text-slate-100 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Legal Services
                            <span className="block text-blue-600 dark:text-blue-500">Designed for India</span>
                        </h2>
                        <p className="text-lg mb-10 leading-relaxed max-w-2xl mx-auto text-slate-500 dark:text-slate-400 transition-colors">
                            We understand the complexities of the Indian legal system. Our platform bridges the gap between citizens and quality legal representation.
                        </p>

                        <ul className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto text-left">
                            {points.map((p, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: i * 0.12 + 0.3 }}
                                    className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-100 dark:border-slate-800"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/10 dark:border-blue-500/30"
                                    >
                                        <p.icon className="w-5 h-5" style={{ color: '#2563eb' }} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors">{p.label}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

/* ─────────────────────────────────────────────
   STATS – animated counters
   ───────────────────────────────────────────── */

const AnimatedCounter = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const end = parseInt(target);
        const duration = 2000;
        const step = Math.max(1, Math.floor(end / (duration / 16)));
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const stats = [
        { value: '1000', suffix: '+', label: 'Active Lawyers' },
        { value: '50', suffix: '+', label: 'Legal Areas' },
        { value: '1000', suffix: '+', label: 'Queries Solved & Helped' },
    ];

    return (
        <section
            ref={ref}

            className="relative py-20 px-6 lg:px-8 bg-[rgba(248,250,255,0.85)] dark:bg-black/85 transition-colors duration-500"
        >
            <div className="relative z-10 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-3 gap-6"
                >
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="text-center py-8 px-4 rounded-3xl transition-all duration-500 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm"
                        >
                            <div className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                <AnimatedCounter target={s.value} suffix={s.suffix} />
                            </div>
                            <div className="text-xs uppercase tracking-[0.15em] font-medium text-slate-400 dark:text-slate-500">{s.label}</div>
                        </div>
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

    return (
        <section
            ref={ref}
            className="relative py-32 px-6 lg:px-8 overflow-hidden"
            style={{ background: '#000000' }}
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
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 block" style={{ color: '#60a5fa' }}>Get Started Today</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Ready to Get Legal Help?
                    </h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(148,163,184,0.7)' }}>
                        Start your journey towards justice today. Our team is ready to assist you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                onClick={() => navigate('/role-selection')}
                                className="h-14 px-10 rounded-full text-white text-lg font-semibold transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                    boxShadow: '0 8px 30px rgba(37,99,235,0.3)',
                                }}
                            >
                                Book Your Consultation
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
    return (
        <footer
            className="relative py-16 px-6 lg:px-8 bg-[#060a14] dark:bg-black border-t border-white/5 dark:border-white/5 transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="mb-5">
                            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Lxwyer Up</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            Justice You Understand, Technology You Trust
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-5">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', path: '/' },
                                { label: 'About', path: '/premium-about' },
                                { label: 'Contact', path: '/premium-contact' },
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
                        <h4 className="text-sm font-semibold text-white mb-5">Services</h4>
                        <ul className="space-y-3 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            <li>Legal Consultation</li>
                            <li>Find Lawyers</li>
                            <li>AI Assistant</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-5">Contact</h4>
                        <ul className="space-y-3 text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            <li>avnendram.7@gmail.com</li>
                            <li>+91 8318216968</li>
                            <li>Sonipat, Haryana</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.3)' }}>
                    © {new Date().getFullYear()} Lxwyer Up. All rights reserved.
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

const LandingPageWave = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen relative" style={{ background: '#f8faff' }}>
            <StyleInjector />
            <SmoothScrolling />
            <GradientOrbs />
            <ScrollReactiveSphere />
            <SphereExplosion />
            <FloatingEmergencyButton />
            <div className="relative" style={{ zIndex: 2 }}>
                <NavbarWave />
                <ScalesOfJusticeIntro />
                <HeroSection />
                <ExplosionSpacer />
                <FeaturesSection />
                <StatsSection />
                <EcosystemSection />
                <ServicesSection />
                <CTASection />
                <Footer />
            </div>
        </div>
    );
};

export default LandingPageWave;
