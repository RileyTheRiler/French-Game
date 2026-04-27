import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { NATIVE_SPEAKERS, generateResponse, detectErrors, CONVERSATION_STARTERS } from '../data/nativeSpeakers';

const MessagingContext = createContext();

const MESSAGING_STORAGE_KEY = 'frenchApp_messaging';

export const MessagingProvider = ({ children }) => {
    const { addXP, unlockAchievement } = useProgress();

    // All conversations
    const [conversations, setConversations] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).conversations || {} : {};
    });

    // Connected partners (unlocked for chat)
    const [connectedPartners, setConnectedPartners] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).connectedPartners || [] : [];
    });

    // Messaging stats
    const [messagingStats, setMessagingStats] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).messagingStats || {
            totalMessages: 0,
            partnersConnected: 0,
            conversationsStarted: 0
        } : {
            totalMessages: 0,
            partnersConnected: 0,
            conversationsStarted: 0
        };
    });

    // Active typing indicator
    const [typingPartner, setTypingPartner] = useState(null);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(MESSAGING_STORAGE_KEY, JSON.stringify({
            conversations,
            connectedPartners,
            messagingStats
        }));
    }, [conversations, connectedPartners, messagingStats]);

    // Get all available partners
    const getAvailablePartners = useCallback(() => {
        return NATIVE_SPEAKERS.map(speaker => ({
            ...speaker,
            isConnected: connectedPartners.includes(speaker.id),
            hasUnread: conversations[speaker.id]?.some(m => !m.read && m.senderId === speaker.id)
        }));
    }, [connectedPartners, conversations]);

    // Connect with a partner
    const connectWithPartner = useCallback((partnerId) => {
        if (connectedPartners.includes(partnerId)) return;

        setConnectedPartners(prev => [...prev, partnerId]);

        setMessagingStats(prev => ({
            ...prev,
            partnersConnected: prev.partnersConnected + 1
        }));

        // First partner achievement
        if (connectedPartners.length === 0) {
            unlockAchievement?.('first_penpal');
            addXP(20);
        }

        // Start with a greeting from the partner
        const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
        if (partner) {
            const greeting = partner.responsePatterns.greeting[
                Math.floor(Math.random() * partner.responsePatterns.greeting.length)
            ];

            setConversations(prev => ({
                ...prev,
                [partnerId]: [{
                    id: `msg_${Date.now()}`,
                    senderId: partnerId,
                    senderName: partner.name,
                    text: greeting,
                    timestamp: Date.now(),
                    read: false
                }]
            }));

            setMessagingStats(prev => ({
                ...prev,
                conversationsStarted: prev.conversationsStarted + 1
            }));
        }
    }, [connectedPartners, addXP, unlockAchievement]);

    // Send a message
    const sendMessage = useCallback((partnerId, text) => {
        const userMessage = {
            id: `msg_${Date.now()}`,
            senderId: 'user',
            senderName: 'You',
            text,
            timestamp: Date.now(),
            read: true
        };

        setConversations(prev => ({
            ...prev,
            [partnerId]: [...(prev[partnerId] || []), userMessage]
        }));

        setMessagingStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1
        }));

        // Award XP for messaging
        addXP(2);

        // Check for milestone achievements
        if (messagingStats.totalMessages === 49) { // 50th message
            unlockAchievement?.('native_connection');
        }

        // Simulate partner response
        simulatePartnerResponse(partnerId, text);
    }, [addXP, unlockAchievement, messagingStats.totalMessages]);

    // Simulate partner typing and response
    const simulatePartnerResponse = useCallback((partnerId, userMessage) => {
        const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
        if (!partner) return;

        // Show typing indicator
        setTypingPartner(partnerId);

        // Simulate typing delay based on partner's typing speed
        const baseDelay = partner.typingSpeed || 1500;
        const randomDelay = baseDelay + Math.random() * 1000;

        setTimeout(() => {
            setTypingPartner(null);

            // Generate response
            const responseText = generateResponse(partner, userMessage);

            // Check for errors in user's message and possibly correct them
            const errors = detectErrors(userMessage);
            let finalResponse = responseText;

            if (errors.length > 0 && Math.random() > 0.5) {
                // Sometimes add a correction
                const error = errors[0];
                const correctionPrefix = partner.responsePatterns.correction[
                    Math.floor(Math.random() * partner.responsePatterns.correction.length)
                ].replace('{correction}', error.suggestion);
                finalResponse = correctionPrefix + "\n\n" + responseText;
            }

            const partnerMessage = {
                id: `msg_${Date.now()}`,
                senderId: partnerId,
                senderName: partner.name,
                text: finalResponse,
                timestamp: Date.now(),
                read: false,
                correction: errors.length > 0 ? errors[0] : null
            };

            setConversations(prev => ({
                ...prev,
                [partnerId]: [...(prev[partnerId] || []), partnerMessage]
            }));
        }, randomDelay);
    }, []);

    // Mark messages as read
    const markAsRead = useCallback((partnerId) => {
        setConversations(prev => ({
            ...prev,
            [partnerId]: (prev[partnerId] || []).map(msg => ({
                ...msg,
                read: true
            }))
        }));
    }, []);

    // Get conversation with a partner
    const getConversation = useCallback((partnerId) => {
        return conversations[partnerId] || [];
    }, [conversations]);

    // Get unread count
    const getUnreadCount = useCallback(() => {
        let count = 0;
        Object.values(conversations).forEach(conv => {
            count += conv.filter(m => !m.read && m.senderId !== 'user').length;
        });
        return count;
    }, [conversations]);

    // Get suggested replies based on conversation context
    const getSuggestedReplies = useCallback((partnerId) => {
        const conversation = conversations[partnerId] || [];
        const lastMessage = conversation[conversation.length - 1];

        if (!lastMessage || lastMessage.senderId === 'user') {
            return [
                "Bonjour ! Comment ça va ?",
                "Salut ! Quoi de neuf ?",
                "Je suis content(e) de te parler !"
            ];
        }

        const text = lastMessage.text.toLowerCase();

        // Response suggestions based on context
        if (text.includes('comment') && text.includes('va')) {
            return [
                "Ça va bien, merci ! Et toi ?",
                "Je vais très bien !",
                "Pas mal, et toi ?"
            ];
        }

        if (text.includes('quoi de neuf') || text.includes('?')) {
            return [
                "Rien de spécial, je pratique mon français.",
                "J'apprends de nouveaux mots !",
                "Je lis un livre en français."
            ];
        }

        // Default suggestions
        return [
            "C'est intéressant !",
            "Je comprends, merci !",
            "Tu peux m'expliquer plus ?"
        ];
    }, [conversations]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        conversations,
        connectedPartners,
        messagingStats,
        typingPartner,
        getAvailablePartners,
        connectWithPartner,
        sendMessage,
        markAsRead,
        getConversation,
        getUnreadCount,
        getSuggestedReplies,
        NATIVE_SPEAKERS
    }), [conversations, connectedPartners, messagingStats, typingPartner, getAvailablePartners, connectWithPartner, sendMessage, markAsRead, getConversation, getUnreadCount, getSuggestedReplies]);

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
