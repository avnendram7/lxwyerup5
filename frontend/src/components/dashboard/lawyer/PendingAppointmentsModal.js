
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Check, AlertCircle, XCircle, RefreshCw, User } from 'lucide-react';
import { Button } from '../../ui/button';

const PendingAppointmentsModal = ({ isOpen, onClose, bookings, onAccept, onDecline, onReschedule, darkMode }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`relative w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden z-[70] flex flex-col max-h-[85vh] 
              ${darkMode
                                ? 'bg-[#1a1b1e] border border-white/10 shadow-black/50'
                                : 'bg-white border border-white/50 shadow-xl ring-1 ring-slate-900/5'
                            }`}
                    >
                        {/* Header with blurred background */}
                        <div className={`p-6 pb-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md 
              ${darkMode ? 'bg-[#1a1b1e]/80 border-b border-white/5' : 'bg-white/80 border-b border-slate-100'}`}>
                            <div>
                                <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    New Requests
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`flex h-2 w-2 rounded-full ${bookings.length > 0 ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {bookings.length} pending appointment{bookings.length !== 1 && 's'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95
                  ${darkMode
                                        ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                                        : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {bookings.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg 
                    ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/50' : 'bg-gradient-to-br from-slate-50 to-white shadow-slate-200'}`}>
                                        <Check className={`w-10 h-10 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                                    </div>
                                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>All Caught Up!</h3>
                                    <p className={`text-sm max-w-xs mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        You have no pending appointment requests at the moment.
                                    </p>
                                </div>
                            ) : (
                                bookings.map((booking, index) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`rounded-2xl p-5 border transition-all duration-300 group
                      ${darkMode
                                                ? 'bg-[#25262b] border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10'
                                                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                                            }`}
                                    >
                                        {/* Card Header: User Info & Status */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm
                          ${darkMode
                                                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/20'
                                                        : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border border-blue-200/50'
                                                    }`}>
                                                    {booking.client_name?.[0] || booking.fullName?.[0] || <User className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {booking.client_name || booking.fullName || 'Client Name'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium
                              ${darkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                            {booking.service_type || booking.consultationType || 'Consultation'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Badge */}
                                            <div className={`flex flex-col items-end text-xs font-semibold px-3 py-1.5 rounded-lg border
                        ${darkMode ? 'bg-black/20 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                <span className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                    {booking.date}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-blue-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {booking.time}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions Grid */}
                                        <div className="grid grid-cols-3 gap-3 mt-4">
                                            <Button
                                                onClick={() => onAccept(booking.id)}
                                                className="col-span-1 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 h-10 rounded-xl transition-all hover:-translate-y-0.5"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span className="text-sm font-semibold">Accept</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => onReschedule(booking)}
                                                className={`col-span-1 h-10 rounded-xl gap-2 flex items-center justify-center transition-all hover:-translate-y-0.5
                          ${darkMode
                                                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
                                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                <span className="text-sm font-medium">Reschedule</span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                onClick={() => onDecline(booking.id)}
                                                className="col-span-1 h-10 rounded-xl gap-2 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Decline</span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`p-4 border-t text-center text-xs font-medium backdrop-blur-md
              ${darkMode ? 'bg-[#1a1b1e]/80 border-white/5 text-slate-500' : 'bg-white/80 border-slate-100 text-slate-400'}`}>
                            Review carefully. Accepted bookings sync instantly.
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PendingAppointmentsModal;
