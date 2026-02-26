import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, HelpCircle, Book, Zap, Award, Target, MessageSquare } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { GRAMMAR_TIPS, getTipForConcept } from '../data/grammar';
import SoundManager from '../utils/SoundManager';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import GrammarInsightCard from './ui/GrammarInsightCard';
import { calculateRewards } from '../utils/rewardSystem';

const GrammarDrill = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { addXP, addCoins, difficultySettings } = useProgress();
    const { vocabulary } = useVocabulary();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [streak, setStreak] = useState(0);
    const [showTip, setShowTip] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [xpEarned, setXpEarned] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

    // Derived difficulty settings
    const difficulty = difficultySettings?.grammar || 2;
    const showHints = difficulty < 3; // Hide hints on Hard+

    // Initialize Questions
    useEffect(() => {
        // In a real app, generate these from a sophisticated grammar engine
        // For now, hardcoded "smart" drills based on difficulty
        const drills = [
            {
                id: 1,
                type: 'conjugation',
                concept: 'etre_present',
                question: 'Je ___ étudiant.',
                options: ['suis', 'es', 'est', 'sommes'],
                correct: 'suis',
                explanation: '"Je" (I) always takes "suis" in the present tense of être.',
                tip: getTipForConcept('etre_present')
            },
            {
                id: 2,
                type: 'agreement',
                concept: 'gender_adj',
                question: 'La maison est ___.',
                options: ['grand', 'grande', 'grands', 'grandes'],
                correct: 'grande',
                explanation: '"Maison" is feminine singular, so the adjective must agree (add -e).',
                tip: getTipForConcept('gender_adj')
            },
            {
                id: 3,
                type: 'tense',
                concept: 'passe_compose',
                question: 'Hier, nous ___ au cinéma.',
                options: ['allons', 'sommes allés', 'avons allé', 'allez'],
                correct: 'sommes allés',
                explanation: 'Movement verbs like "aller" use "être" as the auxiliary in Passé Composé.',
                tip: getTipForConcept('passe_compose')
            },
            {
                id: 4,
                type: 'pronoun',
                concept: 'y_en',
                question: 'Tu vas à Paris ? Oui, j\'___ vais.',
                options: ['en', 'y', 'le', 'lui'],
                correct: 'y',
                explanation: '"Y" replaces a place introduced by à/en/dans.',
                tip: getTipForConcept('y_en')
            },
            {
                id: 5,
                type: 'conjugation',
                concept: 'aller_present',
                question: 'Ils ___ au parc.',
                options: ['vont', 'vent', 'allent', 'va'],
                correct: 'vont',
                explanation: 'Irregular verb "aller": Ils vont.',
                tip: getTipForConcept('aller_present')
            }
        ];

        setQuestions(drills.sort(() => Math.random() - 0.5));
    }, [difficulty]);

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswer = (option) => {
        if (selectedOption) return; // Prevent double submission
        setSelectedOption(option);

        const correct = option === currentQuestion.correct;
        setIsCorrect(correct);

        if (correct) {
            SoundManager.playMatch();
            setStreak(s => s + 1);
            setCorrectCount(c => c + 1);
            const xp = 10 + (streak * 2); // Combo bonus
            addXP(xp);
            setXpEarned(prev => prev + xp);
        } else {
            SoundManager.playMiss();
            setStreak(0);
            setShowTip(true); // Auto-show explanation on error
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsCorrect(null);
            setShowTip(false);
        } else {
            // End Session
            const reward = calculateRewards('grammar', {
                score: correctCount * 100, // simplified score
                maxCombo: streak, // using streak as maxCombo proxy
                difficulty: difficulty,
                perfect: correctCount === questions.length
            });
            setSessionReward(reward);
            addXP(reward.xp);
            addCoins(reward.coins);

            setSessionComplete(true);
            SoundManager.playLevelUp();
        }
    };

    if (!currentQuestion && !sessionComplete) return <div className="p-8 text-center text-slate-400">Loading grammar modules...</div>;

    if (sessionComplete) {
        return (
            <GameLayout title="Drill Complete" onBack={onExit}>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30"
                    >
                        <Book size={48} className="text-white" />
                    </motion.div>

                    <div>
                        <h2 className="text-4xl font-black text-white mb-2">Grammar Mastered!</h2>
                        <p className="text-slate-400">You're building a solid foundation.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-500 uppercase font-bold">Accuracy</p>
                            <p className="text-2xl font-black text-emerald-400">
                                {Math.round((correctCount / questions.length) * 100)}%
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-500 uppercase font-bold">XP Earned</p>
                            <p className="text-2xl font-black text-amber-400">+{xpEarned}</p>
                        </div>
                    </div>

                    {sessionReward && (
                        <div className="flex items-center gap-2 text-sm text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                            <Award size={16} />
                            <span>Bonus: +{sessionReward.coins} Coins</span>
                        </div>
                    )}

                    <Button size="lg" onClick={onExit} className="w-full max-w-sm">
                        Return to Hub
                    </Button>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title="Grammar Drill"
            subtitle="Master the rules, master the language."
            onBack={onExit}
            headerRight={
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <Zap size={14} fill="currentColor" />
                        <span>{streak}</span>
                    </div>
                    <Badge variant="outline" className="text-slate-400">
                        {currentQuestionIndex + 1} / {questions.length}
                    </Badge>
                </div>
            }
        >
            <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)]">

                {/* Question Card */}
                <div className="flex-1 flex flex-col justify-center py-8">
                    <Card className="p-8 bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50" />

                        <div className="flex justify-between items-start mb-6">
                            <Badge variant="secondary" className="mb-4">
                                {currentQuestion.type}
                            </Badge>
                            {showHints && (
                                <button
                                    onClick={() => setShowTip(!showTip)}
                                    className="text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    <HelpCircle size={20} />
                                </button>
                            )}
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8 leading-relaxed">
                            {currentQuestion.question.split('___').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className={`inline-block min-w-[80px] border-b-4 mx-2 text-center transition-colors ${
                                            selectedOption
                                                ? (isCorrect ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400')
                                                : 'border-slate-600 text-transparent'
                                        }`}>
                                            {selectedOption || '___'}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentQuestion.options.map((option) => (
                                <motion.button
                                    key={option}
                                    whileHover={!selectedOption ? { scale: 1.02 } : {}}
                                    whileTap={!selectedOption ? { scale: 0.98 } : {}}
                                    onClick={() => handleAnswer(option)}
                                    disabled={selectedOption !== null}
                                    className={`
                                        p-4 rounded-xl text-lg font-bold transition-all border-2
                                        ${selectedOption === option
                                            ? (isCorrect
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-red-500 border-red-500 text-white')
                                            : (selectedOption && option === currentQuestion.correct
                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' // Show correct answer if wrong
                                                : 'bg-slate-800 border-white/5 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-750')
                                        }
                                        ${selectedOption && selectedOption !== option && option !== currentQuestion.correct ? 'opacity-50' : 'opacity-100'}
                                    `}
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Feedback / Next Area */}
                <AnimatePresence mode="wait">
                    {selectedOption && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-slate-900 border-t border-white/10 p-6 -mx-4 md:rounded-t-3xl md:mx-0 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
                        >
                            <div className="max-w-2xl mx-auto">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {isCorrect ? <Check size={24} /> : <X size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isCorrect ? 'Excellent!' : 'Not quite right'}
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {currentQuestion.explanation}
                                        </p>

                                        {/* Insight Card integration for detailed breakdowns */}
                                        {!isCorrect && currentQuestion.concept && (
                                            <div className="mt-4">
                                                <GrammarInsightCard conceptId={currentQuestion.concept} compact />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleNext}
                                    className={`w-full py-4 text-lg shadow-xl ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Drill'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tip Modal */}
                <AnimatePresence>
                    {showTip && !selectedOption && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-24 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md bg-indigo-900/90 backdrop-blur-md p-4 rounded-xl border border-indigo-500/30 text-indigo-100 shadow-xl z-20"
                        >
                            <div className="flex gap-3">
                                <Lightbulb size={20} className="text-yellow-400 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-sm mb-1">Quick Tip</p>
                                    <p className="text-xs opacity-90">{currentQuestion.tip?.content || "Review the grammar rule for this concept."}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default GrammarDrill;
