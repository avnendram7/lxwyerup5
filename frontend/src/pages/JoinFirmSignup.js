import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, User, Mail, Phone, Lock, Building2, Briefcase, CreditCard,
  CheckCircle, ArrowLeft, ArrowRight, Loader2, MapPin, Users,
  Eye, EyeOff, Shield, Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { dummyLawFirms } from '../data/lawFirmsDataExtended';
import GoogleSignupButton from '../components/GoogleSignupButton';
import IndianPhoneInput from '../components/IndianPhoneInput';
import OtpVerificationModal from '../components/OtpVerificationModal';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 shadow-sm border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-[#0F2944] dark:text-white">Lxwyer Up</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-[#0F2944] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </nav>
  );
};

const JoinFirmSignup = () => {
  const navigate = useNavigate();
  const { firmId } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const [isExistingUser, setIsExistingUser] = useState(false);

  // Find the firm
  const firm = dummyLawFirms.find(f => f.id === firmId);

  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Company Info
    company_name: '',
    designation: '',
    // Case Details
    case_type: '',
    case_description: '',
    urgency: 'normal',
    // Payment Info
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });

  // Auto-fill from session if user is already logged in
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          full_name: parsedUser.full_name || parsedUser.name || '',
          email: parsedUser.email || ''
        }));
        setIsExistingUser(true);
      } catch (_) {}
    }
  }, []);

  const caseTypes = [
    'Corporate Law', 'Property Law', 'Family Law', 'Criminal Law',
    'Civil Law', 'Tax Law', 'Labour Law', 'Consumer Law',
    'Intellectual Property', 'Banking Law', 'Other'
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
        toast.error('Please fill all required fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        toast.error('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }
    if (stepNum === 2) {
      if (!formData.case_type || !formData.case_description) {
        toast.error('Please provide case details');
        return false;
      }
    }
    if (stepNum === 3) {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
        toast.error('Please fill all payment details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1) {
        if (formData.phone.length !== 10) {
          toast.error('Please enter a valid 10-digit phone number');
          return;
        }
        setOtpModalOpen(true);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleGoogleSignup = async (googleData) => {
    setFormData(prev => ({
      ...prev,
      full_name: googleData.name,
      email: googleData.email,
      phone: googleData.phone,
      password: `google_${Date.now()}`,
      confirm_password: `google_${Date.now()}`,
      _googleToken: googleData.accessToken,
    }));
    setStep(step + 1); // advance to Step 2 (Case Details)
    toast.success('Google account connected! Tell us about your case.');
  };

  const processPayment = async () => {
    if (!validateStep(3)) return;

    setPaymentProcessing(true);

    // Simulate payment processing (3 seconds)
    setTimeout(async () => {
      // Register the user as firm_client using the dedicated endpoint
      try {
        const response = await axios.post(`${API}/firm-clients/register-paid`, {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          company_name: formData.company_name || null,
          case_type: formData.case_type,
          case_description: formData.case_description,
          law_firm_id: firmId,
          law_firm_name: firm?.firm_name || 'Unknown Firm',
          payment_amount: totalAmount
        });

        // Don't store token - user needs admin approval first
        toast.success('Payment successful! Your account is pending admin approval.');
        setPaymentProcessing(false);
        setSubmitted(true);
      } catch (error) {
        setPaymentProcessing(false);
        const errorMsg = error.response?.data?.detail;
        if (typeof errorMsg === 'string' && errorMsg.includes('already exists')) {
          toast.error('Email already registered. Please login instead.');
        } else if (typeof errorMsg === 'string') {
          toast.error(errorMsg);
        } else {
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem('user', JSON.stringify(response.data.user));

          toast.success('Account created!');
          navigate('/firm-lawyer-dashboard');
        }
      }
    }, 3000);
  };

  const registrationFee = 999;
  const gst = Math.round(registrationFee * 0.18);
  const totalAmount = registrationFee + gst;

  if (!firm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <SimpleNavbar navigate={navigate} />
        <div className="pt-24 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-[#0F2944]">Law Firm not found</h1>
          <Button onClick={() => navigate('/find-lawfirm/manual')} className="mt-4">
            Browse Law Firms
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <SimpleNavbar navigate={navigate} />
        <div className="pt-24 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Clock className="w-12 h-12 text-amber-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#0F2944] mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your application to join <strong>{firm.firm_name}</strong> has been submitted.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 font-semibold mb-2">
                ⏳ Pending Admin Approval
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your account is being reviewed by the admin</li>
                <li>• You will be able to login once approved</li>
                <li>• Email: <strong>{formData.email}</strong></li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-[#0F2944] font-semibold mb-2">
                What happens next?
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Admin will review your application</li>
                <li>• Once approved, you can login with your email & password</li>
                <li>• Access your Law Firm Client Dashboard</li>
                <li>• Track your case progress</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/firm-client-login')}
                className="flex-1 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl"
                data-testid="go-to-login-btn"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 border-gray-200 text-[#0F2944] hover:bg-gray-50 rounded-xl"
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SimpleNavbar navigate={navigate} />

      <OtpVerificationModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerified={() => { setOtpModalOpen(false); setStep(step + 1); }}
        email={formData.email}
        phone={formData.phone}
      />

      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Personal Info' },
            { num: 2, label: 'Case Details' },
            { num: 3, label: 'Payment' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s.num === step ? 'bg-[#0F2944] dark:bg-white text-white dark:text-[#0F2944]' :
                  s.num < step ? 'bg-green-600 text-white' :
                    'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-500'
                  }`}>
                  {s.num < step ? '✓' : s.num}
                </div>
                <span className={`text-xs mt-1 ${s.num <= step ? 'text-[#0F2944] dark:text-white' : 'text-gray-400 dark:text-slate-600'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`w-16 h-1 mx-2 rounded ${s.num < step ? 'bg-green-600' : 'bg-gray-200 dark:bg-slate-800'
                  }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="md:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg rounded-2xl p-6"
            >
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0F2944] dark:text-white">Join as Client</h2>
                    <p className="text-gray-600 dark:text-slate-400">Create your account to work with {firm.firm_name}</p>
                  </div>

                  {/* Google Signup */}
                  <GoogleSignupButton onSuccess={handleGoogleSignup} theme="light" />

                  {/* OR Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] dark:text-slate-300 mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.full_name}
                          onChange={(e) => updateField('full_name', e.target.value)}
                          readOnly={isExistingUser}
                          placeholder="Rahul Sharma"
                          className={`pl-10 border-gray-200 dark:border-slate-700 rounded-xl text-black dark:text-white placeholder:text-gray-400 ${isExistingUser ? 'bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed opacity-70' : 'bg-white dark:bg-slate-800'}`}
                        />
                      </div>
                      {isExistingUser && <p className="text-xs text-gray-400 mt-1">Auto-filled from your account</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] dark:text-slate-300 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          readOnly={isExistingUser}
                          placeholder="rahul@example.com"
                          className={`pl-10 border-gray-200 dark:border-slate-700 rounded-xl text-black dark:text-white placeholder:text-gray-400 ${isExistingUser ? 'bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed opacity-70' : 'bg-white dark:bg-slate-800'}`}
                        />
                      </div>
                      {isExistingUser && <p className="text-xs text-gray-400 mt-1">Auto-filled from your account</p>}
                    </div>

                    <IndianPhoneInput
                      value={formData.phone}
                      onChange={(digits) => updateField('phone', digits)}
                      label="Phone Number"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0F2944] mb-2">Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0F2944] mb-2">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirm_password}
                            onChange={(e) => updateField('confirm_password', e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0F2944] dark:text-slate-300 mb-2">Company Name (Optional)</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            value={formData.company_name}
                            onChange={(e) => updateField('company_name', e.target.value)}
                            placeholder="Your Company Ltd."
                            className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl text-black dark:text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0F2944] dark:text-slate-300 mb-2">Your Designation (Optional)</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            value={formData.designation}
                            onChange={(e) => updateField('designation', e.target.value)}
                            placeholder="CEO, Manager, etc."
                            className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl text-black dark:text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                  >
                    Continue to Case Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-[#0F2944] hover:underline font-medium">
                      Login here
                    </button>
                  </p>
                </div>
              )}

              {/* Step 2: Case Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0F2944]">Case Details</h2>
                    <p className="text-gray-600">Tell us about your legal needs</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Case Type *</label>
                      <select
                        value={formData.case_type}
                        onChange={(e) => updateField('case_type', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      >
                        <option value="">Select case type</option>
                        {caseTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Urgency Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'low', label: 'Low', desc: 'Can wait' },
                          { value: 'normal', label: 'Normal', desc: 'Standard' },
                          { value: 'high', label: 'High', desc: 'Urgent' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField('urgency', option.value)}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${formData.urgency === option.value
                              ? 'border-[#0F2944] bg-[#0F2944]/5'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className={`font-medium ${formData.urgency === option.value ? 'text-[#0F2944]' : 'text-gray-700'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Describe Your Case *</label>
                      <textarea
                        value={formData.case_description}
                        onChange={(e) => updateField('case_description', e.target.value)}
                        placeholder="Please describe your legal matter in detail..."
                        rows={4}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-1 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0F2944]">Payment Details</h2>
                    <p className="text-gray-600">Complete your registration <span className="text-blue-600 font-semibold">(Dummy Gateway Test)</span></p>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Registration Fee</span>
                      <span className="font-semibold text-[#0F2944]">₹{registrationFee}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="font-semibold text-[#0F2944]">₹{gst}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0F2944]">Total</span>
                      <span className="font-bold text-xl text-[#0F2944]">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Card Number *</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                            updateField('cardNumber', formatted);
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0F2944] mb-2">Expiry Date *</label>
                        <Input
                          value={formData.cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2);
                            }
                            updateField('cardExpiry', value);
                          }}
                          placeholder="MM/YY"
                          className="bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0F2944] mb-2">CVV *</label>
                        <Input
                          value={formData.cardCvv}
                          onChange={(e) => updateField('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="123"
                          type="password"
                          className="bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Cardholder Name *</label>
                      <Input
                        value={formData.cardName}
                        onChange={(e) => updateField('cardName', e.target.value)}
                        placeholder="Name on card"
                        className="bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3"
                      disabled={paymentProcessing}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={processPayment}
                      disabled={paymentProcessing}
                      className="flex-1 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                    >
                      {paymentProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${totalAmount}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Firm Info */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg rounded-2xl p-6 sticky top-24">
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">JOINING</h3>

              <div className="flex items-start gap-4 mb-4">
                <img
                  src={firm.logo}
                  alt={firm.firm_name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-[#0F2944] dark:text-white">{firm.firm_name}</h4>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{firm.total_lawyers} lawyers</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{firm.city}, {firm.state}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <h4 className="text-sm font-medium text-[#0F2944] mb-2">Practice Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {firm.practice_areas?.slice(0, 4).map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#0F2944]/10 text-[#0F2944] text-xs rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="my-4" />

              {/* Payment Summary in Sidebar */}
              <div>
                <h4 className="text-sm font-medium text-[#0F2944] mb-2">Fee Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registration</span>
                    <span className="text-[#0F2944]">₹{registrationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST</span>
                    <span className="text-[#0F2944]">₹{gst}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span className="text-[#0F2944]">Total</span>
                    <span className="text-[#0F2944]">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinFirmSignup;
