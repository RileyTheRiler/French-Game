import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Award, Check, X, Lightbulb } from 'lucide-react';
import { GameLayout } from './layout/GameLayout';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { speak } from '../utils/audio';
import SoundManager from '../utils/SoundManager';
import { calculateRewards } from '../utils/rewardSystem';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Volume2, Award, Check, X, Mic, Keyboard, Repeat } from 'lucide-react';
import SoundManager from '../utils/SoundManager';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { playWordAudio } from '../utils/audio';
import { scorePronunciation } from '../utils/phonetics';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { GameLayout } from './layout/GameLayout';

const CHALLENGE_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    LISTENING: 'listening',
    REVERSE_FLASHCARD: 'reverse_flashcard'
};

const buildOptions = (word, vocabulary) => {
    const distractors = [...vocabulary]
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.english);
    const options = [word.english, ...distractors].sort(() => Math.random() - 0.5);
    return options;
};

const buildSession = (vocabulary) => {
    const pool = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 8);
    return pool.map((word, idx) => {
        const typeCycle = idx % 3;
        const type = typeCycle === 0 ? CHALLENGE_TYPES.MULTIPLE_CHOICE : typeCycle === 1 ? CHALLENGE_TYPES.LISTENING : CHALLENGE_TYPES.REVERSE_FLASHCARD;
        return {
            id: `${word.id}-${idx}`,
            word,
            options: buildOptions(word, vocabulary),
            type
        };
    });
};
    REVERSE_FLASHCARD: 'reverse_flashcard',
    LISTEN_AND_TYPE: 'listen_type',
    SHADOW: 'shadow_audio'
};

const buildOptions = (word, vocabulary) => {
    const pool = vocabulary.filter(w => w.id !== word.id);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.english);
    return [...shuffled, word.english].sort(() => Math.random() - 0.5);
};

const buildQueue = (vocabulary) => {
    const sequence = [CHALLENGE_TYPES.MULTIPLE_CHOICE, CHALLENGE_TYPES.LISTENING, CHALLENGE_TYPES.LISTEN_AND_TYPE, CHALLENGE_TYPES.SHADOW, CHALLENGE_TYPES.REVERSE_FLASHCARD];
    const seed = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 8);

    return seed.map((word, idx) => {
        const type = sequence[idx % sequence.length];
        return {
            word,
            type,
            options: buildOptions(word, vocabulary)
        };
    });
};

const normalize = (text) => text.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Check, Lightbulb, Volume2, X } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Lightbulb, Award, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import SoundManager from '../utils/SoundManager';
import { speak } from '../utils/audio';

const CHALLENGE_TYPES = {
    MULTIPLE_CHOICE: 'multiple-choice',
    LISTENING: 'listening',
    REVERSE_FLASHCARD: 'reverse-flashcard'
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildOptions = (word, vocabulary) => {
    const distractors = shuffle(vocabulary.filter(w => w.id !== word.id)).slice(0, 3);
    return shuffle([word.english, ...distractors.map(w => w.english)]);
};

const createChallenge = (word, vocabulary, availableTypes) => {
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const base = { word, type };

    if ([CHALLENGE_TYPES.MULTIPLE_CHOICE, CHALLENGE_TYPES.LISTENING].includes(type)) {
        return { ...base, options: buildOptions(word, vocabulary) };
    }

    return base;
};

const buildSessionQueue = (words, vocabulary) => {
    const types = vocabulary.length >= 4
        ? Object.values(CHALLENGE_TYPES)
        : [CHALLENGE_TYPES.MULTIPLE_CHOICE];

    return words.map(word => createChallenge(word, vocabulary, types));
};
    REVERSE_FLASHCARD: 'reverse'
};

const SESSION_SIZE = 6;

