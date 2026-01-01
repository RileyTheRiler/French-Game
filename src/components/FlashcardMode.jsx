import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, RotateCcw } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { speak } from '../utils/audio';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';

import { useNavigate } from 'react-router-dom';

const FlashcardMode = ({ mode = 'standard' }) => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { getDueWords, updateWordProgress, vocabulary } = useVocabulary();

    const getStudyQueue = () => {
        let pool = vocabulary;
        if (mode === 'standard') {
            pool = [...vocabulary].sort((a, b) => a.level - b.level);
        } else if (mode === 'mix') {
            pool = [...vocabulary].sort(() => Math.random() - 0.5);
        }
        return pool.slice(0, 10); // Smaller sets for better focus
    };

    const [queue, setQueue] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        setQueue(getStudyQueue());
    }, [mode]);

    const currentWord = queue[currentCardIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped && currentWord) {
            speak(currentWord.french);
        }
    };

    const handleGrading = (success) => {
        if (!currentWord) return;
        updateWordProgress(currentWord.id, success);
        setIsFlipped(false);
        if (currentCardIndex < queue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            setSessionComplete(true);
        }
    };

    if (!currentWord || sessionComplete) {
        return (
            <GameLayout title="Session Complete">
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="mb-8 p-6 bg-emerald-500/20 rounded-full"
                    >
                        <Check size={80} className="text-emerald-400" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 title-gradient">Excellent Work!</h2>
                    <p className="text-slate-400 mb-8 max-w-md">
                        You've completed your study session. Your spaced repetition stats have been updated.
                    </p>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={() => {
                            setQueue(getStudyQueue());
                            setCurrentCardIndex(0);
                            setSessionComplete(false);
                        }}>
                            <RotateCcw size={20} /> Review Again
                        </Button>
                        <Button variant="ghost" size="lg" onClick={onExit}>
                            Return to Menu
                        </Button>
                    </div>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title={mode === 'mix' ? "Daily Mix" : "Flashcards"}
            subtitle="Practice your vocabulary with spaced repetition."
            onBack={onExit}
            headerRight={
                <Badge variant="primary" className="text-lg py-1 px-4">
                    {currentCardIndex + 1} / {queue.length}
                </Badge>
            }
        >
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">

                {/* 3D Card Container */}
                <div
                    className="relative w-full max-w-lg aspect-[4/3] cursor-pointer"
                    style={{ perspective: "2000px" }}
                    onClick={handleFlip}
                >
                    <motion.div
                        className="w-full h-full relative"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* Front */}
                        <Card
                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center bg-slate-900 border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-[40px] overflow-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.15),_transparent)]" />
                            <Badge variant="primary" className="absolute top-8 left-8 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold px-4 py-1">Lvl {currentWord.level}</Badge>
                            <h2 className="text-7xl font-black text-white px-12 text-center drop-shadow-2xl lowercase tracking-tight">{currentWord.french}</h2>
                            <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-40">
                                <p className="text-slate-500 text-xs font-black tracking-[0.3em] uppercase">Click to Reveal</p>
                                <div className="w-12 h-1 bg-white/10 rounded-full" />
                            </div>
                        </Card>

                        {/* Back */}
                        <Card
                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center bg-indigo-950 border-white/20 shadow-2xl rounded-[40px] overflow-hidden"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                            <h2 className="text-6xl font-black text-white px-12 text-center mb-8 drop-shadow-xl">{currentWord.english}</h2>
                            <Button
                                variant="secondary"
                                className="rounded-2xl p-6 h-20 w-20 bg-white/5 border-white/10 hover:bg-white/10 group overflow-hidden"
                                onClick={(e) => { e.stopPropagation(); speak(currentWord.french); }}
                            >
                                <Volume2 size={36} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            </Button>
                        </Card>
                    </motion.div>
                </div>

                {/* Grading Controls */}
                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-6 mt-12"
                        >
                            <Button
                                variant="danger"
                                size="lg"
                                className="px-12 py-6 rounded-2xl"
                                onClick={() => handleGrading(false)}
                            >
                                <X className="mr-2" /> Hard
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                className="px-12 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => handleGrading(true)}
                            >
                                <Check className="mr-2" /> Easy
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default FlashcardMode;
