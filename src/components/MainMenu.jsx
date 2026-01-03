import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { Book, Trophy, Play, MessageCircle, PenTool, Map, Star, Lock, Settings, Mic, ShoppingBag, Award, Flame, BookOpen, BarChart3, Users, Target, Zap, Sparkles, Globe, Wand2, Phone, Table, Layers, Brain, Box, Moon } from 'lucide-react';
=======
import { Book, Trophy, Play, MessageCircle, PenTool, Map, Star, Lock, Settings, Mic, ShoppingBag, Award, Flame, BookOpen, BarChart3, Target, Zap, Compass } from 'lucide-react';
>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import LeaderboardModal from './LeaderboardModal';
import DictionaryModal from './DictionaryModal';
import SettingsModal from './SettingsModal';
import ShopModal from './ShopModal';
import AchievementsModal from './AchievementsModal';
import GrammarModal from './GrammarModal';
import StatsModal from './StatsModal';
import GoalSettingsModal from './GoalSettingsModal';
import SocialModal from './SocialModal';
import WeeklyRecapModal from './WeeklyRecapModal';
import DailyChallengeWidget from './DailyChallengeWidget';
import DailyGoalRing from './DailyGoalRing';
import StreakCard from './StreakCard';
import LeagueProgressWidget from './LeagueProgressWidget';
import QuickSessionCard from './QuickSessionCard';
import { getTipOfTheDay } from '../data/dailyTips';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import LanguageSwitcher from './LanguageSwitcher';
import WeeklyGoalTracker from './WeeklyGoalTracker';

