/* eslint-disable no-unused-vars */
/**
 * Spaced Repetition System (SRS) Logic
 * Enhanced SM-2 algorithm with adaptive learning rate and retention probability.
 */

export const INITIAL_EF = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;
const clampGrade = (grade) => Math.max(0, Math.min(5, grade));

/**
 * Calculate retention probability using the forgetting curve.
 * Based on Ebbinghaus: R = e^(-t/S) where S = stability
 * 
 * @param {object} srsState - The SRS state of a card
 * @param {number} srsState.interval - Current interval in days
 * @param {number} srsState.dueDate - Timestamp when card is due
 * @param {number} srsState.ef - Ease Factor
 * @returns {number} Retention probability (0-1)
 */
export const calculateRetentionProbability = (srsState) => {
    if (!srsState || !srsState.dueDate) return 0;

    const now = Date.now();
    const timeSinceDue = now - srsState.dueDate;

    // If not yet due, retention is high
    if (timeSinceDue < 0) {
        const timeUntilDue = -timeSinceDue / DAY_MS;
        const interval = srsState.interval || 1;
        // Retention decays as we approach due date
        return Math.min(1, 0.9 + (timeUntilDue / interval) * 0.1);
    }

    // Overdue: calculate decay
    const overdueDays = timeSinceDue / DAY_MS;
    const stability = (srsState.interval || 1) * (srsState.ef || INITIAL_EF) * 0.5;
    const retention = Math.exp(-overdueDays / stability);

    return Math.max(0, Math.min(1, retention));
};

/**
 * Get optimal review time - when retention drops to ~90%
 * @param {object} srsState - The SRS state of a card
 * @returns {number} Optimal review timestamp
 */
export const getOptimalReviewTime = (srsState) => {
    if (!srsState || srsState.interval === 0) {
        return Date.now(); // New card, review now
    }

    const stability = (srsState.interval || 1) * (srsState.ef || INITIAL_EF) * 0.5;
    // Solve for t when R = 0.9 in R = e^(-t/S)
    const optimalDays = -stability * Math.log(0.9);
    const lastReview = srsState.dueDate - (srsState.interval * DAY_MS);

    return lastReview + (optimalDays * DAY_MS);
};

/**
 * Calculate adaptive learning rate based on review history
 * @param {object} wordData - Full word data including history
 * @returns {number} Multiplier for interval (0.5-1.5)
 */
export const getAdaptiveLearningRate = (wordData) => {
    const history = wordData?.reviewHistory || [];
    if (history.length < 3) return 1.0;

    // Look at recent performance
    const recent = history.slice(0, 5);
    const recentCorrect = recent.filter(h => h.correct).length;
    const recentRatio = recentCorrect / recent.length;

    // Check for "lapse" patterns (consecutive failures)
    const lapses = wordData?.lapses || 0;
    const lapsePenalty = Math.max(0.7, 1 - (lapses * 0.05));

    // Streak bonus
    const streakBonus = (wordData?.successStreak || 0) > 5 ? 1.1 : 1.0;

    // Combine factors
    const adaptiveRate = (0.5 + recentRatio * 0.5) * lapsePenalty * streakBonus;

    return Math.max(0.5, Math.min(1.5, adaptiveRate));
};

/**
 * Calculates the next review schedule for a card.
 * Enhanced with adaptive interval adjustment.
 *
 * @param {object} previousState - The previous state of the card.
 * @param {number} previousState.interval - Current interval in days.
 * @param {number} previousState.repetition - Number of consecutive correct answers.
 * @param {number} previousState.ef - Ease Factor.
 * @param {number} grade - Performance grade (0-5).
 * @param {object} options - Optional settings
 * @param {number} options.adaptiveRate - Adaptive learning rate multiplier
 * @param {number} options.responseTimeMs - How long the user took to respond
 * @returns {object} The new state { interval, repetition, ef, dueDate }.
 */
export const calculateNextReview = (previousState, grade, options = {}) => {
    grade = clampGrade(grade);
    let { interval, repetition, ef } = previousState || { interval: 0, repetition: 0, ef: INITIAL_EF };
    const { adaptiveRate = 1.0, responseTimeMs } = options;

    // Response time factor: quick correct answers boost interval, slow ones reduce
    let responseTimeFactor = 1.0;
    if (responseTimeMs && grade >= 3) {
        if (responseTimeMs < 2000) responseTimeFactor = 1.1; // Very fast
        else if (responseTimeMs > 8000) responseTimeFactor = 0.9; // Hesitant
    }

    if (grade >= 3) {
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * ef * adaptiveRate * responseTimeFactor);
        }
        repetition += 1;
    } else {
        repetition = 0;
        interval = 1;
    }

    // Update Ease Factor
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (ef < 1.3) ef = 1.3;

    return {
        interval,
        repetition,
        ef,
        dueDate: Date.now() + interval * DAY_MS
    };
};

/**
 * Helper to get initial state for a new word
 */
