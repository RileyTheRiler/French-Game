import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { Timer, Zap, Trophy, RotateCcw, ArrowRight, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import { VERB_DATA, PRONOUNS, TENSES } from '../data/verbData';
// eslint-disable-next-line no-unused-vars
import confetti from 'canvas-confetti';

const ConjugationBlitz = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    // Game State
    const [status, setStatus] = useState('menu'); // menu, playing, finished
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [results, setResults] = useState([]); // Array of { challenge, input, correct }

    const inputRef = useRef(null);
    const timerRef = useRef(null);

    // Helpers
    const getRandomChallenge = () => {
        const verb = VERB_DATA[Math.floor(Math.random() * VERB_DATA.length)];
        const tense = TENSES[Math.floor(Math.random() * TENSES.length)];
        const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];

        return {
            verb,
            tense,
            pronoun,
            answer: verb.conjugations[tense.id][pronoun]
        };
    };

    const startGame = () => {
        setScore(0);
        setStreak(0);
        setResults([]);
        setTimeLeft(60);
        setStatus('playing');
        loadNextChallenge();
    };

    const loadNextChallenge = () => {
        setCurrentChallenge(getRandomChallenge());
        setUserInput('');
        if (inputRef.current) inputRef.current.focus();
    };

    // Timer Logic
    useEffect(() => {
        if (status === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    // End Game Check
    useEffect(() => {
        if (status === 'playing' && timeLeft <= 0) {
            clearInterval(timerRef.current);
            // Use setTimeout to avoid synchronous state update in effect warning
            setTimeout(() => {
                setStatus('finished');
                SoundManager.playLevelUp();
                const baseXP = score * 2;
                addXP(baseXP);
            }, 0);
        }
    }, [timeLeft, status, score, addXP]);

    const handleSubmit = (e) => {
        e.preventDefault();
        checkAnswer();
    };

    const checkAnswer = () => {
        const normalizedInput = userInput.trim().toLowerCase();
        const correctAnswer = currentChallenge.answer.toLowerCase();

        const isCorrect = normalizedInput === correctAnswer;

        // Record result
        setResults(prev => [...prev, {
            challenge: currentChallenge,
            userAnswer: normalizedInput,
            isCorrect
        }]);

        if (isCorrect) {
            SoundManager.playSuccess();
            setScore(s => s + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak % 5 === 0) SoundManager.playLevelUp(); // Mini milestone sound?
                return newStreak;
            });
            // Add slight time bonus?
            setTimeLeft(t => Math.min(t + 2, 60)); // +2 seconds cap at 60
        } else {
            SoundManager.playMiss();
            setStreak(0);
            // Shake effect handled by UI state potentially, but for speed we just move on
        }

        loadNextChallenge();
    };

    return (
        <GameLayout
            title="Conjugation Blitz"
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto min-h-[60vh] flex flex-col">

                {status === 'menu' && (
                    <Card className="flex flex-col items-center p-12 text-center space-y-8 my-auto">
                        <div className="h-24 w-24 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Zap size={48} className="text-white fill-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Ready for the Blitz?</h2>
                            <p className="text-slate-400">Conjugate as many verbs as you can in 60 seconds.</p>
                        </div>
                        <Button size="lg" onClick={startGame} className="w-48 text-lg font-bold">
                            START GAME
                        </Button>
                    </Card>
                )}

                {status === 'playing' && currentChallenge && (
                    <div className="flex flex-col items-center justify-center flex-grow gap-8">

                        {/* HUD */}
                        <div className="flex w-full justify-between items-center text-white text-xl font-bold px-4">
                            <div className="flex items-center gap-2 text-amber-400">
                                <Timer />
                                <span>{timeLeft}s</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-400">
                                <Trophy />
                                <span>{score}</span>
                            </div>
                        </div>

                        {/* Card */}
                        <motion.div
                            key={currentChallenge.verb.infinitive + currentChallenge.pronoun} // Forced re-render anime
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full"
                        >
                            <Card className="p-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-red-500" />

                                <div className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-6">
                                    {currentChallenge.tense.label}
                                </div>

                                <div className="flex flex-col gap-4 mb-8">
                                    <h3 className="text-4xl font-black text-white">
                                        {currentChallenge.verb.infinitive}
                                    </h3>
                                    <p className="text-slate-500 italic">{currentChallenge.verb.translation}</p>
                                </div>

                                <div className="flex items-end justify-center gap-4 text-3xl font-bold text-white mb-8">
                                    <span className="text-slate-400 pb-1">{currentChallenge.pronoun}</span>
                                    <div className="border-b-4 border-white/20 min-w-[200px] pb-1">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            className="bg-transparent text-center w-full outline-none text-indigo-300 placeholder-indigo-300/30"
                                            placeholder="..."
                                            autoFocus
                                            spellCheck={false}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSubmit} className="w-full py-4 text-lg">
                                    Submit (Enter)
                                </Button>
                            </Card>
                        </motion.div>

                        {/* Streak Indicator */}
                        {streak > 1 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-amber-500 font-bold bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20"
                            >
                                🔥 {streak} Streak! (+{Math.min(streak, 5)}s bonus)
                            </motion.div>
                        )}
                    </div>
                )}

                {status === 'finished' && (
                    <Card className="flex flex-col items-center p-8 text-center space-y-6 my-auto max-h-[80vh] overflow-hidden">
                        <div className="shrink-0 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
                            <p className="text-slate-400">Final Score: <span className="text-indigo-400 text-2xl font-bold">{score}</span></p>
                        </div>

                        <div className="w-full bg-slate-800/50 rounded-xl p-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                            <h4 className="text-sm uppercase tracking-wider text-slate-500 mb-4 sticky top-0 bg-slate-900/90 py-2">Mistakes Review</h4>
                            <div className="space-y-3">
                                {results.filter(r => !r.isCorrect).length === 0 ? (
                                    <p className="text-green-400 py-4">Perfect game! No mistakes.</p>
                                ) : (
                                    results.filter(r => !r.isCorrect).map((res, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-slate-700/50 pb-2 text-sm">
                                            <div className="text-left">
                                                <div className="text-slate-300 font-bold">
                                                    {res.challenge.pronoun} {res.challenge.verb.infinitive}
                                                </div>
                                                <div className="text-xs text-slate-500">{res.challenge.tense.label}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-red-400 line-through decoration-red-500/50">{res.userAnswer || '(empty)'}</div>
                                                <div className="text-green-400 font-bold">{res.challenge.answer}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 w-full pt-4 shrink-0">
                            <Button variant="ghost" className="flex-1" onClick={() => navigate('/')}>Exit</Button>
                            <Button className="flex-1" onClick={startGame}>Play Again</Button>
                        </div>
                    </Card>
                )}

                {/* Hidden submit for the form behavior if needed inside playing status */}
                {status === 'playing' && (
                    <form onSubmit={handleSubmit} className="hidden" />
                )}

            </div>
        </GameLayout>
    );
};

export default ConjugationBlitz;