const MainMenu = () => {
    const navigate = useNavigate();
<<<<<<< HEAD
    const { t, i18n } = useTranslation();
    const { stats, level, progressToNextLevel, getWeeklySummary } = useProgress();
    const { getDueWords } = useVocabulary();
=======
    const { stats, level, progressToNextLevel, setTargetCefr, setWeeklyGoal } = useProgress();
    const { getDueWords, CATEGORIES } = useVocabulary();
>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701
    const dueCount = getDueWords().length;
    const [targetLevel, setTargetLevel] = useState(stats.targetCefr || 'B1');
    const [weeklySessions, setWeeklySessions] = useState(stats.weeklyGoal?.sessions || 5);
    const [weeklyMinutes, setWeeklyMinutes] = useState(stats.weeklyGoal?.minutes || 120);

    // Calculate weak words count
    const weakWordsCount = Object.values(stats.weakWords || {}).filter(w => w.strength < 70).length;

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showDictionary, setShowDictionary] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showGrammar, setShowGrammar] = useState(false);
    const [showSocial, setShowSocial] = useState(false);

    const [showStats, setShowStats] = useState(false);
    const [showGoals, setShowGoals] = useState(false);
    const [showWeeklyRecap, setShowWeeklyRecap] = useState(false);

    // Check for Weekly Recap
    React.useEffect(() => {
        if (!getWeeklySummary) return;
        const weeklyData = getWeeklySummary();
        const hasActivity = weeklyData.some(d => d.xp > 0);

        // Simple Logic: Show if we have activity this week AND haven't seen it today (or whatever logic we want)
        // Better Logic from plan: Show if it's a new week? 
        // For MVP/Demo: Let's show it if: 
        // 1. We have activity in the last 7 days.
        // 2. We haven't seen it in the last 6 days (i.e., essentially once a week).

        if (hasActivity) {
            const lastSeen = stats.lastWeeklyRecap ? new Date(stats.lastWeeklyRecap) : new Date(0);
            const now = new Date();
            const diffDays = (now - lastSeen) / (1000 * 60 * 60 * 24);

            // If it's been more than 6 days since last recap
            if (diffDays > 6) {
                setShowWeeklyRecap(true);
            }
        }
    }, [getWeeklySummary, stats.lastWeeklyRecap]);

    const getNextBestAction = () => {
        const { userGoals } = stats;

        // Priority 1: Weekly XP
        // Simplified check: assume 'weeklyXP' reset logic exists, or just check total for now as a proxy or mock it.
        // For MVP, letting user set goal is enough, we will mock the "current" weekly progress for the suggestion
        // In reality we would need to track "xpEarnedThisWeek" in stats.

        // Priority 2: Due Words
        if (dueCount > 5) {
            return {
                title: "Memory Refresh",
                description: `You have ${dueCount} words ready for review.`,
                icon: <BookOpen className="text-pink-400" size={24} />,
                action: () => navigate('/study-session'),
                btnText: t('menu.actions.start_review'),
                color: "pink"
            };
        }

        // Priority 2: Weak Words (Words to Polish)
        if (weakWordsCount > 2) {
            return {
                title: "Polissage de Prononciation",
                description: `You have ${weakWordsCount} words that need pronunciation polish.`,
                icon: <Mic className="text-rose-400" size={24} />,
                action: () => navigate('/pronunciation'),
                btnText: t('menu.actions.polish_now'),
                color: "rose"
            };
        }

        // Priority 3: Focus Mode Suggestion (if none completed today)
        const focusCompletedToday = Object.values(stats.focusModeStats || {}).some(s => s.lastCompletedToday); // Assuming we might track this or just suggest anyway
        if (!focusCompletedToday) {
            return {
                title: "Focus Training",
                description: "Deep dive into a specific skill today.",
                icon: <Target className="text-indigo-400" size={24} />,
                action: () => navigate('/focus'),
                btnText: "Focus Now",
                color: "indigo"
            };
        }

        // Default
        return {
            title: "Keep the Streak",
            description: "Play a quick round of Falling Words.",
            icon: <Play className="text-violet-400" size={24} />,
            action: () => navigate('/game/falling-words'),
            btnText: t('menu.actions.play_now'),
            color: "violet"
        };
    };

    const nextAction = getNextBestAction();

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
            title: t('menu.items.quartier.title'),
            description: t('menu.items.quartier.desc'),
            icon: Map,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/neighborhood'
        },
        {
            id: 'fallingWords',
            title: t('menu.items.falling_words.title'),
            description: t('menu.items.falling_words.desc'),
            icon: Star, // Replace with appropriate game icon
            color: 'text-violet-400',
            borderColor: 'border-l-violet-500',
            minLevel: 1,
            path: '/game/falling-words'
        },
        {
            id: 'studySession',
            title: t('menu.items.study_session.title'),
            description: t('menu.items.study_session.desc'),
            icon: Book,
            color: 'text-pink-400',
            borderColor: 'border-l-pink-500',
            minLevel: 1,
            path: '/study-session'
        },
        {
            id: 'dailyMix',
            title: t('menu.items.daily_mix.title'),
            description: t('menu.items.daily_mix.desc'),
            icon: Play,
            color: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            minLevel: 2,
            path: '/game/daily-mix'
        },
        {
            id: 'focusTraining',
            title: 'Focus Training',
            description: 'Dedicated practice for Grammar, Listening, or Speed',
            icon: Target,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/focus'
        },
        {
            id: 'customDecks',
            title: 'Custom Decks',
            description: 'Create and study your own vocabulary sets',
            icon: Layers,
            color: 'text-emerald-400',
            borderColor: 'border-l-emerald-500',
            minLevel: 1,
            path: '/decks'
        },
        {
            id: 'conversation',
            title: t('menu.items.roleplay.title'),
            description: t('menu.items.roleplay.desc'),
            icon: MessageCircle,
            color: 'text-purple-400',
            borderColor: 'border-l-purple-500',
            minLevel: 2,
            path: '/game/conversation'
        },
        {
            id: 'freeChat',
            title: 'Free Conversation',
            description: 'Practice real conversations with AI partners',
            icon: MessageCircle,
            color: 'text-fuchsia-400',
            borderColor: 'border-l-fuchsia-500',
            minLevel: 1,
            path: '/game/free-chat'
        },
        {
            id: 'storyMode',
            title: t('menu.items.story_mode.title'),
            description: t('menu.items.story_mode.desc'),
            icon: Book,
            color: 'text-emerald-400',
            borderColor: 'border-l-emerald-500',
            minLevel: 3,
            path: '/game/story'
        },
        {
            id: 'branchingStoryMode',
            title: "Story Mode 2.0",
            description: "Branching narratives with multiple endings",
            icon: Map,
            color: 'text-orange-400',
            borderColor: 'border-l-orange-500',
            minLevel: 1,
            path: '/game/branching-story'
        },
        {
            id: 'readingRoom',
            title: "Reading Room",
            description: "Graded readers with tap-to-translate",
            icon: BookOpen,
            color: 'text-blue-400',
            borderColor: 'border-l-blue-500',
            minLevel: 1,
            path: '/reading-room'
        },
        {
            id: 'listenRepeatLab',
            title: "Listen & Repeat Lab",
            description: "Shadowing and pronunciation practice",
            icon: Mic,
            color: 'text-rose-400',
            borderColor: 'border-l-rose-500',
            minLevel: 1,
            path: '/listen-repeat-lab'
        },
        {
            id: 'culturalDeepDive',
            title: "Cultural Deep Dives",
            description: "Immersive articles on French civilization",
            icon: Globe,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/cultural-deep-dive'
        },
        {
            id: 'lessonCreator',
            title: "Lesson Creator",
            description: "Build and share your own learning materials",
            icon: Sparkles,
            color: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            minLevel: 1,
            path: '/lesson-creator'
        },
        {
            id: 'sentenceBuilder',
            title: t('menu.items.sentence_builder.title'),
            description: t('menu.items.sentence_builder.desc'),
            icon: PenTool,
            color: 'text-blue-400',
            borderColor: 'border-l-blue-500',
            minLevel: 1,
            path: '/game/sentence-builder'
        },
        {
            id: 'pronunciation',
            title: t('menu.items.pronunciation.title'),
            description: t('menu.items.pronunciation.desc'),
            icon: Mic,
            color: 'text-rose-400',
            borderColor: 'border-l-rose-500',
            minLevel: 3,
            path: '/pronunciation'
        },
        {
            id: 'grammar',
            title: t('menu.items.grammar.title'),
            description: t('menu.items.grammar.desc'),
            icon: BookOpen,
            color: 'text-cyan-400',
            borderColor: 'border-l-cyan-500',
            minLevel: 1,
            path: '/learn/grammar'
        },
        {
            id: 'grammarDeepDive',
            title: 'Grammar Deep Dive',
            description: 'In-depth explanations for serious learners',
            icon: Book,
            color: 'text-teal-400',
            borderColor: 'border-l-teal-500',
            minLevel: 1,
            path: '/grammar-deep-dive'
        },
        {
            id: 'cloze',
            title: t('menu.items.cloze.title'),
            description: t('menu.items.cloze.desc'),
            icon: PenTool,
            color: 'text-teal-400',
            borderColor: 'border-l-teal-500',
            minLevel: 1,
            path: '/game/cloze'
        },
        {
            id: 'errorSpotting',
            title: t('menu.items.error_spotting.title'),
            description: t('menu.items.error_spotting.desc'),
            icon: Target,
            color: 'text-red-400',
            borderColor: 'border-l-red-500',
            minLevel: 1,
            path: '/game/error-spotting'
        },
        {
            id: 'videoImmersion',
            title: 'Video Immersion',
            description: 'Watch authentic content with dual subtitles',
            icon: Play,
            color: 'text-rose-400',
            borderColor: 'border-l-rose-500',
            minLevel: 1,
            path: '/video-immersion'
        },
        {
            id: 'dictation',
            title: 'La Dictée',
            description: 'Listen and write what you hear',
            icon: PenTool,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/game/dictation'
        },
        {
            id: 'conjugationBlitz',
            title: 'Conjugation Blitz',
            description: 'Race against time to conjugate verbs',
            icon: Zap,
            color: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            minLevel: 1,
            path: '/game/conjugation-blitz'
        },
        {
            id: 'memoryMatch',
            title: 'Memory Match',
            description: 'Flip cards and find the pairs',
            icon: Sparkles,
            color: 'text-cyan-400',
            borderColor: 'border-l-cyan-500',
            minLevel: 1,
            path: '/game/memory-match'
        },
        {
            id: 'cultureQuest',
            title: 'Culture Quest',
            description: 'Trivia on French history & art',
            icon: Globe,
            color: 'text-emerald-400',
            borderColor: 'border-l-emerald-500',
            minLevel: 1,
            path: '/game/culture-quest'
        },
        {
            id: 'smartImport',
            title: 'Smart Importer',
            description: 'Convert any text into a lesson',
            icon: Wand2,
            color: 'text-fuchsia-400',
            borderColor: 'border-l-fuchsia-500',
            minLevel: 1,
            path: '/smart-import'
        },
        {
            id: 'voiceCall',
            title: 'Phone Call Simulation',
            description: 'Voice-only practice with AI',
            icon: Phone,
            color: 'text-green-400',
            borderColor: 'border-l-green-500',
            minLevel: 1,
            path: '/game/voice-call'
        },
        {
            id: 'cultureMap',
            title: 'Explore France',
            description: 'Interactive map, dialects & regions',
            icon: Globe,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/culture-map'
        },
        {
            id: 'survivalChallenge',
            title: 'Survival Mode',
            description: 'Timed high-stakes scenarios',
            icon: Zap,
            color: 'text-red-400',
            borderColor: 'border-l-red-500',
            minLevel: 1,
            path: '/survival-challenge'
        },
        {
            id: 'mediaCenter',
            title: 'Media Center',
            description: 'Native clips & comprehension quizzes',
            icon: Play,
            color: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            minLevel: 1,
            path: '/media-center'
        },
        // Real World Phase 11
        {
            id: 'slangExplorer',
            title: 'Slang & Verlan',
            description: 'Master street French & texting lingo',
            icon: MessageCircle,
            color: 'text-fuchsia-400',
            borderColor: 'border-l-fuchsia-500',
            minLevel: 1,
            path: '/real-world/slang'
        },
        {
            id: 'professionalSuite',
            title: 'Professional Suite',
            description: 'Business, Medical & Tech French',
            icon: Briefcase,
            color: 'text-blue-400',
            borderColor: 'border-l-blue-500',
            minLevel: 2,
            path: '/real-world/professional'
        },
        {
            id: 'dialectTours',
            title: 'Dialect Tours',
            description: 'Quebec, Marseille, Belgium & more',
            icon: Globe,
            color: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            minLevel: 1,
            path: '/real-world/dialects'
        },
        // Learning Styles / Modalities
        {
            id: 'podcastMode',
            title: 'Podcast Mode',
            description: 'Audio-only lessons for hands-free learning',
            icon: Mic,
            color: 'text-indigo-400',
            borderColor: 'border-l-indigo-500',
            minLevel: 1,
            path: '/learn/podcast'
        },
        {
            id: 'visualStoryCards',
            title: 'Visual Story Cards',
            description: 'Learn with illustrated vocabulary cards',
            icon: Sparkles,
            color: 'text-pink-400',
            borderColor: 'border-l-pink-500',
            minLevel: 1,
            path: '/learn/story-cards'
        },
        {
            id: 'writingPad',
            title: 'Writing Pad',
            description: 'Practice writing accents and characters',
            icon: PenTool,
            color: 'text-emerald-400',
            borderColor: 'border-l-emerald-500',
            minLevel: 1,
            path: '/learn/writing-pad'
        },
        {
            id: 'patternDrills',
            title: 'Pattern Drills',
            description: 'Structured grammar and conjugation drills',
            icon: Table,
            color: 'text-blue-400',
            borderColor: 'border-l-blue-500',
            minLevel: 1,
            path: '/learn/pattern-drills'
        },
        // Phase 10: The AI Coach
        {
            id: 'prosodyLab',
            title: 'Prosody Lab',
            description: 'Visualize your rhythm & intonation',
            icon: Mic,
            color: 'text-rose-400',
            borderColor: 'border-l-rose-500',
            minLevel: 1,
            path: '/lab/prosody'
        },
        {
            id: 'sentenceBlueprint',
            title: 'Sentence Architect',
            description: 'Visualize grammar trees & structure',
            icon: Layers,
            color: 'text-cyan-400',
            borderColor: 'border-l-cyan-500',
            minLevel: 1,
            path: '/lab/sentence-blueprint'
        }
    ];

