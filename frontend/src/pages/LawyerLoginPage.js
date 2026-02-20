import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { motion } from 'framer-motion';
import { CorporateInput, CorporateButton } from '../components/CorporateComponents';

export default function LawyerLoginPage() {
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
      const payload = { email: formData.email, password: formData.password, user_type: 'lawyer' };
      const response = await axios.post(`${API}/auth/login`, payload);

      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success('Welcome back!');
      navigate('/lawyer-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col">
      {/* Navigation Bar */}
      <nav className="p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
      </nav>

      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(168, 85, 247) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Lxwyer Up</span>
          </Link>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Lawyer Login</h2>
              <p className="text-slate-400">Access your professional dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <CorporateInput
                label="Email Address"
                type="email"
                data-testid="lawyer-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="lawyer@example.com"
                icon={Mail}
                required
              />

              <CorporateInput
                label="Password"
                type="password"
                data-testid="lawyer-password-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                icon={Lock}
                required
              />

              <CorporateButton
                type="submit"
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'Signing in...' : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </CorporateButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Not registered yet?{' '}
                <Link to="/lawyer-application" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Apply now
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link to="/role-selection?mode=login" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                Login as different role
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}