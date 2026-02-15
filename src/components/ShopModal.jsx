import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Clock } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Button } from './ui/Button';
import SoundManager from '../utils/SoundManager';
import { getDailyShopSelection } from '../utils/market';

const ShopModal = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const { stats, buyItem, activateDoubleXP } = useProgress();
    const [shopData, setShopData] = useState({ consumables: [], cosmetics: [] });
    const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'supplies'

    useEffect(() => {
        const today = new Date().toDateString();
        const selection = getDailyShopSelection(today);
        setShopData(selection);
    }, []);

    const formatNumber = (num) => {
        return new Intl.NumberFormat(i18n.language).format(num);
    };

    const handleBuy = (item) => {
        // Check if cosmetic is already owned
        if (item.type === 'cosmetic' && stats?.inventory?.[item.id]) {
            return;
        }

        const success = buyItem(item);
        if (success) {
            // Activate Double XP immediately upon purchase if applicable
            if (item.id === 'double_xp') {
                activateDoubleXP(15);
            } else if (item.id === 'xp_boost_30') {
                activateDoubleXP(30);
            } else if (item.effect?.type === 'add_streak_freeze') {
                // Instant effect handled by context or just inventory
            }
            SoundManager.playSuccess();
        } else {
            SoundManager.playFailure();
        }
    };

    const renderItemCard = (item, isFeatured = false) => {
        const ownedCount = stats.inventory?.[item.id] || 0;
        const isOwnedCosmetic = item.type === 'cosmetic' && ownedCount > 0;
        const canAfford = stats.coins >= (item.price || item.basePrice);
        const price = item.price || item.basePrice;

        return (
            <motion.div
                key={item.id}
                layoutId={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    relative p-4 rounded-2xl border transition-all flex flex-col
                    ${isOwnedCosmetic ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-white/5'}
                    ${!isOwnedCosmetic && canAfford ? 'hover:border-amber-500/50 hover:bg-slate-800' : ''}
                `}
            >
                {isFeatured && (
                    <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg transform rotate-12">
                        {t('shop.daily_deal')}
                    </div>
                )}

                <div className="flex justify-between items-start mb-3">
                    <div className="text-3xl">{item.icon}</div>
                    {!isOwnedCosmetic && (
                        <div className={`px-2 py-1 rounded-lg text-sm font-bold ${canAfford ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 bg-slate-800'}`}>
                            ⛃ {formatNumber(price)}
                        </div>
                    )}
                    {isOwnedCosmetic && (
                        <div className="px-2 py-1 rounded-lg text-sm font-bold text-emerald-400 bg-emerald-500/10">
                            {t('shop.owned')}
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-white mb-1">{item.name}</h3>
                <p className="text-slate-400 text-xs mb-4 flex-grow">{item.description}</p>

                <div className="flex items-center gap-2 mt-auto">
                    {isOwnedCosmetic ? (
                        <Button disabled className="w-full opacity-50" variant="secondary">
                            {t('shop.in_inventory')}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford}
                            className={`w-full ${!canAfford ? 'opacity-50' : ''}`}
                            variant={canAfford ? 'default' : 'secondary'}
                        >
                            {t('shop.buy')}
                        </Button>
                    )}

                    {item.type !== 'cosmetic' && ownedCount > 0 && (
                        <div className="px-3 py-2 bg-slate-900 rounded-lg border border-white/10 text-white font-bold text-sm min-w-[3rem] text-center">
                            x{ownedCount}
                        </div>
                    )}
                </div>
            </motion.div>
        );
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
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10 sticky top-0 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold title-gradient">{t('shop.title')}</h2>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <Clock size={12} />
                                <span>{t('shop.refresh')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                            <span className="text-amber-400 font-black text-lg">⛃ {formatNumber(stats.coins || 0)}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 gap-4 border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('featured')}
                        className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'featured' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('shop.featured')}
                        {activeTab === 'featured' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('supplies')}
                        className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'supplies' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('shop.supplies')}
                        {activeTab === 'supplies' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    <AnimatePresence mode="wait">
                        {activeTab === 'featured' && (
                            <motion.div
                                key="featured"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('shop.cosmetics_rotation')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {shopData.cosmetics.map(item => renderItemCard(item, true))}
                                        {shopData.cosmetics.length === 0 && (
                                            <div className="col-span-2 text-center py-8 text-slate-500 italic">
                                                {t('shop.no_cosmetics')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'supplies' && (
                            <motion.div
                                key="supplies"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    {shopData.consumables.map(item => renderItemCard(item))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </motion.div>
    );
};

export default ShopModal;
