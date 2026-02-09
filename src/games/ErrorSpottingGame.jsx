import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import { generateErrorSpotting } from '../systems/ExerciseGenerator';
import confetti from 'canvas-confetti';

const ErrorSpottingGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [puzzle, setPuzzle] = useState(null);
    const [status, setStatus] = useState('playing'); // 'playing', 'correct', 'finished'
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
    const MAX_QUESTIONS = 5;

    const loadNextPuzzle = useCallback(() => {
        const newPuzzle = generateErrorSpotting(1);
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setStatus('playing');
            setFeedback(null);
        } else {
            setStatus('finished');
        }
    }, []);

    useEffect(() => {
        // Use setTimeout to avoid synchronous state update warning during mount
        const timer = setTimeout(() => {
            loadNextPuzzle();
        }, 0);
        return () => clearTimeout(timer);
    }, [loadNextPuzzle]);

    const handleWordClick = (word) => {
        if (status !== 'playing') return;

        // Clean punctuation for comparison (simple check)
        const cleanWord = word.replace(/[.,!?]/g, '');
        const target = puzzle.error.target.replace(/[.,!?]/g, '');

        if (cleanWord === target) {
            // Found the error!
            setStatus('correct');
            SoundManager.playSuccess();
            setScore(s => s + 1);
            addXP(15);
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            // Clicked a correct word
            SoundManager.playPop();
            setFeedback({
                type: 'info',
                message: "That part looks correct. Keep looking!"
            });
            // Clear feedback after a moment
            setTimeout(() => setFeedback(null), 2000);
        }
    };

    const handleNext = () => {
        if (questionCount >= MAX_QUESTIONS - 1) {
            setStatus('finished');
        } else {
            setQuestionCount(c => c + 1);
            loadNextPuzzle();
        }
    };

    if (status === 'finished') {
        return (
            <GameLayout title="Error Spotting" onBack={() => navigate('/')}>
                <Card className="max-w-md mx-auto text-center p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Debugging Complete!</h2>
                    <p className="text-slate-400 mb-8">You found {score} out of {MAX_QUESTIONS} errors.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => navigate('/')} variant="ghost">BACK</Button>
                        <Button onClick={() => window.location.reload()}>PLAY AGAIN</Button>
                    </div>
                </Card>
            </GameLayout>
        );
    }

    if (!puzzle) return <div>Loading...</div>;

    const words = puzzle.sentence.split(' ');

    return (
        <GameLayout
            title="Spot the Error"
            subtitle="Tap the word that is incorrect."
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">

                <Card className="w-full mb-8 p-12 text-center relative overflow-visible">
                    <div className="flex flex-wrap justify-center gap-3 text-3xl md:text-4xl font-bold leading-relaxed">
                        {words.map((word, idx) => {
                            const isErrorTarget = puzzle && word.includes(puzzle.error.target);

                            return (
                                <motion.button
                                    key={idx}
                                    layout
                                    whileHover={status === 'playing' ? { scale: 1.1, textShadow: "0 0 8px rgba(255,255,255,0.5)" } : {}}
                                    whileTap={status === 'playing' ? { scale: 0.95 } : {}}
                                    onClick={() => handleWordClick(word)}
                                    disabled={status !== 'playing'}
                                    className={`
                                        rounded-lg px-2 py-1 transition-colors relative
                                        ${status === 'correct' && isErrorTarget ? 'text-red-400 line-through decoration-4' : 'text-white hover:bg-white/10'}
                                    `}
                                >
                                    {word}
                                    {status === 'correct' && isErrorTarget && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: -40 }}
                                            className="absolute left-0 right-0 text-green-400 font-black text-3xl whitespace-nowrap flex justify-center"
                                        >
                                            {puzzle.error.correction}
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    <p className="mt-8 text-slate-400 text-lg italic">
                        "{puzzle.translation}"
                    </p>

                    {/* Feedback Toast */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 left-0 right-0 mx-auto w-max px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-medium border border-slate-700 shadow-xl"
                            >
                                {feedback.message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* Explanation Card */}
                <AnimatePresence>
                    {status === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="w-full mb-8"
                        >
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex gap-4 items-start">
                                <div className="bg-green-500/20 p-3 rounded-xl shrink-0">
                                    <Check className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-green-300 font-bold text-lg mb-1">Correct!</h4>
                                    <p className="text-green-200/80 leading-relaxed">
                                        {puzzle.error.explanation}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next Button */}
                <AnimatePresence>
                    {status === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <Button
                                onClick={handleNext}
                                className="w-full py-4 text-xl bg-green-500 hover:bg-green-600 rounded-2xl shadow-xl shadow-green-500/20"
                            >
                                Continue <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    );
};

export default ErrorSpottingGame;
