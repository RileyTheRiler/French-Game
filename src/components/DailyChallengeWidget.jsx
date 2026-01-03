import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Gift, CheckCircle } from 'lucide-react';
import { getTodaysChallenges } from '../data/dailyChallenges';
import { getActiveTimedChallenge, clearTimedChallenge } from '../data/timeChallenges';
import { useProgress } from '../context/ProgressContext';
import { Badge } from './ui/Badge';

const DailyChallengeWidget = () => {
    const { stats, addXP, addCoins, incrementStat } = useProgress();
    const [expanded, setExpanded] = useState(false);
    const [challenges, setChallenges] = useState([]);
    const [timedChallenge, setTimedChallenge] = useState(null);
    const [timedClaimed, setTimedClaimed] = useState(() => {
        const saved = localStorage.getItem('frenchApp_timedClaimed');
        if (!saved) return false;
        const parsed = JSON.parse(saved);
        return parsed.date === new Date().toDateString();
    });
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [claimedToday, setClaimedToday] = useState(() => {
        const saved = localStorage.getItem('frenchApp_claimedChallenges');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === new Date().toDateString()) {
                return parsed.claimed;
            }
        }
        return [];
    });

    useEffect(() => {
        setChallenges(getTodaysChallenges());
        const activeTimed = getActiveTimedChallenge();
        setTimedChallenge(activeTimed);
        setTimeRemaining(activeTimed.expiresAt - Date.now());
    }, []);

    useEffect(() => {
        if (!timedChallenge) return;
        const timer = setInterval(() => {
            const remaining = timedChallenge.expiresAt - Date.now();
            setTimeRemaining(Math.max(0, remaining));
            if (remaining <= 0) {
                clearTimedChallenge();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [timedChallenge]);

    const getDailyProgress = (statName) => {
        const today = new Date().toDateString();
        const daily = stats.dailyStats?.[today] || {};
        return daily[statName] || 0;
    };

    const isComplete = (challenge) => {
        return getDailyProgress(challenge.stat) >= challenge.target;
    };

    const isClaimed = (challengeId) => claimedToday.includes(challengeId);

    const claimReward = (challenge) => {
        if (!isComplete(challenge) || isClaimed(challenge.id)) return;

        addXP(challenge.xpReward);
        addCoins(challenge.coinReward);

        const newClaimed = [...claimedToday, challenge.id];
        setClaimedToday(newClaimed);
        localStorage.setItem('frenchApp_claimedChallenges', JSON.stringify({
            date: new Date().toDateString(),
            claimed: newClaimed
        }));
    };

    const formatTime = (ms) => {
        if (!ms || ms <= 0) return 'Expired';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    };

    const timedProgress = timedChallenge ? getDailyProgress(timedChallenge.stat) : 0;
    const timedComplete = timedChallenge && timedProgress >= timedChallenge.target;

    const claimTimedReward = () => {
        if (!timedChallenge || timedClaimed || !timedComplete || timeRemaining <= 0) return;

        const speedBonus = timeRemaining > (timedChallenge.durationMinutes * 60 * 1000) / 2 ? 1.2 : 1;
        const xpPayout = Math.round(timedChallenge.xpReward * speedBonus);
        const coinPayout = Math.round(timedChallenge.coinReward * speedBonus);
        addXP(xpPayout);
        addCoins(coinPayout);
        incrementStat('timedChallengesCompleted', 1);
        setTimedClaimed(true);
        clearTimedChallenge();
        localStorage.setItem('frenchApp_timedClaimed', JSON.stringify({ date: new Date().toDateString() }));
    };

    const completedCount = challenges.filter(c => isComplete(c)).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto mb-6"
        >
            {/* Header - always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                        <Gift size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white">Daily Challenges</h3>
                        <p className="text-xs text-slate-400">{completedCount}/{challenges.length} completed</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {completedCount === challenges.length && (
                        <Badge variant="success" className="text-xs">All Done!</Badge>
                    )}
                    {expanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel border-t-0 rounded-t-none p-4 space-y-3">
                            {challenges.map((challenge) => {
                                const progress = getDailyProgress(challenge.stat);
                                const complete = progress >= challenge.target;
                                const claimed = isClaimed(challenge.id);
                                const percentage = Math.min((progress / challenge.target) * 100, 100);

                                return (
                                    <div
                                        key={challenge.id}
                                        className={`p-3 rounded-xl border transition-all ${claimed
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : complete
                                                ? 'bg-amber-500/10 border-amber-500/30'
                                                : 'bg-slate-800/50 border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{challenge.icon}</span>
                                                <div>
                                                    <p className={`font-bold text-sm ${claimed ? 'text-emerald-300' : 'text-white'}`}>
                                                        {challenge.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{challenge.description}</p>
                                                </div>
                                            </div>
                                            {claimed ? (
                                                <CheckCircle size={24} className="text-emerald-400" />
                                            ) : complete ? (
                                                <button
                                                    onClick={() => claimReward(challenge)}
                                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-colors"
                                                >
                                                    Claim!
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {progress}/{challenge.target}
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        {!claimed && (
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className={`h-full ${complete ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                />
                                            </div>
                                        )}

                                        {/* Rewards */}
                                        {!claimed && (
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs bg-violet-500/10 border-violet-500/30 text-violet-300">
                                                    +{challenge.xpReward} XP
                                                </Badge>
                                                <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
                                                    +{challenge.coinReward} 💰
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {timedChallenge && (
                                <div className="p-4 rounded-2xl border border-indigo-500/40 bg-indigo-900/40">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⏳</span>
                                            <div>
                                                <p className="font-bold text-white">{timedChallenge.title}</p>
                                                <p className="text-xs text-indigo-200/70">{timedChallenge.description}</p>
                                            </div>
                                        </div>
                                        <Badge variant="primary" className="bg-indigo-600/40 border-indigo-400/60 text-xs">
                                            {formatTime(timeRemaining)}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-indigo-100/80 mb-2">{timedChallenge.bonus}</p>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((timedProgress / timedChallenge.target) * 100, 100)}%` }}
                                            className="h-full bg-indigo-400"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-indigo-200/80 mb-3">
                                        <span>{timedProgress}/{timedChallenge.target} progress</span>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-xs bg-violet-500/20 border-violet-500/40 text-violet-100">
                                                +{timedChallenge.xpReward} XP
                                            </Badge>
                                            <Badge variant="outline" className="text-xs bg-amber-500/20 border-amber-500/40 text-amber-100">
                                                +{timedChallenge.coinReward} 💰
                                            </Badge>
                                        </div>
                                    </div>
                                    <button
                                        onClick={claimTimedReward}
                                        disabled={!timedComplete || timedClaimed || timeRemaining <= 0}
                                        className={`w-full px-4 py-2 rounded-xl font-bold transition-colors ${timedClaimed
                                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                                                : timedComplete && timeRemaining > 0
                                                    ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {timedClaimed ? 'Claimed' : timedComplete ? 'Claim timed reward' : 'Keep going!'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DailyChallengeWidget;
