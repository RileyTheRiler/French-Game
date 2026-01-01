import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, Crown, Flame, Globe } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const MOCK_WEEKLY = [
    { name: "PolyglotPierre", xp: 2850, level: 12, streak: 14, country: "🇫🇷" },
    { name: "LinguaLisa", xp: 2340, level: 10, streak: 21, country: "🇺🇸" },
    { name: "GrammarGuru", xp: 1980, level: 9, streak: 7, country: "🇬🇧" },
    { name: "VocabVictor", xp: 1650, level: 8, streak: 12, country: "🇨🇦" },
    { name: "FrenchFiona", xp: 1420, level: 7, streak: 5, country: "🇦🇺" },
    { name: "ParlerPaul", xp: 1180, level: 6, streak: 9, country: "🇩🇪" },
    { name: "MotsMarie", xp: 890, level: 5, streak: 3, country: "🇪🇸" },
    { name: "AcuteAnton", xp: 720, level: 4, streak: 6, country: "🇮🇹" },
];

const MOCK_ALLTIME = [
    { name: "PolyglotPierre", xp: 45200, level: 22, streak: 180, country: "🇫🇷" },
    { name: "MasterMichel", xp: 38900, level: 20, streak: 120, country: "🇧🇪" },
    { name: "LinguaLisa", xp: 32100, level: 18, streak: 95, country: "🇺🇸" },
    { name: "GrammarGuru", xp: 28500, level: 17, streak: 75, country: "🇬🇧" },
    { name: "VocabVictor", xp: 21800, level: 15, streak: 60, country: "🇨🇦" },
    { name: "FrenchFiona", xp: 18200, level: 14, streak: 45, country: "🇦🇺" },
    { name: "ParlerPaul", xp: 15600, level: 13, streak: 30, country: "🇩🇪" },
    { name: "MotsMarie", xp: 12100, level: 11, streak: 22, country: "🇪🇸" },
];

const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={20} className="text-slate-300" />;
    if (rank === 3) return <Medal size={20} className="text-amber-600" />;
    return <span className="text-slate-500 font-mono text-sm">#{rank}</span>;
};

const LeaderboardModal = ({ onClose }) => {
    const { stats, level } = useProgress();
    const [tab, setTab] = useState('weekly');

    const baseData = tab === 'weekly' ? MOCK_WEEKLY : MOCK_ALLTIME;

    // Insert user into leaderboard
    const userEntry = {
        name: "You",
        xp: tab === 'weekly' ? Math.min(stats.xp, 3000) : stats.xp,
        level: level,
        streak: stats.streak || 0,
        country: "🌍",
        isUser: true
    };

    const leaderboard = [...baseData, userEntry]
        .sort((a, b) => b.xp - a.xp)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

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
                className="w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <Card className="p-0 overflow-hidden border-white/10">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/30 rounded-2xl">
                                <Trophy size={28} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Leaderboard</h2>
                                <p className="text-amber-300/80 text-sm">Compete with learners worldwide</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0">
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setTab('weekly')}
                            className={`flex-1 py-3 text-sm font-bold transition-all ${tab === 'weekly'
                                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setTab('alltime')}
                            className={`flex-1 py-3 text-sm font-bold transition-all ${tab === 'alltime'
                                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            All Time
                        </button>
                    </div>

                    {/* Leaderboard List */}
                    <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, x: tab === 'weekly' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: tab === 'weekly' ? 20 : -20 }}
                                className="space-y-2"
                            >
                                {leaderboard.map((player, idx) => (
                                    <motion.div
                                        key={player.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${player.isUser
                                                ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 ring-2 ring-indigo-500/20'
                                                : player.rank <= 3
                                                    ? 'bg-amber-500/10 border border-amber-500/20'
                                                    : 'bg-slate-800/50 border border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Rank */}
                                            <div className="w-8 flex justify-center">
                                                {getRankIcon(player.rank)}
                                            </div>

                                            {/* Avatar / Country */}
                                            <div className="text-2xl">{player.country}</div>

                                            {/* Name & Level */}
                                            <div>
                                                <p className={`font-bold ${player.isUser ? 'text-indigo-300' : 'text-white'}`}>
                                                    {player.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span>Lvl {player.level}</span>
                                                    {player.streak > 0 && (
                                                        <span className="flex items-center gap-1 text-orange-400">
                                                            <Flame size={12} /> {player.streak}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* XP */}
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-amber-400">
                                                {player.xp.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500">XP</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 bg-slate-900/50 text-center">
                        <p className="text-slate-400 text-sm">
                            Keep learning to climb the ranks! 🚀
                        </p>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default LeaderboardModal;
