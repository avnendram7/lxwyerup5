import React, { useEffect, useState, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './context/LanguageContext';
import PageTransition from './components/PageTransition';
import LocalOnlyRoute from './components/LocalOnlyRoute';
import ScrollToTop from './components/ScrollToTop';

// ── Critical routes — kept eager so the 1st paint is instant ──────────────
import LandingPageWave from './pages/LandingPageWave';
import RevolutionisingSoon from './pages/RevolutionisingSoon';
import UnifiedLogin from './pages/UnifiedLogin';
import EmergencyPage from './pages/EmergencyPage';

// ── Everything else — loaded eagerly for instant transitions ─────────
import QuickChat               from './pages/QuickChat';
import LxwyerAIPremium         from './pages/LxwyerAIPremium';
import FindLawyerManual        from './pages/FindLawyerManual';
import FindLawyerAI            from './pages/FindLawyerAI';
import LawyerApplication       from './pages/LawyerApplication';
import LawFirmApplication      from './pages/LawFirmApplication';
import AdminLogin              from './pages/AdminLogin';
import AdminDashboard          from './pages/AdminDashboard';
import AboutPage               from './pages/AboutPage';
import FeaturesPage            from './pages/FeaturesPage';
import ContactPage             from './pages/ContactPage';
import UserSignupPage          from './pages/UserSignupPage';
import UserDashboard           from './pages/UserDashboard';
import LawyerDashboard         from './pages/LawyerDashboard';
import LawFirmDashboard        from './pages/LawFirmDashboard';
import LawFirmRoleSelection    from './pages/LawFirmRoleSelection';
import LawFirmLawyerLogin      from './pages/LawFirmLawyerLogin';
import FirmLawyerDashboard     from './pages/FirmLawyerDashboard';
import FirmLawyerApplication   from './pages/FirmLawyerApplication';
import FirmClientLogin         from './pages/FirmClientLogin';
import FirmClientApplication   from './pages/FirmClientApplication';
import FirmClientDashboard     from './pages/FirmClientDashboard';
import BookConsultationWithSignup from './pages/BookConsultationWithSignup';
import UserGetStarted          from './pages/UserGetStarted';
import FindLawFirmManual       from './pages/FindLawFirmManual';
import FindLawFirmAI           from './pages/FindLawFirmAI';
import JoinLawFirmWithSignup   from './pages/JoinLawFirmWithSignup';
import LawyerProfile           from './pages/LawyerProfile';
import FirmProfile             from './pages/FirmProfile';
import BookingSignup           from './pages/BookingSignup';
import SignatureBookingSignup  from './pages/SignatureBookingSignup';
import SignatureLawyerProfile  from './pages/SignatureLawyerProfile';
import JoinFirmSignup          from './pages/JoinFirmSignup';
import MonitorDashboard        from './pages/MonitorDashboard';
import MonitorLogin            from './pages/MonitorLogin';
import RegisterSelectPage      from './pages/RegisterSelectPage';
import LawyerRegisterInfoPage  from './pages/LawyerRegisterInfoPage';
import LawFirmRegisterInfoPage from './pages/LawFirmRegisterInfoPage';

// Minimal suspense fallback — invisible spinner so there's no layout flash
const PageLoader = () => (
  <div style={{
    minHeight: '100vh', background: '#0a0f1e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid rgba(59,130,246,0.15)',
      borderTopColor: '#3b82f6',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production'
  ? "https://lxwyerup.vercel.app"
  : "http://localhost:8000");
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext();

const ProtectedRoute = ({ children, requiredType }) => {
  const token = sessionStorage.getItem('token');
  let user = {};

  try {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Failed to parse user from session storage", e);
    sessionStorage.removeItem('user');
  }

  if (!token) {
    if (requiredType === 'lawyer') return <Navigate to="/login" />;
    if (requiredType === 'law_firm') return <Navigate to="/login" />;
    if (requiredType === 'firm_lawyer') return <Navigate to="/firm-lawyer-login" />;
    if (requiredType === 'firm_client') return <Navigate to="/firm-client-login" />;
    return <Navigate to="/login" />;
  }

  if (requiredType && user.user_type !== requiredType) {
    return <Navigate to="/" />;
  }

  return children;
};

const SmoothScrolling = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable on AI routes (full-screen flex layouts with internal overflow)
    // AND on all dashboard routes (they use internal overflow-y-auto scroll containers)
    const isAiRoute = ['/lxwyerai', '/find-lawyer/ai', '/ai-firm-finder', '/find-lawfirm/ai'].includes(location.pathname);
    const isDashboardRoute = [
      '/user-dashboard', '/lawyer-dashboard', '/lawfirm-dashboard',
      '/firm-lawyer-dashboard', '/firm-client-dashboard', '/firm-client-dashboard-demo',
      '/admin-dashboard', '/monitor-dashboard'
    ].includes(location.pathname);
    
    if (isAiRoute || isDashboardRoute || window.innerWidth <= 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
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
  }, [location.pathname]);

  return null;
};

/* AnimatedRoutes — must be inside BrowserRouter so useLocation works */
function AnimatedRoutes({ user, isWebsiteRestricted }) {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-FF488YE3X7', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        {isWebsiteRestricted && location.pathname !== '/' && !location.pathname.startsWith('/monitor') && !location.pathname.startsWith('/admin') ? (
          <Route key="restricted" path="*" element={
            <div style={{
              minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: "'Outfit', sans-serif", padding: 20, textAlign: 'center'
            }}>
              <div style={{ color: '#ef4444', marginBottom: 16 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Access Restricted</h1>
              <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 400 }}>Website is restricted it will soon open, Namaste.</p>
            </div>
          } />
        ) : (
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RevolutionisingSoon isWebsiteRestricted={isWebsiteRestricted} />} />
          <Route path="/home" element={<LandingPageWave />} />

          <Route path="/lxwyerai" element={<PageTransition><QuickChat /></PageTransition>} />
          <Route path="/lxwyerai-premium" element={<ProtectedRoute requiredType="client"><PageTransition><LxwyerAIPremium /></PageTransition></ProtectedRoute>} />

          <Route path="/login" element={<PageTransition><UnifiedLogin /></PageTransition>} />
          <Route path="/lawyer/:id" element={<PageTransition><LawyerProfile /></PageTransition>} />
          <Route path="/signature-profile/:id" element={<PageTransition><SignatureLawyerProfile /></PageTransition>} />
          <Route path="/booking/:id" element={<PageTransition><BookingSignup /></PageTransition>} />
          <Route path="/signature-booking" element={<PageTransition><SignatureBookingSignup /></PageTransition>} />
          <Route path="/firm/:id" element={<PageTransition><FirmProfile /></PageTransition>} />
          <Route path="/join-firm/:firmId" element={<PageTransition><JoinFirmSignup /></PageTransition>} />
          <Route path="/ai-firm-finder" element={<PageTransition><FindLawFirmAI /></PageTransition>} />
          <Route path="/find-lawfirm/ai" element={<PageTransition><FindLawFirmAI /></PageTransition>} />
          <Route path="/find-lawyer/manual" element={<PageTransition><FindLawyerManual /></PageTransition>} />
          <Route path="/find-lawyer/ai" element={<PageTransition><FindLawyerAI /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/features" element={<PageTransition><FeaturesPage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/book-consultation-signup" element={<PageTransition><BookConsultationWithSignup /></PageTransition>} />
          <Route path="/user-get-started" element={<PageTransition><UserGetStarted /></PageTransition>} />
          <Route path="/find-lawfirm/manual" element={<PageTransition><FindLawFirmManual /></PageTransition>} />
          <Route path="/join-lawfirm-signup" element={<PageTransition><JoinLawFirmWithSignup /></PageTransition>} />
          <Route path="/user-signup" element={<PageTransition><UserSignupPage /></PageTransition>} />
          <Route path="/lawyer-login" element={<Navigate to="/login" replace />} />
          <Route path="/emergency" element={<PageTransition><EmergencyPage /></PageTransition>} />

          <Route path="/user-dashboard" element={<ProtectedRoute requiredType="client"><PageTransition><UserDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/lawyer-dashboard" element={<ProtectedRoute requiredType="lawyer"><PageTransition><LawyerDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/lawfirm-dashboard" element={<ProtectedRoute requiredType="law_firm"><PageTransition><LawFirmDashboard /></PageTransition></ProtectedRoute>} />

          <Route path="/lawyer-application" element={<PageTransition><LawyerApplication /></PageTransition>} />
          <Route path="/lawfirm-application" element={<PageTransition><LawFirmApplication /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterSelectPage /></PageTransition>} />
          <Route path="/register/lawyer" element={<PageTransition><LawyerRegisterInfoPage /></PageTransition>} />
          <Route path="/register/lawfirm" element={<PageTransition><LawFirmRegisterInfoPage /></PageTransition>} />
          <Route path="/lawfirm-role" element={<PageTransition><LawFirmRoleSelection /></PageTransition>} />
          <Route path="/lawfirm-lawyer-login" element={<PageTransition><LawFirmLawyerLogin /></PageTransition>} />
          <Route path="/firm-lawyer-login" element={<PageTransition><LawFirmLawyerLogin /></PageTransition>} />
          <Route path="/firm-lawyer-application" element={<PageTransition><FirmLawyerApplication /></PageTransition>} />
          <Route path="/firm-lawyer-dashboard" element={<ProtectedRoute requiredType="firm_lawyer"><PageTransition><FirmLawyerDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/firm-client-login" element={<PageTransition><FirmClientLogin /></PageTransition>} />
          <Route path="/firm-client-application" element={<PageTransition><FirmClientApplication /></PageTransition>} />
          <Route path="/firm-client-dashboard" element={<PageTransition><FirmClientDashboard /></PageTransition>} />
          <Route path="/firm-client-dashboard-demo" element={<PageTransition><FirmClientDashboard /></PageTransition>} />

          <Route path="/admin-login" element={<LocalOnlyRoute><PageTransition><AdminLogin /></PageTransition></LocalOnlyRoute>} />
          <Route path="/admin-dashboard" element={<LocalOnlyRoute><PageTransition><AdminDashboard /></PageTransition></LocalOnlyRoute>} />
          <Route path="/admin" element={<LocalOnlyRoute><PageTransition><AdminDashboard /></PageTransition></LocalOnlyRoute>} />
          <Route path="/monitor-login" element={<LocalOnlyRoute><PageTransition><MonitorLogin /></PageTransition></LocalOnlyRoute>} />
          <Route path="/monitor-dashboard" element={<LocalOnlyRoute><PageTransition><MonitorDashboard /></PageTransition></LocalOnlyRoute>} />
        </Routes>
        )}
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isWebsiteRestricted, setIsWebsiteRestricted] = useState(false);

  // Poll website status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API}/monitor/website-status`);
        setIsWebsiteRestricted(res.data.is_restricted);
      } catch (e) {
        console.error("Failed to fetch website status", e);
      }
    };
    
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
      sessionStorage.removeItem('user');
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <LanguageProvider>
        <AuthContext.Provider value={{ user, setUser }}>
          <div className="App">
            <BrowserRouter>
              <SmoothScrolling />
              <ScrollToTop />
              <AnimatedRoutes user={user} isWebsiteRestricted={isWebsiteRestricted} />
            </BrowserRouter>
            <Toaster position="top-right" />
          </div>
        </AuthContext.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;