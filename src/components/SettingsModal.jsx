import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, AlertTriangle, RotateCcw, X, Check, CloudUpload, CloudDownload, UserRound } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, AlertTriangle, RotateCcw, X, Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';

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
    const { user, signIn, signUp, signOut, loading, error } = useAuth();
    const { exportData, importData, status, lastSyncedAt, syncing } = useSync();
    const [confirmReset, setConfirmReset] = React.useState(false);
    const [authMode, setAuthMode] = React.useState('signin');
    const [form, setForm] = React.useState({ email: '', password: '' });
    const [importError, setImportError] = React.useState('');
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
                    {/* Auth & Sync */}
                    <div className="glass-panel p-4 border border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
                                <UserRound />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">Account & Sync</h3>
                                <p className="text-xs text-slate-400">
                                    Sign in to sync progress, vocabulary, and achievements across devices with conflict-aware merges.
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
                                {error && <p className="text-xs text-red-400">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition disabled:opacity-70"
                                >
                                    {loading ? 'Working…' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
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
