import React, { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import LandingPageWave from './pages/LandingPageWave';
import CinematicHero from './pages/CinematicHero';
import PremiumHome from './pages/PremiumHome';
import PremiumContact from './pages/PremiumContact';
import QuickChat from './pages/QuickChat';
import InitialLanding from './pages/InitialLanding';
import RoleSelection from './pages/RoleSelection';
import LegalAssistanceSelection from './pages/LegalAssistanceSelection';
import AIChat from './pages/AIChat';
import BrowseLawyers from './pages/BrowseLawyers';
import BrowseFirms from './pages/BrowseFirms';
import AILawFirmFinder from './pages/AILawFirmFinder';
import UnifiedLogin from './pages/UnifiedLogin';
import FindLawyer from './pages/FindLawyer';
import FindLawyerManual from './pages/FindLawyerManual';
import FindLawyerAI from './pages/FindLawyerAI';
import LawyerApplication from './pages/LawyerApplication';
import LawFirmApplication from './pages/LawFirmApplication';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FeaturesPage from './pages/FeaturesPage';
import ForClientsPage from './pages/ForClientsPage';
import ForLawyersPage from './pages/ForLawyersPage';
import ContactPage from './pages/ContactPage';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import LawyerLoginPage from './pages/LawyerLoginPage';
import LawFirmLoginPage from './pages/LawFirmLoginPage';
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
import BookConsultation from './pages/BookConsultation';
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
import ScrollToTop from './components/ScrollToTop';

const BACKEND_URL = "http://127.0.0.1:8000";
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext();

const ProtectedRoute = ({ children, requiredType }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    if (requiredType === 'lawyer') return <Navigate to="/lawyer-login" />;
    if (requiredType === 'law_firm') return <Navigate to="/lawfirm-login" />;
    if (requiredType === 'firm_lawyer') return <Navigate to="/lawfirm-lawyer-login" />;
    if (requiredType === 'firm_client') return <Navigate to="/firm-client-login" />;
    return <Navigate to="/user-login" />;
  }

  if (requiredType && user.user_type !== requiredType) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ user, setUser }}>
        <div className="App">
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPageWave />} />
              <Route path="/premium-home" element={<PremiumHome />} />
              <Route path="/premium-contact" element={<PremiumContact />} />
              <Route path="/old-home" element={<CinematicHero />} />
              <Route path="/quick-chat" element={<QuickChat />} />
              <Route path="/hero-alt" element={<InitialLanding />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/login" element={<UnifiedLogin />} />
              <Route path="/legal-assistance" element={<LegalAssistanceSelection />} />
              <Route path="/ai-lawyer-chat" element={<AIChat />} />
              <Route path="/browse-lawyers" element={<BrowseLawyers />} />
              <Route path="/lawyer/:id" element={<LawyerProfile />} />
              <Route path="/booking/:id" element={<BookingSignup />} />
              <Route path="/browse-firms" element={<BrowseFirms />} />
              <Route path="/firm/:id" element={<FirmProfile />} />
              <Route path="/join-firm/:firmId" element={<JoinFirmSignup />} />
              <Route path="/ai-firm-finder" element={<AILawFirmFinder />} />
              <Route path="/find-lawyer" element={<FindLawyer />} />
              <Route path="/find-lawyer/manual" element={<FindLawyerManual />} />
              <Route path="/find-lawyer/ai" element={<FindLawyerAI />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/for-clients" element={<ForClientsPage />} />
              <Route path="/for-lawyers" element={<ForLawyersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/book-consultation" element={<BookConsultation />} />
              <Route path="/book-consultation-signup" element={<BookConsultationWithSignup />} />
              <Route path="/user-get-started" element={<UserGetStarted />} />
              <Route path="/find-lawfirm/manual" element={<FindLawFirmManual />} />
              <Route path="/find-lawfirm/ai" element={<FindLawFirmAI />} />
              <Route path="/join-lawfirm-signup" element={<JoinLawFirmWithSignup />} />
              <Route path="/user-login" element={<UserLoginPage />} />
              <Route path="/user-signup" element={<UserSignupPage />} />
              <Route path="/lawyer-login" element={<LawyerLoginPage />} />
              <Route path="/lawfirm-login" element={<LawFirmLoginPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute requiredType="client">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer-dashboard"
                element={
                  <ProtectedRoute requiredType="lawyer">
                    <LawyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawfirm-dashboard"
                element={
                  <ProtectedRoute requiredType="law_firm">
                    <LawFirmDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/lawyer-application" element={<LawyerApplication />} />
              <Route path="/lawfirm-application" element={<LawFirmApplication />} />
              <Route path="/lawfirm-role" element={<LawFirmRoleSelection />} />
              <Route path="/lawfirm-lawyer-login" element={<LawFirmLawyerLogin />} />
              <Route path="/firm-lawyer-login" element={<LawFirmLawyerLogin />} />
              <Route path="/firm-lawyer-application" element={<FirmLawyerApplication />} />
              <Route
                path="/firm-lawyer-dashboard"
                element={
                  <ProtectedRoute requiredType="firm_lawyer">
                    <FirmLawyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/firm-client-login" element={<FirmClientLogin />} />
              <Route path="/firm-client-application" element={<FirmClientApplication />} />
              <Route path="/firm-client-dashboard" element={<FirmClientDashboard />} />
              <Route path="/firm-client-dashboard-demo" element={<FirmClientDashboard />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;