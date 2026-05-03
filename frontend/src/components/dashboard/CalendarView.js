import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    format, startOfWeek, endOfWeek, eachDayOfInterval,
    addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
    isSameDay, isSameMonth, startOfMonth, endOfMonth, isToday,
    parseISO, getHours, getMinutes, setHours, setMinutes, isValid
} from 'date-fns';
import {
    ChevronLeft, ChevronRight, Plus,
    Calendar as CalendarIcon, Clock, MapPin,
    Video, Phone, User, MoreVertical, Search,
    Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

// Professional Floating Palette with "Glow" Shadows
const EVENT_COLORS = {
    blue: {
        bg: 'bg-[#60A5FA]', text: 'text-white', shadow: 'shadow-lg shadow-blue-500/40',
        darkBg: 'bg-[#3B82F6]', darkText: 'text-white', darkShadow: 'shadow-lg shadow-blue-600/40' // Meeting
    },
    amber: {
        bg: 'bg-[#FBBF24]', text: 'text-white', shadow: 'shadow-lg shadow-amber-500/40',
        darkBg: 'bg-[#D97706]', darkText: 'text-white', darkShadow: 'shadow-lg shadow-amber-600/40' // Hearing
    },
    purple: {
        bg: 'bg-[#A78BFA]', text: 'text-white', shadow: 'shadow-lg shadow-purple-500/40',
        darkBg: 'bg-[#8B5CF6]', darkText: 'text-white', darkShadow: 'shadow-lg shadow-purple-600/40' // Personal
    },
    rose: {
        bg: 'bg-[#FB7185]', text: 'text-white', shadow: 'shadow-lg shadow-rose-500/40',
        darkBg: 'bg-[#E11D48]', darkText: 'text-white', darkShadow: 'shadow-lg shadow-rose-600/40' // Urgent
    },
    teal: {
        bg: 'bg-[#34D399]', text: 'text-white', shadow: 'shadow-lg shadow-teal-500/40',
        darkBg: 'bg-[#10B981]', darkText: 'text-white', darkShadow: 'shadow-lg shadow-teal-600/40' // Consultation
    },
};

export default function CalendarView({
    events: rawEvents = [],
    onAddEvent,
    onEventClick,
    user,
    darkMode = true
}) {
    // Filter out invalid events to prevent runtime crashes
    const events = (rawEvents || []).filter(e => {
        try {
            const dateStr = e.start_time || new Date().toISOString();
            return isValid(parseISO(dateStr));
        } catch (err) {
            return false;
        }
    });

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('day'); // 'day', 'week', 'month'
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Navigation handlers
    const handlePrev = () => {
        if (view === 'day') setCurrentDate(subDays(currentDate, 1));
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, 1));
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    // Mini Calendar Logic
    const miniCalendarStart = startOfWeek(startOfMonth(currentDate));
    const miniCalendarEnd = endOfWeek(endOfMonth(currentDate));
    const miniCalendarDays = eachDayOfInterval({ start: miniCalendarStart, end: miniCalendarEnd });

    // Main Calendar Logic based on View
    const renderMainContent = () => {
        if (view === 'day') return <DayView date={currentDate} events={events} onEventClick={onEventClick} darkMode={darkMode} />;
        if (view === 'week') return <WeekView date={currentDate} events={events} onEventClick={onEventClick} darkMode={darkMode} />;
        return <MonthView date={currentDate} events={events} onEventClick={onEventClick} darkMode={darkMode} />;
    };

    return (
        <div className={`flex flex-col lg:flex-row gap-8 h-full font-sans transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-slate-800'}`}>

            {/* Main Calendar Area - Floating Card */}
            <div className={`flex-1 rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col overflow-hidden transition-all duration-300 ${darkMode ? 'bg-[#1c1c1c] shadow-black/50' : 'bg-white shadow-slate-200'}`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 z-10 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {view === 'day'
                                    ? format(currentDate, 'EEEE, MMMM d, yyyy')
                                    : view === 'week'
                                        ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
                                        : format(currentDate, 'MMMM yyyy')
                                }
                            </h2>
                            {view === 'day' && isToday(currentDate) && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
                                    }`}>Today</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className={`flex items-center bg-opacity-20 rounded-full p-1 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                                <button onClick={handlePrev} className={`p-2 rounded-full transition-all hover:scale-110 ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-white text-slate-500'}`}>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={handleToday} className={`px-4 text-sm font-semibold transition-colors ${isToday(currentDate) ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-white hover:text-blue-400' : 'text-slate-700 hover:text-blue-600')}`}>
                                    {isToday(currentDate) ? 'Today' : format(currentDate, view === 'month' ? 'MMM yyyy' : 'MMM d')}
                                </button>
                                <button onClick={handleNext} className={`p-2 rounded-full transition-all hover:scale-110 ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-white text-slate-500'}`}>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* View Switcher - Floating Pill */}
                        <div className={`p-1.5 rounded-2xl flex relative ${darkMode ? 'bg-black/40 backdrop-blur-md' : 'bg-slate-100'}`}>
                            {['month', 'week', 'day'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative z-10 ${view === v
                                        ? (darkMode ? 'text-black bg-white shadow-lg shadow-white/10' : 'bg-white text-slate-900 shadow-lg shadow-slate-200')
                                        : (darkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                                        }`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={onAddEvent}
                            className={`rounded-2xl px-6 py-6 flex items-center gap-2 text-sm font-bold shadow-xl transition-transform hover:scale-105 ${darkMode ? 'bg-white text-black hover:bg-gray-100 shadow-white/10' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}`}
                        >
                            <Plus className="w-5 h-5" />
                            Add Event
                        </Button>
                    </div>
                </div>

                {/* Calendar Content */}
                <div className="flex-1 overflow-hidden relative min-h-[600px]">
                    {renderMainContent()}
                </div>
            </div>

            {/* Side Panel (Right) - Glassmorphism */}
            <div className="w-full lg:w-[400px] flex flex-col gap-8">

                {/* Mini Calendar & Activity */}
                <div className={`rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl border transition-all duration-300 ${darkMode ? 'bg-[#151515]/90 border-white/5 shadow-black/50' : 'bg-white/90 border-white/50 shadow-slate-200'}`}>

                    {/* Mini Calendar Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {format(currentDate, 'MMMM yyyy')}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={`p-1.5 rounded-full hover:bg-white/10 ${darkMode ? 'text-gray-400' : 'text-slate-400 hover:bg-slate-100'}`}>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={`p-1.5 rounded-full hover:bg-white/10 ${darkMode ? 'text-gray-400' : 'text-slate-400 hover:bg-slate-100'}`}>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mini Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-4 mb-8 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className={`text-xs font-bold uppercase ${darkMode ? 'text-gray-600' : 'text-slate-400'}`}>{d}</div>
                        ))}
                        {miniCalendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isSelected = isSameDay(day, selectedDate);
                            const today = isToday(day);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedDate(day); setCurrentDate(day); }}
                                    className={`
                                        relative h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                                        ${!isCurrentMonth ? 'opacity-50' : ''}
                                        ${isSelected
                                            ? (darkMode ? 'bg-white text-black shadow-lg shadow-white/20 scale-110' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-110')
                                            : (darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100')
                                        }
                                        ${today && !isSelected ? (darkMode ? 'text-blue-400 border border-blue-500/30' : 'text-blue-600 border border-blue-200') : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>

                    <div className={`h-px w-full mb-6 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`} />

                    {/* Color Legend */}
                    <div className="mb-6">
                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>Event Types</h4>
                        <div className="space-y-2">
                            {[
                                { color: 'bg-[#60A5FA]', label: 'Meeting / Custom Event' },
                                { color: 'bg-[#FBBF24]', label: 'Court Hearing' },
                                { color: 'bg-[#A78BFA]', label: 'Personal' },
                                { color: 'bg-[#34D399]', label: 'Video Consultation' },
                                { color: 'bg-[#FB7185]', label: 'In-Person Consultation' },
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-2.5">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming List */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Upcoming</h3>
                            <button className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>View All</button>
                        </div>
                        <div className="space-y-4">
                            {(() => {
                                const now = new Date();
                                const tomorrow = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1);
                                const upcoming = events
                                    .filter(e => {
                                        try { return parseISO(e.start_time) > now; } catch { return false; }
                                    })
                                    .sort((a, b) => parseISO(a.start_time) - parseISO(b.start_time))
                                    .slice(0, 3);

                                if (upcoming.length === 0) {
                                    return <p className={`text-center text-sm py-8 ${darkMode ? 'text-gray-600' : 'text-slate-400'}`}>No upcoming events</p>;
                                }

                                return upcoming.map((event, idx) => {
                                    const colors = EVENT_COLORS[event.color || 'blue'];
                                    const eventDate = parseISO(event.start_time);
                                    const timeStr = format(eventDate, 'h:mm a');
                                    let dateLabel;
                                    if (isToday(eventDate)) dateLabel = `Today · ${timeStr}`;
                                    else if (isSameDay(eventDate, tomorrow)) dateLabel = `Tomorrow · ${timeStr}`;
                                    else dateLabel = `${format(eventDate, 'MMM d')} · ${timeStr}`;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => onEventClick(event)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]
                                                ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-white hover:shadow-md'}
                                            `}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg ${darkMode ? colors.darkBg + ' ' + colors.darkShadow : colors.bg + ' ' + colors.shadow}`}>
                                                {event.type === 'hearing' ? '⚖️' : event.type === 'meeting' ? '🤝' : event.type === 'consultation' ? '📋' : '📅'}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{event.title}</h4>
                                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                                                    {dateLabel} • {event.type}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}


/* --- Subcards for Views --- */

const HOUR_PX = 64; // pixels per hour — single source of truth
const DAY_START = 0;  // 12 AM
const DAY_END = 24; // 12 AM next day

function DayView({ date, events, onEventClick, darkMode }) {
    // hours we draw lines + labels for: 7, 8, 9 … 22
    const hours = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => i + DAY_START);
    const totalPx = (DAY_END - DAY_START) * HOUR_PX; // 15 slots × 64px = 960px

    return (
        <div
            className="relative min-w-[600px] py-2 overflow-y-auto"
            style={{
                maxHeight: '72vh',
                scrollbarWidth: 'thin',
                scrollbarColor: darkMode ? 'rgba(255,255,255,0.12) transparent' : 'rgba(0,0,0,0.12) transparent',
            }}
        >
            <div className="relative" style={{ height: `${totalPx}px` }}>

                {/* Hour rows: label + divider line */}
                {hours.map((h, i) => {
                    const topPx = i * HOUR_PX;
                    return (
                        <div
                            key={h}
                            className="absolute left-0 right-0 flex items-start"
                            style={{ top: `${topPx}px` }}
                        >
                            {/* Label — shift up by half its own height so the line and label align */}
                            <div
                                className={`w-20 flex-shrink-0 text-xs font-semibold text-right pr-4 select-none`}
                                style={{ marginTop: '-8px', color: darkMode ? '#6b7280' : '#94a3b8' }}
                            >
                                {h === 0 || h === 24 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                            </div>
                            {/* Horizontal line */}
                            <div className={`flex-1 h-px ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                        </div>
                    );
                })}

                {/* Events — absolutely positioned inside the same px space */}
                <div className="absolute top-0 bottom-0 left-20 right-0">
                    {events
                        .filter(e => {
                            try { return isSameDay(parseISO(e.start_time), date); } catch { return false; }
                        })
                        .map((event, idx) => {
                            const start = parseISO(event.start_time);
                            const h = getHours(start);
                            const m = getMinutes(start);
                            const topPx = (h - DAY_START) * HOUR_PX + (m / 60) * HOUR_PX;
                            const heightPx = HOUR_PX - 6;
                            const colors = EVENT_COLORS[event.color || 'blue'];

                            // Don't render outside the visible range
                            if (topPx + heightPx < 0 || topPx > totalPx) return null;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02, zIndex: 20 }}
                                    onClick={() => onEventClick(event)}
                                    className={`absolute left-4 right-4 flex items-center px-4 rounded-2xl cursor-pointer shadow-lg
                                        ${darkMode ? colors.darkBg + ' ' + colors.darkShadow : colors.bg + ' ' + colors.shadow}
                                    `}
                                    style={{ top: `${topPx}px`, height: `${heightPx}px`, zIndex: 5 }}
                                >
                                    <div className="flex-1 min-w-0 mr-3">
                                        <h4 className={`font-bold text-sm truncate leading-tight ${darkMode ? colors.darkText : colors.text}`}>{event.title}</h4>
                                        <p className={`text-xs opacity-75 truncate ${darkMode ? colors.darkText : colors.text}`}>{event.description || event.case || event.type}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-black/20 text-white whitespace-nowrap">
                                        {format(start, 'h:mm a')}
                                    </div>
                                </motion.div>
                            );
                        })}

                    {/* Current Time Indicator */}
                    {isToday(date) && (() => {
                        const now = new Date();
                        const nowPx = (getHours(now) - DAY_START) * HOUR_PX + (getMinutes(now) / 60) * HOUR_PX;
                        if (nowPx < 0 || nowPx > totalPx) return null;
                        return (
                            <div
                                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 flex items-center pointer-events-none"
                                style={{ top: `${nowPx}px` }}
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-sm ring-2 ring-red-200" />
                            </div>
                        );
                    })()}
                </div>

            </div>
        </div>
    );
}

function WeekView({ date, events, onEventClick, darkMode }) {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 mb-4">
                {days.map(d => (
                    <div key={d.toString()} className="text-center">
                        <div className={`text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>{format(d, 'EEE')}</div>
                        <div className={`text-xl font-bold w-10 h-10 rounded-2xl flex items-center justify-center mx-auto transition-all ${isSameDay(d, new Date()) ? (darkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-blue-600 text-white shadow-lg shadow-blue-200') : (darkMode ? 'text-white' : 'text-slate-800')}`}>
                            {format(d, 'd')}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 gap-2 relative">
                {/* Columns */}
                {days.map((day, i) => (
                    <div key={i} className={`rounded-3xl relative min-h-[400px] p-1.5 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                        {events.filter(e => isSameDay(parseISO(e.start_time || new Date().toISOString()), day)).map((event, idx) => {
                            const colors = EVENT_COLORS[event.color || 'blue'];
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => onEventClick(event)}
                                    className={`mb-2 p-3 rounded-2xl text-xs font-bold cursor-pointer transition-transform hover:scale-105
                                    ${darkMode ? colors.darkBg : colors.bg} 
                                    ${darkMode ? colors.darkText : colors.text} 
                                    ${darkMode ? colors.darkShadow : colors.shadow}`}
                                >
                                    <span className="opacity-80 block mb-1 text-[10px]">{format(parseISO(event.start_time || new Date().toISOString()), 'h:mm a')}</span>
                                    {event.title}
                                </motion.div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function MonthView({ date, events, onEventClick, darkMode }) {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 mb-4 text-center">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <div key={d} className={`text-sm font-bold opacity-50 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 flex-1 gap-2">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, date);
                    const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time || new Date().toISOString()), day));

                    return (
                        <div key={i} className={`p-3 rounded-3xl min-h-[100px] flex flex-col transition-all duration-300 ${!isCurrentMonth ? 'opacity-20' : ''} ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                            <span className={`text-sm font-bold mb-2 ml-1 ${isSameDay(day, new Date()) ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-white' : 'text-slate-700')}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                                {dayEvents.map((event, idx) => {
                                    const colors = EVENT_COLORS[event.color || 'blue'];
                                    return (
                                        <div
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick(event);
                                            }}
                                            className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold truncate cursor-pointer hover:opacity-80 flex items-center gap-1.5
                                                ${darkMode ? colors.darkBg : colors.bg} 
                                                ${darkMode ? colors.darkText : colors.text}
                                            `}
                                            title={event.title}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                            {event.title}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
