import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ChevronDown, Scale, Building2, ArrowRight, Zap, Languages, Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/* Cinematic animated — border pulse + shimmer + text flicker */
const neonStyle = `
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
.lxwyer-w-full { display: flex; width: 100%; }
@keyframes arrowPulseBounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}
.moving-arrow { animation: arrowPulseBounce 1.2s ease-in-out infinite; }
`;


/* ── Register dropdown ──────────────────────────────────────────────────── */
const RegisterDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const items = [
        {
            icon: Scale,
            label: 'Register as Lawyer',
            sub: 'Join our verified legal network',
            path: '/lawyer-application',
            accent: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10',
            border: 'border-indigo-100 dark:border-indigo-500/20',
        },
        {
            icon: Building2,
            label: 'Register as Law Firm',
            sub: 'Onboard your firm and lawyers',
            path: '/lawfirm-application',
            accent: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-500/10',
            border: 'border-teal-100 dark:border-teal-500/20',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-[#0d0d0d] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/70 overflow-hidden z-50"
        >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Join LxwyerUp as a Professional
                </p>
            </div>
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.path}
                        onClick={() => { navigate(item.path); if (onClose) onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors text-left group border-b border-slate-50 dark:border-white/[0.03] last:border-0"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg} border ${item.border}`}>
                            <Icon className={`w-5 h-5 ${item.accent}`} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 truncate">{item.sub}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
                    </button>
                );
            })}
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05]">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Already registered?{' '}
                    <button onClick={() => { navigate('/login'); if (onClose) onClose(); }} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Login →
                    </button>
                </p>
            </div>
        </motion.div>
    );
};

