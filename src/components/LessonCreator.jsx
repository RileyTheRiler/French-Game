import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Save, Trash2, Edit3, Share2,
    Book, List, CheckSquare, Sparkles, ChevronRight, X, Play
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { speak } from '../utils/audio';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { GameLayout } from './layout/GameLayout';

const LessonCreator = () => {
    const navigate = useNavigate();
    const { stats, updateStats, addXP, globalDifficulty } = useProgress();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    const [step, setStep] = useState('list'); // list, create_deck, create_quiz, study
    const [userLessons, setUserLessons] = useState(() => {
        const saved = localStorage.getItem('frenchApp_userLessons');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentLesson, setCurrentLesson] = useState({
        id: '',
        title: '',
        type: 'deck',
        content: []
    });

    const [studyIndex, setStudyIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);

    const [newWord, setNewWord] = useState({ french: '', english: '' });
    const [newQuizItem, setNewQuizItem] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    useEffect(() => {
        localStorage.setItem('frenchApp_userLessons', JSON.stringify(userLessons));
    }, [userLessons]);

    const handleCreateNew = (type) => {
        setCurrentLesson({
            id: Date.now().toString(),
            title: '',
            type,
            content: []
        });
        setStep(type === 'deck' ? 'create_deck' : 'create_quiz');
        SoundManager.playPop();
    };

    const startStudy = (lesson) => {
        setCurrentLesson(lesson);
        setStudyIndex(0);
        setShowTranslation(false);
        setStep('study');
        SoundManager.playFlip();
    };

    const handleNextStudy = () => {
        if (studyIndex < currentLesson.content.length - 1) {
            setStudyIndex(prev => prev + 1);
            setShowTranslation(false);
            SoundManager.playPop();
        } else {
            addXP(20);
            SoundManager.playSuccess();
            setStep('list');
        }
    };

    const addWordToDeck = () => {
        if (!newWord.french || !newWord.english) return;
        setCurrentLesson(prev => ({
            ...prev,
            content: [...prev.content, { ...newWord, id: Date.now().toString() }]
        }));
        setNewWord({ french: '', english: '' });
        SoundManager.playMatch();
    };

    const removeWordFromDeck = (id) => {
        setCurrentLesson(prev => ({
            ...prev,
            content: prev.content.filter(item => item.id !== id)
        }));
        SoundManager.playPop();
    };

    const addQuizToLesson = () => {
        if (!newQuizItem.question || !newQuizItem.correctAnswer || newQuizItem.options.some(o => !o)) return;
        setCurrentLesson(prev => ({
            ...prev,
            content: [...prev.content, { ...newQuizItem, id: Date.now().toString() }]
        }));
        setNewQuizItem({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: ''
        });
        SoundManager.playMatch();
    };

    const saveLesson = () => {
        if (!currentLesson.title || currentLesson.content.length === 0) return;

        const existingIdx = userLessons.findIndex(l => l.id === currentLesson.id);
        if (existingIdx >= 0) {
            const updated = [...userLessons];
            updated[existingIdx] = currentLesson;
            setUserLessons(updated);
        } else {
            setUserLessons([...userLessons, currentLesson]);
            updateStats({
                userLessonsCreated: (stats.userLessonsCreated || 0) + 1
            });
        }

        setStep('list');
        SoundManager.playSuccess();
    };

    const deleteLesson = (id) => {
        setUserLessons(prev => prev.filter(l => l.id !== id));
        SoundManager.playMiss();
    };

    const renderList = () => (
        <GameLayout
            title="Lesson Creator"
            subtitle="Build and share your own learning materials"
            onBack={() => navigate('/')}
        >
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card
                        onClick={() => handleCreateNew('deck')}
                        hover
                        className="p-8 text-center bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border-indigo-500/20 cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                            <Book size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Create Flashcard Deck</h3>
                        <p className="text-sm text-slate-400">Build a custom set of vocabulary words to master.</p>
                    </Card>

                    <Card
                        onClick={() => handleCreateNew('quiz')}
                        hover
                        className="p-8 text-center bg-gradient-to-br from-purple-900/40 to-slate-900/60 border-purple-500/20 cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                            <CheckSquare size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Create Custom Quiz</h3>
                        <p className="text-sm text-slate-400">Design your own multiple-choice challenges.</p>
                    </Card>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <List className="text-indigo-400" size={20} /> My Creations
                    </h4>
                    <Badge variant="outline" className="border-white/10 text-slate-500">{userLessons.length} Lessons</Badge>
                </div>

                <div className="flex flex-col gap-4">
                    {userLessons.map(lesson => (
                        <Card key={lesson.id} className="p-4 border-white/5 bg-slate-900/40 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lesson.type === 'deck' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {lesson.type === 'deck' ? <Book size={20} /> : <CheckSquare size={20} />}
                                </div>
                                <div>
                                    <h5 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{lesson.title}</h5>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">{lesson.content.length} Items • {lesson.type}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)} aria-label="Delete lesson">
                                    <Trash2 size={16} className="text-slate-600 hover:text-red-400" />
                                </Button>
                                <Button variant="secondary" size="icon" onClick={() => {
                                    setCurrentLesson(lesson);
                                    setStep(lesson.type === 'deck' ? 'create_deck' : 'create_quiz');
                                }} aria-label="Edit lesson">
                                    <Edit3 size={16} />
                                </Button>
                                <Button variant="primary" size="icon" onClick={() => startStudy(lesson)} aria-label="Start lesson">
                                    <Play size={16} fill="currentColor" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {userLessons.length === 0 && (
                        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                            <p className="text-slate-500">You haven't created any lessons yet. Start by choosing a type above!</p>
                        </div>
                    )}
                </div>
            </div>
        </GameLayout>
    );

    const renderCreateQuiz = () => (
        <GameLayout
            title={currentLesson.title || "New MCQ Quiz"}
            subtitle="Design your questions"
            onBack={() => setStep('list')}
        >
            <div className="max-w-3xl mx-auto px-4 mt-4 pb-24">
                <Card className="p-6 mb-6 bg-slate-900/60 border-white/10">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="quiz-title" className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Quiz Title</label>
                            <input
                                id="quiz-title"
                                type="text"
                                value={currentLesson.title}
                                onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., French Food Quiz"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label htmlFor="new-question" className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-4 block">New Question</label>
                            <input
                                id="new-question"
                                type="text"
                                value={newQuizItem.question}
                                onChange={(e) => setNewQuizItem(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="What is 'The Sun' in French?"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 outline-none"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {newQuizItem.options.map((opt, idx) => (
                                    <div key={idx} className="relative">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...newQuizItem.options];
                                                newOpts[idx] = e.target.value;
                                                setNewQuizItem(prev => ({ ...prev, options: newOpts }));
                                            }}
                                            aria-label={`Option ${idx + 1}`}
                                            placeholder={`Option ${idx + 1}`}
                                            className={`w-full bg-slate-950/50 border rounded-xl px-4 py-3 text-white outline-none ${newQuizItem.correctAnswer === opt && opt !== '' ? 'border-emerald-500' : 'border-white/10'}`}
                                        />
                                        <button
                                            onClick={() => setNewQuizItem(prev => ({ ...prev, correctAnswer: opt }))}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-black uppercase ${newQuizItem.correctAnswer === opt && opt !== '' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                                        >
                                            Correct
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full" onClick={addQuizToLesson}>
                                <Plus size={20} className="mr-2" /> Add Question
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-4">Questions ({currentLesson.content.length})</h4>
                    {currentLesson.content.map((item) => (
                        <Card key={item.id} className="p-4 border-white/5 bg-slate-900/40">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white mb-2">{item.question}</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {item.options.map((opt, idx) => (
                                            <span key={idx} className={item.correctAnswer === opt ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeWordFromDeck(item.id)} aria-label="Remove question">
                                    <X size={18} className="text-slate-600 hover:text-red-400" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
                    <Button
                        size="lg"
                        variant="primary"
                        className="w-full h-16 rounded-2xl shadow-xl shadow-indigo-500/20"
                        onClick={saveLesson}
                        disabled={!currentLesson.title || currentLesson.content.length === 0}
                    >
                        <Save size={20} className="mr-2" /> Save Quiz
                    </Button>
                </div>
            </div>
        </GameLayout>
    );

    const renderCreateDeck = () => (
        <GameLayout
            title={currentLesson.title || "New Flashcard Deck"}
            subtitle="Add words and phrases"
            onBack={() => setStep('list')}
        >
            <div className="max-w-3xl mx-auto px-4 mt-4">
                <Card className="p-6 mb-6 bg-slate-900/60 border-white/10">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="lesson-title" className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Lesson Title</label>
                            <input
                                id="lesson-title"
                                type="text"
                                value={currentLesson.title}
                                onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., My Grocery Trip"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="french-word" className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">French</label>
                                <input
                                    id="french-word"
                                    type="text"
                                    value={newWord.french}
                                    onChange={(e) => setNewWord(prev => ({ ...prev, french: e.target.value }))}
                                    placeholder="Le fromage"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="english-word" className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">English</label>
                                <input
                                    id="english-word"
                                    type="text"
                                    value={newWord.english}
                                    onChange={(e) => setNewWord(prev => ({ ...prev, english: e.target.value }))}
                                    placeholder="The cheese"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <Button className="w-full h-14 rounded-xl font-bold" onClick={addWordToDeck}>
                            <Plus size={20} className="mr-2" /> Add Word
                        </Button>
                    </div>
                </Card>

                <div className="space-y-3 mb-24">
                    <h4 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-4">Words in this deck ({currentLesson.content.length})</h4>
                    <AnimatePresence initial={false}>
                        {currentLesson.content.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex items-center justify-between group"
                            >
                                <div className="flex gap-4">
                                    <span className="font-bold text-white">{item.french}</span>
                                    <span className="text-indigo-400">→</span>
                                    <span className="text-slate-400 italic">{item.english}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeWordFromDeck(item.id)} aria-label="Remove word" className="opacity-0 group-hover:opacity-100 transition-all">
                                    <X size={18} className="text-slate-600 hover:text-red-400" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
                    <Button
                        size="lg"
                        variant="primary"
                        disabled={!currentLesson.title || currentLesson.content.length === 0}
                        className="w-full h-16 rounded-2xl shadow-xl shadow-indigo-500/20"
                        onClick={saveLesson}
                    >
                        <Save size={20} className="mr-2" /> Save Lesson
                    </Button>
                </div>
            </div>
        </GameLayout>
    );

    const renderStudy = () => {
        const item = currentLesson.content[studyIndex];
        const isQuiz = currentLesson.type === 'quiz';

        if (isQuiz) {
            return (
                <GameLayout
                    title={currentLesson.title}
                    subtitle={`Question ${studyIndex + 1} of ${currentLesson.content.length}`}
                    onBack={() => setStep('list')}
                >
                    <div className="max-w-xl mx-auto px-4 mt-12 flex flex-col items-center">
                        <Card className="w-full p-8 bg-slate-900 border-white/5 text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-8">{item.question}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {item.options.map((opt, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        className="py-6 text-lg justify-start px-6 group"
                                        onClick={() => {
                                            if (opt === item.correctAnswer) {
                                                SoundManager.playMatch();
                                                handleNextStudy();
                                            } else {
                                                SoundManager.playMiss();
                                            }
                                        }}
                                    >
                                        <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-4 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {opt}
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
                title={currentLesson.title}
                subtitle={`Card ${studyIndex + 1} of ${currentLesson.content.length}`}
                onBack={() => setStep('list')}
            >
                <div className="max-w-xl mx-auto px-4 mt-12 flex flex-col items-center">
                    <motion.div
                        key={studyIndex}
                        initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        className="w-full aspect-[4/3] perspective-1000"
                    >
                        <Card
                            onClick={() => {
                                setShowTranslation(!showTranslation);
                                SoundManager.playFlip();
                            }}
                            className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 border-indigo-500/30 cursor-pointer text-center relative overflow-hidden"
                        >
                            <div className="absolute top-4 left-4">
                                <Badge variant="outline" className="border-indigo-500/20 text-indigo-400">Tap to flip</Badge>
                            </div>

                            <AnimatePresence mode="wait">
                                {!showTranslation ? (
                                    <motion.h3
                                        key="fr"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-4xl md:text-5xl font-black text-white"
                                    >
                                        {item.french}
                                    </motion.h3>
                                ) : (
                                    <motion.div
                                        key="en"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-4xl md:text-5xl font-black text-indigo-400">{item.english}</h3>
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); speak(item.french, 'fr-FR', difficultyConfig.audioSpeed); }}>
                                                <Volume2 size={16} className="mr-2" /> Listen
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>

                    <div className="w-full mt-12">
                        <Button
                            className="w-full h-16 rounded-2xl font-bold text-lg"
                            disabled={!showTranslation}
                            onClick={handleNextStudy}
                        >
                            {studyIndex < currentLesson.content.length - 1 ? "Next Card" : "Finish Lesson"} <ChevronRight size={20} className="ml-2" />
                        </Button>
                        <p className="text-center text-slate-500 mt-4 text-xs font-bold uppercase tracking-widest">
                            Reveal the translation to continue
                        </p>
                    </div>
                </div>
            </GameLayout>
        );
    };

    if (step === 'study') return renderStudy();
    return step === 'create_quiz' ? renderCreateQuiz() : step === 'create_deck' ? renderCreateDeck() : renderList();
};

export default LessonCreator;
