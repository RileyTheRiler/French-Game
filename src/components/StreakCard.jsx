import React from 'react';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Flame, Snowflake, Trophy, Star, Target } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { STREAK_MILESTONES } from '../data/leagues';
import { Badge } from './ui/Badge';

const StreakCard = () => {
    const { stats } = useProgress();
    const streak = stats.streak || 0;
    const freezeCount = stats.inventory?.['streak_freeze'] || 0;

    // Find next milestone
    const getNextMilestone = () => {
        for (const milestone of STREAK_MILESTONES) {
            if (streak < milestone.days) {
                return milestone;
            }
        }
        return null;
    };

    // Get highest achieved milestone
    const getAchievedMilestones = () => {
        return STREAK_MILESTONES.filter(m => streak >= m.days);
    };

    const nextMilestone = getNextMilestone();
    const achievedMilestones = getAchievedMilestones();
    const daysToNext = nextMilestone ? nextMilestone.days - streak : 0;

    // Flame intensity based on streak
    const getFlameIntensity = () => {
        if (streak >= 100) return 'animate-pulse text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]';
        if (streak >= 30) return 'animate-pulse text-orange-500 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]';
        if (streak >= 7) return 'text-orange-500 drop-shadow-[0_0_5px_rgba(251,146,60,0.4)]';
        if (streak > 0) return 'text-orange-400';
        return 'text-slate-600';
    };

    // Message based on streak status
    const getMessage = () => {
        if (streak === 0) {
            return { text: "Start your streak today!", subtext: "Complete any activity to begin" };
        }
        if (streak === 1) {
            return { text: "Day 1 - Great start!", subtext: "Come back tomorrow to continue" };
        }
        if (nextMilestone && daysToNext <= 3) {
            return { text: `Almost at ${nextMilestone.days} days!`, subtext: `${daysToNext} more day${daysToNext > 1 ? 's' : ''} to ${nextMilestone.title}` };
        }
        if (streak >= 100) {
            return { text: "Legendary dedication!", subtext: "You're an inspiration" };
        }
        if (streak >= 30) {
            return { text: "Incredible commitment!", subtext: "A full month of learning" };
        }
        if (streak >= 7) {
            return { text: "You're on fire!", subtext: "Keep the momentum going" };
        }
        return { text: `${streak} day streak!`, subtext: "Consistency is key" };
    };

    const message = getMessage();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 z-10"
        >
            <div className="glass-panel bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-orange-500/20 rounded-2xl p-4 min-w-[200px]">
                {/* Main streak display */}
                <div className="flex items-center gap-3 mb-3">
                    <motion.div
                        animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`p-2 rounded-xl bg-orange-500/20 ${getFlameIntensity()}`}
                    >
                        <Flame size={28} />
                    </motion.div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black ${streak > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                                {streak}
                            </span>
                            <span className="text-sm text-slate-400">
                                day{streak !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">{message.subtext}</p>
                    </div>
                </div>

                {/* Streak freezes */}
                {freezeCount > 0 && (
                    <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Snowflake size={14} className="text-blue-400" />
                        <span className="text-xs text-blue-300">
                            {freezeCount} streak freeze{freezeCount > 1 ? 's' : ''} available
                        </span>
                    </div>
                )}

                {/* Next milestone progress */}
                {nextMilestone && streak > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Target size={12} />
                                <span>Next: {nextMilestone.title}</span>
                            </div>
                            <span className="text-xs text-orange-400 font-bold">
                                {daysToNext} days
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(streak / nextMilestone.days) * 100}%` }}
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-slate-500">
                                +{nextMilestone.xpBonus} XP
                            </span>
                            <span className="text-[10px] text-slate-500">
                                +{nextMilestone.coinBonus} 💰
                            </span>
                        </div>
                    </div>
                )}

                {/* Achieved milestone badges */}
                {achievedMilestones.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {achievedMilestones.slice(-3).map((milestone) => (
                            <Badge
                                key={milestone.days}
                                variant="outline"
                                className="text-[10px] bg-orange-500/10 border-orange-500/30 text-orange-300"
                            >
                                {milestone.icon} {milestone.days}d
                            </Badge>
                        ))}
                        {achievedMilestones.length > 3 && (
                            <Badge
                                variant="outline"
                                className="text-[10px] bg-slate-500/10 border-slate-500/30 text-slate-400"
                            >
                                +{achievedMilestones.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Comeback message for broken streaks */}
                {streak === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                    >
                        <div className="flex items-center gap-2">
                            <Star size={14} className="text-indigo-400" />
                            <span className="text-xs text-indigo-300">
                                Every expert was once a beginner
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default StreakCard;
