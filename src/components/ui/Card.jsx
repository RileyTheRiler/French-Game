import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Card = memo(({ children, className, hover = false, ...props }) => {
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
});

Card.displayName = 'Card';

export const CardHeader = memo(({ children, className }) => (
    <div className={cn("mb-4", className)}>{children}</div>
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = memo(({ children, className }) => (
    <h3 className={cn("text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400", className)}>
        {children}
    </h3>
));

CardTitle.displayName = 'CardTitle';

export const CardContent = memo(({ children, className }) => (
    <div className={cn("", className)}>{children}</div>
));

CardContent.displayName = 'CardContent';
