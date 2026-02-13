import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, AlertTriangle, RotateCcw, X, Check, CloudUpload, CloudDownload, UserRound, Zap, Brain, Target, Loader2 } from 'lucide-react';
import DifficultyDial from './ui/DifficultyDial';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { warmVoiceCache } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';

const SettingsModal = ({ onClose }) => {
    const {
        audioEnabled,
        toggleAudio,
        offlineAudio,
        toggleOfflineAudio,
        reducedMotion,
        toggleReducedMotion,
        colorTheme,
        switchColorTheme,
        resetProgress,
        difficultySettings,
        updateDifficultySettings,
        stats,
        updateStats,
        globalDifficulty,
        setGlobalDifficulty
    } = useProgress();

    const { resetVocabulary, downloadAudioOnce } = useVocabulary();
    const { user, signIn, signUp, signOut, loading, error } = useAuth();
    const { exportData, importData, status, lastSyncedAt, syncing } = useSync();

    const [confirmReset, setConfirmReset] = useState(false);
    const [isCachingAudio, setIsCachingAudio] = useState(false);
    const [authMode, setAuthMode] = useState('signin');
    const [form, setForm] = useState({ email: '', password: '' });
    const [importError, setImportError] = useState('');

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

    const handleOfflineAudio = async () => {
        const next = !offlineAudio;
        toggleOfflineAudio();
        if (!offlineAudio && next) {
            setIsCachingAudio(true);
            warmVoiceCache();
            await downloadAudioOnce();
            setIsCachingAudio(false);
        }
    };

    const handleReset = () => {
        resetProgress();
        resetVocabulary();
        onClose();
        window.location.reload(); // Force reload to ensure clean state
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        try {
            if (authMode === 'signin') {
                await signIn({ email: form.email, password: form.password });
            } else {
                await signUp({ email: form.email, password: form.password });
            }
            setForm({ email: '', password: '' });
        } catch (err) {
            // error handled by context
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError('');
        try {
            await importData(file);
        } catch (err) {
            setImportError(err.message);
        }
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
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-heading"
                aria-describedby="settings-description"
                ref={dialogRef}
            >
                <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-900 z-20 pb-4 border-b border-white/5">
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
                    {/* Learner Focus */}
                    <div className="glass-panel p-4 border border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
                                <Brain />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">Learner Focus</h3>
                                <p className="text-xs text-slate-400">
                                    Tailor the experience to your goals.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => updateDifficultySettings({ learnerType: 'casual', challengeMode: false })}
                                className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden ${difficultySettings?.learnerType === 'casual'
                                    ? 'border-indigo-500 bg-indigo-500/20'
                                    : 'border-white/10 bg-slate-800/50 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <span className="block font-bold text-sm mb-1 text-indigo-200">Casual Explorer</span>
                                    <span className="block text-xs text-slate-400 leading-snug">
                                        Fun, forgiving, and gamified. Focus on engagement.
                                    </span>
                                </div>
                                {difficultySettings?.learnerType === 'casual' && (
                                    <div className="absolute top-2 right-2 text-indigo-500">
                                        <Check size={16} />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => updateDifficultySettings({ learnerType: 'scholar', challengeMode: true })}
                                className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden ${difficultySettings?.learnerType === 'scholar'
                                    ? 'border-indigo-500 bg-indigo-500/20'
                                    : 'border-white/10 bg-slate-800/50 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <span className="block font-bold text-sm mb-1 text-indigo-200">Serious Scholar</span>
                                    <span className="block text-xs text-slate-400 leading-snug">
                                        Strict feedback, detailed grammar, less fluff.
                                    </span>
                                </div>
                                {difficultySettings?.learnerType === 'scholar' && (
                                    <div className="absolute top-2 right-2 text-indigo-500">
                                        <Check size={16} />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Difficulty Dial */}
                    <div className="glass-panel p-4 border border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex items-start gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
                                <Target size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">Global Difficulty</h3>
                                <p className="text-xs text-slate-400 text-balance">
                                    Adjust the overall challenge level. This affects hint delays, spelling tolerance, and exercise complexity.
                                </p>
                            </div>
                        </div>
                        <DifficultyDial value={globalDifficulty} onChange={setGlobalDifficulty} />
                    </div>

                    {/* Auth & Sync */}
                    <div className="glass-panel p-4 border border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
                                <UserRound />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">Account & Sync</h3>
                                <p className="text-xs text-slate-400">
                                    Sign in to sync progress, vocabulary, and achievements across devices.
                                </p>
                            </div>
                        </div>
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>{user.email}</span>
                                    <span className="text-xs text-slate-400">
                                        {syncing ? 'Syncing…' : status === 'up_to_date' ? 'Up to date' : status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Last sync</span>
                                    <span>{lastSyncedAt ? lastSyncedAt.toLocaleString() : 'Pending'}</span>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="w-full py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAuthSubmit} className="space-y-3">
                                <div className="flex gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('signin')}
                                        className={`flex-1 py-2 rounded-xl ${authMode === 'signin' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('signup')}
                                        className={`flex-1 py-2 rounded-xl ${authMode === 'signup' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}
                                    >
                                        Create Account
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Email"
                                        className="flex-1 rounded-xl bg-slate-800 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={form.password}
                                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Password"
                                        className="flex-1 rounded-xl bg-slate-800 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    />
                                </div>
                                {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition disabled:opacity-70 flex items-center justify-center gap-2"
                                    aria-busy={loading}
                                >
                                    {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                    {loading
                                        ? (authMode === 'signin' ? 'Signing in...' : 'Creating account...')
                                        : (authMode === 'signin' ? 'Sign In' : 'Create Account')
                                    }
                                </button>
                            </form>
                        )}
                    </div>

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

                    {/* Offline Audio Cache */}
                    <div className="glass-panel p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${offlineAudio ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                <Check />
                            </div>
                            <div>
                                <h3 className="font-bold">Download audio once</h3>
                                <p className="text-xs text-slate-400">Cache TTS for offline sessions.</p>
                                {isCachingAudio && <p className="text-[10px] text-emerald-300 mt-1">Preparing audio cache...</p>}
                            </div>
                        </div>
                        <button
                            onClick={handleOfflineAudio}
                            className={`w-14 h-8 rounded-full transition-colors relative ${offlineAudio ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            role="switch"
                            aria-checked={offlineAudio}
                        >
                            <motion.div
                                animate={{ x: offlineAudio ? 26 : 2 }}
                                className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                            />
                        </button>
                    </div>

                    {/* Privacy & Portability */}
                    <div className="glass-panel p-4 border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300">
                                <CloudUpload />
                            </div>
                            <div>
                                <h3 className="font-bold">Data Portability</h3>
                                <p className="text-xs text-slate-400">Export or import your data for privacy-first workflows.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={exportData}
                                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                            >
                                <CloudDownload size={16} />
                                Export data
                            </button>
                            <label className="w-full py-2 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer">
                                <CloudUpload size={16} />
                                Import from file
                                <input type="file" className="hidden" accept="application/json" onChange={handleImport} />
                            </label>
                            {importError && <p className="text-xs text-red-400">{importError}</p>}
                            {status === 'imported' && <p className="text-xs text-emerald-300 flex items-center gap-1"><Check size={14} /> Imported successfully</p>}
                        </div>
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

                    {/* Learning Style */}
                    <div className="glass-panel p-4 border border-amber-500/20 bg-amber-500/5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
                                <Brain />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">Learning Style</h3>
                                <p className="text-xs text-slate-400">
                                    Customize how exercises present hints and answers.
                                </p>
                            </div>
                        </div>

                        {/* Challenge Mode */}
                        <div className={`p-3 rounded-xl border transition-all ${difficultySettings?.learnerType === 'scholar' ? 'opacity-70 border-dashed border-amber-500/30' : 'border-transparent'}`}>
                            {difficultySettings?.learnerType === 'scholar' && (
                                <p className="text-xs text-amber-400 mb-2 font-bold flex items-center gap-1">
                                    <Zap size={12} /> Auto-enabled in Scholar Mode
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className={difficultySettings?.challengeMode ? 'text-amber-400' : 'text-slate-500'} />
                                    <div>
                                        <span className="text-sm font-medium">Challenge Mode</span>
                                        <p className="text-xs text-slate-500">No hints, no safety net</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (difficultySettings?.learnerType !== 'scholar') {
                                            updateDifficultySettings({ challengeMode: !difficultySettings?.challengeMode });
                                        }
                                    }}
                                    disabled={difficultySettings?.learnerType === 'scholar'}
                                    className={`w-14 h-8 rounded-full transition-colors relative ${difficultySettings?.challengeMode ? 'bg-amber-500' : 'bg-slate-700'} ${difficultySettings?.learnerType === 'scholar' ? 'cursor-not-allowed' : ''}`}
                                    role="switch"
                                    aria-checked={difficultySettings?.challengeMode || false}
                                    aria-label="Toggle challenge mode"
                                >
                                    <motion.div
                                        animate={{ x: difficultySettings?.challengeMode ? 26 : 2 }}
                                        className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Hint Delay Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Hint Delay</span>
                                <span className="text-xs text-amber-400 font-mono">{difficultySettings?.hintDelay || 3}s</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={difficultySettings?.hintDelay || 3}
                                onChange={(e) => updateDifficultySettings({ hintDelay: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                aria-label="Hint delay in seconds"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Instant</span>
                                <span>10 seconds</span>
                            </div>
                        </div>

                        {/* Free-form Input */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium">Free-form Input</span>
                                <p className="text-xs text-slate-500">Type answers instead of multiple choice</p>
                            </div>
                            <button
                                onClick={() => updateDifficultySettings({ freeFormInput: !difficultySettings?.freeFormInput })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${difficultySettings?.freeFormInput ? 'bg-amber-500' : 'bg-slate-700'}`}
                                role="switch"
                                aria-checked={difficultySettings?.freeFormInput || false}
                                aria-label="Toggle free-form input"
                            >
                                <motion.div
                                    animate={{ x: difficultySettings?.freeFormInput ? 26 : 2 }}
                                    className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>

                        {/* Speed Round Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t border-amber-500/10">
                            <div>
                                <span className="text-sm font-medium">Speed Rounds</span>
                                <p className="text-xs text-slate-500">Include timed challenges in Daily Mix</p>
                            </div>
                            <button
                                onClick={() => updateStats({ speedRoundEnabled: !stats.speedRoundEnabled })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${stats.speedRoundEnabled ? 'bg-amber-500' : 'bg-slate-700'}`}
                                role="switch"
                                aria-checked={stats.speedRoundEnabled}
                                aria-label="Toggle speed rounds"
                            >
                                <motion.div
                                    animate={{ x: stats.speedRoundEnabled ? 26 : 2 }}
                                    className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>
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
