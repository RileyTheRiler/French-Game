import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, RotateCcw, Pin, Clock3, BellOff } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { speak } from '../utils/audio';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import { getDifficultyConfig } from './ui/DifficultyDial';
import GrammarInsightCard from './ui/GrammarInsightCard';
import { calculateRewards } from '../utils/rewardSystem';
import DifficultySlider from './ui/DifficultySlider';
import { formatRelativeTime } from '../utils/time';

const FlashcardMode = ({ mode = 'standard' }) => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    // Wrap onExit in useCallback to stabilize dependency
    const onExit = useCallback(() => navigate('/'), [navigate]);

    const {
        updateWordProgress, vocabulary, getWeightedPracticeWords, getDeckWords, customDecks,
        togglePinWord, snoozeWord, clearSnooze, markWordSeen, CATEGORIES
    } = useVocabulary();

    const {
        reducedMotion, logWordAttempt, globalDifficulty,
        addXP, addCoins, updateDailyStat, setModeDifficulty, stats
    } = useProgress();

    const difficultyConfig = useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    const [difficulty, setDifficulty] = useState(stats?.difficultySettings?.flashcards || 2);
    const [sessionScore, setSessionScore] = useState(0);
    const cardStartRef = useRef(0);
    const containerRef = useRef(null);

    const getStudyQueue = useCallback(() => {
        if (deckId) {
            const deckWords = getDeckWords(deckId);
            return deckWords.slice(0, 20);
        }

        let pool = getWeightedPracticeWords ? getWeightedPracticeWords(20) : vocabulary;
        if (mode === 'mix') {
            pool = [...pool].sort(() => Math.random() - 0.5);
        } else {
            pool = [...pool].sort((a, b) => (a.srs?.dueDate || 0) - (b.srs?.dueDate || 0));
        }

        // Session size adjusted by difficulty
        const sessionSize = globalDifficulty > 70 ? 15 : 10;
        return pool.slice(0, sessionSize);
    }, [getWeightedPracticeWords, vocabulary, mode, deckId, getDeckWords, globalDifficulty]);

    const [queue, setQueue] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);
    const currentWord = queue[currentCardIndex];

    const getGrammarTip = (word) => {
        if (!word) return null;

        if (word.pos === 'noun' && word.gender) {
            const isMasc = word.gender === 'm';
            const genderTerm = isMasc ? 'Masculine' : 'Feminine';
            const article = isMasc ? 'le / un' : 'la / une';

            let trick = '';
            if (word.french.endsWith('tion') && !isMasc) trick = 'Nouns ending in -tion are typically feminine.';
            else if (word.french.endsWith('ment') && isMasc) trick = 'Nouns ending in -ment are typically masculine.';
            else if (word.french.endsWith('e') && isMasc) trick = 'Careful: Ends in -e but is masculine!';
            else if (!word.french.endsWith('e') && !isMasc) trick = 'Careful: No -e ending but is feminine!';

            return {
                id: `tip_${word.id}`,
                title: `${genderTerm} Noun`,
                content: `Use "${article}" with "${word.french}".`,
                whyItMatters: `Gender determines the article and adjective agreement (e.g., "un beau ${word.french}" vs "une belle ${word.french}").`,
                memoryTrick: trick
            };
        }
        return null;
    };

    useEffect(() => {
        setQueue(getStudyQueue());
        setCurrentCardIndex(0);
        setSessionComplete(false);
        setCorrectCount(0);
        setWrongCount(0);
        setCurrentStreak(0);
        setBestStreak(0);
        setSessionReward(null);
        setSessionScore(0);
        cardStartRef.current = performance.now();
    }, [mode, getStudyQueue]);

    useEffect(() => {
        setModeDifficulty('flashcards', difficulty);
    }, [difficulty, setModeDifficulty]);

    useEffect(() => {
        if (currentWord) {
            markWordSeen(currentWord.id);
        }
    }, [currentWord, markWordSeen]);

    useEffect(() => {
        cardStartRef.current = performance.now();
    }, [currentCardIndex]);

    const shouldShowHint = useMemo(() => {
        if (!currentWord) return false;
        // Simple hint logic
        return difficulty <= 2;
    }, [currentWord, difficulty]);

    const finishSession = (metrics) => {
        const reward = calculateRewards('flashcards', metrics);
        setSessionReward(reward);
        addXP(reward.xp);
        addCoins(reward.coins);
        setSessionComplete(true);
    };

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
        if (!isFlipped && currentWord) {
            speak(currentWord.french);
        }
    }, [currentWord, isFlipped]);

    const handleGrading = useCallback((grade) => {
        if (!currentWord) return;

        const isCorrect = grade === 'good' || grade === 'easy' || grade === true;

        // Calculate new stats
        const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
        const nextWrong = isCorrect ? wrongCount : wrongCount + 1;
        const nextStreak = isCorrect ? currentStreak + 1 : 0;
        const nextBestStreak = isCorrect ? Math.max(bestStreak, nextStreak) : bestStreak;

        setCorrectCount(nextCorrect);
        setWrongCount(nextWrong);
        setCurrentStreak(nextStreak);
        setBestStreak(nextBestStreak);

        if (isCorrect) {
            updateDailyStat('dailyStreak', nextStreak, 'max');
        }
        updateDailyStat('dailyReviews', 1);

        logWordAttempt(currentWord.category || 'General', isCorrect, 0, currentWord.id);
        updateWordProgress(currentWord.id, grade);
        setIsFlipped(false);

        if (currentCardIndex < queue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            finishSession({
                correct: nextCorrect,
                total: queue.length,
                bestStreak: nextBestStreak
            });
        }
    }, [currentCardIndex, currentWord, queue.length, updateWordProgress, logWordAttempt, correctCount, wrongCount, currentStreak, bestStreak, updateDailyStat]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [currentCardIndex, sessionComplete]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onExit();
                return;
            }

            if (sessionComplete) return;

            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                handleFlip();
            }

            if (isFlipped) {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    handleGrading(false);
                }
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    handleGrading(true);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, sessionComplete, onExit, handleGrading, handleFlip]);

    if (!currentWord || sessionComplete) {
        return (
            <GameLayout title="Session Complete">
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="mb-8 p-6 bg-emerald-500/20 rounded-full"
                    >
                        <Check size={80} className="text-emerald-400" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 title-gradient">Excellent Work!</h2>
                    <p className="text-slate-400 mb-8 max-w-md">
                        You've completed your study session. Your spaced repetition stats have been updated.
                    </p>
                    {sessionReward && (
                        <div className="flex gap-6 mb-8">
                            <div className="bg-indigo-500/10 border border-indigo-500/30 px-6 py-4 rounded-2xl text-center">
                                <p className="text-xs uppercase text-indigo-200 tracking-wider">XP</p>
                                <p className="text-3xl font-black text-indigo-300">+{sessionReward.xp}</p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 px-6 py-4 rounded-2xl text-center">
                                <p className="text-xs uppercase text-amber-200 tracking-wider">Coins</p>
                                <p className="text-3xl font-black text-amber-300">+{sessionReward.coins}</p>
                            </div>
                        </div>
                    )}
                    <Badge variant="outline" className="mb-6">
                        Adaptive Score: {sessionScore}
                    </Badge>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={() => {
                            setQueue(getStudyQueue());
                            setCurrentCardIndex(0);
                            setSessionComplete(false);
                            setCorrectCount(0);
                            setWrongCount(0);
                            setCurrentStreak(0);
                            setBestStreak(0);
                            setSessionReward(null);
                            setSessionScore(0);
                            cardStartRef.current = performance.now();
                        }}>
                            <RotateCcw size={20} /> Review Again
                        </Button>
                        <Button variant="ghost" size="lg" onClick={onExit}>
                            Return to Menu
                        </Button>
                    </div>
                </div>
            </GameLayout>
        );
    }

    const now = Date.now();
    const isSnoozed = currentWord?.snoozeUntil && currentWord.snoozeUntil > now;
    const metaTooltip = currentWord ? `Lvl ${currentWord.level} • Last seen ${formatRelativeTime(currentWord.lastSeen)}${currentWord.pinned ? ' • Pinned' : ''}` : '';

    return (
        <GameLayout
            title={deckId ? (customDecks.find(d => d.id === deckId)?.name || 'Custom Deck') : (mode === 'mix' ? "Daily Mix" : "Flashcards")}
            subtitle={deckId ? "Reviewing your custom word collection." : "Practice your vocabulary with spaced repetition."}
            onBack={onExit}
            headerRight={
                <div className="flex items-center gap-3">
                    <div className="hidden md:block w-44">
                        <DifficultySlider
                            value={difficulty}
                            onChange={setDifficulty}
                            label="Difficulty"
                        />
                    </div>
                    <Badge variant="outline" className="text-xs py-1 px-3">
                        Session Score: {sessionScore}
                    </Badge>
                    <Badge variant="primary" className="text-lg py-1 px-4">
                        {currentCardIndex + 1} / {queue.length}
                    </Badge>
                </div>
            }
        >
            <div
                className="flex flex-col items-center justify-center h-[calc(100vh-200px)]"
                ref={containerRef}
                tabIndex={-1}
                aria-label="Flashcard session"
                role="main"
            >

                {/* 3D Card Container */}
                <div
                    className="relative w-full max-w-lg aspect-[4/3] cursor-pointer"
                    style={{ perspective: "2000px" }}
                    onClick={handleFlip}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isFlipped}
                    aria-label={isFlipped ? 'Hide translation' : 'Reveal translation'}
                >
                    <motion.div
                        className="w-full h-full relative"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={reducedMotion ? { duration: 0.1 } : { duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* Front */}
                        <Card
                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center bg-slate-900 border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-[40px] overflow-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                            title={metaTooltip}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.15),_transparent)]" />
                            <Badge variant="primary" className="absolute top-8 left-8 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold px-4 py-1">Lvl {currentWord.level}</Badge>
                            <h2 className="text-7xl font-black text-white px-12 text-center drop-shadow-2xl lowercase tracking-tight">{currentWord.french}</h2>
                            <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-40">
                                <p className="text-slate-500 text-xs font-black tracking-[0.3em] uppercase">Click to Reveal</p>
                                <div className="w-12 h-1 bg-white/10 rounded-full" />
                            </div>
                        </Card>

                        {/* Back */}
                        <Card
                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center bg-indigo-950 border-white/20 shadow-2xl rounded-[40px] overflow-hidden p-6"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                            <h2 className="text-5xl font-black text-white px-8 text-center mb-6 drop-shadow-xl">{currentWord.english}</h2>

                            {/* Grammar Insight */}
                            <div className="w-full max-w-xs mb-6 relative z-10">
                                {(() => {
                                    const tip = getGrammarTip(currentWord);
                                    return tip && (
                                        <GrammarInsightCard
                                            tip={tip}
                                            compact={true}
                                            showDeepDiveLink={false}
                                            isCorrect={true} // Style as informative
                                        />
                                    );
                                })()}
                            </div>

                            <Button
                                variant="secondary"
                                className="rounded-2xl p-6 h-20 w-20 bg-white/5 border-white/10 hover:bg-white/10 group overflow-hidden"
                                onClick={(e) => { e.stopPropagation(); speak(currentWord.french); }}
                                aria-label={`Hear pronunciation for ${currentWord.french}`}
                            >
                                <Volume2 size={36} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            </Button>
                        </Card>
                    </motion.div>
                </div>

                {shouldShowHint && (
                    <div className="mt-6 text-center text-sm text-slate-300">
                        <Badge variant="outline" className="mr-2">Hint</Badge>
                        <span>{currentWord.english} · {CATEGORIES?.[currentWord.category]?.name || currentWord.category}</span>
                    </div>
                )}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
                    <Badge variant="outline" className="bg-white/5 border-white/10 flex items-center gap-2">
                        <Clock3 size={14} /> Last seen: {formatRelativeTime(currentWord.lastSeen)}
                    </Badge>
                    <Badge variant="primary" className="flex items-center gap-2">
                        Mastery Lvl {currentWord.level}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full ${currentWord.pinned ? 'text-emerald-300' : ''}`}
                        onClick={() => togglePinWord(currentWord.id)}
                    >
                        <Pin size={14} /> {currentWord.pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => isSnoozed ? clearSnooze(currentWord.id) : snoozeWord(currentWord.id)}
                    >
                        <BellOff size={14} /> {isSnoozed ? 'Unsnooze' : 'Snooze 6h'}
                    </Button>
                </div>

                {/* Grading Controls */}
                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap gap-4 mt-12 justify-center"
                        >
                            <Button
                                variant="danger"
                                size="lg"
                                className="px-10 py-6 rounded-2xl"
                                onClick={() => handleGrading('again')}
                            >
                                <X className="mr-2" /> Again
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="px-10 py-6 rounded-2xl"
                                onClick={() => handleGrading('hard')}
                            >
                                Hard
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                className="px-10 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => handleGrading('good')}
                            >
                                Good
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                className="px-10 py-6 rounded-2xl bg-blue-600 hover:bg-blue-500"
                                onClick={() => handleGrading('easy')}
                            >
                                Easy
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default FlashcardMode;
