import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Briefcase, MapPin, ArrowLeft, Phone, Globe,
  CheckCircle, Award, Shield, Check, Clock, Mail, BookOpen
} from 'lucide-react';
import GoldenStars from '../components/GoldenStars';
import { dummyLawyers } from '../data/lawyersData';
import axios from 'axios';
import { getLawyerPhoto, getInitials } from '../utils/lawyerPhoto';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const SignatureNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#d4af37]/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
              L X W Y E R <span className="text-[#d4af37]">U P</span>
            </span>
            <div className="h-5 w-px bg-white/20 mx-3 hidden sm:block"></div>
            <span className="text-[#d4af37] text-xl hidden sm:block" style={{ fontFamily: '"Great Vibes", cursive' }}>
              Signature Dossier
            </span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-[#d4af37] transition-colors font-medium tracking-wide border border-transparent hover:border-[#d4af37]/30 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            DIRECTORY
          </button>
        </div>
      </div>
    </nav>
  );
};

export default function SignatureLawyerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchLawyer = async () => {
      const dummy = dummyLawyers.find(l => l.id === id);
      if (dummy) {
        setLawyer({
          ...dummy,
          is_verified: true, // Signature always verified
          location: dummy.location || `${dummy.city || ''}, ${dummy.state || ''}`.replace(/^,\s*|,\s*$/, ''),
          feeMin: dummy.feeMin || 'N/A',
          feeMax: dummy.feeMax || 'N/A',
          image: (dummy.photo && dummy.photo.length > 5) ? dummy.photo : null,
          consultationModes: dummy.consultationModes || ['In-Person', 'Video Call', 'Phone'],
          achievements: dummy.achievements || [],
          lawFirm: dummy.firm || 'Exclusive Legal Practice'
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
            consultationModes: ['In-Person', 'Video Call', 'Priority Channel'],
            achievements: found.achievements || [],
            lawFirm: found.firm || 'Exclusive Legal Practice'
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/20 border-t-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        <GoldenStars />
        <SignatureNavbar navigate={navigate} />
        <Scale className="w-16 h-16 text-[#d4af37]/30 mb-6" />
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Dossier Unavailable</h1>
        <p className="text-[#d4af37] mt-2 mb-8 uppercase tracking-widest text-xs">The requested profile cannot be located.</p>
        <button onClick={() => navigate('/find-lawyer/manual')} className="px-8 py-4 bg-[#d4af37] text-black font-extrabold uppercase tracking-widest rounded-xl hover:bg-[#b5952f] transition-colors">
          Return to Directory
        </button>
      </div>
    );
  }

  const displayName = lawyer.name || lawyer.full_name || 'Counsel';
  const allTags = [lawyer.specialization, ...(lawyer.secondarySpecializations || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-[#d4af37] selection:text-black pb-24">
      <GoldenStars />
      <SignatureNavbar navigate={navigate} />
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.15) 0%, transparent 60%)' }} />

      <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Large Header Identity Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-[#d4af37]/30 shadow-[0_20px_50px_rgba(212,175,55,0.05)] rounded-[2rem] overflow-hidden flex flex-col lg:flex-row relative"
        >
          {/* Subtle Cursive Background inside Card */}
          <span className="absolute -top-10 -right-10 text-[180px] text-[#d4af37]/[0.02] pointer-events-none whitespace-nowrap" style={{ fontFamily: '"Great Vibes", cursive' }}>
            Signature
          </span>

          {/* Left / Middle: Photo and Identity */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col sm:flex-row gap-10 relative z-10">
            {/* Massive Square Profile Shot */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl border-2 border-[#d4af37]/60 overflow-hidden bg-[#111] shadow-2xl relative">
              {getLawyerPhoto(lawyer.image || lawyer.photo, displayName) ? (
                <img
                  src={getLawyerPhoto(lawyer.image || lawyer.photo, displayName)}
                  alt={displayName}
                  className="w-full h-full object-cover grayscale brightness-110 contrast-125 hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1f1f1f] to-[#050505]">
                  <span className="text-6xl font-black text-[#d4af37]">{getInitials(displayName)}</span>
                </div>
              )}
              {/* Premium Ribbon Overlay */}
              <div className="absolute top-4 left-0 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black text-[10px] uppercase tracking-widest font-black px-3 py-1 shadow-lg border-r border-[#ffe58f]">
                SIGNATURE
              </div>
            </div>

            {/* Core Identity Details */}
            <div className="flex flex-col flex-1 justify-center">
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                {displayName}
              </h1>
              <h2 className="text-[#d4af37] text-lg font-bold uppercase tracking-widest mb-4">
                {lawyer.lawFirm}
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-6 max-w-xl">
                {allTags.map((tag, i) => (
                  <span key={i} className="text-xs uppercase tracking-wider font-semibold text-white/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-[#d4af37] font-bold bg-[#d4af37]/10 px-4 py-2 rounded-xl border border-[#d4af37]/30 uppercase tracking-widest text-[10px]">
                  <Shield className="w-4 h-4" /> Signature Member
                </span>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-xs uppercase tracking-widest font-bold text-white/50">Experience:</span>
                  <span className="font-bold text-[#d4af37] text-lg">{lawyer.experience || '10+'} YEARS</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-xs uppercase tracking-widest font-bold text-white/50">Language:</span>
                  <span className="font-bold">{lawyer.languages ? lawyer.languages.join(', ') : 'English'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Area: Highlights Box */}
          <div className="w-full lg:w-[350px] bg-gradient-to-b from-[#111] to-[#0a0a0a] border-l border-[#d4af37]/20 p-8 flex flex-col justify-center relative z-10">
            <h3 className="text-xs uppercase tracking-widest font-black text-[#d4af37] mb-6 text-center border-b border-[#d4af37]/20 pb-4">
              Premium Member Verified Highlights
            </h3>
            
            <ul className="space-y-4">
              {[
                'Contact Information Verified',
                'In Premium Standing',
                'Zero Misconduct Records',
                'Priority Consultation Access',
                'Accepts High-Value Referrals'
              ].map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="bg-[#d4af37]/10 rounded-full p-1 mt-0.5 border border-[#d4af37]/30 shrink-0">
                    <Check className="w-3 h-3 text-[#d4af37]" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-white/90">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Action Button Row - Restricted to Only Internal Booking to secure leads */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex mt-6"
        >
          <button
            onClick={() => navigate('/signature-booking', { state: { lawyer } })}
            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] hover:from-[#e5c158] hover:to-[#b5952f] shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-2xl py-6 text-black font-black uppercase tracking-[0.3em] text-lg transition-all"
          >
            <Clock className="w-6 h-6 opacity-80" />
            Book Priority Consultation
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 sm:p-10"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                <BookOpen className="w-6 h-6 text-[#d4af37]" /> Executive Summary
              </h3>
              <div className="text-white/60 leading-relaxed text-lg whitespace-pre-line font-medium">
                {lawyer.bio || `Signature Premium Counsel representing the highest tier of verified legal advisory. With a concentrated focus on high-stakes ${lawyer.specialization?.toLowerCase() || 'litigation'} and expansive cross-border advisory, ${displayName} has secured structural advantages and definitive outcomes for global entities and private clients across the nation. \n\n Retained exclusively through prioritized access endpoints, Chambers operate with strict confidentiality.`}
              </div>
            </motion.div>

            {/* Achievements */}
            {lawyer.achievements && lawyer.achievements.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a1405] to-[#0a0a0a] border border-[#d4af37]/30 rounded-[2rem] p-8 sm:p-10 relative overflow-hidden"
              >
                <Award className="absolute top-10 right-10 w-40 h-40 text-[#d4af37]/5 pointer-events-none" />
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-widest relative z-10">
                  <Award className="w-6 h-6 text-[#d4af37]" /> Key Decisions & Milestones
                </h3>
                <div className="space-y-4 relative z-10">
                  {lawyer.achievements.map((ach, i) => (
                    <div key={i} className="bg-black/50 backdrop-blur-md rounded-2xl p-5 border border-[#d4af37]/20 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] font-black text-xl">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg text-white mb-1 break-words">{ach.title}</p>
                        {ach.date && <p className="text-xs uppercase tracking-widest text-[#d4af37]">{ach.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Formatted Education / Courts */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#d4af37] mb-3">Academic Excellence</p>
                <div className="text-xl font-medium text-white">{lawyer.education || 'Master of Laws (LL.M.)'}</div>
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#d4af37] mb-3">Admissions</p>
                <div className="text-xl font-medium text-white">Supreme Court of India • High Courts</div>
              </div>
            </motion.div>

          </div>

          {/* Sidebar / Map / Operating Info */}
          <div className="space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8"
            >
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37]" /> Main Office
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[#d4af37] text-xs uppercase tracking-widest font-black mb-2">Location Data</p>
                  <p className="text-white/80 leading-relaxed font-medium">
                    101 Signature Tower A<br />
                    Financial District Headquarters<br />
                    {lawyer.city || 'Metropolis'}, {lawyer.state || 'State'} 100001
                  </p>
                </div>

                <div className="w-full h-48 bg-[#111] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                   <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=New+Delhi&zoom=14&size=400x400&scale=2&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:all|element:labels.text.stroke|color:0xffffff&style=feature:all|element:labels.text|visibility:on&style=feature:all|element:geometry.fill|color:0xfcfcfc&style=feature:all|element:geometry.stroke|color:0xd3d3d3')] object-cover opacity-30 mix-blend-screen" />
                   <MapPin className="w-8 h-8 text-[#d4af37] drop-shadow-2xl relative z-10" />
                </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-[2rem] p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl pointer-events-none" />
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3 relative z-10">
                <Clock className="w-5 h-5 text-[#d4af37]" /> Retainer Specs
              </h3>
              
              <div className="space-y-4 text-sm font-medium relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Standard Retainer</span>
                  <span className="text-[#d4af37] font-black text-base">₹{lawyer.feeMin !== 'N/A' ? lawyer.feeMin.toLocaleString() : '15,000'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Extended Access</span>
                  <span className="text-[#d4af37] font-black text-base">₹{lawyer.feeMax !== 'N/A' ? lawyer.feeMax.toLocaleString() : '35,000'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Channel Access</span>
                  <span className="text-white font-bold">{lawyer.consultationModes.join(' • ')}</span>
                </div>
              </div>
            </motion.div>

            {/* Premium Visual Gallery */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden relative"
            >
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3 relative z-10">
                <Shield className="w-5 h-5 text-[#d4af37]" /> The Chambers
              </h3>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {/* Simulated images using premium stock photo placeholders */}
                <div className="h-28 rounded-xl bg-[#111] overflow-hidden border border-white/5 relative">
                  <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Library" />
                </div>
                <div className="h-28 rounded-xl bg-[#111] overflow-hidden border border-white/5 relative">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Conference Room" />
                </div>
                <div className="h-28 rounded-xl bg-[#111] overflow-hidden border border-white/5 relative">
                  <img src="https://images.unsplash.com/photo-1505664124967-17b2b73bc3fa?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Office Lobby" />
                </div>
                <div className="h-28 rounded-xl bg-[#111] flex items-center justify-center border border-[#d4af37]/30 text-[#d4af37] text-xs font-black uppercase tracking-widest bg-gradient-to-br from-[#111] to-[#0a0a0a] hover:from-[#d4af37]/10 transition-all cursor-pointer">
                  + V i e w<br/>A l l
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </main>
    </div>
  );
}
