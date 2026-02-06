/**
 * AdaptiveLearningEngine Service
 * 
 * Analyzes user performance data to generate personalized learning paths,
 * difficulty adjustments, and AI-style insights.
 */

// Difficulty level thresholds
const DIFFICULTY_THRESHOLDS = {
    beginner: { accuracy: 0.5, velocity: 0.3 },
    intermediate: { accuracy: 0.7, velocity: 0.5 },
    advanced: { accuracy: 0.85, velocity: 0.7 }
};

// Category weight factors for priority calculation
const CATEGORY_WEIGHTS = {
    basics: 1.5,      // Higher weight for fundamental categories
    verbs: 1.4,
    food: 1.2,
    family: 1.1,
    travel: 1.1,
    places: 1.0,
    animals: 0.9,
    colors: 0.8,
    numbers: 0.8,
    emotions: 1.0,
    objects: 0.9,
    time: 1.0,
    body: 0.9,
    weather: 0.8
};

// Learning style indicators
const LEARNING_STYLES = {
    visual: ['prefers mouth shape diagrams', 'responds to color coding'],
    auditory: ['uses listen button frequently', 'better with audio cues'],
    kinesthetic: ['benefits from rhythm training', 'needs hands-on practice']
};

/**
 * Compute a comprehensive skill profile from user data
 * 
 * @param {Object} progressData - User progress from ProgressContext
 * @param {Array} vocabularyData - Vocabulary items with SRS data
 * @returns {Object} Skill profile
 */
export const computeSkillProfile = (progressData, vocabularyData) => {
    const { categoryStats = {}, dailyStats = {} } = progressData;

    // Calculate category strengths (0-100)
    const categoryStrengths = {};
    for (const [category, stats] of Object.entries(categoryStats)) {
        if (stats.attempts > 0) {
            const accuracy = (stats.correct / stats.attempts) * 100;
            const avgResponseTime = stats.totalResponseTime / stats.attempts;

            // Factor in response time (faster is better, up to a point)
            const speedBonus = Math.max(0, 20 - (avgResponseTime / 500));
            categoryStrengths[category] = Math.min(100, Math.round(accuracy * 0.8 + speedBonus));
        } else {
            categoryStrengths[category] = 0; // Untested
        }
    }

    // Identify weak areas (categories below 60%)
    const weakAreas = Object.entries(categoryStrengths)
        .filter(([, strength]) => strength < 60 && strength > 0)
        .sort(([, a], [, b]) => a - b)
        .map(([category]) => category);

    // Identify strong areas (categories above 80%)
    const strongAreas = Object.entries(categoryStrengths)
        .filter(([, strength]) => strength >= 80)
        .sort(([, a], [, b]) => b - a)
        .map(([category]) => category);

    // Calculate learning velocity (progress rate over time)
    const recentDays = Object.entries(dailyStats)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .slice(0, 7);

    let learningVelocity = 0.5; // Default moderate
    if (recentDays.length >= 3) {
        const avgDailyXp = recentDays.reduce((sum, [, data]) => sum + (data.xp || 0), 0) / recentDays.length;
        const avgAccuracy = recentDays.reduce((sum, [, data]) => sum + (data.accuracy || 0), 0) / recentDays.length;

        learningVelocity = Math.min(1, (avgDailyXp / 200) * 0.5 + avgAccuracy * 0.5);
    }

    // Determine preferred difficulty
    let preferredDifficulty = 'A1';
    const overallAccuracy = Object.values(categoryStrengths).reduce((a, b) => a + b, 0) /
        Math.max(Object.values(categoryStrengths).length, 1) / 100;

    if (overallAccuracy > DIFFICULTY_THRESHOLDS.advanced.accuracy && learningVelocity > 0.6) {
        preferredDifficulty = 'B1';
    } else if (overallAccuracy > DIFFICULTY_THRESHOLDS.intermediate.accuracy) {
        preferredDifficulty = 'A2';
    }

    // Calculate total mastery percentage
    const vocabularyMastery = calculateVocabularyMastery(vocabularyData);

    return {
        categoryStrengths,
        weakAreas,
        strongAreas,
        learningVelocity,
        preferredDifficulty,
        vocabularyMastery,
        totalWordsStudied: vocabularyData.filter(w => w.lastPracticed > 0).length,
        totalWords: vocabularyData.length,
        consistencyScore: calculateConsistencyScore(dailyStats)
    };
};

/**
 * Calculate vocabulary mastery percentage
 */
const calculateVocabularyMastery = (vocabularyData) => {
    if (!vocabularyData || vocabularyData.length === 0) return 0;

    const masteredCount = vocabularyData.filter(word => {
        const srs = word.srs || {};
        return srs.repetition >= 3 && srs.ef >= 2.0;
    }).length;

    return Math.round((masteredCount / vocabularyData.length) * 100);
};

/**
 * Calculate consistency score based on daily activity
 */
const calculateConsistencyScore = (dailyStats) => {
    const dates = Object.keys(dailyStats).sort();
    if (dates.length < 2) return 50;

    // Check for gaps in the last 14 days
    const today = new Date();
    let activeDays = 0;

    for (let i = 0; i < 14; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();

        if (dailyStats[dateStr] && dailyStats[dateStr].xp > 0) {
            activeDays++;
        }
    }

    return Math.round((activeDays / 14) * 100);
};

