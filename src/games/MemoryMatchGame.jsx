import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, RotateCcw, ArrowLeft } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';

const MemoryMatchGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const { getWeightedPracticeWords } = useVocabulary();

    // Game State
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [moves, setMoves] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard

    // Timer
    const [time, setTime] = useState(0);
    const timerRef = useRef(null);

    const startNewGame = () => {
        const pairCount = difficulty === 'hard' ? 8 : 6;
        const words = getWeightedPracticeWords(pairCount);

        // Create pairs (French and English)
        const newCards = [];
        words.forEach(word => {
            newCards.push({
                id: `fr-${word.id}`,
                wordId: word.id,
                content: word.french,
                type: 'french',
                isFlipped: false
            });
            newCards.push({
                id: `en-${word.id}`,
                wordId: word.id,
                content: word.english,
                type: 'english',
                isFlipped: false
            });
        });

        // Shuffle
        setCards(newCards.sort(() => Math.random() - 0.5));
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setTime(0);
        setGameComplete(false);
        setDisabled(false);
    };

    // Initialize Game
    useEffect(() => {
        startNewGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = (id) => {
        if (disabled || gameComplete) return;

        // Find index
        const index = cards.findIndex(c => c.id === id);
        if (index === -1) return;

        // Prevent clicking already flipped or solved
        if (flipped.includes(index) || solved.includes(cards[index].wordId)) return;

        // Flip card
        setFlipped(prev => [...prev, index]);
        setMoves(prev => prev + 1);

        // Check match if 2 cards flipped
        if (flipped.length === 1) {
            setDisabled(true);
            const firstIndex = flipped[0];
            const secondIndex = index;

            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.wordId === secondCard.wordId) {
                // Match!
                SoundManager.playMatch();
                setSolved(prev => [...prev, firstCard.wordId]);
                setFlipped([]);
                setDisabled(false);
            } else {
                // No match
                SoundManager.playFlip(); // Or error sound?
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        } else {
            SoundManager.playFlip();
        }
    };

    // Timer Effect
    useEffect(() => {
        if (!gameComplete && cards.length > 0) {
            timerRef.current = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameComplete, cards]);

    const handleWin = () => {
        setGameComplete(true);
        SoundManager.playLevelUp();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // XP Calculation based on speed/moves?
        // Simple 30 XP for now
        addXP(30);
    };

    // Check Win
    useEffect(() => {
        if (cards.length > 0 && solved.length === cards.length / 2) {
            handleWin();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [solved]);

    return (
        <GameLayout
            title="Memory Match"
            subtitle="Find the matching pairs."
            onBack={() => navigate('/')}
            headerRight={
                <div className="flex gap-4">
                    <Badge variant="outline" className="text-amber-300 border-amber-500/30">
                        <Clock size={14} className="mr-1" />
                        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                    </Badge>
                    <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">
                        {moves} Moves
                    </Badge>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] py-8">

                {!gameComplete ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 w-full">
                        {cards.map((card, idx) => {
                            const isFlipped = flipped.includes(idx) || solved.includes(card.wordId);
                            return (
                                <motion.button
                                    key={card.id}
                                    layoutId={card.id}
                                    whileHover={!isFlipped ? { scale: 1.05 } : {}}
                                    whileTap={!isFlipped ? { scale: 0.95 } : {}}
                                    onClick={() => handleClick(card.id)}
                                    className={`
                                        aspect-square rounded-xl flex items-center justify-center text-center p-2 text-sm md:text-lg font-bold shadow-lg transition-all perspective-1000
                                        ${isFlipped
                                            ? (card.type === 'french' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white')
                                            : 'bg-slate-800 border-2 border-slate-700 text-transparent hover:border-slate-500'}
                                        ${solved.includes(card.wordId) ? 'opacity-50' : ''}
                                    `}
                                >
                                    {isFlipped ? card.content : '?'}
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="p-8 text-center max-w-md w-full animate-fade-in">
                        <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Level Complete!</h2>
                        <p className="text-slate-400 mb-6">You found all pairs in {time}s with {moves} moves.</p>

                        <div className="flex gap-4 justify-center">
                            <Button variant="ghost" onClick={() => navigate('/')}>
                                <ArrowLeft size={18} /> Menu
                            </Button>
                            <Button onClick={startNewGame}>
                                <RotateCcw size={18} /> Play Again
                            </Button>
                        </div>
                    </Card>
                )}

            </div>
        </GameLayout>
    );
};

export default MemoryMatchGame;
