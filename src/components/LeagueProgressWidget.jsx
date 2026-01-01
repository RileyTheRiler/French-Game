import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { getLeagueByXP, getLeagueProgress, getXPToNextLeague, getNextLeague } from '../data/leagues';
import { Badge } from './ui/Badge';

const LeagueProgressWidget = ({ onClick }) => {
    const { stats, getWeeklySummary } = useProgress();

    // Calculate weekly XP from the summary
    const weeklyData = getWeeklySummary ? getWeeklySummary() : [];
    const weeklyXP = weeklyData.reduce((sum, day) => sum + (day.xp || 0), 0);

    const currentLeague = getLeagueByXP(weeklyXP);
    const nextLeague = getNextLeague(currentLeague.id);
    const progress = getLeagueProgress(weeklyXP);
    const xpToNext = getXPToNextLeague(weeklyXP);

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full glass-panel p-4 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-500/20 rounded-2xl text-left group transition-all hover:border-violet-400/40"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* League Icon */}
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="text-4xl"
                    >
                        {currentLeague.icon}
                    </motion.div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-${currentLeague.color}-400`}>
                                {currentLeague.name} League
                            </span>
                            <Badge
                                variant="outline"
                                className={`text-[10px] bg-${currentLeague.color}-500/10 border-${currentLeague.color}-500/30 text-${currentLeague.color}-300`}
                            >
                                This Week
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-400">
                                {weeklyXP.toLocaleString()} XP
                            </span>
                            {nextLeague && (
                                <>
                                    <TrendingUp size={12} className="text-emerald-400" />
                                    <span className="text-xs text-emerald-400">
                                        {xpToNext} to {nextLeague.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <ChevronRight size={20} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
            </div>

            {/* Progress bar */}
            {nextLeague && (
                <div className="mt-3">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${currentLeague.gradient}`}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-500">
                            {currentLeague.icon} {currentLeague.minXP} XP
                        </span>
                        <span className="text-[10px] text-slate-500">
                            {nextLeague.icon} {nextLeague.minXP} XP
                        </span>
                    </div>
                </div>
            )}

            {/* Max league message */}
            {!nextLeague && (
                <div className="mt-3 p-2 bg-violet-500/10 rounded-lg border border-violet-500/20 text-center">
                    <span className="text-xs text-violet-300">
                        👑 You've reached the highest league!
                    </span>
                </div>
            )}
        </motion.button>
    );
};

export default LeagueProgressWidget;