/**
 * Get a personalized content queue optimally ordered for learning
 * 
 * @param {Object} skillProfile - Result from computeSkillProfile
 * @param {Array} availableContent - Available vocabulary/exercises
 * @param {number} limit - Maximum items to return
 * @returns {Array} Ordered content queue
 */
export const getPersonalizedQueue = (skillProfile, availableContent, limit = 20) => {
    const { weakAreas, strongAreas, preferredDifficulty, learningVelocity } = skillProfile;
    const now = Date.now();

    // Score each content item
    const scoredContent = availableContent.map(item => {
        let score = 0;

        // Priority for due items (SRS)
        if (item.srs && item.srs.dueDate <= now) {
            score += 100;
        }

        // Priority for weak categories
        const categoryIndex = weakAreas.indexOf(item.category);
        if (categoryIndex !== -1) {
            score += 50 - (categoryIndex * 10); // Higher priority for weaker categories
        }

        // De-prioritize mastered content (but don't exclude - need review)
        if (strongAreas.includes(item.category)) {
            score -= 20;
        }

        // CEFR level matching
        const cefrScore = getCEFRMatchScore(item.cefr, preferredDifficulty);
        score += cefrScore;

        // Category weight
        const categoryWeight = CATEGORY_WEIGHTS[item.category] || 1.0;
        score *= categoryWeight;

        // Freshness - avoid recently practiced items
        if (item.lastPracticed) {
            const hoursSince = (now - item.lastPracticed) / (1000 * 60 * 60);
            if (hoursSince < 1) score -= 30;
            else if (hoursSince < 4) score -= 15;
        }

        // Struggle items get priority
        if (item.lapses && item.lapses > 2) {
            score += 25;
        }

        return { item, score };
    });

    // Sort by score and take top items
    scoredContent.sort((a, b) => b.score - a.score);

    // Mix in some new content if learner is progressing well
    const queue = [];
    const dueItems = scoredContent.filter(s => s.item.srs?.dueDate <= now);
    const newItems = scoredContent.filter(s => !s.item.lastPracticed);
    const reviewItems = scoredContent.filter(s => s.item.lastPracticed && s.item.srs?.dueDate > now);

    // Queue composition based on learning velocity
    const newRatio = 0.2 + (learningVelocity * 0.2); // 20-40% new content
    const dueCount = Math.min(dueItems.length, Math.floor(limit * 0.5));
    const newCount = Math.min(newItems.length, Math.floor(limit * newRatio));
    const reviewCount = limit - dueCount - newCount;

    queue.push(...dueItems.slice(0, dueCount).map(s => s.item));
    queue.push(...newItems.slice(0, newCount).map(s => s.item));
    queue.push(...reviewItems.slice(0, reviewCount).map(s => s.item));

    // Shuffle slightly to avoid predictability while keeping priority clusters
    return shuffleWithinClusters(queue, 5);
};

/**
 * Get CEFR level match score
 */
const getCEFRMatchScore = (itemCEFR, targetCEFR) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const itemIndex = levels.indexOf(itemCEFR);
    const targetIndex = levels.indexOf(targetCEFR);

    const diff = Math.abs(itemIndex - targetIndex);

    if (diff === 0) return 30;
    if (diff === 1) return 20;
    if (diff === 2) return 5;
    return -10; // Too far from current level
};

/**
 * Shuffle items within clusters to maintain general priority while adding variety
 */
const shuffleWithinClusters = (items, clusterSize) => {
    const result = [];
    for (let i = 0; i < items.length; i += clusterSize) {
        const cluster = items.slice(i, i + clusterSize);
        // Fisher-Yates shuffle within cluster
        for (let j = cluster.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [cluster[j], cluster[k]] = [cluster[k], cluster[j]];
        }
        result.push(...cluster);
    }
    return result;
};

/**
 * Get difficulty adjustment multiplier based on recent performance
 * 
 * @param {Object} recentPerformance - Recent session/daily stats
 * @returns {Object} Difficulty adjustment parameters
 */
export const getDifficultyAdjustment = (recentPerformance) => {
    const { accuracy = 0.7, streakLength = 0 } = recentPerformance;

    let multiplier = 1.0;
    let timerAdjustment = 0;
    let hintsEnabled = true;
    let encouragementLevel = 'normal';

    if (accuracy >= 0.9 && streakLength >= 5) {
        // User is excelling - increase challenge
        multiplier = 1.3;
        timerAdjustment = -500; // Faster timers
        hintsEnabled = false;
        encouragementLevel = 'minimal';
    } else if (accuracy >= 0.75) {
        // Good performance - slight increase
        multiplier = 1.1;
        timerAdjustment = 0;
        hintsEnabled = true;
        encouragementLevel = 'normal';
    } else if (accuracy >= 0.5) {
        // Struggling a bit - maintain or ease
        multiplier = 0.9;
        timerAdjustment = 500;
        hintsEnabled = true;
        encouragementLevel = 'supportive';
    } else {
        // Significant struggle - ease difficulty
        multiplier = 0.7;
        timerAdjustment = 1000;
        hintsEnabled = true;
        encouragementLevel = 'high';
    }

    return {
        multiplier,
        timerAdjustment,
        hintsEnabled,
        encouragementLevel,
        suggestedMode: accuracy < 0.5 ? 'review' : 'normal'
    };
};

