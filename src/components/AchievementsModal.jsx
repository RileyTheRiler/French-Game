import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Trophy, Star, Lock } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { Badge } from './ui/Badge';

const AchievementsModal = ({ onClose }) => {
    const { stats } = useProgress();
    const unlockedIds = stats.unlockedAchievements || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-2xl p-6 relative h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black title-gradient mb-2">Achievements</h2>
                    <p className="text-slate-400">
                        {unlockedIds.length} / {ACHIEVEMENTS.length} Unlocked
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = unlockedIds.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`
                                    relative p-4 rounded-2xl border flex items-center gap-4 transition-all
                                    ${isUnlocked
                                        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
                                        : 'bg-white/5 border-white/5 opacity-60 grayscale'
                                    }
                                `}
                            >
                                <div className={`
                                    w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg
                                    ${isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-slate-800'}
                                `}>
                                    {isUnlocked ? (achievement.icon || '🏆') : <Lock size={24} className="text-slate-500" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                            {achievement.title}
                                        </h3>
                                        {isUnlocked && (
                                            <Badge variant="success" className="text-xs">
                                                <Check size={12} className="mr-1" /> Unlocked
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>

                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs bg-black/20 border-white/10 text-yellow-300">
                                            <Star size={10} className="mr-1" fill="currentColor" />
                                            {achievement.xpReward} XP
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Helper for check icon locally if needed, or import
const Check = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default AchievementsModal;
