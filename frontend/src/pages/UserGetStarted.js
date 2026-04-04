import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, ArrowRight, ArrowLeft, ShieldCheck, Lock, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export default function UserGetStarted() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── CountUp hook ──────────────────────────────────────
  function useCountUp(target, duration = 1500, delay = 400) {
    const [count, setCount] = useState(0);
    const raf = useRef(null);
    useEffect(() => {
      const timer = setTimeout(() => {
        const start = performance.now();
        const step = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuart
          const ease = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(ease * target));
          if (progress < 1) raf.current = requestAnimationFrame(step);
          else setCount(target);
        };
        raf.current = requestAnimationFrame(step);
      }, delay);
      return () => { clearTimeout(timer); cancelAnimationFrame(raf.current); };
    }, [target, duration, delay]);
    return count;
  }

  function StatItem({ target, suffix, label, delay }) {
    const count = useCountUp(target, 1400, delay);
    const formatted = count.toLocaleString('en-IN');
    return (
      <div className="text-center">
        <p className="text-lg font-black text-white leading-none tabular-nums">
          {formatted}{suffix}
        </p>
        <p className="text-[11px] text-white/25 mt-1 tracking-wide">{label}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />

      <Navbar minimal />

      {/* ── Hero Image Banner ── */}
      <div className="relative h-[28vh] md:h-[35vh] overflow-hidden">
        <img
          src="/law-office-hero.jpg"
          alt="Legal professionals"
          className="w-full h-full object-cover object-[center_30%]"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        <div className="absolute inset-0 bg-blue-950/30 mix-blend-multiply" />

        {/* Centered badge over image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 md:pt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3 md:mb-4">
              <span className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-blue-400 font-bold">India's First Legal Ecosystem</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
              Find the best possible consultation
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Cards ── */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 relative z-10 -mt-10 sm:-mt-16">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl mb-12">
          {[
            {
              id: 'lawyer',
              Icon: User,
              sup: 'Individual Advocate',
              title: 'Find a Lawyer',
              sub: 'Search 1,000+ verified lawyers by specialization, city & budget.',
              path: '/find-lawyer/manual',
              btnClass: 'bg-blue-600 hover:bg-blue-700',
              borderHover: 'hover:border-blue-500/50',
              glow: 'hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.4)]',
              accent: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
              delay: 0,
            },
            {
              id: 'firm',
              Icon: Building2,
              sup: 'Legal Establishment',
              title: 'Find a Law Firm',
              sub: 'Discover top-rated firms with full specialist teams.',
              path: '/find-lawfirm/manual',
              btnClass: 'bg-slate-700 hover:bg-slate-600',
              borderHover: 'hover:border-slate-500/50',
              glow: 'hover:shadow-[0_0_50px_-12px_rgba(100,116,139,0.3)]',
              accent: 'bg-slate-700/30 border-slate-600/30 text-slate-300',
              delay: 0.1,
            },
          ].map(({ id, Icon, sup, title, sub, path, btnClass, borderHover, glow, accent, delay }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
              onClick={() => navigate(path)}
              className={`group cursor-pointer rounded-3xl bg-[#0a0d14]/90 backdrop-blur-xl border border-white/10 ${borderHover} ${glow} transition-all duration-300 hover:-translate-y-1 p-6 md:p-8 flex flex-col shadow-2xl relative overflow-hidden`}
            >
              {/* Optional ambient glow inside card */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[40px] opacity-10 rounded-full transition-opacity duration-500 group-hover:opacity-25 pointer-events-none ${accent.includes('blue') ? 'bg-blue-600' : 'bg-slate-500'}`} />

              {/* Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${accent} shadow-inner`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="relative z-10">
                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-1.5">{sup}</p>
                <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-8 font-medium">{sub}</p>
              </div>

              {/* Button */}
              <button
                className={`relative z-10 mt-auto w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${btnClass} transition-colors`}
              >
                {title}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6"
        >
          {[
            { Icon: ShieldCheck, text: 'Bar Council Verified' },
            { Icon: Lock, text: 'End-to-end Encrypted' },
            { Icon: Star, text: 'Free Consultation' },
          ].map(({ Icon, text }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Icon className="w-3 h-3 text-blue-500/40" strokeWidth={1.5} />
              <span className="text-[11px] text-white/25">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-8"
        >
          <StatItem target={1000} suffix="+" label="Verified Lawyers" delay={500} />
          <StatItem target={10000} suffix="+" label="Cases Resolved" delay={600} />
          <StatItem target={3} suffix="+" label="States Covered" delay={700} />
        </motion.div>

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>
      </main>
    </div>
  );
}
