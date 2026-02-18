import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '../../utils/time';

const WordItem = memo(({ text, x, y, isMatched, hint, spawnTime, hintDelay = 8, mastery, lastSeen }) => {
    // Only show hint after hintDelay seconds have passed since spawn
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        if (!hint || hintDelay === 0) {
            setShowHint(!!hint && hintDelay === 0);
            return;
        }

        const elapsed = performance.now() - spawnTime;
        const remainingDelay = Math.max(0, (hintDelay * 1000) - elapsed);

        if (remainingDelay === 0) {
            setShowHint(true);
            return;
        }

        const timer = setTimeout(() => {
            setShowHint(true);
        }, remainingDelay);

        return () => clearTimeout(timer);
    }, [hint, spawnTime, hintDelay]);

    const tooltip = `Lvl ${mastery || 1} • Last seen ${formatRelativeTime(lastSeen)}`;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute px-6 py-3 rounded-2xl font-black shadow-2xl transition-all whitespace-nowrap backdrop-blur-md border border-white/20
                ${isMatched ? 'scale-150 opacity-0 bg-emerald-500 text-white' : 'bg-white/10 text-white'}
            `}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, 0)`,
                boxShadow: isMatched ? '0 0 30px rgba(16, 185, 129, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            title={tooltip}
        >
            <span className="relative z-10 flex flex-col items-center">
                {/* Scholar Mode Metadata */}
                {hint && hint.startsWith('[') && (
                    <span className="text-[10px] uppercase tracking-widest text-indigo-300 mb-1 font-bold opacity-80">
                        {hint.replace(/[\[\]]/g, '')}
                    </span>
                )}
                <span className="text-xl">{text}</span>
            </span>

            {showHint && hint && !hint.startsWith('[') && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-3 -right-3 bg-yellow-400 text-slate-900 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-slate-900"
                >
                    ?
                </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
        </motion.div>
    );
});

export default WordItem;
