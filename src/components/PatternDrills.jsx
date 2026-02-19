import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Check, X, Lightbulb, Trophy,
    RotateCcw, Table, Shuffle, ChevronRight
} from 'lucide-react';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useProgress } from '../context/ProgressContext';
import { getDifficultyConfig } from './ui/DifficultyDial';
import {
    DRILL_TYPES,
    generateConjugationExercise,
    generateAgreementExercise,
    generatePatternCompletionExercise,
    generateDrillSession,
} from '../data/patternDrillsData';

const PatternDrills = () => {
    const navigate = useNavigate();
    const { addXP, incrementStat, globalDifficulty } = useProgress();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    // Session state
    const [sessionStarted, setSessionStarted] = useState(false);
    const [drillType, setDrillType] = useState('all');
    const [exercises, setExercises] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Exercise state
    const [userAnswers, setUserAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Progress tracking
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);

    const currentExercise = exercises[currentIndex];

    // Start a new session
    const startSession = useCallback(() => {
        let newExercises = [];

        if (drillType === 'all') {
            newExercises = generateDrillSession(10, globalDifficulty);
        } else if (drillType === DRILL_TYPES.CONJUGATION_TABLE) {
            newExercises = Array(10).fill(null).map(() => generateConjugationExercise(null, null, null, globalDifficulty)).filter(Boolean);
        } else if (drillType === DRILL_TYPES.AGREEMENT_MATCHING) {
            newExercises = Array(10).fill(null).map(() => generateAgreementExercise(globalDifficulty)).filter(Boolean);
        } else if (drillType === DRILL_TYPES.PATTERN_COMPLETION) {
            newExercises = Array(10).fill(null).map(() => generatePatternCompletionExercise(globalDifficulty)).filter(Boolean);
        }

        setExercises(newExercises);
        setCurrentIndex(0);
        setUserAnswers({});
        setShowResult(false);
        setShowHint(false);
        setCorrectCount(0);
        setSessionStarted(true);
        setSessionComplete(false);
    }, [drillType, globalDifficulty]);

    // Handle conjugation table answer
    const handleConjugationInput = (pronoun, value) => {
        setUserAnswers(prev => ({
            ...prev,
            [pronoun]: value.toLowerCase().trim(),
        }));
    };

    // Check conjugation table answers
    const checkConjugationAnswers = () => {
        const exercise = currentExercise;
        let allCorrect = true;

        exercise.cells.forEach(cell => {
            if (cell.isBlank) {
                const userAnswer = userAnswers[cell.pronoun] || '';
                if (userAnswer !== cell.correctAnswer) {
                    allCorrect = false;
                }
            }
        });

        setIsCorrect(allCorrect);
        setShowResult(true);

        if (allCorrect) {
            setCorrectCount(prev => prev + 1);
            addXP(5);
        }
    };

    // Handle agreement exercise answer
    const handleAgreementAnswer = (option) => {
        const correct = option === currentExercise.correctAnswer;
        setUserAnswers({ selected: option });
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setCorrectCount(prev => prev + 1);
            addXP(3);
        }
    };

    // Handle pattern completion answer
    const handlePatternAnswer = (option) => {
        const correct = option === currentExercise.correctAnswer;
        setUserAnswers({ selected: option });
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setCorrectCount(prev => prev + 1);
            addXP(3);
        }
    };

    // Move to next exercise
    const nextExercise = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswers({});
            setShowResult(false);
            setShowHint(false);
        } else {
            // Session complete
            setSessionComplete(true);
            addXP(10); // Bonus
            incrementStat('patternDrillsCompleted');
        }
    };

    // Render conjugation table exercise
    const renderConjugationExercise = () => {
        const exercise = currentExercise;

        return (
            <div className="space-y-6">
                {/* Verb info */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {exercise.verb}
                    </h2>
                    <p className="text-slate-400">{exercise.translation}</p>
                    <Badge variant="purple" className="mt-2">{exercise.tenseName}</Badge>
                </div>

                {/* Conjugation table */}
                <Card className="p-4 bg-slate-800/50 border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                        {exercise.cells.map(cell => (
                            <div
                                key={cell.pronoun}
                                className={`p-3 rounded-lg ${showResult
                                    ? cell.isBlank
                                        ? userAnswers[cell.pronoun] === cell.correctAnswer
                                            ? 'bg-green-500/20 border border-green-500/50'
                                            : 'bg-red-500/20 border border-red-500/50'
                                        : 'bg-slate-700/50'
                                    : cell.isBlank
                                        ? 'bg-purple-500/10 border border-purple-500/30'
                                        : 'bg-slate-700/50'
                                    }`}
                            >
                                <div className="text-sm text-slate-400 mb-1">{cell.pronoun}</div>
                                {cell.isBlank ? (
                                    <input
                                        type="text"
                                        value={userAnswers[cell.pronoun] || ''}
                                        onChange={(e) => handleConjugationInput(cell.pronoun, e.target.value)}
                                        disabled={showResult}
                                        placeholder="..."
                                        className="w-full bg-transparent text-white text-lg font-medium outline-none placeholder-slate-600"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                    />
                                ) : (
                                    <div className="text-lg font-medium text-white">
                                        {cell.conjugation}
                                    </div>
                                )}
                                {showResult && cell.isBlank && userAnswers[cell.pronoun] !== cell.correctAnswer && (
                                    <div className="text-sm text-green-400 mt-1">
                                        → {cell.correctAnswer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Action buttons */}
                {!showResult ? (
                    <Button
                        onClick={checkConjugationAnswers}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                        disabled={Object.keys(userAnswers).length < currentExercise.totalBlanks}
                    >
                        <Check className="w-5 h-5 mr-2" />
                        Check Answers
                    </Button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Button
                            onClick={nextExercise}
                            className={`w-full py-4 ${isCorrect
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                : 'bg-gradient-to-r from-slate-600 to-slate-700'
                                }`}
                        >
                            Continue
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}
            </div>
        );
    };

    // Render agreement matching exercise
    const renderAgreementExercise = () => {
        const exercise = currentExercise;

        return (
            <div className="space-y-6">
                {/* Question */}
                <div className="text-center">
                    <p className="text-slate-400 mb-2">Choose the correct form of the adjective:</p>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {exercise.noun.fullNoun} + <span className="text-purple-400">{exercise.adjective.meaning}</span>
                    </h2>
                    <Badge variant={exercise.noun.gender === 'f' ? 'pink' : 'blue'}>
                        {exercise.noun.gender === 'f' ? '♀ Feminine' : '♂ Masculine'}
                    </Badge>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                    {exercise.options.slice(0, difficultyConfig.numOptions).map((option, index) => {
                        const isSelected = userAnswers.selected === option;
                        const isCorrectOption = option === exercise.correctAnswer;

                        return (
                            <motion.button
                                key={option}
                                onClick={() => !showResult && handleAgreementAnswer(option)}
                                disabled={showResult}
                                whileHover={{ scale: showResult ? 1 : 1.02 }}
                                whileTap={{ scale: showResult ? 1 : 0.98 }}
                                className={`p-4 rounded-xl border-2 text-left transition-all text-lg font-medium ${showResult
                                    ? isCorrectOption
                                        ? 'border-green-500 bg-green-500/20 text-green-400'
                                        : isSelected
                                            ? 'border-red-500 bg-red-500/20 text-red-400'
                                            : 'border-slate-700 bg-slate-800/50 text-slate-500'
                                    : 'border-slate-700 bg-slate-800/50 text-white hover:border-purple-500 hover:bg-purple-500/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{exercise.noun.fullNoun} <span className="text-purple-400">{option}</span></span>
                                    {showResult && isCorrectOption && <Check className="w-5 h-5 text-green-400" />}
                                    {showResult && isSelected && !isCorrectOption && <X className="w-5 h-5 text-red-400" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-4 bg-slate-800/50 border-slate-700">
                            <p className="text-slate-300">{exercise.explanation}</p>
                        </Card>
                        <Button
                            onClick={nextExercise}
                            className={`w-full mt-4 py-4 ${isCorrect
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                : 'bg-gradient-to-r from-slate-600 to-slate-700'
                                }`}
                        >
                            Continue
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}
            </div>
        );
    };

    // Render pattern completion exercise
    const renderPatternExercise = () => {
        const exercise = currentExercise;

        return (
            <div className="space-y-6">
                {/* Verb info */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {exercise.verb} <span className="text-slate-400 text-lg">({exercise.translation})</span>
                    </h2>
                    <p className="text-slate-400">Complete the missing conjugation</p>
                    {showHint && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-purple-400 text-sm mt-2"
                        >
                            💡 {exercise.hint}
                        </motion.p>
                    )}
                </div>

                {/* Pattern display */}
                <Card className="p-4 bg-slate-800/50 border-slate-700">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {exercise.pattern.map(item => (
                            <div
                                key={item.pronoun}
                                className={`p-2 rounded-lg ${item.isHidden
                                    ? showResult
                                        ? isCorrect
                                            ? 'bg-green-500/20 border border-green-500/50'
                                            : 'bg-red-500/20 border border-red-500/50'
                                        : 'bg-purple-500/20 border border-purple-500/50'
                                    : 'bg-slate-700/50'
                                    }`}
                            >
                                <div className="text-xs text-slate-400">{item.pronoun}</div>
                                <div className="text-lg font-medium text-white">
                                    {item.isHidden ? (
                                        showResult ? (
                                            <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                                {exercise.correctAnswer}
                                            </span>
                                        ) : (
                                            '?'
                                        )
                                    ) : (
                                        item.conjugation
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Options */}
                {!showResult && (
                    <div className="grid gap-3">
                        {exercise.options.slice(0, difficultyConfig.numOptions).map(option => (
                            <Button
                                key={option}
                                onClick={() => handlePatternAnswer(option)}
                                variant="secondary"
                                className="py-4 text-lg"
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Hint button */}
                {!showResult && !showHint && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="flex items-center justify-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mx-auto"
                    >
                        <Lightbulb className="w-4 h-4" />
                        Show hint
                    </button>
                )}

                {/* Continue */}
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Button
                            onClick={nextExercise}
                            className={`w-full py-4 ${isCorrect
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                : 'bg-gradient-to-r from-slate-600 to-slate-700'
                                }`}
                        >
                            Continue
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}
            </div>
        );
    };

    // Session selection screen
    if (!sessionStarted) {
        return (
            <GameLayout
                title="Pattern Drills"
                subtitle="Master Grammar"
                icon={<Table className="w-6 h-6" />}
                onExit={() => navigate('/')}
            >
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Table className="w-5 h-5 text-indigo-400" />
                            Grammar Pattern Exercises
                        </h2>
                        <p className="text-slate-300 mb-6">
                            Learn through repetition and pattern recognition. Master verb conjugations and agreement rules!
                        </p>

                        {/* Drill type selection */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                Choose Exercise Type
                            </h3>
                            <div className="grid gap-3">
                                {[
                                    { key: 'all', name: 'Mixed Practice', icon: '🎲', desc: 'All exercise types combined' },
                                    { key: DRILL_TYPES.CONJUGATION_TABLE, name: 'Conjugation Tables', icon: '📊', desc: 'Fill in verb conjugation blanks' },
                                    { key: DRILL_TYPES.AGREEMENT_MATCHING, name: 'Agreement Matching', icon: '🔗', desc: 'Match adjectives to nouns' },
                                    { key: DRILL_TYPES.PATTERN_COMPLETION, name: 'Pattern Completion', icon: '🧩', desc: 'Complete verb patterns' },
                                ].map(type => (
                                    <button
                                        key={type.key}
                                        onClick={() => setDrillType(type.key)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${drillType === type.key
                                            ? 'border-indigo-500 bg-indigo-500/20'
                                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{type.icon}</span>
                                            <div>
                                                <div className="font-medium text-white">{type.name}</div>
                                                <div className="text-sm text-slate-400">{type.desc}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <Button
                            onClick={startSession}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                        >
                            <Shuffle className="w-5 h-5 mr-2" />
                            Start Practice Session
                        </Button>
                    </Card>
                </div>
            </GameLayout>
        );
    }

    // Session complete screen
    if (sessionComplete) {
        const accuracy = Math.round((correctCount / exercises.length) * 100);

        return (
            <GameLayout
                title="Session Complete"
                subtitle="Great work!"
                icon={<Trophy className="w-6 h-6" />}
                onExit={() => navigate('/')}
            >
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <Card className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
                            <div className="text-6xl mb-4">📊</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Pattern Mastery!
                            </h2>
                            <p className="text-slate-300 mb-6">
                                {correctCount} / {exercises.length} correct ({accuracy}%)
                            </p>

                            {/* Accuracy indicator */}
                            <div className="w-32 h-32 mx-auto mb-6 relative">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="#334155"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke={accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="8"
                                        strokeDasharray={`${accuracy * 3.52} 352`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">{accuracy}%</span>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                <div className="text-3xl font-bold text-yellow-400">
                                    +{correctCount * 3 + 10} XP
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
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
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

    // Active exercise screen
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>

                <div className="flex items-center gap-2">
                    <Badge variant="purple">
                        {currentIndex + 1} / {exercises.length}
                    </Badge>
                    <Badge variant="green">
                        {correctCount} correct
                    </Badge>
                </div>

                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Progress bar */}
            <div className="px-4 mb-6">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Exercise content */}
            <div className="px-4 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {currentExercise?.type === DRILL_TYPES.CONJUGATION_TABLE && renderConjugationExercise()}
                        {currentExercise?.type === DRILL_TYPES.AGREEMENT_MATCHING && renderAgreementExercise()}
                        {currentExercise?.type === DRILL_TYPES.PATTERN_COMPLETION && renderPatternExercise()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Result overlay */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-20 left-0 right-0 flex justify-center pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            className={`px-6 py-3 rounded-full font-bold text-lg ${isCorrect
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                                }`}
                        >
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatternDrills;
