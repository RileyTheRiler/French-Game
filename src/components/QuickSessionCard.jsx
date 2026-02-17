import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, CheckCircle, Sparkles, BookOpen, Gamepad2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useConfetti, CONFETTI_PRESETS } from './ui/ConfettiEffect';
import { Badge } from './ui/Badge';

const QUICK_ACTIVITIES = [
    {
        id: 'review-5',
        title: 'Quick Review',
        description: 'Review 5 flashcards',
        icon: BookOpen,
        path: '/study-session',
        color: 'pink',
        duration: '3 min',
        xpReward: 15,
    },
    {
        id: 'falling-words',
        title: 'Word Catch',
        description: '3 rounds of Falling Words',
        icon: Gamepad2,
        path: '/game/falling-words',
        color: 'violet',
        duration: '5 min',
        xpReward: 25,
    },
];

const QuickSessionCard = () => {
    const navigate = useNavigate();
    const { stats, addXP, incrementStreak } = useProgress();
    const { triggerConfetti, ConfettiComponent } = useConfetti();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [completed, setCompleted] = useState(false);

    // Check if quick session was done today
    const today = new Date().toDateString();
    const quickSessionDone = stats.dailyStats?.[today]?.quickSessionDone || false;

    // Timer effect when session is active
    useEffect(() => {
        let interval;
        if (isActive && !completed) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, completed]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startSession = (activity) => {
        setSelectedActivity(activity);
        setIsActive(true);
        setTimeElapsed(0);
        // Navigate to the activity
        navigate(activity.path);
    };

    const handleComplete = () => {
        setCompleted(true);
        setIsActive(false);
        triggerConfetti(CONFETTI_PRESETS.goal);
        // Award bonus XP for completing quick session
        addXP(10); // Bonus XP
        incrementStreak();
    };

    // If session is done today, show completion state
    if (quickSessionDone) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mb-4"
            >
                <div className="glass-panel p-4 bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-emerald-500/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <CheckCircle size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-300">Quick Session Complete!</h3>
                            <p className="text-xs text-slate-400">Great job staying consistent today</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            <ConfettiComponent />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mb-4"
            >
                <div className="glass-panel p-4 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-500/20 rounded-xl">
                                <Clock size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Just 5 Minutes</h3>
                                <p className="text-xs text-slate-400">Quick learning, big impact</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
                            <Sparkles size={10} className="mr-1" />
                            Beginner Friendly
                        </Badge>
                    </div>

                    {/* Active session display */}
                    <AnimatePresence mode="wait">
                        {isActive && selectedActivity ? (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4"
                            >
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <selectedActivity.icon size={20} className={`text-${selectedActivity.color}-400`} />
                                            <span className="font-bold text-white">{selectedActivity.title}</span>
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-indigo-400">
                                            {formatTime(timeElapsed)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleComplete}
                                        className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Complete Session ✓
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="activities"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 gap-3"
                            >
                                {QUICK_ACTIVITIES.map((activity) => (
                                    <button
                                        key={activity.id}
                                        onClick={() => startSession(activity)}
                                        className={`p-3 rounded-xl bg-white/5 border border-white/10 hover:border-${activity.color}-500/50 hover:bg-${activity.color}-500/10 transition-all group text-left`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <activity.icon size={18} className={`text-${activity.color}-400`} />
                                            <span className="font-bold text-sm text-white group-hover:text-${activity.color}-300">
                                                {activity.title}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{activity.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500">{activity.duration}</span>
                                            <Badge variant="outline" className="text-[10px] bg-violet-500/10 border-violet-500/30 text-violet-300">
                                                +{activity.xpReward} XP
                                            </Badge>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Encouragement message */}
                    {!isActive && (
                        <div className="mt-3 text-center">
                            <p className="text-xs text-slate-500">
                                Even 5 minutes of practice builds lasting habits 💪
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default QuickSessionCard;
