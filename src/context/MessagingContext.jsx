import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { NATIVE_SPEAKERS } from '../data/nativeSpeakers';

export const MessagingContext = createContext();

export const MessagingProvider = ({ children }) => {
    const { addXP, achievements, unlockAchievement } = useProgress();

    // Stats for messaging feature
    const [messagingStats, setMessagingStats] = useState(() => {
        const saved = localStorage.getItem('frenchApp_messagingStats');
        return saved ? JSON.parse(saved) : {
            totalMessages: 0,
            conversationsStarted: 0,
            repliesReceived: 0,
            vocabularyUsed: []
        };
    });

    const [conversations, setConversations] = useState(() => {
        const saved = localStorage.getItem('frenchApp_conversations');
        return saved ? JSON.parse(saved) : {};
    });

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('frenchApp_messagingStats', JSON.stringify(messagingStats));
    }, [messagingStats]);

    useEffect(() => {
        localStorage.setItem('frenchApp_conversations', JSON.stringify(conversations));
    }, [conversations]);

    // Simulate partner typing and response
    const simulatePartnerResponse = useCallback((partnerId, userMessage) => {
        const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
        if (!partner) return;

        // Simple logic to pick a response based on keywords or random
        // In a real app, this would be an AI or backend call
        // For now, we cycle through some generic responses or specific ones

        const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds

        setTimeout(() => {
            setConversations(prev => {
                const conv = prev[partnerId] || { messages: [], unread: 0 };
                const newMessage = {
                    id: Date.now(),
                    sender: 'partner',
                    text: "C'est intéressant ! Dis-moi en plus.", // Placeholder response
                    timestamp: Date.now()
                };

                return {
                    ...prev,
                    [partnerId]: {
                        ...conv,
                        messages: [...conv.messages, newMessage],
                        unread: conv.unread + 1,
                        lastMessage: newMessage,
                        updatedAt: Date.now()
                    }
                };
            });

            setMessagingStats(prev => ({
                ...prev,
                repliesReceived: prev.repliesReceived + 1
            }));

            // Sound or notification trigger could go here

        }, randomDelay);
    }, []);

    const startConversation = useCallback((partnerId) => {
        setConversations(prev => {
            if (prev[partnerId]) return prev; // Already exists

            const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
            const initialMessage = {
                id: Date.now(),
                sender: 'partner',
                text: partner.introMessage,
                timestamp: Date.now()
            };

            return {
                ...prev,
                [partnerId]: {
                    id: partnerId,
                    partner,
                    messages: [initialMessage],
                    unread: 1,
                    lastMessage: initialMessage,
                    updatedAt: Date.now()
                }
            };
        });

        setMessagingStats(prev => ({
            ...prev,
            conversationsStarted: prev.conversationsStarted + 1
        }));
    }, []);

    const sendMessage = useCallback((partnerId, text) => {
        const newMessage = {
            id: Date.now(),
            sender: 'user',
            text,
            timestamp: Date.now()
        };

        setConversations(prev => {
            const conv = prev[partnerId];
            if (!conv) return prev;

            return {
                ...prev,
                [partnerId]: {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    lastMessage: newMessage,
                    updatedAt: Date.now()
                }
            };
        });

        setMessagingStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1
        }));

        // XP Reward for practice
        addXP(5);

        // Check achievements?
        if (messagingStats.totalMessages + 1 >= 10) {
            // unlockAchievement('social_butterfly'); // Example
        }

        // Simulate partner response
        simulatePartnerResponse(partnerId, text);
    }, [addXP, messagingStats.totalMessages, simulatePartnerResponse]);

    // Mark messages as read
    const markAsRead = useCallback((partnerId) => {
        setConversations(prev => {
            const conv = prev[partnerId];
            if (!conv || conv.unread === 0) return prev;

            return {
                ...prev,
                [partnerId]: {
                    ...conv,
                    unread: 0
                }
            };
        });
    }, []);

    const deleteConversation = useCallback((partnerId) => {
        setConversations(prev => {
            const newConversations = { ...prev };
            delete newConversations[partnerId];
            return newConversations;
        });
    }, []);

    const value = useMemo(() => ({
        conversations,
        messagingStats,
        startConversation,
        sendMessage,
        markAsRead,
        deleteConversation
    }), [
        conversations,
        messagingStats,
        startConversation,
        sendMessage,
        markAsRead,
        deleteConversation
    ]);

    return (
        <MessagingContext.Provider value={value}>
            {children}
        </MessagingContext.Provider>
    );
};

export const useMessaging = () => {
    const context = useContext(MessagingContext);
    if (!context) {
        throw new Error('useMessaging must be used within a MessagingProvider');
    }
    return context;
};

export default MessagingContext;
