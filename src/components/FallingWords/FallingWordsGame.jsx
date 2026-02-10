import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { useVocabulary } from '../../context/VocabularyContext';
import { useProgress } from '../../context/ProgressContext';
import WordItem from './WordItem';
import SoundManager from '../../utils/SoundManager';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GameLayout } from '../layout/GameLayout';
import { Ghost, Swords, Clock, TrendingUp } from 'lucide-react';
import { getDifficultyConfig } from '../ui/DifficultyDial';
import { scorePronunciation } from '../../utils/phonetics';
import { playWordAudio } from '../../utils/audio';

const GAME_WIDTH_PERCENT = 90;
const INITIAL_FALL_SPEED = 0.05;
const MAX_FALL_SPEED = 0.25;
const TIME_TO_MAX_DIFFICULTY = 120000;
const INITIAL_SPAWN_INTERVAL = 2000;
const MIN_SPAWN_INTERVAL = 800;
const TICK_RATE_MS = 16;
const FALL_SPEED_INCREMENT = 0.05;

// Time Attack Constants
const INITIAL_TIME_SECONDS = 90;
const TIME_BONUS_PER_WORD = 5;
const MAX_TIME_CAP = 120; // Don't let them bank too much time

const GHOST_STORAGE_KEY = 'frenchApp_fw_ghost';

