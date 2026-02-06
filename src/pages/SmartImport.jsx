import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wand2, Plus, Check } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { analyzeText } from '../utils/textAnalysis';
import WordDetailModal from '../components/SmartImport/WordDetailModal';
import { useNavigate } from 'react-router-dom';

const SmartImport = () => {
    const navigate = useNavigate();
    const { vocabulary, addCustomWord } = useVocabulary();
    const [inputText, setInputText] = useState('');
    const [analyzedTokens, setAnalyzedTokens] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleAnalyze = () => {
        if (!inputText.trim()) return;
        const tokens = analyzeText(inputText, vocabulary);
        setAnalyzedTokens(tokens);
    };

    const handleWordClick = (token) => {
        if (!token.isWord) return;

        if (token.status === 'new') {
            setSelectedWord(token.text);
            setShowModal(true);
        } else {
            // Can add logic to show details of known words here
            console.log("Clicked known word", token);
        }
    };

    const handleSaveWord = (wordData) => {
        addCustomWord(wordData);
        // Re-analyze to update status
        // We need to wait a tick for state update (or ideally pass the new word directly to analyze, but this is simple enough)
        setTimeout(() => {
            const tokens = analyzeText(inputText, [...vocabulary, wordData]); // Optimistic update for re-render
            setAnalyzedTokens(tokens);
        }, 0);
    };

    return (
        <div id="main-content" tabIndex={-1} className="min-h-screen bg-slate-950 p-6 pb-24 font-sans text-slate-100">
            {/* Header */}
            <header className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="text-slate-400" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Smart Content Importer
                </h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="max-w-4xl mx-auto space-y-6">

                {/* Input Section */}
                {!analyzedTokens && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-slate-200">Import Text</h2>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste a French article, story, or conversation here..."
                            className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={!inputText.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <Wand2 size={18} />
                                Analyze Text
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Analyzed View */}
                {analyzedTokens && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-slate-200">Analyzed Content</h2>
                            <button
                                onClick={() => setAnalyzedTokens(null)}
                                className="text-sm text-slate-400 hover:text-white underline"
                            >
                                Edit Text
                            </button>
                        </div>

                        <div className="prose prose-invert max-w-none text-lg leading-loose">
                            {analyzedTokens.map((token, index) => {
                                if (!token.isWord) return <span key={index} className="text-slate-400">{token.text}</span>;

                                let colorClass = "text-slate-300";
                                let bgClass = "transparent";

                                if (token.status === 'known') {
                                    colorClass = "text-emerald-400";
                                } else if (token.status === 'learning') {
                                    colorClass = "text-amber-400";
                                } else if (token.status === 'new') {
                                    colorClass = "text-indigo-300 font-medium decoration-indigo-500/30 underline decoration-2 underline-offset-4 cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-200 transition-colors rounded px-0.5";
                                }

                                return (
                                    <span
                                        key={index}
                                        onClick={() => handleWordClick(token)}
                                        className={`${colorClass} ${bgClass} inline-block`}
                                    >
                                        {token.text}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                <span className="text-slate-400">Known</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-400" />
                                <span className="text-slate-400">Learning</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-400" />
                                <span className="text-slate-400">New (Click to Add)</span>
                            </div>
                        </div>

                    </motion.div>
                )}
            </main>

            <WordDetailModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                word={selectedWord}
                onSave={handleSaveWord}
            />
        </div>
    );
};

export default SmartImport;
