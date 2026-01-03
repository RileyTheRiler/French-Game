/**
 * Cognitive Engine - Phase 12
 * Handles "Flow State" tuning and Cognitive Load Management.
 * 
 * This system sits between the game logic and the user stats to:
 * 1. Detect if the user is bored (too easy) or anxious (too hard).
 * 2. Suggest breaks when fatigue is detected.
 * 3. Dynamically adjust hints and speeds.
 */

export const analyzeFlowState = (cognitiveStats) => {
    const { flowMultiplier, recentMisses, lastResponseTimes, fatigueLevel } = cognitiveStats;

    // Default recomendations
    const recommendations = {
        showHints: true,
        bgMusicVolume: 0.5,
        animationSpeed: 1.0,
        mode: 'standard', // 'flow', 'Zen', 'challenge'
        message: null
    };

    // 1. Check for Fatigue (Cognitive Load High)
    if (fatigueLevel > 75) {
        return {
            ...recommendations,
            showHints: true,
            mode: 'Zen',
            bgMusicVolume: 0.3,
            message: "🧠 Brain fog detected? Let's switch to Low Energy mode."
        };
    }

    // 2. Check for "The Zone" (High Performance)
    // Fast responses (< 2s average) and low errors
    const avgTime = lastResponseTimes.length > 0
        ? lastResponseTimes.reduce((a, b) => a + b, 0) / lastResponseTimes.length
        : 3000;

    if (flowMultiplier >= 1.2 && recentMisses === 0 && avgTime < 2500) {
        return {
            ...recommendations,
            showHints: false, // Remove training wheels
            animationSpeed: 1.5, // Faster transitions
            mode: 'flow',
            message: "🚀 You're in the zone! Hints disabled for max XP."
        };
    }

    // 3. Check for Frustration (Too Hard)
    if (recentMisses >= 3 || avgTime > 8000) {
        return {
            ...recommendations,
            showHints: true,
            mode: 'support',
            message: "Let's slow it down a bit. Quality over speed."
        };
    }

    return recommendations;
};

export const calculateCognitiveLoad = (sessionDurationMinutes, mistakesCount) => {
    // Simple load factor: duration * intensity
    // In a real app, this might track pupil dilation or detailed touch patterns ;)
    const baseLoad = sessionDurationMinutes * 2;
    const stressLoad = mistakesCount * 5;
    return Math.min(100, baseLoad + stressLoad);
};
