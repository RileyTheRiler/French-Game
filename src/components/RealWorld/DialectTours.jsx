import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Globe, Mic, Info, ArrowRight, Check, X } from 'lucide-react';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { REGIONS, DIALECT_DATA } from '../../data/dialectData';
import { useProgress } from '../../context/ProgressContext';
import SoundManager from '../../utils/SoundManager';
import confetti from 'canvas-confetti';

const DialectTours = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'quiz'

    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'

    // Get items for the selected region
    const regionItems = selectedRegion
        ? DIALECT_DATA.filter(item => item.regionId === selectedRegion.id)
        : [];

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setViewMode('list');
        setCurrentQuestionIndex(0);
        setQuizComplete(false);
        setScore(0);
    };

    const startQuiz = () => {
        setViewMode('quiz');
        setCurrentQuestionIndex(0);
        setQuizComplete(false);
        setScore(0);
        setFeedback(null);
    };

    const handleQuizAnswer = (isDialectTerm) => {
        if (feedback) return;

        // In this simple quiz, we show a term, user has to guess if it's Standard French or Dialect.
        // Wait, better quiz: Show the Standard term, ask for the Dialect equivalent from choices.
        // Let's implement multiple choice.

        const currentItem = regionItems[currentQuestionIndex];
        const isCorrect = isDialectTerm.term === currentItem.term; // Passed the object they clicked

        if (isCorrect) {
            SoundManager.playMatch();
            setFeedback('correct');
            setScore(prev => prev + 10);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        } else {
            SoundManager.playMiss();
            setFeedback('incorrect');
        }

        setTimeout(() => {
            setFeedback(null);
            if (currentQuestionIndex < regionItems.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setQuizComplete(true);
                addXP(score + (isCorrect ? 10 : 0));
                SoundManager.playLevelUp();
                confetti({ particleCount: 100, spread: 70 });
            }
        }, 1500);
    };

    const renderMap = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {REGIONS.map(region => (
                <Card
                    key={region.id}
                    onClick={() => handleRegionSelect(region)}
                    className={`p-6 cursor-pointer hover:scale-105 transition-transform group
                        ${selectedRegion?.id === region.id ? `border-${region.color}-500 ring-2 ring-${region.color}-500/50` : ''}
                    `}
                >
                    <div className={`text-4xl mb-4 p-4 bg-${region.color}-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto`}>
                        {region.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{region.title}</h3>
                    <p className="text-slate-400 text-center text-sm">{region.description}</p>
                </Card>
            ))}
        </div>
    );

    const renderRegionView = () => (
        <div className="p-4 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setSelectedRegion(null)} className="mb-6">
                <ArrowRight className="rotate-180 mr-2" /> Back to Map
            </Button>

            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-white mb-2">{selectedRegion.title}</h2>
                <p className="text-slate-400">{selectedRegion.description}</p>
                <Button onClick={startQuiz} className="mt-4 bg-indigo-600 hover:bg-indigo-500">
                    Test your knowledge
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {regionItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-6 h-full border-slate-700 bg-slate-800/50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Dialect</span>
                                    <h3 className={`text-2xl font-bold text-${selectedRegion.color}-400`}>{item.term}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Standard</span>
                                    <h3 className="text-lg font-medium text-emerald-400">{item.standard}</h3>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded-lg mb-3">
                                <p className="text-slate-300 italic">"{item.example}"</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Info size={14} />
                                <span>Meaning: {item.meaning}</span>
                            </div>
                            {item.audioNote && (
                                <div className="flex items-center gap-2 text-xs text-indigo-400 mt-1">
                                    <Mic size={14} />
                                    <span>Note: {item.audioNote}</span>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderQuiz = () => {
        if (quizComplete) {
            return (
                <div className="max-w-md mx-auto p-8 text-center">
                    <Card className="p-8 bg-slate-800 border-slate-700">
                        <Globe className="mx-auto text-indigo-400 mb-4" size={64} />
                        <h2 className="text-3xl font-bold text-white mb-2">Tour Complete!</h2>
                        <p className="text-slate-300 mb-6">You scored {score} points exploring {selectedRegion.title}.</p>
                        <Button onClick={() => setViewMode('list')}>Back to Guide</Button>
                    </Card>
                </div>
            );
        }

        const currentItem = regionItems[currentQuestionIndex];
        // Generate options: The correct term and 2 random terms from other regions or dummy logic
        // Easier: Just 3 options from the same list + maybe one from another list if needed.
        // Let's keep it simple: "What is the {region} word for '{currentItem.standard}'?"

        // Generate distractors
        const otherTerms = regionItems
            .filter(i => i.id !== currentItem.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        const options = [currentItem, ...otherTerms].sort(() => 0.5 - Math.random());

        return (
            <div className="max-w-xl mx-auto p-4">
                <Button variant="ghost" onClick={() => setViewMode('list')} className="mb-6">
                    Cancel Quiz
                </Button>

                <Card className="p-8 text-center bg-slate-800 border-slate-600">
                    <span className="text-sm text-slate-400 uppercase tracking-widest mb-2 block">
                        Question {currentQuestionIndex + 1} / {regionItems.length}
                    </span>
                    <h3 className="text-xl text-white mb-6">
                        In <strong>{selectedRegion.title}</strong>, how do you say:
                        <br />
                        <span className="text-3xl font-bold text-emerald-400 mt-2 block">"{currentItem.standard}"</span>
                    </h3>

                    <div className="space-y-3">
                        {options.map((opt, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className={`w-full p-4 h-auto text-lg transition-all
                                    ${feedback === 'correct' && opt.id === currentItem.id
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                        : feedback === 'incorrect' && opt.id === currentItem.id
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' // Reveal correct
                                            : ''
                                    }
                                     ${feedback === 'incorrect' && opt.id !== currentItem.id // If this was the wrong click
                                        ? 'opacity-50'
                                        : ''
                                    }
                                `}
                                onClick={() => handleQuizAnswer(opt)}
                                disabled={!!feedback}
                            >
                                {opt.term}
                            </Button>
                        ))}
                    </div>

                    {feedback && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                            {feedback === 'correct' ? (
                                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                                    <Check /> Correct!
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
                                    <X /> Incorrect!
                                </div>
                            )}
                        </motion.div>
                    )}
                </Card>
            </div>
        );
    };

    return (
        <GameLayout
            title="Regional Dialect Tours"
            subtitle="Explore the diversity of the Francophonie"
            onBack={() => navigate('/')}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedRegion ? (viewMode === 'quiz' ? 'quiz' : 'region') : 'map'}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                >
                    {!selectedRegion && renderMap()}
                    {selectedRegion && viewMode === 'list' && renderRegionView()}
                    {selectedRegion && viewMode === 'quiz' && renderQuiz()}
                </motion.div>
            </AnimatePresence>
        </GameLayout>
    );
};

export default DialectTours;
