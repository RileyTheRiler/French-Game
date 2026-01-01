import React, { useState, useEffect, useRef } from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';

const StudySession = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { getDueWords, updateWordProgress } = useVocabulary();

    const [dueWords, setDueWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setDueWords(getDueWords());
    }, []);

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

    const handleResult = (success) => {
        if (success) SoundManager.playSuccess();
        else SoundManager.playFailure();

        const currentWord = dueWords[currentIndex];
        updateWordProgress(currentWord.id, success);

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
                        <p className="text-xs text-pink-300 uppercase tracking-[0.2em] mt-4 font-semibold">
                            English
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {isFlipped && (
                <div className="flex gap-4 mt-8 animate-fade-in">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult(false); }}
                        className="px-8 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-500 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        aria-label="Mark again. Shortcut Left Arrow"
                    >
                        Again
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult(true); }}
                        className="px-8 py-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                        aria-label="Mark good. Shortcut Right Arrow"
                    >
                        Good
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
