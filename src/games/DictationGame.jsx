import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, CheckCircle, XCircle, RotateCcw, Play, HelpCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useTranslation } from 'react-i18next';
import { DICTATION_SENTENCES } from '../data/dictationSentences';
import { GameLayout } from '../components/layout/GameLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { compareText } from '../utils/textMatching';

const DictationGame = () => {
    const { t } = useTranslation();
    const { addXP, addCoins } = useProgress();
    const [currentSentence, setCurrentSentence] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('playing'); // playing, checking, correct, incorrect
    const [diff, setDiff] = useState(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    const { startListening, stopListening, isListening, transcript, resetTranscript } = useSpeechRecognition();

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
        const utterance = new SpeechSynthesisUtterance(currentSentence.french);
        utterance.lang = 'fr-FR';
        utterance.rate = rate;

        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        window.speechSynthesis.speak(utterance);
    };

    const handleCheck = () => {
        if (!userInput.trim()) return;

        const result = compareText(userInput, currentSentence.french);
        setDiff(result.diff);

        if (result.isMatch) {
            setStatus('correct');
            addXP(20);
            addCoins(5);
            // Play success sound
        } else {
            setStatus('incorrect');
        }
    };

    const handleTranscriptUpdate = (newTranscript) => {
        setUserInput(newTranscript);
    };

    useEffect(() => {
        if (transcript) {
            handleTranscriptUpdate(transcript);
        }
    }, [transcript]);

    return (
        <GameLayout
            title="La Dictée"
            subtitle="Listen and write exactly what you hear"
            onExit={() => {}}
        >
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

                {/* Audio Controls */}
                <Card className="p-8 flex flex-col items-center gap-6 bg-indigo-900/20 border-indigo-500/30">
                    <div className="flex gap-4">
                        <Button
                            size="lg"
                            onClick={() => playAudio(1.0)}
                            disabled={isPlayingAudio}
                            className="h-24 w-24 rounded-full"
                        >
                            <Volume2 size={48} />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => playAudio(0.7)}
                            disabled={isPlayingAudio}
                            title="Slow Speed"
                            className="absolute top-4 right-4"
                        >
                            <ClockIcon size={20} />
                        </Button>
                    </div>
                    <p className="text-slate-400 text-sm">Click to listen. Type what you hear.</p>
                </Card>

                {/* Input Area */}
                <div className="relative">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Écrivez ici..."
                        className="w-full h-32 bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 text-xl text-white focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                        disabled={status !== 'playing'}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button
                            size="icon"
                            variant={isListening ? 'danger' : 'secondary'}
                            onClick={isListening ? stopListening : startListening}
                            className="rounded-full"
                        >
                            <Mic className={isListening ? 'animate-pulse' : ''} />
                        </Button>
                    </div>
                </div>

                {/* Feedback Area */}
                <AnimatePresence mode="wait">
                    {status === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3"
                        >
                            <CheckCircle className="text-emerald-400" />
                            <div>
                                <p className="font-bold text-emerald-100">Parfait !</p>
                                <p className="text-sm text-emerald-200">{currentSentence.translation}</p>
                            </div>
                            <Button className="ml-auto" onClick={loadNewSentence}>Next</Button>
                        </motion.div>
                    )}

                    {status === 'incorrect' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <XCircle className="text-red-400" />
                                <p className="font-bold text-red-100">Pas tout à fait...</p>
                            </div>

                            {/* Diff Display would go here */}
                            <div className="p-3 bg-black/30 rounded-lg font-mono text-lg mb-4">
                                {diff && diff.map((part, i) => (
                                    <span
                                        key={i}
                                        className={part.added ? 'bg-red-500/50' : part.removed ? 'bg-emerald-500/50' : ''}
                                    >
                                        {part.value}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setStatus('playing')}>Try Again</Button>
                                <Button onClick={loadNewSentence}>Skip</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === 'playing' && (
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleCheck}
                        disabled={!userInput.trim()}
                    >
                        Vérifier
                    </Button>
                )}
            </div>
        </GameLayout>
    );
};

const ClockIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default DictationGame;
