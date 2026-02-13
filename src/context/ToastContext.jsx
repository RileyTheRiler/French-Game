import React, { createContext, useContext, useState, useCallback } from 'react';
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Trophy } from 'lucide-react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [achievement, setAchievement] = useState(null);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const showSuccess = (msg) => showToast(msg, 'success');
    const showError = (msg) => showToast(msg, 'error');

    const showAchievement = useCallback((ach) => {
        setAchievement(ach);
        // Auto dismiss after 5s
        setTimeout(() => setAchievement(null), 5000);
    }, []);

    const dismissToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showAchievement }}>
            {children}

            {/* Achievement Overlay */}
            <AnimatePresence>
                {achievement && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-4 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex items-center gap-4 max-w-md w-full mx-4 pointer-events-auto">
                            <div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                                {achievement.icon || '🏆'}
                            </div>
                            <div className="flex-1">
                                <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">Achievement Unlocked!</p>
                                <h4 className="text-white font-bold text-lg leading-tight">{achievement.title}</h4>
                                <p className="text-slate-400 text-sm">{achievement.description}</p>
                            </div>
                            <button onClick={() => setAchievement(null)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className={`
                                pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-lg border flex items-start gap-3
                                ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' : ''}
                                ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-200' : ''}
                                ${toast.type === 'info' ? 'bg-slate-900/90 border-slate-700 text-slate-200' : ''}
                            `}
                        >
                            <div className="mt-0.5">
                                {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
                                {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
                                {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
                            </div>
                            <p className="text-sm font-medium flex-1">{toast.message}</p>
                            <button onClick={() => dismissToast(toast.id)} className="opacity-50 hover:opacity-100">
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
