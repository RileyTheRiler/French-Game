import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Check, X, RotateCcw, Award, Play } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { speak } from '../utils/audio';
import SoundManager from '../utils/SoundManager';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import { calculateRewards } from '../utils/rewardSystem';

const PronunciationCoach = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { vocabulary } = useVocabulary();
    const { addXP, addCoins, updateDailyStat, incrementStat } = useProgress();

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'listening', 'checking', 'success', 'fail'
    const [sessionComplete, setSessionComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);
    const [successCount, setSuccessCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

    const recognitionRef = useRef(null);
    const wordsToPractice = useMemo(() => {
        return [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 5);
    }, [vocabulary]);

    const currentWord = wordsToPractice[currentWordIndex];

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'fr-FR';
            recognitionRef.current.interimResults = false;
            recognitionRef.current.maxAlternatives = 1;

            recognitionRef.current.onresult = (event) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
                checkPronunciation(result);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                setStatus('idle');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setStatus('listening');
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const checkPronunciation = (heard) => {
        setStatus('checking');
        const target = currentWord.french.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const spoken = heard.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        setAttempts(prev => prev + 1);

        setTimeout(() => {
            if (spoken.includes(target) || target.includes(spoken)) {
                setStatus('success');
                SoundManager.playSuccess();
                setTotalXP(prev => prev + 20);
                setSuccessCount(prev => {
                    const next = prev + 1;
                    updateDailyStat('dailyStreak', next, 'max');
                    return next;
                });
            } else {
                setStatus('fail');
                SoundManager.playMiss();
            }
        }, 800);
    };

    const handleNext = () => {
        if (currentWordIndex < wordsToPractice.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setStatus('idle');
            setTranscript('');
        } else {
            const reward = calculateRewards('pronunciation', {
                successes: successCount,
                total: wordsToPractice.length
            });
            setSessionReward(reward);
            addXP(reward.xp);
            addCoins(reward.coins);
            incrementStat('pronunciationPractices', successCount);
            setSessionComplete(true);
            SoundManager.playLevelUp();
        }
    };

    const playExample = () => {
        speak(currentWord.french);
    };

    if (vocabulary.length === 0) {
        return <GameLayout title="Pronunciation Coach" onBack={onExit}><div className="p-8 text-center text-slate-400">Add words to your vocabulary first!</div></GameLayout>;
    }

    if (sessionComplete) {
        return (
            <GameLayout title="Training Complete" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-8 p-8 bg-indigo-500/20 rounded-full">
                        <Award size={80} className="text-indigo-400" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 title-gradient">Fluency Boosted!</h2>
                    <p className="text-slate-400 mb-8 max-w-md text-lg">Your pronunciation is getting sharper every day.</p>
                    {sessionReward && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-12 w-full max-w-xs flex flex-col items-center shadow-2xl">
                            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Rewards</span>
                            <div className="flex gap-6">
                                <div className="text-center">
                                    <span className="text-3xl font-black text-indigo-400">+{sessionReward.xp}</span>
                                    <p className="text-xs text-indigo-200">XP</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-3xl font-black text-amber-400">+{sessionReward.coins}</span>
                                    <p className="text-xs text-amber-200">Coins</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <Button size="lg" onClick={onExit} className="px-12 py-4">Return to Hub</Button>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title="Pronunciation Coach"
            subtitle="Listen and repeat to master French phonetics."
            onBack={onExit}
            headerRight={<Badge variant="primary" className="text-lg py-1 px-4">{currentWordIndex + 1} / {wordsToPractice.length}</Badge>}
        >
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[calc(100vh-200px)]">

                <Card className="w-full max-w-2xl p-12 bg-slate-900 border-white/10 shadow-2xl flex flex-col items-center text-center">
                    <Badge variant="outline" className="mb-6 text-slate-500 border-white/10">Target Word</Badge>
                    <h2 className="text-7xl font-black text-white mb-4 lowercase">{currentWord.french}</h2>
                    <p className="text-2xl text-slate-400 mb-8 italic">{currentWord.english}</p>

                    <div className="flex gap-4 mb-12">
                        <Button variant="secondary" size="lg" onClick={playExample} className="rounded-2xl px-6 py-4 flex items-center gap-3 bg-white/5 border-white/10 hover:bg-white/10">
                            <Volume2 size={24} className="text-indigo-400" />
                            Listen Example
                        </Button>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <AnimatePresence>
                            {isListening && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute inset-0 bg-indigo-500/20 rounded-full"
                                />
                            )}
                        </AnimatePresence>

                        <Button
                            disabled={status === 'checking' || status === 'success'}
                            onClick={isListening ? stopListening : startListening}
                            className={`w-32 h-32 rounded-full shadow-2xl shadow-indigo-500/20 z-10 p-0 flex items-center justify-center transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 scale-110' :
                                status === 'success' ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                                }`}
                        >
                            {isListening ? <MicOff size={48} /> : status === 'success' ? <Check size={48} /> : <Mic size={48} />}
                        </Button>
                    </div>

                    <div className="mt-12 h-20 flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            {status === 'listening' && (
                                <motion.p key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-indigo-400 font-bold text-xl animate-pulse">
                                    Listening... Parlez maintenant !
                                </motion.p>
                            )}
                            {status === 'checking' && (
                                <motion.p key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-400 font-bold text-xl">
                                    Analyzing your pronunciation...
                                </motion.p>
                            )}
                            {status === 'success' && (
                                <motion.div key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                                    <p className="text-emerald-400 font-bold text-2xl flex items-center gap-2">
                                        <Check size={24} /> Perfect! "{transcript}"
                                    </p>
                                    <Button className="mt-4" onClick={handleNext}>Next Word</Button>
                                </motion.div>
                            )}
                            {status === 'fail' && (
                                <motion.div key="fail" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                                    <p className="text-red-400 font-bold text-xl flex items-center gap-2">
                                        <X size={24} /> Hear: "{transcript || '...'}"
                                    </p>
                                    <Button variant="ghost" className="mt-2 text-slate-400" onClick={() => setStatus('idle')}>Try Again</Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

            </div>
        </GameLayout>
    );
};

export default PronunciationCoach;
