import React, { useState, useEffect, useRef } from 'react';
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
        onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(word);
            }
        }}
        className={`
            font-bold px-5 py-3 rounded-xl shadow-lg transition-colors border-b-4 active:border-b-0 active:translate-y-1
            ${variant === 'selected'
                ? 'bg-indigo-500 text-white border-indigo-700 hover:bg-indigo-400'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }
        `}
        aria-pressed={variant === 'selected'}
        aria-label={`${variant === 'selected' ? 'Remove' : 'Add'} word ${word.text}`}
    >
        {word.text}
    </motion.button>
);

import { generateSentenceBuilder } from '../systems/ExerciseGenerator';
import { AlertTriangle, Info } from 'lucide-react';

const SentenceBuilder = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { addXP, difficultySettings } = useProgress();

    // Hint delay configuration
    const hintDelay = difficultySettings?.hintDelay ?? 8;
    const warningTimerRef = useRef(null);

    // Game State
    const [puzzle, setPuzzle] = useState(null);
    const [availableWords, setAvailableWords] = useState([]);
    const [builtSentence, setBuiltSentence] = useState([]);
    const [status, setStatus] = useState('loading'); // 'loading', 'playing', 'correct', 'wrong'
    const [feedback, setFeedback] = useState('');
    const [grammarWarnings, setGrammarWarnings] = useState([]);
    const [visibleGrammarWarnings, setVisibleGrammarWarnings] = useState([]); // Delayed display
    const [questionCount, setQuestionCount] = useState(0);
    const MAX_QUESTIONS = 5;

    // Load initial puzzle
    useEffect(() => {
        loadNextPuzzle();
    }, []);

    // Check grammar rules in real-time (internal)
    useEffect(() => {
        const warnings = [];

        // Simple Agreement Check logic
        for (let i = 0; i < builtSentence.length - 1; i++) {
            const current = builtSentence[i];
            const next = builtSentence[i + 1];

            // Check 1: Article - Noun Gender Agreement
            // E.g. "Le" (m) + "Pomme" (f)
            if (current.metadata?.type === 'expression' || current.metadata?.type === 'particle') {
                if (current.cleanText.toLowerCase() === 'le' && next.metadata?.gender === 'f') {
                    warnings.push(`Mismatch: 'Le' is masculine, but '${next.cleanText}' is feminine.`);
                }
                if (current.cleanText.toLowerCase() === 'la' && next.metadata?.gender === 'm') {
                    warnings.push(`Mismatch: 'La' is feminine, but '${next.cleanText}' is masculine.`);
                }
                if (current.cleanText.toLowerCase() === 'un' && next.metadata?.gender === 'f') {
                    warnings.push(`Mismatch: 'Un' is masculine, but '${next.cleanText}' is feminine.`);
                }
                if (current.cleanText.toLowerCase() === 'une' && next.metadata?.gender === 'm') {
                    warnings.push(`Mismatch: 'Une' is feminine, but '${next.cleanText}' is masculine.`);
                }
            }
        }
        setGrammarWarnings(warnings);
    }, [builtSentence]);

    // Delay grammar warning visibility to encourage thinking
    useEffect(() => {
        // Clear any pending timer
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }

        // If no warnings or instant mode, update immediately
        if (grammarWarnings.length === 0 || hintDelay === 0) {
            setVisibleGrammarWarnings(grammarWarnings);
            return;
        }

        // Delay showing warnings to let user think
        warningTimerRef.current = setTimeout(() => {
            setVisibleGrammarWarnings(grammarWarnings);
        }, hintDelay * 1000);

        return () => {
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
        };
    }, [grammarWarnings, hintDelay]);

    const loadNextPuzzle = () => {
        const newPuzzle = generateSentenceBuilder(1);
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            setAvailableWords(newPuzzle.scrambled);
            setBuiltSentence([]);
            setStatus('playing');
            setFeedback('');
            setGrammarWarnings([]);
        } else {
            // Fallback if generator fails
            navigate('/');
        }
    };

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
        // Compare loosely (ignore punctuation for user sanity if needed, but builder usually exact)
        // Our generator provides exact "targetFrench".

        if (currentString === puzzle.targetFrench) {
            setStatus('correct');
            setFeedback('Perfect! 🎉');
            SoundManager.playSuccess();
            addXP(20);

            setTimeout(() => {
                if (questionCount < MAX_QUESTIONS - 1) {
                    setQuestionCount(prev => prev + 1);
                    loadNextPuzzle();
                } else {
                    SoundManager.playLevelUp();
                    setFeedback('All sentences completed!');
                    setTimeout(onExit, 2000);
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

    if (!puzzle) return <div className="text-white text-center p-10">Loading...</div>;

    return (
        <GameLayout
            title="Sentence Builder"
            subtitle="Arrange the words to translate the sentence."
            onBack={onExit}
            headerRight={
                <div className="text-white/50 text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                    {questionCount + 1} / {MAX_QUESTIONS}
                </div>
            }
        >
            <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-200px)]">
                {/* Target Sentence */}
                <Card className="mb-8 text-center p-8 bg-slate-800/50 border-white/5" role="region" aria-label="Sentence prompt">
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-4">Translate this</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                        "{puzzle.targetEnglish}"
                    </h2>
                </Card>

                {/* Construction Area */}
                <div className="flex-1 relative">
                    {/* Grammar Warnings Overlay */}
                    <AnimatePresence>
                        {visibleGrammarWarnings.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-12 left-0 right-0 mx-auto w-fit z-10"
                            >
                                <div className="bg-amber-500/90 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
                                    <AlertTriangle size={16} className="text-amber-200" />
                                    {visibleGrammarWarnings[0]}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                    aria-hidden="true"
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
                                role="status"
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
                                role="status"
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
                                    aria-label="Check answer. Press Enter to submit."
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
