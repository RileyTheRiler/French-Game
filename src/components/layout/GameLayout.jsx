import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export const GameLayout = ({
    title,
    subtitle,
    onBack,
    children,
    headerRight
}) => {
    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-between mb-8"
            >
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full p-2 h-10 w-10">
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
                            {title}
                        </h1>
                        {subtitle && <p className="text-slate-400 text-sm hidden md:block">{subtitle}</p>}
                    </div>
                </div>

                {headerRight && (
                    <div className="flex items-center gap-4">
                        {headerRight}
                    </div>
                )}
            </motion.header>

            {/* Main Content Area */}
            <main className="flex-1 relative">
                {children}
            </main>
        </div>
    );
};
