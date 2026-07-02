import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { WRITING_PROMPTS, SAMPLE_SUBMISSIONS, COMMUNITY_XP } from '../data/communityWritings';
import { NATIVE_SPEAKERS, generateResponse } from '../data/nativeSpeakers';

const CommunityContext = createContext();

const COMMUNITY_STORAGE_KEY = 'frenchApp_community';

export const CommunityProvider = ({ children }) => {
    const { addXP, unlockAchievement } = useProgress();

    // User's submitted writings
    const [myWritings, setMyWritings] = useState(() => {
        const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
        return stored ? JSON.parse(stored).myWritings || [] : [];
    });

    // Writings available to correct (from mock community)
    const [pendingWritings, setPendingWritings] = useState(() => {
        return SAMPLE_SUBMISSIONS.filter(s => s.status === 'pending');
    });

    // Corrections user has given
    const [myCorrections, setMyCorrections] = useState(() => {
        const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
        return stored ? JSON.parse(stored).myCorrections || [] : [];
    });

    // Stats
    const [communityStats, setCommunityStats] = useState(() => {
        const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
        return stored ? JSON.parse(stored).communityStats || {
            writingsSubmitted: 0,
            correctionsGiven: 0,
            correctionsReceived: 0,
            helpfulVotes: 0
        } : {
            writingsSubmitted: 0,
            correctionsGiven: 0,
            correctionsReceived: 0,
            helpfulVotes: 0
        };
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify({
            myWritings,
            myCorrections,
            communityStats
        }));
    }, [myWritings, myCorrections, communityStats]);

    // Submit a new writing
    const submitWriting = useCallback((text, promptId) => {
        const prompt = WRITING_PROMPTS.find(p => p.id === promptId);

        const newWriting = {
            id: `my_writing_${Date.now()}`,
            promptId,
            promptTitle: prompt?.title || 'Free Writing',
            text,
            submittedAt: Date.now(),
            status: 'pending',
            corrections: []
        };

        setMyWritings(prev => [newWriting, ...prev]);

        // Update stats and award XP
        setCommunityStats(prev => ({
            ...prev,
            writingsSubmitted: prev.writingsSubmitted + 1
        }));

        // First writing bonus
        if (communityStats.writingsSubmitted === 0) {
            addXP(COMMUNITY_XP.firstWritingSubmitted);
            unlockAchievement?.('first_writing');
        } else {
            addXP(COMMUNITY_XP.submitWriting);
        }

        // Simulate receiving a correction after a delay
        simulateCorrectionResponse(newWriting.id);

        return newWriting;
    }, [addXP, unlockAchievement, communityStats.writingsSubmitted]);

    // Simulate a native speaker correcting the user's writing
    const simulateCorrectionResponse = useCallback((writingId) => {
        // Random delay between 10-30 seconds
        const delay = 10000 + Math.random() * 20000;

        setTimeout(() => {
            setMyWritings(prev => prev.map(w => {
                if (w.id !== writingId) return w;

                // Pick a random native speaker
                const corrector = NATIVE_SPEAKERS[Math.floor(Math.random() * NATIVE_SPEAKERS.length)];

                // Generate mock corrections
                const mockCorrections = generateMockCorrections(w.text);

                const correction = {
                    correctorId: corrector.id,
                    correctorName: corrector.name,
                    correctorAvatar: corrector.avatar,
                    correctorCountry: corrector.country,
                    submittedAt: Date.now(),
                    items: mockCorrections,
                    overallComment: generateOverallComment(mockCorrections.length, corrector.responseStyle),
                    rating: null // User can rate later
                };

                return {
                    ...w,
                    status: 'corrected',
                    corrections: [...w.corrections, correction]
                };
            }));

            setCommunityStats(prev => ({
                ...prev,
                correctionsReceived: prev.correctionsReceived + 1
            }));

            addXP(COMMUNITY_XP.receiveCorrection);
        }, delay);
    }, [addXP]);

    // Submit a correction for someone else's writing
    const submitCorrection = useCallback((writingId, correctionItems, comment) => {
        const correction = {
            id: `correction_${Date.now()}`,
            writingId,
            items: correctionItems,
            comment,
            submittedAt: Date.now()
        };

        setMyCorrections(prev => [correction, ...prev]);

        // Remove from pending
        setPendingWritings(prev => prev.filter(w => w.id !== writingId));

        // Update stats and award XP
        setCommunityStats(prev => ({
            ...prev,
            correctionsGiven: prev.correctionsGiven + 1
        }));

        // First correction bonus
        if (communityStats.correctionsGiven === 0) {
            addXP(COMMUNITY_XP.firstCorrectionGiven);
            unlockAchievement?.('first_correction');
        } else {
            addXP(COMMUNITY_XP.giveCorrection);
        }

        return correction;
    }, [addXP, unlockAchievement, communityStats.correctionsGiven]);

    // Rate a correction as helpful
    const rateCorrection = useCallback((writingId, correctionIndex, rating) => {
        setMyWritings(prev => prev.map(w => {
            if (w.id !== writingId) return w;

            const updatedCorrections = [...w.corrections];
            if (updatedCorrections[correctionIndex]) {
                updatedCorrections[correctionIndex] = {
                    ...updatedCorrections[correctionIndex],
                    rating
                };
            }

            return { ...w, corrections: updatedCorrections };
        }));

        if (rating >= 4) {
            setCommunityStats(prev => ({
                ...prev,
                helpfulVotes: prev.helpfulVotes + 1
            }));
        }
    }, []);

    // Get prompts
    const getPrompts = useCallback((difficulty = null) => {
        if (!difficulty) return WRITING_PROMPTS;
        return WRITING_PROMPTS.filter(p => p.difficulty === difficulty);
    }, []);

    const value = useMemo(() => ({
        myWritings,
        pendingWritings,
        myCorrections,
        communityStats,
        submitWriting,
        submitCorrection,
        rateCorrection,
        getPrompts,
        WRITING_PROMPTS
    }), [myWritings, pendingWritings, myCorrections, communityStats, submitWriting, submitCorrection, rateCorrection, getPrompts, WRITING_PROMPTS]);

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};

