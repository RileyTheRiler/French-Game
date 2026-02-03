/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const ToastProvider = ({ children }) => {
    const { user } = useAuth();
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const showAchievement = useCallback((achievement) => {
        const id = Date.now();
        setToasts(prev => [...prev, {
            id,
            message: `🏆 Unlocked: ${achievement.title}`,
            type: 'achievement',
            icon: achievement.icon,
            xp: achievement.xpReward
        }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
    const showError = useCallback((message) => showToast(message, 'error'), [showToast]);

    // Welcome back toast
    useEffect(() => {
        if (user) {
            setTimeout(() => {
                showToast(`Welcome back, ${user.email.split('@')[0]}!`, 'success');
            }, 0);
        }
    }, [user, showToast]);

    const value = useMemo(() => ({
        showToast,
        showAchievement,
        showSuccess,
        showError
    }), [showToast, showAchievement, showSuccess, showError]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const bgColors = {
        info: 'bg-slate-800 border-slate-700 text-white',
        success: 'bg-emerald-500/90 border-emerald-400 text-white',
        error: 'bg-red-500/90 border-red-400 text-white',
        achievement: 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300 text-white'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
            className={`
                ${bgColors[toast.type] || bgColors.info}
                px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md
                flex items-center gap-3 min-w-[300px] pointer-events-auto cursor-pointer
            `}
            onClick={onClose}
        >
            {toast.type === 'achievement' && <span className="text-2xl">{toast.icon || '🏆'}</span>}
            <div className="flex-1">
                <p className="font-bold text-sm">{toast.message}</p>
                {toast.xp && <p className="text-xs opacity-90">+{toast.xp} XP Earned</p>}
            </div>
        </motion.div>
    );
};

export const useToast = () => useContext(ToastContext);
