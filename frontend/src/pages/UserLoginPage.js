
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { motion } from 'framer-motion';
import { WaveLayout } from '../components/WaveLayout';
import { Button } from '../components/ui/button';

export default function UserLoginPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email: formData.email, password: formData.password, user_type: 'client' };
      const response = await axios.post(`${API}/auth/login`, payload);

      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success('Welcome back!');
      navigate('/user-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WaveLayout hideNavbar={true} className="bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="min-h-screen flex items-center justify-center px-4 py-20 relative z-10">

        {/* Back Button */}
        <button
          onClick={() => navigate('/role-selection')}
          className="absolute top-8 left-8 flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/60 hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          {/* Card Container with Glassmorphism */}
          <div
            className="rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.6)'
            }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white mb-6 shadow-lg shadow-blue-500/30">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 font-outfit">Welcome Back</h1>
              <p className="text-slate-500">Sign in to access your legal dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => toast.info('Google Login coming soon!')}
                className="w-full bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-medium py-6 rounded-xl transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 20.45c4.656 0 8.556-3.218 9.979-7.568h-9.979v-3.764h15.35c.159.853.242 1.734.242 2.641 0 7.82-5.38 13.409-12.833 13.409C5.362 25.168 0 19.806 0 13.192 0 6.578 5.362 1.216 12.0003 1.216c3.246 0 6.182 1.187 8.47 3.328l-4.182 4.182c-1.127-1.078-2.613-1.638-4.288-1.638-3.618 0-6.702 2.39-7.802 5.696h-.002l-5.118-3.957C1.942 3.65 6.602 0.05 12.0003 0.05c6.5 0 12 5.5 12 12s-5.5 12-12 12z"
                    fill="currentColor"
                    className="text-slate-900 group-hover:text-blue-600 transition-colors"
                  />
                  <path
                    d="M23.49 12.275c0-.85-.075-1.675-.225-2.465H12v4.66h6.44c-.275 1.485-1.115 2.745-2.38 3.59v2.985h3.855c2.255-2.075 3.555-5.13 3.555-8.77z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 24c3.24 0 5.955-1.075 7.94-2.915l-3.855-2.985c-1.075.72-2.45 1.145-4.085 1.145-3.15 0-5.815-2.125-6.77-4.985H1.26v3.13C3.255 21.36 7.33 24 12 24z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.23 14.26A7.16 7.16 0 0 1 4.87 12c0-.78.13-1.535.36-2.26V6.61H1.26A11.975 11.975 0 0 0 0 12c0 1.93.46 3.755 1.26 5.39l3.97-3.13z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 4.75c1.77 0 3.355.61 4.605 1.8l3.44-3.44C17.95 1.16 15.235 0 12 0 7.33 0 3.255 2.64 1.26 6.61l3.97 3.13C6.185 6.875 8.85 4.75 12 4.75z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/user-signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center mt-8">
            <span className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              LxwyerUp Secure Login
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            </span>
          </div>
        </motion.div>
      </div >
    </WaveLayout >
  );
}