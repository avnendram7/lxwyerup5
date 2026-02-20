import { motion } from 'framer-motion';
import { Scale, Briefcase, GraduationCap, MapPin, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';

const FloatingCard = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-blue-900/5 dark:shadow-blue-900/20 rounded-2xl ${className}`}
    >
        {children}
    </motion.div>
);

export default function LawyerCard({ lawyer, index = 0, onProfileClick, onBookClick }) {
    return (
        <FloatingCard delay={index * 0.05} className="group overflow-hidden">
            <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                        <img
                            src={lawyer.photo}
                            alt={lawyer.name}
                            className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        {lawyer.verified && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate mb-1 text-lg">{lawyer.name}</h3>
                        <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md w-fit mb-1 border border-blue-100 dark:border-blue-800">
                            <Scale className="w-3.5 h-3.5" />
                            {lawyer.specialization}
                        </div>
                        {lawyer.unique_id && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                ID: {lawyer.unique_id}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="truncate">{lawyer.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="truncate">{lawyer.education}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="truncate">{lawyer.city}, {lawyer.state}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onProfileClick(lawyer)}
                        className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Profile
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onBookClick(lawyer)}
                        className="w-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 border-0 text-white"
                    >
                        Book <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                </div>
            </div>
        </FloatingCard>
    );
}
