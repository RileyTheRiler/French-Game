import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    primary: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const Badge = ({ children, variant = 'default', className }) => {
    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
