import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Eye, Scale, ShieldCheck } from 'lucide-react';
import { getInitials } from '../utils/lawyerPhoto';
import { useLang } from '../context/LanguageContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TEXT = {
  en: {
    verified: 'Verified',
    legalExpert: 'Legal Expert',
    yr: 'yr',
    exp: 'Exp.',
    location: 'Location',
    profile: 'Profile',
    bookConsultation: 'Book Consultation',
    fee30m: 'Fee',
    fee60m: 'Fee (60m)',
    courts: 'Courts',
  },
  hi: {
    verified: 'सत्यापित',
    legalExpert: 'कानूनी विशेषज्ञ',
    yr: 'वर्ष',
    exp: 'अनुभव',
    location: 'स्थान',
    profile: 'प्रोफ़ाइल',
    bookConsultation: 'परामर्श बुक करें',
    fee30m: 'Fee',
    fee60m: 'Fee (60m)',
    courts: 'Courts',
  }
};

/* ── Specialization → professional banner color ── */
const SPEC_COLORS = {
  'criminal law':        { from: '#020617', to: '#0f172a', accent: '#60a5fa' },
  'criminal':            { from: '#020617', to: '#0f172a', accent: '#60a5fa' },
  'corporate law':       { from: '#00101f', to: '#003366', accent: '#3b82f6' },
  'corporate':           { from: '#00101f', to: '#003366', accent: '#3b82f6' },
  'business law':        { from: '#00101f', to: '#003366', accent: '#3b82f6' },
  'family law':          { from: '#000814', to: '#001d3d', accent: '#93c5fd' },
  'family':              { from: '#000814', to: '#001d3d', accent: '#93c5fd' },
  'intellectual property': { from: '#040810', to: '#162040', accent: '#818cf8' },
  'ip law':              { from: '#040810', to: '#162040', accent: '#818cf8' },
  'tax law':             { from: '#040d1a', to: '#0c2242', accent: '#7dd3fc' },
  'taxation':            { from: '#040d1a', to: '#0c2242', accent: '#7dd3fc' },
  'civil law':           { from: '#0d1520', to: '#1b2f4e', accent: '#3b82f6' },
  'civil litigation':    { from: '#0d1520', to: '#1b2f4e', accent: '#3b82f6' },
  'labour law':          { from: '#030811', to: '#0c1a30', accent: '#bfdbfe' },
  'employment law':      { from: '#030811', to: '#0c1a30', accent: '#bfdbfe' },
  'cyber law':           { from: '#001a26', to: '#003b5c', accent: '#38bdf8' },
  'cyber':               { from: '#001a26', to: '#003b5c', accent: '#38bdf8' },
  'constitutional law':  { from: '#001020', to: '#062854', accent: '#60a5fa' },
  'consumer law':        { from: '#020c1b', to: '#081f3d', accent: '#bae6fd' },
  'banking law':         { from: '#001030', to: '#002060', accent: '#60a5fa' },
  'banking':             { from: '#001030', to: '#002060', accent: '#60a5fa' },
  'real estate law':     { from: '#040a14', to: '#0e1f3a', accent: '#93c5fd' },
  'property law':        { from: '#040a14', to: '#0e1f3a', accent: '#93c5fd' },
  'medical negligence':  { from: '#010512', to: '#051638', accent: '#bfdbfe' },
  'divorce':             { from: '#000814', to: '#001730', accent: '#60a5fa' },
};

const DEFAULT_COLOR = { from: '#0a1020', to: '#162040', accent: '#3b82f6' };

function getColors(spec = '') {
  return DEFAULT_COLOR;
}

// Define stat item component for DRY principle
const StatItem = ({ label, value }) => (
  <div className="flex flex-col text-center px-1 flex-1">
    <span className="text-[11px] sm:text-[13px] font-bold text-[#f0f4ff]">{value}</span>
    <span className="text-[8px] sm:text-[9px] text-[#94a3b8] uppercase tracking-wider mt-1">{label}</span>
  </div>
);

