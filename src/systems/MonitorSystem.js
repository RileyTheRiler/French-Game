/**
 * The MonitorSystem acts as a "conscious editor" for the learner.
 * It analyzes user input against target sentences and provides specific,
 * pedagogical feedback based on French grammar error patterns.
 */
import { FEMININE_NOUNS, MASCULINE_NOUNS, BANGS_ADJECTIVES } from '../data/grammarTips';

export class MonitorSystem {
    constructor() {
        this.feminineNouns = new Set(FEMININE_NOUNS);
        this.masculineNouns = new Set(MASCULINE_NOUNS);
        this.bangsAdjectives = new Set(BANGS_ADJECTIVES);
    }

    /**
     * Analyzes the user's input against the target sentence.
     * @param {string} targetSentence The correct sentence.
     * @param {string} userSentence The user's constructed sentence.
     * @param {object} context Additional context (e.g., scenario type).
     * @returns {{ message: string, tipId: string | null }} Feedback with optional tip reference.
     */
    analyze(targetSentence, userSentence, context = {}) {
        const targetWords = targetSentence.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").split(/\s+/);
        const userWords = userSentence.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").split(/\s+/);

        // 1. Check for gender agreement errors
        const genderError = this.checkGenderAgreement(userWords);
        if (genderError) {
            return { message: genderError, tipId: 'gender_agreement' };
        }

        // 2. Check for missing words
        const missingWords = targetWords.filter(w => !userWords.includes(w));
        if (missingWords.length > 0) {
            return {
                message: `You seem to be missing a key word: "${missingWords[0]}".`,
                tipId: null
            };
        }

        // 3. Check for extra words
        const extraWords = userWords.filter(w => !targetWords.includes(w));
        if (extraWords.length > 0) {
            return {
                message: `"${extraWords[0]}" doesn't seem to fit here.`,
                tipId: null
            };
        }

        // 4. Check adjective placement
        const adjPlacementError = this.checkAdjectivePlacement(targetWords, userWords);
        if (adjPlacementError) {
            return { message: adjPlacementError, tipId: 'adjective_placement' };
        }

        // 5. Check negation order
        const negationError = this.checkNegation(userWords);
        if (negationError) {
            return { message: negationError, tipId: 'negation' };
        }

        // 6. Generic order hint if words are correct but order is wrong
        if (targetWords.length === userWords.length && targetSentence.toLowerCase() !== userSentence.toLowerCase()) {
            return {
                message: "The words are correct, but the order is a bit off. Try listening to the rhythm.",
                tipId: null
            };
        }

        return null; // No specific issue found (or it matches)
    }

    /**
     * Check for le/la gender agreement errors
     */
    checkGenderAgreement(words) {
        for (let i = 0; i < words.length - 1; i++) {
            const article = words[i];
            const noun = words[i + 1];

            if (article === 'le' && this.feminineNouns.has(noun)) {
                return `Gender mismatch: "${noun}" is feminine. Use "la ${noun}".`;
            }
            if (article === 'la' && this.masculineNouns.has(noun)) {
                return `Gender mismatch: "${noun}" is masculine. Use "le ${noun}".`;
            }
        }
        return null;
    }

    /**
     * Check adjective placement (BANGS rule)
     */
    checkAdjectivePlacement(targetWords, userWords) {
        // Look for adjectives in wrong position relative to nouns
        for (let i = 0; i < userWords.length - 1; i++) {
            const word = userWords[i];
            const nextWord = userWords[i + 1];

            // Check if a non-BANGS adjective is before a noun (common error)
            // This is a simplified check - real implementation would need POS tagging
            const colorAdjectives = ['noir', 'blanc', 'rouge', 'bleu', 'vert', 'jaune'];
            if (colorAdjectives.includes(word) &&
                (this.feminineNouns.has(nextWord) || this.masculineNouns.has(nextWord))) {
                return `In French, color adjectives like "${word}" come AFTER the noun.`;
            }
        }
        return null;
    }

    /**
     * Check negation sandwich (ne...pas)
     */
    checkNegation(words) {
        const neIndex = words.indexOf('ne');
        const pasIndex = words.indexOf('pas');

        if (neIndex !== -1 && pasIndex !== -1) {
            if (neIndex > pasIndex) {
                return `Remember the negation sandwich: "ne" comes BEFORE the verb, then "pas" after.`;
            }
        } else if (pasIndex !== -1 && neIndex === -1) {
            // "pas" without "ne" - common in spoken French but worth noting
            return `Formal French uses "ne...pas" for negation. "Ne" is often dropped in speech.`;
        }
        return null;
    }
}

export const monitorSystem = new MonitorSystem();
