import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    format, startOfWeek, endOfWeek, eachDayOfInterval,
    addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
    isSameDay, isSameMonth, startOfMonth, endOfMonth, isToday,
    parseISO, getHours, getMinutes, setHours, setMinutes
} from 'date-fns';
import {
    ChevronLeft, ChevronRight, Plus,
    Calendar as CalendarIcon, Clock, MapPin,
    Video, Phone, User, MoreVertical, Search,
    Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils'; // Assuming a utility for class merging exists or I'll use template literals

// Mock data generator for visual testing if props are empty
const generateMockEvents = (date) => [
    {
        id: 1,
        title: 'Darlene Robertson',
        role: 'Family Therapist',
        start: setHours(setMinutes(date, 0), 9),
        end: setHours(setMinutes(date, 0), 10),
        type: 'video',
        color: 'blue'
    },
    {
        id: 2,
        title: 'Ronald Richards',
        role: 'Psychiatrist',
        start: setHours(setMinutes(date, 0), 10),
        end: setHours(setMinutes(date, 30), 11),
        type: 'in-person',
        color: 'purple'
    },
    {
        id: 3,
        title: 'Court Hearing',
        role: 'High Court',
        start: setHours(setMinutes(date, 0), 13),
        end: setHours(setMinutes(date, 0), 14),
        type: 'hearing',
        color: 'amber'
    }
];

const EVENT_COLORS = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', indicator: 'bg-blue-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', indicator: 'bg-purple-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', indicator: 'bg-amber-500' },
    green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', indicator: 'bg-green-500' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600', indicator: 'bg-pink-500' },
};

