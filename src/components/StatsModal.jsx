import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Book, Flame, Trophy, Clock, Target, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">{label}</span>
        </div>
        <p className="text-3xl font-black text-white">{value}</p>
        {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
    </div>
);

const StatsModal = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { stats, level, progressToNextLevel, achievements, getWeeklySummary, difficultySettings } = useProgress();
    const { vocabulary, CATEGORIES } = useVocabulary();
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen) return null;

    const totalWords = vocabulary?.length || 0;
    const masteredWords = vocabulary?.filter(w => w.level >= 5)?.length || 0;
    const learningWords = vocabulary?.filter(w => w.level >= 1 && w.level < 5)?.length || 0;
    const categoryPerformance = stats?.categoryPerformance || {};

    // Data for Insights
    const weeklyData = getWeeklySummary ? getWeeklySummary() : [];
    const maxDailyXp = Math.max(...weeklyData.map(d => d.xp || 0), 100); // Scale max

    // Sort errors
    const troubledWords = Object.entries(stats.errorPatterns || {})
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([id, data]) => {
            const word = vocabulary?.find(w => w.id === parseInt(id) || w.id === id);
            return word ? { ...word, ...data } : null;
        })
        .filter(Boolean);

    // Category Accuracy
    const categoriesList = Object.entries(stats.categoryStats || {}).map(([cat, data]) => ({
        name: CATEGORIES?.[cat]?.name || cat,
        accuracy: data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0,
        attempts: data.attempts
    })).sort((a, b) => b.attempts - a.attempts).slice(0, 6);

    const formatNumber = (num) => {
        return new Intl.NumberFormat(i18n.language).format(num);
    };

    // Streak Calendar Data (Last 30 days)
    const getCalendarDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const hasActivity = stats.dailyStats?.[dateStr]?.xp > 0 || stats.lastActiveDate === dateStr;
            const isToday = i === 0;
            // Mock freeze logic: if not active but streak was maintained, it was frozen (simplified)
            // ideally we'd track freeze usage per day in stats
            const isFrozen = false;

            days.push({ date: d, hasActivity, isToday, isFrozen });
        }
        return days;
    };
    const calendarDays = getCalendarDays();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <Card className="p-0 border-white/10 shadow-3xl flex flex-col h-full max-h-full">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/20 to-violet-500/20 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/30 rounded-2xl">
                                    <BarChart3 size={28} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{t('stats.title')}</h2>
                                    <p className="text-indigo-300/80 text-sm font-medium">
                                        {t('stats.subtitle')}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0">
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 shrink-0">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'overview'
                                    ? 'border-indigo-500 text-white bg-white/5'
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                {t('stats.tabs.overview')}
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'insights'
                                    ? 'border-indigo-500 text-white bg-white/5'
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                {t('stats.tabs.insights')}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {activeTab === 'overview' ? (
                                <div className="space-y-6">
                                    {/* Level Progress */}
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1">{t('menu.current_level')}</p>
                                                <p className="text-5xl font-black text-white">{level}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1">{t('menu.total_xp')}</p>
                                                <p className="text-3xl font-bold text-indigo-400">{formatNumber(stats.xp || 0)}</p>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressToNextLevel}%` }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                            />
                                        </div>
                                        <p className="text-sm text-slate-400 mt-2 text-center">
                                            {formatNumber(Math.round(progressToNextLevel))}% {t('menu.to_level')} {level + 1}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <StatCard icon={Flame} label={t('stats.streak')} value={`${formatNumber(stats.streak || 0)}`} color="bg-orange-500/30" subValue="days" />
                                        <StatCard icon={Book} label={t('stats.learned')} value={formatNumber(stats.wordsLearned || 0)} color="bg-emerald-500/30" />
                                        <StatCard icon={Trophy} label={t('stats.achievements')} value={`${achievements?.length || 0}/12`} color="bg-amber-500/30" />
                                        <StatCard icon={Target} label={t('stats.stories')} value={formatNumber(stats.storiesCompleted || 0)} color="bg-blue-500/30" />
                                        <StatCard icon={TrendingUp} label={t('stats.roleplay')} value={formatNumber(stats.conversationsCompleted || 0)} color="bg-purple-500/30" />
                                        <StatCard icon={Clock} label={t('stats.perfect_runs')} value={formatNumber(stats.perfectQuizzes || 0)} color="bg-pink-500/30" />
                                    </div>

                                    {/* Streak Calendar */}
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Calendar size={20} className="text-orange-400" />
                                            Streak Calendar
                                        </h3>
                                        <div className="flex flex-col items-center">
                                            <div className="grid grid-cols-7 gap-2 mb-2">
                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                    <div key={d} className="text-[10px] text-slate-500 text-center font-bold uppercase w-8">
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {Array(calendarDays[0].date.getDay()).fill(null).map((_, i) => (
                                                    <div key={`empty-${i}`} className="w-8 h-8" />
                                                ))}
                                                {calendarDays.map((day, i) => (
                                                    <div key={i} className="flex justify-center relative group">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all
                                                                ${day.isToday ? 'ring-2 ring-white' : ''}
                                                                ${day.hasActivity
                                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                                    : 'bg-slate-800 text-slate-600'
                                                                }
                                                            `}
                                                        >
                                                            {day.date.getDate()}
                                                        </div>
                                                        {day.hasActivity && (
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-10">
                                                                Active
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-4 mt-4 text-xs text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                                    <span>Active Day</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-slate-800" />
                                                    <span>Missed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vocabulary Breakdown */}
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Book size={20} className="text-emerald-400" />
                                            {t('stats.vocab_status')}
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">{t('stats.mastered')}</span>
                                                <Badge variant="success">{formatNumber(masteredWords)}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">{t('stats.learning')}</span>
                                                <Badge variant="primary">{formatNumber(learningWords)}</Badge>
                                            </div>
                                            <div className="pt-4 border-t border-white/10">
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                                    <div style={{ width: `${totalWords > 0 ? (masteredWords / totalWords) * 100 : 0}%` }} className="h-full bg-emerald-500" />
                                                    <div style={{ width: `${totalWords > 0 ? (learningWords / totalWords) * 100 : 0}%` }} className="h-full bg-indigo-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Weekly Activity Chart */}
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <Calendar size={20} className="text-blue-400" />
                                            {t('stats.last_7_days')}
                                        </h3>
                                        <div className="h-40 flex items-end gap-2 justify-between px-2">
                                            {weeklyData.map((day, i) => (
                                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${(day.xp / maxDailyXp) * 100}%` }}
                                                        className="w-full bg-indigo-500/50 rounded-t-sm group-hover:bg-indigo-400 transition-colors relative min-h-[4px]"
                                                    >
                                                        {day.xp > 0 && (
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                                                                {day.xp} XP
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">{day.date.split(' ')[0]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category Performance */}
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Target size={20} className="text-pink-400" />
                                            {t('stats.category_accuracy')}
                                        </h3>
                                        <div className="space-y-4">
                                            {categoriesList.length > 0 ? categoriesList.map((cat, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-300 font-medium">{cat.name}</span>
                                                        <span className={`font-bold ${cat.accuracy >= 80 ? 'text-emerald-400' : cat.accuracy >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                                                            {cat.accuracy}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${cat.accuracy}%` }}
                                                            className={`h-full rounded-full ${cat.accuracy >= 80 ? 'bg-emerald-500' : cat.accuracy >= 50 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                                                        />
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-slate-500 text-sm text-center py-4">{t('stats.no_category_data')}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Problem Words */}
                                    {troubledWords.length > 0 && (
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <AlertCircle size={20} className="text-amber-400" />
                                                {t('stats.needs_review')}
                                            </h3>
                                            <div className="space-y-3">
                                                {troubledWords.map((word, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                        <div>
                                                            <p className="font-bold text-white">{word.french}</p>
                                                            <p className="text-xs text-slate-400">{word.english}</p>
                                                        </div>
                                                        <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                                                            {word.count} {t('stats.misses')}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StatsModal;
