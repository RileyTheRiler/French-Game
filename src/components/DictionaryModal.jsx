import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { playWordAudio } from '../utils/audio';
import { GRAMMAR_TIPS } from '../data/grammar';
import { Star, Pin, Clock3, BellOff, Volume2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/time';
import { Button } from './ui/Button';

const DictionaryModal = ({ onClose, initialSearchTerm = '' }) => {
    const { vocabulary, toggleSaveWord, togglePinWord, snoozeWord, clearSnooze } = useVocabulary();
    const { offlineAudio } = useProgress();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [activeTab, setActiveTab] = useState('vocab'); // 'vocab', 'grammar', 'saved'

    const filteredVocab = vocabulary.filter(word =>
        (activeTab === 'saved' ? word.isSaved : true) &&
        (word.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.english.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredGrammar = GRAMMAR_TIPS.filter(tip =>
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        setTimeout(() => setNow(Date.now()), 0);
    }, [vocabulary]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-lg p-6 relative h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-black text-center mb-6 title-gradient">Resources</h2>

                {/* Tabs */}
                <div role="tablist" className="flex space-x-2 mb-6 bg-white/5 p-1 rounded-xl">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'vocab'}
                        aria-controls="dictionary-content"
                        id="tab-vocab"
                        onClick={() => setActiveTab('vocab')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${activeTab === 'vocab' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
                    >
                        Dictionary
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'saved'}
                        aria-controls="dictionary-content"
                        id="tab-saved"
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${activeTab === 'saved' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
                    >
                        Saved
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'grammar'}
                        aria-controls="dictionary-content"
                        id="tab-grammar"
                        onClick={() => setActiveTab('grammar')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${activeTab === 'grammar' ? 'bg-[var(--accent-secondary)] text-white shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
                    >
                        Grammar
                    </button>
                </div>

                <input
                    type="text"
                    aria-label={`Search ${activeTab === 'vocab' ? 'dictionary' : 'grammar'}`}
                    placeholder={`Search ${activeTab === 'vocab' ? 'dictionary' : 'grammar'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white mb-6 focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                />

                <div
                    role="tabpanel"
                    id="dictionary-content"
                    aria-labelledby={`tab-${activeTab}`}
                    className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar"
                >
                    {activeTab === 'vocab' || activeTab === 'saved' ? (
                        filteredVocab.length > 0 ? (
                            filteredVocab.map(word => {
                                const snoozed = word.snoozeUntil && word.snoozeUntil > now;
                                return (
                                    <div key={word.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">{word.french}</h3>
                                                    <button
                                                        onClick={() => playWordAudio(word, { preferCache: true, offlineOnly: offlineAudio })}
                                                        className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 transition-colors"
                                                        aria-label={`Listen to ${word.french}`}
                                                    >
                                                        <Volume2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-[var(--text-secondary)]">{word.english}</p>
                                                {(word.lastSeen || word.lastPracticed) && (
                                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                                                        <Clock3 size={14} /> Last seen: {formatRelativeTime(word.lastSeen || word.lastPracticed)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                 <span className={`text-xs font-bold px-2 py-1 rounded ${word.level >= 5 ? 'bg-green-500/20 text-green-400' :
                                                    word.level >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-white/10 text-white/40'
                                                }`}>
                                                    Lvl {word.level}
                                                </span>
                                                <button
                                                    onClick={() => toggleSaveWord(word.id)}
                                                    className={`transition-all hover:scale-110 ${word.isSaved ? 'text-amber-400' : 'text-white/20 hover:text-amber-200'}`}
                                                    aria-label={word.isSaved ? "Unsave" : "Save"}
                                                >
                                                    <Star size={20} fill={word.isSaved ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`rounded-full px-3 py-1 h-8 text-xs ${word.pinned ? 'text-emerald-300' : ''}`}
                                                onClick={() => togglePinWord(word.id)}
                                            >
                                                <Pin size={12} className="mr-1" /> {word.pinned ? 'Unpin' : 'Pin'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-full px-3 py-1 h-8 text-xs"
                                                onClick={() => snoozed ? clearSnooze(word.id) : snoozeWord(word.id)}
                                            >
                                                <BellOff size={12} className="mr-1" /> {snoozed ? `Unsnooze` : 'Snooze'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-white/30 mt-10">
                                {activeTab === 'saved' ? "No saved words yet." : "No words found."}
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
                    {activeTab === 'grammar' ? `${GRAMMAR_TIPS.length} grammar tips` : `${filteredVocab.length} words`}
                </div>
            </div>
        </div>
    );
};

export default DictionaryModal;