const LawyerCard = ({ className, lawyer, index = 0, onProfileClick, onBookClick, ...props }) => {
  const { lang } = useLang();
  const d = TEXT[lang] || TEXT.en;
  
  const hasPhoto = !!(lawyer.photo && lawyer.photo.length > 5);
  // Fallback professional lawyer image
  const imageUrl = hasPhoto ? lawyer.photo : "https://images.unsplash.com/photo-1556856425-366d6618905d?q=80&w=2070&auto=format&fit=crop";
  
  const colors = getColors(lawyer.specialization);
  const themeColor = lawyer.isSignature ? '#d4af37' : colors.accent;

  const charge30 = lawyer.charge_30min || lawyer.consultation_fee_30min;
  const charge60 = lawyer.charge_60min || lawyer.consultation_fee_60min;
  const fallback = lawyer.fee_range || lawyer.consultation_fee || lawyer.feeMin || lawyer.price || lawyer.fee;
  
  let fee30 = charge30;
  let fee60 = charge60;
  if (!fee60 && fallback) {
    const rawVal = String(fallback).split('-')[0].replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
       fee60 = num; 
       if (!fee30) fee30 = Math.ceil(num / 2);
    }
  } else if (fee60 && !fee30) {
    fee30 = Math.ceil(fee60 / 2);
  } else if (fee30 && !fee60) {
    fee60 = fee30 * 2;
  }

  const rawCourts = lawyer.court_experience || lawyer.court || lawyer.courts || [];
  const courtsArray = Array.isArray(rawCourts) ? rawCourts : [rawCourts];
  
  const courts = courtsArray
    .map(c => (typeof c === 'object' ? c?.court_name : c))
    .filter(Boolean);

  const isSignature = lawyer.isSignature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.04 }}
      className={cn(
        "w-full overflow-hidden rounded-2xl bg-[#040404] shadow-lg relative group border text-left",
        isSignature ? "border-[#d4af37]/40 shadow-[0_8px_32px_rgba(212,175,55,0.15)]" : "border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)]",
        className
      )}
      whileHover={{ y: -5, scale: 1.02 }}
      {...props}
    >
      {isSignature && <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/5 to-transparent pointer-events-none z-0" />}

      {/* Top section with background image and content */}
      <div className="relative h-[200px] sm:h-[280px] w-full z-10 overflow-hidden">
        {/* Image — face clearly visible */}
        <img
          src={imageUrl}
          alt={lawyer.name}
          className="h-full w-full object-cover object-[center_15%] transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
             e.target.src = "https://images.unsplash.com/photo-1556856425-366d6618905d?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        
        {/* Subtle vignette only — keep face visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040404] via-[#040404]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040404]/15 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
          {isSignature ? (
            <div className="relative flex items-center px-2 py-1">
              <span className="text-[20px] sm:text-[26px] font-[cursive] font-bold text-[#d4af37] drop-shadow-md capitalize pb-[1px]" style={{ fontFamily: '"Great Vibes", cursive' }}>Signature</span>
            </div>
          ) : <div />}
          
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[16px] sm:text-[22px] font-black text-white/40 tracking-tighter select-none">Lxwyer Up</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end z-20">
          <div className="flex justify-between items-end w-full">
            <div className="text-white overflow-hidden pr-2 transition-all duration-300 group-hover:max-w-[50%]">
              <h3 className="text-[18px] sm:text-[22px] font-extrabold text-[#f0f4ff] tracking-tight leading-tight mb-1 truncate">
                {lawyer.name}
              </h3>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: themeColor }} />
                <span className="truncate text-[13px] font-medium text-[#cbd5e1]">{lawyer.city || lawyer.state || '—'}</span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-end">
               {/* Buttons moved to bottom */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with trail details */}
      <div className="p-3 sm:p-5 z-10 relative bg-[#040404]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="font-bold text-[12px] sm:text-[14px] leading-tight sm:leading-normal" style={{ color: themeColor }}>
              {lawyer.specialization || d.legalExpert}
            </p>
            <p className="text-[10px] sm:text-[12px] text-[#94a3b8] mt-0.5 font-medium">
              {lawyer.experience} {d.yr} {d.exp}
            </p>
          </div>
          
          {lawyer.verified && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
               <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
               <span className="text-[8px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{d.verified}</span>
            </div>
          )}
        </div>

        {lawyer.catchphrase && (
          <p className="text-[10px] sm:text-[12px] italic text-[#64748b] mt-2 sm:mt-3 line-clamp-2 leading-relaxed">
            "{lawyer.catchphrase}"
          </p>
        )}

        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="flex justify-between items-center px-2 mt-4">
          <StatItem label={d.fee30m} value={fee30 ? `₹${fee30}` : (fallback || '—')} />
          <div className="w-px h-6 bg-white/10" />
          <StatItem label={d.courts} value={courts.length > 0 ? `${courts[0]}${courts.length > 1 ? ` + ${courts.length - 1} more` : ''}` : '—'} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onProfileClick(lawyer); }}
            className={cn(
              "w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-colors text-[10px] sm:text-sm h-8 sm:h-9 px-1 sm:px-3",
              isSignature && "hover:bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]"
            )}
          >
            <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {d.profile}
          </Button>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onBookClick(lawyer); }}
            className={cn(
              "w-full rounded-xl border-0 shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all text-[10px] sm:text-sm h-8 sm:h-9 px-1 sm:px-3",
              isSignature 
                ? "bg-gradient-to-r from-[#d4af37] to-[#b5952f] text-black hover:from-[#e5bd3d] hover:to-[#c5a336]" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
            )}
          >
            {d.bookConsultation}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

LawyerCard.displayName = "LawyerCard";

export default memo(LawyerCard);
