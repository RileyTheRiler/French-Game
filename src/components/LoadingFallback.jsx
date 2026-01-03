import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading fallback component for Suspense boundaries
 * Provides a themed loading skeleton while route components load
 */
const LoadingFallback = ({ message = 'Loading...' }) => {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-8"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            {/* Animated loading spinner */}
            <motion.div
                className="relative w-16 h-16 mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
                <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500" />
            </motion.div>

            {/* Loading text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg font-medium"
            >
                {message}
            </motion.p>

            {/* Skeleton content preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 w-full max-w-md space-y-4"
            >
                {/* Skeleton header */}
                <div className="h-8 bg-slate-800/50 rounded-lg animate-pulse" />

                {/* Skeleton cards */}
                <div className="grid gap-4">
                    <div className="h-24 bg-slate-800/30 rounded-xl animate-pulse" />
                    <div className="h-24 bg-slate-800/30 rounded-xl animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="h-24 bg-slate-800/30 rounded-xl animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
            </motion.div>

            {/* Screen reader text */}
            <span className="sr-only">Please wait while the page content loads</span>
        </div>
    );
};

export default LoadingFallback;
