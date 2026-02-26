import React from 'react';
// import { Trophy, Medal, Crown } from 'lucide-react'; // Removed unused imports if we use string icons

export const LEAGUES = [
    {
        id: 'bronze',
        name: 'Bronze',
        minXP: 0,
        maxXP: 499,
        color: 'from-orange-700 to-orange-500',
        icon: '🥉'
    },
    {
        id: 'silver',
        name: 'Silver',
        minXP: 500,
        maxXP: 1199,
        color: 'from-slate-400 to-slate-300',
        icon: '🥈'
    },
    {
        id: 'gold',
        name: 'Gold',
        minXP: 1200,
        maxXP: 2499,
        color: 'from-yellow-500 to-amber-400',
        icon: '🥇'
    },
    {
        id: 'platinum',
        name: 'Platinum',
        minXP: 2500,
        maxXP: 4999,
        color: 'from-cyan-500 to-blue-500',
        icon: '💎' // Replaced JSX with emoji/string
    },
    {
        id: 'diamond',
        name: 'Diamond',
        minXP: 5000,
        maxXP: 9999,
        color: 'from-indigo-500 to-purple-600',
        icon: '👑' // Replaced JSX with emoji/string
    },
    {
        id: 'master',
        name: 'Master',
        minXP: 10000,
        maxXP: Infinity,
        color: 'from-fuchsia-600 to-pink-600',
        icon: '🔥' // Replaced JSX with emoji/string
    }
];

export const getLeagueByXP = (xp) => {
    return LEAGUES.find(l => xp >= l.minXP && xp <= l.maxXP) || LEAGUES[LEAGUES.length - 1];
};

export const getLeagueInfo = (leagueId) => {
    return LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
};

export const getNextLeague = (currentLeagueId) => {
    const idx = LEAGUES.findIndex(l => l.id === currentLeagueId);
    return idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
};

export const getLeagueProgress = (xp) => {
    const currentLeague = getLeagueByXP(xp);
    if (currentLeague.maxXP === Infinity) return 100;
    const range = currentLeague.maxXP - currentLeague.minXP;
    const progress = xp - currentLeague.minXP;
    return Math.min(100, Math.max(0, (progress / range) * 100));
};

export const getXPToNextLeague = (xp) => {
    const currentLeague = getLeagueByXP(xp);
    if (currentLeague.maxXP === Infinity) return 0;
    return currentLeague.maxXP + 1 - xp;
};

export const STREAK_MILESTONES = [
    { day: 3, title: 'Three Day Streak', xpBonus: 50, coinBonus: 20 },
    { day: 7, title: 'Weekly Warrior', xpBonus: 150, coinBonus: 50 },
    { day: 14, title: 'Fortnight Fortitude', xpBonus: 300, coinBonus: 100 },
    { day: 30, title: 'Monthly Master', xpBonus: 1000, coinBonus: 500 }
];

export const checkStreakMilestone = (streak) => {
    return STREAK_MILESTONES.find(m => m.day === streak);
};

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
