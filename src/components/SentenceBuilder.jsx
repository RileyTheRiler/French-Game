import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Timer, Zap, Lightbulb, BookOpen, AlertTriangle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { Button } from './ui/Button';
import { checkGrammar } from '../data/grammarTips';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { generateSentenceBuilder } from '../systems/ExerciseGenerator';

const WordTile = React.memo(({ word, onClick, variant = "default" }) => (
    <motion.button
        layoutId={`word-${word.id}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(word)}
        onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(word);
            }
        }}
        className={`
            font-bold px-5 py-3 rounded-xl shadow-lg transition-colors border-b-4 active:border-b-0 active:translate-y-1
            ${variant === 'selected'
                ? 'bg-indigo-500 text-white border-indigo-700 hover:bg-indigo-400'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }
        `}
        aria-pressed={variant === 'selected'}
        aria-label={`${variant === 'selected' ? 'Remove' : 'Add'} word ${word.text}`}
    >
        {word.text}
    </motion.button>
));

const SentenceBuilder = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');

    // Merged useProgress from both branches
    const { addXP, globalDifficulty, logConceptAttempt, stats, consumeItem } = useProgress();

    const difficultyConfig = useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    // Difficulty Settings
    const hintDelay = difficultyConfig.hintDelay;
    const isFreeFormEnabled = difficultyConfig.strictSpelling;
    const warningTimerRef = useRef(null);

    // Game State
    const [puzzle, setPuzzle] = useState(null);
    const [availableWords, setAvailableWords] = useState([]);
    const [builtSentence, setBuiltSentence] = useState([]);
    const [typedAnswer, setTypedAnswer] = useState(''); // Free-form input
    const [failureCount, setFailureCount] = useState(0); // Track failures for adaptive help
    const [showFallbackTiles, setShowFallbackTiles] = useState(false); // Show tiles if struggling
    const [status, setStatus] = useState('loading'); // 'loading', 'playing', 'correct', 'wrong'
    const [feedback, setFeedback] = useState('');

    // const [grammarWarnings, setGrammarWarnings] = useState([]); // REMOVED
    const [visibleGrammarWarnings, setVisibleGrammarWarnings] = useState([]); // Delayed display
    const [questionCount, setQuestionCount] = useState(0);
    const [learningMoment, setLearningMoment] = useState(null); // { miniLesson, onDismiss }
    const MAX_QUESTIONS = 5;

    // Speed Run State
    const [isSpeedRun, setIsSpeedRun] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [speedRunActive, setSpeedRunActive] = useState(false);

    // Derived State (useMemo)
    const grammarWarnings = useMemo(() => {
        const warnings = [];
        // Simple Agreement Check logic
        for (let i = 0; i < builtSentence.length - 1; i++) {
            const current = builtSentence[i];
            const next = builtSentence[i + 1];

            // Check 1: Article - Noun Gender Agreement
            // E.g. "Le" (m) + "Pomme" (f)
            if (current.metadata?.type === 'expression' || current.metadata?.type === 'particle') {
                if (current.cleanText.toLowerCase() === 'le' && next.metadata?.gender === 'f') {
                    warnings.push(`Mismatch: 'Le' is masculine, but '${next.cleanText}' is feminine.`);
                }
                if (current.cleanText.toLowerCase() === 'la' && next.metadata?.gender === 'm') {
                    warnings.push(`Mismatch: 'La' is feminine, but '${next.cleanText}' is masculine.`);
                }
                if (current.cleanText.toLowerCase() === 'un' && next.metadata?.gender === 'f') {
                    warnings.push(`Mismatch: 'Un' is masculine, but '${next.cleanText}' is feminine.`);
                }
                if (current.cleanText.toLowerCase() === 'une' && next.metadata?.gender === 'm') {
                    warnings.push(`Mismatch: 'Une' is feminine, but '${next.cleanText}' is masculine.`);
                }
            }
        }
        return warnings;
    }, [builtSentence]);

    // Helper Functions
    const loadNextPuzzle = () => {
        const newPuzzle = generateSentenceBuilder(1);
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setAvailableWords(newPuzzle.scrambled);
            setBuiltSentence([]);
            setTypedAnswer(''); // Reset input
            setFailureCount(0);
            setShowFallbackTiles(false);
            setStatus('playing');
            setFeedback('');
            // setGrammarWarnings([]); // REMOVED - Derived
        } else {
            // Fallback if generator fails
            navigate('/');
        }
    };

    const endSpeedRun = () => {
        setSpeedRunActive(false);
        setStatus('finished');
        SoundManager.playLevelUp();
        addXP(score * 5); // 5 XP per correct
    };

    const startSpeedRun = () => {
        setIsSpeedRun(true);
        setSpeedRunActive(true);
        setTimeLeft(60);
        setScore(0);
        setQuestionCount(0);
        loadNextPuzzle();
    };

    const handleWordClick = useCallback((word) => {
        if (status !== 'playing') return;
        SoundManager.playPop();
        setBuiltSentence(prev => [...prev, word]);
        setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    }, [status]);

    const handleRemoveWord = useCallback((word) => {
        if (status !== 'playing') return;
        SoundManager.playPop();
        setAvailableWords(prev => [...prev, word]);
        setBuiltSentence(prev => prev.filter(w => w.id !== word.id));
    }, [status]);

    const useHintToken = () => {
        if (!stats.inventory?.['hint_token']) return;

        // Fix for useHintToken using puzzle data instead of missing targetSentenceData
        const targetWords = puzzle.targetFrench.split(' ');
        const nextText = targetWords[builtSentence.length];

        if (!nextText) return;

        const hintWord = availableWords.find(w => w.text === nextText);
        if (!hintWord) return;

        const consumed = consumeItem('hint_token');
        if (!consumed) return;

        SoundManager.playSuccess();
        setBuiltSentence(prev => [...prev, hintWord]);
        setAvailableWords(prev => prev.filter(w => w.id !== hintWord.id));
        setFeedback('Hint used!');
    };

    const handleSuccess = () => {
        if (isSpeedRun) {
            setScore(prev => prev + 1);
            setTimeLeft(prev => prev + 5); // Bonus time
            setFeedback('+5s Bonus!');
            loadNextPuzzle();
        } else {
            setTimeout(() => {
                if (questionCount < MAX_QUESTIONS - 1) {
                    setQuestionCount(prev => prev + 1);
                    loadNextPuzzle();
                } else {
                    SoundManager.playLevelUp();
                    setFeedback('All sentences completed!');
                    setTimeout(onExit, 2000);
                }
            }, 1500);
        }
    };

    const checkAnswer = () => {
        // Determine user answer based on active mode
        // If Free-Form is enabled and we haven't fallen back to tiles yet, use typedAnswer
        const isUsingFreeForm = isFreeFormEnabled && !showFallbackTiles;

        let isCorrect = false;

        if (isUsingFreeForm) {
            // Normalization: remove punctuation, case-insensitive, trim
            const normalize = (str) => str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
            const normalizedTyped = normalize(typedAnswer);
            const normalizedTarget = normalize(puzzle.targetFrench);
            isCorrect = normalizedTyped === normalizedTarget;
        } else {
            // Tile logic (strict order usually, or joined string)
            const currentString = builtSentence.map(w => w.text).join(' ');
            isCorrect = currentString === puzzle.targetFrench;
        }

        if (isCorrect) {
            setStatus('correct');
            setFeedback('Perfect! 🎉');
            SoundManager.playSuccess();
            // Bonus XP for free-form
            if (!isSpeedRun) addXP(isUsingFreeForm ? 30 : 20);

            handleSuccess();
        } else {
            // Check for specific grammar errors to provide feedback
            const userAnswer = isUsingFreeForm ? typedAnswer : builtSentence.map(w => w.text).join(' ');
            const grammarErrors = checkGrammar(userAnswer, { scenario: 'sentence_builder' });

            if (grammarErrors.length > 0 && !isSpeedRun) {
                // Show Learning Moment modal for the first detected error
                const error = grammarErrors[0];

                // Log concept attempt as failed
                if (error.miniLesson?.relatedConcepts) {
                    const conceptId = error.ruleId || error.miniLesson.relatedConcepts[0];
                    logConceptAttempt(conceptId, false);
                }

                setLearningMoment({
                    error,
                    miniLesson: error.miniLesson,
                    onDismiss: () => {
                        setLearningMoment(null);
                        setStatus('playing');
                        setFeedback('');
                    }
                });
                setStatus('wrong');
                setFeedback(error.explanation);
                SoundManager.playMiss();
            } else {
                setStatus('wrong');
                setFeedback('Not quite right.');
                SoundManager.playMiss();

                // Adaptive Help Logic (only in normal mode)
                if (!isSpeedRun && isUsingFreeForm) {
                    const newFailures = failureCount + 1;
                    setFailureCount(newFailures);
                    if (newFailures >= 3) {
                        setShowFallbackTiles(true);
                        setFeedback("Let's try with the word blocks instead.");
                    }
                }

                setTimeout(() => {
                    setStatus('playing');
                    setFeedback('');
                }, 1000); // Faster reset for speed run
            }
        }
    };

    // Effects
    useEffect(() => {
        if (speedRunActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (speedRunActive && timeLeft === 0) {
            setTimeout(() => {
                endSpeedRun();
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speedRunActive, timeLeft]);

    useEffect(() => {
        setTimeout(() => {
            loadNextPuzzle();
        }, 0);
    }, []);

    // Grammar check effect removed (replaced by useMemo)

    useEffect(() => {
        // Clear any pending timer
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }

        // If no warnings or instant mode, update immediately
        if (grammarWarnings.length === 0 || hintDelay === 0) {
            setTimeout(() => {
                setVisibleGrammarWarnings(grammarWarnings);
            }, 0);
            return;
        }

        // Delay showing warnings to let user think
        warningTimerRef.current = setTimeout(() => {
            setVisibleGrammarWarnings(grammarWarnings);
        }, hintDelay * 1000);

        return () => {
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
        };
    }, [grammarWarnings, hintDelay]);

    if (!puzzle) return <div className="text-white text-center p-10">Loading...</div>;

    if (status === 'finished') {
        return (
            <GameLayout title="Speed Run Complete" onBack={onExit}>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                    <Zap size={80} className="text-amber-400" />
                    <h2 className="text-4xl font-black text-white">Time's Up!</h2>
                    <p className="text-2xl text-slate-300">Sentences cleared: {score}</p>
                    <p className="text-indigo-400 font-bold">+ {score * 5} XP Earned</p>
                    <div className="flex gap-4">
                        <Button onClick={onExit} variant="secondary">Exit</Button>
                        <Button onClick={startSpeedRun}>Try Again</Button>
                    </div>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title="Sentence Builder"
            subtitle="Arrange the words to translate the sentence."
            onBack={onExit}
            headerRight={
                <div className="flex items-center gap-4">
                    {!isSpeedRun && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={startSpeedRun}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        >
                            <Zap size={16} className="mr-1" /> Speed Run
                        </Button>
                    )}
                    {isSpeedRun ? (
                        <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                            <Timer size={20} />
                            {timeLeft}s
                            <span className="ml-2 text-white">Score: {score}</span>
                        </div>
                    ) : (
                        <div className="text-white/50 text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                            {questionCount + 1} / {MAX_QUESTIONS}
                        </div>
                    )}
                </div>
            }
        >
            <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-200px)]">
                {/* Target Sentence */}
                <Card className="mb-8 text-center p-8 bg-slate-800/50 border-white/5" role="region" aria-label="Sentence prompt">
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-4">Translate this</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                        "{puzzle.targetEnglish}"
                    </h2>
                </Card>

                {/* Construction Area */}
                <div className="flex-1 relative">
                    {/* Grammar Warnings Overlay */}
                    <AnimatePresence>
                        {visibleGrammarWarnings.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-12 left-0 right-0 mx-auto w-fit z-10"
                            >
                                <div className="bg-amber-500/90 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
                                    <AlertTriangle size={16} className="text-amber-200" />
                                    {visibleGrammarWarnings[0]}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isFreeFormEnabled && !showFallbackTiles ? (
                        <div className="mb-8 relative">
                            <input
                                type="text"
                                value={typedAnswer}
                                onChange={(e) => setTypedAnswer(e.target.value)}
                                placeholder="Type the French translation here..."
                                className={`
                                    w-full bg-slate-900/50 rounded-3xl p-6 text-2xl text-center text-white font-bold 
                                    border-2 transition-all outline-none placeholder:text-slate-600 placeholder:font-normal
                                    ${status === 'correct' ? 'border-green-500 bg-green-500/10' : ''}
                                    ${status === 'wrong' ? 'border-red-500 bg-red-500/10 animate-shake' : 'border-white/10 focus:border-indigo-500'}
                                `}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') checkAnswer();
                                }}
                                autoFocus
                                disabled={status !== 'playing'}
                            />
                            {status === 'wrong' && (
                                <p className="text-red-400 text-sm mt-2 text-center animate-pulse">
                                    {failureCount}/3 attempts before help
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className={`
                            min-h-[120px] bg-slate-900/50 rounded-3xl p-6 mb-8 flex flex-wrap gap-3 justify-center items-center border-2 border-dashed transition-colors
                            ${status === 'correct' ? 'border-green-500 bg-green-500/10' : ''}
                            ${status === 'wrong' ? 'border-red-500 bg-red-500/10' : 'border-white/10'}
                        `}>
                            <AnimatePresence mode="popLayout">
                                {builtSentence.length === 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-white/20 font-medium absolute pointer-events-none"
                                        aria-hidden="true"
                                    >
                                        Tap words to build your sentence...
                                    </motion.p>
                                )}
                                {builtSentence.map((word) => (
                                    <WordTile
                                        key={word.id}
                                        word={word}
                                        onClick={handleRemoveWord}
                                        variant="selected"
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Word Bank */}
                    <div className="p-6 bg-slate-900/30 rounded-3xl min-h-[100px]">
                        <div className="flex flex-wrap gap-3 justify-center">
                            <AnimatePresence mode="popLayout">
                                {availableWords.map((word) => (
                                    <WordTile
                                        key={word.id}
                                        word={word}
                                        onClick={handleWordClick}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="h-24 flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {status === 'correct' && (
                            <motion.div
                                key="correct"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="flex items-center gap-2 text-green-400 font-black text-2xl bg-green-400/10 px-6 py-3 rounded-full"
                                role="status"
                            >
                                <Check size={28} strokeWidth={3} /> {feedback}
                            </motion.div>
                        )}

                        {status === 'wrong' && (
                            <motion.div
                                key="wrong"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="flex items-center gap-2 text-red-400 font-bold text-xl bg-red-400/10 px-6 py-3 rounded-full"
                                role="status"
                            >
                                <X size={24} /> {feedback}
                            </motion.div>
                        )}

                        {status === 'playing' && (
                            <motion.div
                                key="playing"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                            >
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={checkAnswer}
                                        disabled={builtSentence.length === 0}
                                        size="lg"
                                        className="px-12 rounded-full shadow-xl shadow-indigo-500/20"
                                    >
                                        Check Answer
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        disabled={!stats.inventory?.['hint_token'] || status !== 'playing'}
                                        onClick={useHintToken}
                                        className="rounded-full"
                                    >
                                        Hint ({stats.inventory?.['hint_token'] || 0})
                                    </Button>
                                </div>
                                <Button
                                    onClick={checkAnswer}
                                    disabled={isFreeFormEnabled && !showFallbackTiles ? typedAnswer.length === 0 : builtSentence.length === 0}
                                    size="lg"
                                    className="px-12 rounded-full shadow-xl shadow-indigo-500/20"
                                    aria-label="Check answer. Press Enter to submit."
                                >
                                    Check Answer
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Learning Moment Modal */}
            <AnimatePresence>
                {learningMoment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={learningMoment.onDismiss}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

                            <div className="flex flex-col space-y-4">
                                {/* Header */}
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                                        <Lightbulb size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {learningMoment.miniLesson?.title || 'Learning Moment'}
                                        </h3>
                                        <p className="text-sm text-slate-400">Let's learn from this!</p>
                                    </div>
                                </div>

                                {/* Error Display */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                                        <X size={16} />
                                        <span>Your answer:</span>
                                    </div>
                                    <p className="text-white font-mono">{learningMoment.error?.found}</p>
                                </div>

                                {/* Correct Answer */}
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                                        <Check size={16} />
                                        <span>Should be:</span>
                                    </div>
                                    <p className="text-white font-mono">{learningMoment.error?.expected}</p>
                                </div>

                                {/* Key Point */}
                                {learningMoment.miniLesson?.keyPoint && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-indigo-400 font-medium mb-2">
                                            <BookOpen size={16} />
                                            <span>Key Point</span>
                                        </div>
                                        <p className="text-slate-200">
                                            {learningMoment.miniLesson.keyPoint.split(/(\*\*.*?\*\*)/g).map((part, index) => (
                                                part.startsWith('**') && part.endsWith('**')
                                                    ? <strong key={index} className="text-white">{part.slice(2, -2)}</strong>
                                                    : part
                                            ))}
                                        </p>
                                    </div>
                                )}

                                {/* Examples */}
                                {learningMoment.miniLesson?.examples && learningMoment.miniLesson.examples.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-400 font-medium">Examples:</p>
                                        <div className="grid gap-2">
                                            {learningMoment.miniLesson.examples.slice(0, 3).map((ex, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    {ex.wrong && (
                                                        <>
                                                            <span className="text-red-400 line-through">{ex.wrong}</span>
                                                            <span className="text-slate-500">→</span>
                                                        </>
                                                    )}
                                                    <span className="text-green-400">{ex.correct}</span>
                                                    {ex.note && <span className="text-slate-500">({ex.note})</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tip */}
                                {learningMoment.miniLesson?.tip && (
                                    <div className="text-sm text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg">
                                        💡 {learningMoment.miniLesson.tip}
                                    </div>
                                )}

                                {/* Dismiss Button */}
                                <Button
                                    onClick={learningMoment.onDismiss}
                                    className="w-full mt-2"
                                >
                                    Got it, let me try again!
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GameLayout>
    );
};

export default SentenceBuilder;
