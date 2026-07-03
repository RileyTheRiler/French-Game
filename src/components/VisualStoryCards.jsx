import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Volume2,
    RotateCcw, Filter, Sparkles, Eye, EyeOff
} from 'lucide-react';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useProgress } from '../context/ProgressContext';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { useVocabulary } from '../context/VocabularyContext';
import { vocabularyList, CATEGORIES } from '../data/vocabulary';

// Visual illustrations for categories (emoji-based scenes)
const CATEGORY_SCENES = {
    basics: ['👋', '🤝', '💬', '🙏', '✨'],
    food: ['🍎', '🥖', '🧀', '☕', '🍷'],
    animals: ['🐱', '🐕', '🐦', '🐟', '🐴'],
    colors: ['🔴', '🔵', '🟢', '🟡', '⚫'],
    numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'],
    travel: ['✈️', '🚂', '🏨', '🎫', '🧳'],
    places: ['🏠', '🏪', '🏛️', '⛪', '🏥'],
    emotions: ['😊', '😢', '😠', '😴', '🤩'],
    verbs: ['🚶', '🍽️', '📖', '✍️', '🗣️'],
    objects: ['🚗', '📱', '💼', '🔑', '📚'],
    time: ['⏰', '🌅', '🌙', '📅', '🕐'],
    family: ['👨‍👩‍👧', '👴', '👵', '👦', '👧'],
    body: ['👤', '👁️', '👃', '👄', '✋'],
    weather: ['☀️', '🌧️', '❄️', '💨', '⛈️'],
};

// Get scene emoji for a word based on its category and index
const getSceneEmoji = (word) => {
    const scenes = CATEGORY_SCENES[word.category] || ['📚'];
    const index = parseInt(word.id.replace(/\D/g, '')) % scenes.length;
    return scenes[index];
};

// Generate a gradient based on category
const getCategoryGradient = (category) => {
    const gradients = {
        basics: 'from-indigo-600 to-purple-600',
        food: 'from-amber-500 to-orange-600',
        animals: 'from-emerald-500 to-teal-600',
        colors: 'from-pink-500 to-rose-600',
        numbers: 'from-blue-500 to-cyan-600',
        travel: 'from-sky-500 to-indigo-600',
        places: 'from-purple-500 to-violet-600',
        emotions: 'from-rose-500 to-pink-600',
        verbs: 'from-violet-500 to-purple-600',
        objects: 'from-slate-500 to-gray-600',
        time: 'from-cyan-500 to-blue-600',
        family: 'from-red-500 to-rose-600',
        body: 'from-orange-500 to-amber-600',
        weather: 'from-teal-500 to-emerald-600',
    };
    return gradients[category] || 'from-slate-600 to-gray-700';
};

