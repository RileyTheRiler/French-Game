import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, MessageSquare, Star, Flag, ChevronRight, Edit3 } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const CorrectionReview = ({ onBack }) => {
    const { pendingWritings, submitCorrection, myCorrections } = useCommunity();
    const [selectedWriting, setSelectedWriting] = useState(null);
    const [corrections, setCorrections] = useState([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'correct', 'history'

    // Add a correction
    const addCorrection = (start, end, original, corrected, explanation) => {
        setCorrections(prev => [...prev, {
            id: Date.now(),
            start,
            end,
            original,
            correction: corrected,
            explanation
        }]);
    };

    // Remove a correction
    const removeCorrection = (id) => {
        setCorrections(prev => prev.filter(c => c.id !== id));
    };

    // Submit corrections
    const handleSubmit = async () => {
        if (!selectedWriting) return;

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 600));
        submitCorrection(selectedWriting.id, corrections, comment);
        setIsSubmitting(false);
        setCorrections([]);
        setComment('');
        setSelectedWriting(null);
        setView('list');
    };

    // Simple inline correction tool
    const InlineCorrectionTool = () => {
        const [selection, setSelection] = useState('');
        const [correctedText, setCorrectedText] = useState('');
        const [explanation, setExplanation] = useState('');
        const [showForm, setShowForm] = useState(false);

        const handleTextSelect = () => {
            const selected = window.getSelection().toString().trim();
            if (selected) {
                setSelection(selected);
                setCorrectedText(selected);
                setShowForm(true);
            }
        };

        const handleAdd = () => {
            if (selection && correctedText) {
                addCorrection(0, selection.length, selection, correctedText, explanation);
                setSelection('');
                setCorrectedText('');
                setExplanation('');
                setShowForm(false);
            }
        };

        return (
            <div className="space-y-4">
                {/* The text to correct */}
                <div
                    className="bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white leading-relaxed select-text"
                    onMouseUp={handleTextSelect}
                >
                    {selectedWriting?.text}
                </div>

                <p className="text-sm text-slate-500">
                    💡 Tip: Select text above to add a correction
                </p>

                {/* Correction form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-800/50 rounded-xl p-4 border border-white/10"
                        >
                            <h4 className="font-medium text-white mb-3">Add Correction</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Original</label>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-red-300">
                                        {selection}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Correction</label>
                                    <input
                                        type="text"
                                        value={correctedText}
                                        onChange={(e) => setCorrectedText(e.target.value)}
                                        className="w-full bg-green-500/10 border border-green-500/20 rounded px-3 py-2 text-green-300 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Explanation (optional)</label>
                                    <input
                                        type="text"
                                        value={explanation}
                                        onChange={(e) => setExplanation(e.target.value)}
                                        placeholder="e.g., 'Use avoir for age, not être'"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} size="sm">
                                        <Check size={14} className="mr-1" /> Add
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Added corrections */}
                {corrections.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300">Your Corrections ({corrections.length})</h4>
                        {corrections.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                                <div className="flex-1 text-sm">
                                    <span className="line-through text-red-400">{c.original}</span>
                                    <span className="mx-2">→</span>
                                    <span className="text-green-400">{c.correction}</span>
                                    {c.explanation && (
                                        <span className="text-slate-500 ml-2">({c.explanation})</span>
                                    )}
                                </div>
                                <button onClick={() => removeCorrection(c.id)} className="text-slate-500 hover:text-red-400">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // List view
    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onBack} className="h-10 w-10 p-0">
                            <ArrowLeft size={20} />
                        </Button>
                        <h2 className="text-xl font-bold text-white">Help Others</h2>
                    </div>
                    <Button variant="ghost" onClick={() => setView('history')}>
                        My Corrections ({myCorrections.length})
                    </Button>
                </div>

                <p className="text-slate-400">
                    Review writings from other learners and help them improve. Earn XP for each correction!
                </p>

                {pendingWritings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <Edit3 size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No writings to correct right now.</p>
                        <p className="text-sm mt-2">Check back later!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingWritings.map((writing) => (
                            <motion.div
                                key={writing.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Card
                                    className="p-4 cursor-pointer hover:border-violet-500/50 transition-all"
                                    onClick={() => {
                                        setSelectedWriting(writing);
                                        setView('correct');
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">{writing.authorCountry}</span>
                                                <span className="font-medium text-white">{writing.authorName}</span>
                                                <Badge variant="default">Level {writing.authorLevel}</Badge>
                                            </div>
                                            <p className="text-slate-300 text-sm line-clamp-2">{writing.text}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>{new Date(writing.submittedAt).toLocaleString()}</span>
                                                <span className="flex items-center gap-1">
                                                    <Star size={12} className="text-amber-400" />
                                                    +25 XP
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-slate-500" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // History view
    if (view === 'history') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setView('list')} className="h-10 w-10 p-0">
                        <ArrowLeft size={20} />
                    </Button>
                    <h2 className="text-xl font-bold text-white">My Corrections</h2>
                </div>

                {myCorrections.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>You haven't given any corrections yet.</p>
                        <Button onClick={() => setView('list')} className="mt-4">
                            Help Someone
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myCorrections.map((correction) => (
                            <Card key={correction.id} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-400">
                                        {new Date(correction.submittedAt).toLocaleDateString()}
                                    </span>
                                    <Badge variant="success">
                                        <Check size={12} className="mr-1" /> Submitted
                                    </Badge>
                                </div>
                                <p className="text-slate-300 text-sm mb-2">{correction.comment}</p>
                                <div className="text-xs text-slate-500">
                                    {correction.items.length} correction(s) made
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Correction view
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => {
                    setSelectedWriting(null);
                    setCorrections([]);
                    setComment('');
                    setView('list');
                }} className="h-10 w-10 p-0">
                    <ArrowLeft size={20} />
                </Button>
                <h2 className="text-xl font-bold text-white">Review Writing</h2>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                <span className="text-2xl">{selectedWriting?.authorCountry}</span>
                <div>
                    <div className="font-medium text-white">{selectedWriting?.authorName}</div>
                    <div className="text-xs text-slate-400">Level {selectedWriting?.authorLevel}</div>
                </div>
            </div>

            {/* Correction tool */}
            <InlineCorrectionTool />

            {/* Overall comment */}
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                    <MessageSquare size={14} className="inline mr-1" />
                    Overall Feedback
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write an encouraging message for the learner..."
                    className="w-full h-24 bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                />
            </div>

            {/* Submit */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (corrections.length === 0 && !comment)}
                className="w-full"
                size="lg"
            >
                {isSubmitting ? 'Submitting...' : (
                    <>
                        <Check size={18} className="mr-2" />
                        Submit Correction (+25 XP)
                    </>
                )}
            </Button>
        </div>
    );
};

export default CorrectionReview;