export const NavbarWave = () => {
    const navigate = useNavigate();
    const { lang, setLang, t } = useLang();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const registerRef = useRef(null);

    useEffect(() => {
        const handle = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handle);
        return () => window.removeEventListener('scroll', handle);
    }, []);

    useEffect(() => {
        function handleClick(e) {
            if (registerRef.current && !registerRef.current.contains(e.target)) {
                setRegisterOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const links = [
        { label: t('nav_features'), path: '/features' },
        { label: t('nav_about'), path: '/about' },
        { label: t('nav_contact'), path: '/contact' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

    return (
        <>
        <style>{neonStyle}</style>
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/90 dark:bg-[#080808]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06] shadow-sm dark:shadow-black/40'
            : 'bg-white/80 dark:bg-[#080808]/80 backdrop-blur-md border-b border-slate-200/40 dark:border-white/[0.04]'
            }`}>
            {/* Full-width container with responsive padding */}
            <div className="w-full mx-auto px-4 md:px-6 xl:px-12">
                <div className="relative flex items-center justify-between h-14">

                    {/* ── Logo ──────────────────────────────────────────── */}
                    <div className="flex shrink-0">
                        <button
                            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="shrink-0 flex items-center gap-2"
                        >
                            <img
                                src="/logo.png"
                                alt="Lxwyer Up Logo"
                                className="w-8 h-8 object-contain rounded"
                                style={{ mixBlendMode: 'screen' }}
                            />
                            <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit'] select-none">
                                Lxwyer Up
                            </span>
                        </button>
                    </div>

                    {/* ── Center Nav Links — only show at xl+ to avoid overlap ── */}
                    <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
                        {links.map(l => (
                            <button
                                key={l.label}
                                onClick={() => handleNavigation(l.path)}
                                className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-200 whitespace-nowrap tracking-wide"
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Right CTAs — tighter sizing at md, full at xl ── */}
                    <div className="hidden md:flex absolute right-0 items-center gap-1 xl:gap-2 shrink-0">

                        {/* Language toggle */}
                        <button
                            onClick={toggleLang}
                            title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] xl:text-[12px] font-bold transition-all duration-200 border whitespace-nowrap select-none"
                            style={{
                                background: lang === 'hi' ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent',
                                color: lang === 'hi' ? '#fff' : '#64748b',
                                borderColor: lang === 'hi' ? '#f97316' : 'rgba(203,213,225,0.6)',
                            }}
                        >
                            {lang === 'en' ? 'हिं' : 'EN'}
                        </button>

                        {/* Login */}
                        <button
                            onClick={() => navigate('/login')}
                            className="px-2 py-1.5 text-[11px] xl:text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 whitespace-nowrap"
                        >
                            {t('nav_login')}
                        </button>

                        {/* Join as Expert */}
                        <button
                            onClick={() => navigate('/register')}
                            className="inline-flex items-center px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-[13px] font-semibold transition-all duration-200 border whitespace-nowrap text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            <span className="hidden xl:inline">{t('nav_join_expert')}</span>
                            <span className="xl:hidden">{t('nav_join')}</span>
                        </button>

                        {/* Divider */}
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1" />

                        {/* LxwyerAI — spinning border sweep */}
                        <div className="lxwyer-wrap">
                          <div className="lxwyer-spin" />
                          <button
                            onClick={() => navigate('/lxwyerai')}
                            className="lxwyer-inner px-2.5 xl:px-4 py-[6px] xl:py-[7px] text-[11px] xl:text-[13px] font-bold whitespace-nowrap"
                          >
                            <Sparkles className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white/60" />
                            <span className="lxwyer-text text-white font-black tracking-[0.05em]">Lxwyer<span className="text-blue-400">AI</span></span>
                          </button>
                        </div>

                        {/* Find Lawyer */}
                        <button
                            onClick={() => navigate('/user-get-started')}
                            className="inline-flex items-center gap-1 px-2.5 xl:px-4 py-[6px] xl:py-[7px] rounded-full text-[11px] xl:text-[13px] font-bold
                                       text-white bg-blue-600 hover:bg-blue-700
                                       shadow-md shadow-blue-500/20 hover:shadow-blue-500/40
                                       transition-all duration-200 whitespace-nowrap"
                        >
                            <span className="hidden xl:inline">{t('nav_find_lawyer')}</span>
                            <span className="xl:hidden">{t('nav_match')}</span>
                            <ArrowRight className="w-3 h-3 xl:w-3.5 xl:h-3.5 moving-arrow" />
                        </button>


                    </div>

                    {/* ── Mobile Toggle ─────────────────────────────────── */}
                    <div className="md:hidden flex items-center gap-1.5">
                        {/* LxwyerAI mobile inline */}
                        <div className="lxwyer-wrap scale-[0.8] origin-right">
                          <div className="lxwyer-spin" />
                          <button
                            onClick={() => navigate('/lxwyerai')}
                            className="lxwyer-inner px-2 py-1 flex items-center"
                          >
                            <Sparkles className="w-4 h-4 text-white/70" />
                          </button>
                        </div>

                        {/* Find Lawyer mobile inline */}
                        <button
                            onClick={() => navigate('/user-get-started')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 whitespace-nowrap"
                        >
                            {t('nav_find_lawyer')}
                            <ArrowRight className="w-3 h-3 moving-arrow" />
                        </button>

                        {/* Language toggle mobile */}
                        <button
                            onClick={toggleLang}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-200"
                            style={{
                                background: lang === 'hi' ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent',
                                color: lang === 'hi' ? '#fff' : '#64748b',
                                borderColor: lang === 'hi' ? '#f97316' : 'rgba(203,213,225,0.6)',
                            }}
                        >
                            {lang === 'en' ? 'हिं' : 'EN'}
                        </button>
                        <button
                            className="p-2 text-slate-600 dark:text-slate-300"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Menu ───────────────────────────────────────────── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="md:hidden px-6 pb-6 flex flex-col gap-2.5 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-slate-200/40 dark:border-white/5"
                    >
                        {links.map(l => (
                            <button key={l.label} onClick={() => { setMenuOpen(false); handleNavigation(l.path); }}
                                className="text-left py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">
                                {l.label}
                            </button>
                        ))}
                        <div className="pt-1 space-y-2">
                            {/* Primary actions first on mobile */}
                            <button onClick={() => { setMenuOpen(false); navigate('/user-get-started'); }}
                                className="w-full rounded-full px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-500/30 flex items-center justify-center gap-2">
                                {t('nav_find_lawyer')} <ArrowRight className="w-4 h-4" />
                            </button>
                            {/* LxwyerAI mobile — spinning border sweep */}
                            <div className="lxwyer-wrap lxwyer-w-full">
                              <div className="lxwyer-spin" />
                              <button
                                onClick={() => handleNavigation('/lxwyerai')}
                                className="lxwyer-inner w-full p-3 rounded-2xl justify-start active:scale-[0.98]"
                              >
                                <Sparkles className="w-4 h-4 text-white/60" />
                                <span className="lxwyer-text text-white font-black tracking-[0.05em]">Lxwyer<span className="text-blue-400">AI</span></span>
                              </button>
                            </div>
                            <div className="flex flex-col gap-2 pt-1">
                                <button onClick={() => { setMenuOpen(false); navigate('/lawyer-application'); }}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-start gap-3">
                                    <Scale className="w-4 h-4 text-blue-500" /> Register as Lawyer
                                </button>
                                <button onClick={() => { setMenuOpen(false); navigate('/lawfirm-application'); }}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-start gap-3">
                                    <Building2 className="w-4 h-4 text-blue-500" /> Register as Law Firm
                                </button>
                            </div>
                            <button onClick={() => { setMenuOpen(false); navigate('/login'); }}
                                className="w-full rounded-full px-5 py-2.5 text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                {t('nav_login')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
        </>
    );
};
