import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Play, Pause, SkipForward, SkipBack,
    Volume2, Headphones, Moon, Sun, Settings, List
} from 'lucide-react';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useProgress } from '../context/ProgressContext';
import { getDifficultyConfig } from './ui/DifficultyDial';
import {
    generatePodcastPlaylist,
    PLAYBACK_SPEEDS,
    SESSION_TYPES,
    SESSION_TEMPLATES
} from '../data/podcastData';
import { CATEGORIES } from '../data/vocabulary';

const PodcastMode = () => {
    const navigate = useNavigate();
    const { addXP, incrementStat, stats, globalDifficulty } = useProgress();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);
    const audioRef = useRef(null);

    // Session state
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionType, setSessionType] = useState(SESSION_TYPES.MIXED);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(stats.preferredPlaybackSpeed || difficultyConfig.audioSpeed);
    const [showTranslation, setShowTranslation] = useState(difficultyConfig.showTranslations === 'always');
    const [dimMode, setDimMode] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);

    // Session complete
    const [sessionComplete, setSessionComplete] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);

    const currentItem = playlist[currentIndex];

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.playbackRate = playbackSpeed;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle playback speed changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [currentItem, playbackSpeed]);

    // Start session
    const startSession = useCallback(() => {
        const newPlaylist = generatePodcastPlaylist({
            sessionType,
            category: selectedCategory,
        });
        setPlaylist(newPlaylist);
        setCurrentIndex(0);
        setSessionStarted(true);
        setSessionComplete(false);
        setXpEarned(0);
    }, [sessionType, selectedCategory]);

    // Finish session
    const finishSession = useCallback(() => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Calculate XP (2 XP per item listened)
        const earned = playlist.length * 2;
        setXpEarned(earned);
        addXP(earned);
        incrementStat('podcastSessionsCompleted');

        setSessionComplete(true);
    }, [playlist.length, addXP, incrementStat]);

    // Play current item
    const playCurrentItem = useCallback(() => {
        if (!currentItem || !audioRef.current) return;

        audioRef.current.src = currentItem.audioUrl;
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error('Audio playback error:', err));

        // Auto-advance when audio ends
        audioRef.current.onended = () => {
            // Brief pause between items
            setTimeout(() => {
                if (currentIndex < playlist.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    // Session complete
                    finishSession();
                }
            }, 1500); // 1.5 second pause between items
        };
    }, [currentItem, currentIndex, playlist.length, finishSession]);

    // Auto-play when current item changes
    useEffect(() => {
        if (isPlaying && currentItem) {
            playCurrentItem();
        }
    }, [currentIndex, isPlaying, currentItem, playCurrentItem]);

    // Play/Pause toggle
    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (audioRef.current.src) {
                audioRef.current.play();
            } else {
                playCurrentItem();
            }
            setIsPlaying(true);
        }
    };

    // Skip forward
    const skipForward = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    // Skip back
    const skipBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Session selection screen
    if (!sessionStarted) {
        return (
            <GameLayout
                title="Podcast Mode"
                subtitle="Listen & Learn"
                icon={<Headphones className="w-6 h-6" />}
                onExit={() => navigate('/')}
            >
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Headphones className="w-5 h-5 text-purple-400" />
                            Audio Learning Session
                        </h2>
                        <p className="text-slate-300 mb-6">
                            Perfect for commutes, workouts, or relaxing. Just listen — no screen required!
                        </p>

                        {/* Session Type Selection */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                Choose Session Type
                            </h3>
                            <div className="grid gap-3">
                                {Object.entries(SESSION_TEMPLATES).map(([key, template]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSessionType(key)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${sessionType === key
                                            ? 'border-purple-500 bg-purple-500/20'
                                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{template.icon}</span>
                                            <div>
                                                <div className="font-medium text-white">{template.name}</div>
                                                <div className="text-sm text-slate-400">{template.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="mt-6 space-y-3">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                Filter by Category (Optional)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    All Categories
                                </button>
                                {Object.entries(CATEGORIES).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === key
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <Button
                            onClick={startSession}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        >
                            <Play className="w-5 h-5 mr-2" />
                            Start Listening Session
                        </Button>
                    </Card>
                </div>
            </GameLayout>
        );
    }

    // Session complete screen
    if (sessionComplete) {
        return (
            <GameLayout
                title="Session Complete"
                subtitle="Great listening!"
                icon={<Headphones className="w-6 h-6" />}
                onExit={() => navigate('/')}
            >
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <Card className="p-8 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30">
                            <div className="text-6xl mb-4">🎧</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Listening Complete!
                            </h2>
                            <p className="text-slate-300 mb-6">
                                You listened to {playlist.length} items
                            </p>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                <div className="text-3xl font-bold text-yellow-400">
                                    +{xpEarned} XP
                                </div>
                                <div className="text-sm text-slate-400">earned this session</div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setSessionStarted(false);
                                        setSessionComplete(false);
                                    }}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    New Session
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                                >
                                    Done
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </GameLayout>
        );
    }

    // Active listening screen
    return (
        <div className={`min-h-screen transition-colors duration-500 ${dimMode
            ? 'bg-black'
            : 'bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900'
            }`}>
            {/* Header */}
            <div className={`p-4 flex items-center justify-between transition-opacity ${dimMode ? 'opacity-30' : 'opacity-100'
                }`}>
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>

                <div className="flex items-center gap-2">
                    <Badge variant="purple">
                        {currentIndex + 1} / {playlist.length}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    >
                        <List className="w-5 h-5 text-slate-300" />
                    </button>
                    <button
                        onClick={() => setDimMode(!dimMode)}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    >
                        {dimMode ? (
                            <Sun className="w-5 h-5 text-yellow-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-slate-300" />
                        )}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center max-w-lg"
                    >
                        {/* Current item type badge */}
                        <Badge
                            variant={currentItem?.type === 'word' ? 'purple' : 'blue'}
                            className="mb-4"
                        >
                            {currentItem?.type === 'word' ? '📚 Vocabulary' : '💬 Sentence'}
                        </Badge>

                        {/* French text */}
                        <h1 className={`font-bold mb-4 ${dimMode ? 'text-slate-400' : 'text-white'
                            } ${currentItem?.type === 'word' ? 'text-5xl' : 'text-3xl'}`}>
                            {currentItem?.displayText}
                        </h1>

                        {/* IPA pronunciation */}
                        {currentItem?.ipa && (
                            <p className="text-lg text-purple-400 mb-4 font-mono">
                                /{currentItem.ipa}/
                            </p>
                        )}

                        {/* Translation */}
                        <AnimatePresence>
                            {showTranslation && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-xl ${dimMode ? 'text-slate-600' : 'text-slate-400'}`}
                                >
                                    {currentItem?.translation}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>

                {/* Audio visualization placeholder */}
                <div className="mt-8 flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: isPlaying ? [8, 24, 8] : 8,
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.05,
                            }}
                            className={`w-1 rounded-full ${isPlaying ? 'bg-purple-500' : 'bg-slate-700'
                                }`}
                            style={{ minHeight: 8 }}
                        />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className={`fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent transition-opacity ${dimMode ? 'opacity-50' : 'opacity-100'
                }`}>
                {/* Playback speed */}
                <div className="flex justify-center gap-2 mb-4">
                    {PLAYBACK_SPEEDS.map(speed => (
                        <button
                            key={speed.value}
                            onClick={() => setPlaybackSpeed(speed.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${playbackSpeed === speed.value
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {speed.label}
                        </button>
                    ))}
                </div>

                {/* Main controls */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={skipBack}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Skip back"
                    >
                        <SkipBack className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={togglePlayPause}
                        className="p-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 text-white" />
                        ) : (
                            <Play className="w-8 h-8 text-white ml-1" />
                        )}
                    </button>

                    <button
                        onClick={skipForward}
                        disabled={currentIndex === playlist.length - 1}
                        className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Skip forward"
                    >
                        <SkipForward className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Toggle translation */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        aria-expanded={showTranslation}
                    >
                        {showTranslation ? 'Hide' : 'Show'} Translation
                    </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / playlist.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            {/* Playlist sidebar */}
            <AnimatePresence>
                {showPlaylist && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Playlist</h3>
                            <button
                                onClick={() => setShowPlaylist(false)}
                                className="p-1 rounded hover:bg-slate-800"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {playlist.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${index === currentIndex
                                        ? 'bg-purple-500/20 border border-purple-500/50'
                                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">{index + 1}</span>
                                        <div>
                                            <div className="text-sm text-white truncate">{item.displayText}</div>
                                            <div className="text-xs text-slate-400 truncate">{item.translation}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PodcastMode;
