/**
 * Spaced Repetition System (SRS) Logic
 * Based on a simplified SuperMemo-2 (SM-2) algorithm.
 */

export const INITIAL_EF = 2.5;
const clampGrade = (grade) => Math.max(0, Math.min(5, grade));

/**
 * Calculates the next review schedule for a card.
 *
 * @param {object} previousState - The previous state of the card.
 * @param {number} previousState.interval - Current interval in days (or relevant unit).
 * @param {number} previousState.repetition - Number of consecutive correct answers.
 * @param {number} previousState.ef - Ease Factor.
 * @param {number} grade - Performance grade (0-5).
 *                         5: Perfect response.
 *                         3-4: Correct response.
 *                         0-2: Incorrect response.
 * @returns {object} The new state { interval, repetition, ef, dueDate }.
 */
export const calculateNextReview = (previousState, grade) => {
    grade = clampGrade(grade);
    let { interval, repetition, ef } = previousState || { interval: 0, repetition: 0, ef: INITIAL_EF };

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

    // Update Ease Factor
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (ef < 1.3) ef = 1.3;

    return {
        interval,
        repetition,
        ef,
        dueDate: Date.now() + interval * 24 * 60 * 60 * 1000 // Future date
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
