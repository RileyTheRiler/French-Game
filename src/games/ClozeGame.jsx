import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { generateCloze } from '../systems/ExerciseGenerator';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';

const ClozeGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [puzzle, setPuzzle] = useState(null);
    const [status, setStatus] = useState('playing'); // playing, correct, wrong
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

    const loadNextPuzzle = () => {
        const newPuzzle = generateCloze(1); // Default to level 1 for now
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setStatus('playing');
        } else {
            // Handle no puzzles available
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadNextPuzzle();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleOptionClick = (option) => {
        if (status !== 'playing') return;

        if (option === puzzle.answer) {
            setStatus('correct');
            SoundManager.playSuccess();
            setScore(s => s + 1);
            setStreak(s => s + 1);
            addXP(10 + (streak * 2));
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
        } else {
            setStatus('wrong');
            SoundManager.playMiss();
            setStreak(0);
        }
    };

    const handleNext = () => {
        loadNextPuzzle();
    };

    if (!puzzle) return <div>Loading...</div>;

    const parts = puzzle.sentence.split('_____');

    return (
        <GameLayout
            title="Fill in the Blank"
            subtitle="Complete the sentence with the correct word."
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-8">

                {/* Sentence Display */}
                <Card className="w-full p-8 text-center bg-slate-800/80 border-slate-700">
                    <p className="text-2xl md:text-3xl font-medium leading-relaxed">
                        {parts[0]}
                        <span className={`inline-block border-b-4 px-2 min-w-[100px] transition-colors ${
                            status === 'correct' ? 'border-green-500 text-green-400' :
                            status === 'wrong' ? 'border-red-500 text-red-400' :
                            'border-indigo-500 text-transparent'
                        }`}>
                            {status === 'playing' ? '_____' : puzzle.answer}
                        </span>
                        {parts[1]}
                    </p>
                    <p className="mt-4 text-slate-400 italic text-lg">"{puzzle.translation}"</p>
                </Card>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {puzzle.options.map((option, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOptionClick(option)}
                            disabled={status !== 'playing'}
                            className={`
                                p-6 rounded-2xl text-xl font-bold transition-all border-2
                                ${status === 'playing'
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'
                                    : option === puzzle.answer
                                        ? 'bg-green-500/20 border-green-500 text-green-400'
                                        : 'opacity-50 border-transparent bg-slate-900/50'
                                }
                            `}
                        >
                            {option}
                        </motion.button>
                    ))}
                </div>

                {/* Next Button */}
                <AnimatePresence>
                    {status !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <Button
                                onClick={handleNext}
                                className={`w-full py-4 text-lg ${status === 'correct' ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                {status === 'correct' ? 'Continue' : 'Try Another'} <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    );
};

export default ClozeGame;
