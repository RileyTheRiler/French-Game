// League tier definitions for the leaderboard system
// Weekly XP thresholds determine league placement

export const LEAGUES = [
    {
        id: 'bronze',
        name: 'Bronze',
        minXP: 0,
        icon: '🥉',
        color: 'amber',
        gradient: 'from-amber-700 to-amber-900',
        description: 'Just getting started'
    },
    {
        id: 'silver',
        name: 'Silver',
        minXP: 500,
        icon: '🥈',
        color: 'slate',
        gradient: 'from-slate-400 to-slate-600',
        description: 'Building momentum'
    },
    {
        id: 'gold',
        name: 'Gold',
        minXP: 1500,
        icon: '🥇',
        color: 'yellow',
        gradient: 'from-yellow-400 to-amber-500',
        description: 'Committed learner'
    },
    {
        id: 'platinum',
        name: 'Platinum',
        minXP: 3000,
        icon: '💎',
        color: 'cyan',
        gradient: 'from-cyan-400 to-blue-500',
        description: 'Dedicated student'
    },
    {
        id: 'diamond',
        name: 'Diamond',
        minXP: 6000,
        icon: '👑',
        color: 'violet',
        gradient: 'from-violet-400 to-purple-600',
        description: 'Language champion'
    },
];

/**
 * Get the current league based on weekly XP
 * @param {number} weeklyXP - XP earned this week
 * @returns {object} The league object
 */
export const getLeagueByXP = (weeklyXP) => {
    let currentLeague = LEAGUES[0];
    for (const league of LEAGUES) {
        if (weeklyXP >= league.minXP) {
            currentLeague = league;
        }
    }
    return currentLeague;
};

/**
 * Get the next league tier
 * @param {string} currentLeagueId - Current league ID
 * @returns {object|null} Next league or null if at max
 */
export const getNextLeague = (currentLeagueId) => {
    const currentIndex = LEAGUES.findIndex(l => l.id === currentLeagueId);
    if (currentIndex < LEAGUES.length - 1) {
        return LEAGUES[currentIndex + 1];
    }
    return null;
};

/**
 * Calculate progress percentage to next league
 * @param {number} weeklyXP - XP earned this week
 * @returns {number} Percentage (0-100)
 */
export const getLeagueProgress = (weeklyXP) => {
    const currentLeague = getLeagueByXP(weeklyXP);
    const nextLeague = getNextLeague(currentLeague.id);

    if (!nextLeague) return 100; // Already at max league

    const xpInCurrentTier = weeklyXP - currentLeague.minXP;
    const xpNeededForNext = nextLeague.minXP - currentLeague.minXP;

    return Math.min(100, Math.floor((xpInCurrentTier / xpNeededForNext) * 100));
};

/**
 * Get XP needed for next league
 * @param {number} weeklyXP - XP earned this week
 * @returns {number} XP needed, or 0 if at max
 */
export const getXPToNextLeague = (weeklyXP) => {
    const currentLeague = getLeagueByXP(weeklyXP);
    const nextLeague = getNextLeague(currentLeague.id);

    if (!nextLeague) return 0;
    return nextLeague.minXP - weeklyXP;
};

// Streak milestone rewards
export const STREAK_MILESTONES = [
    { days: 7, xpBonus: 100, coinBonus: 50, title: 'Week Warrior', icon: '🔥' },
    { days: 14, xpBonus: 250, coinBonus: 100, title: 'Fortnight Fighter', icon: '💪' },
    { days: 30, xpBonus: 500, coinBonus: 200, title: 'Monthly Master', icon: '🏆' },
    { days: 60, xpBonus: 1000, coinBonus: 500, title: 'Dedication Pro', icon: '⭐' },
    { days: 100, xpBonus: 2000, coinBonus: 1000, title: 'Century Legend', icon: '👑' },
    { days: 365, xpBonus: 10000, coinBonus: 5000, title: 'Year Champion', icon: '🎖️' },
];

/**
 * Check if streak hits a milestone
 * @param {number} streak - Current streak count
 * @returns {object|null} Milestone object or null
 */
export const checkStreakMilestone = (streak) => {
    return STREAK_MILESTONES.find(m => m.days === streak) || null;
};

// Goal presets for different commitment levels
export const GOAL_PRESETS = [
    {
        id: 'casual',
        name: 'Casual',
        icon: '🐢',
        dailyXP: 25,
        weeklyWords: 50,
        description: 'Learn at your own pace',
        timeEstimate: '5-10 min/day'
    },
    {
        id: 'regular',
        name: 'Regular',
        icon: '🚶',
        dailyXP: 50,
        weeklyWords: 100,
        description: 'Steady progress',
        timeEstimate: '10-15 min/day'
    },
    {
        id: 'intensive',
        name: 'Intensive',
        icon: '🏃',
        dailyXP: 100,
        weeklyWords: 200,
        description: 'Fast-track learning',
        timeEstimate: '20-30 min/day'
    },
    {
        id: 'champion',
        name: 'Champion',
        icon: '🔥',
        dailyXP: 200,
        weeklyWords: 300,
        description: 'Maximum effort',
        timeEstimate: '45+ min/day'
    }
];
