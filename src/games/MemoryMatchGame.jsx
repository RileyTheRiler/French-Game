import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';

const MemoryMatchGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const { getWeightedPracticeWords } = useVocabulary();

    const [difficulty] = useState('normal'); // easy, normal, hard
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    const startNewGame = useCallback(() => {
        const pairCount = difficulty === 'hard' ? 8 : 6;
        const words = getWeightedPracticeWords(pairCount);

        // Create pairs (French and English)
        const newCards = [];
        words.forEach(word => {
            newCards.push({
                id: `fr-${word.id}`,
                wordId: word.id,
                text: word.french,
                type: 'fr',
                pairId: word.id
            });
            newCards.push({
                id: `en-${word.id}`,
                wordId: word.id,
                text: word.english,
                type: 'en',
                pairId: word.id
            });
        });

        // Shuffle
        setCards(newCards.sort(() => Math.random() - 0.5));
        setFlipped([]);
        setSolved([]);
        setGameComplete(false);
        setDisabled(false);
    }, [difficulty, getWeightedPracticeWords]);

    // Initialize Game
    useEffect(() => {
        // Fix set state in effect
        const timer = setTimeout(() => {
            startNewGame();
        }, 0);
        return () => clearTimeout(timer);
    }, [startNewGame]);

    const handleClick = (id) => {
        if (disabled || gameComplete) return;
        if (flipped.includes(id) || solved.includes(id)) return;

        // SoundManager.playFlip(); // Optional
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setDisabled(true);
            const [firstId, secondId] = newFlipped;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard.pairId === secondCard.pairId) {
                // Match
                setSolved(prev => [...prev, firstId, secondId]);
                setFlipped([]);
                setDisabled(false);
                SoundManager.playMatch();
            } else {
                // No Match
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const handleWin = useCallback(() => {
        setGameComplete(true);
        SoundManager.playLevelUp();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        addXP(30);
    }, [addXP]);

    useEffect(() => {
        if (cards.length > 0 && solved.length === cards.length) {
            // Fix set state in effect
            const timer = setTimeout(() => {
                handleWin();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [solved, cards.length, handleWin]);

    return (
        <GameLayout
            title="Memory Match"
            subtitle="Find the matching French and English pairs."
            onBack={() => navigate('/')}
        >
            <div className="max-w-4xl mx-auto flex flex-col items-center">

                {/* Grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full mb-8">
                    <AnimatePresence>
                        {cards.map(card => {
                            const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                            const isSolved = solved.includes(card.id);

                            return (
                                <motion.div
                                    key={card.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    layout
                                >
                                    <button
                                        onClick={() => handleClick(card.id)}
                                        className={`
                                            w-full aspect-[4/3] rounded-2xl text-lg font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 perspective-1000 relative
                                            ${isSolved ? 'invisible' : ''}
                                        `}
                                    >
                                        <div className={`
                                            w-full h-full flex items-center justify-center rounded-2xl absolute inset-0 backface-hidden transition-all duration-300
                                            ${isFlipped ? 'bg-indigo-600 text-white rotate-y-0' : 'bg-slate-800 text-transparent rotate-y-180'}
                                        `}
                                        style={{ transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)' }}
                                        >
                                            {/* Front (Content) */}
                                            {isFlipped && <span>{card.text}</span>}
                                        </div>

                                        <div className={`
                                            w-full h-full flex items-center justify-center rounded-2xl bg-slate-800 border-2 border-slate-700 absolute inset-0 backface-hidden transition-all duration-300
                                        `}
                                        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                        >
                                            {/* Back (Pattern) */}
                                            <div className="w-8 h-8 rounded-full bg-slate-700/50" />
                                        </div>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Game Over State */}
                <AnimatePresence>
                    {gameComplete && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
                        >
                            <Card className="max-w-md w-full text-center p-8 bg-slate-900 border-indigo-500/30">
                                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Memory Master!</h2>
                                <p className="text-slate-400 mb-8">You matched all the pairs.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button onClick={() => navigate('/')} variant="ghost">Menu</Button>
                                    <Button onClick={startNewGame}>Play Again <RotateCcw className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    );
};

export default MemoryMatchGame;
