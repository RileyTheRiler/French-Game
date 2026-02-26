import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, RotateCcw, Award, Volume2, Globe, Brain, Zap, MessageCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { speak } from '../utils/audio';
import { scorePronunciation } from '../utils/phonetics';
import { analyzeProsody } from '../utils/prosody'; // New utility
import SoundManager from '../utils/SoundManager';
import { useVocabulary } from '../context/VocabularyContext';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import AudioVisualizer from './Pronunciation/AudioVisualizer';
import MouthShapeVisualizer from './Pronunciation/MouthShapeVisualizer';

const PronunciationCoach = () => {
    const { addXP, addCoins } = useProgress();
    const { getPracticeQueue, markWordSeen, updateWordProgress } = useVocabulary();

    // State
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [accuracy, setAccuracy] = useState(0); // Track accuracy for rewards

    // Refs
    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);

    const currentWord = queue[currentIndex];

    // Initialize
    useEffect(() => {
        const words = getPracticeQueue('pronunciation', 10);
        setQueue(words);

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'fr-FR';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = handleSpeechResult;
            recognitionRef.current.onend = () => setIsRecording(false);
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [getPracticeQueue]);

    const startRecording = async () => {
        try {
            setAnalysis(null);
            setFeedback('');
            setShowCelebration(false);

            // Audio Context for Visualization
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            analyserRef.current = audioContextRef.current.createAnalyser();
            source.connect(analyserRef.current);

            setIsRecording(true);
            recognitionRef.current?.start();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setFeedback("Microphone access denied. Please check permissions.");
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        recognitionRef.current?.stop();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const handleSpeechResult = (event) => {
        const transcript = event.results[0][0].transcript;
        checkPronunciation(transcript);
    };

    const checkPronunciation = (transcript) => {
        if (!currentWord) return;

        // Phonetic analysis
        const result = scorePronunciation(currentWord.french, transcript);
        setAnalysis(result);

        // Prosody analysis (simulated or real if audio blob exists)
        const prosody = analyzeProsody(null); // Passing null for now as we don't have the blob buffer here yet

        const finalScore = Math.round(result.accuracy);
        setScore(finalScore);
        setAccuracy(finalScore);

        if (finalScore >= 80) {
            SoundManager.playSuccess();
            setShowCelebration(true);
            setFeedback("Excellent! Your accent is spot on.");
            addXP(15);
            addCoins(5);
            updateWordProgress(currentWord.id, 'good');
        } else if (finalScore >= 50) {
            SoundManager.playMatch(); // Neutral/Good sound
            setFeedback("Good effort! Watch your intonation.");
            addXP(5);
            updateWordProgress(currentWord.id, 'ok');
        } else {
            SoundManager.playMiss();
            setFeedback("Let's try that again. Listen closely.");
            updateWordProgress(currentWord.id, 'again');
        }
    };

    const nextWord = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnalysis(null);
            setScore(0);
            setFeedback('');
            setShowCelebration(false);
        } else {
            // End of session logic could go here
            setFeedback("Session Complete! Great work.");
        }
    };

    if (!currentWord) return (
        <GameLayout title="Pronunciation Coach">
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-400">Loading practice queue...</p>
            </div>
        </GameLayout>
    );

    return (
        <GameLayout
            title="Pronunciation Coach"
            subtitle="Master your French accent with real-time feedback"
        >
            <div className="max-w-2xl mx-auto space-y-8 p-4">

                {/* Main Card */}
                <div className="relative bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">

                    {/* Visualizer Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        {isRecording && analyserRef.current && (
                            <AudioVisualizer analyser={analyserRef.current} />
                        )}
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                        <Badge variant="outline" className="mb-2">
                            {currentWord.category || 'General Vocabulary'}
                        </Badge>

                        <h2 className="text-5xl font-black text-white tracking-tight mb-2">
                            {currentWord.french}
                        </h2>

                        <p className="text-xl text-slate-400 font-light">
                            {currentWord.english}
                        </p>

                        {/* Mouth Shape Guide */}
                        <div className="my-4">
                            <MouthShapeVisualizer phoneme={currentWord.french.slice(0, 2)} />
                            <p className="text-xs text-slate-500 mt-2">Mouth Shape Guide</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-8">
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => speak(currentWord.french)}
                                className="rounded-full w-16 h-16 flex items-center justify-center"
                            >
                                <Volume2 size={24} />
                            </Button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                    isRecording
                                    ? 'bg-red-500 shadow-red-500/50 animate-pulse'
                                    : 'bg-indigo-500 shadow-indigo-500/50 hover:bg-indigo-400'
                                }`}
                            >
                                <Mic size={40} className="text-white" />
                            </motion.button>

                            {analysis && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={nextWord}
                                    className="rounded-full w-16 h-16 flex items-center justify-center"
                                >
                                    <Play size={24} />
                                </Button>
                            )}
                        </div>

                        {isRecording && (
                            <p className="text-red-400 text-sm font-medium animate-pulse">
                                Listening... Speak now
                            </p>
                        )}
                    </div>
                </div>

                {/* Feedback Section */}
                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Analysis Result</h3>
                                    <p className="text-slate-400 text-sm">{feedback}</p>
                                </div>
                                <div className={`text-4xl font-black ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {score}%
                                </div>
                            </div>

                            {/* Phoneme Breakdown */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {analysis.phonemes?.map((p, i) => (
                                    <span
                                        key={i}
                                        className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                            p.correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                        }`}
                                    >
                                        {p.char}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    );
};

export default PronunciationCoach;