export const getInitialState = () => ({
    interval: 0,
    repetition: 0,
    ef: INITIAL_EF,
    dueDate: 0 // Ready immediately
});

/**
 * Normalize a user-facing response (boolean/string/number) into a SM-2 grade.
 * Allows callers to pass semantic labels instead of raw integers.
 */
export const normalizeGrade = (grade) => {
    if (typeof grade === 'number') return clampGrade(grade);
    if (typeof grade === 'boolean') return grade ? 4 : 1;
    if (typeof grade === 'string') {
        switch (grade.toLowerCase()) {
            case 'easy':
                return 5;
            case 'good':
                return 4;
            case 'hard':
                return 3;
            case 'again':
            case 'fail':
            case 'forgot':
                return 1;
            default:
                return 0;
        }
    }
    return 0;
};

export const isPassingGrade = (grade) => normalizeGrade(grade) >= 3;

/**
 * Sort words by review priority (combines due status + retention probability)
 * @param {Array} words - Array of word objects with SRS data
 * @returns {Array} Sorted array, highest priority first
 */
export const sortByReviewPriority = (words) => {
    const now = Date.now();

    return [...words].sort((a, b) => {
        const aState = a.srs || getInitialState();
        const bState = b.srs || getInitialState();

        const aRetention = calculateRetentionProbability(aState);
        const bRetention = calculateRetentionProbability(bState);

        const aOverdue = (now - aState.dueDate) / DAY_MS;
        const bOverdue = (now - bState.dueDate) / DAY_MS;

        // Priority score: low retention + overdue = high priority
        const aPriority = (1 - aRetention) + Math.max(0, aOverdue * 0.1);
        const bPriority = (1 - bRetention) + Math.max(0, bOverdue * 0.1);

        return bPriority - aPriority;
    });
};

// =============================================================================
// CONCEPT SRS - Track mastery of grammar concepts, not just words
// =============================================================================

/**
 * Concept types that can be tracked
 */
export const CONCEPT_TYPES = {
    // Gender & Articles
    GENDER_AGREEMENT: 'gender_agreement',
    ARTICLE_USAGE: 'article_usage',

    // Verb Conjugation
    VERB_PRESENT: 'verb_conjugation_present',
    VERB_PAST: 'verb_conjugation_past',
    VERB_FUTURE: 'verb_conjugation_future',
    VERB_CONDITIONAL: 'verb_conjugation_conditional',
    VERB_SUBJUNCTIVE: 'verb_conjugation_subjunctive',

    // Sentence Structure
    NEGATION: 'negation',
    QUESTION_FORMATION: 'question_formation',
    WORD_ORDER: 'word_order',

    // Adjectives & Agreement
    ADJECTIVE_AGREEMENT: 'adjective_agreement',
    ADJECTIVE_PLACEMENT: 'adjective_placement',

    // Expressions
    AVOIR_EXPRESSIONS: 'avoir_expressions',
    ETRE_EXPRESSIONS: 'etre_expressions',
    POLITENESS: 'politeness',

    // Advanced
    PRONOUNS: 'pronouns',
    PREPOSITIONS: 'prepositions',
    PARTITIVE: 'partitive_articles'
};

/**
 * Human-readable labels for concepts
 */
export const CONCEPT_LABELS = {
    [CONCEPT_TYPES.GENDER_AGREEMENT]: 'Gender Agreement (le/la)',
    [CONCEPT_TYPES.ARTICLE_USAGE]: 'Article Usage',
    [CONCEPT_TYPES.VERB_PRESENT]: 'Present Tense Verbs',
    [CONCEPT_TYPES.VERB_PAST]: 'Past Tense (Passé Composé)',
    [CONCEPT_TYPES.VERB_FUTURE]: 'Future Tense',
    [CONCEPT_TYPES.VERB_CONDITIONAL]: 'Conditional Tense',
    [CONCEPT_TYPES.VERB_SUBJUNCTIVE]: 'Subjunctive Mood',
    [CONCEPT_TYPES.NEGATION]: 'Negation (ne...pas)',
    [CONCEPT_TYPES.QUESTION_FORMATION]: 'Question Formation',
    [CONCEPT_TYPES.WORD_ORDER]: 'Word Order',
    [CONCEPT_TYPES.ADJECTIVE_AGREEMENT]: 'Adjective Agreement',
    [CONCEPT_TYPES.ADJECTIVE_PLACEMENT]: 'Adjective Placement (BANGS)',
    [CONCEPT_TYPES.AVOIR_EXPRESSIONS]: 'Avoir Expressions',
    [CONCEPT_TYPES.ETRE_EXPRESSIONS]: 'Être Expressions',
    [CONCEPT_TYPES.POLITENESS]: 'Polite Forms',
    [CONCEPT_TYPES.PRONOUNS]: 'Pronouns',
    [CONCEPT_TYPES.PREPOSITIONS]: 'Prepositions',
    [CONCEPT_TYPES.PARTITIVE]: 'Partitive Articles (du/de la)'
};

