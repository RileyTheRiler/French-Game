import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { playWordAudio } from '../utils/audio';
import { GRAMMAR_TIPS } from '../data/grammar';
import VocabItem from './Dictionary/VocabItem';
import GrammarItem from './Dictionary/GrammarItem';

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

    // Use useState to initialize 'now' once on mount, keeping it stable.
    // This allows React.memo in VocabItem to work effectively as 'now' won't change on every render.
    // If real-time snooze updates are needed, this strategy would need adjustment, but for a modal session it's usually sufficient.
    const [now] = useState(() => Date.now());

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
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${activeTab === 'saved' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
                    >
                        Saved
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
                    {activeTab === 'vocab' || activeTab === 'saved' ? (
                        filteredVocab.length > 0 ? (
                            filteredVocab.map(word => (
                                <VocabItem
                                    key={word.id}
                                    word={word}
                                    now={now}
                                    onPlayAudio={playWordAudio}
                                    onToggleSave={toggleSaveWord}
                                    onTogglePin={togglePinWord}
                                    onSnooze={snoozeWord}
                                    onClearSnooze={clearSnooze}
                                    offlineAudio={offlineAudio}
                                />
                            ))
                        ) : (
                            <div className="text-center text-white/30 mt-10">
                                {activeTab === 'saved' ? "No saved words yet." : "No words found."}
                            </div>
                        )
                    ) : (
                        filteredGrammar.length > 0 ? (
                            filteredGrammar.map(tip => (
                                <GrammarItem key={tip.id} tip={tip} />
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
