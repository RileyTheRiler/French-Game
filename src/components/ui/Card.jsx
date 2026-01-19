import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, hover = false, ...props }) => {
    const isInteractive = !!props.onClick;
    const Component = isInteractive ? motion.button : motion.div;

    return (
        <Component
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={cn(
                "glass-panel p-6 w-full text-slate-100",
                hover && "hover:border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer",
                isInteractive && "text-left appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                className
            )}
            type={isInteractive ? "button" : undefined}
            {...props}
        >
            {children}
        </Component>
    );
};

export const CardHeader = ({ children, className }) => (
    <div className={cn("mb-4", className)}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
    <h3 className={cn("text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400", className)}>
        {children}
    </h3>
);

export const CardContent = ({ children, className }) => (
    <div className={cn("", className)}>{children}</div>
);
