/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, BookOpen } from 'lucide-react';
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
    const [status, setStatus] = useState('playing'); // 'playing', 'correct', 'wrong', 'finished'
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const MAX_QUESTIONS = 5;

    // Load initial puzzle
    useEffect(() => {
        // Wrap in timeout to avoid potential synchronous state update warnings during mount
        const t = setTimeout(() => {
            const newPuzzle = generateCloze(1);
            if (newPuzzle) {
                setPuzzle(newPuzzle);
                setStatus('playing');
                setSelectedOption(null);
            } else {
                setStatus('finished');
            }
        }, 0);
        return () => clearTimeout(t);
    }, []);

    const loadNextPuzzle = () => {
        const newPuzzle = generateCloze(1); // Default to level 1 for now
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setStatus('playing');
            setSelectedOption(null);
        } else {
            setStatus('finished');
        }
    };

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
                    <h2 className="text-3xl font-bold text-white mb-4">Session Complete!</h2>
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

    const parts = puzzle.sentence.split('___');

    return (
        <GameLayout
            title="Cloze Master"
            subtitle="Complete the sentence with the correct word."
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-8">

                <Card className="w-full p-8 text-center bg-slate-800/80 backdrop-blur border-indigo-500/20 shadow-2xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
                        {parts[0]}
                        <span className={`
                            inline-block min-w-[100px] border-b-4 mx-2 px-2 text-center transition-colors
                            ${status === 'correct' ? 'border-green-500 text-green-400' :
                              status === 'wrong' ? 'border-red-500 text-red-400' : 'border-indigo-500 text-indigo-300'}
                        `}>
                            {selectedOption || '_____'}
                        </span>
                        {parts[1]}
                    </h3>
                    <p className="text-slate-400 italic">"{puzzle.translation}"</p>
                </Card>

                <div className="grid grid-cols-2 gap-4 w-full">
                    {puzzle.options.map((option, idx) => {
                        let variant = "outline";
                        if (status !== 'playing') {
                            if (option === puzzle.answer) variant = "success";
                            else if (option === selectedOption) variant = "danger";
                        }

                        return (
                            <Button
                                key={idx}
                                variant={variant}
                                onClick={() => handleOptionClick(option)}
                                disabled={status !== 'playing'}
                                className="py-6 text-xl"
                            >
                                {option}
                            </Button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {status !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <Card className="bg-indigo-900/20 border-indigo-500/30 p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="text-indigo-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-indigo-300 mb-1">Grammar Note</h4>
                                        <p className="text-slate-300 text-sm">{puzzle.explanation}</p>
                                    </div>
                                </div>
                            </Card>
                            <Button
                                onClick={handleNext}
                                className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-500"
                            >
                                {questionCount < MAX_QUESTIONS - 1 ? "Next Question" : "Finish"} <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    );
};

export default ClozeGame;
