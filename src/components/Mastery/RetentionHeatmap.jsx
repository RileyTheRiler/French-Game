import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';

const RetentionHeatmap = memo(({ data }) => {
    // Generate grid data for last 52 weeks
    const grid = useMemo(() => {
        const weeks = [];
        const today = new Date();
        // Start 52 weeks ago
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (52 * 7));

        // Align to Sunday
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        let currentDate = new Date(startDate);

        for (let w = 0; w < 52; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const dayData = data.find(item => item.date === dateStr);

                week.push({
                    date: dateStr,
                    intensity: dayData ? dayData.intensity : 0,
                    count: dayData ? dayData.count : 0
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }
            weeks.push(week);
        }
        return weeks;
    }, [data]);

    const getColor = (intensity) => {
        switch (intensity) {
            case 1: return 'bg-emerald-900';
            case 2: return 'bg-emerald-700';
            case 3: return 'bg-emerald-500';
            case 4: return 'bg-emerald-400';
            default: return 'bg-slate-800';
        }
    };

    return (
        <div className="w-full overflow-x-auto p-4 md:p-6 bg-slate-900/50 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">🔥</span> Consistency Heatmap
            </h3>

            <div className="flex gap-1 min-w-max">
                {grid.map((week, wIndex) => (
                    <motion.div
                        key={wIndex}
                        className="flex flex-col gap-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: wIndex * 0.01 }}
                    >
                        {week.map((day) => (
                            <div
                                key={day.date}
                                className={`w-3 h-3 rounded-sm ${getColor(day.intensity)} relative group cursor-pointer`}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-xs text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                    {day.date}: {day.count} reviews
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-900"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-700"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                <span>More</span>
            </div>
        </div>
    );
});

export default RetentionHeatmap;
