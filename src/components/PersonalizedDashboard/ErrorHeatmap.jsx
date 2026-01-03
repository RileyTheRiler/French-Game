import React, { useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { motion } from 'framer-motion';

const ErrorHeatmap = () => {
    const { categoryStats, errorPatterns } = useProgress();

    // Transform raw stats into heat levels (0-4)
    const processedData = useMemo(() => {
        // Collect all potential categories from CATEGORIES defined in vocabulary.js or drift
        // For now, we use the ones present in stats
        const categories = Object.keys(categoryStats);

        return categories.map(cat => {
            const stat = categoryStats[cat];
            const accuracy = stat.attempts > 0 ? (stat.correct / stat.attempts) : 1;
            const errorRate = 1 - accuracy;

            // Heat level based on error rate (more errors = "hotter")
            let level = 0;
            if (stat.attempts < 5) level = 0; // Not enough data
            else if (errorRate < 0.1) level = 1; // Great
            else if (errorRate < 0.3) level = 2; // Okay
            else if (errorRate < 0.5) level = 3; // Struggling
            else level = 4; // Critical

            return {
                id: cat,
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                level,
                accuracy: Math.round(accuracy * 100),
                attempts: stat.attempts
            };
        }).sort((a, b) => b.level - a.level); // Sort by urgency
    }, [categoryStats]);

    // Top 3 specific errors
    const topSpecificErrors = useMemo(() => {
        return Object.entries(errorPatterns)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 3)
            .map(([id, data]) => ({ id, ...data }));
    }, [errorPatterns]);

    const getHeatColor = (level) => {
        switch (level) {
            case 0: return 'bg-slate-100 border-slate-200 text-slate-400';
            case 1: return 'bg-emerald-100 border-emerald-200 text-emerald-700';
            case 2: return 'bg-yellow-100 border-yellow-200 text-yellow-700';
            case 3: return 'bg-orange-100 border-orange-200 text-orange-700';
            case 4: return 'bg-rose-100 border-rose-200 text-rose-700 animate-pulse';
            default: return 'bg-slate-100';
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>🌡️</span> Error Heatmap
                    </h3>
                    <p className="text-slate-500 text-sm">Your trouble spots visualized.</p>
                </div>
                {processedData.some(d => d.level >= 3) && (
                    <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-100">
                        Attention Needed
                    </div>
                )}
            </div>

            {processedData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic">
                    No data yet. Start practicing to see your heatmap!
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {processedData.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center cursor-help transition-all hover:scale-105 ${getHeatColor(item.level)}`}
                            title={`${item.attempts} attempts`}
                        >
                            <span className="font-bold text-lg mb-1">{item.label}</span>
                            <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded-full">
                                {item.accuracy}% Acc
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Micro-insight Footer */}
            {topSpecificErrors.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequent Stumbling Blocks</h4>
                    <ul className="space-y-2">
                        {topSpecificErrors.map(err => (
                            <li key={err.id} className="text-sm text-slate-600 flex justify-between">
                                <span>Word/Concept ID: <code className="bg-slate-100 px-1 rounded">{err.id}</code></span>
                                <span className="text-rose-500 font-bold">{err.count} misses</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ErrorHeatmap;