export default function CalendarView({
    events = [],
    onAddEvent,
    onEventClick,
    user
}) {
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
        if (view === 'day') return <DayView date={currentDate} events={events} onEventClick={onEventClick} />;
        if (view === 'week') return <WeekView date={currentDate} events={events} onEventClick={onEventClick} />;
        return <MonthView date={currentDate} events={events} onEventClick={onEventClick} />;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full font-sans text-slate-800">

            {/* Main Calendar Area */}
            <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Schedule</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-500 text-sm font-medium">
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                            <div className="flex gap-1 ml-4">
                                <button onClick={handlePrev} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={handleNext} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={handleToday} className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-2">
                                    Today
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Switcher */}
                        <div className="bg-slate-100/50 p-1 rounded-xl flex border border-slate-200/50">
                            {['day', 'week', 'month'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={onAddEvent}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm shadow-lg shadow-blue-200"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </Button>
                    </div>
                </div>

                {/* Calendar Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-[500px]">
                    {renderMainContent()}
                </div>
            </div>

            {/* Side Panel (Right) */}
            <div className="w-full lg:w-96 flex flex-col gap-6">

                {/* Monthly Activity / Mini Calendar */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">Monthly Activity</h3>
                        <div className="flex gap-2 text-[10px] font-medium">
                            <span className="flex items-center gap-1 text-blue-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Appointment
                            </span>
                            <span className="flex items-center gap-1 text-amber-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Meeting
                            </span>
                        </div>
                    </div>

                    {/* Mini Calendar Header */}
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <span className="font-semibold text-sm">{format(currentDate, 'MMMM yyyy')}</span>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    {/* Mini Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-6 text-center">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                            <div key={d} className="text-[10px] font-bold text-slate-400 py-2">{d}</div>
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
                    relative h-9 w-9 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                    ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : ''}
                    ${today && !isSelected ? 'text-blue-600 bg-blue-50' : ''}
                    hover:bg-blue-50 hover:text-blue-600
                  `}
                                >
                                    {format(day, 'd')}
                                    {/* Dot indicators for events could go here */}
                                </button>
                            );
                        })}
                    </div>

                    {/* Stats Box */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">Active Time</div>
                            <div className="text-xl font-bold text-slate-800">4h 32m</div>
                        </div>
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">Upcoming</div>
                            <div className="text-xl font-bold text-slate-800">{events.length}</div>
                        </div>
                    </div>
                </div>

                {/* Upcoming List */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 flex-1">
                    <h3 className="font-bold text-slate-800 mb-4">Upcoming Schedule</h3>
                    <div className="space-y-3">
                        {events.slice(0, 3).map((event, idx) => (
                            <div
                                key={idx}
                                onClick={() => onEventClick(event)}
                                className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-50 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                            >
                                <div className={`w-2 h-8 rounded-full ${EVENT_COLORS[event.color || 'blue'].indicator}`} />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                                    <p className="text-xs text-slate-500">{format(parseISO(event.start_time || new Date().toISOString()), 'h:mm a')} • {event.type}</p>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-8">No upcoming events</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}


/* --- Subcards for Views --- */

function DayView({ date, events, onEventClick }) {
    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

    return (
        <div className="relative min-w-[600px]">
            {/* Time Grid */}
            <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-slate-100/50 flex flex-col">
                {hours.map(h => (
                    <div key={h} className="flex-1 text-xs text-slate-400 font-medium pt-2 text-right pr-4 relative">
                        {h > 12 ? h - 12 : h} {h >= 12 ? 'pm' : 'am'}
                        <div className="absolute top-0 right-0 w-2 h-px bg-slate-200" />
                    </div>
                ))}
            </div>

            {/* Events Area */}
            <div className="ml-16 relative h-[600px]"> {/* Fixed height for scrollable area */}
                {/* Horizontal Lines */}
                {hours.map((h, i) => (
                    <div key={h} className="absolute w-full h-px bg-slate-100" style={{ top: `${(i / hours.length) * 100}%` }} />
                ))}

                {/* Events Mapping (Simplified positioning) */}
                {events.filter(e => isSameDay(parseISO(e.start_time || new Date().toISOString()), date)).map((event, idx) => {
                    const start = parseISO(event.start_time || new Date().toISOString());
                    const startHour = getHours(start);
                    const startMin = getMinutes(start);
                    // Simple calculation: assumes 8am start, 10 hours total. 
                    // 8am = 0%, 6pm = 100%. 
                    const topPercent = ((startHour - 8) + (startMin / 60)) / 10 * 100;
                    const heightPercent = 10; // Default 1 hour height for now

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onEventClick(event)}
                            className={`absolute left-2 right-2 p-3 rounded-2xl border-l-4 cursor-pointer shadow-sm
                     ${EVENT_COLORS[event.color || 'blue'].bg} 
                     ${EVENT_COLORS[event.color || 'blue'].border} 
                     ${EVENT_COLORS[event.color || 'blue'].indicator.replace('bg-', 'border-')}
                  `}
                            style={{ top: `${Math.max(0, topPercent)}%`, height: `${heightPercent}%` }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className={`font-bold text-sm ${EVENT_COLORS[event.color || 'blue'].text}`}>{event.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{event.description || event.type}</p>
                                </div>
                                <span className="text-[10px] font-semibold bg-white/50 px-2 py-1 rounded-full text-slate-600">
                                    {format(start, 'h:mm a')}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Current Time Indicator */}
                {isToday(date) && (
                    <div
                        className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10 flex items-center"
                        style={{ top: `${((getHours(new Date()) - 8) + (getMinutes(new Date()) / 60)) / 10 * 100}%` }}
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1 shadow-sm ring-2 ring-blue-100" />
                        <div className="w-full h-px bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                )}
            </div>
        </div>
    );
}

function WeekView({ date, events, onEventClick }) {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 border-b border-slate-100 pb-2">
                {days.map(d => (
                    <div key={d.toString()} className={`text-center ${isSameDay(d, new Date()) ? 'text-blue-600' : 'text-slate-500'}`}>
                        <div className="text-[10px] font-bold uppercase mb-1">{format(d, 'EEE')}</div>
                        <div className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto ${isSameDay(d, new Date()) ? 'bg-blue-600 text-white shadow-md' : ''}`}>
                            {format(d, 'd')}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 relative pt-2">
                {/* Columns */}
                {days.map((day, i) => (
                    <div key={i} className="border-r border-slate-50 last:border-0 relative min-h-[400px]">
                        {events.filter(e => isSameDay(parseISO(e.start_time || new Date().toISOString()), day)).map((event, idx) => (
                            <div
                                key={idx}
                                onClick={() => onEventClick(event)}
                                className={`mx-1 mb-2 p-2 rounded-xl text-xs font-semibold cursor-pointer border-l-2 ${EVENT_COLORS[event.color || 'blue'].bg} ${EVENT_COLORS[event.color || 'blue'].text} ${EVENT_COLORS[event.color || 'blue'].indicator.replace('bg-', 'border-')}`}
                            >
                                {format(parseISO(event.start_time || new Date().toISOString()), 'h:mm a')} <br />
                                {event.title}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function MonthView({ date, events, onEventClick }) {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs font-bold text-slate-400 uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 flex-1 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, date);
                    const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time || new Date().toISOString()), day));

                    return (
                        <div key={i} className={`bg-white p-2 min-h-[80px] flex flex-col ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}>
                            <span className={`text-xs font-bold mb-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-400'}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="flex-1 space-y-1 overflow-y-auto max-h-[60px] no-scrollbar">
                                {dayEvents.map((event, idx) => (
                                    <div
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        className={`w-full h-1.5 rounded-full ${EVENT_COLORS[event.color || 'blue'].indicator} cursor-pointer hover:scale-x-105 transition-transform`}
                                        title={event.title}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
