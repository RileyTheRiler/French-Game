import React, { useState, useEffect, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';

const StudySession = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const {
        getDueWords,
        updateWordProgress,
        vocabulary,
        playWordAudio,
        preloadAudioForWords,
        CATEGORIES
    } = useVocabulary();

    const [dueWords, setDueWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [filterCEFR, setFilterCEFR] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    const cefrLevels = useMemo(() => {
        return Array.from(new Set(vocabulary.map(word => word.cefr))).sort();
    }, [vocabulary]);

    const filterControls = (
        <div className="w-full max-w-3xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 font-semibold">CEFR Level</label>
                <select
                    value={filterCEFR}
                    onChange={(e) => setFilterCEFR(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                >
                    <option value="all">All levels</option>
                    {cefrLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 font-semibold">Topic</label>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                >
                    <option value="all">All topics</option>
                    {Object.entries(CATEGORIES).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
    const containerRef = useRef(null);

    useEffect(() => {
        const baseDue = getDueWords();
        const filtered = baseDue.filter(word => {
            const matchesCEFR = filterCEFR === 'all' || word.cefr === filterCEFR;
            const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
            return matchesCEFR && matchesCategory;
        });

        setDueWords(filtered);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(filtered.length === 0);
        preloadAudioForWords(filtered);
        // We intentionally avoid depending on vocabulary to prevent resets during a session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCEFR, filterCategory]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [currentIndex, sessionComplete]);

    const handleCardClick = () => {
        if (!sessionComplete) {
            setIsFlipped(!isFlipped);
            SoundManager.playFlip();
        }
    };

    const handleResult = (grade) => {
        const passing = grade !== 'again';
        if (passing) SoundManager.playSuccess();
        else SoundManager.playFailure();

        const currentWord = dueWords[currentIndex];
        updateWordProgress(currentWord.id, grade);

        setIsFlipped(false);

        if (currentIndex < dueWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setSessionComplete(true);
        }
    };

    const handleExit = () => {
        if (onExit) onExit();
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            handleExit();
            return;
        }

        if (sessionComplete || dueWords.length === 0) return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleCardClick();
        }

        if (isFlipped) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handleResult(false);
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleResult(true);
            }
        }
    };

    if (dueWords.length === 0) {
        return (
            <main className="flex flex-col items-center justify-center min-h-screen text-white p-4" role="main">
                <h2 className="text-3xl font-bold mb-4">🎉 All Caught Up!</h2>
                <p className="text-xl mb-8">No words are due for review right now.</p>
                {filterControls}
                <button
                    onClick={handleExit}
                    className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                >
                    Return to Menu
                </button>
            </main>
        );
    }

    if (sessionComplete) {
        return (
            <main className="flex flex-col items-center justify-center min-h-screen text-white p-4" role="main">
                <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
                <p className="text-xl mb-8">You reviewed {dueWords.length} words.</p>
                <button
                    onClick={handleExit}
                    className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                >
                    Return to Menu
                </button>
            </main>
        );
    }

    const currentWord = dueWords[currentIndex];

    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen text-white p-4"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            ref={containerRef}
            role="main"
            aria-label="Study session flashcards"
        >
            <div className="mb-4 text-gray-400" aria-live="polite">
                Word {currentIndex + 1} of {dueWords.length}
            </div>

            {filterControls}

            {/* Flashcard - 3D Container */}
            <div
                onClick={handleCardClick}
                className="relative w-full max-w-md h-64 group perspective-1000 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 rounded-2xl"
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={isFlipped ? 'Hide translation' : 'Reveal translation'}
            >
                <div className={`
                    w-full h-full relative transform-style-preserve-3d transition-transform duration-700
                    ${isFlipped ? 'rotate-y-180' : ''}
                `}>
                    {/* Front Face */}
                    <div className="absolute w-full h-full glass-panel flex flex-col items-center justify-center backface-hidden border-t border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
                        <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-indigo-300 to-indigo-500 mb-2 drop-shadow-lg">
                            {currentWord.french}
                        </h2>
                        <button
                            className="mt-3 flex items-center gap-2 text-sm text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full hover:bg-indigo-500/20 transition-colors"
                            onClick={(e) => { e.stopPropagation(); playWordAudio(currentWord); }}
                        >
                            <Volume2 size={18} /> Écouter
                        </button>
                        <p className="text-xs text-indigo-400 uppercase tracking-[0.2em] mt-4 font-semibold">
                            French
                        </p>
                        <p className="text-xs text-slate-500 mt-2 animate-pulse">
                            (Click to reveal)
                        </p>
                    </div>

                    {/* Back Face */}
                    <div className="absolute w-full h-full glass-panel flex flex-col items-center justify-center backface-hidden rotate-y-180 border-t border-white/10 bg-gradient-to-br from-indigo-900/80 to-purple-900/80">
                        <h2 className="text-5xl font-black text-white mb-2 drop-shadow-xl">
                            {currentWord.english}
                        </h2>
                        <p className="text-sm text-indigo-200 italic mb-2">{currentWord.ipa}</p>
                        <p className="text-center text-slate-200 px-6 text-base">
                            {currentWord.example?.french}
                            <span className="block text-slate-400 text-sm mt-1">{currentWord.example?.english}</span>
                        </p>
                        <p className="text-xs text-pink-300 uppercase tracking-[0.2em] mt-4 font-semibold">
                            English
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {isFlipped && (
                <div className="flex flex-wrap gap-4 mt-8 animate-fade-in justify-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult('again'); }}
                        className="px-6 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-500 transition-colors shadow-lg min-w-[120px]"
                        onClick={(e) => { e.stopPropagation(); handleResult(false); }}
                        className="px-8 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-500 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        aria-label="Mark again. Shortcut Left Arrow"
                    >
                        Again
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult('hard'); }}
                        className="px-6 py-4 bg-amber-600 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-lg min-w-[120px]"
                    >
                        Hard
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult('good'); }}
                        className="px-6 py-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition-colors shadow-lg min-w-[120px]"
                        onClick={(e) => { e.stopPropagation(); handleResult(true); }}
                        className="px-8 py-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                        aria-label="Mark good. Shortcut Right Arrow"
                    >
                        Good
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult('easy'); }}
                        className="px-6 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg min-w-[120px]"
                    >
                        Easy
                    </button>
                </div>
            )}

            <button
                onClick={handleExit}
                className="mt-12 text-gray-500 hover:text-white underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                aria-label="Exit study mode"
            >
                Exit Study Mode
            </button>
        </main>
    );
};

export default StudySession;
