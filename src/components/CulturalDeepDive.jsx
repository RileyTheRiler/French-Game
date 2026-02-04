import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, BookOpen, ChevronLeft, Award, Star,
    Zap, Info, Share2, Sparkles, Map, Heart
} from 'lucide-react';
import { CULTURE_ARTICLES } from '../data/cultureData';
import { useProgress } from '../context/ProgressContext';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { GameLayout } from './layout/GameLayout';
import { speak } from '../utils/audio';
import { Volume2 } from 'lucide-react';

const ArticleCard = ({ article, isNew, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <Card
            onClick={onClick}
            className="cursor-pointer overflow-hidden border-white/5 bg-slate-900/40 hover:bg-slate-800/60 transition-all group"
        >
            <div className="flex gap-4 p-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl shadow-inner border border-white/5">
                    {article.image}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 font-black">
                            {article.category}
                        </Badge>
                        {isNew && (
                            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {article.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-1 mt-1 font-light italic">
                        Explore the rich history of French {article.category.toLowerCase()}
                    </p>
                </div>
                <ChevronLeft className="rotate-180 text-slate-600 group-hover:text-indigo-400 transition-colors" size={20} />
            </div>
        </Card>
    </motion.div>
);

const ArticleViewer = ({ article, onBack, onComplete }) => {
    const { globalDifficulty } = useProgress();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);
    const [scrolled, setScrolled] = useState(0);
    const [selectedHighlight, setSelectedHighlight] = useState(null);

    const handleScroll = (e) => {
        const element = e.target;
        const scrollPercent = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
        setScrolled(scrollPercent);
    };

    // Replace **word** with a highlighted span
    const formatContent = (content) => {
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const frenchWord = part.slice(2, -2);
                const highlight = article.highlights.find(h => h.french.toLowerCase() === frenchWord.toLowerCase());

                return (
                    <span
                        key={i}
                        onClick={() => {
                            SoundManager.playPop();
                            setSelectedHighlight(highlight);
                        }}
                        className="text-indigo-400 font-bold border-b-2 border-indigo-500/30 cursor-help hover:bg-indigo-500/10 rounded px-1 transition-all"
                    >
                        {frenchWord}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <GameLayout
            title={article.title}
            subtitle={article.category}
            onBack={onBack}
        >
            <div className="max-w-3xl mx-auto px-4 pb-20 mt-6 relative">
                {/* Scroll Progress Bar */}
                <div className="fixed top-20 left-0 w-full h-1 bg-slate-900 z-50">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${scrolled}%` }}
                    />
                </div>

                <div
                    onScroll={handleScroll}
                    className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 overflow-y-auto max-h-[70vh] custom-scrollbar shadow-2xl"
                >
                    <div className="flex items-center gap-6 mb-10">
                        <div className="text-6xl bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                            {article.image}
                        </div>
                        <div>
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-0 mb-2">Essential Culture</Badge>
                            <h2 className="text-3xl md:text-4xl font-black text-white">{article.title}</h2>
                        </div>
                    </div>

                    <div className="text-xl leading-loose text-slate-300 font-light tracking-wide space-y-6">
                        {formatContent(article.content)}
                    </div>

                    <div className="mt-12 pt-12 border-t border-white/5 flex flex-col items-center">
                        <p className="text-slate-500 mb-6 text-sm text-center italic">
                            Did you enjoy this cultural deep dive? Compete the article to earn XP!
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-7 rounded-2xl shadow-xl shadow-indigo-500/20"
                            onClick={() => {
                                SoundManager.playSuccess();
                                onComplete(article.id);
                            }}
                        >
                            Finish Article & Earn 30 XP <Sparkles size={18} className="ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Translation Tooltip Overlay */}
                <AnimatePresence>
                    {selectedHighlight && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm z-50 px-4"
                        >
                            <Card className="bg-slate-900 border-indigo-500/50 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                        <BookOpen size={20} />
                                    </div>
                                    <button
                                        onClick={() => setSelectedHighlight(null)}
                                        className="text-slate-500 hover:text-white"
                                    >
                                        <ChevronLeft className="rotate-90" />
                                    </button>
                                </div>
                                <h4 className="text-2xl font-black text-white mb-1">{selectedHighlight.french}</h4>
                                <p className="text-indigo-300 font-medium mb-4 text-emerald-400">{selectedHighlight.english}</p>
                                <div className="h-px bg-white/5 mb-4" />
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => speak(selectedHighlight.french, 'fr-FR', difficultyConfig?.audioSpeed || 1)}>
                                        <Volume2 size={14} className="mr-2" /> Pronounce
                                    </Button>
                                    <Button size="sm" variant="ghost" className="flex-1 text-xs">
                                        <Heart size={14} className="mr-2" /> Save to Deck
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

const CulturalDeepDive = () => {
    const navigate = useNavigate();
    const { stats, updateStats, addXP } = useProgress();
    const [currentArticle, setCurrentArticle] = useState(null);
    const [filter, setFilter] = useState('all');

    const readArticles = stats.cultureArticlesRead || [];

    const handleComplete = (articleId) => {
        const article = CULTURE_ARTICLES.find(a => a.id === articleId);
        addXP(article.xpReward);

        if (!readArticles.includes(articleId)) {
            updateStats({
                cultureArticlesRead: [...readArticles, articleId]
            });
        }

        setCurrentArticle(null);
        SoundManager.playLevelUp();
    };

    const categories = ['all', ...new Set(CULTURE_ARTICLES.map(a => a.category))];

    if (currentArticle) {
        return (
            <ArticleViewer
                article={currentArticle}
                onBack={() => setCurrentArticle(null)}
                onComplete={handleComplete}
            />
        );
    }

    return (
        <GameLayout
            title="Cultural Deep Dives"
            subtitle="Master the nuances of French civilization"
            onBack={() => navigate('/')}
        >
            <div className="max-w-4xl mx-auto px-4 mt-4">
                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-6 mb-2">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={filter === cat ? 'primary' : 'outline'}
                            size="sm"
                            className="rounded-full whitespace-nowrap capitalize px-6 border-white/10"
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Article List */}
                <div className="flex flex-col gap-4">
                    {CULTURE_ARTICLES.filter(a => filter === 'all' || a.category === filter).map(article => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            isNew={!readArticles.includes(article.id)}
                            onClick={() => {
                                SoundManager.playFlip();
                                setCurrentArticle(article);
                            }}
                        />
                    ))}
                </div>

                {/* Footer Stats */}
                <div className="mt-12 flex items-center justify-between p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-black">Cosmopolitan Progress</p>
                            <p className="text-lg font-bold text-white">{readArticles.length} / {CULTURE_ARTICLES.length} Articles Read</p>
                        </div>
                    </div>
                    <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${(readArticles.length / CULTURE_ARTICLES.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </GameLayout>
    );
};

export default CulturalDeepDive;
