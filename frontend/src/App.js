import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './context/LanguageContext';
import PageTransition from './components/PageTransition';
import LocalOnlyRoute from './components/LocalOnlyRoute';

import LandingPageWave from './pages/LandingPageWave';
import RevolutionisingSoon from './pages/RevolutionisingSoon';

import QuickChat from './pages/QuickChat';
import LxwyerAIPremium from './pages/LxwyerAIPremium';
import UnifiedLogin from './pages/UnifiedLogin';
import FindLawyerManual from './pages/FindLawyerManual';
import FindLawyerAI from './pages/FindLawyerAI';
import LawyerApplication from './pages/LawyerApplication';
import LawFirmApplication from './pages/LawFirmApplication';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import UserSignupPage from './pages/UserSignupPage';

import UserDashboard from './pages/UserDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import LawFirmDashboard from './pages/LawFirmDashboard';
import LawFirmRoleSelection from './pages/LawFirmRoleSelection';
import LawFirmLawyerLogin from './pages/LawFirmLawyerLogin';
import FirmLawyerDashboard from './pages/FirmLawyerDashboard';
import FirmLawyerApplication from './pages/FirmLawyerApplication';
import FirmClientLogin from './pages/FirmClientLogin';
import FirmClientApplication from './pages/FirmClientApplication';
import FirmClientDashboard from './pages/FirmClientDashboard';
import BookConsultationWithSignup from './pages/BookConsultationWithSignup';
import UserGetStarted from './pages/UserGetStarted';
import FindLawFirmManual from './pages/FindLawFirmManual';
import FindLawFirmAI from './pages/FindLawFirmAI';
import JoinLawFirmWithSignup from './pages/JoinLawFirmWithSignup';
import LawyerProfile from './pages/LawyerProfile';
import FirmProfile from './pages/FirmProfile';
import BookingSignup from './pages/BookingSignup';
import JoinFirmSignup from './pages/JoinFirmSignup';
import EmergencyPage from './pages/EmergencyPage';
import MonitorDashboard from './pages/MonitorDashboard';
import MonitorLogin from './pages/MonitorLogin';
import RegisterSelectPage from './pages/RegisterSelectPage';
import LawyerRegisterInfoPage from './pages/LawyerRegisterInfoPage';
import LawFirmRegisterInfoPage from './pages/LawFirmRegisterInfoPage';
import ScrollToTop from './components/ScrollToTop';
import GlobalBackButton from './components/GlobalBackButton';

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? "https://lxwyerup.vercel.app" 
  : "http://localhost:8000";
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
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RevolutionisingSoon />} />
        <Route path="/home" element={<LandingPageWave />} />

        <Route path="/lxwyerai" element={<PageTransition><QuickChat /></PageTransition>} />
        <Route
          path="/lxwyerai-premium"
          element={
            <ProtectedRoute requiredType="client">
              <PageTransition><LxwyerAIPremium /></PageTransition>
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute requiredType="client">
              <PageTransition><UserDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer-dashboard"
          element={
            <ProtectedRoute requiredType="lawyer">
              <PageTransition><LawyerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawfirm-dashboard"
          element={
            <ProtectedRoute requiredType="law_firm">
              <PageTransition><LawFirmDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="/lawyer-application" element={<PageTransition><LawyerApplication /></PageTransition>} />
        <Route path="/lawfirm-application" element={<PageTransition><LawFirmApplication /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterSelectPage /></PageTransition>} />
        <Route path="/register/lawyer" element={<PageTransition><LawyerRegisterInfoPage /></PageTransition>} />
        <Route path="/register/lawfirm" element={<PageTransition><LawFirmRegisterInfoPage /></PageTransition>} />
        <Route path="/lawfirm-role" element={<PageTransition><LawFirmRoleSelection /></PageTransition>} />
        <Route path="/lawfirm-lawyer-login" element={<PageTransition><LawFirmLawyerLogin /></PageTransition>} />
        <Route path="/firm-lawyer-login" element={<PageTransition><LawFirmLawyerLogin /></PageTransition>} />
        <Route path="/firm-lawyer-application" element={<PageTransition><FirmLawyerApplication /></PageTransition>} />
        <Route
          path="/firm-lawyer-dashboard"
          element={
            <ProtectedRoute requiredType="firm_lawyer">
              <PageTransition><FirmLawyerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
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
              <GlobalBackButton />
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