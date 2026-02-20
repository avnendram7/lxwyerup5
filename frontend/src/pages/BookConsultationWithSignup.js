import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Mail, CreditCard, Check, ArrowRight, Shield, Lock, Scale, MapPin, Briefcase, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';
import { Button } from '../components/ui/button';

export default function BookConsultationWithSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const selectedLawyer = location.state?.lawyer || null;
  // const selectedLawyer = location.state?.lawyer || {
  //   name: "Verification Firm",
  //   specialization: "Corporate Law",
  //   experience: 15,
  //   city: "New Delhi",
  //   consultation_fee: 7500,
  //   feeMin: 7500
  // };

  const [signupData, setSignupData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    description: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // if (!selectedLawyer) return null;

  const getFeeAmount = () => {
    // Helper to parse string "₹5,000" -> 5000
    const parseFeeString = (str) => {
      if (!str) return null;
      const match = str.toString().match(/₹?([\d,]+)/);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
      return null;
    };

    // 0. Explicit check for Law Firm generic fee if present
    if (selectedLawyer.firm_fee) { // specific field for firms if used
      const parsed = parseFeeString(selectedLawyer.firm_fee);
      if (parsed) return parsed;
    }

    // 1. Direct consultation_fee (backend/formatted)
    if (selectedLawyer.consultation_fee) {
      if (typeof selectedLawyer.consultation_fee === 'number') return selectedLawyer.consultation_fee;
      const parsed = parseFeeString(selectedLawyer.consultation_fee);
      if (parsed) return parsed;
    }

    // 2. Generic fee (formatted)
    if (selectedLawyer.fee) {
      if (typeof selectedLawyer.fee === 'number') return selectedLawyer.fee;
      const parsed = parseFeeString(selectedLawyer.fee);
      if (parsed) return parsed;
    }

    // 3. Fee Range (backend raw) - take the lower bound
    if (selectedLawyer.fee_range) {
      const parsed = parseFeeString(selectedLawyer.fee_range);
      if (parsed) return parsed;
    }

    // 4. Dummy Data (feeMin)
    if (selectedLawyer.feeMin) {
      return selectedLawyer.feeMin;
    }

    // 5. Fallback for law firms if they have 'price' or 'cost'
    if (selectedLawyer.price) {
      const parsed = parseFeeString(selectedLawyer.price);
      if (parsed) return parsed;
    }

    // Default fallback
    return 2000; // Reasonable default for a firm/lawyer
  };

  const consultationFee = getFeeAmount();

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupData.full_name || !signupData.email || !signupData.phone || !signupData.password) {
      toast.error('Please fill all signup fields');
      return;
    }
    setStep(2);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) {
      toast.error('Please select date and time');
      return;
    }
    setStep(3);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userPayload = {
        ...signupData,
        user_type: 'client'
      };

      const signupResponse = await axios.post(`${API}/auth/signup`, userPayload);

      sessionStorage.setItem('token', signupResponse.data.token);
      sessionStorage.setItem('user', JSON.stringify(signupResponse.data.user));

      const bookingPayload = {
        lawyer_id: selectedLawyer.id,
        lawyer_name: selectedLawyer.name,
        date: bookingData.date,
        time: bookingData.time,
        description: bookingData.description,
        amount: consultationFee,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'card',
        card_last_four: paymentData.cardNumber.slice(-4)
      };

      await axios.post(`${API}/bookings`, bookingPayload, {
        headers: { Authorization: `Bearer ${signupResponse.data.token}` }
      });

      toast.success('Account created and booking confirmed!');
      setStep(4);

    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.detail?.includes('already exists')) {
        toast.error('Email already registered. Please login instead.');
        setTimeout(() => navigate('/user-login'), 2000);
      } else {
        toast.error(error.response?.data?.detail || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/user-dashboard');
  };

  return (
    <WaveLayout hideNavbar={true}>
      <div className="min-h-screen pt-20 pb-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header & Back */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Booking Consultation</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Step {step} of 4</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column: Lawyer Info & Progress */}
            <div className="lg:col-span-1 space-y-6">

              {/* Progress Steps (Vertical on large screens) */}
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex lg:flex-col justify-between lg:gap-8">
                  {[
                    { num: 1, label: 'Signup', icon: User },
                    { num: 2, label: 'Booking', icon: Calendar },
                    { num: 3, label: 'Payment', icon: CreditCard },
                    { num: 4, label: 'Confirmation', icon: Check }
                  ].map((s) => (
                    <div key={s.num} className="flex items-center gap-3 relative">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all relative z-10
                        ${step > s.num ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600'}
                      `}>
                        {step > s.num ? <Check className="w-5 h-5" /> : s.icon && <s.icon className="w-4 h-4" />}
                      </div>
                      <span className={`hidden lg:block font-medium ${step >= s.num ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                        {s.label}
                      </span>
                      {s.num < 4 && (
                        <div className={`
                          hidden lg:block absolute left-5 top-10 w-0.5 h-8 -ml-px transition-all
                          ${step > s.num ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Lawyer Card */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 rounded-3xl p-6 shadow-lg shadow-blue-900/5 dark:shadow-blue-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                      <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                      Top Rated
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedLawyer.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">{selectedLawyer.specialization}</p>

                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{selectedLawyer.experience || '10+'} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{selectedLawyer.city}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Consultation Fee</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{consultationFee}</p>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Secure Booking</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your personal information is encrypted and secure.</p>
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Form Steps */}
            <div className="lg:col-span-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none h-full"
              >

                {/* Step 1: Signup Form */}
                {step === 1 && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">Create Account</h2>
                      <p className="text-slate-500 dark:text-slate-400">Enter your details to create an account and proceed with booking.</p>
                    </div>

                    <form onSubmit={handleSignupSubmit} className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="text"
                            required
                            value={signupData.full_name}
                            onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="email"
                            required
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="tel"
                            required
                            value={signupData.phone}
                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 py-6 rounded-xl text-lg font-semibold">
                          Continue to Booking <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>

                      <p className="text-center text-sm text-slate-500 mt-4">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/user-login', { state: { lawyer: selectedLawyer } })}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Login
                        </button>
                      </p>
                    </form>
                  </div>
                )}

                {/* Step 2: Booking Details */}
                {step === 2 && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">Select Date & Time</h2>
                      <p className="text-slate-500 dark:text-slate-400">Choose a suitable slot for your consultation.</p>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="date"
                              required
                              min={new Date().toISOString().split('T')[0]}
                              value={bookingData.date}
                              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Time</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                              required
                              value={bookingData.time}
                              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none"
                            >
                              <option value="">Select Time</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                              <option value="2:00 PM">2:00 PM</option>
                              <option value="3:00 PM">3:00 PM</option>
                              <option value="4:00 PM">4:00 PM</option>
                              <option value="5:00 PM">5:00 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Description (Optional)</label>
                        <textarea
                          rows={4}
                          value={bookingData.description}
                          onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                          placeholder="Briefly describe your legal issue..."
                        />
                      </div>

                      <div className="pt-4">
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 py-6 rounded-xl text-lg font-semibold">
                          Proceed to Payment <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">Payment Details</h2>
                      <p className="text-slate-500 dark:text-slate-400">Complete payment to confirm your booking.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-8">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Consultation with</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedLawyer.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Date & Time</span>
                          <span className="font-medium text-slate-900 dark:text-white">{bookingData.date}, {bookingData.time}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                          <span className="font-semibold">Total Amount</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">₹{consultationFee}</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Card Number</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="text"
                            required
                            maxLength={16}
                            value={paymentData.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setPaymentData({ ...paymentData, cardNumber: value });
                            }}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="0000 0000 0000 0000"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={paymentData.cardName}
                          onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="NAME ON CARD"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700 ml-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={paymentData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              setPaymentData({ ...paymentData, expiryDate: value });
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700 ml-1">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setPaymentData({ ...paymentData, cvv: value });
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 py-6 rounded-xl text-lg font-semibold disabled:opacity-70">
                          {loading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span> : `Pay ₹${consultationFee}`}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                  <div className="text-center max-w-lg mx-auto py-8">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Check className="w-12 h-12 text-green-600" />
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-outfit">Booking Confirmed!</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Your consultation has been successfully scheduled. You can view details in your dashboard.</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                        <span className="text-slate-500 text-sm">Booking ID</span>
                        <span className="text-slate-900 font-mono text-sm bg-white px-2 py-1 rounded border border-slate-200">#{Math.floor(Math.random() * 100000)}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-sm">Client</span>
                          <span className="font-medium text-slate-900 text-sm">{signupData.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-sm">Lawyer</span>
                          <span className="font-medium text-slate-900 text-sm">{selectedLawyer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-sm">Date & Time</span>
                          <span className="font-medium text-slate-900 text-sm">{bookingData.date}, {bookingData.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={handleLoginRedirect} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 py-6 rounded-xl text-base font-semibold">
                        Go to Dashboard
                      </Button>
                      <Button onClick={() => navigate('/')} variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-8 py-6 rounded-xl text-base font-semibold">
                        Back to Home
                      </Button>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </WaveLayout>
  );
}
