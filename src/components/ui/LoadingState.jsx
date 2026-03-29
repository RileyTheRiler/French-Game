import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Loading...", fullScreen = false }) => {
    const content = (
        <div
            className="flex flex-col items-center justify-center space-y-4"
            role="status"
            aria-live="polite"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                aria-hidden="true"
            >
                <Loader2 size={48} className="text-indigo-400" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="text-slate-400 font-medium tracking-wide"
            >
                {message}
            </motion.p>
        </div>
    );

    if (fullScreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
                aria-busy="true"
            >
                {content}
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center">
            {content}
        </div>
    );
};
