import React from 'react';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';
import { Coffee, Headphones, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SmartBreakModal = () => {
    const navigate = useNavigate();
    const { cognitiveStats, updateCognitiveState } = useProgress();

    // In a real app we'd have a 'dismissBreak' function in context
    // For now we'll just hack it by resetting fatigue a bit
    const handleDismiss = () => {
        // Resetting fatigue manually via the same update function isn't ideal without a dedicated action,
        // but passing a fake "correct" answer with low latency reduces fatigue in our simple heuristic.
        // Better yet, we'll just ignore for now or assume parent handles visibility if we don't have a direct setter.
        // Actually, let's just create a local dismiss or assume the user navigates away.
    };

    if (!cognitiveStats.smartBreakSuggested) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl shadow-blue-900/20"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
                            <BrainIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Cognitive Load High 🧠</h2>
                        <p className="text-slate-400">
                            We've detected signs of fatigue. Learning is most effective when you're fresh.
                            Take a "Smart Break" to consolidate memory.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <button
                            onClick={() => navigate('/learn/podcast')}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
                        >
                            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-200">Passive Listening</h4>
                                <p className="text-sm text-slate-400">Switch to podcast mode</p>
                            </div>
                        </button>

                        <button className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors">
                            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
                                <Wind className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-200">Box Breathing</h4>
                                <p className="text-sm text-slate-400">1 min relaxation exercise</p>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            // "Snooze" the warning
                            // In a real implementation we would call a proper dismiss function
                            // For this demo we will just reload or close
                            window.location.reload(); // Hard reset for demo purposes to clear state
                        }}
                        className="w-full py-3 text-slate-500 hover:text-slate-300 font-medium transition-colors"
                    >
                        I'm fine, keep going
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const BrainIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
);

export default SmartBreakModal;
