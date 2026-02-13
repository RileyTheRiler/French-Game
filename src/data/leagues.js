export const checkStreakMilestone = (streak) => {
    if (streak === 3) return { title: '3 Day Streak', xpBonus: 50, coinBonus: 20 };
    if (streak === 7) return { title: 'Week Warrior', xpBonus: 150, coinBonus: 50 };
    if (streak === 14) return { title: '2 Week Streak', xpBonus: 300, coinBonus: 100 };
    if (streak === 30) return { title: 'Monthly Master', xpBonus: 1000, coinBonus: 500 };
    return null;
};
