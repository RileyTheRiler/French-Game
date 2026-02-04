import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
    default: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-transparent hover:shadow-indigo-500/40",
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-transparent hover:shadow-indigo-500/40",
    secondary: "bg-pink-600 text-white shadow-lg shadow-pink-500/20 border-transparent hover:shadow-pink-500/40",
    outline: "bg-transparent border-white/20 text-white hover:bg-white/5",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
};

const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3 text-lg font-bold",
    icon: "h-10 w-10 p-0 grid place-items-center",
};

export const Button = ({
    children,
    variant = 'default',
    size = 'md',
    isLoading,
    className,
    onClick,
    disabled,
    'aria-label': ariaLabel,
    ...props
}) => {
    const isDisabled = disabled || isLoading;

    return (
        <motion.button
            whileHover={{ scale: isDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isDisabled ? 1 : 0.98 }}
            className={cn(
                "relative rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            onClick={onClick}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-busy={isLoading}
            aria-label={ariaLabel}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
            {children}
        </motion.button>
    );
};
