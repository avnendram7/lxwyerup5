import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Scale, Menu, X, Home, Info, Sparkles, HelpCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-gray-800" />
            <span className="text-xl font-bold text-gray-800">Lxwyer Up</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-800 hover:text-gray-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/premium-about" className="flex items-center space-x-1 text-gray-800 hover:text-gray-600 transition-colors">
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link to="/premium-contact" className="flex items-center space-x-1 text-gray-800 hover:text-gray-600 transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  data-testid="dashboard-btn"
                  onClick={() => navigate(user.user_type === 'lawyer' ? '/lawyer-dashboard' : '/user-dashboard')}
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-6 py-2"
                >
                  Dashboard
                </Button>
                <Button
                  data-testid="logout-btn"
                  onClick={handleLogout}
                  variant="outline"
                  className="border-gray-300 text-gray-800 hover:bg-gray-100 rounded-full px-6 py-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/role-selection?mode=login" className="relative group">
                <Button
                  data-testid="login-btn"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2 flex items-center space-x-2 shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="font-semibold">Login</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-btn"
            className="md:hidden text-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div data-testid="mobile-menu" className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 py-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/premium-about" className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 py-2">
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link to="/premium-contact" className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 py-2">
              <HelpCircle className="w-4 h-4" />
              <span>Contact</span>
            </Link>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate(user.user_type === 'lawyer' ? '/lawyer-dashboard' : user.user_type === 'law_firm' ? '/lawfirm-dashboard' : '/user-dashboard')}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-full"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-800 hover:bg-gray-100 rounded-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/role-selection" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/quick-chat" className="block">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-800 hover:bg-gray-100 rounded-full">
                      AI Chat
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};