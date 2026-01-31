import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap, BookOpen, Check, X, RotateCcw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';

const SRSReviewQueue = () => {
    const { getDueWords, updateWordProgress } = useVocabulary();
    const { addXP, addCoins, stats, difficultySettings } = useProgress();
    const [reviewQueue, setReviewQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [startTime, setStartTime] = useState(null);

    const initializeCard = useCallback((word) => {
        setIsRevealed(false);
        setStartTime(Date.now());
    }, []);

    const finishSession = useCallback(() => {
        SoundManager.playLevelUp();
        setSessionComplete(true);
        addXP(50);
        confetti();
    }, [addXP]);

    useEffect(() => {
        const queue = getDueWords();
        setReviewQueue(queue);
        if (queue.length > 0) {
            initializeCard(queue[0]);
        }
    }, [getDueWords, initializeCard]);

    const handleGrade = useCallback((grade) => {
        if (!currentWord) return;

        const timeSpent = Date.now() - startTime;
        // Grade: 1=Again, 2=Hard, 3=Good, 4=Easy
        const success = grade >= 3;

        updateWordProgress(currentWord.id, success); // Simplified update for now

        if (success) {
            SoundManager.playSuccess();
        } else {
            SoundManager.playMiss();
        }

        if (currentIndex + 1 < reviewQueue.length) {
            setCurrentIndex(prev => prev + 1);
            initializeCard(reviewQueue[currentIndex + 1]);
        } else {
            finishSession();
        }
    }, [currentWord, currentIndex, reviewQueue, startTime, updateWordProgress, initializeCard, finishSession]);

    const currentWord = reviewQueue[currentIndex];

    if (reviewQueue.length === 0 && !sessionComplete) {
        return (
            <GameLayout title="Review Queue">
                <div className="flex items-center justify-center h-64 text-slate-400">
                    All caught up! No words due for review.
                </div>
            </GameLayout>
        );
    }

    if (sessionComplete) {
        return (
            <GameLayout title="Session Complete">
                <div className="text-center p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Review Complete!</h2>
                    <p className="mb-8 text-slate-300">You reviewed {reviewQueue.length} words.</p>
                    <Button onClick={() => window.history.back()}>Back to Dashboard</Button>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout title={`Review (${currentIndex + 1}/${reviewQueue.length})`}>
            <div className="max-w-md mx-auto">
                <Card className="min-h-[300px] flex flex-col items-center justify-center p-8 mb-8 cursor-pointer" onClick={() => !isRevealed && setIsRevealed(true)}>
                    <h2 className="text-4xl font-black text-white mb-4">{currentWord.french}</h2>
                    {isRevealed ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                            <p className="text-2xl text-indigo-300 font-bold mb-2">{currentWord.english}</p>
                            <p className="text-slate-400 italic">{currentWord.contextSentence || "No context available"}</p>
                        </motion.div>
                    ) : (
                        <p className="text-slate-500 text-sm">Tap to reveal</p>
                    )}
                </Card>

                {isRevealed && (
                    <div className="grid grid-cols-4 gap-2">
                        <Button variant="danger" onClick={() => handleGrade(1)} className="flex flex-col gap-1 py-4 h-auto">
                            <span className="text-lg font-bold">Again</span>
                            <span className="text-[10px] opacity-70">&lt; 1m</span>
                        </Button>
                        <Button variant="warning" onClick={() => handleGrade(2)} className="flex flex-col gap-1 py-4 h-auto">
                            <span className="text-lg font-bold">Hard</span>
                            <span className="text-[10px] opacity-70">2d</span>
                        </Button>
                        <Button variant="primary" onClick={() => handleGrade(3)} className="flex flex-col gap-1 py-4 h-auto">
                            <span className="text-lg font-bold">Good</span>
                            <span className="text-[10px] opacity-70">4d</span>
                        </Button>
                        <Button variant="success" onClick={() => handleGrade(4)} className="flex flex-col gap-1 py-4 h-auto">
                            <span className="text-lg font-bold">Easy</span>
                            <span className="text-[10px] opacity-70">7d</span>
                        </Button>
                    </div>
                )}
            </div>
        </GameLayout>
    );
};

export default SRSReviewQueue;
