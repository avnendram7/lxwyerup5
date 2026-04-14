import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff, Home } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { useLang } from '../context/LanguageContext';
import { SmokeyBackground } from '../components/ui/login-form';

const redirectMap = {
  client: '/user-dashboard',
  lawyer: '/lawyer-dashboard',
  law_firm: '/lawfirm-dashboard',
  firm_client: '/firm-client-dashboard',
  firm_lawyer: '/firm-lawyer-dashboard'
};

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { t } = useLang();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      // Unified endpoint — role is determined by backend
      const response = await axios.post(`${API}/auth/login`, {
        email: loginData.email,
        password: loginData.password
      });

      handleSuccessfulLogin(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);
      const response = await axios.post(`${API}/auth/google`, {
        token: credentialResponse.credential
      });
      handleSuccessfulLogin(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Google Login Failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSuccessfulLogin = (data) => {
    const userRole = data.user.user_type;
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify({ ...data.user, user_type: userRole }));
    sessionStorage.setItem('userRole', userRole);

    toast.success('Login successful!');

    const targetPath = redirectMap[userRole] || '/';
    navigate(targetPath);
  };

  return (
    <main className="relative w-screen h-screen bg-gray-900 font-['Outfit']">
      <SmokeyBackground className="absolute inset-0" color="#1E40AF" />

      {/* Home Button Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all text-sm font-medium border border-white/10"
        >
          <Home className="w-4 h-4" />
          {t('login_home') || 'Back to Home'}
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-sm p-8 space-y-7 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl relative overflow-hidden">

          {/* Subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center relative z-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-sm text-blue-100/70">Access your legal space</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Email Input */}
            <div className="relative z-0 group">
              <input
                type="email"
                id="floating_email"
                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-blue-400 peer font-medium"
                placeholder=" "
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
              <label
                htmlFor="floating_email"
                className="absolute text-sm text-blue-100/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 whitespace-nowrap"
              >
                <User className="inline-block mr-2 -mt-1" size={16} />
                {t('login_email_label') || 'Email Address'}
              </label>
            </div>

            {/* Password Input */}
            <div className="relative z-0 group">
              <input
                type={showPassword ? "text" : "password"}
                id="floating_password"
                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-blue-400 peer font-mono"
                placeholder=" "
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <label
                htmlFor="floating_password"
                className="absolute text-sm text-blue-100/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 whitespace-nowrap"
              >
                <Lock className="inline-block mr-2 -mt-1" size={16} />
                {t('login_password_label') || 'Password'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isGoogleLoading}
              className="group w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Authenticating...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-white/40 text-[10px] font-bold tracking-wider uppercase">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Google Login Button via React OAuth */}
            <div className="flex w-full justify-center overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 relative h-[42px] items-center">
              {isGoogleLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                </div>
              )}
              {/* The invisible real Google button sitting perfectly over our custom design, achieving Google compliance without ruining the glass effect */}
              <div className="absolute inset-x-0 opacity-0 z-10 scale-[1.03]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Login Failed')}
                  shape="rectangular"
                  theme="filled_black"
                  size="large"
                  width="400"
                  useOneTap
                />
              </div>

              {/* Custom visible design underneath */}
              <div className="flex items-center justify-center pointer-events-none gap-3 relative z-0">
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"></path><path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"></path>
                </svg>
                <span className="text-white text-sm font-semibold tracking-wide">Sign in with Google</span>
              </div>
            </div>
          </form>

          <div className="flex flex-col items-center gap-3 relative z-10 pt-4 pb-2 text-sm text-white/50">
            <p className="text-xs">Don't have an account?</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[340px]">
              <button
                onClick={() => navigate('/user-get-started')}
                className="flex-1 py-2 px-3 font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 rounded-lg transition-all border border-blue-500/20 shadow-md text-xs"
              >
                Find a lawyer
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 py-2 px-3 font-semibold bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-all border border-white/5 shadow-md text-xs"
              >
                Sign up as legal practitioner
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UnifiedLogin;
