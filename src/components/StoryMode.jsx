import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronLeft, Award, Lock, BookOpen } from 'lucide-react';
import { STORIES } from '../data/stories';
import { useProgress } from '../context/ProgressContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { npcSystem } from '../systems/NPCSystem';
import { GameLayout } from './layout/GameLayout';
import { calculateRewards } from '../utils/rewardSystem';

const LibraryShelf = ({ onSelectStory, userLevel }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {STORIES.map((story, idx) => {
            const isLocked = story.level > userLevel;
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
                        className={`group relative text-left rounded-3xl overflow-hidden aspect-[3/4] transition-all duration-300 ${isLocked ? 'grayscale opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20'}`}
                    >
                        {/* Cover Art Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${story.coverColor} p-8 flex flex-col justify-between`}>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                            <div className="relative z-10 flex justify-between items-start">
                                <Badge variant={isLocked ? "outline" : "secondary"} className="backdrop-blur-md border-transparent bg-white/20 text-white">
                                    Lvl {story.level}
                                </Badge>
                                {isLocked && <div className="p-2 bg-black/40 rounded-full text-white"><Lock size={16} /></div>}
                            </div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm mb-6 text-white">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight mb-3 drop-shadow-md">
                                    {story.title}
                                </h3>
                                <p className="text-white/90 text-sm line-clamp-3 font-medium leading-relaxed">
                                    {story.description}
                                </p>
                            </div>
                        </div>

                        {/* XP Tag */}
                        {!isLocked && (
                            <div className="absolute top-6 right-6 z-20 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                                <Award size={12} /> +{story.xpReward} XP
                            </div>
                        )}
                    </div>
                </motion.div>
            );
        })}
    </div>
);

const StoryReader = ({ story, onBack, onComplete, reward }) => {
    const [selectedWordIndex, setSelectedWordIndex] = useState(null);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizFeedback, setQuizFeedback] = useState(null);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [quizAttempts, setQuizAttempts] = useState(0);

    const handleReadComplete = () => {
        if (!story.quiz) {
            finishStory(true);
        } else {
            setShowQuiz(true);
            SoundManager.playPop();
        }
    };

    const handleQuizAnswer = (option) => {
        if (quizAnswered) return;

        const isCorrect = option === story.quiz.correctAnswer;
        const attempts = quizAttempts + 1;
        setQuizAttempts(attempts);
        const feedback = npcSystem.reactToQuiz('librarian', isCorrect);

        setQuizFeedback(feedback);
        setQuizAnswered(true);

        if (isCorrect) {
            SoundManager.playMatch();
            setTimeout(() => {
                finishStory(attempts === 1);
            }, 2000);
        } else {
            SoundManager.playMiss();
            setTimeout(() => {
                setQuizAnswered(false);
                setQuizFeedback(null);
            }, 2500);
        }
    };

    const finishStory = (quizPerfect = false) => {
        setHasCompleted(true);
        setShowQuiz(false); // Hide quiz if showing
        SoundManager.playSuccess();
        onComplete({ xpReward: story.xpReward, quizPerfect });
    };

    return (
        <GameLayout
            title={story.title}
            subtitle={showQuiz ? "Comprehension Check" : "Click words to translate."}
            onBack={onBack}
            headerRight={hasCompleted && <Badge variant="success">Completed</Badge>}
        >
            <div className="max-w-3xl mx-auto pb-20">
                <Card className="min-h-[60vh] p-8 md:p-12 md:pb-20 bg-slate-900/40 backdrop-blur-xl border-white/5 relative">
                    {!showQuiz ? (
                        <>
                            <div className="flex-1 text-xl md:text-2xl leading-relaxed md:leading-loose text-slate-100 font-['Crimson_Pro',serif] tracking-wide">
                                {story.content.map((item, index) => (
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

                            <div className="mt-16 flex justify-center">
                                <Button
                                    onClick={handleReadComplete}
                                    disabled={hasCompleted}
                                    size="lg"
                                    className={`px-12 py-6 text-xl rounded-2xl ${hasCompleted ? 'opacity-50' : 'animate-pulse-slow'}`}
                                    variant={hasCompleted ? "secondary" : "primary"}
                                >
                                    {hasCompleted ? "Story Finished" : "Finish Story"}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[50vh]">
                            <div className="mb-8 text-center">
                                <Badge variant="outline" className="mb-4">Luc (Bibliothécaire)</Badge>
                                <h3 className="text-2xl font-bold text-white mb-6">{story.quiz.question}</h3>
                            </div>

                            <div className="grid gap-4 w-full max-w-md">
                                {story.quiz.options.map((opt, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleQuizAnswer(opt)}
                                        disabled={quizAnswered}
                                        variant="outline"
                                        className="py-4 text-lg border-white/10 hover:bg-white/5"
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {quizFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mt-8 p-4 rounded-xl border ${quizFeedback.sentiment === 'happy' ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-slate-800 border-white/10 text-slate-300'}`}
                                    >
                                        <p className="font-medium italic">"{quizFeedback.text}"</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {hasCompleted && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-40">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900 p-8 rounded-3xl border border-indigo-500/30 text-center shadow-2xl max-w-sm"
                            >
                                <Award size={64} className="text-yellow-400 mx-auto mb-6" />
                                <h3 className="text-3xl font-black text-white mb-2">Excellent!</h3>
                                <p className="text-slate-400 mb-6">You've completed this story.</p>
                                <div className="grid grid-cols-2 gap-3 bg-indigo-500/10 rounded-xl p-4 mb-8 border border-indigo-500/30">
                                    <div className="text-center">
                                        <p className="text-indigo-300 font-bold text-2xl">+{reward?.xp ?? story.xpReward} XP</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-amber-300 font-bold text-2xl">+{reward?.coins ?? 0} ⛃</p>
                                    </div>
                                </div>
                                <Button size="lg" onClick={onBack} className="w-full">
                                    Back to Library
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </Card>
            </div>
        </GameLayout>
    );
};

const StoryMode = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { level, addXP, addCoins, updateDailyStat, incrementStat } = useProgress();
    const [currentStory, setCurrentStory] = useState(null);
    const [completionReward, setCompletionReward] = useState(null);

    const handleSelectStory = (story) => {
        setCurrentStory(story);
        setCompletionReward(null);
    };

    const handleCompleteStory = (meta) => {
        if (!currentStory) return;
        const reward = calculateRewards('story', {
            baseXp: meta?.xpReward ?? currentStory.xpReward,
            difficulty: currentStory.level >= 3 ? 'Advanced' : currentStory.level === 2 ? 'Intermediate' : 'Beginner',
            length: currentStory.content.length,
            quizPerfect: meta?.quizPerfect
        });
        setCompletionReward(reward);
        addXP(reward.xp);
        addCoins(reward.coins);
        updateDailyStat('dailyStories', 1);
        incrementStat('storiesCompleted', 1);
        if (meta?.quizPerfect) {
            incrementStat('perfectQuizzes', 1);
        }
    };

    if (currentStory) {
        return (
            <StoryReader
                story={currentStory}
                onBack={() => setCurrentStory(null)}
                onComplete={handleCompleteStory}
                reward={completionReward}
            />
        );
    }

    return (
        <GameLayout
            title="La Bibliothèque"
            subtitle="Explore stories tailored to your level."
            onBack={onExit}
        >
            <LibraryShelf onSelectStory={handleSelectStory} userLevel={level} />
        </GameLayout>
    );
};

export default StoryMode;
