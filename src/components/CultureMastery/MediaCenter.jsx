import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search, Filter, Clock, Zap, BookOpen, Film, Radio, Users } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MEDIA_CLIPS, getCategories } from '../../data/mediaClips';
import MediaPlayer from './MediaPlayer';
import ComprehensionQuiz from './ComprehensionQuiz';

const MediaCenter = () => {
    const navigate = useNavigate();
    const { stats } = useProgress();

    // UI State
    const [selectedClip, setSelectedClip] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quizMode, setQuizMode] = useState(false);
    const [viewMode, setViewMode] = useState('browse'); // browse, watch, quiz

    const categories = useMemo(() => ['all', ...getCategories()], []);

    const filteredClips = useMemo(() => {
        return MEDIA_CLIPS.filter(clip => {
            const matchesTab = activeTab === 'all' || clip.category === activeTab;
            const matchesSearch = clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clip.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchQuery]);

    const getClipStatus = (clipId) => {
        return stats.mediaProgress?.[clipId] || { watched: false, quizScore: 0 };
    };

    const handleClipSelect = (clip) => {
        setSelectedClip(clip);
        setViewMode('watch');
    };

    const handleQuizStart = () => {
        setViewMode('quiz');
    };

    const handleQuizComplete = (score) => {
        // Results are handled inside ComprehensionQuiz via ProgressContext
        setViewMode('browse');
        setSelectedClip(null);
    };

    const renderBrowse = () => (
        <div className="max-w-6xl mx-auto p-4">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search clips..."
                        className="w-full bg-slate-800 border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={activeTab === cat ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab(cat)}
                            className="capitalize whitespace-nowrap"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClips.map((clip, idx) => {
                    const status = getClipStatus(clip.id);
                    return (
                        <motion.div
                            key={clip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card
                                className="overflow-hidden bg-slate-800/80 border-slate-700 group cursor-pointer"
                                onClick={() => handleClipSelect(clip)}
                            >
                                <div className="relative aspect-video bg-slate-900 group-hover:opacity-90 transition-opacity">
                                    {/* Placeholder for real thumbnail */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-slate-900">
                                        {clip.category === 'movie' && <Film className="text-white/20" size={48} />}
                                        {clip.category === 'news' && <Radio className="text-white/20" size={48} />}
                                        {clip.category === 'interview' && <Users className="text-white/20" size={48} />}
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-4 bg-indigo-600 rounded-full shadow-xl">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white">
                                        {Math.floor(clip.duration / 60)}:{(clip.duration % 60).toString().padStart(2, '0')}
                                    </div>

                                    {status.watched && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                            <CheckCircle size={10} /> Watched
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-[10px] uppercase border-slate-600">
                                            {clip.category}
                                        </Badge>
                                        <Badge
                                            variant={clip.difficulty === 'Beginner' ? 'success' : clip.difficulty === 'Intermediate' ? 'warning' : 'destructive'}
                                            className="text-[10px]"
                                        >
                                            {clip.difficulty}
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-white text-lg line-clamp-1">{clip.title}</h3>
                                    <p className="text-sm text-slate-400 mb-4">{clip.titleEn}</p>

                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Zap size={12} className="text-amber-400" />
                                            {clip.xpReward} XP
                                        </span>
                                        {status.quizScore > 0 && (
                                            <span className="text-emerald-400 font-bold">
                                                Quiz: {status.quizScore}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredClips.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-lg">No clips found matching your search.</p>
                </div>
            )}
        </div>
    );

    const renderWatch = () => (
        <div className="max-w-5xl mx-auto p-4">
            <MediaPlayer
                clip={selectedClip}
                onQuizStart={handleQuizStart}
            />
        </div>
    );

    const renderQuiz = () => (
        <div className="max-w-2xl mx-auto p-4">
            <ComprehensionQuiz
                clip={selectedClip}
                onComplete={handleQuizComplete}
            />
        </div>
    );

    return (
        <GameLayout
            title="Media Center"
            subtitle="Authentic immersion at native speeds"
            onBack={() => {
                if (viewMode !== 'browse') setViewMode('browse');
                else navigate('/');
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {viewMode === 'browse' && renderBrowse()}
                    {viewMode === 'watch' && renderWatch()}
                    {viewMode === 'quiz' && renderQuiz()}
                </motion.div>
            </AnimatePresence>
        </GameLayout>
    );
};

export default MediaCenter;
