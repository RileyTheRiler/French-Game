import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { Button } from './ui/Button';

const SENTENCES = [
    { english: "I would like a coffee.", french: ["Je", "voudrais", "un", "café", "."] },
    { english: "Where is the train station?", french: ["Où", "est", "la", "gare", "?"] },
    { english: "I do not understand.", french: ["Je", "ne", "comprends", "pas", "."] },
    { english: "He eats an apple.", french: ["Il", "mange", "une", "pomme", "."] },
    { english: "It is very beautiful.", french: ["C'est", "très", "beau", "."] }
];

const WordTile = ({ word, onClick, variant = "default" }) => (
    <motion.button
        layoutId={`word-${word.id}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(word)}
        className={`
            font-bold px-5 py-3 rounded-xl shadow-lg transition-colors border-b-4 active:border-b-0 active:translate-y-1
            ${variant === 'selected'
                ? 'bg-indigo-500 text-white border-indigo-700 hover:bg-indigo-400'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }
        `}
    >
        {word.text}
    </motion.button>
);

const SentenceBuilder = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { addXP } = useProgress();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [availableWords, setAvailableWords] = useState([]);
    const [builtSentence, setBuiltSentence] = useState([]);
    const [status, setStatus] = useState('playing'); // 'playing', 'correct', 'wrong'
    const [feedback, setFeedback] = useState('');

    const targetSentenceData = SENTENCES[currentIndex];

    // Shuffle words on mount or index change
    useEffect(() => {
        if (!targetSentenceData) return;
        const words = [...targetSentenceData.french].sort(() => Math.random() - 0.5);
        setAvailableWords(words.map((w, i) => ({ id: `${currentIndex}-${i}`, text: w })));
        setBuiltSentence([]);
        setStatus('playing');
        setFeedback('');
    }, [currentIndex]);

    const handleWordClick = (word) => {
        if (status !== 'playing') return;
        SoundManager.playPop();
        setBuiltSentence(prev => [...prev, word]);
        setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    };

    const handleRemoveWord = (word) => {
        if (status !== 'playing') return;
        SoundManager.playPop();
        setAvailableWords(prev => [...prev, word]);
        setBuiltSentence(prev => prev.filter(w => w.id !== word.id));
    };

    const checkAnswer = () => {
        const currentString = builtSentence.map(w => w.text).join(' ');
        const targetString = targetSentenceData.french.join(' ');

        if (currentString === targetString) {
            setStatus('correct');
            setFeedback('Perfect! 🎉');
            SoundManager.playSuccess();
            addXP(20);
            setTimeout(() => {
                if (currentIndex < SENTENCES.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    SoundManager.playLevelUp();
                    setFeedback('All sentences completed!');
                }
            }, 1500);
        } else {
            setStatus('wrong');
            setFeedback('Not quite right.');
            SoundManager.playMiss();
            setTimeout(() => {
                setStatus('playing');
                setFeedback('');
            }, 1500);
        }
    };

    return (
        <GameLayout
            title="Sentence Builder"
            subtitle="Arrange the words to translate the sentence."
            onBack={onExit}
            headerRight={
                <div className="text-white/50 text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {SENTENCES.length}
                </div>
            }
        >
            <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-200px)]">
                {/* Target Sentence */}
                <Card className="mb-8 text-center p-8 bg-slate-800/50 border-white/5">
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-4">Translate this</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                        "{targetSentenceData?.english}"
                    </h2>
                </Card>

                {/* Construction Area */}
                <div className="flex-1">
                    <div className={`
                        min-h-[120px] bg-slate-900/50 rounded-3xl p-6 mb-8 flex flex-wrap gap-3 justify-center items-center border-2 border-dashed transition-colors
                        ${status === 'correct' ? 'border-green-500 bg-green-500/10' : ''}
                        ${status === 'wrong' ? 'border-red-500 bg-red-500/10' : 'border-white/10'}
                    `}>
                        <AnimatePresence mode="popLayout">
                            {builtSentence.length === 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-white/20 font-medium absolute pointer-events-none"
                                >
                                    Tap words to build your sentence...
                                </motion.p>
                            )}
                            {builtSentence.map((word) => (
                                <WordTile
                                    key={word.id}
                                    word={word}
                                    onClick={handleRemoveWord}
                                    variant="selected"
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Word Bank */}
                    <div className="p-6 bg-slate-900/30 rounded-3xl min-h-[100px]">
                        <div className="flex flex-wrap gap-3 justify-center">
                            <AnimatePresence mode="popLayout">
                                {availableWords.map((word) => (
                                    <WordTile
                                        key={word.id}
                                        word={word}
                                        onClick={handleWordClick}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="h-24 flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {status === 'correct' && (
                            <motion.div
                                key="correct"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="flex items-center gap-2 text-green-400 font-black text-2xl bg-green-400/10 px-6 py-3 rounded-full"
                            >
                                <Check size={28} strokeWidth={3} /> {feedback}
                            </motion.div>
                        )}

                        {status === 'wrong' && (
                            <motion.div
                                key="wrong"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="flex items-center gap-2 text-red-400 font-bold text-xl bg-red-400/10 px-6 py-3 rounded-full"
                            >
                                <X size={24} /> {feedback}
                            </motion.div>
                        )}

                        {status === 'playing' && (
                            <motion.div
                                key="playing"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                            >
                                <Button
                                    onClick={checkAnswer}
                                    disabled={builtSentence.length === 0}
                                    size="lg"
                                    className="px-12 rounded-full shadow-xl shadow-indigo-500/20"
                                >
                                    Check Answer
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </GameLayout>
    );
};

export default SentenceBuilder;
