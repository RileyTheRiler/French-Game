import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProgress } from './ProgressContext';
import { NATIVE_SPEAKERS } from '../data/nativeSpeakers';

const MessagingContext = createContext();

const MESSAGING_STORAGE_KEY = 'frenchApp_messaging';

export const MessagingProvider = ({ children }) => {
    const { addXP, unlockAchievement } = useProgress();

    // State for messaging system
    const [conversations, setConversations] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).conversations || {} : {};
    });

    const [messagingStats, setMessagingStats] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).stats || { totalMessages: 0, streak: 0 } : { totalMessages: 0, streak: 0 };
    });

    // Save to local storage
    useEffect(() => {
        localStorage.setItem(MESSAGING_STORAGE_KEY, JSON.stringify({
            conversations,
            stats: messagingStats
        }));
    }, [conversations, messagingStats]);

    // Simulate partner typing and response
    const simulatePartnerResponse = useCallback((partnerId, userMessage) => {
        const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
        if (!partner) return;

        // Set typing status
        setConversations(prev => ({
            ...prev,
            [partnerId]: {
                ...prev[partnerId],
                isTyping: true
            }
        }));

        // Determine response logic (could be more complex AI or script based)
        const randomDelay = 1500 + Math.random() * 2000;

        setTimeout(() => {
            let replyText = "C'est intéressant ! Dis-m'en plus."; // Default fallback

            // Simple keyword matching for demo
            const lowerMsg = userMessage.toLowerCase();
            if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
                replyText = `Salut ! Comment ça va aujourd'hui ?`;
            } else if (lowerMsg.includes('ça va')) {
                replyText = "Je vais très bien, merci ! Et toi ?";
            } else if (lowerMsg.includes('manger') || lowerMsg.includes('faim')) {
                replyText = "Moi aussi j'ai faim... On mange quoi ?";
            } else if (lowerMsg.includes('merci')) {
                replyText = "Je t'en prie !";
            }

            const newMessage = {
                id: `msg_${Date.now()}`,
                senderId: partnerId,
                text: replyText,
                timestamp: Date.now(),
                read: false
            };

            setConversations(prev => ({
                ...prev,
                [partnerId]: {
                    ...prev[partnerId],
                    isTyping: false,
                    messages: [...(prev[partnerId]?.messages || []), newMessage],
                    lastMessage: newMessage
                }
            }));

            // Play notification sound if implemented
        }, randomDelay);
    }, []);

    // Send a message
    const sendMessage = useCallback((partnerId, text) => {
        if (!text.trim()) return;

        const newMessage = {
            id: `msg_${Date.now()}`,
            senderId: 'user',
            text: text.trim(),
            timestamp: Date.now(),
            read: true
        };

        setConversations(prev => {
            const currentConv = prev[partnerId] || { messages: [], partnerId };
            return {
                ...prev,
                [partnerId]: {
                    ...currentConv,
                    messages: [...(currentConv.messages || []), newMessage],
                    lastMessage: newMessage
                }
            };
        });

        // Update stats
        setMessagingStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1
        }));

        // XP Reward for practice
        addXP(5);

        // Check achievements
        if (messagingStats.totalMessages === 9) {
            unlockAchievement('social_butterfly');
        }

        // Simulate partner response
        simulatePartnerResponse(partnerId, text);
    }, [addXP, unlockAchievement, messagingStats.totalMessages, simulatePartnerResponse]);

    // Mark messages as read
    const markAsRead = useCallback((partnerId) => {
        setConversations(prev => {
            const conv = prev[partnerId];
            if (!conv) return prev;

            return {
                ...prev,
                [partnerId]: {
                    ...conv,
                    messages: conv.messages.map(m => ({ ...m, read: true }))
                }
            };
        });
    }, []);

    // Get unread count
    const getUnreadCount = useCallback(() => {
        let count = 0;
        Object.values(conversations).forEach(conv => {
            count += conv.messages.filter(m => !m.read && m.senderId !== 'user').length;
        });
        return count;
    }, [conversations]);

    const value = {
        conversations,
        sendMessage,
        markAsRead,
        getUnreadCount,
        stats: messagingStats
    };

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
