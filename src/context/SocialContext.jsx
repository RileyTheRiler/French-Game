/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';

const SocialContext = createContext();

const MOCK_NPCS = {
    'PIERRE': { id: 'npc_pierre', name: 'PolyglotPierre', level: 12, country: '🇫🇷', isNPC: true, avatar: '👨‍🎨' },
    'LISA': { id: 'npc_lisa', name: 'LinguaLisa', level: 10, country: '🇺🇸', isNPC: true, avatar: '👩‍🏫' },
    'GURU': { id: 'npc_guru', name: 'GrammarGuru', level: 9, country: '🇬🇧', isNPC: true, avatar: '🧐' },
    'VICTOR': { id: 'npc_victor', name: 'VocabVictor', level: 8, country: '🇨🇦', isNPC: true, avatar: '📚' },
};

const SOCIAL_STORAGE_KEY = 'frenchApp_social';

export const SocialProvider = ({ children }) => {
    const { stats, addXP } = useProgress();

    // State
    const [friends, setFriends] = useState(() => {
        const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
        return stored ? JSON.parse(stored).friends || [] : [];
    });

    const [coopGroup, setCoopGroup] = useState(() => {
        const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
        return stored ? JSON.parse(stored).coopGroup || null : null;
    });

    const [userCoopStartXp, setUserCoopStartXp] = useState(() => {
        const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
        return stored ? JSON.parse(stored).userCoopStartXp || 0 : 0;
    });

    const [friendsProgress, setFriendsProgress] = useState(() => {
        const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
        return stored ? JSON.parse(stored).friendsProgress || 5000 : 5000; // Start with some progress
    });

    const [baseChallenge, setBaseChallenge] = useState(() => ({
        id: 'chal_weekly_xp',
        title: 'Team XP Weekly',
        target: 10000,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        participants: []
    }));

    const activeChallenge = useMemo(() => {
        const userContribution = Math.max(0, stats.xp - userCoopStartXp);
        const total = Math.min(baseChallenge.target, userContribution + friendsProgress);
        return {
            ...baseChallenge,
            current: total,
            isCompleted: total >= baseChallenge.target
        };
    }, [baseChallenge, stats.xp, userCoopStartXp, friendsProgress]);

    const claimCoopReward = useCallback(() => {
        if (!activeChallenge.isCompleted) return;

        // Award bonus
        addXP(500); // Bonus XP
        // Could add coins here too if Context supported it

        // Reset or generate new challenge (mock logic)
        setBaseChallenge(prev => ({
            ...prev,
            target: Math.floor(prev.target * 1.2), // Increase difficulty
            title: 'Next Team Challenge'
        }));

        // Reset progress trackers
        setUserCoopStartXp(stats.xp);
        setFriendsProgress(0);

        return 500; // Return reward amount
    }, [activeChallenge.isCompleted, stats.xp, addXP]);

    // Persist to local storage
    useEffect(() => {
        localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify({
            friends,
            coopGroup,
            userCoopStartXp,
            friendsProgress
        }));
    }, [friends, coopGroup, userCoopStartXp, friendsProgress]);

    // Simulate friend activity (XP gains)
    useEffect(() => {
        const interval = setInterval(() => {
            if (coopGroup) {
                const randomGain = Math.floor(Math.random() * 50);
                if (randomGain > 20) { // 60% chance per tick
                    setFriendsProgress(prev => prev + randomGain);
                }
            }
        }, 10000); // Check every 10s

        return () => clearInterval(interval);
    }, [coopGroup]);

    const addFriend = useCallback((code) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const normalizedCode = code.toUpperCase().trim();

                if (friends.some(f => f.id === MOCK_NPCS[normalizedCode]?.id)) {
                    reject(new Error("Already friends with this user!"));
                    return;
                }

                if (MOCK_NPCS[normalizedCode]) {
                    const newFriend = {
                        ...MOCK_NPCS[normalizedCode],
                        addedAt: Date.now(),
                        xp: Math.floor(Math.random() * 5000),
                        weeklyXp: Math.floor(Math.random() * 1000)
                    };
                    setFriends(prev => [...prev, newFriend]);
                    resolve(newFriend);
                } else if (normalizedCode === 'FORCE_ERROR') {
                    reject(new Error("User not found"));
                } else {
                    const newFriend = {
                        id: `user_${Date.now()}`,
                        name: `User_${code}`,
                        level: 1,
                        country: '🌍',
                        isNPC: false,
                        addedAt: Date.now(),
                        xp: 0,
                        weeklyXp: 0,
                        avatar: '👤'
                    };
                    setFriends(prev => [...prev, newFriend]);
                    resolve(newFriend);
                }
            }, 800);
        });
    }, [friends]);

    const removeFriend = useCallback((friendId) => {
        setFriends(prev => prev.filter(f => f.id !== friendId));
    }, []);

    const createCoopGroup = useCallback((name) => {
        const group = {
            id: `group_${Date.now()}`,
            name,
            members: ['You', ...friends.map(f => f.name)],
            createdAt: Date.now()
        };
        setCoopGroup(group);
        setUserCoopStartXp(stats.xp); // Snapshot current XP as baseline
        setFriendsProgress(Math.floor(Math.random() * 2000)); // Random starting progress from friends
    }, [friends, stats.xp]);

    const leaveCoopGroup = useCallback(() => {
        setCoopGroup(null);
        setFriendsProgress(0);
        setUserCoopStartXp(0);
    }, []);

    const value = useMemo(() => ({
        friends,
        addFriend,
        removeFriend,
        coopGroup,
        createCoopGroup,
        leaveCoopGroup,
        activeChallenge,
        claimCoopReward
    }), [
        friends,
        addFriend,
        removeFriend,
        coopGroup,
        createCoopGroup,
        leaveCoopGroup,
        activeChallenge,
        claimCoopReward
    ]);

    return (
        <SocialContext.Provider value={value}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) {
        throw new Error('useSocial must be used within a SocialProvider');
    }
    return context;
};
