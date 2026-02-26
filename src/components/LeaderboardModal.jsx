import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, ChevronUp, ChevronDown, Users, Globe, WifiOff, RefreshCw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { LEAGUES, getLeagueInfo, getNextLeague } from '../data/leagues';
import { getLeaderboardData, getUserRank } from '../utils/leaderboardUtils';

const LeaderboardModal = ({ onClose, userStats }) => {
    const { stats } = useProgress();
    const [activeTab, setActiveTab] = useState('league'); // 'league' or 'global'
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    // Offline detection state
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOffline) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, 800));

            const data = getLeaderboardData(activeTab, stats.league || 'bronze');
            setLeaderboardData(data);

            const rank = getUserRank(data, 'user_id'); // Assuming user ID is constant/mocked
            setUserRank(rank);
            setLoading(false);
        };

        fetchData();
    }, [activeTab, stats.league, isOffline]);

    const currentLeague = getLeagueInfo(stats.league || 'bronze');
    const nextLeague = getNextLeague(stats.league || 'bronze');

    const renderRankBadge = (rank) => {
        if (rank === 1) return <Medal className="text-yellow-400" size={24} />;
        if (rank === 2) return <Medal className="text-slate-300" size={24} />;
        if (rank === 3) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-bold text-slate-500 w-6 text-center">{rank}</span>;
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
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 bg-slate-900/50 backdrop-blur-md z-10 border-b border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full bg-gradient-to-br ${currentLeague.color} shadow-lg`}>
                                <Trophy size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{currentLeague.name} League</h2>
                                <p className="text-xs text-slate-400">Ends in 2 days</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="text-slate-400" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('league')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'league' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Users size={16} /> League
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Globe size={16} /> Global
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {isOffline ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-4">
                            <WifiOff size={48} className="opacity-50" />
                            <p>You are offline.</p>
                            <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                                <RefreshCw size={16} /> Retry
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        leaderboardData.map((user, index) => {
                            const isCurrentUser = user.id === 'user_id'; // Mock ID check
                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`
                                        flex items-center justify-between p-4 rounded-xl border transition-all
                                        ${isCurrentUser
                                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                            : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 flex justify-center">
                                            {renderRankBadge(index + 1)}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-white/10">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-slate-400">{user.name[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                                                {user.name} {isCurrentUser && '(You)'}
                                            </p>
                                            {index < 3 && activeTab === 'league' && (
                                                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                                    <ChevronUp size={10} /> Promotion Zone
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-bold text-white">{user.xp.toLocaleString()} XP</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Footer (Promotion/Demotion Info) */}
                {!isOffline && !loading && activeTab === 'league' && nextLeague && (
                    <div className="p-4 bg-slate-900 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-400">
                            Top 5 promote to <span className={`font-bold text-${nextLeague.color.split('-')[1]}-400`}>{nextLeague.name} League</span>
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default LeaderboardModal;
