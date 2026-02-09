import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Volume1, ArrowRight, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import { DICTATION_SENTENCES } from '../data/dictationSentences';
import confetti from 'canvas-confetti';

const DictationGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    const [currentSentence, setCurrentSentence] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('playing'); // playing, checking, success, error
    const [diff, setDiff] = useState(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Filter useful accents for the toolbar
    const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û'];

    const loadNewSentence = () => {
        // Simple random selection for now
        const randomSentence = DICTATION_SENTENCES[Math.floor(Math.random() * DICTATION_SENTENCES.length)];
        setCurrentSentence(randomSentence);
        setUserInput('');
        setStatus('playing');
        setDiff(null);
        // Clean speech synthesis queue
        window.speechSynthesis.cancel();
    };

    useEffect(() => {
        loadNewSentence();
    }, []);

    const playAudio = (rate = 1.0) => {
        if (!currentSentence || isPlayingAudio) return;

        setIsPlayingAudio(true);
        const utterance = new SpeechSynthesisUtterance(currentSentence.text);
        utterance.lang = 'fr-FR';
        utterance.rate = rate; // 1.0 is normal, 0.7 is slow

        // Try to get a decent french voice
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.includes('fr')) || voices[0];
        if (frenchVoice) utterance.voice = frenchVoice;

        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        window.speechSynthesis.speak(utterance);
    };

    // Ensure voices are loaded (chrome weirdness)
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    const handleSuccess = () => {
        setStatus('success');
        SoundManager.playSuccess();
        addXP(15);
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const handleError = (input) => {
        setStatus('error');
        SoundManager.playMiss();

        // Simple word-by-word diff calculation for display
        const targetWords = currentSentence.text.split(' ');
        const inputWords = input.split(' ');

        // This is a naive visual diff, but helpful enough
        // Ideally we'd use a diff library, but let's build a simple visualizer
        setDiff({ target: targetWords, input: inputWords });
    };

    const checkAnswer = () => {
        if (!userInput.trim()) return;

        const normalizedInput = userInput.trim(); // Keep case sensitivity for strict dictation? Or lenient?
        // Let's go with strict on accents/spelling, maybe lenient on end punctuation if we want to be nice.
        // For "Dictation", strict is usually better.

        if (normalizedInput === currentSentence.text) {
            handleSuccess();
        } else {
            handleError(normalizedInput);
        }
    };

    const insertAccent = (char) => {
        setUserInput(prev => prev + char);
        // Focus back on input (optional, might need ref)
    };

    return (
        <GameLayout
            title="La Dictée"
            subtitle="Listen carefully and write exactly what you hear."
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 min-h-[60vh]">

                {/* Audio Controls */}
                <Card className="w-full p-8 flex flex-col items-center justify-center gap-6 bg-slate-800/50 backdrop-blur">
                    <div className="flex gap-4">
                        <Button
                            onClick={() => playAudio(1.0)}
                            disabled={isPlayingAudio}
                            className="h-24 w-24 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
                        >
                            <Volume2 size={40} className={isPlayingAudio ? "animate-pulse" : ""} />
                        </Button>

                        <Button
                            onClick={() => playAudio(0.6)}
                            disabled={isPlayingAudio}
                            variant="secondary"
                            className="h-24 w-24 rounded-full flex flex-col items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600"
                        >
                            <Volume1 size={32} />
                            <span className="text-xs font-bold uppercase tracking-wider">Slow</span>
                        </Button>
                    </div>
                    <p className="text-slate-400 text-sm">Click the large button for normal speed, small for slow.</p>
                </Card>

                {/* Input Area */}
                <div className="w-full space-y-4">
                    <div className="relative">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type what you hear..."
                            disabled={status === 'success'}
                            className={`
                                w-full p-6 text-2xl bg-slate-900/80 border-2 rounded-2xl outline-none transition-all resize-none min-h-[160px] font-medium
                                ${status === 'error' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-700 focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)]'}
                                ${status === 'success' ? 'border-green-500/50 text-green-400' : 'text-white'}
                            `}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    checkAnswer();
                                }
                            }}
                        />

                        {/* Status Icon Overlay */}
                        <AnimatePresence>
                            {status === 'success' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute top-4 right-4 bg-green-500 rounded-full p-2 text-white shadow-lg"
                                >
                                    <Check size={24} strokeWidth={3} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Accent Toolbar */}
                    {status !== 'success' && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {ACCENTS.map(char => (
                                <button
                                    key={char}
                                    onClick={() => insertAccent(char)}
                                    className="h-10 w-10 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-lg text-lg font-medium text-white transition-colors"
                                >
                                    {char}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Feedback Area */}
                <AnimatePresence mode="wait">
                    {status === 'error' && diff && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full"
                        >
                            <Card className="bg-red-500/10 border-red-500/20 p-6 flex items-start gap-4">
                                <AlertCircle className="text-red-400 shrink-0 mt-1" />
                                <div className="space-y-2">
                                    <p className="text-red-200 font-medium">Not quite right. Compare your answer:</p>
                                    <div className="text-lg">
                                        <div className="text-slate-400 mb-1 text-sm uppercase tracking-wide">Target:</div>
                                        <p className="text-green-400 font-medium">{currentSentence.text}</p>
                                    </div>
                                    <div className="text-lg">
                                        <div className="text-slate-400 mb-1 text-sm uppercase tracking-wide">Your Input:</div>
                                        <p className="text-red-400 line-through decoration-red-500/50 decoration-2">{userInput}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <Card className="bg-green-500/10 border-green-500/20 p-6 text-center">
                                <h3 className="text-2xl font-bold text-green-400 mb-2">Parfait!</h3>
                                <p className="text-green-200/80">{currentSentence.translation}</p>
                                <div className="mt-4 pt-4 border-t border-green-500/20 text-sm text-green-300/60 font-mono">
                                    Grammar Focus: {currentSentence.grammar}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="w-full flex justify-end">
                    {status === 'playing' ? (
                        <Button onClick={checkAnswer} className="w-full md:w-auto text-lg px-8 py-6">
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            onClick={loadNewSentence}
                            className={`w-full md:w-auto text-lg px-8 py-6 ${status === 'success' ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                            {status === 'success' ? (
                                <>Next Sentence <ArrowRight className="ml-2" /></>
                            ) : (
                                <>Try Another <RefreshCw className="ml-2" /></>
                            )}
                        </Button>
                    )}
                </div>

            </div>
        </GameLayout>
    );
};

export default DictationGame;
