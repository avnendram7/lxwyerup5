import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, Home, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Reusable Navigation Header Component
 * @param {string} title - Page title (optional)
 * @param {string} backPath - Path for back button (optional, uses history if not provided)
 * @param {boolean} showBack - Show back button (default: true)
 * @param {boolean} showHome - Show home button (default: true)
 * @param {boolean} showLogout - Show logout button (default: false)
 * @param {boolean} transparent - Transparent background (default: false)
 * @param {string} variant - 'dark' | 'light' (default: 'dark')
 */
export default function NavigationHeader({
  title,
  backPath,
  showBack = true,
  showHome = true,
  showLogout = false,
  transparent = false,
  variant = 'dark',
  className = ''
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const bgClass = transparent
    ? 'bg-transparent'
    : variant === 'dark'
      ? 'bg-black border-b border-slate-800'
      : 'bg-white border-b border-gray-200';

  const textClass = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = variant === 'dark' ? 'text-slate-400' : 'text-gray-600';
  const buttonClass = variant === 'dark'
    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return (
    <header className={`sticky top-0 z-50 ${bgClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Back */}
          <div className="flex items-center space-x-4">
            {showBack && (
              <button
                onClick={handleBack}
                className={`p-2 rounded-lg transition-colors ${buttonClass}`}
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleHome}
              className={`flex items-center space-x-3 ${textClass} hover:opacity-80 transition-opacity`}
            >
              <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
              <span className="text-lg font-semibold hidden sm:block">Lxwyer Up</span>
            </button>
          </div>

          {/* Center - Title */}
          {title && (
            <div className="hidden md:block">
              <h1 className={`text-lg font-medium ${textClass}`}>{title}</h1>
            </div>
          )}

          {/* Right Section - Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              {showHome && (
                <button
                  onClick={handleHome}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${buttonClass}`}
                  title="Home"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Home</span>
                </button>
              )}

              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`sm:hidden p-2 rounded-lg transition-colors ${buttonClass}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`sm:hidden py-4 border-t ${variant === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
            <div className="space-y-2">
              {title && (
                <div className={`px-3 py-2 ${subTextClass} text-sm font-medium`}>
                  {title}
                </div>
              )}

              {showHome && (
                <button
                  onClick={() => { handleHome(); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${buttonClass}`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </button>
              )}

              {showBack && (
                <button
                  onClick={() => { handleBack(); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${buttonClass}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go Back</span>
                </button>
              )}

              {showLogout && (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Simple Back Button Component for inline use
 */
export function BackButton({ path, label = 'Back', variant = 'dark', className = '' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    } else {
      navigate(-1);
    }
  };

  const buttonClass = variant === 'dark'
    ? 'text-slate-400 hover:text-white'
    : 'text-gray-600 hover:text-gray-900';

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 transition-colors ${buttonClass} ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

/**
 * Breadcrumb Navigation Component
 */
export function Breadcrumb({ items, variant = 'dark' }) {
  const navigate = useNavigate();

  const textClass = variant === 'dark' ? 'text-slate-400' : 'text-gray-500';
  const activeClass = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const hoverClass = variant === 'dark' ? 'hover:text-white' : 'hover:text-gray-900';

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <button
        onClick={() => navigate('/')}
        className={`${textClass} ${hoverClass} transition-colors`}
      >
        <Home className="w-4 h-4" />
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className={textClass}>/</span>
          {item.path ? (
            <button
              onClick={() => navigate(item.path)}
              className={`${textClass} ${hoverClass} transition-colors`}
            >
              {item.label}
            </button>
          ) : (
            <span className={activeClass}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
