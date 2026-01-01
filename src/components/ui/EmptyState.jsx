import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Ghost } from 'lucide-react';

export const EmptyState = ({
    icon: Icon = Ghost,
    title,
    description,
    actionLabel,
    onAction,
    children
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto min-h-[400px]"
        >
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/20">
                <Icon size={40} className="text-slate-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
                {title}
            </h3>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                {description}
            </p>

            {children && (
                <div className="w-full mb-8">
                    {children}
                </div>
            )}

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="btn-primary"
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
};
