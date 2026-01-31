import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Lightbulb, CheckCircle, Clock, Star, ChevronRight } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const WritingExercise = ({ onBack, initialPromptId = null }) => {
    const { getPrompts, submitWriting, myWritings, WRITING_PROMPTS } = useCommunity();
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [text, setText] = useState('');
    const [showHints, setShowHints] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [view, setView] = useState('prompts'); // 'prompts', 'write', 'history'

    useEffect(() => {
        if (initialPromptId) {
            const prompt = WRITING_PROMPTS.find(p => p.id === initialPromptId);
            if (prompt) {
                const timer = setTimeout(() => {
                    setSelectedPrompt(prompt);
                    setView('write');
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [initialPromptId, WRITING_PROMPTS]);

    const wordCount = text.trim().split(/\s+/).filter(w => w).length;

    const handleSubmit = async () => {
        if (!selectedPrompt || wordCount < selectedPrompt.minWords) return;

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate submission
        submitWriting(text, selectedPrompt.id);
        setIsSubmitting(false);
        setSubmitted(true);
    };

    const handleNewWriting = () => {
        setText('');
        setSelectedPrompt(null);
        setSubmitted(false);
        setView('prompts');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'success';
            case 'Intermediate': return 'warning';
            case 'Advanced': return 'danger';
            default: return 'default';
        }
    };

    // Prompt selection view
    if (view === 'prompts') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onBack} className="h-10 w-10 p-0">
                            <ArrowLeft size={20} />
                        </Button>
                        <h2 className="text-xl font-bold text-white">Writing Exercises</h2>
                    </div>
                    <Button variant="ghost" onClick={() => setView('history')}>
                        My Writings ({myWritings.length})
                    </Button>
                </div>

                <p className="text-slate-400">
                    Choose a prompt and practice your French writing. Native speakers will correct your work!
                </p>

                <div className="grid gap-4">
                    {WRITING_PROMPTS.map((prompt) => (
                        <motion.div
                            key={prompt.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <Card
                                className="p-4 cursor-pointer hover:border-violet-500/50 transition-all"
                                onClick={() => {
                                    setSelectedPrompt(prompt);
                                    setView('write');
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-white">{prompt.title}</h3>
                                            <Badge variant={getDifficultyColor(prompt.difficulty)}>
                                                {prompt.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2">{prompt.promptEn}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>{prompt.minWords}-{prompt.maxWords} words</span>
                                            <span className="flex items-center gap-1">
                                                <Star size={12} className="text-amber-400" />
                                                {prompt.xpReward} XP
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-500" />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // History view
    if (view === 'history') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setView('prompts')} className="h-10 w-10 p-0">
                        <ArrowLeft size={20} />
                    </Button>
                    <h2 className="text-xl font-bold text-white">My Writings</h2>
                </div>

                {myWritings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>You haven't submitted any writings yet.</p>
                        <Button onClick={() => setView('prompts')} className="mt-4">
                            Start Writing
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myWritings.map((writing) => (
                            <Card key={writing.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-white">{writing.promptTitle}</h3>
                                        <p className="text-xs text-slate-500">
                                            {new Date(writing.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge variant={writing.status === 'corrected' ? 'success' : 'warning'}>
                                        {writing.status === 'corrected' ? (
                                            <><CheckCircle size={12} className="mr-1" /> Corrected</>
                                        ) : (
                                            <><Clock size={12} className="mr-1" /> Pending</>
                                        )}
                                    </Badge>
                                </div>
                                <p className="text-slate-300 text-sm line-clamp-2 mb-3">{writing.text}</p>

                                {writing.corrections.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        {writing.corrections.map((correction, idx) => (
                                            <div key={idx} className="bg-slate-800/50 rounded-xl p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">{correction.correctorAvatar}</span>
                                                    <span className="font-medium text-white">{correction.correctorName}</span>
                                                    <span>{correction.correctorCountry}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm">{correction.overallComment}</p>
                                                {correction.items.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {correction.items.map((item, i) => (
                                                            <div key={i} className="text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                                                <span className="line-through text-red-400">{item.original}</span>
                                                                <span className="mx-2">→</span>
                                                                <span className="text-green-400">{item.correction}</span>
                                                                <p className="text-slate-400 mt-1">{item.explanation}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Writing view
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleNewWriting} className="h-10 w-10 p-0">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-white">{selectedPrompt?.title}</h2>
                    <Badge variant={getDifficultyColor(selectedPrompt?.difficulty)}>
                        {selectedPrompt?.difficulty}
                    </Badge>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {submitted ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle size={40} className="text-green-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">Writing Submitted!</h3>
                        <p className="text-slate-400 mb-6">
                            A native speaker will correct your writing soon. You'll be notified when it's ready!
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={() => setView('history')}>
                                View My Writings
                            </Button>
                            <Button onClick={handleNewWriting}>
                                Write Another
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Prompt */}
                        <Card className="p-4 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border-violet-500/20">
                            <p className="text-violet-200 font-medium mb-2">{selectedPrompt?.prompt}</p>
                            <p className="text-slate-400 text-sm italic">{selectedPrompt?.promptEn}</p>
                        </Card>

                        {/* Hints */}
                        <div>
                            <button
                                onClick={() => setShowHints(!showHints)}
                                className="flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors"
                            >
                                <Lightbulb size={16} />
                                {showHints ? 'Hide hints' : 'Show hints'}
                            </button>
                            <AnimatePresence>
                                {showHints && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedPrompt?.hints.map((hint, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-sm border border-amber-500/20"
                                                >
                                                    {hint}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Text Area */}
                        <div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Écrivez votre réponse ici..."
                                className="w-full h-48 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                            />
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <span className={`${wordCount < selectedPrompt?.minWords ? 'text-amber-400' :
                                        wordCount > selectedPrompt?.maxWords ? 'text-red-400' :
                                            'text-green-400'
                                    }`}>
                                    {wordCount} / {selectedPrompt?.minWords}-{selectedPrompt?.maxWords} words
                                </span>
                                <span className="text-slate-500">
                                    <Star size={14} className="inline text-amber-400 mr-1" />
                                    +{selectedPrompt?.xpReward} XP
                                </span>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || wordCount < selectedPrompt?.minWords}
                            className="w-full"
                            size="lg"
                        >
                            {isSubmitting ? (
                                'Submitting...'
                            ) : (
                                <>
                                    <Send size={18} className="mr-2" />
                                    Submit for Correction
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WritingExercise;
