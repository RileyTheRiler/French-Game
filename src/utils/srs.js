export const INITIAL_EF = 2.5;

// SuperMemo 2 Algorithm Implementation
// Ref: https://super-memory.com/english/ol/sm2.htm

export const calculateNextReview = (previousState, grade) => {
    // grade: 0-5 (0=blackout, 5=perfect)
    // q: quality of response

    let { interval, repetition, ef } = previousState;

    if (grade >= 3) {
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * ef);
        }
        repetition += 1;
    } else {
        repetition = 0;
        interval = 1;
    }

    // Update EF (Ease Factor)
    // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (ef < 1.3) ef = 1.3;

    return {
        interval,
        repetition,
        ef,
        dueDate: Date.now() + (interval * 24 * 60 * 60 * 1000)
    };
};

export const getInitialState = () => ({
    interval: 0,
    repetition: 0,
    ef: INITIAL_EF,
    dueDate: 0
});

export const isPassingGrade = (grade) => grade >= 3;

export const normalizeGrade = (gradeInput) => {
    if (typeof gradeInput === 'boolean') return gradeInput ? 4 : 1;
    if (typeof gradeInput === 'string') {
        const map = { 'easy': 5, 'good': 4, 'hard': 3, 'fail': 1, 'again': 1 };
        return map[gradeInput.toLowerCase()] || 3;
    }
    return Math.max(0, Math.min(5, gradeInput));
};

/**
 * Calculates probability of recall at current time t
 * R = e^(-t/S) where S is stability (interval)
 */
export const calculateRetentionProbability = (srsState) => {
    if (!srsState || !srsState.interval) return 0;

    // Time since last review (approximate based on due date)
    // We assume last review was (dueDate - interval)
    const now = Date.now();
    const intervalMs = srsState.interval * 24 * 60 * 60 * 1000;
    const lastReviewDate = srsState.dueDate - intervalMs;
    const timeSinceReview = now - lastReviewDate;

    // Avoid division by zero or negative time
    if (timeSinceReview <= 0) return 1;

    // For SM-2, stability correlates roughly with interval (days)
    // A common approximation for forgetting curve: R = exp(-t / (S * 9))?
    // Simplified: R = exp(-t/S) where t and S are in same units
    // But SM-2 targets ~90% retention at due date.
    // So at t=S, R should be 0.9.
    // 0.9 = e^(-1/k) => ln(0.9) = -1/k => k = -1/ln(0.9) ≈ 9.49
    // So R = exp(-t / (S * 9.49))

    const elapsedDays = timeSinceReview / (24 * 60 * 60 * 1000);
    const retrievability = Math.exp(-elapsedDays / (srsState.interval * 9.49));

    return Math.max(0, Math.min(1, retrievability));
};

/**
 * Advanced Scheduling:
 * Prioritize items based on "Overdue-ness" relative to interval.
 * Priority = (Time since due) / Interval
 */
export const getReviewPriority = (srsState) => {
    if (!srsState || !srsState.dueDate) return 0;
    const now = Date.now();
    if (srsState.dueDate > now) return 0; // Not due

    const overdueMs = now - srsState.dueDate;
    const intervalMs = Math.max(1, srsState.interval) * 24 * 60 * 60 * 1000;

    return overdueMs / intervalMs;
};

export const sortByReviewPriority = (words) => {
    return [...words].sort((a, b) => {
        const pA = getReviewPriority(a.srs);
        const pB = getReviewPriority(b.srs);
        return pB - pA; // Higher priority first
    });
};

/**
 * Experimental: Calculate optimal review time during a session
 * Based on short-term memory decay (not full SM-2)
 */
// eslint-disable-next-line no-unused-vars
export const getOptimalReviewTime = (srsState, options = {}) => {
    // Placeholder for intra-session spacing logic
    // For now, return immediate
    return Date.now();
};

/**
 * Adaptive Learning Rate
 * Adjusts difficulty based on user's recent performance history
 */
export const getAdaptiveLearningRate = (word) => {
    if (!word.reviewHistory || word.reviewHistory.length === 0) return 1.0;

    const recent = word.reviewHistory.slice(0, 5);
    const successRate = recent.filter(r => r.correct).length / recent.length;

    // If struggling (success < 60%), lower difficulty multiplier
    if (successRate < 0.6) return 0.8;
    // If cruising (success > 90%), increase multiplier
    if (successRate > 0.9) return 1.2;

    return 1.0;
};
