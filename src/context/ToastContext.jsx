/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Trophy, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toastIdCounter = useRef(0);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type, message, duration = 3000, action = null) => {
        const id = toastIdCounter.current++;
        const newToast = { id, type, message, action, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const showSuccess = useCallback((msg) => addToast('success', msg), [addToast]);
    const showError = useCallback((msg) => addToast('error', msg), [addToast]);
    const showInfo = useCallback((msg) => addToast('info', msg), [addToast]);
    const showAchievement = useCallback((achievement) => {
        addToast('achievement', `Unlocked: ${achievement.title}`, 5000, {
            label: 'View',
            onClick: () => console.log('View achievement', achievement.id) // Mock nav
        });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo, showAchievement }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-green-400" size={20} />,
        error: <AlertCircle className="text-red-400" size={20} />,
        info: <Info className="text-blue-400" size={20} />,
        achievement: <Trophy className="text-yellow-400" size={20} />
    };

    const bgColors = {
        success: 'bg-slate-900 border-green-500/30',
        error: 'bg-slate-900 border-red-500/30',
        info: 'bg-slate-900 border-blue-500/30',
        achievement: 'bg-slate-900 border-yellow-500/30'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${bgColors[toast.type]}`}
        >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{toast.message}</p>
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className="mt-2 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </motion.div>
    );
};

export const useToast = () => useContext(ToastContext);
