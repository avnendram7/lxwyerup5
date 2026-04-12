import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, Briefcase, MapPin, ArrowLeft, Phone, Mail,
  GraduationCap, CheckCircle, Award, Video, User, Globe,
  Calendar, Building, Shield, ChevronRight, ExternalLink, Star, Check, X, ArrowRight
} from 'lucide-react';
import { dummyLawyers } from '../data/lawyersData';
import axios from 'axios';
import { getLawyerPhoto, getInitials } from '../utils/lawyerPhoto';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function LawyerProfile({ lawyerId, onCloseModal }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = lawyerId || routeId;
  const isModal = !!lawyerId;
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyer = async () => {
      const dummy = dummyLawyers.find(l => l.id === id);
      if (dummy) {
        setLawyer({
          ...dummy,
          is_verified: dummy.verified,
          location: dummy.location || `${dummy.city || ''}, ${dummy.state || ''}`.replace(/^,\s*|,\s*$/, ''),
          feeMin: dummy.feeMin || 'N/A',
          feeMax: dummy.feeMax || 'N/A',
          image: (dummy.photo && dummy.photo.length > 5) ? dummy.photo : null,
          consultationModes: dummy.consultationModes || ['In-Person', 'Video Call'],
          achievements: dummy.achievements || [],
        });
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/lawyers`);
        const found = res.data.find(l => l.id === id);
        if (found) {
          const loc = `${found.city || ''}, ${found.state || ''}`.replace(/^,\s*|,\s*$/, '');
          const feeStr = found.fee_range || '';
          const parts = feeStr.split('-');
          setLawyer({
            ...found,
            name: found.full_name || found.name,
            experience: found.experience_years || found.experience,
            feeMin: parts[0]?.replace(/[^\d]/g, '') || 'N/A',
            feeMax: parts[1]?.replace(/[^\d]/g, '') || 'N/A',
            location: loc,
            image: (found.photo && found.photo.length > 5) ? found.photo : null,
            consultationModes: ['In-Person', 'Video Call', 'Phone'],
            achievements: found.achievements || [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className={isModal ? "p-8 flex flex-col items-center justify-center bg-white rounded-3xl" : "min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4"}>
        <Scale className="w-12 h-12 text-slate-300" />
        <p className="text-xl font-bold text-slate-700 mt-4">Lawyer not found</p>
        {!isModal && (
          <button onClick={() => navigate('/find-lawyer/manual')}
            className="px-5 py-2.5 mt-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            Browse Lawyers
          </button>
        )}
      </div>
    );
  }

  const displayName = lawyer.name || lawyer.full_name || 'Lawyer';

  const innerContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl bg-white dark:bg-[#121212] sm:rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden flex flex-col border border-slate-200 dark:border-[#2A2A2A] relative"
    >
      {/* Header Banner */}
      <div className="h-36 bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 dark:from-slate-800 dark:via-[#111] dark:to-black relative shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <span className="absolute top-5 right-7 text-white/20 dark:text-white/5 font-black text-5xl tracking-widest select-none pointer-events-none uppercase">Lxwyer Up</span>
        <button
          onClick={() => isModal ? onCloseModal() : navigate(-1)}
          className="absolute top-5 left-5 px-4 py-2 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 rounded-full text-white dark:text-slate-300 transition-colors backdrop-blur-md flex items-center gap-2 font-medium text-sm border border-white/10"
        >
          {isModal ? <X className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {isModal ? 'Close' : 'Back'}
        </button>
      </div>

        {/* Content area */}
        <div className="px-6 sm:px-12 pb-12">
          {/* Avatar + name row */}
          <div className="flex items-center gap-5 pt-6 pb-6 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl shrink-0 bg-white">
              {getLawyerPhoto(lawyer.image || lawyer.photo, displayName) ? (
                <img
                  src={getLawyerPhoto(lawyer.image || lawyer.photo, displayName)}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{getInitials(displayName)}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">{displayName}</h1>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-base mt-0.5">{lawyer.specialization}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {lawyer.is_verified || lawyer.verified ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-lg border border-green-100 dark:border-green-800 shrink-0 w-fit">
                  <Check className="w-4 h-4" /> Verified
                </span>
              ) : null}
              <button
                onClick={() => navigate(`/booking/${lawyer.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                Book Consultation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Info row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-slate-50 dark:bg-[#1A1A1A] rounded-2xl border border-slate-100 dark:border-[#333] shadow-sm flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                <Briefcase className="w-4 h-4 text-blue-500" /> Experience
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{lawyer.experience || '4'} Years</div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-[#1A1A1A] rounded-2xl border border-slate-100 dark:border-[#333] shadow-sm flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                <MapPin className="w-4 h-4 text-blue-500" /> Location
              </div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{lawyer.location || lawyer.city || 'Location not set'}</div>
            </div>
          </div>

          <div className="mb-10 p-6 bg-slate-50 dark:bg-[#1A1A1A] rounded-2xl border border-slate-100 dark:border-[#333] shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-400 mb-3 text-xs uppercase tracking-wider font-bold">
              <GraduationCap className="w-4 h-4 text-blue-500" /> Education
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{lawyer.education || 'LLB / LLM'}</div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                About
                <div className="h-px flex-1 bg-slate-100 dark:bg-[#2A2A2A]" />
              </h3>
              {lawyer.bio ? (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{lawyer.bio}</p>
              ) : (
                <p className="text-slate-400 italic">No bio available.</p>
              )}
            </div>

            {/* Achievements */}
            {lawyer.achievements && lawyer.achievements.length > 0 && (
              <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-[#05150f] dark:to-[#020a07] rounded-3xl border border-emerald-200 dark:border-emerald-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Award className="w-48 h-48 text-emerald-500" />
                </div>
                <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                  <Award className="w-5 h-5" /> Milestones & Achievements
                  <div className="h-px flex-1 bg-emerald-200 dark:bg-emerald-900/50" />
                </h3>
                <div className="space-y-4 relative z-10">
                  {lawyer.achievements.map((ach, i) => (
                    <div key={i} className="bg-white/80 dark:bg-[#1A1A1A] backdrop-blur-md rounded-2xl p-5 border border-emerald-100 dark:border-[#333] flex items-center gap-5">
                      {ach.photo ? (
                        <img src={ach.photo} alt="achievement" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-emerald-200 dark:border-emerald-700" />
                      ) : (
                         <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-slate-800 border-emerald-200">
                          <Award className="w-8 h-8 text-emerald-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg text-slate-900 dark:text-white mb-1 break-words">{ach.title}</p>
                        {ach.date && <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><Calendar className="w-4 h-4 shrink-0"/> {ach.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-[#1A1A1A] p-6 rounded-2xl border border-slate-100 dark:border-[#333]">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Consultation Fee</p>
                <div className="flex gap-4 items-center">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">30 mins</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹{lawyer.feeMin !== 'N/A' ? lawyer.feeMin : '--'}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-[#333]" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">1 hour</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹{lawyer.feeMax !== 'N/A' ? lawyer.feeMax : '--'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#1A1A1A] p-6 rounded-2xl border border-slate-100 dark:border-[#333]">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Practice Area</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {lawyer.specialization}
                  </span>
                  {lawyer.secondarySpecializations?.map((spec, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 flex justify-center">
              <button
                onClick={() => navigate(`/booking/${lawyer.id}`)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
              >
                Book Consultation Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
    </motion.div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm shadow-2xl" onClick={onCloseModal}>
        <div onClick={e => e.stopPropagation()} className="w-full max-w-7xl max-h-[90vh] overflow-y-auto custom-scrollbar sm:rounded-[2.5rem] bg-white dark:bg-[#121212]">
          {innerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-8 px-4 flex justify-center pb-24">
      {innerContent}
    </div>
  );
}
