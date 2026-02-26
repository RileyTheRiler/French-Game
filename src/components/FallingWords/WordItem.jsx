import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime } from '../../utils/time';

const WordItem = memo(({ text, x, y, isMatched, hint, spawnTime, hintDelay = 8, mastery, lastSeen }) => {
    // Only show hint after hintDelay seconds have passed since spawn
    const [showHint, setShowHint] = React.useState(false);

    React.useEffect(() => {
        if (!spawnTime || !hint) return;

        // Calculate delay in ms
        const delayMs = hintDelay * 1000;

        // Check if enough time has already passed (e.g. on re-render)
        const elapsed = performance.now() - spawnTime;
        if (elapsed > delayMs) {
            setShowHint(true);
            return;
        }

        const timer = setTimeout(() => {
            setShowHint(true);
        }, delayMs - elapsed);

        return () => clearTimeout(timer);
    }, [spawnTime, hint, hintDelay]);

    const getMasteryColor = (level) => {
        if (level >= 5) return 'border-emerald-500 shadow-emerald-500/50';
        if (level >= 3) return 'border-amber-500 shadow-amber-500/50';
        return 'border-white/20';
    };

    return (
        <AnimatePresence>
            {!isMatched && (
                <motion.div
                    className="absolute transform -translate-x-1/2 will-change-transform"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                >
                    <div className={`
                        relative px-6 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-md
                        border-2 text-white font-bold text-lg shadow-xl
                        ${getMasteryColor(mastery)}
                    `}>
                        {text}

                        {/* Hint Overlay */}
                        <AnimatePresence>
                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
                                >
                                    {hint}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mastery Indicator (Optional) */}
                        {mastery > 0 && (
                            <div className="absolute -right-2 -bottom-2 bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full border border-white/10">
                                Lvl {mastery}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default WordItem;
