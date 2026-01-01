import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Trophy, Play, MessageCircle, PenTool, Map, Star, Lock, Settings, Mic, ShoppingBag, Award, Flame, BookOpen, BarChart3, Target, Zap, Compass } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import LeaderboardModal from './LeaderboardModal';
import DictionaryModal from './DictionaryModal';
import SettingsModal from './SettingsModal';
import ShopModal from './ShopModal';
import AchievementsModal from './AchievementsModal';
import GrammarModal from './GrammarModal';
import StatsModal from './StatsModal';
import DailyChallengeWidget from './DailyChallengeWidget';
import { getTipOfTheDay } from '../data/dailyTips';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const MainMenu = () => {
    const navigate = useNavigate();
    const { stats, level, progressToNextLevel, setTargetCefr, setWeeklyGoal } = useProgress();
    const { getDueWords, CATEGORIES } = useVocabulary();
    const dueCount = getDueWords().length;
    const [targetLevel, setTargetLevel] = useState(stats.targetCefr || 'B1');
    const [weeklySessions, setWeeklySessions] = useState(stats.weeklyGoal?.sessions || 5);
    const [weeklyMinutes, setWeeklyMinutes] = useState(stats.weeklyGoal?.minutes || 120);

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showDictionary, setShowDictionary] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showGrammar, setShowGrammar] = useState(false);
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        setTargetCefr(targetLevel);
    }, [targetLevel, setTargetCefr]);

    useEffect(() => {
        setWeeklyGoal({ sessions: weeklySessions, minutes: weeklyMinutes });
    }, [setWeeklyGoal, weeklyMinutes, weeklySessions]);

    const categoryPerformance = stats?.categoryPerformance || {};
    const toughestCategory = useMemo(() => {
        const entries = Object.entries(categoryPerformance);
        if (!entries.length) return null;
        return entries.reduce((lowest, [category, perf]) => {
            const accuracy = perf.accuracy ?? (perf.correct / (perf.attempts || 1));
            if (!lowest || accuracy < lowest.accuracy) {
                return { category, accuracy, response: perf.averageResponseTime };
            }
            return lowest;
        }, null);
    }, [categoryPerformance]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const menuItems = [
        {
            id: 'neighborhood',
            title: 'Le Quartier',
            description: 'Explore the hub and talk to locals!',
            icon: Map,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/neighborhood'
        },
        {
            id: 'fallingWords',
            title: 'Falling Words',
            description: 'Type fast before words hit the ground.',
            icon: Star, // Replace with appropriate game icon
            color: 'text-violet-400',
            borderColor: 'border-l-violet-500',
            minLevel: 1,
            path: '/game/falling-words'
        },
        {
            id: 'studySession',
            title: 'Study Session',
            description: 'Review due words with flashcards.',
            icon: Book,
            color: 'text-pink-400',
            borderColor: 'border-l-pink-500',
            minLevel: 1,
            path: '/study-session'
        },
        {
            id: 'dailyMix',
            title: 'Daily Mix',
            description: 'Interleaved practice for retention.',
            icon: Play,
            color: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            minLevel: 2,
            path: '/game/daily-mix'
        },
        {
            id: 'conversation',
            title: 'Roleplay',
            description: 'Real-world scenarios with AI.',
            icon: MessageCircle,
            color: 'text-purple-400',
            borderColor: 'border-l-purple-500',
            minLevel: 2,
            path: '/game/conversation'
        },
        {
            id: 'storyMode',
            title: 'Story Mode',
            description: 'Read immersive French stories.',
            icon: Book,
            color: 'text-emerald-400',
            borderColor: 'border-l-emerald-500',
            minLevel: 3,
            path: '/game/story'
        },
        {
            id: 'sentenceBuilder',
            title: 'Sentence Builder',
            description: 'Construct sentences block by block.',
            icon: PenTool,
            color: 'text-blue-400',
            borderColor: 'border-l-blue-500',
            minLevel: 1,
            path: '/game/sentence-builder'
        },
        {
            id: 'pronunciation',
            title: 'Pronunciation',
            description: 'Master your French accent with AI feedback.',
            icon: Mic,
            color: 'text-rose-400',
            borderColor: 'border-l-rose-500',
            minLevel: 3,
            path: '/pronunciation'
        },
        {
            id: 'grammar',
            title: 'Grammar Drills',
            description: 'Practice verb conjugation and grammar rules.',
            icon: PenTool,
            color: 'text-cyan-400',
            borderColor: 'border-l-cyan-500',
            minLevel: 1,
            path: '/game/grammar'
        }
    ];

    const nextActions = useMemo(() => {
        const actions = [];
        if (dueCount > 0) {
            actions.push({
                title: 'Clear your review queue',
                description: `${dueCount} cards are waiting in spaced repetition.`,
                cta: 'Study Session',
                onClick: () => navigate('/study-session'),
                icon: Book
            });
        }

        if (toughestCategory) {
            const cat = CATEGORIES?.[toughestCategory.category];
            actions.push({
                title: `Strengthen ${cat?.name || toughestCategory.category}`,
                description: `Accuracy ${Math.round((toughestCategory.accuracy || 0) * 100)}% · Avg ${Math.round(toughestCategory.response || 0)}ms`,
                cta: 'Play Falling Words',
                onClick: () => navigate('/game/falling-words'),
                icon: Target
            });
        }

        const cefrRank = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
        const levelGap = (cefrRank[targetLevel] || 3) - (level || 1);
        if (levelGap > 1) {
            actions.push({
                title: 'Bridge to your CEFR goal',
                description: `Target ${targetLevel}. Complete a grammar drill and Daily Mix for faster progression.`,
                cta: 'Open Grammar',
                onClick: () => navigate('/game/grammar'),
                icon: Compass
            });
        }

        if (actions.length < 3) {
            actions.push({
                title: 'Chase a speed bonus',
                description: 'Run an adaptive Falling Words sprint to unlock multipliers.',
                cta: 'Start Falling Words',
                onClick: () => navigate('/game/falling-words'),
                icon: Zap
            });
        }
        return actions.slice(0, 3);
    }, [CATEGORIES, dueCount, level, navigate, targetLevel, toughestCategory]);

    return (
        <div className="min-h-screen relative p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto">

            {/* Top Bar Actions */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button variant="ghost" size="sm" onClick={() => setShowLeaderboard(true)} className="rounded-full h-12 w-12 p-0">
                    <Trophy size={20} className="text-yellow-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDictionary(true)} className="rounded-full h-12 w-12 p-0">
                    <Book size={20} className="text-blue-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="rounded-full h-12 w-12 p-0">
                    <Settings size={20} className="text-slate-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowShop(true)} className="rounded-full h-12 w-12 p-0 relative">
                    <ShoppingBag size={20} className="text-amber-400" />
                    {stats.coins > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {stats.coins || 0}
                        </span>
                    )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAchievements(true)} className="rounded-full h-12 w-12 p-0">
                    <Award size={20} className="text-orange-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowGrammar(true)} className="rounded-full h-12 w-12 p-0">
                    <BookOpen size={20} className="text-emerald-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowStats(true)} className="rounded-full h-12 w-12 p-0">
                    <BarChart3 size={20} className="text-indigo-400" />
                </Button>
            </div>

            {/* Streak Display */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 z-10"
            >
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                    <Flame size={20} className={stats.streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-600"} />
                    <span className={`font-bold ${stats.streak > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                        {stats.streak || 0} day{stats.streak !== 1 ? 's' : ''}
                    </span>
                    {stats.inventory?.['streak_freeze'] > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-500/20 border-blue-500/50 text-blue-300 ml-1">
                            ❄️ {stats.inventory['streak_freeze']}
                        </Badge>
                    )}
                </div>
            </motion.div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 mb-12 text-center"
            >
                <h1 className="text-5xl md:text-7xl font-black mb-4 title-gradient drop-shadow-2xl tracking-tight">
                    LingoLift
                </h1>
                <p className="text-xl text-slate-400 font-light tracking-wide">
                    Elevate your French, one word at a time.
                </p>
            </motion.header>

            {/* Daily Tip Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md mb-8"
            >
                {(() => {
                    const tip = getTipOfTheDay();
                    return (
                        <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">{tip.icon}</span>
                                <div className="flex-1">
                                    <Badge variant="outline" className="mb-2 text-xs border-indigo-400/50 text-indigo-300">
                                        Tip of the Day
                                    </Badge>
                                    <h3 className="font-bold text-white mb-1">{tip.title}</h3>
                                    <p className="text-sm text-slate-300 leading-relaxed">{tip.content}</p>
                                    {tip.funFact && (
                                        <p className="text-xs text-indigo-300 mt-2 italic">💡 {tip.funFact}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })()}
            </motion.div>

            {/* Daily Challenges */}
            <DailyChallengeWidget />

            {/* Goals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mb-8"
            >
                <Card className="border border-indigo-500/20 bg-slate-900/60">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Personal Targets</h3>
                        <Badge variant="outline">Weekly Momentum</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs uppercase text-slate-400 mb-1">Target CEFR</p>
                            <select
                                value={targetLevel}
                                onChange={(e) => setTargetLevel(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white"
                            >
                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">We\'ll tune difficulty toward {targetLevel}.</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-slate-400 mb-1">Sessions / week</p>
                            <input
                                type="range"
                                min="2"
                                max="14"
                                value={weeklySessions}
                                onChange={(e) => setWeeklySessions(Number(e.target.value))}
                                className="w-full accent-indigo-400"
                            />
                            <p className="text-sm text-white font-semibold">{weeklySessions} focused sessions</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-slate-400 mb-1">Minutes / week</p>
                            <input
                                type="range"
                                min="60"
                                max="300"
                                step="15"
                                value={weeklyMinutes}
                                onChange={(e) => setWeeklyMinutes(Number(e.target.value))}
                                className="w-full accent-indigo-400"
                            />
                            <p className="text-sm text-white font-semibold">{weeklyMinutes} min goal</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Next Best Action */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl mb-10"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap size={18} className="text-amber-400" /> Next Best Actions
                    </h3>
                    <p className="text-xs text-slate-500">Guided by your goals and accuracy.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {nextActions.map((action, idx) => (
                        <Card
                            key={idx}
                            hover
                            onClick={action.onClick}
                            className="border border-white/10 bg-white/5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="p-2 rounded-xl bg-white/10">
                                    <action.icon size={18} className="text-amber-300" />
                                </span>
                                <h4 className="font-bold text-white">{action.title}</h4>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">{action.description}</p>
                            <Badge variant="primary" className="mt-auto">{action.cta}</Badge>
                        </Card>
                    ))}
                </div>
            </motion.div>

            {/* Additional Navigation Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mb-12 w-full max-w-md">
                <button
                    onClick={() => navigate('/neighborhood')}
                    className="glass-panel p-6 hover:bg-[rgba(255,255,255,0.05)] transition-all transform hover:scale-105 group cursor-pointer border-l-4 border-l-indigo-500 text-left flex-1"
                >
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-500 transition-colors">
                        Le Quartier (Hub)
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Explore the neighborhood and talk to locals!
                    </p>
                </button>
                <button
                    onClick={() => navigate('/game/sentence-builder')}
                    className="glass-panel p-6 hover:bg-[rgba(255,255,255,0.05)] transition-all transform hover:scale-105 group cursor-pointer border-l-4 border-l-pink-500 text-left flex-1"
                >
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-500 transition-colors">
                        Constructeur (Builder)
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Practice sentence structure with feedback.
                    </p>
                </button>
            </div>

            {/* Progress Section */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md mb-12"
            >
                <Card hover onClick={() => setShowLeaderboard(true)} className="border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Current Level</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white">{level}</span>
                                <Badge variant="primary">Cadet</Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Total XP</p>
                            <span className="text-2xl font-bold text-indigo-300">{stats.xp}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNextLevel}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{Math.floor(progressToNextLevel)}% to Level {level + 1}</span>
                    </div>
                </Card>
            </motion.div>

            {/* Neighborhood Button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-2xl mb-8"
            >
                <button
                    onClick={() => navigate('/neighborhood')}
                    className="w-full glass-panel p-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 hover:from-indigo-800/50 hover:to-purple-800/50 border border-indigo-500/30 hover:border-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 group"
                >
                    <span className="text-3xl group-hover:animate-bounce">🗺️</span>
                    <div className="text-left">
                        <div className="text-xl font-bold text-indigo-100">Visit Le Quartier (New!)</div>
                        <div className="text-sm text-indigo-300">Explore the interactive neighborhood map</div>
                    </div>
                </button>
            </motion.div>

            {/* Game Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
            >
                {
                    menuItems.map((item) => (
                        <motion.div key={item.id} variants={itemVariants}>
                            <button
                                onClick={() => item.minLevel <= level && navigate(item.path)}
                                disabled={item.minLevel > level}
                                className={`w-full text-left group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 glass-panel
                                ${item.minLevel <= level
                                        ? 'hover:bg-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1'
                                        : 'opacity-50 cursor-not-allowed grayscale'
                                    }`
                                }
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${item.minLevel <= level ? item.color.replace('text', 'bg') : 'bg-slate-700'}`} />

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl bg-white/5 ${item.minLevel <= level ? item.color : 'text-slate-500'}`}>
                                        <item.icon size={24} />
                                    </div>
                                    {item.minLevel > level && (
                                        <Badge variant="default" className="flex items-center gap-1">
                                            <Lock size={12} /> Lvl {item.minLevel}
                                        </Badge>
                                    )}
                                </div>

                                <h3 className={`text-xl font-bold mb-2 ${item.minLevel <= level ? 'text-slate-100 group-hover:text-white' : 'text-slate-500'}`}>
                                    {item.title}
                                    {item.id === 'studySession' && dueCount > 0 && (
                                        <Badge variant="destructive" className="ml-2 animate-pulse">
                                            {dueCount} Due
                                        </Badge>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-400 group-hover:text-slate-300">
                                    {item.description}
                                </p>
                            </button>
                        </motion.div>
                    ))
                }
            </motion.div >

            {/* Modals */}
            < AnimatePresence >
                {showLeaderboard && (
                    <LeaderboardModal
                        onClose={() => setShowLeaderboard(false)}
                        userStats={{ ...stats, level }}
                    />
                )}
                {
                    showDictionary && (
                        <DictionaryModal
                            onClose={() => setShowDictionary(false)}
                        />
                    )
                }
                {showSettings && (
                    <SettingsModal
                        onClose={() => setShowSettings(false)}
                    />
                )}
                {showShop && (
                    <ShopModal
                        onClose={() => setShowShop(false)}
                    />
                )}
                {showAchievements && (
                    <AchievementsModal
                        isOpen={showAchievements}
                        onClose={() => setShowAchievements(false)}
                    />
                )}
                {showGrammar && (
                    <GrammarModal
                        isOpen={showGrammar}
                        onClose={() => setShowGrammar(false)}
                    />
                )}
                {showStats && (
                    <StatsModal
                        isOpen={showStats}
                        onClose={() => setShowStats(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MainMenu;
