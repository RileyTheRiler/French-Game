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
