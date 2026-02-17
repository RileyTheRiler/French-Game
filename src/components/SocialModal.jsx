import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, Swords, Trophy, Crown, Check, Loader2, PenTool, MessageCircle, Globe } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { useProgress } from '../context/ProgressContext';
import { useCommunity } from '../context/CommunityContext';
import { useMessaging } from '../context/MessagingContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import WritingExercise from './Community/WritingExercise';
import CorrectionReview from './Community/CorrectionReview';
import LanguagePartnerFinder from './Messaging/LanguagePartnerFinder';
import ChatInterface from './Messaging/ChatInterface';

const SocialModal = ({ onClose }) => {
    const navigate = useNavigate();
    const { friends, addFriend, removeFriend, coopGroup, createCoopGroup, leaveCoopGroup, activeChallenge, claimCoopReward } = useSocial();
    const { stats } = useProgress();
    const { communityStats, pendingWritings } = useCommunity();
    const { getUnreadCount, connectedPartners } = useMessaging();

    const [tab, setTab] = useState('friends');
    const [friendCode, setFriendCode] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Community sub-views
    const [communityView, setCommunityView] = useState('menu'); // 'menu', 'write', 'correct'

    // Partners sub-views
    const [partnersView, setPartnersView] = useState('list'); // 'list', 'chat'
    const [selectedPartnerId, setSelectedPartnerId] = useState(null);

    const unreadMessages = getUnreadCount();

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!friendCode.trim()) return;

        setAdding(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const newFriend = await addFriend(friendCode);
            setSuccessMsg(`Added ${newFriend.name}!`);
            setFriendCode('');
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleFindMatch = () => {
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            const opponent = friends.length > 0 ? friends[0].name : 'PolyglotPierre';
            navigate(`/game/falling-words?mode=rivals&opponent=${opponent}`);
            onClose();
        }, 2000);
    };

    const handleSelectPartner = (partnerId) => {
        setSelectedPartnerId(partnerId);
        setPartnersView('chat');
    };

    // Tab definitions with notification badges
    const tabs = [
        { id: 'friends', icon: UserPlus, label: 'Friends' },
        { id: 'community', icon: PenTool, label: 'Community', badge: pendingWritings.length > 0 ? pendingWritings.length : null },
        { id: 'partners', icon: MessageCircle, label: 'Partners', badge: unreadMessages > 0 ? unreadMessages : null },
        { id: 'coop', icon: Trophy, label: 'Co-op' },
        { id: 'rivals', icon: Swords, label: 'Rivals' }
    ];

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
                className="w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <Card className="p-0 overflow-hidden border-white/10 h-[650px] flex flex-col">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-500/30 rounded-2xl">
                                <Users size={28} className="text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Social Hub</h2>
                                <p className="text-violet-300/80 text-sm">Connect, Learn & Compete</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0">
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 overflow-x-auto">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTab(t.id);
                                    setCommunityView('menu');
                                    setPartnersView('list');
                                }}
                                className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${tab === t.id
                                    ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/10'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <t.icon size={16} />
                                {t.label}
                                {t.badge && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <AnimatePresence mode="wait">
                            {/* Friends Tab */}
                            {tab === 'friends' && (
                                <motion.div
                                    key="friends"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                        <h3 className="font-bold text-white mb-2">Add Friend</h3>
                                        <form onSubmit={handleAddFriend} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={friendCode}
                                                onChange={(e) => setFriendCode(e.target.value)}
                                                placeholder="Enter friend code (e.g. PIERRE)"
                                                className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                            />
                                            <Button type="submit" disabled={adding} variant="primary">
                                                {adding ? 'Adding...' : 'Add'}
                                            </Button>
                                        </form>
                                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                                        {successMsg && <p className="text-green-400 text-sm mt-2">{successMsg}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Your Friends ({friends.length})</h3>
                                        {friends.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <Users size={48} className="mx-auto mb-2 opacity-20" />
                                                <p>No friends yet. Try adding 'PIERRE'!</p>
                                            </div>
                                        ) : (
                                            friends.map((friend) => (
                                                <div key={friend.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                                                            {friend.avatar || '👤'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-white">{friend.name}</span>
                                                                <span className="text-lg">{friend.country}</span>
                                                            </div>
                                                            <div className="text-xs text-slate-400">Level {friend.level} • {friend.xp} XP</div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => removeFriend(friend.id)} className="text-slate-500 hover:text-red-400">
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Community Tab */}
                            {tab === 'community' && (
                                <motion.div
                                    key="community"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    {communityView === 'menu' && (
                                        <div className="space-y-6">
                                            <div className="text-center py-4">
                                                <Globe size={48} className="mx-auto mb-3 text-violet-400" />
                                                <h3 className="text-xl font-bold text-white mb-2">Community Learning</h3>
                                                <p className="text-slate-400 text-sm">Get corrections from native speakers and help others learn!</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                                                    <div className="text-xl font-bold text-violet-400">{communityStats.writingsSubmitted}</div>
                                                    <div className="text-xs text-slate-500">Writings</div>
                                                </div>
                                                <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                                                    <div className="text-xl font-bold text-green-400">{communityStats.correctionsGiven}</div>
                                                    <div className="text-xs text-slate-500">Corrections</div>
                                                </div>
                                                <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                                                    <div className="text-xl font-bold text-amber-400">{communityStats.helpfulVotes}</div>
                                                    <div className="text-xs text-slate-500">Helpful</div>
                                                </div>
                                            </div>

                                            {/* Action cards */}
                                            <div className="space-y-3">
                                                <Card
                                                    className="p-4 cursor-pointer hover:border-violet-500/50 transition-all"
                                                    onClick={() => setCommunityView('write')}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-violet-500/20 rounded-xl">
                                                            <PenTool size={24} className="text-violet-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-white">Write & Get Corrected</h4>
                                                            <p className="text-sm text-slate-400">Practice writing and receive feedback</p>
                                                        </div>
                                                    </div>
                                                </Card>

                                                <Card
                                                    className="p-4 cursor-pointer hover:border-green-500/50 transition-all"
                                                    onClick={() => setCommunityView('correct')}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-green-500/20 rounded-xl relative">
                                                            <Check size={24} className="text-green-400" />
                                                            {pendingWritings.length > 0 && (
                                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                                    {pendingWritings.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-white">Help Others</h4>
                                                            <p className="text-sm text-slate-400">Correct writings & earn XP</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    )}

                                    {communityView === 'write' && (
                                        <WritingExercise onBack={() => setCommunityView('menu')} />
                                    )}

                                    {communityView === 'correct' && (
                                        <CorrectionReview onBack={() => setCommunityView('menu')} />
                                    )}
                                </motion.div>
                            )}

                            {/* Partners Tab */}
                            {tab === 'partners' && (
                                <motion.div
                                    key="partners"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full"
                                >
                                    {partnersView === 'list' && (
                                        <LanguagePartnerFinder
                                            onBack={() => setTab('friends')}
                                            onSelectPartner={handleSelectPartner}
                                        />
                                    )}

                                    {partnersView === 'chat' && selectedPartnerId && (
                                        <div className="h-[450px] -m-6">
                                            <ChatInterface
                                                partnerId={selectedPartnerId}
                                                onBack={() => setPartnersView('list')}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Co-op Tab */}
                            {tab === 'coop' && (
                                <motion.div
                                    key="coop"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    {!coopGroup ? (
                                        <div className="text-center py-12">
                                            <Trophy size={64} className="mx-auto mb-4 text-violet-500/50" />
                                            <h3 className="text-xl font-bold text-white mb-2">No Active Co-op Group</h3>
                                            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                                                Team up with your friends to complete weekly challenges and earn shared rewards!
                                            </p>
                                            <Button onClick={() => createCoopGroup("Team Frenchies")} variant="primary" size="lg">
                                                Create Group
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Crown size={120} />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <Badge variant={activeChallenge.isCompleted ? "success" : "warning"} className="mb-2">
                                                                {activeChallenge.isCompleted ? "Challenge Complete!" : "Weekly Challenge"}
                                                            </Badge>
                                                            <h3 className="text-2xl font-black text-white">{activeChallenge.title}</h3>
                                                            {activeChallenge.isCompleted ? (
                                                                <p className="text-green-300">Goal reached! Claim your reward.</p>
                                                            ) : (
                                                                <p className="text-violet-200">Earn {activeChallenge.target.toLocaleString()} XP together</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-3xl font-mono font-bold text-white">
                                                                {Math.floor((activeChallenge.current / activeChallenge.target) * 100)}%
                                                            </div>
                                                            <div className="text-xs text-violet-300">Completed</div>
                                                        </div>
                                                    </div>
                                                    <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden mb-4">
                                                        <motion.div
                                                            className={`h-full bg-gradient-to-r ${activeChallenge.isCompleted ? 'from-green-400 to-emerald-500' : 'from-violet-500 to-fuchsia-500'}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (activeChallenge.current / activeChallenge.target) * 100)}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                        />
                                                    </div>

                                                    {activeChallenge.isCompleted ? (
                                                        <motion.div
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <Button
                                                                onClick={() => {
                                                                    const reward = claimCoopReward();
                                                                    setSuccessMsg(`Claimed ${reward} XP Bonus!`);
                                                                    setTimeout(() => setSuccessMsg(null), 3000);
                                                                }}
                                                                className="w-full bg-green-500 hover:bg-green-600 border-green-400 text-white font-bold py-3 shadow-lg shadow-green-900/20"
                                                            >
                                                                <Trophy className="mr-2 inline" /> Claim Team Reward
                                                            </Button>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex justify-between text-xs text-violet-300 font-mono">
                                                            <span>{activeChallenge.current.toLocaleString()} XP</span>
                                                            <span>{activeChallenge.target.toLocaleString()} XP</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-slate-300">Team Members</h3>
                                                    <Button variant="ghost" size="sm" className="text-red-400" onClick={leaveCoopGroup}>
                                                        Leave Team
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                                            👤
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-indigo-300">You</div>
                                                            <div className="text-xs text-slate-400">{stats.xp} XP</div>
                                                        </div>
                                                    </div>
                                                    {friends.map(f => (
                                                        <div key={f.id} className="p-4 bg-slate-800/50 rounded-xl border border-white/5 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                                {f.avatar}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{f.name}</div>
                                                                <div className="text-xs text-slate-400">{f.weeklyXp} XP</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Rivals Tab */}
                            {tab === 'rivals' && (
                                <motion.div
                                    key="rivals"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="p-8 bg-slate-800/50 rounded-3xl mb-8 relative border border-white/5">
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500 mb-2 mx-auto">
                                                    <span className="text-4xl">👤</span>
                                                </div>
                                                <p className="font-bold">You</p>
                                            </div>
                                            <div className="text-4xl font-black text-red-500 italic">VS</div>
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center border border-white/10 mb-2 mx-auto">
                                                    <span className="text-4xl">?</span>
                                                </div>
                                                <p className="font-bold text-slate-500">Opponent</p>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2">Head-to-Head Arena</h3>
                                    <p className="text-slate-400 mb-8 max-w-sm">
                                        Challenge a random opponent to a speed battle. Whoever gets the highest score in 2 minutes wins!
                                    </p>

                                    <Button
                                        onClick={handleFindMatch}
                                        disabled={isSearching}
                                        size="lg"
                                        className="w-full max-w-xs h-14 text-lg bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20"
                                    >
                                        {isSearching ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" /> Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Swords className="mr-2" /> Find Match
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default SocialModal;
