
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, LogOut, Mail, GraduationCap, Briefcase, Edit2, Ban, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../../../App';

export default function LawyerProfileModal({ user: initialUser, onClose, onLogout, onImageUpdate, darkMode, allowEditing = true, onBook }) {
    const fileInputRef = useRef(null);
    const [imgError, setImgError] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState(initialUser?.bio || '');
    const [loading, setLoading] = useState(false);

    // Fetch fresh user data to get accurate edit counts ONLY if editing is allowed
    useEffect(() => {
        if (allowEditing) {
            const fetchUser = async () => {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await axios.get(`${API}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log("Fetched user data:", res.data);
                    setUser(res.data);
                    setBioText(res.data.bio || '');
                } catch (error) {
                    console.error("Failed to fetch fresh user data", error);
                }
            };
            fetchUser();
        }
    }, [allowEditing]);

    const photoEditsLeft = 3 - (user?.photo_edit_count || 0);

    // Calculate word count
    const wordCount = bioText.trim().length === 0 ? 0 : bioText.trim().split(/\s+/).length;
    const isOverLimit = wordCount > 300;

    const handleSaveBio = async () => {
        if (isOverLimit) {
            toast.error("Bio exceeds the 300-word limit.");
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${API}/lawyers/me/bio`, { bio: bioText }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(prev => ({
                ...prev,
                bio: res.data.bio,
                bio_edit_count: res.data.bio_edit_count
            }));

            toast.success("Bio updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to update bio");
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoClick = () => {
        if (photoEditsLeft > 0) {
            fileInputRef.current?.click();
        } else {
            toast.error("You have reached the limit of profile photo updates.");
        }
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-md ${darkMode ? 'bg-[#0b0c0f] border-white/10' : 'bg-white border-slate-200'} border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="px-6 pb-6 flex-1 overflow-y-auto no-scrollbar relative mt-12">
                        {/* Profile Image */}
                        <div className="relative mb-4 flex justify-center">
                            <div className="relative group">
                                <div className={`w-28 h-28 rounded-full p-1 ${darkMode ? 'bg-[#0b0c0f]' : 'bg-white'}`}>
                                    <div className={`w-full h-full rounded-full overflow-hidden border-4 ${darkMode ? 'border-[#0b0c0f]' : 'border-white'} relative shadow-lg`}>
                                        <img
                                            src={user?.photo && !imgError
                                                ? (user.photo.startsWith('http') || user.photo.startsWith('data:') ? user.photo : `http://localhost:8000${user.photo}`)
                                                : `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                        {/* Hover Overlay - Only if editing allowed */}
                                        {allowEditing && photoEditsLeft > 0 && (
                                            <div
                                                onClick={handlePhotoClick}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                            >
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Indicator - Only if editing allowed */}
                                {allowEditing && (
                                    <div
                                        onClick={handlePhotoClick}
                                        className={`absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center border-4 ${darkMode ? 'border-[#0b0c0f]' : 'border-white'} transition-all transform group-hover:scale-110 ${photoEditsLeft > 0 ? 'bg-blue-500 cursor-pointer hover:bg-blue-600 shadow-lg text-white' : 'bg-gray-700 cursor-not-allowed text-gray-400'}`}
                                        title={photoEditsLeft > 0 ? `Update Photo (${photoEditsLeft} left)` : "No updates left"}
                                    >
                                        {photoEditsLeft > 0 ? <Camera className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-2 mb-6">
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1.5`}>{user?.full_name}</h2>
                            <div className="flex items-center justify-center gap-2">
                                {user?.unique_id && (
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${darkMode ? 'bg-white/5 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {user.unique_id}
                                    </span>
                                )}
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium tracking-wide">
                                    LAWYER
                                </span>
                            </div>
                            <div className="mt-2 text-[10px] text-slate-500 font-medium">
                                {photoEditsLeft} photo updates left
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">About</label>
                                {allowEditing && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={bioText}
                                        onChange={(e) => setBioText(e.target.value)}
                                        className={`min-h-[100px] focus:ring-blue-500/50 rounded-xl text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 border'}`}
                                        placeholder="Tell us about your experience..."
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] ${isOverLimit ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                            {wordCount}/300 words
                                        </span>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white h-8 text-xs">
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleSaveBio} disabled={loading || isOverLimit} className="bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs rounded-lg">
                                                {loading ? 'Saving...' : 'Save Bio'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap font-light ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {user?.bio || "No bio available. Add a bio to help clients know you better."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Details List */}
                        <div className="space-y-2.5 mb-8">
                            <div className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-colors group ${darkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Email</p>
                                    <p className={`text-sm truncate font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{user?.email}</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-colors group ${darkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Specialization</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{user?.specialization || 'General Practice'}</p>
                                </div>
                            </div>

                            {user?.education && (
                                <div className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-colors group ${darkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Education</p>
                                        <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{user.education}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Book Consultation Button - Only if read-only (viewing other profile) */}
                        {!allowEditing && onBook && (
                            <Button
                                onClick={() => onBook(user)}
                                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 mt-auto rounded-xl transition-all hover:scale-[1.02]"
                            >
                                Book Consultation <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}

                        {/* Logout Button - Only if editing allowed (implies it's the current user) */}
                        {allowEditing && onLogout && (
                            <Button
                                onClick={onLogout}
                                variant="destructive"
                                className="w-full h-11 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 mt-auto rounded-xl"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}

