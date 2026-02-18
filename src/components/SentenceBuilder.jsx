import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import { generateSentenceBuilder } from '../systems/ExerciseGenerator';
import confetti from 'canvas-confetti';

const SentenceBuilder = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    const [puzzle, setPuzzle] = useState(null);
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [availableTokens, setAvailableTokens] = useState([]);
    const [status, setStatus] = useState('playing'); // playing, correct, wrong, finished
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const MAX_QUESTIONS = 5;

    // Use useCallback to stable reference for useEffect
    const loadNextPuzzle = useCallback(() => {
        const newPuzzle = generateSentenceBuilder(1);
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setAvailableTokens(newPuzzle.scrambled);
            setSelectedTokens([]);
            setStatus('playing');
        } else {
            setStatus('finished');
        }
    }, []);

    useEffect(() => {
        // Use timeout to avoid potential synchronous setState issues on mount
        const timer = setTimeout(() => {
            loadNextPuzzle();
        }, 0);
        return () => clearTimeout(timer);
    }, [loadNextPuzzle]);

    const handleTokenClick = (token, source) => {
        if (status !== 'playing') return;

        if (source === 'available') {
            setAvailableTokens(prev => prev.filter(t => t.id !== token.id));
            setSelectedTokens(prev => [...prev, token]);
        } else {
            setSelectedTokens(prev => prev.filter(t => t.id !== token.id));
            setAvailableTokens(prev => [...prev, token]);
        }
        SoundManager.playClick();
    };

    const checkAnswer = () => {
        const userAnswer = selectedTokens.map(t => t.cleanText).join(' ');
        const target = puzzle.targetFrench;

        // Simple check - could be improved with fuzzy matching
        if (userAnswer.toLowerCase() === target.toLowerCase()) {
            setStatus('correct');
            SoundManager.playSuccess();
            setScore(s => s + 1);
            addXP(15);
            confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.6 }
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
            <GameLayout title="Sentence Builder" onBack={() => navigate('/')}>
                <Card className="max-w-md mx-auto text-center p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Well Done!</h2>
                    <p className="text-slate-400 mb-8">You built {score} correct sentences.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => navigate('/')} variant="ghost">BACK</Button>
                        <Button onClick={() => window.location.reload()}>PLAY AGAIN</Button>
                    </div>
                </Card>
            </GameLayout>
        );
    }

    if (!puzzle) return <div>Loading...</div>;

    return (
        <GameLayout
            title="Sentence Builder"
            subtitle="Arrange the words to form a correct sentence."
            onBack={() => navigate('/')}
        >
            <div className="max-w-3xl mx-auto flex flex-col items-center gap-8 min-h-[60vh]">

                {/* Target (English) */}
                <Card className="w-full p-6 text-center bg-slate-800/50">
                    <p className="text-xl text-slate-300 italic">"{puzzle.targetEnglish}"</p>
                </Card>

                {/* Construction Area */}
                <div className={`
                    w-full min-h-[120px] p-4 rounded-2xl border-2 flex flex-wrap gap-3 items-center justify-center transition-colors
                    ${status === 'correct' ? 'border-green-500 bg-green-500/10' :
                      status === 'wrong' ? 'border-red-500 bg-red-500/10' : 'border-slate-600 bg-slate-900/50'}
                `}>
                    {selectedTokens.length === 0 && status === 'playing' && (
                        <span className="text-slate-600 text-sm">Tap words below to build sentence</span>
                    )}

                    <AnimatePresence>
                        {selectedTokens.map(token => (
                            <motion.button
                                key={token.id}
                                layoutId={token.id}
                                onClick={() => handleTokenClick(token, 'selected')}
                                className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
                                disabled={status !== 'playing'}
                            >
                                {token.text}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Word Bank */}
                <div className="flex flex-wrap gap-3 justify-center w-full">
                    <AnimatePresence>
                        {availableTokens.map(token => (
                            <motion.button
                                key={token.id}
                                layoutId={token.id}
                                onClick={() => handleTokenClick(token, 'available')}
                                className="px-4 py-3 bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 hover:bg-slate-600"
                                whileTap={{ scale: 0.95 }}
                                disabled={status !== 'playing'}
                            >
                                {token.text}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="w-full flex justify-center mt-8">
                    {status === 'playing' ? (
                        <Button
                            onClick={checkAnswer}
                            disabled={selectedTokens.length === 0}
                            className="w-full md:w-auto px-8 py-4 text-lg"
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className={`w-full md:w-auto px-8 py-4 text-lg ${status === 'correct' ? 'bg-green-600' : 'bg-slate-600'}`}
                        >
                            {status === 'correct' ? 'Next Sentence' : 'Continue'} <ArrowRight className="ml-2" />
                        </Button>
                    )}
                </div>

            </div>
        </GameLayout>
    );
};

export default SentenceBuilder;
