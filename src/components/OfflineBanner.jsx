import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800 border-b border-slate-700 text-slate-300 relative z-50"
                    role="alert"
                    aria-live="polite"
                >
                    <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
                        <WifiOff className="w-4 h-4 text-rose-400" aria-hidden="true" />
                        <span>You are currently offline. Some features may be unavailable.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineBanner;
