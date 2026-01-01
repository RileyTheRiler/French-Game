import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, BookOpen, ChevronRight, Clock, Star,
    CheckCircle, Lightbulb, AlertTriangle, Zap, Search
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import { useProgress } from '../context/ProgressContext';
import {
    DEEP_DIVE_TOPICS,
    DEEP_DIVE_CATEGORIES,
    getDeepDiveById,
    getDeepDiveByCategory
} from '../data/grammarDeepDive';

/**
 * GrammarDeepDive
 * A dedicated mode for serious learners who want comprehensive grammar explanations.
 * Provides in-depth coverage with linguistic reasoning, not just pattern memorization.
 */
const GrammarDeepDive = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [completedTopics, setCompletedTopics] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Filter topics based on search and category
    const filteredTopics = useMemo(() => {
        let topics = DEEP_DIVE_TOPICS;

        if (selectedCategory) {
            topics = topics.filter(t => t.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            topics = topics.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        return topics;
    }, [selectedCategory, searchQuery]);

    const handleCompleteTopic = (topicId) => {
        if (!completedTopics.includes(topicId)) {
            setCompletedTopics(prev => [...prev, topicId]);
            addXP(75); // Reward for completing deep dive
        }
        setSelectedTopic(null);
    };

    // Topic list view
    if (!selectedTopic) {
        return (
            <GameLayout
                title="Grammar Deep Dive"
                subtitle="In-depth explanations for serious learners"
                onBack={() => navigate('/')}
            >
                {/* Search and Filter */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={selectedCategory === null ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </Button>
                            {Object.entries(DEEP_DIVE_CATEGORIES).map(([key, cat]) => (
                                <Button
                                    key={key}
                                    variant={selectedCategory === key ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(key)}
                                    className="gap-1"
                                >
                                    {cat.icon} {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {filteredTopics.map((topic, idx) => {
                        const isCompleted = completedTopics.includes(topic.id);
                        const category = DEEP_DIVE_CATEGORIES[topic.category];

                        return (
                            <motion.button
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTopic(topic)}
                                className="text-left"
                            >
                                <Card className={`
                                    h-full transition-colors group
                                    ${isCompleted
                                        ? 'border-emerald-500/30 bg-emerald-500/5'
                                        : 'hover:border-indigo-500/50'
                                    }
                                `}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{topic.icon}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs border-${category.color}-500/30 text-${category.color}-300`}
                                            >
                                                {category.name}
                                            </Badge>
                                        </div>
                                        {isCompleted ? (
                                            <CheckCircle size={20} className="text-emerald-400" />
                                        ) : (
                                            <ChevronRight
                                                size={20}
                                                className="text-slate-500 group-hover:text-indigo-400 transition-colors"
                                            />
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {topic.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        {topic.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {topic.estimatedTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={14} />
                                            Level {topic.level}
                                        </span>
                                    </div>
                                </Card>
                            </motion.button>
                        );
                    })}
                </div>

                {filteredTopics.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">No topics found matching your search.</p>
                    </div>
                )}
            </GameLayout>
        );
    }

    // Topic content view
    return (
        <GameLayout
            title={selectedTopic.title}
            subtitle={selectedTopic.description}
            onBack={() => setSelectedTopic(null)}
        >
            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                {/* Topic Header */}
                <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl">{selectedTopic.icon}</span>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="primary">
                                    {DEEP_DIVE_CATEGORIES[selectedTopic.category].name}
                                </Badge>
                                <Badge variant="outline" className="text-slate-400">
                                    <Clock size={12} className="mr-1" />
                                    {selectedTopic.estimatedTime}
                                </Badge>
                            </div>
                            <p className="text-slate-300">
                                This deep dive will give you a comprehensive understanding of {selectedTopic.title.toLowerCase()}.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Sections */}
                {selectedTopic.sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-6 md:p-8">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                    ${section.type === 'why' ? 'bg-purple-500/20 text-purple-400' :
                                        section.type === 'pattern' ? 'bg-indigo-500/20 text-indigo-400' :
                                            section.type === 'exceptions' ? 'bg-amber-500/20 text-amber-400' :
                                                section.type === 'memoryTrick' ? 'bg-pink-500/20 text-pink-400' :
                                                    section.type === 'comparison' ? 'bg-cyan-500/20 text-cyan-400' :
                                                        section.type === 'practice' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            'bg-white/10 text-white'
                                    }
                                `}>
                                    {section.type === 'why' && <Lightbulb size={20} />}
                                    {section.type === 'pattern' && <Zap size={20} />}
                                    {section.type === 'exceptions' && <AlertTriangle size={20} />}
                                    {section.type === 'memoryTrick' && '💡'}
                                    {section.type === 'comparison' && '⚖️'}
                                    {section.type === 'practice' && <CheckCircle size={20} />}
                                    {!['why', 'pattern', 'exceptions', 'memoryTrick', 'comparison', 'practice'].includes(section.type) && (idx + 1)}
                                </span>
                                <h3 className="text-xl font-bold text-white">{section.title}</h3>
                            </div>

                            {/* Section Content */}
                            {section.type === 'why' && (
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </div>
                                </div>
                            )}

                            {section.type === 'pattern' && (
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-line font-mono text-sm bg-slate-900/50 p-4 rounded-xl">
                                        {section.content}
                                    </div>
                                </div>
                            )}

                            {section.type === 'comparison' && (
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </div>
                                </div>
                            )}

                            {section.type === 'exceptions' && (
                                <div className="space-y-2">
                                    {section.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                                            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-bold text-white">{item.word}</span>
                                                {item.before && item.after ? (
                                                    <div className="text-sm text-slate-400 mt-1">
                                                        <div>Before noun: {item.before}</div>
                                                        <div>After noun: {item.after}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm ml-2">— {item.note}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.type === 'memoryTrick' && (
                                <div className="p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20">
                                    <div className="text-pink-200 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </div>
                                </div>
                            )}

                            {section.type === 'practice' && section.exercises && (
                                <div className="space-y-4">
                                    {section.exercises.map((ex, i) => (
                                        <div key={i} className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
                                            <p className="font-medium text-white mb-2">{ex.prompt}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-400 font-bold">{ex.answer}</span>
                                                {ex.explanation && (
                                                    <span className="text-slate-500 text-sm">— {ex.explanation}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}

                {/* Related Topics */}
                {selectedTopic.relatedTopics && selectedTopic.relatedTopics.length > 0 && (
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Related Topics</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedTopic.relatedTopics.map(topicId => {
                                const related = getDeepDiveById(topicId);
                                if (!related) return null;
                                return (
                                    <Button
                                        key={topicId}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedTopic(related)}
                                        className="gap-2"
                                    >
                                        {related.icon} {related.title}
                                        <ChevronRight size={14} />
                                    </Button>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* Complete Button */}
                <div className="flex justify-center pt-8">
                    <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 rounded-full shadow-xl shadow-emerald-500/20"
                        onClick={() => handleCompleteTopic(selectedTopic.id)}
                    >
                        <CheckCircle className="mr-2" />
                        {completedTopics.includes(selectedTopic.id) ? 'Review Complete' : 'Mark as Learned'} (+75 XP)
                    </Button>
                </div>
            </div>
        </GameLayout>
    );
};

export default GrammarDeepDive;
