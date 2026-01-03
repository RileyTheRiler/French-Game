import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, AlertTriangle, CheckCircle, XCircle, Lightbulb, Volume2 } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SURVIVAL_SCENARIOS, getScenarioById, calculateScore } from '../../data/survivalScenarios';
import SoundManager from '../../utils/SoundManager';
import confetti from 'canvas-confetti';

const SurvivalChallenge = () => {
    const navigate = useNavigate();
    const { addXP, updateSurvivalBest } = useProgress();

    // Game state
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [currentStage, setCurrentStage] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [stressLevel, setStressLevel] = useState(0);

    // Timer effect
    useEffect(() => {
        if (!isPlaying || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleTimeOut();
                    return 0;
                }
                // Increase stress as time runs low
                if (prev <= 30) {
                    setStressLevel(Math.min(100, stressLevel + 5));
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying, timeRemaining]);

    const startScenario = (scenario) => {
        setSelectedScenario(scenario);
        setTimeRemaining(scenario.timeLimit);
        setCurrentStage(scenario.stages[0]);
        setIsPlaying(true);
        setHintsUsed(0);
        setShowHint(false);
        setStressLevel(0);
        setGameResult(null);
    };

    const handleOptionSelect = (option) => {
        if (!isPlaying) return;

        // Apply time penalty if incorrect
        if (!option.isCorrect && option.timePenalty) {
            setTimeRemaining(prev => Math.max(0, prev - option.timePenalty));
            setStressLevel(prev => Math.min(100, prev + 20));
            SoundManager.playMiss();
        } else if (option.isCorrect) {
            SoundManager.playMatch();
        }

        // Find next stage
        const nextStage = selectedScenario.stages.find(s => s.id === option.nextStage);

        if (nextStage) {
            if (nextStage.isEnd) {
                handleGameEnd(nextStage.success);
            } else {
                setCurrentStage(nextStage);
                setShowHint(false);
            }
        }
    };

    const handleTimeOut = () => {
        setIsPlaying(false);
        setGameResult({ success: false, reason: 'timeout' });
        SoundManager.playMiss();
    };

    const handleGameEnd = (success) => {
        setIsPlaying(false);

        if (success) {
            const score = calculateScore(selectedScenario, timeRemaining, hintsUsed);
            addXP(score);
            updateSurvivalBest?.(selectedScenario.id, timeRemaining);
            setGameResult({ success: true, score, timeRemaining });
            SoundManager.playLevelUp();
            confetti({ particleCount: 100, spread: 70 });
        } else {
            setGameResult({ success: false, reason: 'failed' });
        }
    };

    const useHint = () => {
        if (hintsUsed < 2) {
            setHintsUsed(prev => prev + 1);
            setTimeRemaining(prev => Math.max(0, prev - 15)); // 15 second penalty
            setShowHint(true);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = stressLevel > 50 ? 1.2 : 0.9; // Faster when stressed
            speechSynthesis.speak(utterance);
        }
    };

    const resetGame = () => {
        setSelectedScenario(null);
        setCurrentStage(null);
        setIsPlaying(false);
        setGameResult(null);
    };

    // Scenario selection screen
    if (!selectedScenario) {
        return (
            <GameLayout
                title="Survival Mode"
                subtitle="High-stakes French challenges"
                onBack={() => navigate('/')}
            >
                <div className="max-w-4xl mx-auto p-4">
                    <Card className="p-6 bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30 mb-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-orange-400" size={24} />
                            <div>
                                <h3 className="font-bold text-white">Real-World Pressure</h3>
                                <p className="text-sm text-slate-300">
                                    Race against time! Make the right choices before time runs out.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        {SURVIVAL_SCENARIOS.map(scenario => (
                            <motion.div
                                key={scenario.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    className="p-5 bg-slate-800/60 hover:bg-slate-700/60 cursor-pointer transition-all border-slate-600 hover:border-slate-500"
                                    onClick={() => startScenario(scenario)}
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="text-4xl">{scenario.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white text-lg">{scenario.title}</h3>
                                                <Badge
                                                    variant={
                                                        scenario.difficulty === 'Beginner' ? 'success' :
                                                            scenario.difficulty === 'Intermediate' ? 'warning' : 'destructive'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {scenario.difficulty}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-3">{scenario.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {scenario.timeLimit}s
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Zap size={12} className="text-amber-400" />
                                                    {scenario.xpReward} XP
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </GameLayout>
        );
    }

    // Result screen
    if (gameResult) {
        return (
            <GameLayout
                title={gameResult.success ? "Mission Complete!" : "Time's Up!"}
                onBack={resetGame}
            >
                <div className="max-w-lg mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-8"
                    >
                        {gameResult.success ? (
                            <CheckCircle className="text-emerald-400" size={100} />
                        ) : (
                            <XCircle className="text-red-400" size={100} />
                        )}
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white mb-4">
                        {gameResult.success ? 'Félicitations!' : 'Réessayez!'}
                    </h2>

                    {gameResult.success ? (
                        <div className="text-center mb-8">
                            <p className="text-xl text-emerald-300 mb-2">
                                +{gameResult.score} XP
                            </p>
                            <p className="text-slate-400">
                                Time remaining: {gameResult.timeRemaining}s
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-400 mb-8">
                            {gameResult.reason === 'timeout'
                                ? "You ran out of time! Try to respond faster."
                                : "The situation didn't go well. Try again!"}
                        </p>
                    )}

                    {/* Vocabulary learned */}
                    {selectedScenario.vocabulary && (
                        <Card className="p-4 bg-slate-800/60 mb-6 w-full">
                            <h4 className="font-bold text-white mb-3">Key Vocabulary</h4>
                            <div className="space-y-2">
                                {selectedScenario.vocabulary.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-indigo-300 font-medium">{v.french}</span>
                                        <span className="text-slate-400">{v.english}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={resetGame}>
                            Choose Another
                        </Button>
                        <Button onClick={() => startScenario(selectedScenario)}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </GameLayout>
        );
    }

    // Active game screen
    const timerPercent = (timeRemaining / selectedScenario.timeLimit) * 100;
    const timerColor = timerPercent > 50 ? 'bg-emerald-500' : timerPercent > 25 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <GameLayout
            title={selectedScenario.title}
            onBack={() => {
                setIsPlaying(false);
                resetGame();
            }}
            headerRight={
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                        <Zap size={12} className="mr-1" />
                        {selectedScenario.xpReward} XP
                    </Badge>
                </div>
            }
        >
            <div className="max-w-2xl mx-auto p-4">
                {/* Timer bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                            <Clock size={14} />
                            Time Remaining
                        </span>
                        <span className={`font-bold text-lg ${timerPercent <= 25 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {timeRemaining}s
                        </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${timerColor} transition-colors`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${timerPercent}%` }}
                        />
                    </div>
                </div>

                {/* Stress indicator */}
                {stressLevel > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4"
                    >
                        <div className="flex items-center gap-2 text-sm text-orange-400">
                            <AlertTriangle size={14} />
                            <span>Stress Level: {stressLevel}%</span>
                        </div>
                    </motion.div>
                )}

                {/* Current situation */}
                <Card className={`p-6 mb-6 ${stressLevel > 50 ? 'animate-pulse border-red-500/50' : 'border-slate-600'}`}>
                    {currentStage.situation && (
                        <p className="text-slate-300 mb-4 italic">{currentStage.situation}</p>
                    )}

                    {currentStage.systemMessage && (
                        <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-4 mb-4">
                            <p className="text-amber-300">{currentStage.systemMessage}</p>
                        </div>
                    )}

                    {currentStage.npcMessage && (
                        <div className="bg-slate-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-indigo-400 font-medium">
                                    {currentStage.npcSpeaker || 'NPC'}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => speakText(currentStage.npcMessage)}
                                    className="p-1 h-auto"
                                >
                                    <Volume2 size={16} className="text-indigo-400" />
                                </Button>
                            </div>
                            <p className="text-white text-lg">"{currentStage.npcMessage}"</p>
                        </div>
                    )}
                </Card>

                {/* Response options */}
                <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-2">Your response:</p>

                    {currentStage.options?.map((option, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Button
                                variant="outline"
                                className="w-full text-left justify-start h-auto py-4 px-5 hover:bg-indigo-500/20 hover:border-indigo-400"
                                onClick={() => handleOptionSelect(option)}
                            >
                                <span className="text-white">{option.text}</span>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Hint button */}
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={useHint}
                        disabled={hintsUsed >= 2 || showHint}
                        className="text-amber-400"
                    >
                        <Lightbulb size={16} className="mr-2" />
                        Use Hint ({2 - hintsUsed} left) - 15s penalty
                    </Button>
                </div>

                {/* Hint display */}
                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4"
                        >
                            <Card className="p-4 bg-amber-900/30 border-amber-500/30">
                                <p className="text-amber-300 text-sm">
                                    💡 Look for polite expressions like "s'il vous plaît" or "excusez-moi"
                                </p>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default SurvivalChallenge;
