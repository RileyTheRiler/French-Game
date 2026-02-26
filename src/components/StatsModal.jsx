import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Trophy, Calendar, Zap, BookOpen, Star, Brain,
    Target, Clock, MessageSquare, TrendingUp, Activity, BarChart2
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { calculateLevel } from '../utils/gamificationUtils';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

// Utility for radar chart (mock)
const RadarChart = ({ data }) => (
    <div className="relative w-full h-48 flex items-center justify-center bg-slate-800/50 rounded-xl border border-white/5">
        <p className="text-xs text-slate-500">Skills Radar Visualization</p>
        {/* In a real app, use Recharts or Chart.js here */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Activity size={64} />
        </div>
    </div>
);

const StatsModal = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { stats, level, progressToNextLevel, achievements, getWeeklySummary, difficultySettings } = useProgress();
    const { getDueWords, vocabulary } = useVocabulary();
    const [activeTab, setActiveTab] = useState('overview'); // overview, insights

    if (!isOpen) return null;

    const weeklyData = getWeeklySummary();
    const maxWeeklyXP = Math.max(...weeklyData.map(d => d.xp), 1);

    const formatNumber = (num) => new Intl.NumberFormat(i18n.language).format(num);

    const masteredCount = vocabulary.filter(w => (stats.weakWords?.[w.id]?.strength || 0) > 80).length;
    const learningCount = vocabulary.filter(w => (stats.weakWords?.[w.id]?.strength || 0) > 0 && (stats.weakWords?.[w.id]?.strength || 0) <= 80).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 bg-slate-900/50 backdrop-blur-md z-10 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <BarChart2 className="text-indigo-400" /> {t('stats.title')}
                        </h2>
                        <p className="text-slate-400 text-sm">{t('stats.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 border-b border-white/5 gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'overview' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('stats.tabs.overview')}
                        {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'insights' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('stats.tabs.insights')}
                        {activeTab === 'insights' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card className="p-4 bg-slate-800/50 border-white/5 flex flex-col items-center text-center">
                                        <div className="p-3 bg-orange-500/20 rounded-full mb-3 text-orange-400">
                                            <Zap size={24} />
                                        </div>
                                        <span className="text-2xl font-black text-white">{stats.streak}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">{t('stats.streak')}</span>
                                    </Card>
                                    <Card className="p-4 bg-slate-800/50 border-white/5 flex flex-col items-center text-center">
                                        <div className="p-3 bg-emerald-500/20 rounded-full mb-3 text-emerald-400">
                                            <BookOpen size={24} />
                                        </div>
                                        <span className="text-2xl font-black text-white">{stats.wordsLearned}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">{t('stats.learned')}</span>
                                    </Card>
                                    <Card className="p-4 bg-slate-800/50 border-white/5 flex flex-col items-center text-center">
                                        <div className="p-3 bg-yellow-500/20 rounded-full mb-3 text-yellow-400">
                                            <Trophy size={24} />
                                        </div>
                                        <span className="text-2xl font-black text-white">{achievements?.length || 0}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">{t('stats.achievements')}</span>
                                    </Card>
                                    <Card className="p-4 bg-slate-800/50 border-white/5 flex flex-col items-center text-center">
                                        <div className="p-3 bg-purple-500/20 rounded-full mb-3 text-purple-400">
                                            <Star size={24} />
                                        </div>
                                        <span className="text-2xl font-black text-white">{stats.perfectQuizzes || 0}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">{t('stats.perfect_runs')}</span>
                                    </Card>
                                </div>

                                {/* Weekly Activity Graph */}
                                <Card className="p-6 bg-slate-800/30 border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Activity className="text-indigo-400" size={20} />
                                        {t('stats.last_7_days')}
                                    </h3>
                                    <div className="flex justify-between items-end h-32 gap-2">
                                        {weeklyData.map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="relative w-full flex justify-end flex-col h-full bg-slate-800/50 rounded-lg overflow-hidden group-hover:bg-slate-800 transition-colors">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${(day.xp / maxWeeklyXP) * 100}%` }}
                                                        className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 opacity-80 group-hover:opacity-100 transition-opacity min-h-[4px]"
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{day.date.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Vocabulary Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-6 bg-slate-800/30 border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Brain className="text-pink-400" size={20} />
                                            {t('stats.vocab_status')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-emerald-400 font-bold">{t('stats.mastered')}</span>
                                                    <span className="text-slate-400">{masteredCount} words</span>
                                                </div>
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${(masteredCount / Math.max(vocabulary.length, 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-amber-400 font-bold">{t('stats.learning')}</span>
                                                    <span className="text-slate-400">{learningCount} words</span>
                                                </div>
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500" style={{ width: `${(learningCount / Math.max(vocabulary.length, 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-800/50 rounded-xl flex items-center justify-between">
                                                <span className="text-sm text-slate-400">Total Words Unlocked</span>
                                                <span className="text-xl font-bold text-white">{vocabulary.length}</span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Category Performance */}
                                    <Card className="p-6 bg-slate-800/30 border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Target className="text-cyan-400" size={20} />
                                            {t('stats.category_accuracy')}
                                        </h3>
                                        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                            {Object.entries(stats.categoryPerformance || {}).map(([cat, data]) => (
                                                <div key={cat} className="flex items-center gap-3">
                                                    <div className="w-24 text-xs font-bold text-slate-400 truncate capitalize">{cat}</div>
                                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${data.accuracy > 0.8 ? 'bg-emerald-500' : data.accuracy > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${(data.accuracy || 0) * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-8 text-right text-xs font-mono text-white">
                                                        {Math.round((data.accuracy || 0) * 100)}%
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.keys(stats.categoryPerformance || {}).length === 0 && (
                                                <div className="text-center py-8 text-slate-500 text-sm italic">
                                                    {t('stats.no_category_data')}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="insights"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-6 bg-slate-800/30 border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4">Skills Breakdown</h3>
                                        <RadarChart />
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-slate-400">
                                                Your strongest skill is <strong className="text-indigo-400">Vocabulary</strong>.
                                                Focus on <strong className="text-pink-400">Listening</strong> to balance your profile.
                                            </p>
                                        </div>
                                    </Card>

                                    <div className="space-y-4">
                                        <Card className="p-6 bg-slate-800/30 border-white/5">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <TrendingUp className="text-emerald-400" size={20} />
                                                Learning Pace
                                            </h3>
                                            <div className="flex items-end gap-2 h-24 mb-2">
                                                {/* Mock Trend Data */}
                                                {[40, 65, 50, 80, 95, 70, 85].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm relative group">
                                                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" style={{ height: `${h}%` }} />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-400 text-center">Words learned per day (last 7 days)</p>
                                        </Card>

                                        <Card className="p-6 bg-red-500/5 border-red-500/10">
                                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                                <AlertTriangle className="text-red-400" size={20} />
                                                {t('stats.needs_review')}
                                            </h3>
                                            <div className="space-y-2">
                                                {Object.entries(stats.errorPatterns || {})
                                                    .sort((a, b) => b[1].count - a[1].count)
                                                    .slice(0, 3)
                                                    .map(([wordId, data]) => {
                                                        const word = vocabulary.find(w => w.id === wordId);
                                                        return word ? (
                                                            <div key={wordId} className="flex justify-between items-center text-sm">
                                                                <span className="text-slate-300">{word.french}</span>
                                                                <Badge variant="destructive" className="text-[10px] h-5 px-2">
                                                                    {data.count} {t('stats.misses')}
                                                                </Badge>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                {Object.keys(stats.errorPatterns || {}).length === 0 && (
                                                    <p className="text-slate-500 text-sm">No trouble words yet! Keep it up.</p>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Missing import fix
import { AlertTriangle } from 'lucide-react';

export default StatsModal;
