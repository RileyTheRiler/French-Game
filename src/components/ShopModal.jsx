import React from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Zap, Shield, Sparkles, Lightbulb, Clock3 } from 'lucide-react'; // Shield for Streak Freeze
import { useProgress } from '../context/ProgressContext';
import { Button } from './ui/Button';
import SoundManager from '../utils/SoundManager';

const ITEMS = [
    {
        id: 'streak_freeze',
        name: 'Streak Freeze',
        description: 'Miss a day without losing your streak!',
        price: 50,
        icon: <Shield className="text-blue-400" size={32} />,
        color: 'bg-blue-500/10 border-blue-500/30'
    },
    {
        id: 'hint_token',
        name: 'Hint Token',
        description: 'Spend in Sentence Builder for an auto-placed word.',
        price: 40,
        icon: <Lightbulb className="text-emerald-400" size={32} />,
        color: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
        id: 'double_xp',
        name: 'Double XP Potion',
        description: 'Earn 2x XP for the next 15 minutes.',
        price: 100,
        icon: <Zap className="text-yellow-400" size={32} />,
        color: 'bg-yellow-500/10 border-yellow-500/30',
        disabled: false
    },
    {
        id: 'xp_boost_30',
        name: 'Extended XP Brew',
        description: 'Boost XP gains for the next 30 minutes.',
        price: 160,
        icon: <Clock3 className="text-indigo-300" size={32} />,
        color: 'bg-indigo-500/10 border-indigo-500/30',
        disabled: false
    },
    {
        id: 'theme_neon',
        name: 'Neo-Tokyo Theme',
        description: 'Unlock a cyberpunk aesthetic. (Coming Soon)',
        price: 200,
        icon: <Sparkles className="text-pink-400" size={32} />,
        color: 'bg-pink-500/10 border-pink-500/30',
        disabled: true
    }
];

const ShopModal = ({ onClose }) => {
    const { stats, buyItem, activateDoubleXP, isDoubleXpActive } = useProgress();

    const handleBuy = (item) => {
        if (item.disabled) return;

        const success = buyItem(item.id, item.price);
        if (success) {
            // Activate Double XP immediately upon purchase
            if (item.id === 'double_xp') {
                activateDoubleXP(15);
            } else if (item.id === 'xp_boost_30') {
                activateDoubleXP(30);
            }
            SoundManager.playSuccess();
        } else {
            SoundManager.playFailure();
        }
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
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold title-gradient">Item Shop</h2>
                            <p className="text-slate-400 text-sm">Spend your hard-earned coins!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                            <span className="text-amber-400 font-black text-lg">⛃ {stats.coins || 0}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ITEMS.map(item => {
                        const ownedCount = stats.inventory?.[item.id] || 0;
                        const canAfford = stats.coins >= item.price;

                        return (
                            <div
                                key={item.id}
                                className={`
                                    relative p-6 rounded-2xl border transition-all
                                    ${item.color}
                                    ${item.disabled ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-900 rounded-xl">
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-lg text-white">⛃ {item.price}</span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-slate-400 text-sm mb-6 h-10">{item.description}</p>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => handleBuy(item)}
                                        disabled={!canAfford || item.disabled}
                                        className={`flex-1 ${!canAfford ? 'opacity-50' : ''}`}
                                        variant={canAfford ? 'default' : 'secondary'}
                                    >
                                        {item.disabled ? 'Coming Soon' : 'Buy'}
                                    </Button>
                                    {ownedCount > 0 && (
                                        <div className="px-3 py-2 bg-slate-800 rounded-lg border border-white/10 text-white font-bold text-sm">
                                            x{ownedCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </motion.div>
        </motion.div>
    );
};

export default ShopModal;
