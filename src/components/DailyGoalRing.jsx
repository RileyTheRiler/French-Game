import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Check, Flame } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useConfetti, CONFETTI_PRESETS } from './ui/ConfettiEffect';

const DailyGoalRing = () => {
    const { stats } = useProgress();
    const { triggerConfetti, ConfettiComponent } = useConfetti();
    const [hasAnimated, setHasAnimated] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    // Get today's XP from dailyStats
    const today = new Date().toDateString();
    const dailyXP = stats.dailyStats?.[today]?.dailyXP || 0;
    const dailyGoal = stats.dailyXPGoal || 50; // Default 50 XP goal

    const progress = Math.min((dailyXP / dailyGoal) * 100, 100);
    const isComplete = dailyXP >= dailyGoal;

    // Ring calculations
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Celebrate when goal is reached
    useEffect(() => {
        if (isComplete && !hasAnimated) {
            const t = setTimeout(() => {
                setJustCompleted(true);
                triggerConfetti(CONFETTI_PRESETS.goal);
                setHasAnimated(true);
            }, 0);

            // Reset justCompleted after animation
            const timer = setTimeout(() => setJustCompleted(false), 2000);
            return () => {
                clearTimeout(t);
                clearTimeout(timer);
            };
        }
    }, [isComplete, hasAnimated, triggerConfetti]);

    // Reset animation flag at midnight
    useEffect(() => {
        const checkMidnight = () => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                setHasAnimated(false);
            }
        };

        const interval = setInterval(checkMidnight, 60000);
        return () => clearInterval(interval);
    }, []);

    // Color based on progress
    const getColor = () => {
        if (isComplete) return { stroke: '#10B981', bg: 'from-emerald-500/20 to-green-500/20', text: 'text-emerald-400' };
        if (progress >= 75) return { stroke: '#F59E0B', bg: 'from-amber-500/20 to-yellow-500/20', text: 'text-amber-400' };
        if (progress >= 50) return { stroke: '#3B82F6', bg: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-400' };
        return { stroke: '#6B7280', bg: 'from-slate-500/20 to-gray-500/20', text: 'text-slate-400' };
    };

    const colors = getColor();

    const getMessage = () => {
        if (isComplete) return "Goal Complete! 🎉";
        if (progress >= 75) return "Almost there!";
        if (progress >= 50) return "Halfway done!";
        if (progress >= 25) return "Great start!";
        return "Let's begin!";
    };

    return (
        <>
            <ConfettiComponent />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md mb-6"
            >
                <div className={`glass-panel p-4 bg-gradient-to-br ${colors.bg} border border-white/10 rounded-2xl`}>
                    <div className="flex items-center gap-4">
                        {/* Ring */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                />
                                {/* Progress circle */}
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke={colors.stroke}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </svg>

                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {isComplete ? (
                                        <motion.div
                                            key="complete"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="text-emerald-400"
                                        >
                                            <Check size={28} strokeWidth={3} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="progress"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center"
                                        >
                                            <span className={`text-lg font-bold ${colors.text}`}>
                                                {Math.round(progress)}%
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Celebration pulse */}
                            {justCompleted && (
                                <motion.div
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.8, repeat: 2 }}
                                    className="absolute inset-0 rounded-full border-4 border-emerald-400"
                                />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Target size={16} className={colors.text} />
                                <span className="text-sm font-bold text-slate-300">Daily Goal</span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-2xl font-black ${colors.text}`}>
                                    {dailyXP}
                                </span>
                                <span className="text-slate-500">/ {dailyGoal} XP</span>
                            </div>

                            <motion.p
                                key={getMessage()}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-sm font-medium ${isComplete ? 'text-emerald-300' : 'text-slate-400'}`}
                            >
                                {getMessage()}
                            </motion.p>

                            {!isComplete && dailyGoal - dailyXP <= 20 && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
                                    <Flame size={12} className="animate-pulse" />
                                    <span>Just {dailyGoal - dailyXP} XP to go!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default DailyGoalRing;
