import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Book, Utensils, Lightbulb, MapPin, Volume2, CheckCircle } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import SoundManager from '../../utils/SoundManager';

const TABS = [
    { id: 'dialect', label: 'Dialect', icon: Book },
    { id: 'cuisine', label: 'Cuisine', icon: Utensils },
    { id: 'culture', label: 'Culture', icon: Lightbulb }
];

const RegionExplorer = ({ region, onBack }) => {
    const { addXP, updateRegionProgress } = useProgress();
    const [activeTab, setActiveTab] = useState('dialect');
    const [learnedItems, setLearnedItems] = useState(new Set());
    const [selectedWord, setSelectedWord] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);

    const markAsLearned = (itemId) => {
        if (!learnedItems.has(itemId)) {
            const newLearned = new Set(learnedItems);
            newLearned.add(itemId);
            setLearnedItems(newLearned);
            addXP(10);
            SoundManager.playMatch();

            // Update region progress
            const totalItems = region.dialectWords.length + region.cuisineVocabulary.length + region.culturalTips.length;
            const progress = Math.round((newLearned.size / totalItems) * 100);
            updateRegionProgress?.(region.id, progress);
        }
    };

    const speakWord = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    const renderDialectContent = () => (
        <div className="space-y-4">
            <p className="text-slate-300 mb-4">
                Learn regional expressions unique to {region.name}
            </p>

            <div className="grid gap-3">
                {region.dialectWords.map((word, idx) => {
                    const itemId = `dialect-${idx}`;
                    const isLearned = learnedItems.has(itemId);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card
                                className={`p-4 transition-all ${isLearned
                                        ? 'bg-emerald-900/30 border-emerald-500/30'
                                        : 'bg-slate-800/60 hover:bg-slate-700/60'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-lg text-white">{word.word}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => speakWord(word.word)}
                                                className="p-1 h-auto"
                                            >
                                                <Volume2 size={16} className="text-indigo-400" />
                                            </Button>
                                            {isLearned && (
                                                <CheckCircle className="text-emerald-400" size={16} />
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm">{word.meaning}</p>
                                        <p className="text-indigo-300 text-sm mt-2 italic">"{word.example}"</p>
                                    </div>

                                    {!isLearned && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => markAsLearned(itemId)}
                                            className="shrink-0"
                                        >
                                            Mark Learned
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    const renderCuisineContent = () => (
        <div className="space-y-4">
            <p className="text-slate-300 mb-4">
                Discover the flavors and food vocabulary of {region.name}
            </p>

            <div className="grid gap-4">
                {region.cuisineVocabulary.map((dish, idx) => {
                    const itemId = `cuisine-${idx}`;
                    const isLearned = learnedItems.has(itemId);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card
                                className={`p-5 ${isLearned
                                        ? 'bg-emerald-900/30 border-emerald-500/30'
                                        : 'bg-slate-800/60'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-xl text-white flex items-center gap-2">
                                            🍽️ {dish.dish}
                                            {isLearned && <CheckCircle className="text-emerald-400" size={18} />}
                                        </h4>
                                        <p className="text-slate-400">{dish.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {dish.vocabulary.map((vocab, vIdx) => (
                                        <Badge
                                            key={vIdx}
                                            variant="outline"
                                            className="border-amber-500/30 text-amber-300 cursor-pointer hover:bg-amber-500/20"
                                            onClick={() => speakWord(vocab)}
                                        >
                                            {vocab}
                                        </Badge>
                                    ))}
                                </div>

                                {!isLearned && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => markAsLearned(itemId)}
                                        className="mt-4"
                                    >
                                        Mark as Learned
                                    </Button>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    const renderCultureContent = () => (
        <div className="space-y-4">
            <p className="text-slate-300 mb-4">
                Essential cultural tips for visiting {region.name}
            </p>

            <div className="grid gap-4">
                {region.culturalTips.map((tip, idx) => {
                    const itemId = `culture-${idx}`;
                    const isLearned = learnedItems.has(itemId);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card
                                className={`p-5 ${isLearned
                                        ? 'bg-emerald-900/30 border-emerald-500/30'
                                        : 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/20'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-full shrink-0">
                                        <Lightbulb className="text-indigo-400" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                            {tip.title}
                                            {isLearned && <CheckCircle className="text-emerald-400" size={16} />}
                                        </h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">{tip.tip}</p>

                                        {!isLearned && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => markAsLearned(itemId)}
                                                className="mt-3 text-indigo-400"
                                            >
                                                ✓ Got it!
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Landmarks section */}
            {region.landmarks && (
                <Card className="p-5 bg-slate-800/60 mt-6">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <MapPin className="text-rose-400" size={18} />
                        Must-See Landmarks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {region.landmarks.map((landmark, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="border-rose-500/30 text-rose-300"
                            >
                                📍 {landmark}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    const totalItems = region.dialectWords.length + region.cuisineVocabulary.length + region.culturalTips.length;
    const progress = Math.round((learnedItems.size / totalItems) * 100);

    return (
        <GameLayout
            title={region.name}
            subtitle={region.description}
            onBack={onBack}
            headerRight={
                <Badge
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-300"
                    style={{ borderColor: `${region.color}50`, color: region.color }}
                >
                    {progress}% Complete
                </Badge>
            }
        >
            <div className="max-w-3xl mx-auto p-4">
                {/* Progress bar */}
                <div className="mb-6">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full"
                            style={{ background: `linear-gradient(to right, ${region.color}, ${region.color}99)` }}
                        />
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                        {learnedItems.size} / {totalItems} items learned
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {TABS.map(tab => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'primary' : 'outline'}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 shrink-0"
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {activeTab === 'dialect' && renderDialectContent()}
                        {activeTab === 'cuisine' && renderCuisineContent()}
                        {activeTab === 'culture' && renderCultureContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default RegionExplorer;
