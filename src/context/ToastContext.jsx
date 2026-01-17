import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Check, AlertCircle, Info } from 'lucide-react';

export const ToastContext = createContext();

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, ...toast }]);

        // Auto-remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, toast.duration || 4000);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Helper functions
    const showAchievement = useCallback((achievement) => {
        addToast({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            message: achievement.title,
            icon: achievement.icon,
            xp: achievement.xpReward,
            duration: 5000
        });
    }, [addToast]);

    const showSuccess = useCallback((message) => {
        addToast({ type: 'success', message, duration: 3000 });
    }, [addToast]);

    const showError = useCallback((message) => {
        addToast({ type: 'error', message, duration: 4000 });
    }, [addToast]);

    const showInfo = useCallback((message) => {
        addToast({ type: 'info', message, duration: 3000 });
    }, [addToast]);

    // Optimize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        addToast,
        removeToast,
        showAchievement,
        showSuccess,
        showError,
        showInfo
    }), [addToast, removeToast, showAchievement, showSuccess, showError, showInfo]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const Toast = ({ toast, onClose }) => {
    const getStyles = () => {
        switch (toast.type) {
            case 'achievement':
                return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50';
            case 'success':
                return 'bg-emerald-500/20 border-emerald-500/50';
            case 'error':
                return 'bg-red-500/20 border-red-500/50';
            default:
                return 'bg-slate-800/90 border-white/10';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'achievement':
                return <span className="text-2xl">{toast.icon || '🏆'}</span>;
            case 'success':
                return <Check size={20} className="text-emerald-400" />;
            case 'error':
                return <AlertCircle size={20} className="text-red-400" />;
            default:
                return <Info size={20} className="text-blue-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`pointer-events-auto min-w-[280px] max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${getStyles()}`}
        >
            <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <p className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-1">
                            {toast.title}
                        </p>
                    )}
                    <p className="text-white font-medium">{toast.message}</p>
                    {toast.xp && (
                        <p className="text-sm text-amber-300 mt-1 font-bold">+{toast.xp} XP</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={16} className="text-white/60" />
                </button>
            </div>
        </motion.div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
