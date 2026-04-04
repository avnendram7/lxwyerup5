import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Building2, ArrowUpRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const options = [
    {
        id: 'lawyer',
        icon: Scale,
        label: 'Individual Practitioner',
        title: 'Join as a Lawyer',
        desc: 'Built for advocates who want to practise at a higher level. Intelligent tools that work as hard as you do.',
        path: '/register/lawyer',
        accent: 'from-blue-500/20 to-blue-600/5',
        borderHover: 'hover:border-blue-500/50',
        iconBg: 'group-hover:bg-blue-600',
        iconGlow: 'group-hover:shadow-blue-500/30',
    },
    {
        id: 'lawfirm',
        icon: Building2,
        label: 'Legal Organisation',
        title: 'Join as a Law Firm',
        desc: 'The operating system for firms that intend to lead. Manage teams, cases, and clients from one place.',
        path: '/register/lawfirm',
        accent: 'from-indigo-500/20 to-indigo-600/5',
        borderHover: 'hover:border-indigo-500/50',
        iconBg: 'group-hover:bg-indigo-600',
        iconGlow: 'group-hover:shadow-indigo-500/30',
    },
];

export default function RegisterSelectPage() {
    const navigate = useNavigate();
    const { t } = useLang();
    const canvasRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    /* subtle animated particle grid */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        let w = canvas.offsetWidth;
        let h = canvas.offsetHeight;
        canvas.width = w;
        canvas.height = h;

        const dots = Array.from({ length: 60 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.2 + 0.3,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            o: Math.random() * 0.35 + 0.05,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            dots.forEach(d => {
                d.x += d.vx; d.y += d.vy;
                if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
                if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96,165,250,${d.o})`;
                ctx.fill();
            });
            // draw connecting lines
            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.strokeStyle = `rgba(96,165,250,${0.08 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            className="min-h-screen bg-black text-white overflow-hidden"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* ── CINEMATIC HERO SECTION ── */}
            <div className="relative min-h-screen lg:min-h-0 lg:h-auto flex flex-col lg:flex-row">

                {/* Left panel — image */}
                <div className="relative lg:w-[55%] h-72 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
                    {/* Particle canvas */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

                    {/* Hero image */}
                    <img
                        src="/register_hero.jpg"
                        alt="Futuristic legal AI — holographic scales of justice"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'brightness(0.75) saturate(1.2)' }}
                    />

                    {/* Gradient overlays for seamless blending */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black z-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-20" />

                    {/* Floating badge on image */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute bottom-10 left-8 z-30 flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-blue-500/30"
                    >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-blue-300 tracking-wider uppercase">India's First Legal Tech Ecosystem</span>
                    </motion.div>
                </div>

                {/* Right panel — form/selection */}
                <div className="relative flex-1 flex flex-col justify-center px-8 md:px-14 py-20 lg:py-0 z-10">

                    {/* Ambient glow behind content */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-indigo-500/8 blur-[100px] pointer-events-none" />

                    {/* Back nav */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors group mb-14 self-start"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        {t('reg_home')}
                    </motion.button>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 mb-7 self-start"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-300 tracking-[0.15em] uppercase">
                            {t('reg_badge')}
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-4"
                    >
                        <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-5">
                            <span className="text-white">{t('reg_title_1')}</span>
                            <br />
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {t('reg_title_2')}
                            </span>
                        </h1>
                        <p className="text-white/45 text-base font-light leading-relaxed max-w-sm">
                            {t('reg_sub')}
                        </p>
                    </motion.div>

                    {/* Cards */}
                    <div className="flex flex-col gap-4 mt-8 max-w-md">
                        {options.map((opt, i) => {
                            const Icon = opt.icon;
                            return (
                                <motion.div
                                    key={opt.id}
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.25 + i * 0.12 }}
                                    onClick={() => navigate(opt.path)}
                                    className={`group cursor-pointer relative flex items-center gap-5 px-6 py-6 rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-sm ${opt.borderHover} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl overflow-hidden`}
                                >
                                    {/* Card inner gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${opt.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    {/* Icon */}
                                    <div className={`relative z-10 w-14 h-14 rounded-xl bg-white/[0.06] text-white/50 flex items-center justify-center shrink-0 ${opt.iconBg} group-hover:text-white transition-all duration-300 ${opt.iconGlow} group-hover:shadow-lg`}>
                                        <Icon className="w-7 h-7" strokeWidth={1.5} />
                                    </div>

                                    {/* Text */}
                                    <div className="relative z-10 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[9px] tracking-[0.18em] uppercase text-white/40 font-semibold">{opt.id === 'lawyer' ? t('reg_lawyer_label') : t('reg_firm_label')}</p>
                                        </div>
                                        <h2 className="text-base font-bold text-white mb-1.5">{opt.id === 'lawyer' ? t('reg_lawyer_title') : t('reg_firm_title')}</h2>
                                        <p className="text-xs text-white/40 font-light leading-relaxed">{opt.id === 'lawyer' ? t('reg_lawyer_desc') : t('reg_firm_desc')}</p>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowUpRight className="relative z-10 w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="text-sm text-white/30 mt-10"
                    >
                        {t('reg_already')}{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors hover:underline underline-offset-2"
                        >
                            {t('reg_sign_in')}
                        </button>
                    </motion.p>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="mt-12 flex items-center gap-6"
                    >
                        {[t('reg_verified'), t('reg_review')].map((txt, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-blue-400" />
                                <span className="text-[10px] text-white/25 font-medium tracking-wide">{txt}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
