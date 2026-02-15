import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Trophy, RefreshCw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';

// Mock data generator (replace with real data source)
const generateConjugation = () => {
    const verbs = [
        { infinitive: 'être', tense: 'Présent', pronoun: 'Je', answer: 'suis' },
        { infinitive: 'avoir', tense: 'Présent', pronoun: 'Tu', answer: 'as' },
        { infinitive: 'aller', tense: 'Futur', pronoun: 'Nous', answer: 'irons' },
        { infinitive: 'faire', tense: 'Imparfait', pronoun: 'Ils', answer: 'faisaient' },
    ];
    return verbs[Math.floor(Math.random() * verbs.length)];
};

const ConjugationBlitz = () => {
    const { addXP } = useProgress();
    const [currentVerb, setCurrentVerb] = useState(null);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [status, setStatus] = useState('playing'); // playing, finished
    const [feedback, setFeedback] = useState(null); // correct, incorrect
    const inputRef = useRef(null);
    const timerRef = useRef(null);

    const endGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('finished');
        SoundManager.playLevelUp(); // or some generic finish sound

        // Calculate total XP
        const baseXP = score * 2;
        addXP(baseXP);
    }, [addXP, score]);

    // Timer effect
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []); // Only runs once on mount

    // Check game over condition
    useEffect(() => {
        if (timeLeft <= 0 && status === 'playing') {
            const t = setTimeout(() => {
                endGame();
            }, 0);
            return () => clearTimeout(t);
        }
    }, [timeLeft, status, endGame]);

    const loadNewVerb = useCallback(() => {
        setCurrentVerb(generateConjugation());
        setInput('');
        setFeedback(null);
        // Small timeout to ensure render happens before focus
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    }, []);

    // Initial load
    useEffect(() => {
        // Use setTimeout to avoid synchronous setState inside effect warning
        const t = setTimeout(() => {
            loadNewVerb();
        }, 0);
        return () => clearTimeout(t);
    }, [loadNewVerb]);

    const triggerShake = () => {
        const form = document.getElementById('blitz-form');
        if (form) {
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (status !== 'playing') return;

        if (input.toLowerCase().trim() === currentVerb.answer.toLowerCase()) {
            // Correct
            setScore(s => s + 1);
            setFeedback('correct');
            SoundManager.playMatch();
            loadNewVerb();
        } else {
            // Incorrect
            setFeedback('incorrect');
            SoundManager.playMiss();
            triggerShake();
        }
    };

    const handleRestart = () => {
        setScore(0);
        setTimeLeft(60);
        setStatus('playing');
        loadNewVerb();
        // Clear existing interval if any
        if (timerRef.current) clearInterval(timerRef.current);
        // Restart timer
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <GameLayout title="Conjugation Blitz">
            <div className="max-w-md mx-auto flex flex-col gap-6">

                {/* HUD */}
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 text-amber-400">
                        <Timer size={24} />
                        <span className={`text-2xl font-bold font-mono ${timeLeft < 10 ? 'animate-pulse text-red-500' : ''}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Zap size={24} />
                        <span className="text-2xl font-bold">{score}</span>
                    </div>
                </div>

                {/* Game Area */}
                {status === 'playing' && currentVerb && (
                    <Card className="p-8 text-center space-y-6 bg-slate-800/80 backdrop-blur border-indigo-500/20">
                        <div>
                            <span className="text-sm uppercase tracking-widest text-slate-400 block mb-2">{currentVerb.tense}</span>
                            <h2 className="text-4xl font-black text-white mb-4">{currentVerb.infinitive}</h2>
                            <div className="text-2xl text-indigo-300 font-medium">{currentVerb.pronoun} ...</div>
                        </div>

                        <form id="blitz-form" onSubmit={handleSubmit} className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className={`
                                    w-full bg-slate-900/50 border-2 rounded-xl px-4 py-3 text-center text-xl text-white outline-none transition-all
                                    ${feedback === 'incorrect' ? 'border-red-500' : 'border-slate-600 focus:border-indigo-500'}
                                `}
                                placeholder="Type conjugation..."
                                autoFocus
                            />
                        </form>
                        <p className="text-xs text-slate-500">Press Enter to submit</p>
                    </Card>
                )}

                {/* Game Over */}
                {status === 'finished' && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <Card className="p-8 text-center space-y-6 border-amber-500/30 bg-gradient-to-b from-slate-800 to-slate-900">
                            <Trophy size={64} className="mx-auto text-amber-400" />
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
                                <p className="text-slate-400">Final Score: <span className="text-white font-bold text-xl">{score}</span></p>
                            </div>
                            <Button onClick={handleRestart} className="w-full py-4 text-lg">
                                <RefreshCw className="mr-2" /> Play Again
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </div>
        </GameLayout>
    );
};

export default ConjugationBlitz;
