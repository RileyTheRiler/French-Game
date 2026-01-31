import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Timer, CheckCircle, AlertOctagon } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';

// Mock Data - In real app, import from verb conjugation data
const VERB_DATA = [
    { infinitive: 'Avoir', tense: 'Présent', pronoun: 'Tu', answer: 'as' },
    { infinitive: 'Être', tense: 'Présent', pronoun: 'Nous', answer: 'sommes' },
    { infinitive: 'Aller', tense: 'Futur', pronoun: 'Il', answer: 'ira' },
    { infinitive: 'Faire', tense: 'Imparfait', pronoun: 'Vous', answer: 'faisiez' },
    { infinitive: 'Manger', tense: 'Passé Composé', pronoun: 'Elle', answer: 'a mangé' }
];

const PRONOUNS = ['Je', 'Tu', 'Il/Elle', 'Nous', 'Vous', 'Ils/Elles'];
const TENSES = ['Présent', 'Passé Composé', 'Imparfait', 'Futur Simple'];

const ConjugationBlitz = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [currentVerb, setCurrentVerb] = useState(null);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('waiting'); // waiting, playing, finished
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'

    const timerRef = useRef(null);
    const inputRef = useRef(null);
    const scoreRef = useRef(0);

    const startGame = () => {
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(60);
        setStatus('playing');
        generateQuestion();

        if (inputRef.current) inputRef.current.focus();
    };

    const endGame = () => {
        clearInterval(timerRef.current);
        setStatus('finished');
        SoundManager.playLevelUp(); // or some generic finish sound

        // Calculate total XP
        const baseXP = scoreRef.current * 2;
        addXP(baseXP);
    };

    useEffect(() => {
        if (status === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const generateQuestion = () => {
        const verb = VERB_DATA[Math.floor(Math.random() * VERB_DATA.length)];
        // Add random variation if data allows, for now just static list
        setCurrentVerb(verb);
        setInput('');
        setFeedback(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (status !== 'playing') return;

        if (input.trim().toLowerCase() === currentVerb.answer.toLowerCase()) {
            // Correct
            const newScore = score + 1;
            setScore(newScore);
            scoreRef.current = newScore;
            setFeedback('correct');
            SoundManager.playSuccess();

            // Add time bonus every 5 correct?
            if (newScore % 5 === 0) {
                setTimeLeft(t => Math.min(t + 5, 60));
            }

            setTimeout(generateQuestion, 300);
        } else {
            // Wrong
            setFeedback('wrong');
            SoundManager.playMiss();
            triggerShake();
        }
    };

    const [isShaking, setIsShaking] = useState(false);
    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    return (
        <GameLayout
            title="Conjugation Blitz"
            subtitle="Race against the clock to conjugate verbs!"
            onBack={() => navigate('/')}
        >
            <div className="max-w-xl mx-auto flex flex-col gap-6 min-h-[60vh]">

                {status === 'waiting' && (
                    <Card className="p-8 text-center space-y-6">
                        <Zap size={64} className="mx-auto text-yellow-400" />
                        <h2 className="text-2xl font-bold text-white">Ready for the challenge?</h2>
                        <p className="text-slate-400">Conjugate as many verbs as possible in 60 seconds.</p>
                        <Button onClick={startGame} className="w-full py-4 text-lg">Start Blitz</Button>
                    </Card>
                )}

                {status === 'finished' && (
                    <Card className="p-8 text-center space-y-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-white">Time's Up!</h2>
                        <div className="text-6xl font-black text-indigo-400">{score}</div>
                        <p className="text-slate-400">Verbs Conjugated</p>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => navigate('/')}>Back</Button>
                            <Button onClick={startGame}>Play Again</Button>
                        </div>
                    </Card>
                )}

                {status === 'playing' && currentVerb && (
                    <div className="space-y-6">
                        {/* HUD */}
                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Zap size={20} />
                                <span className="font-bold text-xl">{score}</span>
                            </div>
                            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                                <Timer size={20} />
                                {timeLeft}s
                            </div>
                        </div>

                        {/* Question Card */}
                        <Card className={`p-8 text-center border-2 transition-colors ${
                            feedback === 'correct' ? 'border-green-500 bg-green-500/10' :
                            feedback === 'wrong' ? 'border-red-500 bg-red-500/10' :
                            'border-indigo-500/30'
                        } ${isShaking ? 'animate-shake' : ''}`}>

                            <div className="space-y-2 mb-8">
                                <div className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                                    {currentVerb.infinitive} • {currentVerb.tense}
                                </div>
                                <div className="text-4xl font-black text-white">
                                    {currentVerb.pronoun}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-slate-950/50 border-b-4 border-slate-700 text-center text-3xl font-bold p-4 focus:outline-none focus:border-indigo-500 text-white rounded-lg transition-colors placeholder:text-slate-700"
                                    placeholder="..."
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                />
                            </form>

                        </Card>

                        <p className="text-center text-slate-500 text-sm">Press Enter to submit</p>
                    </div>
                )}

            </div>
        </GameLayout>
    );
};

export default ConjugationBlitz;
