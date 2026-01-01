import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/time';

const StudySession = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { getPracticeQueue, updateWordProgress, markWordSeen } = useVocabulary();

    const [dueWords, setDueWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        const queue = getPracticeQueue('study', 12);
        setDueWords(prev => {
            const prevIds = prev.map(w => w.id).join(',');
            const nextIds = queue.map(w => w.id).join(',');
            if (prevIds === nextIds && prev.length === queue.length) {
                return queue;
            }
            setCurrentIndex(0);
            return queue;
        });
    }, [getPracticeQueue]);

    useEffect(() => {
        const current = dueWords[currentIndex];
        if (current) {
            markWordSeen(current.id);
        }
    }, [currentIndex, dueWords, markWordSeen]);

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

    if (dueWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
                <h2 className="text-3xl font-bold mb-4">🎉 All Caught Up!</h2>
                <p className="text-xl mb-8">No words are due for review right now.</p>
                <button
                    onClick={handleExit}
                    className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                >
                    Return to Menu
                </button>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
                <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
                <p className="text-xl mb-8">You reviewed {dueWords.length} words.</p>
                <button
                    onClick={handleExit}
                    className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                >
                    Return to Menu
                </button>
            </div>
        );
    }

    const currentWord = dueWords[currentIndex];
    const metaTooltip = currentWord ? `Lvl ${currentWord.level} • Last seen ${formatRelativeTime(currentWord.lastSeen || currentWord.lastPracticed)}` : '';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
            <div className="mb-4 text-gray-400">
                Word {currentIndex + 1} of {dueWords.length}
            </div>

            {/* Flashcard - 3D Container */}
            <div
                onClick={handleCardClick}
                className="relative w-full max-w-md h-64 group perspective-1000 cursor-pointer"
                title={metaTooltip}
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

            <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-400 justify-center">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Mastery Lvl {currentWord.level}</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Last seen: {formatRelativeTime(currentWord.lastSeen || currentWord.lastPracticed)}</span>
            </div>

            {/* Controls */}
            {isFlipped && (
                <div className="flex gap-4 mt-8 animate-fade-in">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult(false); }}
                        className="px-8 py-4 bg-red-600 rounded-xl font-bold hover:bg-red-500 transition-colors shadow-lg"
                    >
                        Again
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult(true); }}
                        className="px-8 py-4 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition-colors shadow-lg"
                    >
                        Good
                    </button>
                </div>
            )}

            <button
                onClick={handleExit}
                className="mt-12 text-gray-500 hover:text-white underline"
            >
                Exit Study Mode
            </button>
        </div>
    );
};

export default StudySession;
