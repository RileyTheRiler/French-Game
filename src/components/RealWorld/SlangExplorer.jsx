import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, RefreshCw, CheckCircle, XCircle, Brain, Sparkles } from 'lucide-react';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SLANG_DATA, SLANG_CATEGORIES } from '../../data/slangData';
import { useProgress } from '../../context/ProgressContext';
import SoundManager from '../../utils/SoundManager';
import confetti from 'canvas-confetti';

const SlangExplorer = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState('browse'); // 'browse' or 'quiz'

    // Quiz state
    const [currentQuizItem, setCurrentQuizItem] = useState(null);
    const [userAnswer, setUserAnswer] = useState(''); // For text input if we wanted, but let's do simplified "reveal" or Multiple Choice for now.
    // Let's do a "Decoder" mode: Show slang, pick standard. Or Show standard, pick slang.
    // For simplicity and "Explorer" feel: Flashcard style "Reveal" + "Got it/Missed it" OR Multiple Choice.
    // Implementation Plan mentioned "Decoder" mini-game. Let's do Multiple Choice for engagement.

    const [quizOptions, setQuizOptions] = useState([]);
    const [quizFeedback, setQuizFeedback] = useState(null); // 'correct', 'incorrect'
    const [streak, setStreak] = useState(0);

    // Filter data
    const filteredData = SLANG_DATA.filter(item => {
        const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.standard.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const nextQuestion = (category) => {
        const pool = category
            ? SLANG_DATA.filter(i => i.category === category)
            : SLANG_DATA;

        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        setCurrentQuizItem(randomItem);
        setQuizFeedback(null);

        // Generate options (1 correct, 2 wrong)
        const wrongOptions = SLANG_DATA
            .filter(i => i.id !== randomItem.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(i => i.standard);

        const options = [...wrongOptions, randomItem.standard].sort(() => 0.5 - Math.random());
        setQuizOptions(options);
    };

    const startQuiz = (category = null) => {
        setMode('quiz');
        setStreak(0);
        nextQuestion(category);
    };

    const handleAnswer = (selectedOption) => {
        if (quizFeedback) return;

        const isCorrect = selectedOption === currentQuizItem.standard;

        if (isCorrect) {
            setQuizFeedback('correct');
            SoundManager.playMatch();
            addXP(5);
            setStreak(prev => prev + 1);
            if (streak > 0 && streak % 5 === 0) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }
        } else {
            setQuizFeedback('incorrect');
            SoundManager.playMiss();
            setStreak(0);
        }

        setTimeout(() => {
            if (isCorrect) {
                nextQuestion(selectedCategory);
            }
        }, 1500);
    };

    if (mode === 'quiz' && currentQuizItem) {
        return (
            <GameLayout
                title="Slang Decoder"
                subtitle={`Streak: ${streak}`}
                onBack={() => setMode('browse')}
            >
                <div className="max-w-xl mx-auto p-6">
                    <Card className="p-8 mb-8 text-center bg-slate-800/80 border-slate-600">
                        <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            {SLANG_CATEGORIES.find(c => c.id === currentQuizItem.category)?.title}
                        </Badge>
                        <h2 className="text-4xl font-black text-white mb-2">{currentQuizItem.term}</h2>
                        <p className="text-slate-400 italic mb-6">"{currentQuizItem.example}"</p>

                        <div className="grid gap-3">
                            {quizOptions.map((option, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    onClick={() => handleAnswer(option)}
                                    className={`p-4 h-auto text-lg transition-all
                                        ${quizFeedback === 'correct' && option === currentQuizItem.standard
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                            : quizFeedback === 'incorrect' && option === currentQuizItem.standard
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' // Show correct answer
                                                : ''
                                        }
                                        ${quizFeedback === 'incorrect' && option !== currentQuizItem.standard // You clicked wrong
                                            ? 'opacity-50'
                                            : ''
                                        }
                                    `}
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>

                        {quizFeedback === 'incorrect' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                            >
                                <p className="text-red-300 mb-2">Incorrect!</p>
                                <Button size="sm" onClick={() => nextQuestion(selectedCategory)}>Next Word</Button>
                            </motion.div>
                        )}
                    </Card>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title="Slang & Verlan"
            subtitle="Master the language of the streets"
            onBack={() => navigate('/')}
        >
            <div className="max-w-4xl mx-auto p-4 md:p-6">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search terms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <Button onClick={() => startQuiz(selectedCategory)} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500">
                        <Brain className="mr-2" size={18} />
                        Practice Decoder
                    </Button>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {SLANG_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group
                                ${selectedCategory === cat.id
                                    ? `bg-${cat.color}-500/20 border-${cat.color}-500 ring-1 ring-${cat.color}-500`
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                                }
                            `}
                        >
                            <span className="text-2xl mb-2 block">{cat.icon}</span>
                            <h3 className={`font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-200'}`}>
                                {cat.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                        </button>
                    ))}
                </div>

                {/* Dictionary Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                    {filteredData.map(item => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="p-5 h-full hover:border-indigo-500/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                                            {item.term}
                                        </h3>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                            {SLANG_CATEGORIES.find(c => c.id === item.category)?.title}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-slate-900/50">
                                        Lvl {item.difficulty}
                                    </Badge>
                                </div>

                                <div className="bg-slate-900/50 p-3 rounded-lg mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-slate-400 text-xs">STANDARD:</span>
                                        <span className="text-emerald-400 font-medium">{item.standard}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-xs">LITERAL:</span>
                                        <span className="text-slate-300 italic text-sm">{item.literalMean}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-300 border-l-2 border-indigo-500 pl-3 italic">
                                    "{item.example}"
                                </p>
                            </Card>
                        </motion.div>
                    ))}

                    {filteredData.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <Search className="mx-auto mb-4 opacity-50" size={48} />
                            <p>No slang found matching your criteria.</p>
                        </div>
                    )}
                </div>

            </div>
        </GameLayout>
    );
};

export default SlangExplorer;
