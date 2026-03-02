import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useProgress } from '../../context/ProgressContext';
import SoundManager from '../../utils/SoundManager';
import confetti from 'canvas-confetti';

const ComprehensionQuiz = ({ clip, onComplete }) => {
    const { addXP, updateMediaProgress } = useProgress();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);

    const questions = clip.comprehensionQuestions;
    const currentQuestion = questions[currentIndex];

    const handleAnswer = (index) => {
        if (isAnswered) return;

        setSelectedAnswer(index);
        setIsAnswered(true);

        if (index === currentQuestion.correctIndex) {
            setScore(prev => prev + 1);
            SoundManager.playMatch();
        } else {
            SoundManager.playMiss();
        }
    };

    const finishQuiz = () => {
        const percent = Math.round((score / questions.length) * 100);
        const xpEarned = Math.round((score / questions.length) * clip.xpReward);

        addXP(xpEarned);
        updateMediaProgress?.(clip.id, true, percent);

        setQuizComplete(true);
        if (percent >= 70) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            SoundManager.playSuccess();
        } else {
            SoundManager.playLevelUp(); // generic finish
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            finishQuiz();
        }
    };

    if (quizComplete) {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
            >
                <div className="mb-6 flex justify-center">
                    <div className="p-6 bg-indigo-500/20 rounded-full">
                        <Trophy size={64} className="text-amber-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                <p className="text-slate-400 mb-8">
                    You got {score} out of {questions.length} correct.
                </p>

                <Card className="p-6 bg-slate-800/60 border-slate-700 max-w-sm mx-auto mb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Accuracy</span>
                            <span className={`font-bold ${percent >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {percent}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">XP Earned</span>
                            <span className="text-indigo-400 font-bold">+{Math.round((score / questions.length) * clip.xpReward)}</span>
                        </div>
                    </div>
                </Card>

                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => onComplete(percent)}>
                        Return to Media Center
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8 py-8">
            {/* Progress Bar */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentIndex / questions.length) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-slate-500 font-bold min-w-[50px]">
                    {currentIndex + 1} / {questions.length}
                </span>
            </div>

            {/* Question */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white leading-relaxed">
                    {currentQuestion.question}
                </h2>

                <div className="grid gap-3">
                    {currentQuestion.options.map((option, idx) => {
                        const isCorrect = idx === currentQuestion.correctIndex;
                        const isSelected = idx === selectedAnswer;

                        let variant = "outline";
                        if (isAnswered) {
                            if (isCorrect) variant = "success";
                            else if (isSelected) variant = "danger";
                        }

                        return (
                            <Button
                                key={idx}
                                variant={variant}
                                className={`
                                    h-16 text-lg justify-start px-6 relative overflow-hidden
                                    ${!isAnswered ? 'hover:bg-white/5' : 'cursor-default'}
                                `}
                                onClick={() => handleAnswer(idx)}
                                disabled={isAnswered}
                            >
                                {option}
                                {isAnswered && isCorrect && (
                                    <CheckCircle className="absolute right-4 text-emerald-400" size={20} />
                                )}
                                {isAnswered && isSelected && !isCorrect && (
                                    <XCircle className="absolute right-4 text-red-400" size={20} />
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback & Next */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                    >
                        <Button
                            onClick={handleNext}
                            className="bg-indigo-600 hover:bg-indigo-500 group"
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ComprehensionQuiz;
