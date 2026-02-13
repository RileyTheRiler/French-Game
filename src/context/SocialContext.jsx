import React, { createContext, useContext, useState, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { useProgress } from './ProgressContext';

export const SocialContext = createContext();

export const SocialProvider = ({ children }) => {
    const { user } = useProgress();

    // Friend System
    const [friends, setFriends] = useState([
        { id: 'u2', name: 'Marie', avatar: '👩‍🎨', level: 12, status: 'online', streak: 15 },
        { id: 'u3', name: 'Jean', avatar: '👨‍🍳', level: 8, status: 'offline', streak: 3 },
    ]);

    const [friendRequests, setFriendRequests] = useState([
        { id: 'u4', name: 'Sophie', avatar: '👩‍🏫', level: 5 }
    ]);

    // Leaderboards
    const [leaderboard, setLeaderboard] = useState([
        { id: 'u1', name: 'You', xp: 1250, rank: 4, avatar: '👤' },
        { id: 'u2', name: 'Marie', xp: 2100, rank: 1, avatar: '👩‍🎨' },
        { id: 'u5', name: 'Pierre', xp: 1850, rank: 2, avatar: '🕵️‍♂️' },
        { id: 'u6', name: 'Lucie', xp: 1400, rank: 3, avatar: '👩‍🚀' },
        { id: 'u3', name: 'Jean', xp: 900, rank: 5, avatar: '👨‍🍳' },
    ]);

    // Group Challenges
    const [activeChallenge, setActiveChallenge] = useState(() => ({
        id: 'c1',
        title: 'Community Goal: 10k Words',
        target: 10000,
        current: 0,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        participants: []
    }));

    const [notifications, setNotifications] = useState([]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly update leaderboard
            setLeaderboard(prev => {
                const updated = prev.map(user => ({
                    ...user,
                    xp: user.xp + (Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0)
                }));
                return updated.sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));
            });

            // Update community challenge
            setActiveChallenge(prev => ({
                ...prev,
                current: Math.min(prev.target, prev.current + Math.floor(Math.random() * 10))
            }));

        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const sendFriendRequest = (userId) => {
        // API call would go here
        console.log(`Sent request to ${userId}`);
    };

    const acceptFriendRequest = (request) => {
        setFriends(prev => [...prev, { ...request, status: 'online', streak: 0 }]);
        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
        addNotification(`You are now friends with ${request.name}!`);
    };

    const rejectFriendRequest = (requestId) => {
        setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const challengeFriend = (friendId) => {
        addNotification(`Challenge sent to ${friends.find(f => f.id === friendId)?.name}!`);
    };

    const joinCommunityChallenge = () => {
        if (!user) return;
        setActiveChallenge(prev => ({
            ...prev,
            participants: [...prev.participants, user.id]
        }));
    };

    const addNotification = (message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, read: false, time: new Date() }]);
        // Auto-dismiss toast logic if we wanted it here, but we store it for the panel
    };

    const markNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const value = {
        friends,
        friendRequests,
        leaderboard,
        activeChallenge,
        notifications,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        challengeFriend,
        joinCommunityChallenge,
        markNotificationsRead
    };

    return (
        <SocialContext.Provider value={value}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => useContext(SocialContext);
