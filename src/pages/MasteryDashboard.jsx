import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useVocabulary } from '../context/VocabularyContext';
import { getRetentionData, getCategorySkills, predictFluency } from '../utils/analytics';
import RetentionHeatmap from '../components/Mastery/RetentionHeatmap';
import SkillRadar from '../components/Mastery/SkillRadar';
import FluencyProjection from '../components/Mastery/FluencyProjection';

const MasteryDashboard = () => {
    const { vocabulary, CATEGORIES } = useVocabulary();

    const retentionData = useMemo(() => getRetentionData(vocabulary), [vocabulary]);
    const skillData = useMemo(() => getCategorySkills(vocabulary, CATEGORIES), [vocabulary, CATEGORIES]);
    const fluencyData = useMemo(() => predictFluency(vocabulary), [vocabulary]);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-24 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black mb-2 title-gradient">Mastery Dashboard</h1>
                    <p className="text-slate-400">Deep insights into your language acquisition journey.</p>
                </motion.header>

                {/* Top Row: Heatmap */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <RetentionHeatmap data={retentionData} />
                </motion.section>

                {/* Middle Row: Radar & Projection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col"
                    >
                        <SkillRadar data={skillData} />
                        {/* Legend/Info below Radar */}
                        <div className="mt-4 p-4 bg-slate-900/30 rounded-xl border border-white/5 text-sm text-slate-400">
                            <p>💡 <strong>Tip:</strong> This chart shows where your vocabulary is concentrated. Try exploring new neighborhoods to balance your skills!</p>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FluencyProjection data={fluencyData} />

                        {/* Additional Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-1">Total Words</h4>
                                <p className="text-2xl font-bold text-white">{vocabulary.length}</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-1">Mastery Rate</h4>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {Math.round((vocabulary.filter(w => w.level >= 5).length / Math.max(1, vocabulary.length)) * 100)}%
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>

            </div>
        </div>
    );
};

export default MasteryDashboard;
