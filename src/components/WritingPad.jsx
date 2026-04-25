import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Eraser, Undo, RotateCcw, Check,
    Palette, PenTool, Eye, EyeOff, Volume2, ChevronRight
} from 'lucide-react';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useProgress } from '../context/ProgressContext';
import { getDifficultyConfig } from './ui/DifficultyDial';

// French accent characters for practice
const ACCENT_CHARACTERS = [
    { char: 'é', name: 'e accent aigu', example: 'café' },
    { char: 'è', name: 'e accent grave', example: 'mère' },
    { char: 'ê', name: 'e accent circonflexe', example: 'fête' },
    { char: 'ë', name: 'e tréma', example: 'Noël' },
    { char: 'à', name: 'a accent grave', example: 'là' },
    { char: 'â', name: 'a accent circonflexe', example: 'gâteau' },
    { char: 'ç', name: 'c cédille', example: 'français' },
    { char: 'î', name: 'i accent circonflexe', example: 'île' },
    { char: 'ï', name: 'i tréma', example: 'naïf' },
    { char: 'ô', name: 'o accent circonflexe', example: 'hôtel' },
    { char: 'û', name: 'u accent circonflexe', example: 'sûr' },
    { char: 'ù', name: 'u accent grave', example: 'où' },
    { char: 'œ', name: 'o-e ligature', example: 'cœur' },
    { char: 'æ', name: 'a-e ligature', example: 'curriculum vitæ' },
];

// Common words for tracing practice
const TRACE_WORDS = [
    { word: 'français', english: 'French', difficulty: 'easy' },
    { word: 'château', english: 'castle', difficulty: 'easy' },
    { word: 'révolution', english: 'revolution', difficulty: 'medium' },
    { word: 'être', english: 'to be', difficulty: 'easy' },
    { word: 'déjà', english: 'already', difficulty: 'easy' },
    { word: 'après', english: 'after', difficulty: 'easy' },
    { word: 'pâté', english: 'pâté', difficulty: 'easy' },
    { word: 'garçon', english: 'boy', difficulty: 'easy' },
    { word: 'façade', english: 'facade', difficulty: 'medium' },
    { word: 'maître', english: 'master', difficulty: 'medium' },
    { word: 'naïveté', english: 'naivety', difficulty: 'hard' },
    { word: 'Noël', english: 'Christmas', difficulty: 'easy' },
];

