import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Trophy, BookOpen, AlertCircle, ArrowRight, Play, Check } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { useVocabulary } from '../../context/VocabularyContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import SoundManager from '../../utils/SoundManager';
import FlashcardMode from '../FlashcardMode';
import confetti from 'canvas-confetti';

const StudySession = () => {
    const { stats, updateDailyStat, addXP, addCoins } = useProgress();
    const { getDueWords, vocabulary, downloadAudioOnce, isAudioCached } = useVocabulary();

    const [sessionType, setSessionType] = useState('review'); // review, learn
    const [dueWords, setDueWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, checking, downloading, ready
    const [isFlipped, setIsFlipped] = useState(false);

    // Initial load
    useEffect(() => {
        const loadWords = () => {
            const due = getDueWords(20); // Get top 20 due words
            setDueWords(due);
        };
        loadWords();
    }, [getDueWords, vocabulary]); // Reload if vocab changes

    // Audio pre-cache check
    useEffect(() => {
        if (filterCategory === 'all') {
            // Can't easily cache "all", only specific lists if we wanted.
            // For now, disable per-category download if "all" is selected
            // Use setTimeout to avoid synchronous state update warning
            setTimeout(() => setDownloadStatus('disabled'), 0);
            return;
        }
        setTimeout(() => setDownloadStatus('checking'), 0);
        // Logic to check if category is cached could go here
    }, [filterCategory]);

    const handleDownload = async () => {
        setDownloadStatus('downloading');
        await downloadAudioOnce(dueWords); // Helper to fetch TTS
        setDownloadStatus('ready');
    };

    const handleSessionComplete = useCallback(() => {
        setSessionComplete(true);
        SoundManager.playLevelUp();
        confetti();
        addXP(50);
        addCoins(20);
        updateDailyStat('sessionsCompleted', 1);
    }, [addXP, addCoins, updateDailyStat]);

    const handleNext = () => {
        if (currentIndex < dueWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            handleSessionComplete();
        }
    };

    const handleCategoryChange = (category) => {
        setFilterCategory(category);
        const allDue = getDueWords(50);
        const filtered = category === 'all' ? allDue.slice(0, 20) : allDue.filter(w => w.category === category).slice(0, 20);

        setDueWords(filtered);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(filtered.length === 0);
    };

    if (dueWords.length === 0 && !sessionComplete) {
        return (
            <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
                <p className="text-slate-400 mb-6">You have no words due for review right now.</p>
                <Button onClick={() => window.location.reload()}>Return Home</Button>
            </Card>
        );
    }

    if (sessionComplete) {
        return (
            <Card className="p-8 text-center max-w-md mx-auto mt-10">
                <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                <p className="text-slate-400 mb-6">You reviewed {dueWords.length} words.</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => window.location.reload()} variant="ghost">Home</Button>
                    <Button onClick={() => {
                        setSessionComplete(false);
                        const newWords = getDueWords(20);
                        setDueWords(newWords);
                        setCurrentIndex(0);
                    }}>Review More</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Study Session</h1>
                    <p className="text-slate-400 text-sm">Reviewing {dueWords.length} words</p>
                </div>
                <div className="flex gap-2">
                    {downloadStatus !== 'disabled' && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDownload}
                            disabled={downloadStatus === 'downloading' || downloadStatus === 'ready'}
                        >
                            {downloadStatus === 'downloading' ? 'Downloading...' : downloadStatus === 'ready' ? 'Ready Offline' : 'Download Audio'}
                            <Download size={16} className="ml-2" />
                        </Button>
                    )}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex) / dueWords.length) * 100}%` }}
                />
            </div>

            {/* Flashcard Area */}
            <div className="min-h-[400px] flex items-center justify-center">
                <FlashcardMode
                    words={dueWords}
                    currentIndex={currentIndex}
                    onNext={handleNext}
                    onFlip={() => setIsFlipped(true)}
                    isFlipped={isFlipped}
                />
            </div>
        </div>
    );
};

export default StudySession;
