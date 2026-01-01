import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVocabulary } from '../../context/VocabularyContext';
import WordItem from './WordItem';
import SoundManager from '../../utils/SoundManager';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GameLayout } from '../layout/GameLayout';

const GAME_WIDTH_PERCENT = 90;
const INITIAL_FALL_SPEED = 0.05;
const MAX_FALL_SPEED = 0.25;
const TIME_TO_MAX_DIFFICULTY = 120000;
const INITIAL_SPAWN_INTERVAL = 2000;
const MIN_SPAWN_INTERVAL = 800;
const TICK_RATE_MS = 16;
const FALL_SPEED_INCREMENT = 0.05;
const INITIAL_LIVES = 3;

const FallingWordsGame = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');

    const { getDueWords, updateWordProgress } = useVocabulary();

    // Game State (Visual)
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [gameOver, setGameOver] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isZenMode, setIsZenMode] = useState(false);

    // Juice State
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isShaking, setIsShaking] = useState(false);
    const [level, setLevel] = useState(1);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Game Logic State (Refs for loop availability)
    const activeWordsRef = useRef([]);
    const [renderedWords, setRenderedWords] = useState([]);

    const lastTimeRef = useRef(0);
    const startTimeRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const requestRef = useRef(null);
    const wordIdCounter = useRef(0);
    const particleIdCounter = useRef(0);
    const validWords = useRef([]);
    const isPlayingRef = useRef(false);
    const isZenModeRef = useRef(false);

    // Dynamic difficulty refs
    const currentFallSpeedRef = useRef(INITIAL_FALL_SPEED);
    const currentSpawnIntervalRef = useRef(INITIAL_SPAWN_INTERVAL);

    // Sync Ref with State
    useEffect(() => {
        isZenModeRef.current = isZenMode;
        if (isZenMode) setLives(INITIAL_LIVES);
    }, [isZenMode]);

    // Initialize
    useEffect(() => {
        try {
            const words = getDueWords();
            if (!words || words.length === 0) {
                console.warn("No words available!");
                validWords.current = [];
            } else {
                validWords.current = words;
            }
        } catch (e) {
            console.error("Error fetching words:", e);
            validWords.current = [];
        }

        // Init Audio
        SoundManager.init();

        isPlayingRef.current = true;
        const now = performance.now();
        lastTimeRef.current = now;
        startTimeRef.current = now;
        requestRef.current = requestAnimationFrame(gameLoop);

        return () => {
            isPlayingRef.current = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const spawnWord = () => {
        if (validWords.current.length === 0) return;

        const candidates = validWords.current;
        const randomWord = candidates[Math.floor(Math.random() * candidates.length)];
        const randomX = 10 + Math.random() * (GAME_WIDTH_PERCENT - 20);

        const newWord = {
            id: wordIdCounter.current++,
            wordId: randomWord.id,
            text: randomWord.french,
            translation: randomWord.english,
            x: randomX,
            y: -10,
            isMatched: false,
        };

        activeWordsRef.current.push(newWord);
    };

    const spawnParticles = (x, y) => {
        const newParticles = [];
        const colors = ['#f472b6', '#38bdf8', '#4ade80', '#fbbf24', '#ffffff'];

        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 100; // px/s
            const tx = Math.cos(angle) * velocity + 'px';
            const ty = Math.sin(angle) * velocity + 'px';

            newParticles.push({
                id: particleIdCounter.current++,
                x,
                y,
                tx,
                ty,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const gameLoop = (time) => {
        if (!isPlayingRef.current) return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        const timeElapsed = time - startTimeRef.current;

        const currentLevel = 1 + Math.floor(timeElapsed / 30000);
        if (currentLevel > level) {
            setLevel(currentLevel);
            setShowLevelUp(true);
            SoundManager.playLevelUp();
            setTimeout(() => setShowLevelUp(false), 2000);
        }

        let difficultyProgress = 0;
        if (!isZenModeRef.current) {
            difficultyProgress = Math.min(timeElapsed / TIME_TO_MAX_DIFFICULTY, 1.0);
        }

        const flowMultiplier = 1 + (combo * 0.05);
        const effectiveSpeed = currentFallSpeedRef.current * flowMultiplier;

        currentFallSpeedRef.current = Math.min(effectiveSpeed, MAX_FALL_SPEED * 1.5);
        currentSpawnIntervalRef.current = (INITIAL_SPAWN_INTERVAL - (INITIAL_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * difficultyProgress) / (1 + (combo * 0.1));

        spawnTimerRef.current += deltaTime;
        if (spawnTimerRef.current > currentSpawnIntervalRef.current) {
            spawnWord();
            spawnTimerRef.current = 0;
        }

        let livesLost = 0;
        const nextWords = [];

        activeWordsRef.current.forEach(word => {
            if (word.isMatched) return;

            const newY = word.y + (currentFallSpeedRef.current * (deltaTime / TICK_RATE_MS));

            if (newY > 100) {
                if (!isZenModeRef.current) livesLost++;
                updateWordProgress(word.wordId, false);
            } else {
                word.y = newY;
                nextWords.push(word);
            }
        });

        activeWordsRef.current = nextWords;

        if (livesLost > 0) {
            triggerShake();
            SoundManager.playMiss();
            setCombo(0);

            setLives(prev => {
                const newLives = prev - livesLost;
                if (newLives <= 0) {
                    isPlayingRef.current = false;
                    setGameOver(true);
                    SoundManager.playGameOver();
                }
                return Math.max(0, newLives);
            });
        }

        if (isPlayingRef.current) {
            setRenderedWords([...activeWordsRef.current]);
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        const matchIndex = activeWordsRef.current.findIndex(w => w.text.toLowerCase() === val.toLowerCase().trim());

        if (matchIndex !== -1) {
            const word = activeWordsRef.current[matchIndex];

            SoundManager.playMatch();
            spawnParticles(word.x + '%', word.y + '%');
            updateWordProgress(word.wordId, true);

            const comboMultiplier = 1 + (combo * 0.1);
            setScore(s => Math.floor(s + (10 * comboMultiplier)));
            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });

            setInputValue('');
            activeWordsRef.current.splice(matchIndex, 1);
            setRenderedWords([...activeWordsRef.current]);
        }
    };

    const restartGame = () => {
        setScore(0);
        setLives(INITIAL_LIVES);
        setGameOver(false);
        setInputValue('');
        setCombo(0);
        setIsShaking(false);
        setParticles([]);

        activeWordsRef.current = [];
        setRenderedWords([]);
        isPlayingRef.current = true;

        const now = performance.now();
        lastTimeRef.current = now;
        startTimeRef.current = now;
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    });

    if (activeWordsRef.current === null) return <div>Loading...</div>;

    return (
        <GameLayout
            title="Falling Words"
            subtitle="Type the French translation before the words hit the ground!"
            onBack={onExit}
            headerRight={
                <div className="flex items-center gap-4">
                    <Badge variant="primary" className="text-lg py-1 px-4">
                        Score: {score}
                    </Badge>
                    <div className="flex gap-1">
                        {Array(INITIAL_LIVES).fill(0).map((_, i) => (
                            <motion.span
                                key={i}
                                initial={false}
                                animate={{ opacity: i < lives ? 1 : 0.2 }}
                                className="text-2xl"
                            >
                                ❤️
                            </motion.span>
                        ))}
                    </div>
                    <Button
                        variant={isZenMode ? "success" : "outline"}
                        size="sm"
                        onClick={() => setIsZenMode(!isZenMode)}
                        className="rounded-full"
                    >
                        {isZenMode ? 'Zen Mode' : 'Challenge'}
                    </Button>
                </div>
            }
        >
            <div className={`relative w-full h-[calc(100vh-160px)] overflow-hidden rounded-3xl glass-panel ${isShaking ? 'shake' : ''}`}>

                {/* Level Up Overlay */}
                <AnimatePresence>
                    {showLevelUp && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                        >
                            <h1 className="text-8xl font-black text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]">
                                LEVEL {level}!
                            </h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Combo Display */}
                {combo > 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-4 left-4 z-20"
                    >
                        <Badge variant="warning" className="text-xl py-2 px-6 animate-bounce">
                            COMBO x{combo}
                        </Badge>
                    </motion.div>
                )}

                {/* Game Area */}
                <div className="w-full h-full relative">
                    {renderedWords.map(word => (
                        <WordItem
                            key={word.id}
                            text={word.translation}
                            x={word.x}
                            y={word.y}
                            isMatched={false}
                        />
                    ))}

                    {/* Particles */}
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="particle"
                            style={{
                                left: p.x,
                                top: p.y,
                                backgroundColor: p.color,
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                '--tx': p.tx,
                                '--ty': p.ty
                            }}
                        />
                    ))}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
                    <Card className="p-2 bg-slate-950/80 border-white/20">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Type the French translation..."
                            className="w-full p-4 bg-transparent text-white text-center text-2xl font-bold focus:outline-none placeholder:text-slate-600"
                            disabled={gameOver}
                        />
                    </Card>
                </div>
            </div>

            {/* Game Over Modal */}
            <AnimatePresence>
                {gameOver && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md"
                        >
                            <Card className="text-center p-12 border-white/10 shadow-3xl">
                                <h2 className="text-5xl font-black mb-6 title-gradient">Game Over!</h2>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
                                        <p className="text-3xl font-bold">{score}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Max Combo</p>
                                        <p className="text-3xl font-bold text-yellow-400">{maxCombo}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button size="lg" onClick={restartGame}>
                                        Play Again
                                    </Button>
                                    <Button variant="ghost" onClick={onExit}>
                                        Return to Menu
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </GameLayout>
    );
};

export default FallingWordsGame;
