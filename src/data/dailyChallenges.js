// Daily challenge definitions that rotate based on the day

export const DAILY_CHALLENGES = [
    {
        id: 'study_10',
        title: 'Dedicated Student',
        description: 'Complete 10 flashcard reviews',
        icon: '📚',
        target: 10,
        stat: 'dailyReviews',
        xpReward: 50,
        coinReward: 25
    },
    {
        id: 'perfect_5',
        title: 'Perfect Streak',
        description: 'Get 5 answers correct in a row',
        icon: '🎯',
        target: 5,
        stat: 'dailyStreak',
        xpReward: 40,
        coinReward: 20
    },
    {
        id: 'grammar_3',
        title: 'Grammar Guru',
        description: 'Complete 3 grammar drills correctly',
        icon: '✍️',
        target: 3,
        stat: 'dailyGrammar',
        xpReward: 35,
        coinReward: 15
    },
    {
        id: 'story_1',
        title: 'Bookworm',
        description: 'Finish reading 1 story',
        icon: '📖',
        target: 1,
        stat: 'dailyStories',
        xpReward: 45,
        coinReward: 20
    },
    {
        id: 'words_20',
        title: 'Word Hunter',
        description: 'Catch 20 words in Falling Words',
        icon: '🎮',
        target: 20,
        stat: 'dailyWordsCaught',
        xpReward: 40,
        coinReward: 20
    },
    {
        id: 'xp_100',
        title: 'XP Master',
        description: 'Earn 100 XP today',
        icon: '⭐',
        target: 100,
        stat: 'dailyXP',
        xpReward: 60,
        coinReward: 30
    },
    {
        id: 'conversation_1',
        title: 'Chatterbox',
        description: 'Complete 1 conversation scenario',
        icon: '💬',
        target: 1,
        stat: 'dailyConversations',
        xpReward: 50,
        coinReward: 25
    }
];

// Get today's challenges (rotates daily, picks 3)
export const getTodaysChallenges = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    // Use day of year to consistently pick 3 challenges for today
    const shuffled = [...DAILY_CHALLENGES].sort((a, b) => {
        const hashA = (dayOfYear * 31 + a.id.charCodeAt(0)) % 100;
        const hashB = (dayOfYear * 31 + b.id.charCodeAt(0)) % 100;
        return hashA - hashB;
    });

    return shuffled.slice(0, 3);
};
