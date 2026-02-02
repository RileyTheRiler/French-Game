import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, TrendingUp, Volume2, Check, X, RotateCcw, Zap, Target } from 'lucide-react';
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
import { calculateRetentionProbability, sortByReviewPriority, getAdaptiveLearningRate } from '../utils/srs';
import { generateContextCloze } from '../data/contextClozeData';

const GRADES = [
    { key: 'again', label: 'Again', grade: 1, color: 'bg-red-500/20 text-red-400 border-red-500/30', desc: 'Completely forgot' },
    { key: 'hard', label: 'Hard', grade: 3, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', desc: 'Took effort' },
    { key: 'good', label: 'Good', grade: 4, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', desc: 'Recalled correctly' },
    { key: 'easy', label: 'Easy', grade: 5, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', desc: 'Instant recall' }
];

const RetentionIndicator = ({ probability }) => {
    const percentage = Math.round(probability * 100);
    const color = probability > 0.8 ? 'text-emerald-400' : probability > 0.5 ? 'text-amber-400' : 'text-red-400';
    const bgColor = probability > 0.8 ? 'bg-emerald-500' : probability > 0.5 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${bgColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <span className={`text-xs font-bold ${color}`}>{percentage}%</span>
        </div>
    );
};

const SRSReviewQueue = () => {
    const navigate = useNavigate();
    const { vocabulary, getDueWords, updateWordProgress, playWordAudio } = useVocabulary();
    const { addXP, addCoins } = useProgress();

    const [reviewQueue, setReviewQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState('flashcard'); // 'flashcard' | 'cloze'
    const [isRevealed, setIsRevealed] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [startTime, setStartTime] = useState(null);

    // Session stats
    const [stats, setStats] = useState({ correct: 0, total: 0, xpEarned: 0 });

    // Cloze state
    const [clozeData, setClozeData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [clozeAnswered, setClozeAnswered] = useState(false);

    const initializeCard = useCallback((word) => {
        setIsRevealed(false);
        setStartTime(Date.now());
        setSelectedOption(null);
        setClozeAnswered(false);

        if (word.mode === 'cloze') {
            const cloze = generateContextCloze(word, 2);
            if (cloze) {
                setMode('cloze');
                setClozeData(cloze);
            } else {
                // Fallback to flashcard if no cloze available
                setMode('flashcard');
                setClozeData(null);
            }
        } else {
            setMode('flashcard');
            setClozeData(null);
        }
    }, []);

    // Build review queue on mount
    useEffect(() => {
        const dueWords = getDueWords();
        const prioritized = sortByReviewPriority(dueWords).slice(0, 20);

        // Mix modes: 70% flashcard, 30% cloze
        const queue = prioritized.map(word => ({
            ...word,
            mode: Math.random() < 0.7 ? 'flashcard' : 'cloze',
            retention: calculateRetentionProbability(word.srs)
        }));

        setReviewQueue(queue);
        if (queue.length > 0) {
            initializeCard(queue[0]);
        }
    }, []);

    const currentWord = reviewQueue[currentIndex];

    const finishSession = useCallback(() => {
        triggerConfetti();
        SoundManager.playLevelUp();
        addXP(stats.xpEarned);
        addCoins(Math.floor(stats.correct * 2));
        setSessionComplete(true);
    }, [stats, addXP, addCoins]);

    const handleGrade = useCallback((gradeKey) => {
        if (!currentWord) return;

        const gradeInfo = GRADES.find(g => g.key === gradeKey);
        const responseTimeMs = Date.now() - startTime;
        const adaptiveRate = getAdaptiveLearningRate(currentWord);

        // Update word progress with enhanced SRS
        updateWordProgress(currentWord.id, gradeInfo.grade, {
            adaptiveRate,
            responseTimeMs
        });

        // Update stats
        const isCorrect = gradeInfo.grade >= 3;
        const xpForCard = isCorrect ? (gradeInfo.grade >= 4 ? 15 : 10) : 0;

        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
            xpEarned: prev.xpEarned + xpForCard
        }));

        if (isCorrect) {
            SoundManager.playMatch();
        } else {
            SoundManager.playMiss();
            triggerShake('srs-card-container');
        }

        // Move to next card
        if (currentIndex < reviewQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            initializeCard(reviewQueue[currentIndex + 1]);
        } else {
            finishSession();
        }
    }, [currentWord, currentIndex, reviewQueue, startTime, updateWordProgress, initializeCard, finishSession]);

    const handleClozeAnswer = useCallback((option) => {
        if (clozeAnswered || !clozeData) return;

        setSelectedOption(option);
        setClozeAnswered(true);

        const isCorrect = option === clozeData.answer;

        if (isCorrect) {
            SoundManager.playMatch();
        } else {
            SoundManager.playMiss();
            triggerShake('srs-card-container');
        }
    }, [clozeAnswered, clozeData]);

    const handleClozeGrade = useCallback((gradeKey) => {
        handleGrade(gradeKey);
    }, [handleGrade]);

    if (reviewQueue.length === 0) {
        return (
            <GameLayout title="SRS Review" onBack={() => navigate('/')}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="p-6 bg-emerald-500/20 rounded-full mb-6">
                        <Check size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
                    <p className="text-slate-400 mb-8">No words due for review right now.</p>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </GameLayout>
        );
    }

    if (sessionComplete) {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

        return (
            <GameLayout title="Review Complete" onBack={() => navigate('/')}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <SuccessState
                        title="Review Session Complete!"
                        description={`You reviewed ${stats.total} words with ${accuracy}% accuracy.`}
                        actionLabel="Return Home"
                        onAction={() => navigate('/')}
                    >
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto mt-4">
                            <div className="bg-white/5 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-indigo-400">+{stats.xpEarned}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold">XP</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-amber-400">{accuracy}%</div>
                                <div className="text-xs text-slate-400 uppercase font-bold">Accuracy</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-emerald-400">{stats.correct}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold">Correct</div>
                            </div>
                        </div>
                    </SuccessState>
                </div>
            </GameLayout>
        );
    }

    if (!currentWord) return <LoadingState message="Loading review..." />;

    return (
        <GameLayout
            title="SRS Review"
            subtitle={`${currentIndex + 1} / ${reviewQueue.length}`}
            onBack={() => navigate('/')}
            headerRight={
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                        <Brain size={14} className="mr-1" /> {stats.correct}/{stats.total}
                    </Badge>
                </div>
            }
        >
            <div id="srs-card-container" className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center p-4">
                {/* Retention & Mode Indicator */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-400">Retention:</span>
                        <RetentionIndicator probability={currentWord.retention} />
                    </div>
                    <Badge className={mode === 'cloze' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}>
                        {mode === 'cloze' ? 'Context Cloze' : 'Recall'}
                    </Badge>
                </div>

                {/* Flashcard Mode */}
                {mode === 'flashcard' && (
                    <Card className="p-10 text-center min-h-[300px] flex flex-col justify-center mb-6">
                        {!isRevealed ? (
                            <>
                                <h2 className="text-5xl font-black text-white mb-4">{currentWord.french}</h2>
                                <p className="text-slate-400 mb-8">{currentWord.ipa || ''}</p>
                                <Button
                                    variant="ghost"
                                    className="mx-auto border-2 border-dashed border-white/20 px-8 py-4"
                                    onClick={() => setIsRevealed(true)}
                                >
                                    Tap to Reveal
                                </Button>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <h2 className="text-5xl font-black text-white">{currentWord.french}</h2>
                                <p className="text-3xl text-indigo-300">{currentWord.english}</p>
                                {currentWord.example && (
                                    <p className="text-slate-400 italic text-lg mt-4">"{currentWord.example}"</p>
                                )}
                                <Button
                                    variant="ghost"
                                    className="mt-4"
                                    onClick={() => playWordAudio(currentWord)}
                                >
                                    <Volume2 size={20} className="mr-2" /> Listen
                                </Button>
                            </motion.div>
                        )}
                    </Card>
                )}

                {/* Cloze Mode */}
                {mode === 'cloze' && clozeData && (
                    <Card className="p-10 text-center min-h-[300px] flex flex-col justify-center mb-6">
                        <Badge className="mx-auto mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Fill in the Blank
                        </Badge>
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
                            {clozeData.question.split('_____').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className={`
                                            inline-block px-3 py-1 mx-1 rounded-lg border-b-2 min-w-[80px]
                                            ${clozeAnswered && selectedOption === clozeData.answer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : ''}
                                            ${clozeAnswered && selectedOption !== clozeData.answer ? 'bg-red-500/20 border-red-500 text-red-300' : ''}
                                            ${!clozeAnswered ? 'bg-white/10 border-white/30' : ''}
                                        `}>
                                            {clozeAnswered ? clozeData.answer : '?'}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </h3>

                        {!clozeAnswered && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {clozeData.options.map((option, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className="h-14 text-lg border-white/10 hover:bg-white/5"
                                        onClick={() => handleClozeAnswer(option)}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {clozeAnswered && selectedOption !== clozeData.answer && (
                            <p className="text-red-400 mt-4">
                                Correct answer: <span className="font-bold">{clozeData.answer}</span>
                            </p>
                        )}
                    </Card>
                )}

                {/* Grading Buttons */}
                {(isRevealed || clozeAnswered) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-4 gap-2"
                    >
                        {GRADES.map(grade => (
                            <Button
                                key={grade.key}
                                className={`flex flex-col items-center py-4 border ${grade.color} hover:opacity-80`}
                                onClick={() => mode === 'cloze' ? handleClozeGrade(grade.key) : handleGrade(grade.key)}
                            >
                                <span className="font-bold text-lg">{grade.label}</span>
                                <span className="text-xs opacity-70">{grade.desc}</span>
                            </Button>
                        ))}
                    </motion.div>
                )}
            </div>
        </GameLayout>
    );
};

export default SRSReviewQueue;
