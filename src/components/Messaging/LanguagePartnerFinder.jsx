import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Star, MessageCircle, Filter, Globe, BookOpen } from 'lucide-react';
import { useMessaging } from '../../context/MessagingContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const LanguagePartnerFinder = ({ onBack, onSelectPartner }) => {
    const { getAvailablePartners, connectWithPartner, connectedPartners } = useMessaging();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInterest, setSelectedInterest] = useState(null);
    const [connecting, setConnecting] = useState(null);

    const partners = getAvailablePartners();

    // Get all unique interests
    const allInterests = [...new Set(partners.flatMap(p => p.interests))];

    // Filter partners
    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesInterest = !selectedInterest || partner.interests.includes(selectedInterest);

        return matchesSearch && matchesInterest;
    });

    const handleConnect = async (partnerId) => {
        setConnecting(partnerId);
        await new Promise(r => setTimeout(r, 800)); // Simulate connection
        connectWithPartner(partnerId);
        setConnecting(null);
        onSelectPartner(partnerId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={onBack} className="h-10 w-10 p-0" aria-label="Go back">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-white">Language Partners</h2>
                    <p className="text-sm text-slate-400">Connect with native French speakers</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, city, or specialty..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
            </div>

            {/* Interest filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <Filter size={16} className="text-slate-500 flex-shrink-0" />
                <button
                    onClick={() => setSelectedInterest(null)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${!selectedInterest
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white'
                        }`}
                >
                    All
                </button>
                {allInterests.slice(0, 6).map((interest) => (
                    <button
                        key={interest}
                        onClick={() => setSelectedInterest(interest === selectedInterest ? null : interest)}
                        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors capitalize ${selectedInterest === interest
                                ? 'bg-violet-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        {interest}
                    </button>
                ))}
            </div>

            {/* Partner cards */}
            <div className="space-y-4">
                {filteredPartners.map((partner) => (
                    <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <Card className="p-4 hover:border-violet-500/30 transition-all">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center text-3xl">
                                        {partner.avatar}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${partner.isOnline ? 'bg-green-500' : 'bg-slate-500'
                                        }`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white truncate">{partner.name}</h3>
                                        <span className="text-lg">{partner.country}</span>
                                        {partner.isConnected && (
                                            <Badge variant="success" className="text-xs">Connected</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {partner.city}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Globe size={14} />
                                            Learning {partner.learningLanguage}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-300 mb-3 line-clamp-2">{partner.bioEn}</p>

                                    {/* Specialties */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {partner.specialties.map((s, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded-full text-xs flex items-center gap-1"
                                            >
                                                <BookOpen size={10} />
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Action button */}
                                    {partner.isConnected ? (
                                        <Button
                                            size="sm"
                                            onClick={() => onSelectPartner(partner.id)}
                                            className="w-full sm:w-auto"
                                        >
                                            <MessageCircle size={16} className="mr-1" />
                                            Message
                                            {partner.hasUnread && (
                                                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => handleConnect(partner.id)}
                                            disabled={connecting === partner.id}
                                            className="w-full sm:w-auto"
                                        >
                                            {connecting === partner.id ? (
                                                'Connecting...'
                                            ) : (
                                                <>
                                                    <Star size={16} className="mr-1" />
                                                    Connect
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {filteredPartners.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <Search size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No partners found matching your criteria.</p>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedInterest(null);
                            }}
                            className="mt-2"
                        >
                            Clear filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl font-bold text-violet-400">{connectedPartners.length}</div>
                    <div className="text-xs text-slate-500">Partners Connected</div>
                </div>
                <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl font-bold text-green-400">
                        {partners.filter(p => p.isOnline).length}
                    </div>
                    <div className="text-xs text-slate-500">Online Now</div>
                </div>
            </div>
        </div>
    );
};

export default LanguagePartnerFinder;
