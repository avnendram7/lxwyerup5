import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, User, Mail, Phone, Lock, Calendar, Clock, CreditCard,
  CheckCircle, ArrowLeft, ArrowRight, Loader2, MapPin, Briefcase,
  Shield, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { dummyLawyers } from '../data/lawyersData';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-[#0F2944]" />
            <span className="text-xl font-bold text-[#0F2944]">Lxwyer Up</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0F2944] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </nav>
  );
};

// Generate available time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    if (hour !== 13) { // Skip lunch hour
      slots.push(`${hour}:00`);
      if (hour !== 18) slots.push(`${hour}:30`);
    }
  }
  return slots;
};

// Generate available dates (next 14 days, excluding Sundays)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) { // Exclude Sundays
      dates.push(date);
    }
  }
  return dates;
};

const BookingSignup = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Find the lawyer
  const lawyer = dummyLawyers.find(l => l.id === id);

  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Booking Info
    selectedDate: null,
    selectedTime: '',
    consultationType: 'video', // video, in-person, phone
    caseDescription: '',
    // Payment Info
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });

  const timeSlots = generateTimeSlots();
  const availableDates = generateAvailableDates();

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
      if (!formData.selectedDate || !formData.selectedTime) {
        toast.error('Please select a date and time');
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
      setStep(step + 1);
    }
  };

  const processPayment = async () => {
    if (!validateStep(3)) return;

    setPaymentProcessing(true);

    // Simulate payment processing (3 seconds)
    setTimeout(async () => {
      setPaymentSuccess(true);
      setPaymentProcessing(false);

      // Register the user
      try {
        const response = await axios.post(`${API}/auth/signup`, {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          user_type: 'client'
        });

        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));

        toast.success('Payment successful! Account created.');

        // Wait a moment then go to step 4 (success)
        setTimeout(() => {
          setStep(4);
        }, 1000);
      } catch (error) {
        // If user already exists, still proceed
        if (error.response?.data?.detail?.includes('already exists')) {
          toast.success('Payment successful!');
          setTimeout(() => {
            setStep(4);
          }, 1000);
        } else {
          toast.error('Account creation failed. Please try again.');
        }
      }
    }, 3000);
  };

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <SimpleNavbar navigate={navigate} />
        <div className="pt-24 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-[#0F2944]">Lawyer not found</h1>
          <Button onClick={() => navigate('/browse-lawyers')} className="mt-4">
            Browse Lawyers
          </Button>
        </div>
      </div>
    );
  }

  const consultationFee = lawyer.feeMin || 3000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />

      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Personal Info' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Confirmation' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s.num === step ? 'bg-[#0F2944] text-white' :
                  s.num < step ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                  {s.num < step ? '✓' : s.num}
                </div>
                <span className={`text-xs mt-1 ${s.num <= step ? 'text-[#0F2944]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${s.num < step ? 'bg-green-600' : 'bg-gray-200'
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
              className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6"
            >
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0F2944]">Create Your Account</h2>
                    <p className="text-gray-600">Enter your details to book consultation</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.full_name}
                          onChange={(e) => updateField('full_name', e.target.value)}
                          placeholder="Your full name"
                          className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="your@email.com"
                          className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0F2944] mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                        />
                      </div>
                    </div>

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
                            type="password"
                            value={formData.confirm_password}
                            onChange={(e) => updateField('confirm_password', e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                  >
                    Continue to Schedule
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

              {/* Step 2: Schedule */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0F2944]">Select Date & Time</h2>
                    <p className="text-gray-600">Choose your preferred consultation slot</p>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-3">Consultation Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'video', label: 'Video Call', icon: '📹' },
                        { value: 'in-person', label: 'In-Person', icon: '🏢' },
                        { value: 'phone', label: 'Phone Call', icon: '📞' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => updateField('consultationType', type.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${formData.consultationType === type.value
                            ? 'border-[#0F2944] bg-[#0F2944]/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-sm font-medium text-[#0F2944]">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-3">Select Date *</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {availableDates.slice(0, 14).map((date, idx) => {
                        const isSelected = formData.selectedDate?.toDateString() === date.toDateString();
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const month = date.toLocaleDateString('en-US', { month: 'short' });

                        return (
                          <button
                            key={idx}
                            onClick={() => updateField('selectedDate', date)}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${isSelected
                              ? 'border-[#0F2944] bg-[#0F2944] text-white'
                              : 'border-gray-200 hover:border-[#0F2944] hover:bg-gray-50'
                              }`}
                          >
                            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>{dayName}</div>
                            <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-[#0F2944]'}`}>{dayNum}</div>
                            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>{month}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-3">Select Time *</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {timeSlots.map((time) => {
                        const isSelected = formData.selectedTime === time;
                        const isAvailable = Math.random() > 0.2; // Simulate some slots being unavailable

                        return (
                          <button
                            key={time}
                            onClick={() => isAvailable && updateField('selectedTime', time)}
                            disabled={!isAvailable}
                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${isSelected
                              ? 'border-[#0F2944] bg-[#0F2944] text-white'
                              : isAvailable
                                ? 'border-gray-200 hover:border-[#0F2944] text-[#0F2944]'
                                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Case Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-2">Briefly describe your case (Optional)</label>
                    <textarea
                      value={formData.caseDescription}
                      onChange={(e) => updateField('caseDescription', e.target.value)}
                      placeholder="Provide a brief description of your legal matter..."
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                    />
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
              {step === 3 && !paymentSuccess && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0F2944]">Payment Details</h2>
                    <p className="text-gray-600">Secure payment for your consultation</p>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-semibold text-[#0F2944]">₹{consultationFee}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-semibold text-[#0F2944]">₹99</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="font-semibold text-[#0F2944]">₹{Math.round((consultationFee + 99) * 0.18)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0F2944]">Total</span>
                      <span className="font-bold text-xl text-[#0F2944]">₹{consultationFee + 99 + Math.round((consultationFee + 99) * 0.18)}</span>
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
                        <>
                          Pay ₹{consultationFee + 99 + Math.round((consultationFee + 99) * 0.18)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-[#0F2944] mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-6">
                    Your consultation with {lawyer.name} has been scheduled.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                    <h3 className="font-semibold text-[#0F2944] mb-4">Booking Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-[#0F2944]">
                          {formData.selectedDate?.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time</span>
                        <span className="font-medium text-[#0F2944]">{formData.selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span className="font-medium text-[#0F2944] capitalize">{formData.consultationType.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Confirmation</span>
                        <span className="font-medium text-[#0F2944]">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-[#0F2944]">
                      <strong>Your account has been created!</strong><br />
                      You can now login with <strong>{formData.email}</strong> and your password.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                    >
                      Login to Dashboard
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="flex-1 border-gray-200 text-[#0F2944] hover:bg-gray-50 rounded-xl py-3"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Lawyer Info */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 sticky top-24">
              <h3 className="text-sm font-medium text-gray-500 mb-4">BOOKING WITH</h3>

              <div className="flex items-start gap-4 mb-4">
                <img
                  src={lawyer.image}
                  alt={lawyer.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-[#0F2944]">{lawyer.name}</h4>
                  <p className="text-sm text-gray-600">{lawyer.specialization}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{lawyer.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{lawyer.location}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Consultation Fee</span>
                  <span className="font-semibold text-[#0F2944]">₹{consultationFee}</span>
                </div>
                {formData.selectedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-[#0F2944]">
                      {formData.selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {formData.selectedTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-[#0F2944]">{formData.selectedTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSignup;
