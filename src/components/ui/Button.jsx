import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variants = {
    default: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-transparent hover:shadow-indigo-500/40",
    secondary: "bg-pink-600 text-white shadow-lg shadow-pink-500/20 border-transparent hover:shadow-pink-500/40",
    outline: "bg-transparent border-white/20 text-white hover:bg-white/5",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
};

const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3 text-lg font-bold",
};

export const Button = ({
    children,
    variant = 'default',
    size = 'md',
    className,
    onClick,
    disabled,
    'aria-label': ariaLabel,
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
                "relative rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            aria-label={ariaLabel}
            {...props}
        >
            {children}
        </motion.button>
    );
};
