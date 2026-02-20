import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import { generateCloze } from '../systems/ExerciseGenerator';
import confetti from 'canvas-confetti';

const ClozeGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [puzzle, setPuzzle] = useState(null);
    const [status, setStatus] = useState('playing'); // 'playing', 'correct', 'finished'
    const [questionCount, setQuestionCount] = useState(0);
    const MAX_QUESTIONS = 5;

    const loadNextPuzzle = () => {
        const newPuzzle = generateCloze(1); // Default to level 1 for now
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setStatus('playing');
        } else {
            setStatus('finished');
        }
    };

    useEffect(() => {
        setTimeout(() => {
            loadNextPuzzle();
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOptionClick = (option) => {
        if (status !== 'playing') return;

        if (option === puzzle.answer) {
            setStatus('correct');
            SoundManager.playSuccess();
            addXP(10);
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            SoundManager.playMiss();
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
            <GameLayout title="Fill in the Blanks" onBack={() => navigate('/')}>
                <Card className="max-w-md mx-auto text-center p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Complete!</h2>
                    <p className="text-slate-400 mb-8">Good practice!</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => navigate('/')} variant="ghost">BACK</Button>
                        <Button onClick={() => window.location.reload()}>PLAY AGAIN</Button>
                    </div>
                </Card>
            </GameLayout>
        );
    }

    if (!puzzle) return <div>Loading...</div>;

    const parts = puzzle.sentence.split('___');

    return (
        <GameLayout
            title="Fill in the Blanks"
            subtitle="Choose the correct word to complete the sentence."
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">

                <Card className="w-full mb-8 p-12 text-center relative">
                    <p className="text-3xl md:text-4xl font-bold leading-relaxed text-white">
                        {parts[0]}
                        <span className={`inline-block px-4 py-1 mx-2 rounded-lg border-b-4 ${status === 'correct' ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-transparent border-slate-600 bg-slate-800 w-24 align-bottom'}`}>
                            {status === 'correct' ? puzzle.answer : '?'}
                        </span>
                        {parts[1]}
                    </p>
                    <p className="mt-8 text-slate-400 text-lg italic">
                        "{puzzle.translation}"
                    </p>
                </Card>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {puzzle.options.map((option, idx) => (
                        <Button
                            key={idx}
                            onClick={() => handleOptionClick(option)}
                            disabled={status !== 'playing'}
                            variant={status === 'correct' && option === puzzle.answer ? 'success' : 'outline'}
                            className="py-6 text-xl"
                        >
                            {option}
                        </Button>
                    ))}
                </div>

                {/* Next Button */}
                <AnimatePresence>
                    {status === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full mt-8"
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

export default ClozeGame;