const VisualStoryCards = () => {
    const navigate = useNavigate();
    const { addXP, stats, globalDifficulty } = useProgress();
    const { recordReview } = useVocabulary();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    // State
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [cardsReviewed, setCardsReviewed] = useState(0);
    const [audioPlaying, setAudioPlaying] = useState(false);

    // Swipe gesture
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

    const currentCard = cards[currentIndex];

    // Load cards on mount or filter change
    useEffect(() => {
        let filtered = [...vocabularyList];

        if (selectedCategory) {
            filtered = filtered.filter(w => w.category === selectedCategory);
        }

        // Shuffle cards
        filtered = filtered.sort(() => Math.random() - 0.5);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCards(filtered);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [selectedCategory]);

    // Play audio
    const playAudio = useCallback(() => {
        if (!currentCard) return;

        setAudioPlaying(true);
        const audio = new Audio(currentCard.audioUrl);
        audio.playbackRate = difficultyConfig.audioSpeed;
        audio.onended = () => setAudioPlaying(false);
        audio.onerror = () => setAudioPlaying(false);
        audio.play().catch(() => setAudioPlaying(false));
    }, [currentCard, difficultyConfig.audioSpeed]);

    // Navigate to next card
    const nextCard = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            // Track review
            if (currentCard) {
                recordReview(currentCard.id, true);
                setCardsReviewed(prev => prev + 1);
            }

            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    }, [currentIndex, cards.length, currentCard, recordReview]);

    // Navigate to previous card
    const prevCard = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    }, [currentIndex]);

    // Handle swipe
    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            prevCard();
        } else if (info.offset.x < -100) {
            nextCard();
        }
        x.set(0);
    };

    // Flip card
    const flipCard = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            playAudio();
        }
    };

    // Award XP periodically
    useEffect(() => {
        if (cardsReviewed > 0 && cardsReviewed % 10 === 0) {
            addXP(10);
        }
    }, [cardsReviewed, addXP]);

    if (cards.length === 0) {
        return (
            <GameLayout
                title="Visual Story Cards"
                subtitle="Loading..."
                icon={<Sparkles className="w-6 h-6" />}
                onExit={() => navigate('/')}
            >
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-slate-400">Loading cards...</div>
                </div>
            </GameLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    aria-label="Go back"
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>

                <div className="flex items-center gap-2">
                    <Badge variant="purple">
                        {currentIndex + 1} / {cards.length}
                    </Badge>
                    <Badge variant="yellow">
                        +{cardsReviewed * 1} XP
                    </Badge>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    aria-label="Toggle filters"
                    className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${showFilters ? 'bg-purple-500' : 'bg-slate-800/50 hover:bg-slate-700/50'
                        }`}
                >
                    <Filter className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Filter panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-4"
                    >
                        <div className="pb-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    All
                                </button>
                                {Object.entries(CATEGORIES).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === key
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card area */}
            <div className="flex flex-col items-center justify-center min-h-[65vh] px-4">
                {/* Navigation arrows */}
                <div className="w-full max-w-lg flex items-center justify-between mb-4">
                    <button
                        onClick={prevCard}
                        disabled={currentIndex === 0}
                        aria-label="Previous card"
                        className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-300 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                        {isFlipped ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        Tap to {isFlipped ? 'hide' : 'reveal'}
                    </button>

                    <button
                        onClick={nextCard}
                        disabled={currentIndex === cards.length - 1}
                        aria-label="Next card"
                        className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* The Card */}
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    style={{ x, rotate, opacity }}
                    className="w-full max-w-sm perspective-1000"
                >
                    <motion.div
                        onClick={flipCard}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                        className="relative w-full aspect-[3/4] cursor-pointer preserve-3d"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front of card */}
                        <div
                            className={`absolute inset-0 rounded-3xl shadow-2xl overflow-hidden backface-hidden bg-gradient-to-br ${getCategoryGradient(currentCard?.category)}`}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {/* Visual scene */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={currentCard?.id}
                                    className="text-[120px]"
                                >
                                    {getSceneEmoji(currentCard)}
                                </motion.div>
                            </div>

                            {/* Word at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h2 className="text-3xl font-bold text-white text-center">
                                    {currentCard?.french}
                                </h2>
                                {currentCard?.ipa && (
                                    <p className="text-center text-white/70 mt-1 font-mono">
                                        /{currentCard.ipa}/
                                    </p>
                                )}
                            </div>

                            {/* Category badge */}
                            <div className="absolute top-4 left-4">
                                <Badge variant="white">
                                    {CATEGORIES[currentCard?.category]?.icon} {CATEGORIES[currentCard?.category]?.name}
                                </Badge>
                            </div>

                            {/* Audio button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playAudio();
                                }}
                                aria-label="Play pronunciation"
                                className={`absolute top-4 right-4 p-3 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${audioPlaying
                                    ? 'bg-white text-purple-600'
                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                    }`}
                            >
                                <Volume2 className={`w-5 h-5 ${audioPlaying ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>

                        {/* Back of card (translation) */}
                        <div
                            className={`absolute inset-0 rounded-3xl shadow-2xl overflow-hidden backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 rotate-y-180`}
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            {/* Translation content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                <div className="text-6xl mb-6">
                                    {getSceneEmoji(currentCard)}
                                </div>

                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {currentCard?.french}
                                    </h2>
                                    <div className="text-4xl font-bold text-purple-400 mb-4">
                                        {currentCard?.english}
                                    </div>

                                    {/* Example sentence */}
                                    {currentCard?.example && (
                                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                                            <p className="text-slate-300 italic mb-2">
                                                "{currentCard.example.french}"
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                "{currentCard.example.english}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Part of speech & gender */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <Badge variant="purple">{currentCard?.pos}</Badge>
                                {currentCard?.gender && (
                                    <Badge variant={currentCard.gender === 'm' ? 'blue' : 'pink'}>
                                        {currentCard.gender === 'm' ? '♂ Masc' : '♀ Fem'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Swipe hint */}
                <p className="text-slate-500 text-sm mt-6">
                    ← Swipe to navigate →
                </p>
            </div>

            {/* Progress bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden max-w-lg mx-auto">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VisualStoryCards;