const FallingWordsGame = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const opponentName = queryParams.get('opponent') || 'Opponent';
    const isRivalsMode = mode === 'rivals';

    const onExit = () => navigate('/');

    const { getDueWords, updateWordProgress, CATEGORIES, markWordSeen, vocabulary } = useVocabulary();
    const { stats, recordCategoryPerformance, setModeDifficulty, logWordAttempt, globalDifficulty, difficultySettings, addXP, addCoins, updateDailyStat, incrementStat, offlineAudio } = useProgress();
    const difficultySetting = stats?.difficultySettings?.fallingWords || 3;
    const [difficulty, setDifficulty] = useState(difficultySetting);
    const difficultyRef = useRef(difficultySetting);

    const difficultyConfig = useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    // Game State (Visual)
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
    const [gameOver, setGameOver] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isZenMode, setIsZenMode] = useState(false);
    const [listenMode, setListenMode] = useState(false);
    const [shadowFeedback, setShadowFeedback] = useState(null);
    const [isShadowing, setIsShadowing] = useState(false);

    // Ghost State
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [ghostScore, setGhostScore] = useState(0);
    const [hasGhostData, setHasGhostData] = useState(false);

    // Rivals State
    const [opponentScore, setOpponentScore] = useState(0);

    // Juice State
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isShaking, setIsShaking] = useState(false);
    const [level, setLevel] = useState(1);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [addedTime, setAddedTime] = useState(null); // For UI popup "+5s"
    const [wordsCaught, setWordsCaught] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

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
    const timeLeftRef = useRef(INITIAL_TIME_SECONDS); // Ref for precise timing logic
    const listenModeRef = useRef(false);
    const recognitionRef = useRef(null);
    const lastHeardWordRef = useRef(null);

    // Dynamic difficulty refs
    const currentFallSpeedRef = useRef(INITIAL_FALL_SPEED);
    const currentSpawnIntervalRef = useRef(INITIAL_SPAWN_INTERVAL);
    const rewardGrantedRef = useRef(false);

    // Ghost Refs
    const recordingRef = useRef([]); // [{ time: ms, score: int }]
    const ghostDataRef = useRef([]);
    const isGhostModeRef = useRef(false);

    // Sync Ref with State
    useEffect(() => {
        isZenModeRef.current = isZenMode;
        if (isZenMode) {
            timeLeftRef.current = 9999;
            setTimeLeft(9999);
        } else {
            timeLeftRef.current = INITIAL_TIME_SECONDS;
            setTimeLeft(INITIAL_TIME_SECONDS);
        }
    }, [isZenMode]);

    useEffect(() => {
        isGhostModeRef.current = isGhostMode;
    }, [isGhostMode]);

    // Opponent Simulation (Rivals Mode)
    useEffect(() => {
        if (!isRivalsMode || gameOver) return;

        const interval = setInterval(() => {
            // Randomly increase opponent score
            // Logic: Base rate + random bursts to simulate combos
            const chance = Math.random();
            if (chance > 0.3) { // 70% chance to score
                const gain = Math.floor(Math.random() * 30) + 10;
                setOpponentScore(prev => prev + gain);
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [isRivalsMode, gameOver]);

    useEffect(() => {
        listenModeRef.current = listenMode;
    }, [listenMode]);

    // Initialize
    useEffect(() => {
        // Check for existing ghost data
        const savedGhost = localStorage.getItem(GHOST_STORAGE_KEY);
        if (savedGhost) {
            setHasGhostData(true);
        }

        try {
            const words = getDueWords();
            if (!words || words.length === 0) {
                console.warn("No words available!");
                validWords.current = vocabulary || [];
            } else {
                validWords.current = words;
            }
        } catch (e) {
            console.error("Error fetching words:", e);
            validWords.current = vocabulary || [];
        }

        // Init Audio
        SoundManager.init();

        startGame();

        return () => {
            isPlayingRef.current = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'fr-FR';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
            const heard = event.results[0][0].transcript;
            const target = lastHeardWordRef.current;
            if (target) {
                const { accuracy } = scorePronunciation(target.french, heard);
                setShadowFeedback({ heard, accuracy, target });
            }
            setIsShadowing(false);
        };
        recognitionRef.current.onerror = () => setIsShadowing(false);
        recognitionRef.current.onend = () => setIsShadowing(false);
    }, []);

    const startGame = () => {
        isPlayingRef.current = true;

        // Prepare Ghost Data if mode is active
        if (isGhostModeRef.current) {
            const savedGhost = localStorage.getItem(GHOST_STORAGE_KEY);
            ghostDataRef.current = savedGhost ? JSON.parse(savedGhost) : [];
        } else {
            ghostDataRef.current = [];
        }

        // Reset Recording
        recordingRef.current = [{ time: 0, score: 0 }];

        const now = performance.now();
        lastTimeRef.current = now;
        startTimeRef.current = now;

        if (!isZenModeRef.current) {
            timeLeftRef.current = INITIAL_TIME_SECONDS;
            setTimeLeft(INITIAL_TIME_SECONDS);
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    };

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
            category: randomWord.category,
            x: randomX,
            y: -10,
            isMatched: false,
            spawnTime: performance.now(),
            target: randomWord,
            mastery: randomWord.level,
            lastSeen: randomWord.lastSeen,
        };

        markWordSeen(randomWord.id);
        activeWordsRef.current.push(newWord);
        lastHeardWordRef.current = randomWord;

        if (listenModeRef.current) {
            playWordAudio(randomWord, { preferCache: true, offlineOnly: offlineAudio });
        }
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

    const grantSessionRewards = useCallback(() => {
        if (rewardGrantedRef.current) return;
        rewardGrantedRef.current = true;
        // Simple reward logic if calculateRewards is not imported
        const xp = Math.floor(score * 0.5);
        const coins = Math.floor(score * 0.1);

        setSessionReward({ xp, coins });
        addXP(xp);
        addCoins(coins);
        updateDailyStat('dailyStreak', maxCombo, 'max');
        incrementStat('gamesPlayed', 1);
    }, [addCoins, addXP, incrementStat, maxCombo, score, updateDailyStat]);

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const gameLoop = (time) => {
        if (!isPlayingRef.current) return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        const timeElapsed = time - startTimeRef.current;

        // Timer Logic
        if (!isZenModeRef.current && !gameOver) {
            timeLeftRef.current -= (deltaTime / 1000);
            if (timeLeftRef.current <= 0) {
                timeLeftRef.current = 0;
                setTimeLeft(0);
                endGame(parseInt(document.getElementById('current-score-hidden')?.innerText || '0'));
                return; // Stop loop
            }
            // Update UI State periodically (every frame is too much for React state sometimes, but 60FPS is fine for simple number)
            // But we can just set it:
            setTimeLeft(Math.ceil(timeLeftRef.current));
        }

        // Ghost Playback Logic
        if (isGhostModeRef.current && ghostDataRef.current.length > 0) {
            const latestEvent = ghostDataRef.current.findLast(e => e.time <= timeElapsed);
            if (latestEvent) {
                setGhostScore(latestEvent.score);
            }
        }

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
        const difficultyMultiplier = (globalDifficulty / 50) || 1.0; // Scale speed by difficulty (0.5x to 2.0x roughly)

        const effectiveSpeed = currentFallSpeedRef.current * flowMultiplier * difficultyMultiplier;

        currentFallSpeedRef.current = Math.min(effectiveSpeed, MAX_FALL_SPEED * 1.5);

        const baseInterval = (INITIAL_SPAWN_INTERVAL - (INITIAL_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * difficultyProgress);
        currentSpawnIntervalRef.current = (baseInterval / difficultyMultiplier) / (1 + (combo * 0.1));

        spawnTimerRef.current += deltaTime;
        if (spawnTimerRef.current > currentSpawnIntervalRef.current) {
            spawnWord();
            spawnTimerRef.current = 0;
        }

        let mistakes = 0;
        const nextWords = [];

        activeWordsRef.current.forEach(word => {
            if (word.isMatched) return;

            const categoryPressure = 1; // Simplify without detailed performance data for now
            const wordSpeed = currentFallSpeedRef.current * categoryPressure;
            const newY = word.y + (wordSpeed * (deltaTime / TICK_RATE_MS));

            if (newY > 100) {
                mistakes++;
                updateWordProgress(word.wordId, 'again');
                logWordAttempt(word.category || 'General', false, performance.now() - word.spawnTime);
            } else {
                word.y = newY;
                nextWords.push(word);
            }
        });

        activeWordsRef.current = nextWords;

        if (mistakes > 0) {
            triggerShake();
            SoundManager.playMiss();
            // Break combo but don't reset it completely? Or reset?
            // "Positive" usually means you keep some progress, but for combo mechanics, resetting is standard feedback.
            // Let's reset combo for now as it's the only penalty.
            setCombo(0);
        }

        if (isPlayingRef.current) {
            setRenderedWords([...activeWordsRef.current]);
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const endGame = (finalScore) => {
        isPlayingRef.current = false;
        setGameOver(true);
        SoundManager.playGameOver();

        // Save Ghost Data (only if not zen mode and score > 0)
        if (!isZenModeRef.current && finalScore > 0) {
            localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(recordingRef.current));
            setHasGhostData(true);
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
            setWordsCaught(prev => prev + 1);
            updateDailyStat('dailyWordsCaught', 1);
            updateWordProgress(word.wordId, 'good');
            logWordAttempt(word.category || 'General', true, performance.now() - word.spawnTime);

            const responseTime = performance.now() - word.spawnTime;
            recordCategoryPerformance(word.category, {
                success: true,
                responseTime,
                mode: 'fallingWords'
            });

            const comboMultiplier = 1 + (combo * 0.1);

            // Add Time (Bonus)
            if (!isZenModeRef.current) {
                const bonus = TIME_BONUS_PER_WORD;
                timeLeftRef.current = Math.min(timeLeftRef.current + bonus, MAX_TIME_CAP);
                setTimeLeft(Math.ceil(timeLeftRef.current));

                // Show visual feedback
                setAddedTime(`+${bonus}s`);
                setTimeout(() => setAddedTime(null), 1000);
            }

            // Score Update & Recording
            setScore(s => {
                const newScore = Math.floor(s + (10 * comboMultiplier));
                // Record event
                const timeElapsed = performance.now() - startTimeRef.current;
                recordingRef.current.push({ time: timeElapsed, score: newScore });
                return newScore;
            });

            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                updateDailyStat('dailyStreak', newCombo, 'max');
                return newCombo;
            });

            setInputValue('');
            activeWordsRef.current.splice(matchIndex, 1);
            setRenderedWords([...activeWordsRef.current]);
        }
    };

    const startShadowing = () => {
        if (!recognitionRef.current || isShadowing) return;
        const targetWord = activeWordsRef.current[0]?.target || lastHeardWordRef.current;
        if (!targetWord) return;

        lastHeardWordRef.current = targetWord;
        setShadowFeedback(null);
        setIsShadowing(true);
        recognitionRef.current.start();
        playWordAudio(targetWord, { preferCache: true, offlineOnly: offlineAudio });
    };

    const restartGame = () => {
        setScore(0);
        setGhostScore(0);
        setOpponentScore(0);
        setGameOver(false);
        setInputValue('');
        setCombo(0);
        setIsShaking(false);
        setParticles([]);
        setWordsCaught(0);
        setSessionReward(null);
        rewardGrantedRef.current = false;
        spawnTimerRef.current = 0;
        currentSpawnIntervalRef.current = INITIAL_SPAWN_INTERVAL;
        currentFallSpeedRef.current = INITIAL_FALL_SPEED;
        setShadowFeedback(null);
        setIsShadowing(false);

        activeWordsRef.current = [];
        setRenderedWords([]);

        startGame();
    };

    useEffect(() => {
        if (gameOver) {
            grantSessionRewards();
        }
    }, [gameOver, grantSessionRewards]);

    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    });

    const hintData = useMemo(() => {
        // Simplified hint logic for HEAD version
        return null;
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onExit();
            }
            if (gameOver && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                restartGame();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, onExit]);

    return (
        <GameLayout
            title={isRivalsMode ? `VS ${opponentName}` : "Falling Words"}
            subtitle={isRivalsMode ? "Beat your opponent's score!" : "Type the French translation before the words hit the ground!"}
            onBack={onExit}
            headerRight={
                <div className="flex items-center gap-4">
                    {/* Rivals Score */}
                    {isRivalsMode && (
                        <Badge variant="destructive" className="text-lg py-1 px-4 animate-pulse gap-2 border-red-500/50 text-red-100">
                            <Swords size={16} /> {opponentScore}
                        </Badge>
                    )}

                    {/* Ghost Score Indicator */}
                    {isGhostMode && (
                        <Badge variant="outline" className="text-lg py-1 px-4 border-cyan-500/50 text-cyan-400 gap-2">
                            <Ghost size={16} /> {ghostScore}
                        </Badge>
                    )}

                    <Badge variant="primary" className="text-lg py-1 px-4">
                        <TrendingUp size={16} className="mr-2 text-indigo-300" />
                        {score}
                        <span id="current-score-hidden" className="hidden">{score}</span>
                    </Badge>

                    {/* Timer Display */}
                    {!isZenMode && (
                        <div className="relative">
                            <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"} className={`text-lg py-1 px-4 w-24 justify-center font-mono ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                                <Clock size={16} className="mr-2 opacity-50" />
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </Badge>

                            {/* Time Bonus Popup */}
                            <AnimatePresence>
                                {addedTime && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, y: -20, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 font-bold shadow-black drop-shadow-md"
                                    >
                                        {addedTime}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Ghost Toggle - disabled in Rivals mode */}
                    {!isRivalsMode && (
                        <Button
                            variant={isGhostMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => hasGhostData && setIsGhostMode(!isGhostMode)}
                            disabled={!hasGhostData}
                            className={`rounded-full ${isGhostMode ? 'bg-cyan-600 hover:bg-cyan-500' : ''}`}
                            title={hasGhostData ? "Compete against your last best run" : "No ghost data available"}
                        >
                            <Ghost size={16} className={isGhostMode ? "text-white" : "text-slate-400"} />
                        </Button>
                    )}

                    <Button
                        variant={listenMode ? "success" : "outline"}
                        size="sm"
                        onClick={() => setListenMode(!listenMode)}
                        className="rounded-full flex items-center gap-2"
                    >
                        <Volume2 size={14} />
                        Listen then Type
                    </Button>
                    <Button
                        variant={isZenMode ? "success" : "outline"}
                        size="sm"
                        onClick={() => setIsZenMode(!isZenMode)}
                        className="rounded-full"
                        aria-pressed={isZenMode}
                        aria-label={`Toggle ${isZenMode ? 'Zen' : 'Challenge'} mode`}
                    >
                        {isZenMode ? 'Zen Mode' : 'Time Attack'}
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
                            hint={
                                difficultySettings?.learnerType === 'scholar'
                                    ? `[${word.gender || word.category || '?'}]`
                                    : (difficultyConfig.showInitial ? word.text.charAt(0) : null)
                            }
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
                    <Card className="p-4 bg-slate-950/80 border-white/20 space-y-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={listenMode ? "Type what you hear..." : "Type the French translation..."}
                            className="w-full p-4 bg-transparent text-white text-center text-2xl font-bold focus:outline-none placeholder:text-slate-600"
                            disabled={gameOver}
                            aria-label="Type the matching French word"
                        />
                        {hintData && (
                            <div className="mt-2 text-center text-sm text-slate-300">
                                <Badge variant="outline" className="mr-2">Hint</Badge>
                                <span className="text-xs text-slate-400">{hintData.name}</span>
                                <div className="mt-1 text-slate-200 font-semibold">
                                    {hintData.masked} · {hintData.translation}
                                </div>
                            </div>
                         )}
                        <div className="flex items-center justify-center gap-3">
                            <Button
                                variant={isShadowing ? "success" : "outline"}
                                size="sm"
                                className="rounded-full flex items-center gap-2"
                                onClick={startShadowing}
                                disabled={gameOver}
                            >
                                <Mic size={16} />
                                {isShadowing ? 'Listening...' : 'Shadow audio'}
                            </Button>
                            {listenMode && (
                                <Badge variant="outline" className="text-xs bg-indigo-500/10 border-indigo-500/30 text-indigo-200">
                                    Audio plays on spawn
                                </Badge>
                            )}
                        </div>
                        {shadowFeedback && (
                            <div className="text-center text-sm text-slate-300">
                                <p className={shadowFeedback.accuracy >= 70 ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
                                    Shadow accuracy: {shadowFeedback.accuracy}%
                                </p>
                                <p className="text-xs text-slate-500">Heard: "{shadowFeedback.heard}"</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Game Over Modal */}
            <AnimatePresence>
                {gameOver && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Game over">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md"
                        >
                            <Card className="text-center p-12 border-white/10 shadow-3xl">
                                <h2 className="text-5xl font-black mb-6 title-gradient">
                                    {isRivalsMode ? (score > opponentScore ? "VICTORY!" : "DEFEAT!") : "Time's Up!"}
                                </h2>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
                                        <p className="text-3xl font-bold">{score}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                                            {isRivalsMode ? "Opponent" : "Max Combo"}
                                        </p>
                                        <p className={`text-3xl font-bold ${isRivalsMode ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {isRivalsMode ? opponentScore : maxCombo}
                                        </p>
                                    </div>
                                </div>
                                {sessionReward && (
                                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mb-6 flex items-center justify-around text-left">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-indigo-200">XP</p>
                                            <p className="text-3xl font-black text-indigo-300">+{sessionReward.xp}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-amber-200">Coins</p>
                                            <p className="text-3xl font-black text-amber-300">+{sessionReward.coins}</p>
                                        </div>
                                    </div>
                                )}
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
