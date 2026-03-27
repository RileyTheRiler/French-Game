import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { GRAMMAR_TIPS } from '../data/grammar';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const GrammarModal = ({ isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Tip of the Day based on date
    const tipOfTheDay = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return GRAMMAR_TIPS[dayOfYear % GRAMMAR_TIPS.length];
    }, []);

    const currentTip = GRAMMAR_TIPS[currentIndex];

    const nextTip = () => setCurrentIndex((prev) => (prev + 1) % GRAMMAR_TIPS.length);
    const prevTip = () => setCurrentIndex((prev) => (prev - 1 + GRAMMAR_TIPS.length) % GRAMMAR_TIPS.length);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <Card className="p-0 border-white/10 shadow-3xl overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/30 rounded-2xl">
                                    <BookOpen size={28} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Grammar Tips</h2>
                                    <p className="text-emerald-300/80 text-sm font-medium">
                                        {GRAMMAR_TIPS.length} Tips Available
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0">
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Tip of the Day */}
                        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Lightbulb size={20} className="text-yellow-400" />
                                <span className="text-yellow-300 font-bold text-sm uppercase tracking-wider">Tip of the Day</span>
                            </div>
                            <p className="text-white/80 mt-2 font-medium">{tipOfTheDay.title}</p>
                        </div>

                        {/* Tip Content */}
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="text-center"
                                >
                                    <Badge variant="primary" className="mb-4">
                                        {currentIndex + 1} / {GRAMMAR_TIPS.length}
                                    </Badge>
                                    <h3 className="text-3xl font-black text-white mb-6">
                                        {currentTip.title}
                                    </h3>
                                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
                                        {currentTip.content}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation */}
                        <div className="p-6 border-t border-white/10 flex justify-between items-center">
                            <Button variant="ghost" onClick={prevTip} className="gap-2">
                                <ChevronLeft size={20} /> Previous
                            </Button>
                            <div className="flex gap-1" role="tablist" aria-label="Grammar tips navigation">
                                {GRAMMAR_TIPS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        role="tab"
                                        aria-selected={idx === currentIndex}
                                        aria-label={`Tip ${idx + 1}`}
                                        className={`w-2 h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${idx === currentIndex ? 'bg-emerald-500 w-6' : 'bg-slate-700 hover:bg-slate-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            <Button variant="ghost" onClick={nextTip} className="gap-2">
                                Next <ChevronRight size={20} />
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GrammarModal;
