import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Book, Flame, Trophy, Clock, Target, BarChart3 } from 'lucide-react';
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
    const { stats, level, progressToNextLevel, achievements } = useProgress();
    const { vocabulary } = useVocabulary();

    if (!isOpen) return null;

    const totalWords = vocabulary?.length || 0;
    const masteredWords = vocabulary?.filter(w => w.level >= 5)?.length || 0;
    const learningWords = vocabulary?.filter(w => w.level >= 1 && w.level < 5)?.length || 0;

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
                    className="w-full max-w-2xl max-h-[85vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <Card className="p-0 border-white/10 shadow-3xl">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/20 to-violet-500/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/30 rounded-2xl">
                                    <BarChart3 size={28} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Your Statistics</h2>
                                    <p className="text-indigo-300/80 text-sm font-medium">
                                        Track your learning journey
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0">
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {/* Level Progress */}
                            <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1">Current Level</p>
                                        <p className="text-5xl font-black text-white">{level}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1">Total XP</p>
                                        <p className="text-3xl font-bold text-indigo-400">{stats.xp || 0}</p>
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
                                    {Math.round(progressToNextLevel)}% to Level {level + 1}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                <StatCard
                                    icon={Flame}
                                    label="Current Streak"
                                    value={`${stats.streak || 0}`}
                                    color="bg-orange-500/30"
                                    subValue="days"
                                />
                                <StatCard
                                    icon={Book}
                                    label="Words Learned"
                                    value={stats.wordsLearned || 0}
                                    color="bg-emerald-500/30"
                                />
                                <StatCard
                                    icon={Trophy}
                                    label="Achievements"
                                    value={`${achievements?.length || 0}/12`}
                                    color="bg-amber-500/30"
                                />
                                <StatCard
                                    icon={Target}
                                    label="Stories Done"
                                    value={stats.storiesCompleted || 0}
                                    color="bg-blue-500/30"
                                />
                                <StatCard
                                    icon={TrendingUp}
                                    label="Conversations"
                                    value={stats.conversationsCompleted || 0}
                                    color="bg-purple-500/30"
                                />
                                <StatCard
                                    icon={Clock}
                                    label="Perfect Quizzes"
                                    value={stats.perfectQuizzes || 0}
                                    color="bg-pink-500/30"
                                />
                            </div>

                            {/* Vocabulary Breakdown */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 mb-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Book size={20} className="text-emerald-400" />
                                    Vocabulary Progress
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Total Words</span>
                                        <span className="font-bold text-white">{totalWords}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Mastered (Lvl 5+)</span>
                                        <Badge variant="success">{masteredWords}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Learning</span>
                                        <Badge variant="primary">{learningWords}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">New</span>
                                        <Badge variant="outline">{totalWords - masteredWords - learningWords}</Badge>
                                    </div>

                                    {/* Mastery Progress Bar */}
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Overall Mastery</span>
                                            <span>{totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${totalWords > 0 ? (masteredWords / totalWords) * 100 : 0}%` }}
                                                className="h-full bg-emerald-500"
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${totalWords > 0 ? (learningWords / totalWords) * 100 : 0}%` }}
                                                className="h-full bg-indigo-500"
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Learning
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-slate-600" /> New
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coins & Shop */}
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">💰</span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-amber-300/80 font-bold">Your Coins</p>
                                        <p className="text-2xl font-black text-amber-400">{stats.coins || 0}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-amber-300/60">Streak Freezes</p>
                                    <p className="text-lg font-bold text-amber-300">❄️ {stats.inventory?.['streak_freeze'] || 0}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StatsModal;
