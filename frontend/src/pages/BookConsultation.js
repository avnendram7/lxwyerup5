import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Mail, CreditCard, Check, ArrowRight, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export default function BookConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    consultationType: 'civil',
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

  const consultationTypes = [
    { value: 'civil', label: 'Civil Law', price: 999 },
    { value: 'criminal', label: 'Criminal Law', price: 1499 },
    { value: 'family', label: 'Family Law', price: 899 },
    { value: 'corporate', label: 'Corporate Law', price: 1999 },
    { value: 'property', label: 'Property Law', price: 1299 }
  ];

  const selectedType = consultationTypes.find(t => t.value === bookingData.consultationType);

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Validate booking data
    if (!bookingData.fullName || !bookingData.email || !bookingData.phone || !bookingData.date || !bookingData.time) {
      toast.error('Please fill all required fields');
      return;
    }

    setStep(2); // Move to payment
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking
      const bookingPayload = {
        ...bookingData,
        amount: selectedType.price,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'card',
        card_last_four: paymentData.cardNumber.slice(-4)
      };

      const response = await axios.post(`${API}/bookings/guest`, bookingPayload);

      toast.success('Payment Successful! Booking Confirmed');

      // Move to success step
      setStep(3);

      // Store booking ID for later using sessionStorage
      sessionStorage.setItem('lastBookingId', response.data.id || 'dummy-id');

    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/user-login', {
      state: {
        message: 'Login to view your consultation booking',
        bookingEmail: bookingData.email
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${step >= num ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                  {step > num ? <Check className="w-6 h-6" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-24 h-1 mx-2 transition-all ${step > num ? 'bg-blue-600' : 'bg-slate-800'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 text-sm text-slate-400">
            <span className={step === 1 ? 'text-blue-400 font-semibold' : ''}>Details</span>
            <span className="mx-8">•</span>
            <span className={step === 2 ? 'text-blue-400 font-semibold' : ''}>Payment</span>
            <span className="mx-8">•</span>
            <span className={step === 3 ? 'text-blue-400 font-semibold' : ''}>Confirmed</span>
          </div>
        </div>

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Book Your Consultation</h2>
            <p className="text-slate-400 mb-8">Fill in your details to schedule a consultation with our expert lawyers</p>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Consultation Type</label>
                <select
                  value={bookingData.consultationType}
                  onChange={(e) => setBookingData({ ...bookingData, consultationType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {consultationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - ₹{type.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Brief Description (Optional)</label>
                <textarea
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tell us briefly about your legal matter..."
                />
              </div>

              {/* Price Summary */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Consultation Fee</span>
                  <span className="text-2xl font-bold text-white">₹{selectedType.price}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Proceed to Payment
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Payment Details</h2>
            <p className="text-slate-400 mb-8">Complete your payment to confirm the booking</p>

            {/* Booking Summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consultation Type</span>
                  <span className="text-white font-medium">{selectedType.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="text-white font-medium">{bookingData.date} at {bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client</span>
                  <span className="text-white font-medium">{bookingData.fullName}</span>
                </div>
                <div className="border-t border-slate-700 mt-4 pt-4 flex justify-between">
                  <span className="text-white font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-400">₹{selectedType.price}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      if (value.length <= 16 && /^\d*$/.test(value)) {
                        setPaymentData({ ...paymentData, cardNumber: value });
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">For testing: Use 4242424242424242</p>
              </div>

              {/* Card Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="JOHN DOE"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      if (value.length <= 5) {
                        setPaymentData({ ...paymentData, expiryDate: value });
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        setPaymentData({ ...paymentData, cvv: value });
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium">Secure Payment</p>
                  <p className="text-slate-400">Your payment information is encrypted and secure</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ₹${selectedType.price}`}
                  {!loading && <Lock className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-slate-400 mb-8">Your consultation has been successfully booked and payment is complete</p>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consultation Type</span>
                  <span className="text-white font-medium">{selectedType.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time</span>
                  <span className="text-white font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid</span>
                  <span className="text-green-400 font-bold">₹{selectedType.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-green-400 font-semibold">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-slate-300 text-sm">
                A confirmation email has been sent to <span className="text-blue-400 font-semibold">{bookingData.email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Login to View Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-xl transition-all"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
