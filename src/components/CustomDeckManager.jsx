import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus, FolderOpen, Trash2, Edit2, Download, Upload,
    X, Check, BookOpen, ArrowLeft, Layers, Search
} from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const DECK_COLORS = [
    { id: 'indigo', class: 'from-indigo-500 to-purple-600' },
    { id: 'emerald', class: 'from-emerald-500 to-teal-600' },
    { id: 'rose', class: 'from-rose-500 to-pink-600' },
    { id: 'amber', class: 'from-amber-500 to-orange-600' },
    { id: 'cyan', class: 'from-cyan-500 to-blue-600' },
    { id: 'violet', class: 'from-violet-500 to-purple-600' }
];

const getColorClass = (colorId) => {
    return DECK_COLORS.find(c => c.id === colorId)?.class || DECK_COLORS[0].class;
};

const DeckCard = ({ deck, onStudy, onEdit, onDelete, onExport }) => {
    const { getDeckWords } = useVocabulary();
    const words = getDeckWords(deck.id);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-panel p-4 hover:bg-white/5 transition-colors group"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClass(deck.color)} flex items-center justify-center`}>
                    <Layers className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{deck.name}</h3>
                    <p className="text-sm text-slate-400">{words.length} words</p>
                </div>
            </div>

            {deck.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{deck.description}</p>
            )}

            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={() => onStudy(deck.id)}
                    disabled={words.length === 0}
                    className="flex-1"
                >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Study
                </Button>
                <button
                    onClick={() => onEdit(deck)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Edit deck"
                >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                    onClick={() => onExport(deck.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Export deck"
                >
                    <Download className="w-4 h-4 text-slate-400" />
                </button>
                <button
                    onClick={() => onDelete(deck.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                    aria-label="Delete deck"
                >
                    <Trash2 className="w-4 h-4 text-red-400" />
                </button>
            </div>
        </motion.div>
    );
};

const DeckEditor = ({ deck, onSave, onClose }) => {
    const { vocabulary, getDeckWords } = useVocabulary();
    const [name, setName] = useState(deck?.name || '');
    const [description, setDescription] = useState(deck?.description || '');
    const [color, setColor] = useState(deck?.color || 'indigo');
    const [selectedWordIds, setSelectedWordIds] = useState(
        deck ? getDeckWords(deck.id).map(w => w.id) : []
    );
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVocabulary = vocabulary.filter(word =>
        word.french.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.english.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50);

    const toggleWord = (wordId) => {
        setSelectedWordIds(prev =>
            prev.includes(wordId)
                ? prev.filter(id => id !== wordId)
                : [...prev, wordId]
        );
    };

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            name: name.trim(),
            description: description.trim(),
            color,
            wordIds: selectedWordIds
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">
                            {deck ? 'Edit Deck' : 'Create Deck'}
                        </h2>
                        <button aria-label="Close editor" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Deck name (e.g., Coffee Shop Words)"
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none mb-3"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none resize-none h-20 mb-3"
                    />

                    {/* Color Picker */}
                    <div className="flex gap-2">
                        {DECK_COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setColor(c.id)}
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.class} transition-transform ${color === c.id ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-60 hover:opacity-100'}`}
                                aria-label={`Select ${c.id} color`}
                            />
                        ))}
                    </div>
                </div>

                {/* Word Selection */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search vocabulary..."
                            className="flex-1 bg-transparent outline-none text-sm"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {selectedWordIds.length} words selected
                    </p>
                </div>

                {/* Word List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {filteredVocabulary.map(word => (
                            <button
                                key={word.id}
                                onClick={() => toggleWord(word.id)}
                                className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedWordIds.includes(word.id)
                                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedWordIds.includes(word.id)
                                    ? 'bg-indigo-500 border-indigo-500'
                                    : 'border-slate-500'
                                    }`}>
                                    {selectedWordIds.includes(word.id) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium">{word.french}</span>
                                    <span className="text-slate-400 mx-2">—</span>
                                    <span className="text-slate-300">{word.english}</span>
                                </div>
                                <span className="text-xs text-slate-500 capitalize">{word.category}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="flex-1"
                    >
                        {deck ? 'Save Changes' : 'Create Deck'}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CustomDeckManager = () => {
    const navigate = useNavigate();
    const { customDecks, createDeck, updateDeck, deleteDeck, exportDeck, importDeck } = useVocabulary();
    const [showEditor, setShowEditor] = useState(false);
    const [editingDeck, setEditingDeck] = useState(null);
    const [importError, setImportError] = useState('');

    const handleStudy = (deckId) => {
        navigate(`/game/flashcards/${deckId}`);
    };

    const handleEdit = (deck) => {
        setEditingDeck(deck);
        setShowEditor(true);
    };

    const handleCreate = () => {
        setEditingDeck(null);
        setShowEditor(true);
    };

    const handleSave = useCallback((data) => {
        if (editingDeck) {
            updateDeck(editingDeck.id, data);
        } else {
            createDeck(data.name, data.description, data.wordIds, data.color);
        }
        setShowEditor(false);
        setEditingDeck(null);
    }, [editingDeck, updateDeck, createDeck]);

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError('');

        try {
            await importDeck(file);
        } catch (err) {
            setImportError(err.message);
        }
        event.target.value = '';
    };

    return (
        <GameLayout
            title="My Study Decks"
            onBack={() => navigate('/')}
        >
            <div className="p-4 max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Deck
                    </Button>

                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        Import Deck
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>

                {importError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                        {importError}
                    </div>
                )}

                {/* Deck Grid */}
                {customDecks.length === 0 ? (
                    <Card className="p-8 text-center">
                        <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No decks yet</h3>
                        <p className="text-slate-400 mb-4">
                            Create custom vocabulary decks for topics you care about.
                        </p>
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Deck
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        <AnimatePresence>
                            {customDecks.map(deck => (
                                <DeckCard
                                    key={deck.id}
                                    deck={deck}
                                    onStudy={handleStudy}
                                    onEdit={handleEdit}
                                    onDelete={deleteDeck}
                                    onExport={exportDeck}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Deck Editor Modal */}
                <AnimatePresence>
                    {showEditor && (
                        <DeckEditor
                            deck={editingDeck}
                            onSave={handleSave}
                            onClose={() => {
                                setShowEditor(false);
                                setEditingDeck(null);
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default CustomDeckManager;
