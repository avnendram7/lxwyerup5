import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Phone, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

/**
 * GoogleSignupButton
 *
 * Props:
 *  - onSuccess(googleData): called after Google auth + phone collected.
 *    googleData = { name, email, phone, picture, googleToken }
 *  - extraFields: optional array of extra field configs to show in the modal
 *    e.g. [{ key: 'case_type', label: 'Case Type', type: 'select', options: [...] }]
 *  - buttonLabel: optional label override (default: "Continue with Google")
 *  - theme: 'light' | 'dark' (default: 'light')
 */
export default function GoogleSignupButton({
    onSuccess,
    extraFields = [],
    buttonLabel = 'Continue with Google',
    theme = 'light',
}) {
    const [showModal, setShowModal] = useState(false);
    const [googleProfile, setGoogleProfile] = useState(null);
    const [phone, setPhone] = useState('');
    const [extras, setExtras] = useState(() =>
        Object.fromEntries(extraFields.map(f => [f.key, f.defaultValue || '']))
    );
    const [modalLoading, setModalLoading] = useState(false);

    const isDark = theme === 'dark';

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch user info from Google
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                setGoogleProfile({
                    name: res.data.name,
                    email: res.data.email,
                    picture: res.data.picture,
                    accessToken: tokenResponse.access_token,
                });
                setShowModal(true);
            } catch (err) {
                toast.error('Failed to fetch Google profile. Please try again.');
            }
        },
        onError: () => {
            toast.error('Google Sign-in failed. Please try again.');
        },
    });

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!phone.trim()) {
            toast.error('Please enter your phone number');
            return;
        }
        for (const field of extraFields) {
            if (field.required && !extras[field.key]) {
                toast.error(`Please fill in ${field.label}`);
                return;
            }
        }
        setModalLoading(true);
        try {
            await onSuccess({
                name: googleProfile.name,
                email: googleProfile.email,
                picture: googleProfile.picture,
                phone,
                ...extras,
                accessToken: googleProfile.accessToken,
            });
            setShowModal(false);
        } catch (err) {
            // error handled by parent
        } finally {
            setModalLoading(false);
        }
    };

    const inputCls = isDark
        ? 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
        : 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

    const labelCls = isDark
        ? 'block text-sm font-medium text-slate-300 mb-2'
        : 'block text-sm font-semibold text-slate-700 mb-2';

    return (
        <>
            {/* Google Button */}
            <button
                type="button"
                onClick={() => googleLogin()}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-800 bg-[#0A0F1C] hover:bg-[#111827] text-white font-semibold transition-all shadow-md focus:ring-2 focus:ring-blue-500/50 text-sm`}
            >
                {/* Google SVG Icon */}
                <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                {buttonLabel}
            </button>

            {/* Phone / Extra Fields Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                        {/* Google Profile Preview */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                            {googleProfile?.picture && (
                                <img src={googleProfile.picture} alt={googleProfile.name} className="w-12 h-12 rounded-full" />
                            )}
                            <div>
                                <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{googleProfile?.name}</p>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{googleProfile?.email}</p>
                            </div>
                        </div>

                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>One more step</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Please provide the following to complete your signup.</p>

                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            {/* Phone */}
                            <div>
                                <label className={labelCls}>Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className={`${inputCls} pl-10`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Extra dynamic fields */}
                            {extraFields.map(field => (
                                <div key={field.key}>
                                    <label className={labelCls}>{field.label}{field.required ? ' *' : ''}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            value={extras[field.key]}
                                            onChange={e => setExtras(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className={inputCls}
                                            required={field.required}
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            value={extras[field.key]}
                                            onChange={e => setExtras(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            className={inputCls}
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={modalLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2"
                            >
                                {modalLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
                                ) : (
                                    <>Complete Sign Up <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className={`w-full text-sm py-2 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
