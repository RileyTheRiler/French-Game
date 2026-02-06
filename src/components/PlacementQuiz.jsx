import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Target, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { vocabularyList } from '../data/vocabulary';
import { useProgress } from '../context/ProgressContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useToast } from '../context/ToastContext';

const DIFFICULTY_BUCKETS = {
    easy: ['basics', 'colors', 'numbers', 'food'],
    medium: ['family', 'places', 'animals', 'objects', 'time'],
    hard: ['verbs', 'travel', 'weather', 'body']
};

const DIFFICULTY_WEIGHTS = {
    easy: 80,
    medium: 120,
    hard: 160
};

const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const sampleWord = (categories) => {
    const pool = vocabularyList.filter(word => categories.includes(word.category));
    return pool[Math.floor(Math.random() * pool.length)];
};

const buildQuestion = (difficulty, index) => {
    const word = sampleWord(DIFFICULTY_BUCKETS[difficulty]);
    const distractors = shuffle(
        vocabularyList
            .filter(w => w.id !== word.id)
            .map(w => w.english)
    ).slice(0, 3);

    const options = shuffle([word.english, ...distractors]);
    return { id: `${word.id}-${difficulty}-${index}`, word, options, difficulty };
};

const generateQuiz = () => {
    const perDifficulty = 3;
    const questions = [];
    ['easy', 'medium', 'hard'].forEach(level => {
        for (let i = 0; i < perDifficulty; i++) {
            questions.push(buildQuestion(level, i));
        }
    });
    return shuffle(questions);
};

const PlacementQuiz = () => {
    const navigate = useNavigate();
    const { stats, applyPlacementResult } = useProgress();
    const { showSuccess } = useToast();
    const [questions] = useState(() => generateQuiz());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [placementSaved, setPlacementSaved] = useState(false);

    useEffect(() => {
        if (!stats.onboardingComplete) {
            navigate('/onboarding', { replace: true });
        }
    }, [stats.onboardingComplete, navigate]);

    useEffect(() => {
        if (stats.placementComplete && !showResults) {
            navigate('/', { replace: true });
        }
    }, [stats.placementComplete, showResults, navigate]);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;

    const accuracy = useMemo(() => {
        if (!showResults) return 0;
        const correct = Object.entries(answers).filter(([id, ans]) => {
            const question = questions.find(q => q.id === id);
            return question?.word.english === ans;
        }).length;
        return Math.round((correct / totalQuestions) * 100);
    }, [answers, questions, showResults, totalQuestions]);

    const xpAward = useMemo(() => {
        return Object.entries(answers).reduce((sum, [id, ans]) => {
            const question = questions.find(q => q.id === id);
            if (!question) return sum;
            const correct = question.word.english === ans;
            const base = DIFFICULTY_WEIGHTS[question.difficulty] || 0;
            return sum + (correct ? base : Math.floor(base * 0.25));
        }, 0);
    }, [answers, questions]);

    useEffect(() => {
        if (showResults && !placementSaved) {
            setTimeout(() => {
                applyPlacementResult({
                    xpAward,
                    accuracy,
                    totalQuestions
                });
                showSuccess(`Placement saved! Starting XP: ${xpAward}`);
                setPlacementSaved(true);
            }, 0);
        }
    }, [applyPlacementResult, showResults, placementSaved, xpAward, accuracy, totalQuestions, showSuccess]);

    const handleSelect = (option) => {
        if (answers[currentQuestion.id]) return;

        const nextAnswers = { ...answers, [currentQuestion.id]: option };
        setAnswers(nextAnswers);

        const isLast = answeredCount + 1 === totalQuestions;
        setTimeout(() => {
            if (isLast) {
                setShowResults(true);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        }, 450);
    };

    return (
        <div id="main-content" tabIndex={-1} className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-indigo-300 uppercase text-xs tracking-[0.3em] font-bold">Placement quiz</p>
                        <h1 className="text-3xl md:text-4xl font-black text-white mt-1">Find your starting level</h1>
                        <p className="text-slate-300 mt-2">We’ll sample words across categories to place you in the right tier.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-sm">Progress</p>
                        <p className="text-white font-bold text-2xl">{answeredCount}/{totalQuestions}</p>
                        <div className="mt-2 h-2 w-40 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Card className="p-8 border-indigo-500/30 bg-slate-900/80 backdrop-blur">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="text-indigo-300" size={24} />
                                    <p className="text-sm text-indigo-200 font-semibold">
                                        {currentQuestion.difficulty.toUpperCase()} · {DIFFICULTY_BUCKETS[currentQuestion.difficulty].join(', ')}
                                    </p>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{currentQuestion.word.french}</h2>
                                <p className="text-slate-300 mb-6">Choose the best English translation.</p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {currentQuestion.options.map(option => {
                                        const selected = answers[currentQuestion.id] === option;
                                        const isCorrect = option === currentQuestion.word.english;
                                        const showState = answers[currentQuestion.id];
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleSelect(option)}
                                                className={`rounded-2xl p-4 text-left border transition-all hover:-translate-y-1 ${showState
                                                    ? selected
                                                        ? isCorrect
                                                            ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-100'
                                                            : 'bg-red-500/10 border-red-500/60 text-red-100'
                                                        : isCorrect
                                                            ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-100'
                                                            : 'bg-slate-800 border-white/5 text-slate-200'
                                                    : 'bg-slate-800/70 border-white/10 text-white hover:border-indigo-400/60 hover:bg-indigo-500/10'}`}
                                                disabled={!!answers[currentQuestion.id]}
                                            >
                                                <p className="font-semibold">{option}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Card className="p-8 border-emerald-500/40 bg-slate-900/90 backdrop-blur">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="text-emerald-300" size={26} />
                                    <div>
                                        <p className="text-emerald-200 font-semibold text-sm">Placement complete</p>
                                        <h2 className="text-3xl font-black text-white">Welcome to your tailored path</h2>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <Card className="p-4 bg-white/5 border-white/10">
                                        <div className="flex items-center gap-2 text-white font-bold text-xl">
                                            <Target className="text-indigo-300" size={22} /> {accuracy}%
                                        </div>
                                        <p className="text-slate-300 text-sm mt-1">Answer accuracy</p>
                                    </Card>
                                    <Card className="p-4 bg-white/5 border-white/10">
                                        <div className="flex items-center gap-2 text-white font-bold text-xl">
                                            <Brain className="text-fuchsia-300" size={22} /> {xpAward} XP
                                        </div>
                                        <p className="text-slate-300 text-sm mt-1">Starting XP applied</p>
                                    </Card>
                                    <Card className="p-4 bg-white/5 border-white/10">
                                        <div className="flex items-center gap-2 text-white font-bold text-xl">
                                            <Shield className="text-emerald-300" size={22} /> {totalQuestions} items
                                        </div>
                                        <p className="text-slate-300 text-sm mt-1">Difficulty mix</p>
                                    </Card>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <p className="text-slate-300">We’ve set your starting XP based on performance. You can retake later to adjust your placement.</p>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => navigate('/onboarding')} className="border-white/10 text-slate-200">
                                            Review onboarding
                                        </Button>
                                        <Button onClick={() => navigate('/')}>
                                            Jump into the main menu <ArrowRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlacementQuiz;
