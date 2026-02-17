/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProgress } from './ProgressContext';

const MessagingContext = createContext();

const NATIVE_SPEAKERS = [
    { id: 'npc_pierre', name: 'Pierre', level: 12, country: '🇫🇷', avatar: '👨‍🎨', intro: "Salut! Je suis Pierre." },
    { id: 'npc_lisa', name: 'Lisa', level: 10, country: '🇺🇸', avatar: '👩‍🏫', intro: "Hi! I'm Lisa, learning French too!" },
    { id: 'npc_guru', name: 'Guru', level: 20, country: '🇬🇧', avatar: '🧐', intro: "Greetings. I teach grammar." },
];

const MESSAGING_STORAGE_KEY = 'frenchApp_messaging';

export const MessagingProvider = ({ children }) => {
    const { addXP } = useProgress();

    // State
    const [messages, setMessages] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).messages || {} : {};
    });

    const [activeChatId, setActiveChatId] = useState(null);

    const [messagingStats, setMessagingStats] = useState(() => {
        const stored = localStorage.getItem(MESSAGING_STORAGE_KEY);
        return stored ? JSON.parse(stored).stats || { totalMessages: 0, streak: 0 } : { totalMessages: 0, streak: 0 };
    });

    // Helper to unlock achievement
    // eslint-disable-next-line no-unused-vars
    const unlockAchievement = useCallback((_id) => {
        // This would typically call a function in ProgressContext, assuming it exposed one directly for unlocking specific ID
        // But ProgressContext usually handles logic internally.
        // We will just log for now or assume addXP handles side effects if implemented there.
        // For this mock, we assume 'addXP' might check achievements.
    }, []);

    // Simulate partner typing and response
    const simulatePartnerResponse = useCallback((partnerId, userMessage) => {
        const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
        if (!partner) return;

        // Simple mock response logic based on keywords
        let responseText = "C'est intéressant !";
        const lowerMsg = userMessage.toLowerCase();

        if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
            responseText = `Salut ${partner.name === 'Pierre' ? 'mon ami' : ''} ! Comment ça va ?`;
        } else if (lowerMsg.includes('ça va')) {
            responseText = "Ça va très bien, merci ! Et toi ?";
        } else if (lowerMsg.includes('merci')) {
            responseText = "De rien !";
        } else if (lowerMsg.includes('?')) {
            responseText = "C'est une bonne question. Je pense que oui.";
        }

        const randomDelay = 1000 + Math.random() * 3000;

        setTimeout(() => {
            const newMessage = {
                id: `msg_${Date.now()}_${Math.random()}`,
                senderId: partnerId,
                text: responseText,
                timestamp: Date.now(),
                read: false
            };

            setMessages(prev => ({
                ...prev,
                [partnerId]: [...(prev[partnerId] || []), newMessage]
            }));

            // Play notification sound if active (mock)
            // SoundManager.playNotification();

        }, randomDelay);
    }, []);

    const sendMessage = useCallback((partnerId, text) => {
        if (!text.trim()) return;

        const newMessage = {
            id: `msg_${Date.now()}`,
            senderId: 'user',
            text: text,
            timestamp: Date.now(),
            read: true
        };

        setMessages(prev => ({
            ...prev,
            [partnerId]: [...(prev[partnerId] || []), newMessage]
        }));

        setMessagingStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1
        }));

        // Grant XP for practice
        addXP(5);

        // Check generic achievements
        if (messagingStats.totalMessages === 9) { // becoming 10
            unlockAchievement('social_butterfly');
        }

        // Simulate partner response
        simulatePartnerResponse(partnerId, text);
    }, [addXP, unlockAchievement, messagingStats.totalMessages, simulatePartnerResponse]);

    // Persist
    useEffect(() => {
        const data = {
            messages,
            stats: messagingStats
        };
        localStorage.setItem(MESSAGING_STORAGE_KEY, JSON.stringify(data));
    }, [messages, messagingStats]);

    // Mark messages as read
    const markAsRead = useCallback((partnerId) => {
        setMessages(prev => {
            const chat = prev[partnerId];
            if (!chat) return prev;

            const updatedChat = chat.map(msg => ({ ...msg, read: true }));
            return {
                ...prev,
                [partnerId]: updatedChat
            };
        });
    }, []);

    const getChatHistory = useCallback((partnerId) => {
        return messages[partnerId] || [];
    }, [messages]);

    const getUnreadCount = useCallback(() => {
        let count = 0;
        Object.values(messages).forEach(chat => {
            chat.forEach(msg => {
                if (msg.senderId !== 'user' && !msg.read) count++;
            });
        });
        return count;
    }, [messages]);

    const value = {
        messages,
        activeChatId,
        setActiveChatId,
        sendMessage,
        markAsRead,
        getChatHistory,
        getUnreadCount,
        partners: NATIVE_SPEAKERS
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
