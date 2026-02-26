import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Trophy, Target } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklyGoalTracker = ({ compact = false }) => {
    const { weeklyGoal, isWeeklyGoalMet } = useProgress();

    const sessionsPerWeek = weeklyGoal?.sessionsPerWeek || 3;

    // Memoize sessionsThisWeek to prevent it from changing on every render and causing effect re-runs
    const sessionsThisWeek = useMemo(() => weeklyGoal?.sessionsThisWeek || [], [weeklyGoal?.sessionsThisWeek]);

    const sessionsCompleted = sessionsThisWeek.length;
    const goalMet = isWeeklyGoalMet();

    // Calculate which days have been completed
    const dayStatus = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        return DAYS.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + mondayOffset + index);
            const dateString = date.toDateString();

            const isCompleted = sessionsThisWeek.includes(dateString);
            const isToday = dateString === today.toDateString();
            const isPast = date < new Date(today.toDateString());

            return {
                day,
                isCompleted,
                isToday,
                isPast,
                date: dateString
            };
        });
    }, [sessionsThisWeek]);

    // Progress percentage for the ring
    const progressPercentage = Math.min(100, (sessionsCompleted / sessionsPerWeek) * 100);

    // Calculate the stroke dash for SVG circle
    const radius = compact ? 28 : 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    // Motivational message
    const getMessage = () => {
        if (goalMet) return "🎉 Weekly goal complete!";
        const remaining = sessionsPerWeek - sessionsCompleted;
        const today = dayStatus.find(d => d.isToday);
        if (today?.isCompleted) {
            return `✨ Great job today! ${remaining} more to hit your goal.`;
        }
        if (remaining === 1) return "🔥 One more session to crush your goal!";
        return `📚 ${remaining} sessions left this week`;
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                {/* Mini Progress Ring */}
                <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="28"
                            cy="28"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-white/10"
                        />
                        <motion.circle
                            cx="28"
                            cy="28"
                            r={radius}
                            fill="none"
                            stroke="url(#weeklyGradientCompact)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                strokeDasharray: circumference
                            }}
                        />
                        <defs>
                            <linearGradient id="weeklyGradientCompact" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={goalMet ? '#22c55e' : '#6366f1'} />
                                <stop offset="100%" stopColor={goalMet ? '#16a34a' : '#8b5cf6'} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {goalMet ? (
                            <Trophy className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <span className="text-sm font-bold">
                                {sessionsCompleted}/{sessionsPerWeek}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getMessage()}</p>
                    <div className="flex gap-1 mt-1">
                        {dayStatus.map((d, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${d.isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : d.isToday
                                            ? 'bg-indigo-500/30 border border-indigo-400 text-indigo-300'
                                            : 'bg-white/10 text-slate-500'
                                    }`}
                            >
                                {d.isCompleted ? <Check className="w-2.5 h-2.5" /> : d.day[0]}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-5">
            <div className="flex items-start gap-4">
                {/* Progress Ring */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-white/10"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r={radius}
                            fill="none"
                            stroke="url(#weeklyGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{
                                strokeDasharray: circumference
                            }}
                        />
                        <defs>
                            <linearGradient id="weeklyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={goalMet ? '#22c55e' : '#6366f1'} />
                                <stop offset="100%" stopColor={goalMet ? '#16a34a' : '#8b5cf6'} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            {goalMet ? (
                                <motion.div
                                    key="trophy"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring' }}
                                >
                                    <Trophy className="w-8 h-8 text-emerald-400" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="count"
                                    className="text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <span className="text-2xl font-bold">{sessionsCompleted}</span>
                                    <span className="text-slate-400">/{sessionsPerWeek}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-bold">Weekly Goal</h3>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">{getMessage()}</p>

                    {/* Day Tracker */}
                    <div className="flex gap-1.5">
                        {dayStatus.map((d, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${d.isCompleted
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : d.isToday
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ring-2 ring-indigo-500/20'
                                            : d.isPast
                                                ? 'bg-white/5 text-slate-600'
                                                : 'bg-white/5 text-slate-400'
                                    }`}
                            >
                                {d.isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    d.day
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Celebration if goal met */}
            <AnimatePresence>
                {goalMet && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-white/10"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <p className="text-sm text-emerald-300">
                                Amazing work! You've hit your weekly goal. Keep the momentum going!
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeeklyGoalTracker;
