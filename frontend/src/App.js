import React, { useEffect, useState, lazy, Suspense } from 'react';
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

// ── Everything else — lazy-loaded (each becomes its own JS chunk) ─────────
const QuickChat               = lazy(() => import('./pages/QuickChat'));
const LxwyerAIPremium         = lazy(() => import('./pages/LxwyerAIPremium'));
const FindLawyerManual        = lazy(() => import('./pages/FindLawyerManual'));
const FindLawyerAI            = lazy(() => import('./pages/FindLawyerAI'));
const LawyerApplication       = lazy(() => import('./pages/LawyerApplication'));
const LawFirmApplication      = lazy(() => import('./pages/LawFirmApplication'));
const AdminLogin              = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard          = lazy(() => import('./pages/AdminDashboard'));
const AboutPage               = lazy(() => import('./pages/AboutPage'));
const FeaturesPage            = lazy(() => import('./pages/FeaturesPage'));
const ContactPage             = lazy(() => import('./pages/ContactPage'));
const UserSignupPage          = lazy(() => import('./pages/UserSignupPage'));
const UserDashboard           = lazy(() => import('./pages/UserDashboard'));
const LawyerDashboard         = lazy(() => import('./pages/LawyerDashboard'));
const LawFirmDashboard        = lazy(() => import('./pages/LawFirmDashboard'));
const LawFirmRoleSelection    = lazy(() => import('./pages/LawFirmRoleSelection'));
const LawFirmLawyerLogin      = lazy(() => import('./pages/LawFirmLawyerLogin'));
const FirmLawyerDashboard     = lazy(() => import('./pages/FirmLawyerDashboard'));
const FirmLawyerApplication   = lazy(() => import('./pages/FirmLawyerApplication'));
const FirmClientLogin         = lazy(() => import('./pages/FirmClientLogin'));
const FirmClientApplication   = lazy(() => import('./pages/FirmClientApplication'));
const FirmClientDashboard     = lazy(() => import('./pages/FirmClientDashboard'));
const BookConsultationWithSignup = lazy(() => import('./pages/BookConsultationWithSignup'));
const UserGetStarted          = lazy(() => import('./pages/UserGetStarted'));
const FindLawFirmManual       = lazy(() => import('./pages/FindLawFirmManual'));
const FindLawFirmAI           = lazy(() => import('./pages/FindLawFirmAI'));
const JoinLawFirmWithSignup   = lazy(() => import('./pages/JoinLawFirmWithSignup'));
const LawyerProfile           = lazy(() => import('./pages/LawyerProfile'));
const FirmProfile             = lazy(() => import('./pages/FirmProfile'));
const BookingSignup           = lazy(() => import('./pages/BookingSignup'));
const JoinFirmSignup          = lazy(() => import('./pages/JoinFirmSignup'));
const MonitorDashboard        = lazy(() => import('./pages/MonitorDashboard'));
const MonitorLogin            = lazy(() => import('./pages/MonitorLogin'));
const RegisterSelectPage      = lazy(() => import('./pages/RegisterSelectPage'));
const LawyerRegisterInfoPage  = lazy(() => import('./pages/LawyerRegisterInfoPage'));
const LawFirmRegisterInfoPage = lazy(() => import('./pages/LawFirmRegisterInfoPage'));

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

/* AnimatedRoutes — must be inside BrowserRouter so useLocation works */
function AnimatedRoutes({ user }) {
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
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RevolutionisingSoon />} />
          <Route path="/home" element={<LandingPageWave />} />

          <Route path="/lxwyerai" element={<PageTransition><QuickChat /></PageTransition>} />
          <Route path="/lxwyerai-premium" element={<ProtectedRoute requiredType="client"><PageTransition><LxwyerAIPremium /></PageTransition></ProtectedRoute>} />

          <Route path="/login" element={<PageTransition><UnifiedLogin /></PageTransition>} />
          <Route path="/lawyer/:id" element={<PageTransition><LawyerProfile /></PageTransition>} />
          <Route path="/booking/:id" element={<PageTransition><BookingSignup /></PageTransition>} />
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
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  const [user, setUser] = useState(null);

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
              <ScrollToTop />
              <AnimatedRoutes user={user} />
            </BrowserRouter>
            <Toaster position="top-right" />
          </div>
        </AuthContext.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;