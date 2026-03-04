import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Award } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useProgress } from '../context/ProgressContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const AchievementsModal = ({ isOpen, onClose }) => {
    const { achievements, stats, level } = useProgress();

    if (!isOpen) return null;

    const unlockedCount = achievements?.length || 0;
    const totalCount = ACHIEVEMENTS.length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-3xl max-h-[85vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <Card className="p-0 border-white/10 shadow-3xl">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/30 rounded-2xl">
                                    <Award size={28} className="text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Achievements</h2>
                                    <p className="text-amber-300/80 text-sm font-medium">
                                        {unlockedCount} / {totalCount} Unlocked
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0">
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 py-4 bg-slate-900/50">
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Achievements Grid */}
                        <div className="p-6 overflow-y-auto max-h-[55vh] grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
                            {ACHIEVEMENTS.map((achievement, idx) => {
                                const isUnlocked = achievements?.includes(achievement.id);

                                return (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`p-4 rounded-2xl border transition-all ${isUnlocked
                                                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                                                : 'bg-slate-900/50 border-white/5 opacity-60'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isUnlocked
                                                    ? 'bg-amber-500/20'
                                                    : 'bg-slate-800'
                                                }`}>
                                                {isUnlocked ? achievement.icon : <Lock size={20} className="text-slate-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                                        {achievement.title}
                                                    </h4>
                                                    {achievement.tier && (
                                                        <Badge variant={isUnlocked ? 'primary' : 'outline'} className="text-[10px] px-2 py-0.5 uppercase tracking-wider">
                                                            {achievement.tier}
                                                        </Badge>
                                                    )}
                                                    {isUnlocked && (
                                                        <Badge variant="success" className="text-xs px-2 py-0.5 shrink-0">
                                                            +{achievement.xpReward} XP
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className={`text-sm ${isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AchievementsModal;