<<<<<<< HEAD
    const formatNumber = (num) => {
        return new Intl.NumberFormat(i18n.language).format(num);
    };
=======
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
>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701

    return (
        <div id="main-content" tabIndex={-1} className="min-h-screen relative p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto">

            {/* Top Bar Actions */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <LanguageSwitcher />
                <Button variant="ghost" size="sm" onClick={() => setShowLeaderboard(true)} className="rounded-full h-12 w-12 p-0">
                    <Trophy size={20} className="text-yellow-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSocial(true)} className="rounded-full h-12 w-12 p-0">
                    <Users size={20} className="text-violet-400" />
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
                            {formatNumber(stats.coins)}
                        </span>
                    )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAchievements(true)} className="rounded-full h-12 w-12 p-0">
                    <Award size={20} className="text-orange-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowGrammar(true)} className="rounded-full h-12 w-12 p-0">
                    <BookOpen size={20} className="text-emerald-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/mastery')} className="rounded-full h-12 w-12 p-0">
                    <BarChart3 size={20} className="text-indigo-400" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowGoals(true)} className="rounded-full h-12 w-12 p-0">
                    <Target size={20} className="text-red-400" />
                </Button>
            </div>

            {/* Streak Card (Enhanced) */}
            <StreakCard />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 mb-12 text-center"
            >
                <h1 className="text-5xl md:text-7xl font-black mb-4 title-gradient drop-shadow-2xl tracking-tight">
                    {t('menu.title')}
                </h1>
                <p className="text-xl text-slate-400 font-light tracking-wide">
                    {t('menu.subtitle')}
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
                                        {t('menu.tip_of_day')}
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

            {/* Goals Section */}
            <div className="w-full max-w-md space-y-4 mb-8">
                <DailyGoalRing />
                <WeeklyGoalTracker />
            </div>

            {/* Quick Session for Beginners */}
            <QuickSessionCard />

            {/* Next Best Action Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="w-full max-w-md mb-8"
            >
                <Card className={`border-${nextAction.color}-500/30 bg-gradient-to-r from-${nextAction.color}-900/20 to-slate-900/50`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-${nextAction.color}-500/20`}>
                                {nextAction.icon}
                            </div>
                            <div>
                                <Badge variant="outline" className={`mb-1 text-[10px] border-${nextAction.color}-400/50 text-${nextAction.color}-300`}>
                                    {t('menu.recommended')}
                                </Badge>
                                <h3 className="font-bold text-white">{nextAction.title}</h3>
                                <p className="text-xs text-slate-400">{nextAction.description}</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={nextAction.action} className={`bg-${nextAction.color}-600 hover:bg-${nextAction.color}-500`}>
                            {nextAction.btnText}
                        </Button>
                    </div>
                </Card>
            </motion.div>

            {/* Daily Challenges */}
            <DailyChallengeWidget />