/**
 * Get initial state for a new concept
 */
export const getConceptInitialState = () => ({
    interval: 0,
    repetition: 0,
    ef: INITIAL_EF,
    dueDate: 0,
    attempts: 0,
    correct: 0,
    lastPracticed: null,
    masteryLevel: 0 // 0-100
});

/**
 * Calculate next review for a concept (uses same algo as words but with tweaks)
 * @param {object} previousState - The previous concept state
 * @param {number} grade - Performance grade (0-5)
 * @param {object} options - Optional settings
 * @returns {object} The new state
 */
export const calculateConceptNextReview = (previousState, grade, options = {}) => {
    grade = clampGrade(grade);
    let { interval, repetition, ef, attempts, correct, masteryLevel } =
        previousState || getConceptInitialState();

    attempts += 1;

    if (grade >= 3) {
        correct += 1;

        // Concepts need more reinforcement than vocabulary
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 3; // Shorter than vocab (6 days)
        } else if (repetition === 2) {
            interval = 7;
        } else {
            interval = Math.round(interval * ef * 0.9); // Slightly slower growth for concepts
        }
        repetition += 1;
    } else {
        repetition = 0;
        interval = 1; // Review again soon
    }

    // Update Ease Factor
    ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (ef < 1.3) ef = 1.3;

    // Calculate mastery level (0-100)
    const accuracy = attempts > 0 ? correct / attempts : 0;
    const recencyBonus = repetition >= 3 ? 20 : repetition * 5;
    masteryLevel = Math.min(100, Math.round(accuracy * 80 + recencyBonus));

    return {
        interval,
        repetition,
        ef,
        dueDate: Date.now() + interval * DAY_MS,
        attempts,
        correct,
        lastPracticed: Date.now(),
        masteryLevel
    };
};

/**
 * Get weak concepts that need review
 * @param {object} conceptMastery - Object with concept states { conceptId: state }
 * @param {number} masteryThreshold - Minimum mastery level to be "strong" (default 70)
 * @returns {Array} Array of { conceptId, label, state } sorted by priority
 */
export const getWeakConcepts = (conceptMastery = {}, masteryThreshold = 70) => {
    const weakConcepts = [];
    const now = Date.now();

    for (const [conceptId, state] of Object.entries(conceptMastery)) {
        if (!state) continue;

        const isWeak = state.masteryLevel < masteryThreshold;
        const isOverdue = state.dueDate && now > state.dueDate;
        const hasEnoughData = state.attempts >= 3;

        if ((isWeak || isOverdue) && hasEnoughData) {
            const retention = calculateRetentionProbability(state);
            const priority = (1 - retention) + (isOverdue ? 0.3 : 0) + ((100 - state.masteryLevel) / 100);

            weakConcepts.push({
                conceptId,
                label: CONCEPT_LABELS[conceptId] || conceptId,
                state,
                priority,
                isOverdue
            });
        }
    }

    // Sort by priority (highest first)
    return weakConcepts.sort((a, b) => b.priority - a.priority);
};

/**
 * Get concept mastery summary
 * @param {object} conceptMastery - Object with concept states
 * @returns {object} Summary stats
 */
export const getConceptMasterySummary = (conceptMastery = {}) => {
    const concepts = Object.values(conceptMastery).filter(Boolean);

    if (concepts.length === 0) {
        return {
            totalConcepts: 0,
            masteredCount: 0,
            learningCount: 0,
            weakCount: 0,
            averageMastery: 0
        };
    }

    const masteredCount = concepts.filter(c => c.masteryLevel >= 90).length;
    const learningCount = concepts.filter(c => c.masteryLevel >= 50 && c.masteryLevel < 90).length;
    const weakCount = concepts.filter(c => c.masteryLevel < 50).length;
    const averageMastery = Math.round(
        concepts.reduce((sum, c) => sum + c.masteryLevel, 0) / concepts.length
    );

    return {
        totalConcepts: concepts.length,
        masteredCount,
        learningCount,
        weakCount,
        averageMastery
    };
};

/**
 * Map a grammar rule ID to a concept type
 * @param {string} ruleId - The grammar rule ID from grammarTips.js
 * @returns {string} The corresponding CONCEPT_TYPE
 */
export const ruleToConceptType = (ruleId) => {
    const mapping = {
        'gender_article_mismatch': CONCEPT_TYPES.GENDER_AGREEMENT,
        'age_avoir_not_etre': CONCEPT_TYPES.AVOIR_EXPRESSIONS,
        'politeness_vouloir': CONCEPT_TYPES.POLITENESS,
        'negation_structure': CONCEPT_TYPES.NEGATION,
        'adjective_agreement': CONCEPT_TYPES.ADJECTIVE_AGREEMENT,
        'adjective_placement': CONCEPT_TYPES.ADJECTIVE_PLACEMENT,
        'question_inversion': CONCEPT_TYPES.QUESTION_FORMATION
    };

    return mapping[ruleId] || ruleId;
};