/**
 * Generate AI-style insights based on user data
 * 
 * @param {Object} weeklyData - Weekly stats summary
 * @param {Object} skillProfile - Computed skill profile
 * @returns {Array} Array of insight objects
 */
export const generateInsights = (weeklyData, skillProfile) => {
    const insights = [];
    const { categoryStrengths, weakAreas, strongAreas, learningVelocity, consistencyScore } = skillProfile;

    // Streak insight
    if (consistencyScore >= 80) {
        insights.push({
            type: 'positive',
            icon: '🔥',
            title: 'Amazing Consistency!',
            message: `You've practiced ${Math.round(consistencyScore / 7)} of the last 14 days. This regular practice is accelerating your learning!`
        });
    } else if (consistencyScore < 40) {
        insights.push({
            type: 'suggestion',
            icon: '📅',
            title: 'Build a Routine',
            message: 'Try setting a daily reminder. Even 5 minutes a day creates lasting habits!'
        });
    }

    // Category mastery insights
    if (strongAreas.length > 0) {
        insights.push({
            type: 'positive',
            icon: '⭐',
            title: `Mastering ${formatCategoryName(strongAreas[0])}!`,
            message: `Your ${formatCategoryName(strongAreas[0])} vocabulary is strong at ${categoryStrengths[strongAreas[0]]}%. Ready for more advanced content?`
        });
    }

    // Weak area suggestion
    if (weakAreas.length > 0) {
        const weakestCategory = weakAreas[0];
        const strength = categoryStrengths[weakestCategory] || 0;
        insights.push({
            type: 'focus',
            icon: '🎯',
            title: `Focus: ${formatCategoryName(weakestCategory)}`,
            message: `This category needs attention (${strength}% accuracy). We'll include more ${formatCategoryName(weakestCategory)} words in your practice.`
        });
    }

    // Learning velocity insight
    if (learningVelocity > 0.7) {
        insights.push({
            type: 'positive',
            icon: '🚀',
            title: 'Rapid Progress!',
            message: 'You\'re learning faster than average! Consider trying harder content or adding new categories.'
        });
    }

    // Weekly progress summary
    if (weeklyData && weeklyData.length > 0) {
        const totalXp = weeklyData.reduce((sum, day) => sum + (day.xp || 0), 0);
        const totalWords = weeklyData.reduce((sum, day) => sum + (day.words || 0), 0);

        if (totalXp > 0) {
            insights.push({
                type: 'summary',
                icon: '📊',
                title: 'This Week',
                message: `You earned ${totalXp} XP and practiced ${totalWords} words. ${totalXp > 500 ? 'Excellent work!' : 'Keep it up!'}`
            });
        }
    }

    // Pronunciation insight
    if (skillProfile.pronunciationAccuracy !== undefined) {
        if (skillProfile.pronunciationAccuracy < 70) {
            insights.push({
                type: 'tip',
                icon: '🎤',
                title: 'Pronunciation Practice',
                message: 'Try the Pronunciation Coach more often. Hearing yourself helps identify improvement areas!'
            });
        }
    }

    return insights.slice(0, 5); // Limit to 5 insights
};

/**
 * Format category name for display
 */
const formatCategoryName = (category) => {
    const names = {
        basics: 'Basics',
        food: 'Food & Drink',
        animals: 'Animals',
        colors: 'Colors',
        numbers: 'Numbers',
        travel: 'Travel',
        places: 'Places',
        emotions: 'Emotions',
        verbs: 'Verbs',
        objects: 'Objects',
        time: 'Time',
        family: 'Family',
        body: 'Body Parts',
        weather: 'Weather'
    };
    return names[category] || category;
};

/**
 * Detect learning style from user behavior patterns
 * 
 * @param {Object} behaviorData - User interaction data
 * @returns {Object} Learning style assessment
 */
export const detectLearningStyle = (behaviorData) => {
    const {
        listenButtonClicks = 0,
        pronunciationAttempts = 0,
        flashcardFlips = 0,
        rhythmTrainingTime = 0,
        visualizerEngagement = 0
    } = behaviorData;

    const total = listenButtonClicks + pronunciationAttempts + flashcardFlips + rhythmTrainingTime + visualizerEngagement;
    if (total === 0) return { primary: 'balanced', scores: {} };

    const scores = {
        auditory: (listenButtonClicks * 2 + pronunciationAttempts) / total,
        visual: (flashcardFlips + visualizerEngagement * 2) / total,
        kinesthetic: (rhythmTrainingTime + pronunciationAttempts) / total
    };

    const primary = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];

    return { primary, scores };
};

export default {
    computeSkillProfile,
    getPersonalizedQueue,
    getDifficultyAdjustment,
    generateInsights,
    detectLearningStyle
};
