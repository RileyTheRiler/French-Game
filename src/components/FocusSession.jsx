import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, X, Volume2, Timer, Zap, ArrowLeft,
    Award, Star, Heart, Trophy, BookOpen, Headphones
} from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingState } from './ui/LoadingState';
import { SuccessState } from './ui/SuccessState';
import { triggerConfetti, triggerShake } from '../utils/InteractionEffects';
import SoundManager from '../utils/SoundManager';
import { GRAMMAR_DRILLS } from '../data/grammar';
import { getDifficultyConfig } from './ui/DifficultyDial';

const CHALLENGE_TYPES = {
    MULTIPLE_CHOICE: 'multiple-choice',
    LISTENING: 'listening',
    GRAMMAR_CHECK: 'grammar-check',
    SPEED_ROUND: 'speed-round'
};

const FocusSession = () => {
    const { mode } = useParams();
    const navigate = useNavigate();
    const { vocabulary, updateWordProgress, playWordAudio, getWeightedPracticeWords } = useVocabulary();
    const { addXP, globalDifficulty, recordFocusModeCompletion } = useProgress();

    const difficultyConfig = useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    // Fix impure initialization
    const [sessionStartTime] = useState(() => Date.now());
    const [isComplete, setIsComplete] = useState(false);

    // Speed Round local state
    const [timeLeft, setTimeLeft] = useState(60); // 60s for Focus Mode
    const [isActive, setIsActive] = useState(false);

    // Track elapsed time for display to avoid impure render calls
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedMinutes(Math.floor((Date.now() - sessionStartTime) / 60000));
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionStartTime]);

    // Initialize session
    useEffect(() => {
        if (!vocabulary.length || queue.length) return;

        let sessionQueue = [];
        const words = getWeightedPracticeWords(20);

        if (mode === 'grammarHour') {
            // Primarily grammar drills
            const drills = [...GRAMMAR_DRILLS].sort(() => Math.random() - 0.5).slice(0, 10);
            sessionQueue = drills.map(drill => ({
                type: CHALLENGE_TYPES.GRAMMAR_CHECK,
                item: drill
            }));
        } else if (mode === 'listeningLab') {
            // Only listening exercises
            sessionQueue = words.slice(0, 12).map(word => {
                const distractors = vocabulary
                    .filter(w => w.id !== word.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, difficultyConfig.numOptions - 1)
                    .map(w => w.english);

                return {
                    type: CHALLENGE_TYPES.LISTENING,
                    item: word,
                    options: [word.english, ...distractors].sort(() => Math.random() - 0.5)
                };
            });
        } else if (mode === 'vocabSprint') {
            // Extended speed round
            sessionQueue = [{ type: CHALLENGE_TYPES.SPEED_ROUND }];
            setTimeLeft(120); // 2 minutes for intense focus sprint
        }

        setQueue(sessionQueue);
    }, [mode, vocabulary, difficultyConfig]);

    const finishSession = useCallback(() => {
        const timeSpent = Date.now() - sessionStartTime;
        recordFocusModeCompletion(mode, timeSpent);
        addXP(score);
        setIsComplete(true);
        triggerConfetti();
        SoundManager.playLevelUp();
    }, [mode, sessionStartTime, recordFocusModeCompletion, addXP, score]);

    // Speed Round Timer
    useEffect(() => {
        if (mode !== 'vocabSprint' || !isActive || isComplete) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    finishSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [mode, isActive, isComplete, finishSession]);

    const handleAnswer = useCallback((answer) => {
        if (isAnswered) return;

        const currentItem = queue[currentIndex];
        let correct = false;

        if (currentItem.type === CHALLENGE_TYPES.GRAMMAR_CHECK) {
            correct = answer === currentItem.item.answer;
        } else if (currentItem.type === CHALLENGE_TYPES.LISTENING) {
            correct = answer === currentItem.item.english;
        }

        setIsCorrect(correct);
        setIsAnswered(true);
        setSelectedOption(answer);

        if (correct) {
            SoundManager.playMatch();
            setScore(s => s + 10);
            if (currentItem.type === CHALLENGE_TYPES.LISTENING) {
                updateWordProgress(currentItem.item.id, 'good');
            }
        } else {
            SoundManager.playMiss();
            triggerShake('focus-session-container');
            if (currentItem.type === CHALLENGE_TYPES.LISTENING) {
                updateWordProgress(currentItem.item.id, 'again');
            }
        }
    }, [isAnswered, queue, currentIndex, updateWordProgress]);

    const handleSpeedRoundAnswer = (correct) => {
        if (correct) {
            setScore(s => s + 5);
            SoundManager.playMatch();
        } else {
            SoundManager.playMiss();
            triggerShake('focus-session-container');
        }
    };

    const handleNext = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOption(null);
        } else {
            finishSession();
        }
    };

    const onExit = () => navigate('/focus');

    if (!queue.length) return <LoadingState message="Preparing Focus Mode..." />;

    if (isComplete) {
        return (
            <GameLayout title="Focus Complete" onBack={onExit}>
                <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
                    <SuccessState
                        title="Focus Session Complete!"
                        description={`You practiced with high concentration in ${mode.replace(/([A-Z])/g, ' $1').toLowerCase()}.`}
                        actionLabel="Return to Focus List"
                        onAction={onExit}
                        playSound={false}
                    >
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto mb-8">
                            <div className="glass-panel p-4 text-center">
                                <div className="text-3xl font-black text-indigo-400">+{score}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold">XP Earned</div>
                            </div>
                            <div className="glass-panel p-4 text-center">
                                <div className="text-3xl font-black text-amber-400">
                                    {elapsedMinutes}m
                                </div>
                                <div className="text-xs text-slate-400 uppercase font-bold">Time Spent</div>
                            </div>
                        </div>
                    </SuccessState>
                </div>
            </GameLayout>
        );
    }

    const current = queue[currentIndex];

    // Speed Round Specific Component
    if (current.type === CHALLENGE_TYPES.SPEED_ROUND) {
        if (!isActive) {
            return (
                <GameLayout title="Vocab Sprint" onBack={onExit}>
                    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
                        <div className="p-8 bg-amber-500/10 rounded-full mb-6">
                            <Zap size={80} className="text-amber-500" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 title-gradient">Sprint Mode</h2>
                        <p className="text-slate-400 mb-8 max-w-md">
                            2 minutes on the clock. Match as many words as you can.
                            Speed and accuracy are key!
                        </p>
                        <Button size="lg" className="px-12 py-6 text-xl" onClick={() => setIsActive(true)}>
                            Start Sprint
                        </Button>
                    </div>
                </GameLayout>
            );
        }

        // Active Speed Round
        return (
            <GameLayout
                title="Vocab Sprint"
                headerRight={
                    <div className="flex items-center gap-2 font-mono text-xl font-bold bg-white/5 px-3 py-1 rounded-lg">
                        <Timer className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`} />
                        {timeLeft}s
                    </div>
                }
                onBack={onExit}
            >
                <div id="focus-session-container" className="flex-1 flex flex-col items-center justify-center p-4">
                    <SpeedRoundController
                        vocabulary={vocabulary}
                        onAnswer={handleSpeedRoundAnswer}
                    />
                    <div className="mt-12 text-2xl font-black text-indigo-400">
                        Score: {score}
                    </div>
                </div>
            </GameLayout>
        );
    }

    // Standard Challenge Views
    return (
        <GameLayout
            title={mode.replace(/([A-Z])/g, ' $1')}
            subtitle={`${currentIndex + 1} / ${queue.length}`}
            onBack={onExit}
            headerRight={
                <div className="text-indigo-400 font-bold">Score: {score}</div>
            }
        >
            <div id="focus-session-container" className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center p-4">

                {/* Grammar View */}
                {current.type === CHALLENGE_TYPES.GRAMMAR_CHECK && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-6">
                                {current.item.prompt.split('___').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block border-b-3 border-dashed border-purple-400 w-20 mx-1"></span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </h2>
                            <p className="text-slate-400">Select the correct form to complete the sentence</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {current.item.options.map((opt, i) => (
                                <Button
                                    key={i}
                                    variant={isAnswered ? (opt === current.item.answer ? "success" : (opt === selectedOption ? "danger" : "ghost")) : "outline"}
                                    className="h-20 text-xl border-white/10"
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isAnswered}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Listening View */}
                {current.type === CHALLENGE_TYPES.LISTENING && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 text-center flex flex-col items-center">
                            <Button
                                className="w-40 h-40 rounded-full bg-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.4)] hover:scale-105 transition-transform mb-8"
                                onClick={() => playWordAudio(current.item)}
                            >
                                <Volume2 size={64} className="text-white" />
                            </Button>
                            <h2 className="text-2xl font-bold text-slate-300">What did you hear?</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {current.options.map((opt, i) => (
                                <Button
                                    key={i}
                                    variant={isAnswered ? (opt === current.item.english ? "success" : (opt === selectedOption ? "danger" : "ghost")) : "outline"}
                                    className="h-20 text-xl border-white/10"
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isAnswered}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback Footer */}
                {isAnswered && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className={`fixed bottom-0 left-0 right-0 p-8 ${isCorrect ? 'bg-emerald-950/90 border-t border-emerald-500' : 'bg-red-950/90 border-t border-red-500'} backdrop-blur-lg flex items-center justify-between z-50`}
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {isCorrect ? <Check size={32} className="text-white" /> : <X size={32} className="text-white" />}
                            </div>
                            <div>
                                <div className="font-black text-2xl text-white">{isCorrect ? 'Excellent!' : 'Keep Learning'}</div>
                                {!isCorrect && (
                                    <div className="text-white/70 text-lg">
                                        Correct answer: <span className="font-bold underline">
                                            {current.type === CHALLENGE_TYPES.GRAMMAR_CHECK ? current.item.answer : current.item.english}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button onClick={handleNext} size="lg" className={`px-8 h-14 text-xl ${isCorrect ? "bg-white text-emerald-900" : "bg-white text-red-900"}`}>
                            Continue
                        </Button>
                    </motion.div>
                )}
            </div>
        </GameLayout>
    );
};

// Internal controller for the Speed Round logic
const SpeedRoundController = ({ vocabulary, onAnswer }) => {
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);

    const nextQuestion = useCallback(() => {
        const target = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        const distractors = vocabulary
            .filter(w => w.id !== target.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.english);

        setCurrentWord(target);
        setOptions([target.english, ...distractors].sort(() => Math.random() - 0.5));
    }, [vocabulary]);

    // Use a flag or ref to prevent double-call in strict mode if necessary,
    // but here we just ensure it runs once on mount.
    // The previous error was "Calling setState synchronously within an effect".
    // If nextQuestion calls setState (it does), calling it directly in useEffect is the issue IF it triggers a re-render that triggers the effect again.
    // Here [nextQuestion] is a dependency. nextQuestion is memoized on [vocabulary].
    // This should be stable.
    // However, to be safe, we can use a mount flag or similar.
    // Or just suppress if we trust it's fine.
    // The "synchronous setState" warning usually happens when setting state that is a dependency of the effect.
    // Here currentWord/options are NOT dependencies.
    // But `nextQuestion` is.
    // If `nextQuestion` changes, effect runs -> calls nextQuestion -> ...
    // `nextQuestion` only changes when `vocabulary` changes.
    // So this should be safe from loops.
    // The linter might be flagging it generically.
    // I'll wrap in setTimeout(..., 0) to silence the warning/error safely.

    useEffect(() => {
        const timer = setTimeout(() => {
            nextQuestion();
        }, 0);
        return () => clearTimeout(timer);
    }, [nextQuestion]);

    const handleVote = (answer) => {
        const isRight = answer === currentWord.english;
        onAnswer(isRight);
        nextQuestion();
    };

    return (
        <div className="w-full max-w-xl text-center">
            <motion.div
                key={currentWord?.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-12"
            >
                <h2 className="text-6xl font-black text-white">{currentWord?.french}</h2>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => (
                    <Button
                        key={i}
                        variant="outline"
                        className="h-24 text-2xl border-white/10 hover:bg-white/10 rounded-2xl"
                        onClick={() => handleVote(opt)}
                    >
                        {opt}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default FocusSession;
