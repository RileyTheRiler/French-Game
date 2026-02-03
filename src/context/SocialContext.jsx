/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';

export const SocialContext = createContext();

export const SocialProvider = ({ children }) => {
    const { user } = useProgress(); // Assuming user profile is in ProgressContext or AuthContext

    // Mock Friends Data
    const [friends, setFriends] = useState([
        { id: 1, name: 'Alice', xp: 1250, streak: 5, avatar: '🦊', status: 'online' },
        { id: 2, name: 'Bob', xp: 980, streak: 2, avatar: '🦁', status: 'offline' },
        { id: 3, name: 'Charlie', xp: 2100, streak: 12, avatar: '🦉', status: 'learning' }
    ]);

    // Mock Leaderboard Data
    const [leaderboard, setLeaderboard] = useState([
        { rank: 1, name: 'MasterPierre', xp: 5400, avatar: '👑' },
        { rank: 2, name: 'Sophie_Learns', xp: 4800, avatar: '🎓' },
        { rank: 3, name: 'JeanLuc', xp: 4200, avatar: '🚀' },
        // ... more
    ]);

    // Community Challenges
    const [activeChallenge, setActiveChallenge] = useState(() => {
        // Initialize lazy to avoid impure Date.now() in render
        return {
            id: 'chal_1',
            title: 'Weekly Word Wizard',
            description: 'Learn 50 new words as a community',
            target: 10000,
            current: 0,
            // Placeholder date, effect will update
            endDate: new Date().toISOString(),
            participants: []
        };
    });

    useEffect(() => {
        // Update date in effect to be pure
        setTimeout(() => {
            setActiveChallenge(prev => ({
                ...prev,
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }));
        }, 0);
    }, []);

    const [notifications] = useState([]);

    // Add a friend
    const addFriend = useCallback((friendId) => {
        // Simulate API call
        console.log(`Adding friend ${friendId}`);
        // Update local state...
    }, []);

    // Remove a friend
    const removeFriend = useCallback((friendId) => {
        setFriends(prev => prev.filter(f => f.id !== friendId));
    }, []);

    // Send a nudge/encouragement
    const sendNudge = useCallback((friendId) => {
        console.log(`Nudging friend ${friendId}`);
        // Logic to send notification...
    }, []);

    // Join a challenge
    const joinChallenge = useCallback((challengeId) => {
        setActiveChallenge(prev => {
            if (prev.id !== challengeId) return prev;
            return {
                ...prev,
                participants: [...prev.participants, user?.id || 'me']
            };
        });
    }, [user]);

    // Contribute to challenge
    const contributeToChallenge = useCallback((amount) => {
        setActiveChallenge(prev => ({
            ...prev,
            current: Math.min(prev.current + amount, prev.target)
        }));
    }, []);

    // Refresh Leaderboard
    const refreshLeaderboard = useCallback(() => {
        // Simulate fetch
        const newLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);
        setLeaderboard(newLeaderboard);
    }, [leaderboard]);

    const value = useMemo(() => ({
        friends,
        leaderboard,
        activeChallenge,
        notifications,
        addFriend,
        removeFriend,
        sendNudge,
        joinChallenge,
        contributeToChallenge,
        refreshLeaderboard
    }), [
        friends,
        leaderboard,
        activeChallenge,
        notifications,
        addFriend,
        removeFriend,
        sendNudge,
        joinChallenge,
        contributeToChallenge,
        refreshLeaderboard
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

export default SocialContext;
