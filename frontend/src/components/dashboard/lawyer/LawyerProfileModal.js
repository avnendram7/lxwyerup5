
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera, LogOut, Mail, GraduationCap, Briefcase, Edit2, Ban,
    ArrowRight, Video, Users, CheckCircle, MapPin, Award, Shield, Globe, Phone
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../../../App';

// Single blue gradient for all profiles
function getGradient(str = '') {
    return { from: '#1e40af', to: '#4f46e5' };
}

const InfoTile = ({ icon: Icon, label, value, accent, dm }) => (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${dm ? 'bg-white/5 border-white/8' : 'bg-slate-50 border-slate-100'} hover:scale-[1.01] transition-transform`}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}22` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0">{label}</p>
            <p className={`text-sm font-semibold truncate ${dm ? 'text-slate-200' : 'text-slate-800'}`}>{value || '—'}</p>
        </div>
    </div>
);

export default function LawyerProfileModal({ user: initialUser, onClose, onLogout, onImageUpdate, darkMode: dm, allowEditing = true, onBook }) {
    const fileInputRef = useRef(null);
    const [imgError, setImgError] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState(initialUser?.bio || '');
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState(initialUser?.consultation_preferences || 'video');
    const [savingPrefs, setSavingPrefs] = useState(false);
    
    // Slot state
    const [availableSlots, setAvailableSlots] = useState(initialUser?.available_slots || []);
    const [savingSlots, setSavingSlots] = useState(false);

    // Once-a-week timing change guard
    const timingKey = `timing_last_change_${initialUser?.id || 'self'}`;
    const getTimingLockInfo = () => {
        const last = localStorage.getItem(timingKey);
        if (!last) return { locked: false, daysLeft: 0 };
        const diff = Date.now() - parseInt(last, 10);
        const daysLeft = Math.ceil((7 * 86400000 - diff) / 86400000);
        return { locked: diff < 7 * 86400000, daysLeft: Math.max(0, daysLeft) };
    };
    const [timingLock, setTimingLock] = useState(getTimingLockInfo);

    // Deactivation state
    const [showDeactivate, setShowDeactivate] = useState(false);
    const [deactivateReason, setDeactivateReason] = useState('');
    const [deactivating, setDeactivating] = useState(false);

    useEffect(() => {
        if (allowEditing) {
            const fetchUser = async () => {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                    setUser(res.data);
                    setBioText(res.data.bio || '');
                    setPreferences(res.data.consultation_preferences || 'video');
                } catch (e) { console.error(e); }
            };
            fetchUser();
        }
    }, [allowEditing]);

    const photoEditsLeft = 3 - (user?.photo_edit_count || 0);
    const wordCount = bioText.trim().length === 0 ? 0 : bioText.trim().split(/\s+/).length;
    const isOverLimit = wordCount > 300;

    const handleSaveBio = async () => {
        if (isOverLimit) { toast.error('Bio exceeds 300-word limit.'); return; }
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${API}/auth/me`, { bio: bioText }, { headers: { Authorization: `Bearer ${token}` } });
            setUser(prev => ({ ...prev, bio: res.data.bio }));
            toast.success('Profile updated!');
            setIsEditing(false);
        } catch (e) { toast.error(e.response?.data?.detail || 'Failed to update profile'); }
        finally { setLoading(false); }
    };

    const handleSavePreferences = async (newPref) => {
        setPreferences(newPref); setSavingPrefs(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${API}/lawyers/me/consultation_preferences`, { preferences: newPref }, { headers: { Authorization: `Bearer ${token}` } });
            setUser(prev => ({ ...prev, consultation_preferences: res.data.consultation_preferences }));
            toast.success('Preferences saved!');
        } catch (e) { toast.error(e.response?.data?.detail || 'Failed to update'); }
        finally { setSavingPrefs(false); }
    };

    const handleToggleSlot = async (slot) => {
        if (!allowEditing) return;
        if (timingLock.locked) {
            toast.error(`You can only change timings once a week. Try again in ${timingLock.daysLeft} day${timingLock.daysLeft !== 1 ? 's' : ''}.`);
            return;
        }
        const newSlots = availableSlots.includes(slot)
            ? availableSlots.filter(s => s !== slot)
            : [...availableSlots, slot];

        setAvailableSlots(newSlots);
        setSavingSlots(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${API}/lawyers/me/availability`, { slots: newSlots }, { headers: { Authorization: `Bearer ${token}` } });
            setUser(prev => ({ ...prev, available_slots: res.data.available_slots }));
            // Record timing change timestamp
            localStorage.setItem(timingKey, Date.now().toString());
            setTimingLock(getTimingLockInfo());
            toast.success('Availability updated! You can change timings again in 7 days.');
        } catch (e) {
            toast.error(e.response?.data?.detail || 'Failed to update slots');
            setAvailableSlots(availableSlots); // Revert on error
        }
        finally { setSavingSlots(false); }
    };

    const handleDeactivate = async () => {
        if (!deactivateReason.trim()) { toast.error('Please provide a reason'); return; }
        setDeactivating(true);
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${API}/lawyers/me/deactivate`, { reason: deactivateReason }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Deactivation request submitted. It will be reviewed by admins.');
            setShowDeactivate(false);
            if (onLogout) onLogout(); 
        } catch (e) { toast.error(e.response?.data?.detail || 'Failed to submit request'); }
        finally { setDeactivating(false); }
    };

    const handlePhotoClick = () => {
        if (photoEditsLeft > 0) fileInputRef.current?.click();
        else toast.error('You have reached the photo update limit.');
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        e.target.value = null;
        const formData = new FormData(); formData.append('file', file);
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${API}/lawyers/me/photo`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setUser(prev => ({ ...prev, photo: res.data.photo_url, photo_edit_count: res.data.photo_edit_count }));
            if (onImageUpdate) onImageUpdate(res.data.photo_url);
            toast.success('Photo updated!');
        } catch (e) { toast.error(e.response?.data?.detail || 'Failed to update photo'); }
        finally { setLoading(false); }
    };

    const displayName = user?.full_name || user?.name || 'Lawyer';
    const grad = getGradient(displayName);

    const photoSrc = user?.photo && !imgError
        ? (user.photo.startsWith('http') || user.photo.startsWith('data:') ? user.photo : `http://localhost:8000${user.photo}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${grad.from.replace('#', '')}&color=fff&size=200`;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 28 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 28 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className={`relative w-full max-w-md rounded-[2rem] shadow-2xl flex flex-col max-h-[88vh] ${dm ? 'bg-[#0d0f14] border border-white/8' : 'bg-white border border-slate-100'}`}
                >
                    {/* --- HERO HEADER --- */}
                    <div className="relative h-36 shrink-0 overflow-hidden rounded-t-[2rem]"
                        style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
                        {/* Diagonal texture */}
                        <div className="absolute inset-0 opacity-[0.07]"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '14px 14px' }} />
                        {/* LXWYER UP watermark */}
                        <span className="absolute top-4 right-5 text-white/15 font-black text-xl tracking-[0.25em] uppercase select-none">LXWYER UP</span>
                        {/* Decorative blobs */}
                        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
                        <div className="absolute -top-4 right-16 w-20 h-20 rounded-full bg-white/5" />

                        {/* Close */}
                        <button onClick={onClose}
                            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-sm">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Profile photo — outside hero so overflow-hidden doesn't clip it */}
                    <div className="flex justify-center" style={{ marginTop: '-40px', marginBottom: '0px', position: 'relative', zIndex: 20 }}>
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#0d0f14] shadow-xl bg-slate-100">
                                <img src={photoSrc} alt={displayName} className="w-full h-full object-cover"
                                    onError={() => setImgError(true)} />
                                {allowEditing && photoEditsLeft > 0 && (
                                    <div onClick={handlePhotoClick}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>
                            {/* Camera badge */}
                            {allowEditing && (
                                <button onClick={handlePhotoClick}
                                    title={photoEditsLeft > 0 ? `Update photo (${photoEditsLeft} left)` : 'No updates left'}
                                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${dm ? 'border-[#0d0f14]' : 'border-white'} shadow ${photoEditsLeft > 0 ? 'bg-blue-500 cursor-pointer hover:bg-blue-600 text-white' : 'bg-slate-500 cursor-not-allowed text-slate-300'}`}>
                                    {photoEditsLeft > 0 ? <Camera className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Hidden file input */}
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoChange} className="hidden" />

                    {/* --- SCROLLABLE BODY --- */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5 pt-4">

                        {/* Name + role */}
                        <div className="text-center mb-5">
                            <div className="flex items-center justify-center gap-2 flex-wrap mb-1">
                                <h2 className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{displayName}</h2>
                                {user?.is_verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <CheckCircle className="w-3 h-3" /> Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-semibold" style={{ color: grad.from }}>{user?.specialization || 'Legal Professional'}</p>
                            {user?.unique_id && (
                                <span className={`text-[10px] font-mono mt-1 inline-block px-2 py-0.5 rounded-full border ${dm ? 'bg-white/5 text-slate-400 border-white/8' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    #{user.unique_id}
                                </span>
                            )}

                            {/* ── Lawyer Type Badge ── */}
                            {(() => {
                                const at = user?.application_type || user?.applicationType || [];
                                const hasSOS = at.includes('sos');
                                const hasNormal = at.includes('normal');
                                const isBoth = hasSOS && hasNormal;
                                const isSosOnly = hasSOS && !hasNormal;
                                return (
                                    <div className="mt-2 flex justify-center">
                                        {isBoth ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                                ⚡ Normal + SOS Lawyer
                                            </span>
                                        ) : isSosOnly ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                                🆘 SOS Only Lawyer
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                ⚖️ Normal Lawyer
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}

                            {allowEditing && (
                                <p className="text-[10px] text-slate-400 mt-1">{photoEditsLeft} photo edits remaining</p>
                            )}
                        </div>

                        {/* Info tiles */}
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            {user?.city && <InfoTile icon={MapPin} label="Location" value={`${user.city}${user.state ? `, ${user.state}` : ''}`} accent={grad.from} dm={dm} />}
                            {user?.experience_years && <InfoTile icon={Briefcase} label="Experience" value={`${user.experience_years} Years`} accent={grad.to} dm={dm} />}
                            {user?.primary_court && <div className="col-span-2"><InfoTile icon={Scale} label="Primary Court" value={user.primary_court} accent="#eab308" dm={dm} /></div>}
                            {user?.education && <div className="col-span-2"><InfoTile icon={GraduationCap} label="Education" value={user.education} accent="#8b5cf6" dm={dm} /></div>}
                            {allowEditing && user?.email && <div className="col-span-2"><InfoTile icon={Mail} label="Email" value={user.email} accent="#0ea5e9" dm={dm} /></div>}
                        </div>
                        
                        {/* Detailed Courts */}
                        {user?.detailed_court_experience && user.detailed_court_experience.length > 0 && (
                            <div className="mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                        <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#eab308' }} />
                                        Detailed Court Experience
                                    </span>
                                </div>
                                <div className={`p-4 rounded-2xl border ${dm ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex flex-wrap gap-2">
                                        {user.detailed_court_experience.map((courtExp, idx) => (
                                            <div key={idx} className={`flex items-center text-xs font-semibold rounded-lg overflow-hidden border ${dm ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-slate-200'}`}>
                                                <span className={`px-2.5 py-1.5 ${dm ? 'text-slate-200' : 'text-slate-700'}`}>
                                                    {courtExp.court_name}
                                                </span>
                                                <span className={`px-2 py-1.5 border-l ${dm ? 'bg-black/20 text-slate-400 border-[#333]' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                    {courtExp.years}y
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* About / Bio */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: grad.from }} />
                                    About
                                </span>
                                {allowEditing && !isEditing && (
                                    <button onClick={() => setIsEditing(true)}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                )}
                            </div>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Textarea value={bioText} onChange={e => setBioText(e.target.value)}
                                        className={`min-h-[90px] rounded-xl text-sm ${dm ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        placeholder="Tell clients about your practice..." />
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] ${isOverLimit ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{wordCount}/300 words</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                            <button onClick={handleSaveBio} disabled={loading || isOverLimit}
                                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
                                                {loading ? 'Saving…' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`rounded-2xl p-4 border ${dm ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-100'}`}>
                                    <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {user?.bio || 'No bio yet. Add one to help clients know you better.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Achievements */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: grad.to }} />
                                    Achievements & Milestones
                                </span>
                            </div>

                            {!user?.achievements || !Array.isArray(user.achievements) || user.achievements.length === 0 ? (
                                <div className={`rounded-2xl p-6 text-center border ${dm ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-100'}`}>
                                    <Award className={`w-8 h-8 mx-auto mb-2 opacity-30 ${dm ? 'text-slate-400' : 'text-slate-500'}`} />
                                    <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                                        No achievements listed.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[...user.achievements].sort((a, b) => b.pinned - a.pinned).map(ach => (
                                        <div key={ach.id}
                                            className={`rounded-2xl border p-4 flex gap-3 relative overflow-hidden transition-all ${
                                                ach.pinned
                                                    ? dm ? 'bg-gradient-to-r from-[#001a0a] to-[#000f05] border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
                                                    : dm ? 'bg-white/[0.03] border-white/8' : 'bg-white border-slate-100'
                                            }`}
                                        >
                                            {ach.photo ? (
                                                <img src={ach.photo.startsWith('http') || ach.photo.startsWith('data:') ? ach.photo : `${API.replace('/api', '')}${ach.photo}`} alt="achievement" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-emerald-500/20" />
                                            ) : (
                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${dm ? 'bg-emerald-900/20' : 'bg-emerald-100'}`}>
                                                    <Award className="w-8 h-8 text-emerald-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <p className={`font-bold text-sm leading-tight break-words ${dm ? 'text-white' : 'text-slate-800'}`}>
                                                        {ach.title}
                                                    </p>
                                                    {ach.pinned && (
                                                        <span className="shrink-0 flex text-[9px] font-bold text-emerald-500 tracking-wider uppercase">
                                                            Pinned
                                                        </span>
                                                    )}
                                                </div>
                                                {ach.date && (
                                                    <p className={`text-[11px] font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {ach.date}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Consultation Preferences (own profile only) */}
                        {allowEditing && (
                            <div className="mb-5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Consultation Preference</span>
                                <div className={`p-1.5 rounded-2xl flex gap-1 border ${dm ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-100'}`}>
                                    {[
                                        { key: 'video', label: 'Video', icon: Video },
                                        { key: 'in_person', label: 'In-Person', icon: Briefcase },
                                        { key: 'both', label: 'Both', icon: Users },
                                    ].map(({ key, label, icon: Icon }) => (
                                        <button key={key}
                                            onClick={() => handleSavePreferences(key)}
                                            disabled={savingPrefs}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${preferences === key
                                                ? 'text-white shadow-md'
                                                : dm ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-white'
                                                }`}
                                            style={preferences === key ? { background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` } : {}}>
                                            <Icon className="w-3.5 h-3.5" /> {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Availability Slots — editable for own profile, read-only for viewers */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: grad.from }} />
                                    Available Timings
                                </span>
                                {allowEditing && timingLock.locked && (
                                    <span className="text-[9px] font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                        🔒 Change in {timingLock.daysLeft}d
                                    </span>
                                )}
                            </div>
                            <div className={`p-4 rounded-2xl border ${dm ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-100'}`}>
                                {availableSlots.length === 0 && !allowEditing ? (
                                    <p className={`text-xs text-center py-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>No timings set yet.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']).map(slot => {
                                            const isAvail = availableSlots.includes(slot);
                                            if (!allowEditing && !isAvail) return null;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => allowEditing && handleToggleSlot(slot)}
                                                    disabled={savingSlots || (!allowEditing)}
                                                    title={allowEditing && timingLock.locked ? `Locked for ${timingLock.daysLeft} more day(s)` : ''}
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                                                        isAvail
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : dm ? 'bg-white/5 border-white/10 text-slate-300 hover:border-blue-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                                                    } ${!allowEditing ? 'cursor-default' : ''}`}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {allowEditing && (
                                    <p className={`text-[10px] mt-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {timingLock.locked
                                            ? `⏳ Next change allowed in ${timingLock.daysLeft} day${timingLock.daysLeft !== 1 ? 's' : ''}.`
                                            : 'Select the hours you are generally available. Changes allowed once per week.'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Book Consultation (read-only viewer) */}
                        {!allowEditing && onBook && (
                            <button onClick={() => onBook(user)}
                                className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md mb-3"
                                style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}>
                                Book Consultation <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                        
                        {/* Temporary Deactivation */}
                        {allowEditing && (
                            <div className="mb-4">
                                {!showDeactivate ? (
                                    <button onClick={() => setShowDeactivate(true)}
                                        className="w-full py-3 rounded-2xl text-sm font-semibold text-orange-500 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 flex items-center justify-center gap-2 transition-colors">
                                        <Ban className="w-4 h-4" /> Request Account Deactivation
                                    </button>
                                ) : (
                                    <div className={`p-4 rounded-2xl border ${dm ? 'bg-orange-950/20 border-orange-900/50' : 'bg-orange-50 border-orange-200'}`}>
                                        <p className="text-xs font-bold text-orange-500 mb-2">Why are you deactivating?</p>
                                        <Textarea 
                                            value={deactivateReason} 
                                            onChange={(e) => setDeactivateReason(e.target.value)}
                                            placeholder="Moving, busy schedule, etc..."
                                            className={`min-h-[60px] text-xs mb-3 ${dm ? 'bg-black/20 border-orange-900/30 text-white' : 'bg-white border-orange-200 text-slate-800'}`}
                                        />
                                        <div className="flex gap-2">
                                            <Button onClick={() => setShowDeactivate(false)} variant="ghost" size="sm" className="flex-1 text-xs h-8">Cancel</Button>
                                            <Button onClick={handleDeactivate} disabled={deactivating} size="sm" className="flex-1 text-xs h-8 bg-orange-600 hover:bg-orange-700 text-white">
                                                {deactivating ? 'Submitting...' : 'Submit Request'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Logout (own profile) */}
                        {allowEditing && onLogout && (
                            <button onClick={onLogout}
                                className="w-full py-3 rounded-2xl text-sm font-semibold text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
