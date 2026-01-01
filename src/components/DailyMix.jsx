import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Check, Lightbulb, Volume2, X, Timer, Zap, RotateCcw, Calendar } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { LoadingState } from './ui/LoadingState';
import { SuccessState } from './ui/SuccessState';
import { triggerShake, triggerConfetti } from '../utils/InteractionEffects';
import SoundManager from '../utils/SoundManager';
import { GRAMMAR_DRILLS, DRILL_CATEGORIES } from '../data/grammar';
import { generateContextCloze } from '../data/contextClozeData';
import { calculateRetentionProbability } from '../utils/srs';

const CHALLENGE_TYPES = {
    MULTIPLE_CHOICE: 'multiple-choice',
    LISTENING: 'listening',
    REVERSE_FLASHCARD: 'reverse-flashcard',
    GRAMMAR_CHECK: 'grammar-check',
    SPEED_ROUND: 'speed-round',
    CONTEXT_CLOZE: 'context-cloze'
};

const SESSION_SIZE = 8; // Increased size to fit variety

const SpeedRound = ({ vocabulary, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    // Game loop
    useEffect(() => {
        if (!isActive || gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, gameOver]);

    // Initialize round
    useEffect(() => {
        nextQuestion();
    }, []);

    const nextQuestion = () => {
        if (vocabulary.length < 4) return;
        const target = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        const distractors = vocabulary
            .filter(w => w.id !== target.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.english);

        setCurrentWord(target);
        setOptions([target.english, ...distractors].sort(() => Math.random() - 0.5));
    };

    const handleAnswer = (answer) => {
        if (gameOver) return;

        if (answer === currentWord.english) {
            setScore(s => s + 1);
            SoundManager.playMatch();
            nextQuestion();
        } else {
            SoundManager.playMiss();
            // Penalty? Or just shake?
        }
    };

    if (!isActive && !gameOver) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="p-6 bg-amber-500/20 rounded-full mb-4">
                    <Zap size={64} className="text-amber-400" />
                </div>
                <h2 className="text-4xl font-black title-gradient">Speed Round!</h2>
                <p className="text-slate-400 text-lg max-w-md text-center">
                    30 seconds on the clock. How many words can you match?
                    <br />
                    <span className="text-indigo-400 font-bold mt-2 block">Binary scoring: +1 for correct, 0 for wrong.</span>
                </p>
                <Button size="lg" className="px-12 py-6 text-2xl" onClick={() => setIsActive(true)}>
                    Start!
                </Button>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                <h2 className="text-4xl font-black text-white">Time's Up!</h2>
                <div className="text-6xl font-black text-amber-400">{score} Matches</div>
                <p className="text-slate-400">Awesome speed! +{score * 5} Bonus XP</p>
                <Button size="lg" onClick={() => onComplete(score * 5)}>Finish Round</Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2">
                    <Timer className="text-amber-400" />
                    <span className={`text-2xl font-bold font-mono ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}s
                    </span>
                </div>
                <div className="text-2xl font-black text-indigo-400">Score: {score}</div>
            </div>

            <div className="mb-12">
                <h2 className="text-5xl font-black text-white">{currentWord?.french}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                {options.map((opt, i) => (
                    <Button
                        key={i}
                        variant="outline"
                        className="h-20 text-xl border-white/10 hover:bg-white/10"
                        onClick={() => handleAnswer(opt)}
                    >
                        {opt}
                    </Button>
                ))}
            </div>
        </div>
    );
};

const DailyMix = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');

    const { vocabulary, getWeightedPracticeWords, updateWordProgress, playWordAudio, preloadAudioForWords } = useVocabulary();
    const { addXP, addCoins, incrementDailyMixStreak, dailyMixStreak } = useProgress();

    const [sessionQueue, setSessionQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Challenge State
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isRevealed, setIsRevealed] = useState(false); // For Flashcards

    // Session State
    const [sessionComplete, setSessionComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);
    const [bonusXP, setBonusXP] = useState(0);
    const [combo, setCombo] = useState(0);

    // Build the Mixed Session
    const generateSession = () => {
        const weightedWords = getWeightedPracticeWords(10); // Get top priority words

        let queue = [];

        // 1. Add Vocabulary Challenges (Mixed Types)
        // Prioritize context cloze for words with low retention
        weightedWords.slice(0, 5).forEach(word => {
            const retention = calculateRetentionProbability(word.srs);

            // For low-retention words, try context cloze first
            if (retention < 0.7) {
                const clozeExercise = generateContextCloze(word, 2);
                if (clozeExercise) {
                    queue.push({
                        word,
                        type: CHALLENGE_TYPES.CONTEXT_CLOZE,
                        clozeData: clozeExercise,
                        retention,
                        isSRSFocus: true
                    });
                    return;
                }
            }

            const types = [CHALLENGE_TYPES.MULTIPLE_CHOICE, CHALLENGE_TYPES.LISTENING, CHALLENGE_TYPES.REVERSE_FLASHCARD];
            const type = types[Math.floor(Math.random() * types.length)];

            // Build options for MCQ/Listening
            let options = [];
            if (type !== CHALLENGE_TYPES.REVERSE_FLASHCARD) {
                const distractors = vocabulary.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
                options = [word.english, ...distractors.map(d => d.english)].sort(() => Math.random() - 0.5);
            }

            queue.push({ word, type, options, retention });
        });

        // 2. Add Grammar Drill (1-2 per session)
        if (GRAMMAR_DRILLS.length > 0) {
            const drill = GRAMMAR_DRILLS[Math.floor(Math.random() * GRAMMAR_DRILLS.length)];
            queue.splice(2, 0, { type: CHALLENGE_TYPES.GRAMMAR_CHECK, drill }); // Insert at index 2
        }

        // 3. Add Speed Round as Finale
        queue.push({ type: CHALLENGE_TYPES.SPEED_ROUND });

        setSessionQueue(queue);
        setCurrentIndex(0);
        setSessionComplete(false);
        setTotalXP(0);
        setBonusXP(0);
        setCombo(0);
        setIsAnswered(false);

        console.log("Daily Mix Generated:", queue.length, "items");
        preloadAudioForWords(weightedWords);
    };

    // Initial Load
    useEffect(() => {
        if (vocabulary.length > 0 && sessionQueue.length === 0) {
            generateSession();
        }
    }, [vocabulary]);

    const currentChallenge = sessionQueue[currentIndex];

    const handleAnswer = (answer) => {
        if (isAnswered) return;

        const isRight = answer === currentChallenge.word.english;
        setIsCorrect(isRight);
        setIsAnswered(true);
        setSelectedOption(answer);

        if (isRight) {
            SoundManager.playMatch();
            const comboBonus = Math.floor(combo / 3) * 5;
            setTotalXP(prev => prev + 10 + comboBonus);
            setCombo(c => c + 1);
            if (currentChallenge.type !== CHALLENGE_TYPES.GRAMMAR_CHECK) {
                updateWordProgress(currentChallenge.word.id, 'good');
            }
        } else {
            SoundManager.playMiss();
            triggerShake('daily-mix-container');
            setCombo(0);
            if (currentChallenge.type !== CHALLENGE_TYPES.GRAMMAR_CHECK) {
                updateWordProgress(currentChallenge.word.id, 'again');
            }
        }
    };

    const handleGrammarAnswer = (option) => {
        if (isAnswered) return;
        const isRight = option === currentChallenge.drill.answer;

        setIsCorrect(isRight);
        setIsAnswered(true);
        setSelectedOption(option);

        if (isRight) {
            SoundManager.playMatch();
            setTotalXP(prev => prev + (currentChallenge.drill.xpReward || 15));
            setCombo(c => c + 1);
        } else {
            SoundManager.playMiss();
            triggerShake('daily-mix-container');
            setCombo(0);
        }
    };

    const handleContextClozeAnswer = (option) => {
        if (isAnswered || !currentChallenge.clozeData) return;
        const isRight = option === currentChallenge.clozeData.answer;

        setIsCorrect(isRight);
        setIsAnswered(true);
        setSelectedOption(option);

        if (isRight) {
            SoundManager.playMatch();
            const comboBonus = Math.floor(combo / 3) * 5;
            setTotalXP(prev => prev + 15 + comboBonus); // Context cloze worth more
            setCombo(c => c + 1);
            updateWordProgress(currentChallenge.word.id, 'good');
        } else {
            SoundManager.playMiss();
            triggerShake('daily-mix-container');
            setCombo(0);
            updateWordProgress(currentChallenge.word.id, 'again');
        }
    };

    const handleFlashcardGrade = (grade) => {
        updateWordProgress(currentChallenge.word.id, grade);
        if (grade !== 'again') {
            SoundManager.playMatch();
            setTotalXP(prev => prev + 15);
        } else {
            SoundManager.playMiss();
            triggerShake('daily-mix-container');
        }
        handleNext();
    };

    const handleSpeedRoundComplete = (xpEarned) => {
        setBonusXP(xpEarned);
        handleNext();
    };

    const handleNext = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOption(null);
            setIsRevealed(false);
        } else {
            finishSession();
        }
    };

    const finishSession = () => {
        SoundManager.playLevelUp();
        triggerConfetti();
        addXP(totalXP + bonusXP);
        addCoins(25);
        incrementDailyMixStreak();
        setSessionComplete(true);
    };

    if (!sessionQueue.length) return <LoadingState message="Preparing your Daily Mix..." />;

    if (sessionComplete) {
        return (
            <GameLayout title="Daily Mix Complete" onBack={onExit}>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                    <SuccessState
                        title="Daily Mix Complete!"
                        description="Excellent work keeping your streak alive."
                        actionLabel="Return Home"
                        onAction={onExit}
                        playSound={false} // Handled in finishSession
                        secondaryAction={
                            <div className="flex gap-3 w-full">
                                <Button variant="outline" className="flex-1 border-white/10" onClick={generateSession}>
                                    <RotateCcw size={18} className="mr-2" />
                                    Redo
                                </Button>
                                <Button variant="outline" className="flex-1 border-white/10">
                                    <Calendar size={18} className="mr-2" />
                                    Tmrw
                                </Button>
                            </div>
                        }
                    >
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
                            <div className="bg-white/5 p-4 rounded-2xl text-center">
                                <div className="text-3xl font-black text-indigo-400">+{totalXP + bonusXP}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold">Total XP</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl text-center">
                                <div className="text-3xl font-black text-amber-400">+25</div>
                                <div className="text-xs text-slate-400 uppercase font-bold">Coins</div>
                            </div>
                        </div>
                    </SuccessState>
                </div>
            </GameLayout>
        );
    }

    // Speed Round View
    if (currentChallenge.type === CHALLENGE_TYPES.SPEED_ROUND) {
        return (
            <GameLayout title="Daily Mix" subtitle="Speed Round" onBack={onExit}>
                <div className="flex-1 flex flex-col justify-center">
                    <SpeedRound vocabulary={vocabulary} onComplete={handleSpeedRoundComplete} />
                </div>
            </GameLayout>
        );
    }

    // Standard Views
    return (
        <GameLayout
            title="Daily Mix"
            subtitle={`Streak: ${dailyMixStreak || 0} days`}
            onBack={onExit}
            headerRight={
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                    {currentIndex + 1} / {sessionQueue.length}
                </Badge>
            }
        >
            <div id="daily-mix-container" className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center p-4">

                {/* Grammar View */}
                {currentChallenge.type === CHALLENGE_TYPES.GRAMMAR_CHECK && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center">
                            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                                Grammar Drill
                            </Badge>
                            <h2 className="text-3xl font-bold text-white mb-2 leading-snug">
                                {currentChallenge.drill.prompt.split('___').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block border-b-2 border-dashed border-purple-400 w-16 mx-1"></span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentChallenge.drill.options.map((opt, i) => (
                                <Button
                                    key={i}
                                    variant={isAnswered ? (opt === currentChallenge.drill.answer ? "success" : (opt === selectedOption ? "danger" : "ghost")) : "outline"}
                                    className="h-16 text-lg border-white/10"
                                    onClick={() => handleGrammarAnswer(opt)}
                                    disabled={isAnswered}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Context Cloze View (SRS Focus) */}
                {currentChallenge.type === CHALLENGE_TYPES.CONTEXT_CLOZE && currentChallenge.clozeData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 text-center">
                            <div className="flex justify-center gap-2 mb-4">
                                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                    SRS Focus
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    Context Cloze
                                </Badge>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-relaxed">
                                {currentChallenge.clozeData.question.split('_____').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className={`
                                                inline-block px-3 py-1 mx-1 rounded-lg border-b-2 min-w-[80px]
                                                ${isAnswered && isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : ''}
                                                ${isAnswered && !isCorrect ? 'bg-red-500/20 border-red-500 text-red-300' : ''}
                                                ${!isAnswered ? 'bg-white/10 border-white/30 text-transparent' : ''}
                                            `}>
                                                {isAnswered ? currentChallenge.clozeData.answer : '?'}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </h2>
                            {currentChallenge.clozeData.translation && (
                                <p className="text-slate-400 text-sm italic mt-2">
                                    {currentChallenge.clozeData.translation}
                                </p>
                            )}
                        </div>
                        {!isAnswered && (
                            <div className="grid grid-cols-2 gap-3">
                                {currentChallenge.clozeData.options.map((opt, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className="h-14 text-lg border-white/10 hover:bg-white/5"
                                        onClick={() => handleContextClozeAnswer(opt)}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {isAnswered && !isCorrect && (
                            <p className="text-center text-red-400 mt-4">
                                Correct answer: <span className="font-bold">{currentChallenge.clozeData.answer}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Vocabulary Views (MCQ / Listening) */}
                {(currentChallenge.type === CHALLENGE_TYPES.MULTIPLE_CHOICE || currentChallenge.type === CHALLENGE_TYPES.LISTENING) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 text-center flex flex-col items-center">
                            {currentChallenge.type === CHALLENGE_TYPES.LISTENING ? (
                                <Button
                                    className="w-32 h-32 rounded-full bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-105 transition-transform"
                                    onClick={() => playWordAudio(currentChallenge.word)}
                                >
                                    <Volume2 size={48} className="text-white" />
                                </Button>
                            ) : (
                                <h2 className="text-5xl font-black text-white">{currentChallenge.word.french}</h2>
                            )}
                            <p className="mt-4 text-slate-400 text-sm uppercase tracking-widest font-bold">
                                {currentChallenge.type === CHALLENGE_TYPES.LISTENING ? "Listen and select" : "Select the meaning"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentChallenge.options.map((opt, i) => (
                                <Button
                                    key={i}
                                    variant={isAnswered ? (opt === currentChallenge.word.english ? "success" : (opt === selectedOption ? "danger" : "ghost")) : "outline"}
                                    className="h-16 text-lg border-white/10 hover:bg-white/5"
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isAnswered}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Flashcard View */}
                {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 text-center">
                            <Badge variant="outline" className="mx-auto mb-4 border-amber-500/30 text-amber-300">
                                Memory Recall
                            </Badge>
                            <h2 className="text-5xl font-black text-white mb-8">{currentChallenge.word.english}</h2>
                        </div>

                        {!isRevealed ? (
                            <Button
                                variant="ghost"
                                className="w-full h-64 border-2 border-dashed border-white/20 rounded-3xl flex flex-col gap-4 text-slate-400 hover:text-white hover:border-white/40 hover:bg-white/5"
                                onClick={() => setIsRevealed(true)}
                            >
                                <Lightbulb size={32} />
                                <span className="text-xl">Tap to Reveal French</span>
                            </Button>
                        ) : (
                            <div className="w-full bg-indigo-900/20 border border-indigo-500/30 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-200">
                                <h3 className="text-4xl font-black text-indigo-300 mb-2">{currentChallenge.word.french}</h3>
                                <p className="text-indigo-200/60 mb-8">{currentChallenge.word.ipa}</p>

                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20" onClick={() => handleFlashcardGrade('again')}>
                                        Forgot
                                    </Button>
                                    <Button className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20" onClick={() => handleFlashcardGrade('good')}>
                                        Got it
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Feedback Footer (Shared for MCQ/Grammar/Listening) */}
                {isAnswered && !isRevealed && currentChallenge.type !== CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className={`fixed bottom-0 left-0 right-0 p-6 ${isCorrect ? 'bg-emerald-950/90 border-t border-emerald-500' : 'bg-red-950/90 border-t border-red-500'} backdrop-blur-lg flex items-center justify-between z-50`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {isCorrect ? <Check className="text-white" /> : <X className="text-white" />}
                            </div>
                            <div className="text-white">
                                <div className="font-black text-xl">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
                                {!isCorrect && (
                                    <div className="text-white/70 text-sm">
                                        Answer: <span className="font-bold">
                                            {currentChallenge.type === CHALLENGE_TYPES.GRAMMAR_CHECK
                                                ? currentChallenge.drill.answer
                                                : currentChallenge.type === CHALLENGE_TYPES.CONTEXT_CLOZE
                                                    ? currentChallenge.clozeData?.answer
                                                    : currentChallenge.word?.english}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button onClick={handleNext} size="lg" className={isCorrect ? "bg-white text-emerald-900 hover:bg-emerald-50" : "bg-white text-red-900 hover:bg-red-50"}>
                            Continue
                        </Button>
                    </motion.div>
                )}

            </div>
        </GameLayout>
    );
};

export default DailyMix;
