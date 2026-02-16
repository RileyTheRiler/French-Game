import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';
import { speak } from '../utils/audio';

const MemoryMatchGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const { getWeightedPracticeWords } = useVocabulary();

    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [turns, setTurns] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [difficulty] = useState('normal');

    const startNewGame = () => {
        const pairCount = difficulty === 'hard' ? 8 : 6;
        const words = getWeightedPracticeWords(pairCount);

        const newCards = [];
        words.forEach(word => {
            newCards.push({
                id: `fr-${word.id}`,
                wordId: word.id,
                content: word.french,
                type: 'french',
                wordObj: word
            });
            newCards.push({
                id: `en-${word.id}`,
                wordId: word.id,
                content: word.english,
                type: 'english',
                wordObj: word
            });
        });

        setCards(newCards.sort(() => Math.random() - 0.5));
        setFlipped([]);
        setSolved([]);
        setTurns(0);
        setGameComplete(false);
        setDisabled(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            startNewGame();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleClick = (id) => {
        if (disabled || gameComplete) return;
        if (flipped.includes(id) || solved.includes(id)) return;

        if (flipped.length === 0) {
            setFlipped([id]);
            const card = cards.find(c => c.id === id);
            if (card.type === 'french') speak(card.content);
            SoundManager.playClick();
        } else {
            setFlipped(prev => [...prev, id]);
            setDisabled(true);
            setTurns(t => t + 1);
            checkForMatch(id);
        }
    };

    const checkForMatch = (currentId) => {
        const firstId = flipped[0];
        const secondId = currentId;
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        if (firstCard.wordId === secondCard.wordId) {
            SoundManager.playMatch();
            setSolved(prev => [...prev, firstId, secondId]);
            setFlipped([]);
            setDisabled(false);
        } else {
            SoundManager.playClick();
            setTimeout(() => {
                setFlipped([]);
                setDisabled(false);
            }, 1000);
        }
    };

    const handleWin = () => {
        setGameComplete(true);
        SoundManager.playLevelUp();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        addXP(30);
    };

    useEffect(() => {
        if (cards.length > 0 && solved.length === cards.length) {
            const timer = setTimeout(() => {
                handleWin();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [solved]);

    return (
        <GameLayout
            title="Memory Match"
            subtitle="Match French words with their meanings"
            onBack={() => navigate('/')}
        >
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 min-h-[60vh]">
                <div className="flex justify-between w-full max-w-md bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-indigo-300">
                        <RotateCcw size={20} />
                        <span className="font-bold text-xl">{turns} Turns</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-300">
                        <Trophy size={20} />
                        <span className="font-bold text-xl">{solved.length / 2} / {cards.length / 2} Pairs</span>
                    </div>
                </div>

                <div className={`grid gap-4 w-full max-w-2xl ${difficulty === 'hard' ? 'grid-cols-4' : 'grid-cols-3 md:grid-cols-4'}`}>
                    {cards.map(card => {
                        const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                        const isSolved = solved.includes(card.id);

                        return (
                            <motion.button
                                key={card.id}
                                className="aspect-[3/4] rounded-xl text-lg font-bold p-2 flex items-center justify-center text-center shadow-lg transition-all relative perspective-1000"
                                onClick={() => handleClick(card.id)}
                                initial={{ rotateY: 0 }}
                                animate={{
                                    rotateY: isFlipped ? 180 : 0,
                                    scale: isSolved ? 0.95 : 1
                                }}
                                transition={{ duration: 0.3 }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className={`absolute inset-0 bg-indigo-600 rounded-xl backface-hidden flex items-center justify-center border-b-4 border-indigo-800 ${isSolved ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                                    <Sparkles className="text-indigo-400/50" size={32} />
                                </div>
                                <div className={`absolute inset-0 bg-white rounded-xl backface-hidden flex items-center justify-center p-2 border-b-4 ${isSolved ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-800'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <span className="break-words">{card.content}</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {gameComplete && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <Card className="p-8 max-w-sm w-full text-center space-y-6 m-4">
                                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Trophy size={40} className="text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Well Done!</h2>
                                    <p className="text-slate-400">You matched all pairs in {turns} turns.</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button onClick={startNewGame} className="w-full py-4 text-lg">Play Again</Button>
                                    <Button variant="ghost" onClick={() => navigate('/')}>Back to Menu</Button>
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
