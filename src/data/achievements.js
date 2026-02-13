// Placeholder for proper achievement data
export const ACHIEVEMENTS = [
    {
        id: 'first_win',
        title: 'First Win',
        description: 'Complete your first lesson.',
        icon: '🥇',
        xpReward: 100,
        condition: (stats) => stats.wordsLearned >= 1
    },
    {
        id: 'streak_3',
        title: 'Consistency is Key',
        description: 'Reach a 3-day streak.',
        icon: '🔥',
        xpReward: 150,
        condition: (stats) => stats.streak >= 3
    }
];
