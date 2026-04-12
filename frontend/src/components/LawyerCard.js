import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Eye, Sparkles, Scale, ShieldCheck } from 'lucide-react';
import { getInitials } from '../utils/lawyerPhoto';
import { useLang } from '../context/LanguageContext';

const TEXT = {
  en: {
    verified: 'Verified',
    legalExpert: 'Legal Expert',
    yr: 'yr',
    exp: 'Exp.',
    location: 'Location',
    profile: 'Profile',
    bookConsultation: 'Book Consultation',
  },
  hi: {
    verified: 'सत्यापित',
    legalExpert: 'कानूनी विशेषज्ञ',
    yr: 'वर्ष',
    exp: 'अनुभव',
    location: 'स्थान',
    profile: 'प्रोफ़ाइल',
    bookConsultation: 'परामर्श बुक करें',
  }
};

/* ── Specialization → professional banner color ── */
const SPEC_COLORS = {
  // All cards will use professional shades of blue, slate, black, and white
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

const DEFAULT_COLOR = { from: '#0a1020', to: '#162040', accent: '#60a5fa' };

function getColors(spec = '') {
  const key = spec.toLowerCase().trim();
  return SPEC_COLORS[key] || DEFAULT_COLOR;
}

function LawyerCard({ lawyer, index = 0, onProfileClick, onBookClick }) {
  const { lang } = useLang();
  const d = TEXT[lang] || TEXT.en;
  const hasPhoto = !!(lawyer.photo && lawyer.photo.length > 5);
  const colors   = getColors(lawyer.specialization);

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

  const courts = (lawyer.court_experience || lawyer.courts || [])
    .slice(0, 2)
    .map(c => (typeof c === 'object' ? c.court_name : c))
    .filter(Boolean);
  const tags = courts.length ? courts : [];

  if (lawyer.isSignature) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.04 }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        style={{
          background: '#040404',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.05)',
          willChange: 'transform',
          minHeight: 420,
          position: 'relative',
        }}
      >
        {/* Animated Gold Shimmer Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.03) 50%, transparent 100%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        {/* ════ PREMIUM BANNER ════ */}
        <div style={{
          height: 120,
          background: `linear-gradient(135deg, #0a0a0a 0%, #151515 100%)`,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
        }}>
          {/* Subtle Cursive Watermark */}
          <span style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-5deg)',
            fontSize: 52,
            color: 'rgba(212, 175, 55, 0.04)',
            userSelect: 'none', pointerEvents: 'none',
            whiteSpace: 'nowrap',
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontWeight: 700
          }}>
            Signature
          </span>

          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Verified Shield Badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            fontSize: 10, fontWeight: 800, color: '#d4af37',
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            <ShieldCheck size={12} strokeWidth={2.5} />
            SIGNATURE
          </div>
        </div>

        {/* ════ PREMIUM AVATAR ROW ════ */}
        <div style={{
          padding: '0 20px',
          marginTop: -45,
          marginBottom: 10,
          zIndex: 2,
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          {/* Avatar Base */}
          <div style={{
            width: 80, height: 80, borderRadius: '25%',
            border: `2px solid rgba(212, 175, 55, 0.6)`,
            outline: '4px solid #040404',
            overflow: 'hidden', flexShrink: 0,
            background: `#111`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.2) inset`,
            transform: 'rotate(-3deg)',
            transition: 'transform 0.3s ease',
          }}>
            <div style={{ transform: 'rotate(3deg)', width: '100%', height: '100%' }}>
              {hasPhoto ? (
                <img
                  src={lawyer.photo}
                  alt={lawyer.name}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center 5%',
                    display: 'block',
                  }}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Initials fallback */}
              <div style={{
                width: '100%', height: '100%',
                display: hasPhoto ? 'none' : 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1f1f1f, #0a0a0a)'
              }}>
                <span style={{
                  fontSize: 30, fontWeight: 900,
                  color: '#d4af37',
                  letterSpacing: '-0.03em',
                }}>
                  {getInitials(lawyer.name)}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            marginBottom: 5 
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>Experience</p>
            <p style={{
              fontSize: 16, fontWeight: 900, color: '#d4af37',
            }}>{lawyer.experience} <span style={{ fontSize: 11, fontWeight: 600 }}>{d.yr}</span></p>
          </div>
        </div>

        {/* ════ CARD BODY ════ */}
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>

          {/* Name */}
          <h3 style={{
            fontSize: 20, fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontFamily: '"Playfair Display", serif'
          }}>
            {lawyer.name}
          </h3>

          <p style={{
            fontSize: 12, fontWeight: 600, marginBottom: 12,
            color: 'rgba(212, 175, 55, 0.9)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Scale size={13} style={{ opacity: 0.8 }} />
            {lawyer.specialization || d.legalExpert}
          </p>

          {/* Location & Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <MapPin size={12} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginRight: 6 }}>
              {lawyer.city}
            </span>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>
              {lawyer.languages?.[0] || 'English'}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 'auto', minHeight: 40 }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                padding: '3px 10px', borderRadius: 6,
                background: `rgba(212,175,55,0.08)`,
                border: `1px solid rgba(212,175,55,0.2)`,
                fontSize: 10, fontWeight: 600,
                color: '#d4af37',
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}>{t}</span>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ height: 16 }} />

          {/* Pricing area */}
          <div style={{
            padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Consultation (30m)</span>
              <span style={{ fontSize: 15, color: '#f0f4ff', fontWeight: 800 }}>
                {fee30 ? `₹${fee30.toLocaleString()}` : 'Custom'}
              </span>
            </div>
            {fee60 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Full Hour</span>
                <span style={{ fontSize: 13, color: '#a0aec0', fontWeight: 700 }}>
                  ₹{fee60.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onProfileClick && onProfileClick(lawyer)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: 'rgba(212, 175, 55, 0.1)',
                color: '#d4af37', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                border: '1px solid rgba(212, 175, 55, 0.3)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
            >
              <Eye size={14} /> {d.profile}
            </button>
            <button
              onClick={() => onBookClick && onBookClick(lawyer)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: 'linear-gradient(135deg, #d4af37 0%, #b5952f 100%)',
                color: '#000000', fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
              }}
              onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              {d.bookConsultation}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.04 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      style={{
        background: '#0b0f1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        willChange: 'transform',
        minHeight: 380,
      }}
    >
      {/* ════ BANNER ════ */}
      <div style={{
        height: 90,
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* "Lxwyer Up" watermark — centred & visible */}
        <span style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 28, fontWeight: 900,
          color: 'rgba(255,255,255,0.07)',
          letterSpacing: '-0.03em',
          userSelect: 'none', pointerEvents: 'none',
          whiteSpace: 'nowrap', lineHeight: 1,
          fontFamily: 'inherit',
        }}>
          Lxwyer Up
        </span>

        {/* Accent glow */}
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.accent}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Bottom fade to card bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, transparent 40%, ${colors.from}99 100%)`,
          pointerEvents: 'none',
        }} />

        {/* Verified badge */}
        {lawyer.verified && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            fontSize: 10, fontWeight: 700, color: '#34d399',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }} />
            {d.verified}
          </div>
        )}
      </div>

      {/* ════ AVATAR ROW ════ */}
      <div style={{
        padding: '0 16px',
        marginTop: -30,
        marginBottom: 8,
        zIndex: 2,
        position: 'relative',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: `2px solid ${colors.accent}60`,
          outline: '3px solid #0b0f1a',
          overflow: 'hidden', flexShrink: 0,
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px ${colors.accent}25`,
        }}>
          {hasPhoto ? (
            <img
              src={lawyer.photo}
              alt={lawyer.name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center 5%',
                display: 'block',
              }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Initials fallback */}
          <div style={{
            width: '100%', height: '100%',
            display: hasPhoto ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 26, fontWeight: 900,
              color: colors.accent,
              letterSpacing: '-0.03em',
              opacity: 0.85,
            }}>
              {getInitials(lawyer.name)}
            </span>
          </div>
        </div>
      </div>

      {/* ════ CARD BODY ════ */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Name */}
        <h3 style={{
          fontSize: 15, fontWeight: 800, color: '#f0f4ff',
          letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {lawyer.name}
        </h3>

        <p style={{
          fontSize: 11, fontWeight: 600, marginBottom: 10,
          color: colors.accent,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {lawyer.specialization || d.legalExpert}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                padding: '2px 8px', borderRadius: 999,
                background: `${colors.accent}14`,
                border: `1px solid ${colors.accent}30`,
                fontSize: 10, fontWeight: 600,
                color: colors.accent,
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Catchphrase */}
        {lawyer.catchphrase && (
          <p style={{
            fontSize: 12, fontStyle: 'italic', color: '#94a3b8',
            marginBottom: 10, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            "{lawyer.catchphrase}"
          </p>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Stats row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: 12,
        }}>
          {/* Experience */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.01em', lineHeight: 1 }}>
              {lawyer.experience}<span style={{ fontSize: 9, fontWeight: 600, color: '#475569', marginLeft: 2 }}>{d.yr}</span>
            </div>
            <div style={{ fontSize: 8, color: '#475569', fontWeight: 600, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.exp}</div>
          </div>

          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

          {/* Location */}
          <div style={{ flex: 1, textAlign: 'center', padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <MapPin style={{ width: 10, height: 10, color: colors.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                {lawyer.city || lawyer.state || '—'}
              </span>
            </div>
            <div style={{ fontSize: 9, color: '#475569', fontWeight: 600, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.location}</div>
          </div>

          {(fee30 || fallback) && (
            <>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: colors.accent, letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                  {fee30 ? <div>₹{fee30}/30m</div> : <div>{fallback}</div>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action row — Profile + Book side by side */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Profile button */}
          <button
            onClick={e => { e.stopPropagation(); onProfileClick(lawyer); }}
            style={{
              flex: '0 0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '11px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: `${colors.accent}15`,
              border: `1px solid ${colors.accent}40`,
              color: colors.accent,
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.18s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${colors.accent}25`; e.currentTarget.style.border = `1px solid ${colors.accent}60`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${colors.accent}15`; e.currentTarget.style.border = `1px solid ${colors.accent}40`; }}
          >
            <Eye style={{ width: 13, height: 13 }} />
            {d.profile}
          </button>

          {/* Book button — always professional blue */}
          <button
            onClick={e => { e.stopPropagation(); onBookClick(lawyer); }}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1d4ed8, #4338ca)',
              color: '#fff', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.02em', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(29,78,216,0.35)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#4f46e5)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(29,78,216,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#4338ca)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,78,216,0.35)'; }}
          >
            {d.bookConsultation}
            <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(LawyerCard);
