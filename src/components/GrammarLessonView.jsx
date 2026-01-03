import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, BookOpen, ArrowLeft, Lightbulb } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useProgress } from '../context/ProgressContext';
import { GRAMMAR_LESSONS, getLessonsByLevel } from '../data/grammarLessons';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from './layout/GameLayout';

const GrammarLessonView = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [selectedLesson, setSelectedLesson] = useState(null);

    // If no lesson selected, show list
    if (!selectedLesson) {
        const lessons = getLessonsByLevel(2); // Show all available for now

        return (
            <GameLayout
                title="Grammar Library"
                subtitle="Master the rules of French."
                onBack={() => navigate('/')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {lessons.map(lesson => (
                        <motion.button
                            key={lesson.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedLesson(lesson)}
                            className="text-left"
                        >
                            <Card className="h-full hover:border-indigo-500/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                                        Level {lesson.level}
                                    </Badge>
                                    <BookOpen size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                                <p className="text-slate-400 text-sm">{lesson.description}</p>
                            </Card>
                        </motion.button>
                    ))}
                </div>
            </GameLayout>
        );
    }

    // Lesson Content View
    return (
        <GameLayout
            title={selectedLesson.title}
            onBack={() => setSelectedLesson(null)}
        >
            <div className="max-w-3xl mx-auto space-y-8 pb-12">
                {selectedLesson.sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-6 md:p-8">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                    {idx + 1}
                                </span>
                                {section.title}
                            </h3>

                            {section.type === 'why' && (
                                <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-6 rounded-r-xl mb-4">
                                    <h4 className="text-indigo-300 font-bold mb-2 flex items-center gap-2">
                                        <Lightbulb size={20} />
                                        Why It Matters
                                    </h4>
                                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </div>
                                </div>
                            )}

                            {section.type === 'explanation' && (
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            )}

                            {section.type === 'examples' && (
                                <div className="grid grid-cols-1 gap-2 bg-slate-900/50 p-4 rounded-xl">
                                    {section.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 border-b border-white/5 last:border-0">
                                            <span className="font-bold text-indigo-300">{item.french}</span>
                                            <span className="text-slate-400">{item.english}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.type === 'practice' && (
                                <div className="space-y-4">
                                    {section.exercises.map((ex, i) => (
                                        <div key={i} className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                                            <p className="mb-2 font-medium text-slate-200">{ex.prompt}</p>
                                            <div className="flex gap-2">
                                                {ex.options.map(opt => (
                                                    <Badge
                                                        key={opt}
                                                        variant="secondary"
                                                        className="cursor-help hover:bg-indigo-500/20"
                                                    >
                                                        {opt}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500 text-right">
                                                Answer: <span className="text-green-400">{ex.answer}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.type === 'tip' && (
                                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
                                    <p className="text-amber-200 text-sm whitespace-pre-line">{section.content}</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}

                <div className="flex justify-center pt-8">
                    <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-500 text-white px-8 rounded-full shadow-xl shadow-green-500/20"
                        onClick={() => {
                            addXP(50);
                            setSelectedLesson(null);
                        }}
                    >
                        <CheckCircle className="mr-2" /> Complete Lesson
                    </Button>
                </div>
            </div>
        </GameLayout>
    );
};

export default GrammarLessonView;
