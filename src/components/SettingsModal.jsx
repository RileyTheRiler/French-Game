import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, AlertTriangle, RotateCcw, X, Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';

const SettingsModal = ({ onClose }) => {
    const {
        audioEnabled,
        toggleAudio,
        reducedMotion,
        toggleReducedMotion,
        colorTheme,
        switchColorTheme,
        resetProgress
    } = useProgress();
    const { resetVocabulary } = useVocabulary();
    const [confirmReset, setConfirmReset] = React.useState(false);
    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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
            role="presentation"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-heading"
                aria-describedby="settings-description"
                ref={dialogRef}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 id="settings-heading" className="text-3xl font-bold title-gradient">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label="Close settings"
                        ref={closeButtonRef}
                    >
                        <X className="text-slate-400" />
                    </button>
                </div>

                <p id="settings-description" className="sr-only">
                    Configure sound, accessibility, and appearance preferences for the app.
                </p>

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
                            role="switch"
                            aria-checked={audioEnabled}
                            aria-label="Toggle sound effects"
                        >
                            <motion.div
                                animate={{ x: audioEnabled ? 26 : 2 }}
                                className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                            />
                        </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="glass-panel p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${reducedMotion ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                <Check />
                            </div>
                            <div>
                                <h3 className="font-bold">Reduced Motion</h3>
                                <p className="text-xs text-slate-400">Minimize animations for comfort</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleReducedMotion}
                            className={`w-14 h-8 rounded-full transition-colors relative ${reducedMotion ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            role="switch"
                            aria-checked={reducedMotion}
                            aria-label="Toggle reduced motion"
                        >
                            <motion.div
                                animate={{ x: reducedMotion ? 26 : 2 }}
                                className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                            />
                        </button>
                    </div>

                    {/* Color Theme */}
                    <div className="glass-panel p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold">Color Theme</h3>
                                <p className="text-xs text-slate-400">Choose a palette that suits you</p>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">{colorTheme}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3" role="listbox" aria-label="Color theme options">
                            {[
                                { id: 'midnight', label: 'Midnight', swatch: 'from-indigo-500 to-purple-500' },
                                { id: 'dawn', label: 'Dawn', swatch: 'from-amber-400 to-rose-500' },
                                { id: 'forest', label: 'Forest', swatch: 'from-emerald-500 to-teal-400' }
                            ].map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => switchColorTheme(theme.id)}
                                    className={`p-3 rounded-2xl border transition-colors flex flex-col gap-2 items-start focus:outline-none focus:ring-2 focus:ring-indigo-400 ${colorTheme === theme.id ? 'border-indigo-400 bg-white/5' : 'border-white/10 bg-white/0'}`}
                                    role="option"
                                    aria-selected={colorTheme === theme.id}
                                >
                                    <span className={`w-full h-10 rounded-xl bg-gradient-to-r ${theme.swatch}`} aria-hidden="true" />
                                    <span className="text-sm font-semibold">{theme.label}</span>
                                </button>
                            ))}
                        </div>
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