// Helper: Generate mock corrections based on text
function generateMockCorrections(text) {
    const corrections = [];

    // Common error patterns
    const patterns = [
        { regex: /je suis (\d+) ans/gi, fix: "j'ai $1 ans", explanation: "On utilise 'avoir' pour l'âge" },
        { regex: /j'ai allé/gi, fix: "je suis allé(e)", explanation: "Le verbe 'aller' utilise 'être' au passé composé" },
        { regex: /je reveille/gi, fix: "je me réveille", explanation: "Se réveiller est pronominal" },
        { regex: /je prend /gi, fix: "je prends ", explanation: "N'oubliez pas le 's' à la première personne" },
        { regex: /je regard /gi, fix: "je regarde ", explanation: "Les verbes en -er prennent 'e' à la première personne" },
        { regex: /je m'apple/gi, fix: "je m'appelle", explanation: "Attention à l'orthographe de 'appeler'" },
        { regex: /je habite/gi, fix: "j'habite", explanation: "Élision obligatoire devant voyelle" },
        { regex: /beaucoup des/gi, fix: "beaucoup de", explanation: "Après 'beaucoup', on utilise 'de' sans article" },
        { regex: /comme un (ingénieur|professeur|médecin)/gi, fix: "comme $1", explanation: "Pas d'article après 'comme' pour les professions" }
    ];

    for (const { regex, fix, explanation } of patterns) {
        const match = text.match(regex);
        if (match) {
            const index = text.indexOf(match[0]);
            corrections.push({
                start: index,
                end: index + match[0].length,
                original: match[0],
                correction: match[0].replace(regex, fix),
                explanation
            });
        }
    }

    // Limit to 3 corrections max to not overwhelm
    return corrections.slice(0, 3);
}

// Helper: Generate overall comment based on correction count
function generateOverallComment(errorCount, style) {
    if (style === 'friendly') {
        if (errorCount === 0) return "Wow, c'est parfait ! Tu écris super bien ! 🎉";
        if (errorCount <= 2) return "Très bien ! Juste quelques petites choses à corriger. Continue comme ça ! 😊";
        return "Bon effort ! J'ai noté quelques points à améliorer. N'hésite pas si tu as des questions ! 💪";
    }

    if (style === 'educational') {
        if (errorCount === 0) return "Excellent travail ! Votre français est très correct.";
        if (errorCount <= 2) return "Bon travail. J'ai relevé quelques erreurs courantes - c'est normal, on apprend !";
        return "Vous progressez bien. Concentrez-vous sur les points que j'ai notés et vous vous améliorerez rapidement.";
    }

    if (style === 'professional') {
        if (errorCount === 0) return "Texte bien rédigé, aucune correction nécessaire.";
        if (errorCount <= 2) return "Quelques ajustements mineurs à faire. Dans l'ensemble, c'est correct.";
        return "J'ai identifié plusieurs points à revoir. Prenez le temps de comprendre chaque correction.";
    }

    // Default
    if (errorCount === 0) return "C'est parfait !";
    if (errorCount <= 2) return "Bien joué ! Quelques petites corrections.";
    return "Continue à pratiquer, tu vas y arriver !";
}

export const useCommunity = () => {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error('useCommunity must be used within a CommunityProvider');
    }
    return context;
};
