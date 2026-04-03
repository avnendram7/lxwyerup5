import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Info, HelpCircle, Sparkles, ArrowRight, ChevronDown, Scale, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';


// ── Register dropdown ─────────────────────────────────────────────────────────
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
    },
    {
      icon: Building2,
      label: 'Register as Law Firm',
      sub: 'Onboard your firm and lawyers',
      path: '/lawfirm-application',
      accent: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-500/10',
    },
  ];

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#0d0d0d] border border-slate-200/70 dark:border-white/[0.07] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Join LxwyerUp</p>
      </div>

      {/* Options */}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); if (onClose) onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors text-left group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg} transition-all group-hover:scale-105`}>
              <Icon className={`w-4.5 h-4.5 ${item.accent}`} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{item.sub}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-auto group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        );
      })}

      {/* Divider + Login hint */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Already registered?{' '}
          <button onClick={() => { navigate('/login'); if (onClose) onClose(); }} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Login →
          </button>
        </p>
      </div>
    </div>
  );
};

export const Navbar = ({ hideLinks = false, minimal = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const registerRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (registerRef.current && !registerRef.current.contains(e.target)) {
        setRegisterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#080808]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06] shadow-sm dark:shadow-black/40 transition-colors duration-300">
      <div className="w-full mx-auto px-4 md:px-6 xl:px-12">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit'] select-none">
              Lxwyer Up
            </span>
          </Link>

          {/* ── MINIMAL mode: just logo + sign in + theme ── */}
          {minimal ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Sign in
              </button>

            </div>
          ) : (
            <>
              {/* Desktop Links — centered */}
              {!hideLinks && (
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <Home className="w-3.5 h-3.5" /> Home
                  </Link>
                  <Link to="/about" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <Info className="w-3.5 h-3.5" /> About
                  </Link>
                  <Link to="/contact" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" /> Contact
                  </Link>
                </div>
              )}

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <>
                    <button
                      data-testid="dashboard-btn"
                      onClick={() => navigate(user.user_type === 'lawyer' ? '/lawyer-dashboard' : '/user-dashboard')}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
                    >
                      Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      data-testid="logout-btn"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* LxwyerAI pill */}
                    <button
                      onClick={() => navigate('/lxwyerai')}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-slate-900 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/[0.15] border border-slate-800 dark:border-white/10 transition-all duration-200 shadow-sm"
                    >
                      LxwyerAI
                    </button>

                    {/* Lawyer Match — primary blue CTA */}
                    <button
                      data-testid="lawyer-match-btn"
                      onClick={() => navigate('/user-get-started')}
                      className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition-all duration-200"
                    >
                      Find Lawyer <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Register dropdown */}
                    <div className="relative" ref={registerRef}>
                      <button
                        onClick={() => setRegisterOpen(v => !v)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border
                          ${registerOpen
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                            : 'bg-slate-900 dark:bg-white/10 text-white dark:text-white border-slate-900 dark:border-white/10 hover:bg-slate-700 dark:hover:bg-white/[0.15]'
                          }`}
                      >
                        Register Here
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${registerOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {registerOpen && <RegisterDropdown onClose={() => setRegisterOpen(false)} />}
                    </div>
                  </>
                )}

              </div>

              {/* Mobile Toggle */}
              <div className="md:hidden flex items-center gap-2">

                <button
                  data-testid="mobile-menu-btn"
                  className="p-2 text-slate-600 dark:text-slate-300"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden px-6 pb-6 flex flex-col gap-3 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl border-b border-slate-200/40 dark:border-white/5"
        >
          {!hideLinks && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">
                <Info className="w-4 h-4" /> About
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">
                <HelpCircle className="w-4 h-4" /> Contact
              </Link>
            </>
          )}
          <div className="pt-2 space-y-2">
            {user ? (
              <>
                <button onClick={() => { setMobileMenuOpen(false); navigate(user.user_type === 'lawyer' ? '/lawyer-dashboard' : user.user_type === 'law_firm' ? '/lawfirm-dashboard' : '/user-dashboard'); }} className="w-full rounded-full px-5 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-colors">
                  Dashboard
                </button>
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="w-full rounded-full px-5 py-2.5 text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Mobile Login */}
                <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full rounded-full px-5 py-2.5 text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  Login
                </button>

                {/* Mobile Register as Lawyer */}
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/lawyer-application'); }}
                  className="w-full rounded-full px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" /> Register as Lawyer
                </button>

                {/* Mobile Register as Law Firm */}
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/lawfirm-application'); }}
                  className="w-full rounded-full px-5 py-2.5 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> Register as Law Firm
                </button>

                <button onClick={() => { setMobileMenuOpen(false); navigate('/lxwyerai'); }} className="w-full rounded-full px-5 py-2.5 text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Lxwyer<span className="text-blue-400">AI</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};