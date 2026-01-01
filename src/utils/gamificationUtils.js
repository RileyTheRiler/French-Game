export const BASE_XP = 100;
export const XP_MULTIPLIER = 1.2;

/**
 * Calculates the current level based on total XP.
 * Using a simple geometric progression or linear scale.
 * 
 * Formula: Level = Math.floor(Math.sqrt(xp / 100)) + 1
 * Example: 
 * 0 XP -> Level 1
 * 100 XP -> Level 2
 * 400 XP -> Level 3
 */
export const calculateLevel = (xp) => {
    if (xp < 0) return 1;
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculates XP required to reach the next level.
 * @param {number} level - Current level
 */
export const getXPForNextLevel = (level) => {
    // Inverse of the level formula: xp = (level) ^ 2 * 100
    // To reach level+1, we need ((level) ^ 2 * 100) total XP.
    // Wait, if Level 2 starts at 100, then at Level 1 we need 100 total XP to reach Level 2.
    // If Level 3 starts at 400.
    return (level * level) * 100;
};

/**
 * Returns the progress percentage towards the next level.
 */
export const getLevelProgress = (xp) => {
    const currentLevel = calculateLevel(xp);
    const textLevelXp = getXPForNextLevel(currentLevel); // XP needed for next level total
    const currentLevelStartXp = getXPForNextLevel(currentLevel - 1); // XP at start of current level

    const xpInLevel = xp - currentLevelStartXp;
    const xpNeededForLevel = textLevelXp - currentLevelStartXp;

    return Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));
};
