import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const LOCAL_TEXT_FIRM = {
  en: {
    lawFirm: 'Law Firm',
    lawyers: 'lawyers',
    details: 'Details',
    bookNow: 'Book Now'
  },
  hi: {
    lawFirm: 'लॉ फर्म',
    lawyers: 'वकील',
    details: 'विवरण',
    bookNow: 'अभी बुक करें'
  }
};

export default function FirmCard({ firm, onBook, onDetails, index = 0, dm = true }) {
  const { lang } = useLang();
  const d = LOCAL_TEXT_FIRM[lang] || LOCAL_TEXT_FIRM.en;
  // Safe defaults
  const name = firm.name || firm.firm_name || d.lawFirm;
  const city = firm.city || '';
  const state = firm.state || '';
  const lawyersCount = firm.lawyersCount || firm.total_lawyers || 0;
  const practiceAreas = firm.practiceAreas || firm.practice_areas || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-3xl overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer 
        ${dm ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
      onClick={() => onDetails && onDetails(firm)}
    >
      {/* Header */}
      <div className={`relative h-24 bg-gradient-to-b ${dm ? 'from-slate-800 to-black' : 'from-slate-100 to-slate-200'}`}>
        <div className={`absolute inset-0 ${dm ? 'opacity-[0.06]' : 'opacity-20'}`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, gray 0, gray 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <span className={`absolute top-2 right-3 font-black text-xs tracking-widest uppercase select-none ${dm ? 'text-white/10' : 'text-black/10'}`}>LXWYER UP</span>
        <div className="absolute bottom-3 left-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg ring-4 ring-slate-900">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className={`font-bold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{name}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {city}{state ? `, ${state}` : ''}
            </p>
          </div>
          {lawyersCount > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
              {lawyersCount} {d.lawyers}
            </span>
          )}
        </div>

        {/* Practice areas */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {practiceAreas.slice(0, 3).map((area, i) => (
            <span key={i} className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-900/30 text-indigo-400 border border-indigo-800/40">
              {area}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDetails && onDetails(firm); }}
            className={`py-2 rounded-xl border text-xs font-semibold transition-colors 
              ${dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
          >
            {d.details}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onBook && onBook(firm); }}
            className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20"
          >
            {d.bookNow} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
