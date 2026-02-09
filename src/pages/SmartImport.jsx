import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, FileText, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useVocabulary } from '../context/VocabularyContext';

const SmartImport = () => {
    const navigate = useNavigate();
    const { addCustomWord } = useVocabulary();

    const [text, setText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedWords, setExtractedWords] = useState([]);
    const [step, setStep] = useState('input'); // 'input', 'review', 'success'

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setIsProcessing(true);

        // Simulating AI extraction delay
        setTimeout(() => {
            // Mock extraction logic - in real app, call AI service
            const words = text.split(/\s+/).filter(w => w.length > 3).slice(0, 5).map(w => ({
                french: w,
                english: `[Trans: ${w}]`,
                category: 'Smart Import',
                confidence: Math.random()
            }));

            setExtractedWords(words);
            setStep('review');
            setIsProcessing(false);
        }, 1500);
    };

    const handleImport = () => {
        extractedWords.forEach(word => {
            addCustomWord(word);
        });
        setStep('success');
    };

    return (
        <GameLayout
            title="Smart Import"
            subtitle="Turn any text into a lesson"
            onBack={() => navigate('/')}
        >
            <div className="max-w-2xl mx-auto p-4">

                <AnimatePresence mode="wait">
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <Card className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-indigo-400 mb-2">
                                    <FileText size={24} />
                                    <h3 className="font-bold text-lg">Paste French Text</h3>
                                </div>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste an article, lyrics, or conversation here..."
                                    className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:border-indigo-500 outline-none resize-none"
                                />
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!text.trim() || isProcessing}
                                    className="w-full py-3"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2" />
                                            Extract Vocabulary
                                        </>
                                    )}
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'review' && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="p-6 space-y-4">
                                <h3 className="font-bold text-white mb-4">Found {extractedWords.length} words</h3>
                                <div className="space-y-2">
                                    {extractedWords.map((word, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                                            <span className="font-bold text-indigo-300">{word.french}</span>
                                            <span className="text-slate-400">{word.english}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" onClick={() => setStep('input')} className="flex-1">
                                        Back
                                    </Button>
                                    <Button onClick={handleImport} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                                        Import All
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Import Successful!</h2>
                            <p className="text-slate-400 mb-8">Your new vocabulary is ready for practice.</p>
                            <Button onClick={() => navigate('/')} className="px-8">
                                Return Home
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                    <AlertTriangle className="text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-200/80">
                        <strong>Note:</strong> This feature uses local AI simulation. In production, this would connect to an LLM to extract CEFR-graded vocabulary from your text.
                    </p>
                </div>

            </div>
        </GameLayout>
    );
};

export default SmartImport;