const STROKE_COLORS = [
    { name: 'Black', value: '#1e293b' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
];

const STROKE_WIDTHS = [2, 4, 6, 8];

const WritingPad = () => {
    const navigate = useNavigate();
    const { addXP, incrementStat, globalDifficulty } = useProgress();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState(STROKE_COLORS[0].value);
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Practice state
    const [mode, setMode] = useState('characters'); // 'characters' or 'words'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showGuide, setShowGuide] = useState(difficultyConfig.showHints);
    const [practiceComplete, setPracticeComplete] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);

    const currentItem = mode === 'characters'
        ? ACCENT_CHARACTERS[currentIndex]
        : TRACE_WORDS[currentIndex];

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        contextRef.current = ctx;

        // Draw initial guide if enabled
        if (showGuide) {
            drawGuide();
        }
    }, [currentIndex, mode, showGuide]);

    // Update stroke settings
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = strokeColor;
            contextRef.current.lineWidth = strokeWidth;
        }
    }, [strokeColor, strokeWidth]);

    // Draw the guide character/word
    const drawGuide = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw guide text
        ctx.save();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)'; // Light purple
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = mode === 'characters' ? currentItem.char : currentItem.word;
        const fontSize = mode === 'characters' ? 180 : Math.max(40, 200 / text.length);
        ctx.font = `${fontSize}px 'Georgia', serif`;

        const centerX = canvas.width / 4;
        const centerY = canvas.height / 4;
        ctx.fillText(text, centerX, centerY);
        ctx.restore();
    }, [currentItem, mode]);

    // Drawing handlers
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            saveToHistory();
        }
    };

    // Get coordinates for both mouse and touch events
    const getCoordinates = (event) => {
        if (event.touches && event.touches[0]) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            return {
                offsetX: event.touches[0].clientX - rect.left,
                offsetY: event.touches[0].clientY - rect.top,
            };
        }
        return {
            offsetX: event.offsetX,
            offsetY: event.offsetY,
        };
    };

    // Touch event handlers
    const handleTouchStart = (e) => {
        e.preventDefault();
        startDrawing({ nativeEvent: e });
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        draw({ nativeEvent: e });
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        stopDrawing();
    };

    // Save canvas state to history
    const saveToHistory = () => {
        const canvas = canvasRef.current;
        const imageData = canvas.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo last stroke
    const undo = () => {
        if (historyIndex <= 0) {
            clearCanvas();
            return;
        }

        const previousIndex = historyIndex - 1;
        const img = new Image();
        img.src = history[previousIndex];
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (showGuide) drawGuide();
            ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
        };
        setHistoryIndex(previousIndex);
    };

    // Clear canvas
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (showGuide) drawGuide();
        setHistory([]);
        setHistoryIndex(-1);
    };

    // Complete current item and move to next
    const completeItem = () => {
        setCompletedCount(prev => prev + 1);

        // Award XP
        addXP(2);

        // Move to next
        const items = mode === 'characters' ? ACCENT_CHARACTERS : TRACE_WORDS;
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
            clearCanvas();
        } else {
            // Practice complete
            setPracticeComplete(true);
            addXP(10); // Bonus for completing all
            incrementStat('writingPadSessions');
        }
    };

    // Play pronunciation
    const playAudio = () => {
        const text = mode === 'characters' ? currentItem.example : currentItem.word;
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${encodeURIComponent(text)}`;
        new Audio(audioUrl).play().catch(console.error);
    };

    // Practice complete screen
    if (practiceComplete) {
        return (
            <GameLayout
                title="Writing Practice"
                subtitle="Session Complete"
                icon={<PenTool className="w-6 h-6" />}
                onExit={() => navigate('/')}
            >
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <Card className="p-8 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30">
                            <div className="text-6xl mb-4">✍️</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Great Practice!
                            </h2>
                            <p className="text-slate-300 mb-6">
                                You practiced {completedCount} {mode === 'characters' ? 'characters' : 'words'}
                            </p>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                <div className="text-3xl font-bold text-yellow-400">
                                    +{completedCount * 2 + 10} XP
                                </div>
                                <div className="text-sm text-slate-400">earned this session</div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setCurrentIndex(0);
                                        setCompletedCount(0);
                                        setPracticeComplete(false);
                                        clearCanvas();
                                    }}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Practice Again
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                                >
                                    Done
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </GameLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    aria-label="Back to home"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-300" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-2">
                    <Badge variant="purple">
                        {currentIndex + 1} / {mode === 'characters' ? ACCENT_CHARACTERS.length : TRACE_WORDS.length}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={playAudio}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                        aria-label="Play audio"
                    >
                        <Volume2 className="w-5 h-5 text-slate-300" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Mode selector */}
            <div className="px-4 mb-4">
                <div className="flex bg-slate-800/50 rounded-xl p-1 max-w-md mx-auto">
                    <button
                        onClick={() => { setMode('characters'); setCurrentIndex(0); clearCanvas(); }}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${mode === 'characters'
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        ✨ Accent Characters
                    </button>
                    <button
                        onClick={() => { setMode('words'); setCurrentIndex(0); clearCanvas(); }}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${mode === 'words'
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        📝 Word Tracing
                    </button>
                </div>
            </div>

            {/* Current character/word info */}
            <div className="px-4 mb-4">
                <Card className="p-4 bg-slate-800/50 border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            {mode === 'characters' ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-serif">{currentItem.char}</span>
                                        <div>
                                            <div className="text-white font-medium">{currentItem.name}</div>
                                            <div className="text-slate-400 text-sm">
                                                Example: <span className="text-purple-400">{currentItem.example}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-serif text-white">{currentItem.word}</div>
                                    <div className="text-slate-400 text-sm">{currentItem.english}</div>
                                </>
                            )}
                        </div>
                        <Badge variant={currentItem.difficulty === 'easy' ? 'green' : currentItem.difficulty === 'medium' ? 'yellow' : 'red'}>
                            {mode === 'words' ? currentItem.difficulty : 'practice'}
                        </Badge>
                    </div>
                </Card>
            </div>

            {/* Canvas area */}
            <div className="px-4">
                <div className="relative bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden">
                    {/* Guide toggle */}
                    <button
                        onClick={() => {
                            setShowGuide(!showGuide);
                            if (!showGuide) {
                                // Redraw guide
                                drawGuide();
                            }
                        }}
                        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-slate-700/80 hover:bg-slate-600/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                        aria-label={showGuide ? "Hide guide" : "Show guide"}
                    >
                        {showGuide ? (
                            <Eye className="w-4 h-4 text-purple-400" aria-hidden="true" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        )}
                    </button>

                    {/* Canvas */}
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="w-full aspect-square bg-white/5 cursor-crosshair touch-none"
                    />
                </div>
            </div>

            {/* Tools */}
            <div className="px-4 mt-4 space-y-3">
                {/* Color picker */}
                <div className="flex items-center justify-center gap-2" role="group" aria-label="Stroke color">
                    {STROKE_COLORS.map(color => (
                        <button
                            key={color.value}
                            onClick={() => setStrokeColor(color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500 ${strokeColor === color.value
                                ? 'border-white scale-110'
                                : 'border-transparent hover:scale-105'
                                }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                            aria-label={color.name}
                            aria-pressed={strokeColor === color.value}
                        />
                    ))}
                </div>

                {/* Stroke width */}
                <div className="flex items-center justify-center gap-3" role="group" aria-label="Stroke width">
                    {STROKE_WIDTHS.map(width => (
                        <button
                            key={width}
                            onClick={() => setStrokeWidth(width)}
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500 ${strokeWidth === width
                                ? 'bg-purple-500'
                                : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                            aria-label={`Size ${width}`}
                            aria-pressed={strokeWidth === width}
                        >
                            <div
                                className="bg-white rounded-full"
                                style={{ width: width * 2, height: width * 2 }}
                                aria-hidden="true"
                            />
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3">
                    <Button
                        onClick={undo}
                        variant="secondary"
                        className="px-4"
                    >
                        <Undo className="w-4 h-4 mr-1" />
                        Undo
                    </Button>
                    <Button
                        onClick={clearCanvas}
                        variant="secondary"
                        className="px-4"
                    >
                        <Eraser className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                    <Button
                        onClick={completeItem}
                        className="px-6 bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                        <Check className="w-4 h-4 mr-1" />
                        Done
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Progress */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden max-w-lg mx-auto">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((currentIndex + 1) / (mode === 'characters' ? ACCENT_CHARACTERS.length : TRACE_WORDS.length)) * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default WritingPad;
