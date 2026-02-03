import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, ChevronLeft, Award, Lock, BookOpen, Play, Pause,
    RotateCcw, Trophy, Star, Volume2, Check, X, ChevronRight,
    Sparkles, Map
} from 'lucide-react';
import { BRANCHING_STORIES, getStoryById } from '../data/branchingStories';
import { useProgress } from '../context/ProgressContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { GameLayout } from './layout/GameLayout';
import { speak } from '../utils/audio';

// Story Library - Browse available stories
const StoryLibrary = ({ onSelectStory, userLevel, storyProgress }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
            {BRANCHING_STORIES.map((story, idx) => {
                const isLocked = story.level > userLevel;
                const progress = storyProgress[story.id] || { endings: [] };
                const endingsFound = progress.endings?.length || 0;

                return (
                    <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div
                            onClick={() => {
                                if (!isLocked) {
                                    SoundManager.playFlip();
                                    onSelectStory(story);
                                }
                            }}
                            className={`group relative text-left rounded-3xl overflow-hidden aspect-[4/3] transition-all duration-300 ${isLocked
                                    ? 'grayscale opacity-60 cursor-not-allowed'
                                    : 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20'
                                }`}
                        >
                            {/* Cover Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${story.coverColor} p-6 flex flex-col justify-between`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                                {/* Header */}
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="backdrop-blur-md border-transparent bg-white/20 text-white">
                                            Lvl {story.level}
                                        </Badge>
                                        {story.voiceActed && (
                                            <Badge variant="secondary" className="backdrop-blur-md border-transparent bg-white/20 text-white">
                                                <Volume2 size={12} className="mr-1" /> Voice
                                            </Badge>
                                        )}
                                    </div>
                                    {isLocked && <div className="p-2 bg-black/40 rounded-full text-white"><Lock size={16} /></div>}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm mb-4 text-white">
                                        <Map size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">
                                        {story.title}
                                    </h3>
                                    <p className="text-white/90 text-sm line-clamp-2 font-medium leading-relaxed mb-3">
                                        {story.description}
                                    </p>

                                    {/* Progress */}
                                    <div className="flex items-center gap-4 text-white/80 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Trophy size={14} /> {endingsFound}/{story.totalEndings} endings
                                        </span>
                                        <span>~{story.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Completion Badge */}
                            {endingsFound >= story.totalEndings && (
                                <div className="absolute top-6 right-6 z-20 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg transform rotate-3">
                                    <Star size={12} fill="currentColor" /> Complete!
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

// Story Reader - The visual novel interface
const StoryReader = ({ story, onBack, onComplete, savedProgress, onSaveProgress }) => {
    const [currentNodeId, setCurrentNodeId] = useState(savedProgress?.currentNode || story.startNode);
    const [selectedWordIndex, setSelectedWordIndex] = useState(null);
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [quizFeedback, setQuizFeedback] = useState(null);
    const [history, setHistory] = useState(savedProgress?.history || []);
    const [totalXP, setTotalXP] = useState(0);
    const [showEnding, setShowEnding] = useState(false);

    const currentNode = story.nodes[currentNodeId];

    // Save progress when node changes
    useEffect(() => {
        if (onSaveProgress && currentNode?.type !== 'ending') {
            onSaveProgress(story.id, { currentNode: currentNodeId, history });
        }
    }, [currentNodeId, history, onSaveProgress, story.id, currentNode?.type]);

    const handleChoice = (choice) => {
        SoundManager.playPop();
        setHistory([...history, currentNodeId]);
        setCurrentNodeId(choice.nextNode);
        setSelectedWordIndex(null);
    };

    const handleQuizAnswer = (option) => {
        if (quizAnswer !== null) return;

        const isCorrect = option === currentNode.correctAnswer;
        setQuizAnswer(option);
        setQuizFeedback(isCorrect ? currentNode.feedback.correct : currentNode.feedback.incorrect);

        if (isCorrect) {
            SoundManager.playMatch();
            if (currentNode.xpBonus) {
                setTotalXP(prev => prev + currentNode.xpBonus);
            }
            setTimeout(() => {
                setQuizAnswer(null);
                setQuizFeedback(null);
                setHistory([...history, currentNodeId]);
                setCurrentNodeId(currentNode.onCorrect);
            }, 2000);
        } else {
            SoundManager.playMiss();
            setTimeout(() => {
                setQuizAnswer(null);
                setQuizFeedback(null);
            }, 2500);
        }
    };

    const handleEnding = () => {
        setShowEnding(true);
        SoundManager.playSuccess();
        const endingXP = currentNode.xpReward + totalXP;
        onComplete(endingXP, currentNode.id);
    };

    const speakContent = () => {
        if (currentNode.content) {
            const text = currentNode.content.map(w => w.word).join(' ');
            speak(text, 'fr-FR');
        }
    };

    const goBack = () => {
        if (history.length > 0) {
            const prevNode = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentNodeId(prevNode);
            setSelectedWordIndex(null);
            SoundManager.playPop();
        }
    };

    // Render ending screen
    if (currentNode.type === 'ending' && !showEnding) {
        handleEnding();
    }

    if (showEnding) {
        const endingColors = {
            good: 'from-green-500 to-emerald-600',
            neutral: 'from-blue-500 to-indigo-600',
            mystery: 'from-purple-500 to-violet-600'
        };

        return (
            <GameLayout
                title={story.title}
                subtitle="Story Complete"
                onBack={onBack}
            >
                <div className="max-w-2xl mx-auto px-4 pb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Card className={`p-8 bg-gradient-to-br ${endingColors[currentNode.endingType] || endingColors.neutral} border-0`}>
                            <Trophy size={64} className="text-yellow-300 mx-auto mb-4" />
                            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0">
                                Ending Unlocked
                            </Badge>
                            <h2 className="text-3xl font-black text-white mb-2">{currentNode.title}</h2>
                            <p className="text-white/80 text-sm mb-6">{currentNode.titleEn}</p>

                            <div className="bg-black/20 rounded-2xl p-6 mb-6">
                                <div className="text-xl text-white leading-relaxed font-serif">
                                    {currentNode.content.map((item, index) => (
                                        <span key={index} className="inline-block mx-[2px]">
                                            <span
                                                onClick={() => setSelectedWordIndex(selectedWordIndex === index ? null : index)}
                                                className="cursor-pointer hover:text-yellow-200 transition-colors relative"
                                            >
                                                {item.word}
                                                {selectedWordIndex === index && item.translation && (
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                        {item.translation}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="bg-white/20 rounded-xl px-6 py-3">
                                    <p className="text-white/80 text-xs">Total XP Earned</p>
                                    <p className="text-2xl font-black text-yellow-300">+{currentNode.xpReward + totalXP}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setCurrentNodeId(story.startNode);
                                        setHistory([]);
                                        setTotalXP(0);
                                        setShowEnding(false);
                                    }}
                                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                                >
                                    <RotateCcw size={16} className="mr-2" /> Play Again
                                </Button>
                                <Button onClick={onBack} className="bg-white text-slate-900 hover:bg-white/90">
                                    Back to Library
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title={story.title}
            subtitle={currentNode.speaker || 'Narrator'}
            onBack={onBack}
            headerRight={
                <div className="flex items-center gap-2">
                    {history.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={goBack}>
                            <RotateCcw size={16} />
                        </Button>
                    )}
                    {totalXP > 0 && (
                        <Badge variant="success">+{totalXP} XP</Badge>
                    )}
                </div>
            }
        >
            <div className="max-w-3xl mx-auto px-4 pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentNodeId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="min-h-[60vh] p-8 md:p-12 bg-slate-900/60 backdrop-blur-xl border-white/5">
                            {/* Speaker badge */}
                            {currentNode.speaker && currentNode.speaker !== 'Narrator' && (
                                <div className="mb-6">
                                    <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">
                                        {currentNode.speaker}
                                    </Badge>
                                </div>
                            )}

                            {/* Narrative content */}
                            {currentNode.type === 'narrative' && (
                                <>
                                    <div className="flex-1 text-xl md:text-2xl leading-[2.5] text-slate-200 font-serif tracking-wide mb-8">
                                        {currentNode.content.map((item, index) => (
                                            <span key={index} className="relative inline-block mx-[3px]">
                                                <span
                                                    onClick={() => {
                                                        if (item.translation) {
                                                            SoundManager.playPop();
                                                            setSelectedWordIndex(selectedWordIndex === index ? null : index);
                                                        }
                                                    }}
                                                    className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 ${selectedWordIndex === index
                                                            ? 'bg-indigo-500 text-white shadow-lg'
                                                            : 'hover:bg-indigo-500/20 hover:text-indigo-300'
                                                        }`}
                                                >
                                                    {item.word}
                                                </span>

                                                {/* Tooltip */}
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

                                    {/* Audio button */}
                                    <div className="flex justify-center mb-8">
                                        <Button variant="outline" size="sm" onClick={speakContent}>
                                            <Volume2 size={16} className="mr-2" /> Listen
                                        </Button>
                                    </div>

                                    {/* Choices */}
                                    <div className="space-y-3">
                                        <p className="text-slate-400 text-sm text-center mb-4">What will you do?</p>
                                        {currentNode.choices.map((choice, idx) => (
                                            <motion.button
                                                key={idx}
                                                onClick={() => handleChoice(choice)}
                                                className="w-full p-4 bg-slate-800/50 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/50 rounded-xl text-left transition-all group"
                                                whileHover={{ x: 8 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-white font-medium">{choice.text}</p>
                                                        <p className="text-slate-400 text-sm">{choice.textEn}</p>
                                                    </div>
                                                    <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Quiz content */}
                            {currentNode.type === 'quiz' && (
                                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                                        <Sparkles size={32} className="text-indigo-400" />
                                    </div>

                                    <Badge variant="outline" className="mb-4">Vocabulary Check</Badge>

                                    <h3 className="text-2xl font-bold text-white mb-2 text-center">{currentNode.question}</h3>
                                    <p className="text-slate-400 text-sm mb-8 text-center">{currentNode.questionEn}</p>

                                    <div className="grid gap-3 w-full max-w-md">
                                        {currentNode.options.map((opt, idx) => {
                                            const isSelected = quizAnswer === opt;
                                            const isCorrect = opt === currentNode.correctAnswer;
                                            const showResult = quizAnswer !== null;

                                            let buttonClass = "py-4 text-lg border-white/10 hover:bg-white/5";
                                            if (showResult && isSelected && isCorrect) {
                                                buttonClass = "py-4 text-lg bg-green-500/20 border-green-500/50 text-green-300";
                                            } else if (showResult && isSelected && !isCorrect) {
                                                buttonClass = "py-4 text-lg bg-red-500/20 border-red-500/50 text-red-300";
                                            }

                                            return (
                                                <Button
                                                    key={idx}
                                                    onClick={() => handleQuizAnswer(opt)}
                                                    disabled={quizAnswer !== null}
                                                    variant="outline"
                                                    className={buttonClass}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {showResult && isSelected && (
                                                            isCorrect ? <Check size={18} /> : <X size={18} />
                                                        )}
                                                        {opt}
                                                    </span>
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <AnimatePresence>
                                        {quizFeedback && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`mt-6 p-4 rounded-xl border text-center ${quizAnswer === currentNode.correctAnswer
                                                        ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                                        : 'bg-red-500/20 border-red-500/50 text-red-200'
                                                    }`}
                                            >
                                                <p className="font-medium">{quizFeedback}</p>
                                                {quizAnswer === currentNode.correctAnswer && currentNode.xpBonus && (
                                                    <p className="text-sm mt-1">+{currentNode.xpBonus} XP bonus!</p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

// Main Component
const BranchingStoryMode = () => {
    const navigate = useNavigate();
    const { level, addXP, stats, updateStats } = useProgress();
    const [currentStory, setCurrentStory] = useState(null);

    // Get story progress from stats
    const storyProgress = stats.branchingStoriesProgress || {};

    const handleSelectStory = useCallback((story) => {
        setCurrentStory(story);
    }, []);

    const handleSaveProgress = useCallback((storyId, progress) => {
        updateStats({
            branchingStoriesProgress: {
                ...storyProgress,
                [storyId]: {
                    ...storyProgress[storyId],
                    ...progress
                }
            }
        });
    }, [storyProgress, updateStats]);

    const handleCompleteStory = useCallback((xp, endingId) => {
        addXP(xp);

        // Track ending
        const existingEndings = storyProgress[currentStory?.id]?.endings || [];
        if (!existingEndings.includes(endingId) && currentStory) {
            updateStats({
                branchingStoriesProgress: {
                    ...storyProgress,
                    [currentStory.id]: {
                        ...storyProgress[currentStory.id],
                        endings: [...existingEndings, endingId],
                        currentNode: null,
                        history: []
                    }
                }
            });
        }
    }, [addXP, currentStory, storyProgress, updateStats]);

    if (currentStory) {
        return (
            <StoryReader
                story={currentStory}
                savedProgress={storyProgress[currentStory.id]}
                onBack={() => setCurrentStory(null)}
                onComplete={handleCompleteStory}
                onSaveProgress={handleSaveProgress}
            />
        );
    }

    return (
        <GameLayout
            title="Story Mode 2.0"
            subtitle="Choose your own adventure in French"
            onBack={() => navigate('/')}
        >
            <StoryLibrary
                onSelectStory={handleSelectStory}
                userLevel={level}
                storyProgress={storyProgress}
            />
        </GameLayout>
    );
};

export default BranchingStoryMode;
