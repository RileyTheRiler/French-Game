import React, { useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, BookOpen, ChevronLeft, Award, Lock, Search, Filter,
    Star, Check, Volume2, ArrowRight, Library
} from 'lucide-react';
import { GRADED_READERS, READER_CATEGORIES } from '../data/gradedReaders';
import { useProgress } from '../context/ProgressContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { GameLayout } from './layout/GameLayout';
import { speak } from '../utils/audio';

// Library Browser
const LibraryBrowser = ({ onSelectReader, userLevel, progress }) => {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');

    const filteredReaders = useMemo(() => {
        return GRADED_READERS.filter(reader => {
            const matchesCategory = categoryFilter === 'all' || reader.category === categoryFilter;
            const matchesLevel = levelFilter === 'all' || reader.level === levelFilter;
            return matchesCategory && matchesLevel;
        });
    }, [categoryFilter, levelFilter]);

    return (
        <div className="space-y-8 p-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <Button
                        variant={categoryFilter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCategoryFilter('all')}
                        className="rounded-full"
                    >
                        All
                    </Button>
                    {READER_CATEGORIES.map(cat => (
                        <Button
                            key={cat.id}
                            variant={categoryFilter === cat.id ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter(cat.id)}
                            className="rounded-full whitespace-nowrap"
                        >
                            <span className="mr-2">{cat.icon}</span> {cat.name}
                        </Button>
                    ))}
                </div>

                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="all">All Levels</option>
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Advanced</option>
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReaders.map((reader, idx) => {
                    const isCompleted = progress[reader.id]?.completed;

                    return (
                        <motion.div
                            key={reader.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card
                                onClick={() => {
                                    SoundManager.playFlip();
                                    onSelectReader(reader);
                                }}
                                className="group cursor-pointer hover:-translate-y-2 transition-all duration-300 border-white/10 overflow-hidden"
                            >
                                <div className={`h-40 bg-gradient-to-br ${reader.coverColor} p-6 flex flex-col justify-end relative`}>
                                    <div className="absolute top-4 right-4 space-y-2 flex flex-col items-end">
                                        <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md border-0">
                                            {reader.level}
                                        </Badge>
                                        {isCompleted && (
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <Badge className="w-fit mb-2 bg-black/30 backdrop-blur-md border-0 text-white/90">
                                        {READER_CATEGORIES.find(c => c.id === reader.category)?.name}
                                    </Badge>
                                    <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                                        {reader.title}
                                    </h3>
                                </div>
                                <div className="p-4 bg-slate-900/80">
                                    <div className="flex justify-between items-center text-slate-400 text-xs">
                                        <span>By {reader.author}</span>
                                        <span>{reader.wordCount} words</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredReaders.length === 0 && (
                <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                    <Search size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No readers found matching your filters.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => { setCategoryFilter('all'); setLevelFilter('all'); }}>
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

// Reader View
const ReaderView = ({ reader, onBack, onComplete }) => {
    const [selectedWordIndex, setSelectedWordIndex] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizIndex, setQuizIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleWordClick = (index) => {
        SoundManager.playPop();
        setSelectedWordIndex(selectedWordIndex === index ? null : index);
    };

    const handleNextQuiz = (isCorrect) => {
        if (isCorrect) {
            setScore(prev => prev + 1);
            SoundManager.playMatch();
        } else {
            SoundManager.playMiss();
        }

        if (quizIndex < reader.comprehension.length - 1) {
            setTimeout(() => setQuizIndex(prev => prev + 1), 1500);
        } else {
            setTimeout(() => {
                setIsFinished(true);
                const finalScore = isCorrect ? score + 1 : score;
                onComplete(reader.id, finalScore, reader.comprehension.length);
            }, 1500);
        }
    };

    const speakContent = () => {
        const text = reader.content.map(w => w.word).join(' ');
        speak(text, 'fr-FR');
    };

    if (showQuiz) {
        if (isFinished) {
            const percentage = Math.round((score / reader.comprehension.length) * 100);
            return (
                <GameLayout title={reader.title} subtitle="Reading Complete" onBack={onBack}>
                    <div className="max-w-md mx-auto px-4 mt-20">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Card className="p-8 text-center bg-slate-900/60 backdrop-blur-xl border-indigo-500/20">
                                <Award size={64} className="text-yellow-400 mx-auto mb-6" />
                                <h2 className="text-3xl font-black text-white mb-2">Well Done!</h2>
                                <p className="text-slate-400 mb-8">You've finished reading this story and the comprehension check.</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-indigo-500/10 p-4 rounded-2xl">
                                        <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Score</p>
                                        <p className="text-2xl font-black text-white">{percentage}%</p>
                                    </div>
                                    <div className="bg-emerald-500/10 p-4 rounded-2xl">
                                        <p className="text-xs text-emerald-300 uppercase tracking-widest mb-1">XP Earned</p>
                                        <p className="text-2xl font-black text-white">+{reader.xpReward}</p>
                                    </div>
                                </div>

                                <Button onClick={onBack} size="lg" className="w-full">
                                    Return to Library
                                </Button>
                            </Card>
                        </motion.div>
                    </div>
                </GameLayout>
            );
        }

        const currentQuiz = reader.comprehension[quizIndex];
        return (
            <GameLayout title={reader.title} subtitle={`Question ${quizIndex + 1} of ${reader.comprehension.length}`} onBack={() => setShowQuiz(false)}>
                <div className="max-w-2xl mx-auto px-4 mt-10">
                    <Card className="p-8 bg-slate-900/60 backdrop-blur-xl border-white/5">
                        <h3 className="text-2xl font-bold text-white mb-8 text-center">{currentQuiz.question}</h3>
                        <div className="space-y-4">
                            {currentQuiz.options.map((opt, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="w-full py-6 text-lg justify-between group"
                                    onClick={() => handleNextQuiz(opt === currentQuiz.correctAnswer)}
                                >
                                    {opt}
                                    <ChevronRight size={20} className="text-slate-600 group-hover:text-indigo-400" />
                                </Button>
                            ))}
                        </div>
                    </Card>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title={reader.title}
            subtitle={`By ${reader.author}`}
            onBack={onBack}
            headerRight={
                <Button variant="outline" size="sm" onClick={speakContent}>
                    <Volume2 size={16} className="mr-2" /> Listen
                </Button>
            }
        >
            <div className="max-w-3xl mx-auto px-4 pb-24">
                <Card className="p-8 md:p-12 min-h-[60vh] bg-slate-950/40 backdrop-blur-xl border-white/5 relative">
                    <div className="text-xl md:text-2xl leading-[2.5] text-slate-200 font-serif tracking-wide mb-12">
                        {reader.content.map((item, index) => (
                            <span key={index} className="relative inline-block mx-[3px]">
                                <span
                                    onClick={() => handleWordClick(index)}
                                    className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 ${selectedWordIndex === index
                                            ? 'bg-indigo-500 text-white shadow-lg'
                                            : 'hover:bg-indigo-500/20 hover:text-indigo-300'
                                        }`}
                                >
                                    {item.word}
                                </span>

                                <AnimatePresence>
                                    {selectedWordIndex === index && item.translation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-950 text-white text-sm font-bold rounded-xl whitespace-nowrap z-50 shadow-xl border border-white/10"
                                        >
                                            {item.translation}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-950 border-r border-b border-white/10 transform rotate-45" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-center mt-auto">
                        <Button
                            size="lg"
                            className="px-12 py-6 rounded-2xl animate-pulse-slow shadow-lg shadow-indigo-500/20"
                            onClick={() => {
                                SoundManager.playSuccess();
                                setShowQuiz(true);
                            }}
                        >
                            Complete Reading <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>
        </GameLayout>
    );
};

const ReadingRoom = () => {
    const navigate = useNavigate();
    const { stats, updateStats, addXP, level } = useProgress();
    const [currentReader, setCurrentReader] = useState(null);

    const progress = stats.readingRoomProgress || {};

    const handleComplete = (readerId, score, total) => {
        const reader = GRADED_READERS.find(r => r.id === readerId);
        addXP(reader.xpReward);

        updateStats({
            readingRoomProgress: {
                ...progress,
                [readerId]: {
                    completed: true,
                    score,
                    total,
                    lastRead: Date.now()
                }
            }
        });
    };

    if (currentReader) {
        return (
            <ReaderView
                reader={currentReader}
                onBack={() => setCurrentReader(null)}
                onComplete={handleComplete}
            />
        );
    }

    return (
        <GameLayout
            title="Reading Room"
            subtitle="Graded readers for all levels"
            onBack={() => navigate('/')}
        >
            <LibraryBrowser
                onSelectReader={(reader) => setCurrentReader(reader)}
                userLevel={level}
                progress={progress}
            />
        </GameLayout>
    );
};

export default ReadingRoom;
