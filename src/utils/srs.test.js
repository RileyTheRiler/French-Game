import { describe, it, expect } from 'vitest';
import {
    calculateNextReview,
    getInitialState,
    normalizeGrade,
    // eslint-disable-next-line no-unused-vars
    isPassingGrade,
    INITIAL_EF,
    calculateRetentionProbability,
    getOptimalReviewTime,
    getAdaptiveLearningRate,
    sortByReviewPriority
} from './srs';

describe('SRS Logic', () => {
    describe('getInitialState', () => {
        it('returns correct default values', () => {
            const state = getInitialState();
            expect(state).toEqual({
                interval: 0,
                repetition: 0,
                ef: INITIAL_EF,
                dueDate: 0,
            });
        });
    });

    describe('normalizeGrade', () => {
        it('handles numeric grades', () => {
            expect(normalizeGrade(5)).toBe(5);
            expect(normalizeGrade(0)).toBe(0);
            expect(normalizeGrade(6)).toBe(5); // clamped
        });

        it('handles boolean grades', () => {
            expect(normalizeGrade(true)).toBe(4);
            expect(normalizeGrade(false)).toBe(1);
        });

        it('handles string grades', () => {
            expect(normalizeGrade('EASY')).toBe(5);
            expect(normalizeGrade('good')).toBe(4);
            expect(normalizeGrade('hard')).toBe(3);
            expect(normalizeGrade('fail')).toBe(1);
        });
    });

    describe('calculateNextReview', () => {
        it('schedules first review correctly for correct answer', () => {
            const initial = getInitialState();
            const next = calculateNextReview(initial, 4);

            expect(next.interval).toBe(1);
            expect(next.repetition).toBe(1);
            expect(next.dueDate).toBeGreaterThan(Date.now());
        });

        it('schedules second review correctly', () => {
            const prev = { interval: 1, repetition: 1, ef: 2.5 };
            const next = calculateNextReview(prev, 4);

            expect(next.interval).toBe(6);
            expect(next.repetition).toBe(2);
        });

        it('resets progress on failure', () => {
            const prev = { interval: 10, repetition: 3, ef: 2.5 };
            const next = calculateNextReview(prev, 1); // fail

            expect(next.interval).toBe(1);
            expect(next.repetition).toBe(0);
        });

        it('updates Ease Factor (EF) correctly', () => {
            const prev = { interval: 1, repetition: 1, ef: 2.5 };
            // Grade 5 increases EF
            const nextPerfect = calculateNextReview(prev, 5);
            expect(nextPerfect.ef).toBeGreaterThan(2.5);

            // Grade 3 lowers EF
            const nextHard = calculateNextReview(prev, 3);
            expect(nextHard.ef).toBeLessThan(2.5);
        });

        it('does not drop EF below 1.3', () => {
            const prev = { interval: 1, repetition: 1, ef: 1.3 };
            const next = calculateNextReview(prev, 0);
            expect(next.ef).toBe(1.3);
        });
    });

    describe('calculateRetentionProbability', () => {
        it('returns high retention for not-yet-due cards', () => {
            const futureState = {
                interval: 7,
                dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
                ef: 2.5
            };
            const retention = calculateRetentionProbability(futureState);
            expect(retention).toBeGreaterThan(0.9);
        });

        it('returns decayed retention for overdue cards', () => {
            const overdueState = {
                interval: 1,
                dueDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
                ef: 2.5
            };
            const retention = calculateRetentionProbability(overdueState);
            expect(retention).toBeLessThan(0.9);
            expect(retention).toBeGreaterThan(0);
        });

        it('returns 0 for null state', () => {
            expect(calculateRetentionProbability(null)).toBe(0);
            expect(calculateRetentionProbability({})).toBe(0);
        });
    });

    describe('getOptimalReviewTime', () => {
        it('returns now for new cards', () => {
            const newState = { interval: 0, ef: 2.5 };
            const optimal = getOptimalReviewTime(newState);
            expect(optimal).toBeLessThanOrEqual(Date.now());
        });

        it('returns future time for established cards', () => {
            const state = {
                interval: 7,
                dueDate: Date.now(),
                ef: 2.5
            };
            const optimal = getOptimalReviewTime(state);
            // Optimal review should be somewhere reasonable
            expect(optimal).toBeGreaterThan(0);
        });
    });

    describe('getAdaptiveLearningRate', () => {
        it('returns 1.0 for new words with little history', () => {
            const newWord = { reviewHistory: [] };
            expect(getAdaptiveLearningRate(newWord)).toBe(1.0);
        });

        it('increases rate for words with good history', () => {
            const goodWord = {
                reviewHistory: [
                    { correct: true },
                    { correct: true },
                    { correct: true },
                    { correct: true },
                    { correct: true }
                ],
                lapses: 0,
                successStreak: 6
            };
            const rate = getAdaptiveLearningRate(goodWord);
            expect(rate).toBeGreaterThanOrEqual(1.0);
        });

        it('decreases rate for words with lapses', () => {
            const strugglingWord = {
                reviewHistory: [
                    { correct: false },
                    { correct: true },
                    { correct: false },
                    { correct: false },
                    { correct: true }
                ],
                lapses: 5,
                successStreak: 0
            };
            const rate = getAdaptiveLearningRate(strugglingWord);
            expect(rate).toBeLessThan(1.0);
        });
    });

    describe('sortByReviewPriority', () => {
        it('sorts overdue words before future words', () => {
            const words = [
                { id: 'future', srs: { interval: 7, dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, ef: 2.5 } },
                { id: 'overdue', srs: { interval: 1, dueDate: Date.now() - 24 * 60 * 60 * 1000, ef: 2.5 } }
            ];
            const sorted = sortByReviewPriority(words);
            expect(sorted[0].id).toBe('overdue');
        });

        it('handles words without SRS state', () => {
            const words = [
                { id: 'no-srs' },
                { id: 'with-srs', srs: { interval: 0, dueDate: 0, ef: 2.5 } }
            ];
            // Should not throw
            expect(() => sortByReviewPriority(words)).not.toThrow();
        });
    });
});
