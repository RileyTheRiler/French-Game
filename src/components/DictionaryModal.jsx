import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { playWordAudio } from '../utils/audio';
import { GRAMMAR_TIPS } from '../data/grammar';

const DictionaryModal = ({ onClose }) => {
    const { vocabulary } = useVocabulary();
    const { offlineAudio } = useProgress();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('vocab'); // 'vocab' or 'grammar'

    const filteredVocab = vocabulary.filter(word =>
        word.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGrammar = GRAMMAR_TIPS.filter(tip =>
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-lg p-6 relative h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-black text-center mb-6 title-gradient">Resources</h2>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6 bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('vocab')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${activeTab === 'vocab' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
                    >
                        Dictionary
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${activeTab === 'grammar' ? 'bg-[var(--accent-secondary)] text-white shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
                    >
                        Grammar
                    </button>
                </div>

                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'vocab' ? 'dictionary' : 'grammar'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white mb-6 focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                />

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {activeTab === 'vocab' ? (
                        filteredVocab.length > 0 ? (
                            filteredVocab.map(word => (
                                <div key={word.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">{word.french}</h3>
                                        <p className="text-[var(--text-secondary)]">{word.english}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <button
                                            onClick={() => playWordAudio(word, { preferCache: true, offlineOnly: offlineAudio })}
                                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 transition-colors"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${word.level >= 5 ? 'bg-green-500/20 text-green-400' :
                                                word.level >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-white/10 text-white/40'
                                            }`}>
                                            Lvl {word.level}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/30 mt-10">
                                No words found.
                            </div>
                        )
                    ) : (
                        filteredGrammar.length > 0 ? (
                            filteredGrammar.map(tip => (
                                <div key={tip.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <h3 className="text-lg font-bold text-[var(--accent-secondary)] mb-2">{tip.title}</h3>
                                    <p className="text-sm text-white/80 leading-relaxed">{tip.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/30 mt-10">
                                No grammar tips found.
                            </div>
                        )
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-white/30">
                    {activeTab === 'vocab' ? `${vocabulary.length} words` : `${GRAMMAR_TIPS.length} grammar tips`}
                </div>
            </div>
        </div>
    );
};

export default DictionaryModal;