const DailyMix = () => {
    const navigate = useNavigate();
    const { vocabulary, updateWordProgress } = useVocabulary();
    const { addXP, addCoins, updateDailyStat } = useProgress();

    const [sessionQueue, setSessionQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

    const currentChallenge = sessionQueue[currentIndex];

    useEffect(() => {
        setSessionQueue(buildSession(vocabulary));
        setCurrentIndex(0);
        setIsAnswered(false);
        setIsCorrect(false);
        setSelectedOption(null);
        setSessionComplete(false);
        setCorrectCount(0);
        setSessionReward(null);
    }, [vocabulary]);

    const onExit = () => navigate('/');
    const { vocabulary, updateWordProgress, downloadAudioOnce } = useVocabulary();
    const { addXP, addCoins, offlineAudio } = useProgress();

    const [sessionQueue, setSessionQueue] = useState(() => buildQueue(vocabulary));

    const { vocabulary, getWeightedPracticeWords, updateWordProgress } = useVocabulary();
    const { addXP, addCoins } = useProgress();

    const { vocabulary, updateWordProgress, preloadAudioForWords, playWordAudio, CATEGORIES } = useVocabulary();
    const { addXP, addCoins } = useProgress();

    const [filterCEFR, setFilterCEFR] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sessionQueue, setSessionQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [sessionComplete, setSessionComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);
    const [shadowResult, setShadowResult] = useState(null);
    const [isShadowing, setIsShadowing] = useState(false);

    const recognitionRef = useRef(null);
    const hasPrefetchedAudio = useRef(false);

    const currentChallenge = useMemo(() => sessionQueue[currentIndex], [sessionQueue, currentIndex]);

    useEffect(() => {
        setSessionQueue(buildQueue(vocabulary));
        setCurrentIndex(0);
        setIsAnswered(false);
        setIsCorrect(false);
        setInputValue('');
        setShadowResult(null);
        setTotalXP(0);
    }, [vocabulary]);

    useEffect(() => {
        if (offlineAudio && !hasPrefetchedAudio.current) {
            hasPrefetchedAudio.current = true;
            downloadAudioOnce();
        }
    }, [offlineAudio, downloadAudioOnce]);

    useEffect(() => {
        if (!currentChallenge) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'fr-FR';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
            const heard = event.results[0][0].transcript;
            const { accuracy, feedback } = scorePronunciation(currentChallenge.word.french, heard);
            const success = accuracy >= 70;

            setShadowResult({ heard, accuracy, feedback });
            setIsShadowing(false);
            setIsAnswered(true);
            setIsCorrect(success);

            if (success) {
                SoundManager.playSuccess();
                setTotalXP(prev => prev + 15);
                updateWordProgress(currentChallenge.word.id, true);
            } else {
                SoundManager.playMiss();
                updateWordProgress(currentChallenge.word.id, false);
            }
        };

        recognitionRef.current.onend = () => setIsShadowing(false);
        recognitionRef.current.onerror = () => setIsShadowing(false);
    }, [currentChallenge, updateWordProgress]);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);

    const currentChallenge = sessionQueue[currentIndex];

    const readyQueue = useMemo(() => {
        const pool = getWeightedPracticeWords ? getWeightedPracticeWords(12) : vocabulary;
        if (!pool || pool.length === 0) return [];
        return buildSessionQueue(pool.slice(0, 10), vocabulary);
    }, [getWeightedPracticeWords, vocabulary]);

    useEffect(() => {
        setSessionQueue(readyQueue);
        setCurrentIndex(0);
        setSessionComplete(false);
        setIsAnswered(false);
        setIsRevealed(false);
    }, [readyQueue]);

    const handleAnswer = (answer) => {
        if (isAnswered || !currentChallenge) return;

    const cefrLevels = useMemo(() => Array.from(new Set(vocabulary.map(word => word.cefr))).sort(), [vocabulary]);

    const filteredVocabulary = useMemo(() => {
        return vocabulary.filter(word => {
            const matchesCEFR = filterCEFR === 'all' || word.cefr === filterCEFR;
            const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
            return matchesCEFR && matchesCategory;
        });
    }, [filterCEFR, filterCategory, vocabulary]);

    const availablePool = filteredVocabulary.length > 0 ? filteredVocabulary : vocabulary;

    const getOptions = (word, pool) => {
        const distractors = pool.filter(item => item.id !== word.id);
        const shuffled = distractors.sort(() => Math.random() - 0.5);
        const sliceSize = Math.min(3, Math.max(1, shuffled.length));
        const options = [...shuffled.slice(0, sliceSize).map(item => item.english), word.english];
        return options.sort(() => Math.random() - 0.5);
    };

    const buildChallenge = (word, pool) => {
        const challengeTypes = [CHALLENGE_TYPES.MULTIPLE_CHOICE, CHALLENGE_TYPES.LISTENING, CHALLENGE_TYPES.REVERSE_FLASHCARD];
        const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

        return {
            word,
            type,
            options: type === CHALLENGE_TYPES.MULTIPLE_CHOICE || type === CHALLENGE_TYPES.LISTENING
                ? getOptions(word, pool)
                : []
        };
    };

    useEffect(() => {
        const shuffled = [...availablePool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length));
        const queue = selected.map(word => buildChallenge(word, availablePool));

        setSessionQueue(queue);
        setCurrentIndex(0);
        setIsAnswered(false);
        setIsCorrect(false);
        setSelectedOption(null);
        setSessionComplete(queue.length === 0);
        setTotalXP(0);
        preloadAudioForWords(selected);
        // Avoid re-seeding mid-session when SRS data changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCEFR, filterCategory, filteredVocabulary.length, vocabulary.length]);

    const currentChallenge = sessionQueue[currentIndex];

    useEffect(() => {
        setIsAnswered(false);
        setIsCorrect(false);
        setSelectedOption(null);
    }, [currentIndex]);

    const handleAnswer = (answer) => {
        if (isAnswered || !currentChallenge) return;

        const correct = answer === currentChallenge.word.english;
        setIsCorrect(correct);
        setIsAnswered(true);
        setSelectedOption(answer);

        updateWordProgress(currentChallenge.word.id, correct ? 'good' : 'again');

        if (correct) {
            SoundManager.playMatch();
            setTotalXP(prev => prev + 15);
        } else {
            SoundManager.playMiss();
        }
    };

    const handleTypedAnswer = () => {
        if (isAnswered) return;
        const cleaned = normalize(inputValue);
        const target = normalize(currentChallenge.word.french);
        const correct = cleaned === target;

        setIsCorrect(correct);
        setIsAnswered(true);
        if (correct) {
            SoundManager.playMatch();
            setCorrectCount(prev => prev + 1);
            updateWordProgress(currentChallenge.word.id, true);
        } else {
            SoundManager.playMiss();
            updateWordProgress(currentChallenge.word.id, false);
        }
    };

    const startShadowing = () => {
        if (!recognitionRef.current || isShadowing) return;
        setShadowResult(null);
        setIsShadowing(true);
        recognitionRef.current.start();
        playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio });
    const handleSelfGrade = (grade) => {
        const correct = grade !== 'again';
        updateWordProgress(currentChallenge.word.id, grade);
        if (correct) {
            SoundManager.playMatch();
            setTotalXP(prev => prev + 15);
        } else {
            SoundManager.playMiss();
        }
        handleNext();
    };

    const handleNext = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOption(null);
            setInputValue('');
            setShadowResult(null);
            setIsRevealed(false);
        } else {
            const reward = calculateRewards('dailyMix', {
                correct: correctCount,
                total: sessionQueue.length
            });
            setSessionReward(reward);
            addXP(reward.xp);
            addCoins(reward.coins);
            updateDailyStat('dailyReviews', sessionQueue.length);
            addXP(totalXP);
            addCoins(20);
            SoundManager.playLevelUp();
            setSessionComplete(true);
            SoundManager.playLevelUp();
        }
    };

    if (!sessionQueue.length) {
        return (
            <GameLayout title="Daily Mix" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                    <p className="text-xl text-slate-400">You need at least one word ready to study before starting Daily Mix.</p>
    const handleListen = () => {
        if (currentChallenge?.word) {
            playWordAudio(currentChallenge.word);
        }
    };

    const filterControls = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 font-semibold">CEFR Level</label>
                <select
                    value={filterCEFR}
                    onChange={(e) => setFilterCEFR(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                >
                    <option value="all">All levels</option>
                    {cefrLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 font-semibold">Topic</label>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                >
                    <option value="all">All topics</option>
                    {Object.entries(CATEGORIES).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    if (availablePool.length < 4) {
        return (
            <GameLayout title="Daily Mix" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                    {filterControls}
                    <p className="text-xl text-slate-400">You need at least 4 words in your selection to start a Daily Mix!</p>
                    <Button className="mt-8" onClick={onExit}>Go Back</Button>
                </div>
            </GameLayout>
        );
    }

    if (!currentChallenge) return null;

    if (sessionComplete) {
        return (
            <GameLayout title="Session Complete" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-8 p-8 bg-indigo-500/20 rounded-full"
                    >
                        <Award size={80} className="text-indigo-400" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 title-gradient">Daily Mix Done!</h2>
                    <p className="text-slate-400 mb-8 max-w-md text-lg">
                        Fantastic job! Recently missed items were prioritized to keep you sharp.
                    </p>
                    {sessionReward && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-12 w-full max-w-xs flex flex-col items-center shadow-2xl">
                            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Rewards</span>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <span className="text-3xl font-black text-indigo-400">+{sessionReward.xp}</span>
                                    <p className="text-xs text-indigo-300">XP</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-3xl font-black text-amber-400">+{sessionReward.coins}</span>
                                    <p className="text-xs text-amber-300">Coins</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <Button size="lg" onClick={onExit} className="px-12 py-4 text-xl">
                        Return to Hub
                    </Button>
                </div>
            </GameLayout>
        );
    }

    const headerLabel = {
        [CHALLENGE_TYPES.MULTIPLE_CHOICE]: 'What does this mean?',
        [CHALLENGE_TYPES.LISTENING]: 'What did you hear?',
        [CHALLENGE_TYPES.REVERSE_FLASHCARD]: 'Can you recall the translation?',
        [CHALLENGE_TYPES.LISTEN_AND_TYPE]: 'Listen, then type the word',
        [CHALLENGE_TYPES.SHADOW]: 'Shadow the audio in French'
    }[currentChallenge.type];
    if (!currentChallenge) {
        return (
            <GameLayout title="Daily Mix" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                    {filterControls}
                    <p className="text-xl text-slate-400">No words match your filters yet.</p>
                    <Button className="mt-8" onClick={() => { setFilterCEFR('all'); setFilterCategory('all'); }}>Reset Filters</Button>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title="Daily Mix"
            subtitle="Interleaved practice session"
            onBack={onExit}
            headerRight={
                <Badge variant="primary" className="text-lg py-1 px-4">
                    {currentIndex + 1} / {sessionQueue.length}
                </Badge>
            }
        >
            <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">
                {filterControls}

                <div className="flex items-center justify-between mb-6">
                    <Badge variant="outline" className="text-sm text-slate-300 border-white/10">
                        CEFR {currentChallenge.word.cefr}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                        {CATEGORIES[currentChallenge.word.category]?.name || currentChallenge.word.category}
                    </Badge>
                </div>

                {/* Challenge Header */}
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 text-slate-400 border-white/10 flex items-center gap-2 mx-auto w-fit">
                        <Lightbulb size={14} className="text-yellow-400" />
                        {headerLabel}
                    </Badge>

                    <div className="flex items-center justify-center gap-6">
                        {currentChallenge.type === CHALLENGE_TYPES.LISTENING && (
                            <Button
                                variant="default"
                                size="lg"
                                className="rounded-full w-24 h-24 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 group"
                                onClick={() => playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio })}
                                onClick={handleListen}
                            >
                                <Volume2 size={40} className="group-hover:scale-110 transition-transform" />
                            </Button>
                        )}
                        {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                            <h2 className="text-6xl font-black text-white px-8">
                                {currentChallenge.word.english}
                            </h2>
                        )}
                        {(currentChallenge.type === CHALLENGE_TYPES.MULTIPLE_CHOICE || currentChallenge.type === CHALLENGE_TYPES.LISTEN_AND_TYPE || currentChallenge.type === CHALLENGE_TYPES.SHADOW) && (
                            <h2 className="text-6xl font-black text-white px-8">
                                {currentChallenge.word.french}
                            </h2>
                        )}
                        {currentChallenge.type !== CHALLENGE_TYPES.LISTENING && (
                            <Button
                                variant="ghost"
                                className="rounded-full p-2 h-10 w-10"
                                onClick={() => playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio })}
                                onClick={handleListen}
                            >
                                <Volume2 size={24} className="text-slate-500" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Challenge Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                    <AnimatePresence mode="wait">
                        {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD ? (
                            <motion.div
                                key="reverse"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-lg"
                            >
                                {!isRevealed ? (
                                    <Card
                                        className="h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-dashed border-2 border-white/10"
                                        onClick={() => setIsRevealed(true)}
                                    >
                                        <p className="text-slate-500 uppercase tracking-widest font-bold">Think of the French word</p>
                                        <p className="mt-4 text-indigo-400 font-bold">Click to show answer</p>
                                    </Card>
                                ) : (
                                    <Card className="h-64 flex flex-col items-center justify-center bg-indigo-950/20 border-indigo-500/30">
                                        <h3 className="text-4xl font-black text-indigo-300">{currentChallenge.word.french}</h3>
                                        <div className="mt-12 flex gap-3 w-full px-6 flex-wrap">
                                        <p className="text-indigo-200 mt-2">{currentChallenge.word.ipa}</p>
                                        <p className="text-center text-slate-300 mt-3 px-6 text-base">
                                            {currentChallenge.word.example?.french}
                                            <span className="block text-slate-400 text-sm mt-1">{currentChallenge.word.example?.english}</span>
                                        </p>
                                        <div className="mt-12 flex gap-4 w-full px-6">
                                            <Button
                                                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 h-14"
                                                onClick={() => handleSelfGrade('again')}
                                            >
                                                <X className="mr-2" /> Again
                                            </Button>
                                            <Button
                                                className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20 h-14"
                                                onClick={() => handleSelfGrade('hard')}
                                            >
                                                Hard
                                            </Button>
                                            <Button
                                                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 h-14"
                                                onClick={() => { setIsCorrect(true); setCorrectCount(prev => prev + 1); handleNext(); }}
                                                onClick={() => handleSelfGrade('good')}
                                            >
                                                Good
                                            </Button>
                                            <Button
                                                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/20 h-14"
                                                onClick={() => handleSelfGrade('easy')}
                                            >
                                                Easy
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        ) : currentChallenge.type === CHALLENGE_TYPES.LISTEN_AND_TYPE ? (
                            <motion.div
                                key="listen-type"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-xl flex flex-col gap-4"
                            >
                                <Card className="p-6 bg-white/5 border-white/10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm uppercase tracking-widest">
                                            <Keyboard size={16} />
                                            Listen then type in French
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio })}
                                        >
                                            <Volume2 size={18} className="mr-2" /> Play Audio
                                        </Button>
                                    </div>
                                    <input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-4 text-white text-xl"
                                        placeholder="Type what you hear"
                                        disabled={isAnswered}
                                    />
                                    <Button onClick={handleTypedAnswer} disabled={isAnswered || inputValue.length === 0}>
                                        Submit
                                    </Button>
                                </Card>
                            </motion.div>
                        ) : currentChallenge.type === CHALLENGE_TYPES.SHADOW ? (
                            <motion.div
                                key="shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-xl flex flex-col gap-4 items-center"
                            >
                                <Card className="p-6 bg-white/5 border-white/10 w-full text-center flex flex-col gap-4 items-center">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm uppercase tracking-widest">
                                        <Repeat size={16} />
                                        Shadow the audio
                                    </div>
                                    <Button
                                        onClick={startShadowing}
                                        disabled={isShadowing}
                                        className="rounded-full w-24 h-24 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 group flex items-center justify-center text-lg"
                                    >
                                        <Mic size={32} className="mr-2" />
                                        {isShadowing ? 'Listening' : 'Start'}
                                    </Button>
                                    {shadowResult && (
                                        <div className="flex flex-col gap-2 items-center">
                                            <p className={`font-bold ${shadowResult.accuracy >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                Accuracy: {shadowResult.accuracy}%
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {shadowResult.feedback.map((item, idx) => (
                                                    <span
                                                        key={`${item.phoneme}-${idx}`}
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'match' ? 'bg-emerald-500/20 text-emerald-300' :
                                                            item.status === 'close' ? 'bg-amber-500/20 text-amber-300' :
                                                                'bg-red-500/20 text-red-300'}`}
                                                    >
                                                        {item.phoneme}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="options"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
                            >
                                {currentChallenge.options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        variant={isAnswered ? (option === currentChallenge.word.english ? "success" : (option === selectedOption ? "danger" : "ghost")) : "default"}
                                        className={`p-8 text-xl h-auto rounded-3xl border-2 transition-all ${!isAnswered ? "hover:scale-[1.02] active:scale-[0.98] border-white/10" : ""}`}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span>{option}</span>
                                            {isAnswered && option === currentChallenge.word.english && <Check size={24} />}
                                            {isAnswered && option === selectedOption && option !== currentChallenge.word.english && <X size={24} />}
                                        </div>
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Feedback Footer */}
                {isAnswered && currentChallenge.type !== CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute bottom-0 left-0 right-0 p-8 flex items-center justify-between backdrop-blur-xl border-t-4 shadow-2xl ${isCorrect ? "bg-emerald-950/80 border-emerald-500" : "bg-red-950/80 border-red-500"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                                {isCorrect ? <Check size={32} className="text-white" /> : <X size={32} className="text-white" />}
                            </div>
                            <div>
                                <h4 className={`text-2xl font-black ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                                    {isCorrect ? "Correct!" : "Incorrect"}
                                </h4>
                                {!isCorrect && (
                                    <p className="text-white/70">The correct answer was <span className="font-bold text-white uppercase">{currentChallenge.word.english}</span></p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant={isCorrect ? "success" : "danger"}
                            size="lg"
                            className="px-12 py-6 text-xl rounded-2xl font-black shadow-xl"
                            onClick={handleNext}
                        >
                            Continue
                        </Button>
                    </motion.div>
                )}
            </div>
        </GameLayout>
    );
};

export default DailyMix;
