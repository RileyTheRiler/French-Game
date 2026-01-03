import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Headphones, Eye, BookOpen, Compass, Timer, Coffee,
    Brain, MessageSquare, Calendar, Shuffle, Sparkles,
    ArrowRight, Check
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const QUESTIONS = [
    {
        id: 'modality',
        question: 'How do you learn best?',
        subtitle: 'Choose the style that feels most natural to you',
        options: [
            {
                id: 'audio',
                value: true,
                label: 'Listening & Speaking',
                icon: Headphones,
                description: 'I remember things I hear and say out loud',
                color: 'from-violet-500 to-purple-600'
            },
            {
                id: 'visual',
                value: false,
                label: 'Reading & Writing',
                icon: Eye,
                description: 'I need to see it written to learn it',
                color: 'from-cyan-500 to-blue-600'
            }
        ],
        field: 'preferAudio'
    },
    {
        id: 'structure',
        question: 'What learning style suits you?',
        subtitle: 'Everyone has their own rhythm',
        options: [
            {
                id: 'structured',
                value: true,
                label: 'Structured Lessons',
                icon: BookOpen,
                description: 'Step-by-step curriculum with clear progression',
                color: 'from-emerald-500 to-teal-600'
            },
            {
                id: 'exploration',
                value: false,
                label: 'Free Exploration',
                icon: Compass,
                description: 'Jump around topics based on interest',
                color: 'from-amber-500 to-orange-600'
            }
        ],
        field: 'preferStructured'
    },
    {
        id: 'pressure',
        question: 'How do you feel about timed challenges?',
        subtitle: 'Be honest — there\'s no wrong answer',
        options: [
            {
                id: 'pressure',
                value: true,
                label: 'Bring the Challenge',
                icon: Timer,
                description: 'Time limits keep me focused and motivated',
                color: 'from-rose-500 to-red-600'
            },
            {
                id: 'relaxed',
                value: false,
                label: 'Keep It Relaxed',
                icon: Coffee,
                description: 'I prefer to take my time without pressure',
                color: 'from-sky-500 to-indigo-600'
            }
        ],
        field: 'preferPressure'
    },
    {
        id: 'focus',
        question: 'What excites you more?',
        subtitle: 'We\'ll tailor your lessons accordingly',
        options: [
            {
                id: 'grammar',
                value: true,
                label: 'Understanding Grammar',
                icon: Brain,
                description: 'I want to know the rules and patterns',
                color: 'from-fuchsia-500 to-pink-600'
            },
            {
                id: 'vocabulary',
                value: false,
                label: 'Building Vocabulary',
                icon: MessageSquare,
                description: 'Give me words I can use right away',
                color: 'from-lime-500 to-green-600'
            }
        ],
        field: 'preferGrammar'
    },
    {
        id: 'schedule',
        question: 'How would you like to study?',
        subtitle: 'This helps us set the right goals for you',
        options: [
            {
                id: 'daily',
                value: true,
                label: 'Daily Practice',
                icon: Calendar,
                description: 'I can commit to studying every day',
                color: 'from-violet-500 to-indigo-600'
            },
            {
                id: 'flexible',
                value: false,
                label: 'Flexible Schedule',
                icon: Shuffle,
                description: 'A few times a week works better for me',
                color: 'from-teal-500 to-cyan-600'
            }
        ],
        field: 'preferDaily'
    }
];

const LearningProfileQuiz = () => {
    const navigate = useNavigate();
    const { setLearningProfile, updateWeeklyGoal } = useProgress();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const question = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

    const handleSelect = useCallback((option) => {
        setSelectedOption(option.id);

        // Store answer
        const newAnswers = {
            ...answers,
            [question.field]: option.value
        };
        setAnswers(newAnswers);

        // Delay before moving to next
        setTimeout(() => {
            if (currentQuestion < QUESTIONS.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setSelectedOption(null);
            } else {
                // Quiz complete - show results
                setShowResults(true);
            }
        }, 500);
    }, [answers, currentQuestion, question]);

    const handleComplete = useCallback(() => {
        // Save profile
        setLearningProfile(answers);

        // Set weekly goal based on preference
        if (!answers.preferDaily) {
            updateWeeklyGoal(3); // 3 sessions/week for flexible
        } else {
            updateWeeklyGoal(7); // Daily
        }

        // Navigate to main menu
        navigate('/');
    }, [answers, setLearningProfile, updateWeeklyGoal, navigate]);

    const getLearningStyleSummary = () => {
        const traits = [];

        if (answers.preferAudio) {
            traits.push({ label: 'Auditory Learner', icon: Headphones, color: 'text-violet-400' });
        } else {
            traits.push({ label: 'Visual Learner', icon: Eye, color: 'text-cyan-400' });
        }

        if (answers.preferStructured) {
            traits.push({ label: 'Structured Approach', icon: BookOpen, color: 'text-emerald-400' });
        } else {
            traits.push({ label: 'Explorer Spirit', icon: Compass, color: 'text-amber-400' });
        }

        if (answers.preferPressure) {
            traits.push({ label: 'Challenge Seeker', icon: Timer, color: 'text-rose-400' });
        } else {
            traits.push({ label: 'Relaxed Pace', icon: Coffee, color: 'text-sky-400' });
        }

        return traits;
    };

    if (showResults) {
        const traits = getLearningStyleSummary();

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-lg w-full"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.3 }}
                            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold mb-2">Your Learning Profile</h1>
                        <p className="text-slate-400">We've personalized your experience</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {traits.map((trait, index) => (
                            <motion.div
                                key={trait.label}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="glass-panel p-4 flex items-center gap-4"
                            >
                                <div className={`p-3 rounded-xl bg-white/5 ${trait.color}`}>
                                    <trait.icon className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-lg">{trait.label}</span>
                                <Check className="ml-auto text-emerald-400" />
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="glass-panel p-4 mb-8 border border-indigo-500/20 bg-indigo-500/5"
                    >
                        <p className="text-sm text-slate-300 text-center">
                            {answers.preferDaily ? (
                                <>🔥 Your daily sessions are ready! We'll help you build a consistent habit.</>
                            ) : (
                                <>🎯 We've set a flexible weekly goal of 3 sessions. Study at your own pace!</>
                            )}
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        onClick={handleComplete}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                        Start Learning
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
            {/* Progress Bar */}
            <div className="p-4">
                <div className="max-w-lg mx-auto">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        Question {currentQuestion + 1} of {QUESTIONS.length}
                    </p>
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-lg w-full"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                {question.question}
                            </h2>
                            <p className="text-slate-400">{question.subtitle}</p>
                        </div>

                        <div className="grid gap-4">
                            {question.options.map((option) => (
                                <motion.button
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    disabled={selectedOption !== null}
                                    whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedOption === option.id
                                            ? 'border-white/50 bg-white/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {/* Background Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 transition-opacity ${selectedOption === option.id ? 'opacity-20' : 'group-hover:opacity-10'
                                        }`} />

                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} text-white`}>
                                            <option.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{option.label}</h3>
                                            <p className="text-sm text-slate-400">{option.description}</p>
                                        </div>
                                        {selectedOption === option.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="p-2 rounded-full bg-emerald-500"
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Skip Option */}
            <div className="p-4 text-center">
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default LearningProfileQuiz;
