/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useProgress } from './ProgressContext';

const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
    const { addXP, unlockAchievement } = useProgress();

    // Mock Community Data State
    const [communityStats, setCommunityStats] = useState({
        globalLearners: 12450,
        onlineNow: 342,
        writingsSubmitted: 0,
        correctionsGiven: 0
    });

    // Initialize with Mock Data directly using lazy initialization for purity
    const [writings, setWritings] = useState(() => [
        {
            id: 'w1',
            author: 'Jean-Pierre',
            content: "J'aime beaucoup les croissants.",
            correction: null,
            likes: 5,
            timestamp: Date.now() - 3600000
        },
        {
            id: 'w2',
            author: 'Sarah K.',
            content: "Je suis allé à la plage hier.",
            correction: "Je suis allée (feminine)",
            likes: 12,
            timestamp: Date.now() - 7200000
        }
    ]);

    const [leaderboard] = useState(() => [
        { id: 'u1', name: 'Marie L.', xp: 15400, league: 'Diamond' },
        { id: 'u2', name: 'John D.', xp: 14200, league: 'Diamond' },
        { id: 'u3', name: 'Sophie T.', xp: 13800, league: 'Diamond' },
        { id: 'me', name: 'You', xp: 0, league: 'Gold' }, // Will sync with actual XP
    ]);

    // Simulate a native speaker correcting the user's writing
    const simulateCorrectionResponse = useCallback((writingId) => {
        // Random delay between 10-30 seconds
        const delay = 10000 + Math.random() * 20000;

        setTimeout(() => {
            setWritings(prev => prev.map(w => {
                if (w.id !== writingId) return w;

                // Simple mock logic for correction
                const correctionText = w.content.length > 20
                    ? "Très bien ! Juste une petite erreur d'accord."
                    : "Parfait !";

                return {
                    ...w,
                    correction: correctionText,
                    corrector: "NativeSpeaker_ Pierre"
                };
            }));

            addXP(20); // XP for getting a correction? Or just notification.
            // Notify user logic here (omitted)
        }, delay);
    }, [addXP]);

    const submitWriting = useCallback((text, promptId) => {
        const newWriting = {
            id: `w_${Date.now()}`,
            author: 'You',
            content: text,
            correction: null,
            likes: 0,
            timestamp: Date.now(),
            promptId
        };

        setWritings(prev => [newWriting, ...prev]);
        setCommunityStats(prev => ({
            ...prev,
            writingsSubmitted: prev.writingsSubmitted + 1
        }));

        addXP(10); // XP for posting

        if (communityStats.writingsSubmitted === 4) { // 5th post
            unlockAchievement('community_voice');
        }

        // Simulate receiving a correction after a delay
        simulateCorrectionResponse(newWriting.id);

        return newWriting;
    }, [addXP, unlockAchievement, communityStats.writingsSubmitted, simulateCorrectionResponse]);

    // Submit a correction for someone else's writing
    const submitCorrection = useCallback((writingId, correctionItems, comment) => {
        setWritings(prev => prev.map(w => {
            if (w.id !== writingId) return w;
            return {
                ...w,
                correction: comment, // Simplified
                corrector: 'You'
            };
        }));

        setCommunityStats(prev => ({
            ...prev,
            correctionsGiven: prev.correctionsGiven + 1
        }));

        addXP(30); // Higher reward for helping
    }, [addXP]);

    const likeWriting = useCallback((writingId) => {
        setWritings(prev => prev.map(w => {
            if (w.id !== writingId) return w;
            return { ...w, likes: w.likes + 1 };
        }));
    }, []);

    const value = {
        stats: communityStats,
        writings,
        leaderboard,
        submitWriting,
        submitCorrection,
        likeWriting
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunity = () => {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error('useCommunity must be used within a CommunityProvider');
    }
    return context;
};
