export const TIME_LIMITED_CHALLENGES = [
    {
        id: 'sprint_words',
        title: 'Word Sprint',
        description: 'Catch 15 falling words in 10 minutes.',
        stat: 'dailyWordsCaught',
        target: 15,
        durationMinutes: 60,
        xpReward: 120,
        coinReward: 70,
        bonus: '+20% payout for finishing early'
    },
    {
        id: 'speed_flash',
        title: 'Flashcard Blitz',
        description: 'Finish 12 reviews without breaking your streak.',
        stat: 'dailyStreak',
        target: 12,
        durationMinutes: 90,
        xpReward: 100,
        coinReward: 60,
        bonus: 'Extra coins if done in under 30 minutes'
    },
    {
        id: 'dialogue_dash',
        title: 'Dialogue Dash',
        description: 'Complete 2 conversation scenarios today.',
        stat: 'dailyConversations',
        target: 2,
        durationMinutes: 120,
        xpReward: 150,
        coinReward: 90,
        bonus: 'Bonus XP for clean runs'
    }
];

const pickChallenge = () => {
    const day = new Date().getDay();
    return TIME_LIMITED_CHALLENGES[day % TIME_LIMITED_CHALLENGES.length];
};

export const getActiveTimedChallenge = () => {
    const stored = localStorage.getItem('frenchApp_timedChallenge');
    const now = Date.now();
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && parsed.expiresAt > now) {
            return parsed;
        }
    }

    const challenge = pickChallenge();
    const startedAt = now;
    const expiresAt = now + challenge.durationMinutes * 60 * 1000;
    const active = { ...challenge, startedAt, expiresAt, bonusAwarded: false };
    localStorage.setItem('frenchApp_timedChallenge', JSON.stringify(active));
    return active;
};

export const clearTimedChallenge = () => localStorage.removeItem('frenchApp_timedChallenge');
