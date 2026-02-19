import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock, Star, Share2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const AchievementsModal = ({ onClose }) => {
    const { stats } = useProgress();
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    const unlockedIds = stats.unlockedAchievements || [];

    // Sort: Unlocked first, then by required XP/difficulty
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedIds.includes(a.id);
        const bUnlocked = unlockedIds.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0; // Maintain original order or sort by ID
    });

    const totalXP = sortedAchievements.reduce((sum, ach) =>
        unlockedIds.includes(ach.id) ? sum + ach.xpReward : sum, 0
    );

    const handleShare = (achievement) => {
        if (navigator.share) {
            navigator.share({
                title: 'Achievement Unlocked!',
                text: `I just unlocked "${achievement.title}" in LingoLift! 🏆`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback copy to clipboard or toast
            console.log("Share not supported");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <Card className="flex-1 overflow-hidden flex flex-col border-white/10 p-0">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-white/10 flex justify-between items-start shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/30 rounded-2xl border border-amber-500/30">
                                <Trophy size={28} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Achievements</h2>
                                <div className="flex items-center gap-2 text-amber-300/80 text-sm">
                                    <span>{unlockedIds.length} / {ACHIEVEMENTS.length} Unlocked</span>
                                    <span>•</span>
                                    <span>{totalXP} XP Earned</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0 hover:bg-white/10">
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-800 w-full shrink-0">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(unlockedIds.length / ACHIEVEMENTS.length) * 100}%` }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {sortedAchievements.map((ach) => {
                            const isUnlocked = unlockedIds.includes(ach.id);
                            return (
                                <motion.div
                                    key={ach.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => isUnlocked && setSelectedAchievement(ach)}
                                    className={`relative p-4 rounded-2xl border transition-all ${
                                        isUnlocked
                                            ? 'bg-slate-800/50 border-amber-500/30 hover:border-amber-500/50 cursor-pointer group'
                                            : 'bg-slate-900/50 border-white/5 opacity-70'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                                            isUnlocked
                                                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30'
                                                : 'bg-slate-800 border-white/5 grayscale'
                                        }`}>
                                            {isUnlocked ? ach.icon : <Lock size={20} className="text-slate-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                                    {ach.title}
                                                </h3>
                                                {isUnlocked && (
                                                    <Badge variant="warning" className="ml-2 text-[10px] px-1.5 py-0.5">
                                                        +{ach.xpReward} XP
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 leading-snug mt-1">
                                                {ach.description}
                                            </p>
                                            {isUnlocked && (
                                                <div className="mt-2 text-xs text-amber-500 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Tap to view details
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </Card>
            </motion.div>

            {/* Detail Modal Overlay */}
            <AnimatePresence>
                {selectedAchievement && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAchievement(null);
                        }}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <Card className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/30 p-8 text-center shadow-2xl">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-5xl shadow-lg shadow-amber-500/20 mb-6"
                            >
                                {selectedAchievement.icon}
                            </motion.div>

                            <h3 className="text-2xl font-black text-white mb-2">{selectedAchievement.title}</h3>
                            <p className="text-slate-400 mb-6">{selectedAchievement.description}</p>

                            <div className="flex flex-col gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Reward Earned</span>
                                    <div className="flex items-center gap-2 font-bold text-amber-400">
                                        <Star size={16} fill="currentColor" />
                                        +{selectedAchievement.xpReward} XP
                                    </div>
                                </div>

                                <Button onClick={() => handleShare(selectedAchievement)} variant="secondary" className="w-full">
                                    <Share2 size={16} className="mr-2" /> Share Achievement
                                </Button>

                                <Button onClick={() => setSelectedAchievement(null)} variant="ghost">
                                    Close
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AchievementsModal;
