import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Building2, MapPin, ArrowRight, ArrowLeft, Phone, Mail,
  Users, Calendar, CheckCircle, Award, Clock, Globe, Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { dummyLawFirms } from '../data/lawFirmsDataExtended';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-[#0F2944]">Lxwyer Up</span>
          </button>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="text-[#0F2944] hover:text-[#0F2944]/80"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const FirmProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find the firm by ID
  const firm = dummyLawFirms.find(f => f.id === id);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/find-lawfirm/manual')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0F2944] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Law Firms
          </button>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="relative">
                <img
                  src={firm.logo}
                  alt={firm.firm_name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
                {firm.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#0F2944] mb-2">{firm.firm_name}</h1>
                    <p className="text-gray-600 mb-3">{firm.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{firm.total_lawyers} lawyers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Since {firm.established_year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{firm.city}, {firm.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="text-2xl font-bold text-[#0F2944]">{firm.consultation}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {firm.verified && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {firm.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" /> Featured
                    </span>
                  )}

                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4">
              <Button
                onClick={() => navigate(`/join-firm/${firm.id}`)}
                className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white px-8 py-4 rounded-xl font-semibold text-lg group"
              >
                Join This Firm
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/register?redirect=booking')}
                variant="outline"
                className="border-2 border-[#0F2944] text-[#0F2944] px-8 py-4 rounded-xl font-semibold text-lg"
              >
                Book Consultation
              </Button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 space-y-6"
            >
              {/* Practice Areas */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Practice Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {firm.practice_areas?.map((area, idx) => (
                    <span key={idx} className="px-4 py-2 bg-[#0F2944]/10 text-[#0F2944] rounded-full text-sm font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Firm Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Firm Overview</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#0F2944]">{firm.total_lawyers}</p>
                    <p className="text-sm text-gray-600">Lawyers</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#0F2944]">{firm.total_staff || Math.floor(firm.total_lawyers * 1.5)}</p>
                    <p className="text-sm text-gray-600">Staff Members</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#0F2944]">{2024 - firm.established_year}</p>
                    <p className="text-sm text-gray-600">Years in Business</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {firm.achievements && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-bold text-[#0F2944] mb-4">Achievements & Recognition</h2>
                  <p className="text-gray-600">{firm.achievements}</p>
                </div>
              )}

              {/* Services */}
              {firm.services && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-bold text-[#0F2944] mb-4">Services Offered</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {firm.services.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Contact Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Contact Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0F2944]/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#0F2944]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-[#0F2944] font-medium">{firm.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0F2944]/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#0F2944]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-[#0F2944] font-medium">{firm.email}</p>
                    </div>
                  </div>
                  {firm.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0F2944]/10 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-[#0F2944]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Website</p>
                        <p className="text-sm text-[#0F2944] font-medium">{firm.website}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#0F2944]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#0F2944]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm text-[#0F2944] font-medium">{firm.address}</p>
                      <p className="text-sm text-gray-600">{firm.city}, {firm.state} - {firm.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Working Hours</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{firm.workingHours || '9:00 AM - 6:00 PM'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{firm.workingDays || 'Monday - Saturday'}</span>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Registration</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Registration Number</p>
                    <p className="text-[#0F2944] font-medium">{firm.registration_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Established</p>
                    <p className="text-[#0F2944] font-medium">{firm.established_year}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirmProfile;
