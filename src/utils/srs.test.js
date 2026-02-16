import { describe, it, expect } from 'vitest';
import {
    calculateNextReview,
    getInitialState,
    getOptimalReviewTime,
    getAdaptiveLearningRate
} from './srs';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('SRS Logic', () => {
    describe('calculateNextReview', () => {
        it('should handle new cards correctly', () => {
            const initial = getInitialState();

            // Grade 1 (Fail)
            const fail = calculateNextReview(initial, 1);
            expect(fail.interval).toBe(1);
            expect(fail.repetition).toBe(0);

            // Grade 4 (Good)
            const good = calculateNextReview(initial, 4);
            expect(good.interval).toBe(1);
            expect(good.repetition).toBe(1);
        });

        it('should increase interval for successful reviews', () => {
            const state = {
                interval: 1,
                repetition: 1,
                ef: 2.5,
                dueDate: Date.now()
            };

            const result = calculateNextReview(state, 4); // Good
            expect(result.interval).toBe(6); // 1 * 6 for first rep
            expect(result.repetition).toBe(2);
        });

        it('should adjust Ease Factor based on grade', () => {
            const state = { interval: 6, repetition: 2, ef: 2.5, dueDate: Date.now() };

            // Easy (5) increases EF
            const easy = calculateNextReview(state, 5);
            expect(easy.ef).toBeGreaterThan(2.5);

            // Hard (3) decreases EF
            const hard = calculateNextReview(state, 3);
            expect(hard.ef).toBeLessThan(2.5);
        });

        it('should reset progress on failure', () => {
            const state = { interval: 10, repetition: 5, ef: 2.8, dueDate: Date.now() };
            const fail = calculateNextReview(state, 1); // Again

            expect(fail.interval).toBe(1);
            expect(fail.repetition).toBe(0);
            expect(fail.ef).toBeLessThan(2.8); // EF drops slightly
        });
    });

    describe('getOptimalReviewTime', () => {
        it('should return current time for new cards', () => {
            const time = getOptimalReviewTime(getInitialState());
            const now = Date.now();
            expect(Math.abs(time - now)).toBeLessThan(1000); // Within 1s
        });

        it('should return future time for known cards', () => {
            const state = { interval: 10, repetition: 1, ef: 2.5, dueDate: Date.now() + 10 * DAY_MS };
            const optimal = getOptimalReviewTime(state);
            // Optimal time is usually slightly before due date (90% retention)
            expect(optimal).toBeLessThan(state.dueDate);
        });
    });

    describe('getAdaptiveLearningRate', () => {
        it('should return 1.0 for new words', () => {
            expect(getAdaptiveLearningRate({})).toBe(1.0);
        });

        it('should boost rate for high success streak', () => {
            const word = {
                successStreak: 6,
                reviewHistory: [
                    { correct: true }, { correct: true }, { correct: true },
                    { correct: true }, { correct: true }
                ]
            };
            const rate = getAdaptiveLearningRate(word);
            expect(rate).toBeGreaterThan(1.0);
        });

        it('should penalize rate for lapses', () => {
            const word = {
                lapses: 5,
                reviewHistory: [
                    { correct: false }, { correct: true }, { correct: false },
                    { correct: false }, { correct: true }
                ]
            };
            const rate = getAdaptiveLearningRate(word);
            expect(rate).toBeLessThan(1.0);
        });
    });
});