<<<<<<< HEAD
            {/* League Progress Widget */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="w-full max-w-md mb-6"
            >
                <LeagueProgressWidget onClick={() => setShowLeaderboard(true)} />
=======
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
>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701
            </motion.div>

            {/* Additional Navigation Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mb-12 w-full max-w-md">
                <button
                    onClick={() => navigate('/neighborhood')}
                    className="glass-panel p-6 hover:bg-[rgba(255,255,255,0.05)] transition-all transform hover:scale-105 group cursor-pointer border-l-4 border-l-indigo-500 text-left flex-1"
                >
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-500 transition-colors">
                        {t('menu.items.quartier.title')} (Hub)
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {t('menu.items.quartier.desc')}
                    </p>
                </button>
                <button
                    onClick={() => navigate('/game/sentence-builder')}
                    className="glass-panel p-6 hover:bg-[rgba(255,255,255,0.05)] transition-all transform hover:scale-105 group cursor-pointer border-l-4 border-l-pink-500 text-left flex-1"
                >
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-500 transition-colors">
                        {t('menu.items.sentence_builder.title')} (Builder)
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {t('menu.items.sentence_builder.desc')}
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
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{t('menu.current_level')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white">{level}</span>
                                <Badge variant="primary">Cadet</Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{t('menu.total_xp')}</p>
                            <span className="text-2xl font-bold text-indigo-300">{formatNumber(stats.xp)}</span>
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
                        <span>{formatNumber(Math.floor(progressToNextLevel))}% {t('menu.to_level')} {level + 1}</span>
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
                        <div className="text-xl font-bold text-indigo-100">{t('menu.visit_quartier')}</div>
                        <div className="text-sm text-indigo-300">{t('menu.visit_quartier_desc')}</div>
                    </div>
                </button>
            </motion.div>

            {/* Cognitive Optimization Phase 12 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="w-full max-w-2xl mb-8"
            >
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Cognitive Mastery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/memory-palace')}
                        className="glass-panel p-4 hover:bg-purple-500/10 border-l-4 border-l-purple-500 text-left transition-all hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                                <Box className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-100">Memory Palace</h3>
                        </div>
                        <p className="text-xs text-slate-400">Map words to 3D spaces.</p>
                    </button>

                    <button
                        onClick={() => navigate('/dream-goals')}
                        className="glass-panel p-4 hover:bg-blue-500/10 border-l-4 border-l-blue-500 text-left transition-all hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                                <Moon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-100">Visionary Goals</h3>
                        </div>
                        <p className="text-xs text-slate-400">Track subconscious milestones.</p>
                    </button>
                </div>
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
                {showGoals && (
                    <GoalSettingsModal
                        isOpen={showGoals}
                        onClose={() => setShowGoals(false)}
                    />
                )}
                {showSocial && (
                    <SocialModal
                        onClose={() => setShowSocial(false)}
                    />
                )}
                {showWeeklyRecap && (
                    <WeeklyRecapModal
                        onClose={() => setShowWeeklyRecap(false)}
                    />
                )}
            </AnimatePresence>
        </div >
    );
};

export default MainMenu;
