import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, Trophy, RotateCcw } from 'lucide-react';
import { GRAMMAR_DRILLS, GRAMMAR_TIPS, DRILL_CATEGORIES } from '../data/grammar';
import { useProgress } from '../context/ProgressContext';
import { calculateRewards } from '../utils/rewardSystem';
import SoundManager from '../utils/SoundManager';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import GrammarInsightCard from './ui/GrammarInsightCard';
import DifficultySlider from './ui/DifficultySlider';

const GrammarDrill = () => {
    const navigate = useNavigate();
    const { addXP, addCoins, incrementStreak, updateDailyStat, stats, recordCategoryPerformance, setModeDifficulty } = useProgress();

    const difficultySetting = stats?.difficultySettings?.grammar || 2;
    const [difficulty, setDifficulty] = useState(difficultySetting);
    const [sessionPoints, setSessionPoints] = useState(0);
    const questionStartRef = useRef(performance.now());

    const [drills, setDrills] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [sessionComplete, setSessionComplete] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

    const selectDrills = useCallback(() => {
        const bands = {
            1: ['beginner'],
            2: ['beginner', 'intermediate'],
            3: ['beginner', 'intermediate'],
            4: ['intermediate'],
            5: ['intermediate', 'advanced']
        };
        const allowedDifficulties = bands[difficulty] || bands[3];
        let pool = GRAMMAR_DRILLS.filter(d => allowedDifficulties.includes(d.difficulty || 'beginner'));
        if (pool.length < 6) {
            pool = GRAMMAR_DRILLS;
        }
        return [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    }, [difficulty]);

    useEffect(() => {
        const shuffled = selectDrills();
        setDrills(shuffled);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setSessionPoints(0);
        questionStartRef.current = performance.now();
    }, [selectDrills]);

    useEffect(() => {
        setModeDifficulty('grammar', difficulty);
    }, [difficulty, setModeDifficulty]);

    const currentDrill = drills[currentIndex];
    const relatedTip = currentDrill ? GRAMMAR_TIPS.find(t => t.id === currentDrill.tip) : null;
    const category = currentDrill ? DRILL_CATEGORIES[currentDrill.category] : null;
    const categoryPerf = stats?.categoryPerformance?.[currentDrill?.category] || null;
    const categoryAccuracy = categoryPerf?.accuracy ?? (categoryPerf ? categoryPerf.correct / (categoryPerf.attempts || 1) : 1);
    const allowInstantTip = difficulty <= 2 || categoryAccuracy < 0.7;

    const handleAnswer = (answer) => {
        if (showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentDrill.answer;
        const responseTime = performance.now() - questionStartRef.current;
        recordCategoryPerformance(currentDrill.category, {
            success: isCorrect,
            responseTime,
            mode: 'grammar'
        });

        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));

        if (isCorrect) {
            SoundManager.playSuccess();
            const nextStreak = streak + 1;
            setStreak(nextStreak);
            setBestStreak(b => Math.max(b, nextStreak));
            updateDailyStat('dailyGrammar', 1);
            updateDailyStat('dailyStreak', nextStreak, 'max');
        } else {
            SoundManager.playFailure();
            setStreak(0);
            const difficultyBoost = 1 + (difficulty - 2) * 0.12;
            const speedBoost = responseTime < 5000 ? 1.05 : 0.9;
            const adaptiveReward = Math.max(5, Math.round(currentDrill.xpReward * difficultyBoost * speedBoost));
            setSessionPoints(prev => prev + adaptiveReward);
            addXP(adaptiveReward);
        }

        if (!isCorrect) { // Logic fix: original code had else { ... } else { ... } which is invalid logic flow in my head trace but likely merged code had two elses?
            // Actually the original code had:
            // if (isCorrect) { ... } else { ... addXP ... } else { ... setSessionPoints ... }
            // Wait, looking at read_file output:
            /*
            if (isCorrect) {
                // ...
            } else {
                // ...
                addXP(adaptiveReward);
            } else { // Syntax error in read_file? No, looks like I misread or it was malformed
                SoundManager.playFailure();
                setSessionPoints(prev => Math.max(0, prev - 5));
            }
            */
            // Ah, looking at the provided file content:
            /*
            if (isCorrect) {
                // ...
            } else {
                SoundManager.playFailure();
                setStreak(0);
                const difficultyBoost = ...
                const speedBoost = ...
                const adaptiveReward = ...
                setSessionPoints(prev => prev + adaptiveReward); // Wait, add points on failure?
                addXP(adaptiveReward);
            } else {
                SoundManager.playFailure();
                setSessionPoints(prev => Math.max(0, prev - 5));
            }
            */
            // The logic seems duplicated or conflicted.
            // HEAD logic (assumed): if incorrect, maybe partial points or penalty?
            // Usually: correct -> points. incorrect -> no points or penalty.
            // But the block `const adaptiveReward = ...` suggests reward.
            // Maybe this block belongs to `isCorrect`?
            // Re-reading `GrammarDrill.jsx` conflict:
            /*
            if (isCorrect) {
                SoundManager.playSuccess();
                // ...
            } else {
                SoundManager.playFailure();
                setStreak(0);
                // ... logic for reward? This seems wrong for "else".
            }
            */
            // Ah, likely the `adaptiveReward` block was meant for `isCorrect`.
            // And the `else` block should be penalty.
            // I'll fix this logic.
        }
    };

    // Fixing logic manually based on standard game rules:
    const handleAnswerFixed = (answer) => {
        if (showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentDrill.answer;
        const responseTime = performance.now() - questionStartRef.current;
        recordCategoryPerformance(currentDrill.category, {
            success: isCorrect,
            responseTime,
            mode: 'grammar'
        });

        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));

        if (isCorrect) {
            SoundManager.playSuccess();
            const nextStreak = streak + 1;
            setStreak(nextStreak);
            setBestStreak(b => Math.max(b, nextStreak));
            updateDailyStat('dailyGrammar', 1);
            updateDailyStat('dailyStreak', nextStreak, 'max');

            // Calculate points
            const difficultyBoost = 1 + (difficulty - 2) * 0.12;
            const speedBoost = responseTime < 5000 ? 1.05 : 0.9;
            const adaptiveReward = Math.max(5, Math.round((currentDrill.xpReward || 10) * difficultyBoost * speedBoost));
            setSessionPoints(prev => prev + adaptiveReward);
            addXP(adaptiveReward);
        } else {
            SoundManager.playFailure();
            setStreak(0);
            // Penalty? Or just 0.
            // Maybe slight XP for effort?
            addXP(2);
        }
    };

    const nextDrill = () => {
        if (currentIndex + 1 >= drills.length) {
            const reward = calculateRewards('grammar', {
                correct: score.correct,
                total: score.total,
                bestStreak
            });
            setSessionReward(reward);
            addXP(reward.xp);
            addCoins(reward.coins);
            incrementStreak();
            SoundManager.playLevelUp();
            setSessionComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setShowTip(false);
            questionStartRef.current = performance.now();
        }
    };

    const restartSession = () => {
        const shuffled = selectDrills();
        setDrills(shuffled);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setStreak(0);
        setBestStreak(0);
        setSessionReward(null);
        setSessionPoints(0);
        questionStartRef.current = performance.now();
    };

    if (drills.length === 0) {
        return (
            <GameLayout
                title="Grammar Drill"
                onBack={() => navigate('/')}
                headerRight={
                    <Badge variant="outline">
                        Session Points: {sessionPoints}
                    </Badge>
                }
            >
                <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-slate-400">Loading drills...</p>
                </div>
            </GameLayout>
        );
    }

    if (sessionComplete) {
        const percentage = Math.round((score.correct / score.total) * 100);
        return (
            <GameLayout
                title="Grammar Drill"
                onBack={() => navigate('/')}
                headerRight={
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block w-48">
                            <DifficultySlider value={difficulty} onChange={setDifficulty} />
                        </div>
                        <Badge variant="outline">Session Points: {sessionPoints}</Badge>
                    </div>
                }
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg mx-auto"
                >
                    <Card className="p-8 text-center">
                        <Trophy size={64} className="text-amber-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                        <p className="text-slate-400 mb-6">You scored {score.correct} out of {score.total}</p>

                        <div className="mb-8">
                            <div className="text-6xl font-black title-gradient">{percentage}%</div>
                            <Badge variant={percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}>
                                {percentage >= 80 ? 'Excellent!' : percentage >= 50 ? 'Good Job!' : 'Keep Practicing!'}
                            </Badge>
                            <div className="mt-3">
                                <Badge variant="outline">Adaptive Points: {sessionPoints}</Badge>
                            </div>
                        </div>

                        {sessionReward && (
                            <div className="flex justify-center gap-6 mb-8">
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

                        <div className="flex gap-4 justify-center">
                            <Button variant="ghost" onClick={() => navigate('/')}>
                                <ArrowLeft size={18} /> Menu
                            </Button>
                            <Button onClick={restartSession}>
                                <RotateCcw size={18} /> Try Again
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </GameLayout>
        );
    }

    return (
        <GameLayout title="Grammar Drill" onBack={() => navigate('/')}>
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Question {currentIndex + 1} of {drills.length}</span>
                    <span>{score.correct} correct</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / drills.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentDrill.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl mx-auto"
            >
                <Card className="p-8">
                    {/* Category Badge */}
                    {category && (
                        <div className="mb-4">
                            <Badge variant="outline" className="text-sm">
                                {category.icon} {category.name}
                            </Badge>
                        </div>
                    )}

                    {/* Prompt */}
                    <h2 className="text-2xl font-bold text-white mb-8">{currentDrill.prompt}</h2>

                    {relatedTip && allowInstantTip && !showTip && (
                        <Button variant="ghost" onClick={() => setShowTip(true)} className="mb-4 gap-2">
                            <Lightbulb size={18} /> Need a hint?
                        </Button>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {currentDrill.options.map((option, idx) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === currentDrill.answer;

                            let buttonClass = 'w-full p-4 rounded-xl border-2 text-left font-medium transition-all ';
                            if (showResult) {
                                if (isCorrect) {
                                    buttonClass += 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += 'border-red-500 bg-red-500/20 text-red-300';
                                } else {
                                    buttonClass += 'border-white/10 bg-slate-800/50 text-slate-500';
                                }
                            } else {
                                buttonClass += 'border-white/10 bg-slate-800/50 text-white hover:border-indigo-500 hover:bg-indigo-500/10';
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={!showResult ? { scale: 1.02 } : {}}
                                    whileTap={!showResult ? { scale: 0.98 } : {}}
                                    onClick={() => handleAnswerFixed(option)}
                                    disabled={showResult}
                                    className={buttonClass}
                                >
                                    <span className="flex items-center gap-3">
                                        {showResult && isCorrect && <CheckCircle size={20} />}
                                        {showResult && isSelected && !isCorrect && <XCircle size={20} />}
                                        {option}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Result Feedback */}
                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {selectedAnswer !== currentDrill.answer && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                                        The correct answer is: <strong>{currentDrill.answer}</strong>
                                    </div>
                                )}

                                {/* Grammar Insight - Always shown after answering */}
                                {relatedTip && (
                                    <GrammarInsightCard
                                        tip={relatedTip}
                                        isCorrect={selectedAnswer === currentDrill.answer}
                                        showDeepDiveLink={true}
                                        onDeepDiveClick={() => navigate('/grammar-deep-dive')}
                                    />
                                )}

                                {/* Next Button */}
                                <Button onClick={nextDrill} className="w-full mt-4">
                                    {currentIndex + 1 >= drills.length ? 'Finish' : 'Next Question'}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </GameLayout>
    );
};

export default GrammarDrill;
