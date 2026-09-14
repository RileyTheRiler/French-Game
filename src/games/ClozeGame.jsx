import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
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
    const [selectedOption, setSelectedOption] = useState(null);
    const [status, setStatus] = useState('playing'); // 'playing', 'correct', 'wrong', 'finished'
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const MAX_QUESTIONS = 5;

    const loadNextPuzzle = () => {
        const newPuzzle = generateCloze(1); // Default to level 1 for now
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setSelectedOption(null);
            setStatus('playing');
        } else {
            // Fallback or error state if generator fails
            setStatus('finished');
        }
    };

    useEffect(() => {
        loadNextPuzzle();
    }, []);

    const handleOptionClick = (option) => {
        if (status !== 'playing') return;

        setSelectedOption(option);

        if (option === puzzle.answer) {
            setStatus('correct');
            SoundManager.playSuccess();
            setScore(s => s + 1);
            addXP(10);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
        } else {
            setStatus('wrong');
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
            <GameLayout title="Fill in the Blank" onBack={() => navigate('/')}>
                <Card className="max-w-md mx-auto text-center p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Practice Complete!</h2>
                    <p className="text-slate-400 mb-8">You got {score} out of {MAX_QUESTIONS} correct.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => navigate('/')} variant="ghost">BACK</Button>
                        <Button onClick={() => window.location.reload()}>PLAY AGAIN</Button>
                    </div>
                </Card>
            </GameLayout>
        );
    }

    if (!puzzle) return <div>Loading...</div>;

    // Split question into parts to highlight the blank
    const parts = puzzle.question.split('_____');

    return (
        <GameLayout
            title="Fill in the Blank"
            subtitle="Choose the correct word to complete the sentence."
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">

                {/* Sentence Display */}
                <Card className="w-full mb-8 p-10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />

                    <h3 className="text-3xl md:text-4xl font-bold text-white leading-relaxed relative z-10">
                        {parts[0]}
                        <motion.span
                            className={`
                                inline-block px-4 py-2 mx-1 rounded-xl border-b-4 min-w-[100px] align-bottom
                                ${status === 'correct' ? 'bg-green-500/20 border-green-500 text-green-300' : ''}
                                ${status === 'wrong' ? 'bg-red-500/20 border-red-500 text-red-300' : ''}
                                ${status === 'playing' ? 'bg-white/10 border-white/30 text-transparent' : ''}
                            `}
                            animate={status === 'correct' ? { scale: [1, 1.1, 1] } : {}}
                        >
                            {status === 'playing' ? '?' : selectedOption}
                        </motion.span>
                        {parts[1]}
                    </h3>

                    <p className="mt-6 text-slate-400 text-lg font-medium italic">
                        "{puzzle.translation}"
                    </p>
                </Card>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {puzzle.options.map((option, idx) => {
                        let variant = "default";
                        if (status !== 'playing') {
                            if (option === puzzle.answer) variant = "correct";
                            else if (option === selectedOption) variant = "wrong";
                            else variant = "dimmed";
                        }

                        return (
                            <motion.button
                                key={idx}
                                whileHover={status === 'playing' ? { scale: 1.02, y: -2 } : {}}
                                whileTap={status === 'playing' ? { scale: 0.98 } : {}}
                                onClick={() => handleOptionClick(option)}
                                disabled={status !== 'playing'}
                                className={`
                                    p-6 rounded-2xl text-xl font-bold transition-all shadow-lg border-b-4
                                    ${variant === 'default' ? 'bg-white text-slate-800 border-slate-300 hover:bg-indigo-50 hover:border-indigo-300' : ''}
                                    ${variant === 'correct' ? 'bg-green-500 text-white border-green-700' : ''}
                                    ${variant === 'wrong' ? 'bg-red-500 text-white border-red-700' : ''}
                                    ${variant === 'dimmed' ? 'bg-slate-800/50 text-slate-500 border-transparent opacity-50' : ''}
                                `}
                            >
                                {option}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Feedback / Next Button */}
                <AnimatePresence>
                    {status !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 w-full"
                        >
                            <Button
                                onClick={handleNext}
                                className={`w-full py-4 text-xl rounded-2xl shadow-xl ${status === 'correct' ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                {status === 'correct' ? 'Excellent! Next' : 'Continue'} <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    );
};

export default ClozeGame;
