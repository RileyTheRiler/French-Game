import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';
import { ArrowLeft, Moon, Brain, Music, Smile, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GOALS = [
    {
        id: 'thinkingInFrench',
        label: "Thinking in French",
        icon: Brain,
        desc: "Caught yourself formulating a thought in French before translating.",
        color: "text-blue-400 bg-blue-400/10 border-blue-400/20"
    },
    {
        id: 'dreamingInFrench',
        label: "Dreaming in French",
        icon: Moon,
        desc: "Had a dream where people were speaking French.",
        color: "text-purple-400 bg-purple-400/10 border-purple-400/20"
    },
    {
        id: 'firstSongUnderstood',
        label: "Song Clarity",
        icon: Music,
        desc: "Understood a French song's lyrics without looking them up.",
        color: "text-pink-400 bg-pink-400/10 border-pink-400/20"
    },
    {
        id: 'firstJokeUnderstood',
        label: "Humor Unlocked",
        icon: Smile,
        desc: "Laughed at a French joke instantly.",
        color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
    }
];

const DreamGoals = () => {
    const navigate = useNavigate();
    const { dreamGoals, logDreamGoal } = useProgress();
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handleLog = (id) => {
        logDreamGoal(id);
        setSelectedGoal(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        Visionary Milestones
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Language learning isn't just about vocabulary—it's about rewiring your brain.
                        Track these subconscious breakthroughs.
                    </p>
                </div>

                <div className="grid gap-6">
                    {GOALS.map((goal) => {
                        const isUnlocked = !!dreamGoals[goal.id];
                        const date = isUnlocked ? new Date(dreamGoals[goal.id]).toLocaleDateString() : null;

                        return (
                            <motion.div
                                key={goal.id}
                                layout
                                className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${isUnlocked
                                        ? 'bg-slate-900 border-green-500/30 shadow-lg shadow-green-500/10'
                                        : 'bg-slate-900/50 border-slate-800'
                                    }`}
                            >
                                <div className="flex items-start gap-4 z-10 relative">
                                    <div className={`p-3 rounded-xl ${goal.color}`}>
                                        <goal.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            {goal.label}
                                            {isUnlocked && <Check className="w-5 h-5 text-green-400" />}
                                        </h3>
                                        <p className="text-slate-400 mt-1">{goal.desc}</p>

                                        {isUnlocked ? (
                                            <p className="text-xs font-mono text-green-400 mt-3">
                                                Achieved on {date} (+500 XP)
                                            </p>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedGoal(goal)}
                                                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                                            >
                                                Mark as Achieved
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isUnlocked && (
                                    <div className="absolute top-0 right-0 p-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {selectedGoal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedGoal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center"
                        >
                            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${selectedGoal.color}`}>
                                <selectedGoal.icon className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Achieved: {selectedGoal.label}?</h2>
                            <p className="text-slate-400 mb-8">
                                This is a huge milestone! Are you sure you experienced this?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedGoal(null)}
                                    className="flex-1 py-3 rounded-lg font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleLog(selectedGoal.id)}
                                    className="flex-1 py-3 rounded-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-colors"
                                >
                                    Yes, I did it!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DreamGoals;
