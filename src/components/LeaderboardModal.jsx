import React from 'react';

const MOCK_LEADERBOARD = [
    { rank: 1, name: "PolyglotPierre", xp: 12500, level: 12 },
    { rank: 2, name: "LinguaLisa", xp: 9800, level: 10 },
    { rank: 3, name: "GrammarGuru", xp: 8500, level: 9 },
    { rank: 4, name: "You", xp: 0, level: 1, isUser: true }, // Will update with real stats
    { rank: 5, name: "VerbVera", xp: 4200, level: 6 },
    { rank: 6, name: "NounNick", xp: 3100, level: 5 },
];

const LeaderboardModal = ({ onClose, userStats }) => {
    // Sort logic to place user correctly would go here in a real app
    // For now, we just display the mock list and update "You"
    const leaderboardData = MOCK_LEADERBOARD.map(entry => {
        if (entry.isUser) {
            return { ...entry, xp: userStats.xp, level: Math.floor(Math.sqrt(userStats.xp / 100)) + 1 };
        }
        return entry;
    }).sort((a, b) => b.xp - a.xp);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-black text-center mb-6 title-gradient">Leaderboard</h2>

                <div className="space-y-4">
                    {leaderboardData.map((player, index) => (
                        <div
                            key={player.name}
                            className={`flex items-center justify-between p-3 rounded-xl border ${player.isUser ? 'bg-white/10 border-[var(--accent-primary)]' : 'bg-transparent border-white/5'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <span className={`text-lg font-bold w-8 text-center ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    #{index + 1}
                                </span>
                                <div>
                                    <p className={`font-bold ${player.isUser ? 'text-[var(--accent-primary)]' : 'text-white'}`}>
                                        {player.name}
                                    </p>
                                    <p className="text-xs text-white/50">Level {player.level}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-bold text-[var(--accent-secondary)]">
                                    {player.xp.toLocaleString()} XP
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
