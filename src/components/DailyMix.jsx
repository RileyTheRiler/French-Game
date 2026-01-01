import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Award, Check, X, Lightbulb } from 'lucide-react';
import { GameLayout } from './layout/GameLayout';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { speak } from '../utils/audio';
import SoundManager from '../utils/SoundManager';
import { calculateRewards } from '../utils/rewardSystem';

const CHALLENGE_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    LISTENING: 'listening',
    REVERSE_FLASHCARD: 'reverse_flashcard'
};

const buildOptions = (word, vocabulary) => {
    const distractors = [...vocabulary]
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.english);
    const options = [word.english, ...distractors].sort(() => Math.random() - 0.5);
    return options;
};

const buildSession = (vocabulary) => {
    const pool = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 8);
    return pool.map((word, idx) => {
        const typeCycle = idx % 3;
        const type = typeCycle === 0 ? CHALLENGE_TYPES.MULTIPLE_CHOICE : typeCycle === 1 ? CHALLENGE_TYPES.LISTENING : CHALLENGE_TYPES.REVERSE_FLASHCARD;
        return {
            id: `${word.id}-${idx}`,
            word,
            options: buildOptions(word, vocabulary),
            type
        };
    });
};

const DailyMix = () => {
    const navigate = useNavigate();
    const { vocabulary, updateWordProgress } = useVocabulary();
    const { addXP, addCoins, updateDailyStat } = useProgress();

    const [sessionQueue, setSessionQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);

    const currentChallenge = sessionQueue[currentIndex];

    useEffect(() => {
        setSessionQueue(buildSession(vocabulary));
        setCurrentIndex(0);
        setIsAnswered(false);
        setIsCorrect(false);
        setSelectedOption(null);
        setSessionComplete(false);
        setCorrectCount(0);
        setSessionReward(null);
    }, [vocabulary]);

    const onExit = () => navigate('/');

    const handleAnswer = (answer) => {
        if (isAnswered || !currentChallenge) return;

        const correct = answer === currentChallenge.word.english;
        setIsCorrect(correct);
        setIsAnswered(true);
        setSelectedOption(answer);

        if (correct) {
            SoundManager.playMatch();
            setCorrectCount(prev => prev + 1);
            updateWordProgress(currentChallenge.word.id, true);
        } else {
            SoundManager.playMiss();
            updateWordProgress(currentChallenge.word.id, false);
        }
    };

    const handleNext = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOption(null);
        } else {
            const reward = calculateRewards('dailyMix', {
                correct: correctCount,
                total: sessionQueue.length
            });
            setSessionReward(reward);
            addXP(reward.xp);
            addCoins(reward.coins);
            updateDailyStat('dailyReviews', sessionQueue.length);
            setSessionComplete(true);
            SoundManager.playLevelUp();
        }
    };

    if (vocabulary.length < 4) {
        return (
            <GameLayout title="Daily Mix" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                    <p className="text-xl text-slate-400">You need at least 4 words in your vocabulary to start a Daily Mix!</p>
                    <Button className="mt-8" onClick={onExit}>Go Back</Button>
                </div>
            </GameLayout>
        );
    }

    if (sessionComplete) {
        return (
            <GameLayout title="Session Complete" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-8 p-8 bg-indigo-500/20 rounded-full"
                    >
                        <Award size={80} className="text-indigo-400" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 title-gradient">Daily Mix Done!</h2>
                    <p className="text-slate-400 mb-8 max-w-md text-lg">
                        Fantastic job! You've practiced with interleaving to boost your memory retention.
                    </p>
                    {sessionReward && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-12 w-full max-w-xs flex flex-col items-center shadow-2xl">
                            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Rewards</span>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <span className="text-3xl font-black text-indigo-400">+{sessionReward.xp}</span>
                                    <p className="text-xs text-indigo-300">XP</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-3xl font-black text-amber-400">+{sessionReward.coins}</span>
                                    <p className="text-xs text-amber-300">Coins</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <Button size="lg" onClick={onExit} className="px-12 py-4 text-xl">
                        Return to Hub
                    </Button>
                </div>
            </GameLayout>
        );
    }

    if (!currentChallenge) return null;

    return (
        <GameLayout
            title="Daily Mix"
            subtitle="Interleaved practice session"
            onBack={onExit}
            headerRight={
                <Badge variant="primary" className="text-lg py-1 px-4">
                    {currentIndex + 1} / {sessionQueue.length}
                </Badge>
            }
        >
            <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">

                {/* Challenge Header */}
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 text-slate-400 border-white/10 flex items-center gap-2 mx-auto w-fit">
                        <Lightbulb size={14} className="text-yellow-400" />
                        {currentChallenge.type === CHALLENGE_TYPES.MULTIPLE_CHOICE && "What does this mean?"}
                        {currentChallenge.type === CHALLENGE_TYPES.LISTENING && "What did you hear?"}
                        {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD && "Can you recall the translation?"}
                    </Badge>

                    <div className="flex items-center justify-center gap-6">
                        {currentChallenge.type === CHALLENGE_TYPES.LISTENING ? (
                            <Button
                                variant="default"
                                size="lg"
                                className="rounded-full w-24 h-24 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 group"
                                onClick={() => speak(currentChallenge.word.french)}
                            >
                                <Volume2 size={40} className="group-hover:scale-110 transition-transform" />
                            </Button>
                        ) : (
                            <h2 className="text-6xl font-black text-white px-8">
                                {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD ? currentChallenge.word.english : currentChallenge.word.french}
                            </h2>
                        )}
                        {currentChallenge.type !== CHALLENGE_TYPES.LISTENING && (
                            <Button
                                variant="ghost"
                                className="rounded-full p-2 h-10 w-10"
                                onClick={() => speak(currentChallenge.word.french)}
                            >
                                <Volume2 size={24} className="text-slate-500" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Challenge Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD ? (
                            <motion.div
                                key="reverse"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-lg"
                            >
                                {!isAnswered ? (
                                    <Card
                                        className="h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-dashed border-2 border-white/10"
                                        onClick={() => handleAnswer(currentChallenge.word.english)}
                                    >
                                        <p className="text-slate-500 uppercase tracking-widest font-bold">Think of the French word</p>
                                        <p className="mt-4 text-indigo-400 font-bold">Click to show answer</p>
                                    </Card>
                                ) : (
                                    <Card className="h-64 flex flex-col items-center justify-center bg-indigo-950/20 border-indigo-500/30">
                                        <h3 className="text-4xl font-black text-indigo-300">{currentChallenge.word.french}</h3>
                                        <div className="mt-12 flex gap-4 w-full px-6">
                                            <Button
                                                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 h-14"
                                                onClick={() => { setIsCorrect(false); handleNext(); }}
                                            >
                                                <X className="mr-2" /> Wrong
                                            </Button>
                                            <Button
                                                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 h-14"
                                                onClick={() => { setIsCorrect(true); setCorrectCount(prev => prev + 1); handleNext(); }}
                                            >
                                                <Check className="mr-2" /> Correct
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="options"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
                            >
                                {currentChallenge.options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        variant={isAnswered ? (option === currentChallenge.word.english ? "success" : (option === selectedOption ? "danger" : "ghost")) : "default"}
                                        className={`p-8 text-xl h-auto rounded-3xl border-2 transition-all ${!isAnswered ? "hover:scale-[1.02] active:scale-[0.98] border-white/10" : ""}`}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span>{option}</span>
                                            {isAnswered && option === currentChallenge.word.english && <Check size={24} />}
                                            {isAnswered && option === selectedOption && option !== currentChallenge.word.english && <X size={24} />}
                                        </div>
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Feedback Footer */}
                {isAnswered && currentChallenge.type !== CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute bottom-0 left-0 right-0 p-8 flex items-center justify-between backdrop-blur-xl border-t-4 shadow-2xl ${isCorrect ? "bg-emerald-950/80 border-emerald-500" : "bg-red-950/80 border-red-500"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                                {isCorrect ? <Check size={32} className="text-white" /> : <X size={32} className="text-white" />}
                            </div>
                            <div>
                                <h4 className={`text-2xl font-black ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                                    {isCorrect ? "Correct!" : "Incorrect"}
                                </h4>
                                {!isCorrect && (
                                    <p className="text-white/70">The correct answer was <span className="font-bold text-white uppercase">{currentChallenge.word.english}</span></p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant={isCorrect ? "success" : "danger"}
                            size="lg"
                            className="px-12 py-6 text-xl rounded-2xl font-black shadow-xl"
                            onClick={handleNext}
                        >
                            Continue
                        </Button>
                    </motion.div>
                )}
            </div>
        </GameLayout>
    );
};

export default DailyMix;
