
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, X, ChevronRight, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { GRAMMAR_DEEP_DIVE } from '../data/grammarDeepDive';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import confetti from 'canvas-confetti';

const GrammarDeepDive = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [quizMode, setQuizMode] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleTopicSelect = (topic) => {
        setSelectedTopic(topic);
        setCurrentSection(0);
        setQuizMode(false);
        setQuizAnswers({});
        setShowResults(false);
    };

    const handleAnswer = (questionIndex, optionIndex) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const submitQuiz = () => {
        setShowResults(true);
        const correctCount = selectedTopic.quiz.reduce((acc, q, idx) => {
            return acc + (quizAnswers[idx] === q.correct ? 1 : 0);
        }, 0);

        if (correctCount === selectedTopic.quiz.length) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            addXP(100); // Generous reward for mastering a topic
        } else {
            addXP(20 * correctCount);
        }
    };

    if (!selectedTopic) {
        return (
            <div className="min-h-screen bg-slate-950 p-4 md:p-8 pb-24">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/')} className="rounded-full">
                            <ArrowLeft />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">Grammar Deep Dive</h1>
                            <p className="text-slate-400">Master the complex mechanics of French</p>
                        </div>
                    </header>

                    <div className="grid gap-4">
                        {GRAMMAR_DEEP_DIVE.map(topic => (
                            <motion.div
                                key={topic.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTopicSelect(topic)}
                                className="cursor-pointer"
                            >
                                <Card className="p-6 border-slate-800 hover:border-indigo-500/50 transition-colors bg-slate-900/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="p-4 bg-indigo-500/10 rounded-2xl">
                                                <BookOpen className="text-indigo-400" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{topic.title}</h3>
                                                <p className="text-slate-400 text-sm mb-3">{topic.description}</p>
                                                <Badge variant="outline" className={
                                                    topic.difficulty === 'Advanced' ? 'text-rose-400 border-rose-400/30' :
                                                        topic.difficulty === 'Intermediate' ? 'text-amber-400 border-amber-400/30' :
                                                            'text-emerald-400 border-emerald-400/30'
                                                }>
                                                    {topic.difficulty}
                                                </Badge>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-slate-600" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
                        <ArrowLeft className="mr-2" size={18} /> Back
                    </Button>
                    <h2 className="font-bold text-white hidden md:block">{selectedTopic.title}</h2>
                    <div className="w-8" />
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
                <AnimatePresence mode="wait">
                    {!quizMode ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Topic Progress Dots */}
                            <div className="flex justify-center gap-2 mb-8">
                                {selectedTopic.sections.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSection ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'
                                            }`}
                                    />
                                ))}
                                <div className={`h-2 rounded-full transition-all duration-300 ${quizMode ? 'w-8 bg-amber-500' : 'w-2 bg-slate-700'
                                    }`} />
                            </div>

                            <Card className="p-8 min-h-[400px] flex flex-col justify-center bg-slate-900 border-slate-800">
                                <h3 className="text-2xl font-bold text-indigo-300 mb-6">
                                    {selectedTopic.sections[currentSection].title}
                                </h3>
                                <div className="prose prose-invert prose-lg max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                                        {selectedTopic.sections[currentSection].content.split('\n').map((line, i) => {
                                            if (line.trim().startsWith('-')) {
                                                return <li key={i} className="ml-4 list-disc marker:text-indigo-500">{line.substring(1)}</li>
                                            }
                                            if (line.match(/^\d+\./)) {
                                                return <div key={i} className="mb-2 font-bold text-white">{line}</div>
                                            }
                                            return <p key={i} className="mb-4">{line}</p>
                                        })}
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-between mt-8">
                                <Button
                                    disabled={currentSection === 0}
                                    onClick={() => setCurrentSection(prev => prev - 1)}
                                    variant="ghost"
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (currentSection < selectedTopic.sections.length - 1) {
                                            setCurrentSection(prev => prev + 1);
                                        } else {
                                            setQuizMode(true);
                                        }
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-500"
                                >
                                    {currentSection < selectedTopic.sections.length - 1 ? 'Next Section' : 'Take Quiz'}
                                    <ChevronRight className="ml-2" size={18} />
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-8">
                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-4 py-2 text-lg">
                                    Knowledge Check
                                </Badge>
                                <h3 className="text-3xl font-black text-white mt-4">Prove your mastery!</h3>
                            </div>

                            <div className="space-y-6">
                                {selectedTopic.quiz.map((q, qIdx) => {
                                    const isCorrect = quizAnswers[qIdx] === q.correct;
                                    const isAnswered = quizAnswers[qIdx] !== undefined;

                                    return (
                                        <Card key={qIdx} className={`p-6 border-slate-800 ${showResults && isCorrect ? 'border-green-500/30 bg-green-900/10' :
                                                showResults && !isCorrect ? 'border-red-500/30 bg-red-900/10' : ''
                                            }`}>
                                            <p className="text-lg font-bold text-white mb-4">{q.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {q.options.map((opt, oIdx) => (
                                                    <button
                                                        key={oIdx}
                                                        disabled={showResults}
                                                        onClick={() => handleAnswer(qIdx, oIdx)}
                                                        className={`p-4 rounded-xl text-left border-2 transition-all ${quizAnswers[qIdx] === oIdx
                                                                ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                                                : 'border-slate-700 hover:border-slate-600 text-slate-300'
                                                            } ${showResults && oIdx === q.correct ? '!border-green-500 !bg-green-500/20 !text-white' : ''
                                                            } ${showResults && quizAnswers[qIdx] === oIdx && oIdx !== q.correct ? '!border-red-500 !bg-red-500/20' : ''
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            {showResults && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    className="mt-4 pt-4 border-t border-white/5"
                                                >
                                                    <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-rose-400'}`}>
                                                        {isCorrect ? 'Correct! ' : 'Incorrect. '}
                                                        <span className="text-slate-400">{q.explanation}</span>
                                                    </p>
                                                </motion.div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>

                            {!showResults ? (
                                <div className="flex justify-center pt-8">
                                    <Button
                                        size="lg"
                                        onClick={submitQuiz}
                                        disabled={Object.keys(quizAnswers).length < selectedTopic.quiz.length}
                                        className="bg-green-600 hover:bg-green-500 px-12 text-lg"
                                    >
                                        Submit Answers
                                    </Button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center pt-8 gap-4"
                                >
                                    <Button variant="ghost" onClick={() => setQuizMode(false)}>
                                        Review Material
                                    </Button>
                                    <Button onClick={() => handleTopicSelect(null)}>
                                        Choose Another Topic
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GrammarDeepDive;
