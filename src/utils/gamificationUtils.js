// Placeholder for gamification utils
export const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getLevelProgress = (xp) => {
    const level = calculateLevel(xp);
    const nextLevelXp = Math.pow(level, 2) * 100;
    const currentLevelXp = Math.pow(level - 1, 2) * 100;
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
};
