import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, AlertTriangle, RotateCcw, X, Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';

const SettingsModal = ({ onClose }) => {
    const { audioEnabled, toggleAudio, resetProgress } = useProgress();
    const { resetVocabulary } = useVocabulary();
    const [confirmReset, setConfirmReset] = React.useState(false);

    const handleReset = () => {
        resetProgress();
        resetVocabulary();
        onClose();
        window.location.reload(); // Force reload to ensure clean state
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold title-gradient">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Audio Toggle */}
                    <div className="glass-panel p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${audioEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                                {audioEnabled ? <Volume2 /> : <VolumeX />}
                            </div>
                            <div>
                                <h3 className="font-bold">Sound Effects</h3>
                                <p className="text-xs text-slate-400">Enable text-to-speech audio</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleAudio}
                            className={`w-14 h-8 rounded-full transition-colors relative ${audioEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                            <motion.div
                                animate={{ x: audioEnabled ? 26 : 2 }}
                                className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                            />
                        </button>
                    </div>

                    {/* Reset Data */}
                    <div className="glass-panel p-4 border border-red-500/20 bg-red-500/5">
                        <h3 className="font-bold text-red-400 flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} />
                            Danger Zone
                        </h3>
                        <p className="text-xs text-red-300/70 mb-4">
                            This will delete all your progress, XP, and vocabulary data properly. This action cannot be undone.
                        </p>

                        {!confirmReset ? (
                            <button
                                onClick={() => setConfirmReset(true)}
                                className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={16} />
                                Reset All Progress
                            </button>
                        ) : (
                            <div className="flex gap-3 animate-fade-in">
                                <button
                                    onClick={() => setConfirmReset(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle size={16} />
                                    Confirm Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-600">LingoLift v1.0.0</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;
