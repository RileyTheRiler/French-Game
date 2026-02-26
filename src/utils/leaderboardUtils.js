// src/utils/leaderboardUtils.js

const MOCK_USERS = [
    { id: 'user_id', name: 'You', xp: 3200, avatar: null },
    { id: 'u2', name: 'Marie Curie', xp: 4500, avatar: null },
    { id: 'u3', name: 'Victor Hugo', xp: 4100, avatar: null },
    { id: 'u4', name: 'Gustave Eiffel', xp: 2900, avatar: null },
    { id: 'u5', name: 'Coco Chanel', xp: 3500, avatar: null },
    { id: 'u6', name: 'Louis Pasteur', xp: 2100, avatar: null },
];

/**
 * Fetches leaderboard data based on the tab and current league.
 *
 * @param {string} type - 'league' or 'global'.
 * @param {string} leagueId - The ID of the current league.
 * @returns {Array} List of users sorted by XP.
 */
export const getLeaderboardData = (type, leagueId) => {
    // Mock implementation - in a real app, this would fetch from an API
    let data = [...MOCK_USERS];

    if (type === 'global') {
        // Add some "global" high scorers
        data.push({ id: 'g1', name: 'Top Player', xp: 15000, avatar: null });
    }

    // Simulate different data sets
    if (leagueId === 'silver') {
        data = data.map(u => ({ ...u, xp: u.xp + 2000 }));
    }

    return data.sort((a, b) => b.xp - a.xp);
};

/**
 * Gets the rank of a specific user in the provided leaderboard data.
 *
 * @param {Array} data - The leaderboard data.
 * @param {string} userId - The user ID to find.
 * @returns {number|null} The 1-based rank, or null if not found.
 */
export const getUserRank = (data, userId) => {
    const index = data.findIndex(u => u.id === userId);
    return index !== -1 ? index + 1 : null;
};
