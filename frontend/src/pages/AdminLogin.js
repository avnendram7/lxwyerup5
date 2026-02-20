import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, ArrowRight, Shield, ArrowLeft, Home } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { motion } from 'framer-motion';
import { CorporateInput, CorporateButton } from '../components/CorporateComponents';

export default function AdminLogin() {
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
      const response = await axios.post(`${API}/admin/login`, formData);
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome, Admin!');
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid admin credentials');
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
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(239, 68, 68) 1px, transparent 0)`,
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
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Admin Portal</span>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 shadow-2xl shadow-red-500/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-slate-400">Authorized personnel only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <CorporateInput
                label="Admin Email"
                type="email"
                data-testid="admin-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@lxwyerup.com"
                icon={Mail}
                required
              />

              <CorporateInput
                label="Admin Password"
                type="password"
                data-testid="admin-password-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter admin password"
                icon={Lock}
                required
              />

              <CorporateButton
                type="submit"
                variant="primary"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <Shield className="w-5 h-5" />
                    Secure Login
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </CorporateButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                This portal is for authorized administrators only
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}