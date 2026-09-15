import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Volume2 } from 'lucide-react';

const WordDetailModal = ({ isOpen, onClose, word, onSave }) => {
    const [english, setEnglish] = useState('');
    const [gender, setGender] = useState('m'); // default to masculine
    const [type, setType] = useState('noun');

    if (!isOpen || !word) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            french: word,
            english,
            gender: type === 'noun' ? gender : null,
            pos: type,
            category: 'imported'
        });
        // Reset and close
        setEnglish('');
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            Add to Dictionary
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">French Word</label>
                            <div className="text-xl font-bold text-white capitalize">{word}</div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-1">English Translation</label>
                            <input
                                type="text"
                                value={english}
                                onChange={(e) => setEnglish(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="e.g. Cat"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="noun">Noun</option>
                                    <option value="verb">Verb</option>
                                    <option value="adjective">Adjective</option>
                                    <option value="expression">Expression</option>
                                    <option value="adverb">Adverb</option>
                                </select>
                            </div>

                            {type === 'noun' && (
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">Gender</label>
                                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
                                        <button
                                            type="button"
                                            onClick={() => setGender('m')}
                                            className={`flex-1 py-1 rounded-md text-sm font-medium transition-colors ${gender === 'm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            Masc
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGender('f')}
                                            className={`flex-1 py-1 rounded-md text-sm font-medium transition-colors ${gender === 'f' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            Fem
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
                        >
                            <Save size={20} />
                            Save Word
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WordDetailModal;
