import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, BookOpen, CheckCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getCultureSession } from '../data/cultureData';
import SoundManager from '../utils/SoundManager';
import confetti from 'canvas-confetti';

const CultureQuestGame = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    // Game State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    useEffect(() => {
        // Fix set-state-in-effect by wrapping in timeout
        const timer = setTimeout(() => {
            setQuestions(getCultureSession());
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const currentQuestion = questions[currentIndex];

    const handleAnswer = (option) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        if (option === currentQuestion.answer) {
            SoundManager.playMatch();
            setScore(s => s + 1);
        } else {
            SoundManager.playMiss();
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedOption(null);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        setGameComplete(true);
        const xpEarned = score * 15; // 15 XP per correct answer
        addXP(xpEarned);
        if (score > questions.length / 2) {
            SoundManager.playLevelUp();
            confetti();
        }
    };

    if (!currentQuestion) return <div>Loading...</div>;

    if (gameComplete) {
        return (
            <GameLayout title="Culture Quest Complete" onBack={() => navigate('/')}>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                    <Globe size={80} className="text-cyan-400" />
                    <h2 className="text-4xl font-black text-white">Quest Complete!</h2>
                    <p className="text-2xl text-slate-300">You scored {score} / {questions.length}</p>
                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/')} variant="secondary">Return Home</Button>
                        <Button onClick={() => window.location.reload()}>Play Again</Button>
                    </div>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title="Culture Quest"
            subtitle="Explore French Culture & History"
            onBack={() => navigate('/')}
            headerRight={
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                    {currentIndex + 1} / {questions.length}
                </Badge>
            }
        >
            <div className="max-w-2xl mx-auto flex flex-col gap-8 p-4 min-h-[60vh]">
                {/* Question Card */}
                <Card className="p-8 bg-slate-800/80 border-cyan-500/20 shadow-2xl shadow-cyan-900/10">
                    <div className="flex items-center gap-2 mb-6">
                        <Badge className="bg-cyan-900/50 text-cyan-300 border-cyan-500/30">
                            {currentQuestion.category}
                        </Badge>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                        {currentQuestion.question}
                    </h2>
                </Card>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option, idx) => {
                        let variant = "outline";
                        if (isAnswered) {
                            if (option === currentQuestion.answer) variant = "success";
                            else if (option === selectedOption) variant = "danger";
                        }

                        return (
                            <Button
                                key={idx}
                                variant={variant}
                                className={`
                                    h-16 text-lg justify-start px-6 relative overflow-hidden
                                    ${!isAnswered ? 'hover:bg-white/5 hover:border-white/30' : ''}
                                `}
                                onClick={() => handleAnswer(option)}
                                disabled={isAnswered}
                            >
                                {option}
                                {isAnswered && option === currentQuestion.answer && (
                                    <CheckCircle className="absolute right-4 text-emerald-400" />
                                )}
                            </Button>
                        );
                    })}
                </div>

                {/* Fact Reveal */}
                <AnimatePresence>
                    {isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-2xl"
                        >
                            <div className="flex items-start gap-3">
                                <BookOpen className="text-indigo-400 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-indigo-300 mb-1">Did you know?</h4>
                                    <p className="text-slate-300">{currentQuestion.fact}</p>
                                </div>
                            </div>
                            <Button onClick={handleNext} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500">
                                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quest"}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default CultureQuestGame;
