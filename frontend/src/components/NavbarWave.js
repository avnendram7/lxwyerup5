import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';

// Inject neon AI button animation once
const aiButtonStyle = `
@keyframes aiGlowPulse {
  0%, 100% { box-shadow: 0 0 12px 3px rgba(139,92,246,0.55), 0 0 28px 6px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.15); }
  50% { box-shadow: 0 0 22px 6px rgba(167,139,250,0.75), 0 0 48px 12px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
}
@keyframes aiShimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(300%) skewX(-15deg); }
}
.ai-btn-glow { animation: aiGlowPulse 2.4s ease-in-out infinite; }
.ai-btn-shimmer::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 40%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  animation: aiShimmer 3s ease-in-out infinite;
  pointer-events: none;
}
`;
if (typeof document !== 'undefined' && !document.getElementById('ai-btn-style')) {
    const s = document.createElement('style');
    s.id = 'ai-btn-style';
    s.textContent = aiButtonStyle;
    document.head.appendChild(s);
}

export const NavbarWave = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handle = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handle);
        return () => window.removeEventListener('scroll', handle);
    }, []);

    const links = [
        { label: 'Features', path: '/#features' },
        { label: 'Services', path: '/#services' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ];

    const handleNavigation = (path) => {
        if (path.startsWith('/#')) {
            // Check if we are already on home page
            if (window.location.pathname === '/' || window.location.pathname === '/landing') {
                const element = document.querySelector(path.substring(1));
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/');
                // Small delay to allow navigation to engage before scrolling
                setTimeout(() => {
                    const element = document.querySelector(path.substring(1));
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        } else {
            navigate(path);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
                : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative flex justify-between items-center py-4">
                <button
                    onClick={() => {
                        navigate('/');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative z-10"
                >
                    <span
                        className="text-xl font-bold tracking-tight transition-colors text-slate-900 dark:text-white font-['Outfit']"
                    >
                        Lxwyer Up
                    </span>
                </button>

                {/* Desktop Links - Absolutely Centered */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {links.map(l => (
                        <div key={l.label}>
                            <button
                                onClick={() => handleNavigation(l.path)}
                                className="text-sm font-medium transition-colors text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                            >
                                {l.label}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Desktop CTAs - Right Aligned */}
                <div className="hidden md:flex items-center gap-3 relative z-10">
                    <Button
                        onClick={() => navigate('/login')}
                        variant="ghost"
                        className="rounded-full px-6 py-2 text-sm font-medium transition-all text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Login
                    </Button>
                    <button
                        onClick={() => navigate('/role-selection')}
                        className="group relative inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 
                        bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-800 dark:to-slate-950
                        text-slate-800 dark:text-white
                        border-t border-l border-white/50 dark:border-white/10
                        shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),3px_3px_6px_rgba(0,0,0,0.1)] 
                        dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),3px_3px_6px_rgba(0,0,0,0.4)]
                        hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]
                        hover:scale-105 active:scale-95"
                    >
                        Get Started
                        <span className="flex items-center justify-center w-5 h-5 rounded-full 
                            bg-slate-200 dark:bg-slate-800 
                            group-hover:bg-blue-500 dark:group-hover:bg-cyan-500 
                            group-hover:text-white transition-all duration-300
                            shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </span>
                    </button>
                    {/* LxwyerAI Button */}
                    <button
                        onClick={() => navigate('/quick-chat')}
                        className="ai-btn-glow ai-btn-shimmer group relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)',
                            border: '1px solid rgba(196,181,253,0.5)',
                        }}
                    >
                        <span style={{ fontSize: '0.85rem', filter: 'drop-shadow(0 0 4px rgba(216,180,254,0.9))' }}>✦</span>
                        LxwyerAI
                    </button>
                    <ModeToggle className="ml-2 text-slate-700 dark:text-slate-200" />
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <ModeToggle className="text-slate-700 dark:text-slate-200" />
                    <button
                        className="relative z-10 p-2 text-slate-700 dark:text-slate-200"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden absolute top-full left-0 right-0 px-6 pb-6 flex flex-col gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl"
                    >
                        {links.map(l => (
                            <button
                                key={l.label}
                                onClick={() => { setMenuOpen(false); handleNavigation(l.path); }}
                                className="text-left py-3 text-sm font-medium text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800"
                            >
                                {l.label}
                            </button>
                        ))}
                        <Button
                            onClick={() => navigate('/login')}
                            variant="ghost"
                            className="w-full mt-3 justify-center rounded-full text-slate-700 dark:text-slate-200"
                        >
                            Login
                        </Button>
                        <button
                            onClick={() => navigate('/role-selection')}
                            className="group w-full flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300
                            bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-800 dark:to-slate-950
                            text-slate-800 dark:text-white
                            border-t border-l border-white/50 dark:border-white/10
                            shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),3px_3px_6px_rgba(0,0,0,0.1)] 
                            dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),3px_3px_6px_rgba(0,0,0,0.4)]
                            active:scale-[0.98]"
                        >
                            Get Started
                            <span className="flex items-center justify-center w-5 h-5 rounded-full 
                                bg-slate-200 dark:bg-slate-800 
                                group-hover:bg-blue-500 dark:group-hover:bg-cyan-500 
                                group-hover:text-white transition-all duration-300
                                shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
