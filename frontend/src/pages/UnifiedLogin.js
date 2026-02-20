import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Scale, Building2, UserCircle, Briefcase, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-[#0F2944] dark:text-blue-400" />
            <span className="text-xl font-bold text-[#0F2944] dark:text-blue-50">Lxwyer Up</span>
          </button>

          <Button
            onClick={() => navigate('/role-selection')}
            className="text-[#0F2944] dark:text-blue-100 hover:text-[#0F2944]/80 dark:hover:text-blue-200"
            variant="ghost"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const roles = [
    {
      id: 'user',
      icon: User,
      title: 'Login as User',
      description: 'Access your account to find lawyers and manage consultations',
      redirectPath: '/user-dashboard',
      userType: 'client',
      endpoint: 'auth'
    },
    {
      id: 'lawyer',
      icon: Scale,
      title: 'Login as Lawyer',
      description: 'Access your practice dashboard and manage your cases',
      redirectPath: '/lawyer-dashboard',
      userType: 'lawyer',
      endpoint: 'auth'
    },
    {
      id: 'lawfirm',
      icon: Building2,
      title: 'Login as Law Firm',
      description: 'Manage your firm, lawyers, and clients',
      redirectPath: '/lawfirm-dashboard',
      userType: 'law_firm',
      endpoint: 'auth'
    },
    {
      id: 'firmclient',
      icon: UserCircle,
      title: 'Login as Firm Client',
      description: 'Track your case progress with your assigned law firm',
      redirectPath: '/firm-client-dashboard',
      userType: 'firm_client',
      endpoint: 'firm-clients'
    },
    {
      id: 'firmlawyer',
      icon: Briefcase,
      title: 'Login as Firm Lawyer',
      description: 'Access your firm workspace and manage assigned tasks',
      redirectPath: '/firm-lawyer-dashboard',
      userType: 'firm_lawyer',
      endpoint: 'firm-lawyers'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }

    if (!loginData.email || !loginData.password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const role = roles.find(r => r.id === selectedRole);
      let response;

      // Use different endpoints based on role
      if (role.endpoint === 'firm-clients') {
        // Firm client uses dedicated login endpoint
        response = await axios.post(`${API}/firm-clients/login`, {
          email: loginData.email,
          password: loginData.password
        });
      } else if (role.endpoint === 'firm-lawyers') {
        // Firm lawyer uses dedicated login endpoint
        response = await axios.post(`${API}/firm-lawyers/login`, {
          email: loginData.email,
          password: loginData.password,
          user_type: 'firm_lawyer'
        });
      } else {
        // All other roles use auth endpoint
        response = await axios.post(`${API}/auth/login`, {
          email: loginData.email,
          password: loginData.password,
          user_type: role.userType
        });
      }

      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify({
          ...response.data.user,
          user_type: role.userType
        }));
        sessionStorage.setItem('userRole', role.userType);

        toast.success('Login successful!');
        navigate(role.redirectPath);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WaveLayout hideNavbar={true} className="bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-slate-900 dark:via-black dark:to-slate-900 transition-colors duration-500">
      <SimpleNavbar navigate={navigate} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0F2944] dark:text-white mb-4 transition-colors">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors">
              Select your role and login to continue
            </p>
          </motion.div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => setSelectedRole(role.id)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 ${isSelected
                    ? 'bg-[#0F2944] dark:bg-blue-600 border-[#0F2944] dark:border-blue-500 shadow-xl'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-[#0F2944] dark:hover:border-blue-400 hover:shadow-lg'
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isSelected ? 'bg-white/20' : 'bg-[#0F2944]/10'
                        }`}
                    >
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-[#0F2944] dark:text-blue-400'}`} />
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-[#0F2944] dark:text-blue-100'}`}>
                      {role.title}
                    </h3>

                    <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {role.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Login Form */}
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F2944] dark:text-blue-200 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 dark:focus:ring-blue-500/20 focus:border-[#0F2944] dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:bg-slate-800 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F2944] dark:text-blue-200 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 dark:focus:ring-blue-500/20 focus:border-[#0F2944] dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:bg-slate-800 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-[#0F2944] dark:text-blue-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0F2944] dark:bg-blue-600 hover:bg-[#0F2944]/90 dark:hover:bg-blue-700 text-white py-6 rounded-xl font-semibold transition-all duration-300 group"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        try {
                          setLoading(true);
                          const role = roles.find(r => r.id === selectedRole);
                          const response = await axios.post(`${API}/auth/google`, {
                            token: credentialResponse.credential,
                            user_type: role.userType
                          });

                          if (response.data.token) {
                            sessionStorage.setItem('token', response.data.token);
                            sessionStorage.setItem('user', JSON.stringify({
                              ...response.data.user,
                              user_type: role.userType
                            }));
                            sessionStorage.setItem('userRole', role.userType);

                            toast.success('Login successful!');
                            navigate(role.redirectPath);
                          }
                        } catch (error) {
                          console.error('Google Login Error:', error);
                          toast.error('Google Login Failed');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      onError={() => {
                        toast.error('Google Login Failed');
                      }}
                      useOneTap
                    />
                  </div>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/role-selection')}
                      className="text-[#0F2944] dark:text-blue-400 font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </WaveLayout>
  );
};

export default UnifiedLogin;
