import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flag, Calendar } from 'lucide-react';

const FluencyProjection = memo(({ data }) => {
    // data: { currentWordCount, velocity, milestones: [{ level, words, date }] }

    // Calculate progress percentage relative to B2 (4000 words)
    const maxWords = 4000;
    const progress = Math.min(100, (data.currentWordCount / maxWords) * 100);

    return (
        <div className="w-full bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-pink-400">🚀</span> Fluency Time Machine
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        At your current pace of <span className="text-white font-bold">{data.velocity} words/week</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Current Vocabulary</p>
                    <p className="text-3xl font-bold text-white">{data.currentWordCount}</p>
                </div>
            </div>

            {/* Timeline Visual */}
            <div className="relative pt-6 pb-2 px-2">
                {/* Base Line */}
                <div className="absolute top-8 left-0 w-full h-1 bg-slate-800 rounded-full"></div>

                {/* Progress Line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-8 left-0 h-1 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"
                />

                {/* Current Position Marker */}
                <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-6 -translate-x-1/2 flex flex-col items-center"
                >
                    <Rocket size={20} className="text-white transform -rotate-45 mb-1" strokeWidth={2.5} />
                    <div className="w-1 h-3 bg-white/50"></div>
                </motion.div>

                {/* Milestones */}
                <div className="flex justify-between items-start relative mt-4">
                    {data.milestones.map((m, i) => {
                        const pos = (m.words / maxWords) * 100;

                        return (
                            <div key={i} className="flex flex-col items-center" style={{ position: 'absolute', left: `${pos}%`, transform: 'translateX(-50%)' }}>
                                {/* Tick */}
                                <div className="w-px h-3 bg-slate-600 absolute -top-4"></div>

                                <div className="text-center bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg border border-white/5 shadow-xl min-w-[80px]">
                                    <h4 className="font-bold text-indigo-300">{m.level}</h4>
                                    <p className="text-[10px] text-slate-400">{m.words} words</p>
                                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white bg-white/10 px-1.5 py-0.5 rounded-full">
                                        <Calendar size={8} /> {m.date}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Spacer to prevent overlap */}
                <div className="h-20"></div>
            </div>
        </div>
    );
});

export default FluencyProjection;
