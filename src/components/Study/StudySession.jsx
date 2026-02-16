import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Volume2, Ghost, Download, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { SuccessState } from '../ui/SuccessState';
import { triggerShake, triggerConfetti } from '../../utils/InteractionEffects';
import { useVocabulary } from '../../context/VocabularyContext';
import { useProgress } from '../../context/ProgressContext';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';
import { downloadCategoryAssets, isCategoryDownloaded, deleteCategoryAssets } from '../../services/downloadManager';
import { useToast } from '../../context/ToastContext';
import { calculateRewards } from '../../utils/rewardSystem';
import { formatRelativeTime } from '../../utils/time';

const StudySession = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const {
        getDueWords, updateWordProgress, vocabulary, playWordAudio,
        preloadAudioForWords, CATEGORIES, markWordSeen
    } = useVocabulary();
    const { addXP, addCoins, updateDailyStat } = useProgress();
    const { showToast } = useToast();

    const [filterCEFR, setFilterCEFR] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    // Init with logic to satisfy initial render tests
    const [dueWords, setDueWords] = useState(() => {
        try {
            const baseDue = getDueWords();
            return baseDue; // Initial filters are 'all'
        } catch (e) {
            return [];
        }
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(() => dueWords.length === 0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

    const [downloadStatus, setDownloadStatus] = useState('idle');
    const containerRef = useRef(null);

    const cefrLevels = useMemo(() => {
        return Array.from(new Set(vocabulary.map(word => word.cefr))).sort();
    }, [vocabulary]);

    useEffect(() => {
        const checkDownload = async () => {
            if (filterCategory === 'all') {
                setDownloadStatus('disabled');
                return;
            }
            setDownloadStatus('checking');
            const isDown = await isCategoryDownloaded(filterCategory);
            setDownloadStatus(isDown ? 'downloaded' : 'idle');
        };

        // Use setTimeout to avoid synchronous setState in effect warning/error
        const timer = setTimeout(() => {
            checkDownload();
        }, 0);

        return () => clearTimeout(timer);
    }, [filterCategory]);

    const handleDownload = async () => {
        if (filterCategory === 'all') return;
        setDownloadStatus('downloading');
        try {
            await downloadCategoryAssets(filterCategory);
            setDownloadStatus('downloaded');
            showToast('Lesson assets downloaded!', 'success');
        } catch (e) {
            console.error(e);
            setDownloadStatus('idle');
            showToast('Download failed.', 'error');
        }
    };

    const handleDeleteDownload = async () => {
        if (filterCategory === 'all') return;
        setDownloadStatus('checking');
        await deleteCategoryAssets(filterCategory);
        setDownloadStatus('idle');
        showToast('Local assets removed.', 'info');
    };

    useEffect(() => {
        const updateWords = () => {
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
            setCorrectCount(0);
            setWrongCount(0);
            setCurrentStreak(0);
            setBestStreak(0);
            setSessionReward(null);
            preloadAudioForWords(filtered);
        };

        // Use setTimeout to avoid synchronous setState in effect warning/error
        const timer = setTimeout(() => {
            updateWords();
        }, 0);

        return () => clearTimeout(timer);
    }, [filterCEFR, filterCategory, getDueWords, preloadAudioForWords]);

    useEffect(() => {
        const current = dueWords[currentIndex];
        if (current) {
            markWordSeen(current.id);
        }
    }, [currentIndex, dueWords, markWordSeen]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [currentIndex, sessionComplete]);

    const finalizeSession = (metrics) => {
        const reward = calculateRewards('studySession', metrics);
        setSessionReward(reward);
        addXP(reward.xp);
        addCoins(reward.coins);
        setSessionComplete(true);
        triggerConfetti();
    };

    const handleCardClick = () => {
        if (!sessionComplete) {
            setIsFlipped(!isFlipped);
            SoundManager.playFlip();
        }
    };

    const handleResult = (grade) => {
        const isCorrect = grade !== 'again';

        if (isCorrect) {
            SoundManager.playSuccess();
        } else {
            SoundManager.playFailure();
            triggerShake('flashcard-container');
        }

        const currentWord = dueWords[currentIndex];
        updateWordProgress(currentWord.id, grade);

        const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
        const nextWrong = isCorrect ? wrongCount : wrongCount + 1;
        const nextStreak = isCorrect ? currentStreak + 1 : 0;
        const nextBestStreak = isCorrect ? Math.max(bestStreak, nextStreak) : bestStreak;

        setCorrectCount(nextCorrect);
        setWrongCount(nextWrong);
        setCurrentStreak(nextStreak);
        setBestStreak(nextBestStreak);

        updateDailyStat('dailyReviews', 1);
        if (isCorrect) updateDailyStat('dailyStreak', nextStreak, 'max');

        setIsFlipped(false);

        if (currentIndex < dueWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finalizeSession({
                correct: nextCorrect,
                total: dueWords.length,
                bestStreak: nextBestStreak
            });
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
                handleResult('again');
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleResult('good');
            }
        }
    };

    // Filter Controls JSX
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
                <div className="flex gap-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400 flex-1"
                    >
                        <option value="all">All topics</option>
                        {Object.entries(CATEGORIES).map(([key, value]) => (
                            <option key={key} value={key}>{value.name}</option>
                        ))}
                    </select>

                    {filterCategory !== 'all' && (
                        <button
                            onClick={downloadStatus === 'downloaded' ? handleDeleteDownload : handleDownload}
                            disabled={downloadStatus === 'checking' || downloadStatus === 'downloading'}
                            className={`p-2 rounded-xl border transition-colors ${downloadStatus === 'downloaded'
                                ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 hover:text-red-400 hover:border-red-500/30 group'
                                : 'bg-slate-800 border-white/10 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                            title={downloadStatus === 'downloaded' ? "Remove offline pack" : "Download for offline use"}
                        >
                            {downloadStatus === 'downloading' ? (
                                <Loader2 size={20} className="animate-spin text-indigo-400" />
                            ) : downloadStatus === 'downloaded' ? (
                                <>
                                    <CheckCircle2 size={20} className="group-hover:hidden" />
                                    <Trash2 size={20} className="hidden group-hover:block" />
                                </>
                            ) : (
                                <Download size={20} />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    if (dueWords.length === 0) {
        return (
            <main className="min-h-screen p-4 flex flex-col items-center justify-center">
                <EmptyState
                    title="All Caught Up!"
                    description="No words are due for review right now. Nice work!"
                    icon={Ghost}
                    actionLabel="Return to Menu"
                    onAction={handleExit}
                >
                    {filterControls}
                </EmptyState>
            </main>
        );
    }

    if (sessionComplete) {
        return (
            <main className="min-h-screen p-4 flex flex-col items-center justify-center">
                <SuccessState
                    title="Session Complete!"
                    description={`You reviewed ${dueWords.length} words.`}
                    actionLabel="Return to Menu"
                    onAction={handleExit}
                >
                    {sessionReward && (
                        <div className="flex gap-4 mt-6 justify-center">
                            <div className="px-6 py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center">
                                <p className="text-xs uppercase text-indigo-200 tracking-wider">XP</p>
                                <p className="text-3xl font-black text-indigo-300">+{sessionReward.xp}</p>
                            </div>
                            <div className="px-6 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                                <p className="text-xs uppercase text-amber-200 tracking-wider">Coins</p>
                                <p className="text-3xl font-black text-amber-300">+{sessionReward.coins}</p>
                            </div>
                        </div>
                    )}
                </SuccessState>
            </main>
        );
    }

    const currentWord = dueWords[currentIndex];
    const metaTooltip = currentWord ? `Lvl ${currentWord.level} • Last seen ${formatRelativeTime(currentWord.lastSeen || currentWord.lastPracticed)}` : '';

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
                id="flashcard-container"
                onClick={handleCardClick}
                className="relative w-full max-w-md h-64 group perspective-1000 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 rounded-2xl"
                title={metaTooltip}
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

            <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-400 justify-center">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Mastery Lvl {currentWord.level}</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Last seen: {formatRelativeTime(currentWord.lastSeen || currentWord.lastPracticed)}</span>
            </div>

            {/* Controls */}
            {isFlipped && (
                <div className="flex flex-wrap gap-4 mt-8 animate-fade-in justify-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResult('again'); }}
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
