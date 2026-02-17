import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from './Button';
import SoundManager from '../../utils/SoundManager';

export const SuccessState = ({
    title = "Success!",
    description,
    onAction,
    actionLabel = "Continue",
    secondaryAction,
    playSound = true,
    // eslint-disable-next-line no-unused-vars
    children
}) => {

    useEffect(() => {
        if (playSound) {
            SoundManager.playLevelUp();
        }
    }, [playSound]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center max-w-md mx-auto">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/30"
            >
                <Check size={48} className="text-white stroke-[3]" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black text-white mb-4"
            >
                {title}
            </motion.h2>

            {description && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-300 text-lg mb-8"
                >
                    {description}
                </motion.p>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 w-full"
            >
                <Button
                    onClick={onAction}
                    className="w-full py-4 text-lg font-bold bg-white text-emerald-900 hover:bg-emerald-50"
                >
                    {actionLabel}
                </Button>
                {secondaryAction}
            </motion.div>
        </div>
    );
};
