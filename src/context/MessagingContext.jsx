import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Bot, Lightbulb, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import SoundManager from '../utils/SoundManager';
import { npcSystem } from '../systems/NPCSystem';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { SCENARIOS } from '../data/conversationScenarios';
import { findBestMatch } from '../utils/textMatching';
import { calculateRewards } from '../utils/rewardSystem';
import { NATIVE_SPEAKERS } from '../data/nativeSpeakers';

const MessagingContext = React.createContext();

export const MessagingProvider = ({ children }) => {
    const { addXP, unlockAchievement } = useProgress();
    const [messagingStats, setMessagingStats] = useState({
        totalMessages: 0,
        partnersEngaged: 0,
        streakDays: 0
    });

    const simulatePartnerResponse = useCallback((partnerId, userMessage) => {
        const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
        if (!partner) return;

        // Simple mock response logic based on keywords
        let responseText = "C'est intéressant ! Dis-m'en plus.";
        if (userMessage.includes('bonjour') || userMessage.includes('salut')) {
            responseText = `Salut ! Comment ça va aujourd'hui ?`;
        } else if (userMessage.includes('ça va')) {
            responseText = "Je vais très bien, merci ! Et toi ?";
        } else if (userMessage.length < 5) {
            responseText = "Peux-tu élaborer un peu ?";
        }

        // Random delay between 5-15 seconds for realism
        const randomDelay = 5000 + Math.random() * 10000;

        setTimeout(() => {
            // In a real app, this would push to a message store/state
            console.log(`New message from ${partner.name}: ${responseText}`);
            // Trigger a toast or update context state here
        }, randomDelay);
    }, []);

    const sendMessage = useCallback((partnerId, text) => {
        setMessagingStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1
        }));

        // XP Reward for engagement
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
        // Logic to mark messages as read
    }, []);

    return (
        <MessagingContext.Provider value={{
            sendMessage,
            markAsRead,
            messagingStats
        }}>
            {children}
        </MessagingContext.Provider>
    );
};

export const useMessaging = () => React.useContext(MessagingContext);
