import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEtymology } from '../data/etymology';

const EtymologyMap = ({ wordId, onClose }) => {
    const data = getEtymology(wordId);

    if (!data) return null;

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
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-amber-50 rounded-2xl p-0 w-full max-w-md shadow-2xl border-4 border-amber-200 overflow-hidden"
                >
                    {/* Header: The Ancient Scroll Look */}
                    <div className="bg-amber-100 p-6 border-b border-amber-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl">🏛️</div>
                        <h2 className="text-3xl font-serif font-bold text-amber-900 mb-1 capitalize">
                            {data.word}
                        </h2>
                        <div className="text-amber-700 font-mono text-sm tracking-widest uppercase">
                            Time Traveling...
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* The Root */}
                        <div className="relative pl-6 border-l-2 border-amber-300">
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-amber-400 border-2 border-white"></div>
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Origin</h4>
                            <p className="text-lg font-serif text-slate-800 italic">
                                {data.root}
                            </p>
                        </div>

                        {/* The Bridge (Cognates) */}
                        <div className="relative pl-6 border-l-2 border-amber-300">
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-indigo-400 border-2 border-white"></div>
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">English Cousins</h4>
                            <p className="text-slate-700">
                                {data.cognate}
                            </p>
                        </div>

                        {/* The Story */}
                        <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">The Story</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {data.history}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-100/50 text-center">
                        <button
                            onClick={onClose}
                            className="text-amber-700 hover:text-amber-900 font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg px-2 py-1"
                            aria-label="Close etymology details"
                        >
                            Close the Archives
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EtymologyMap;
