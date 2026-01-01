/**
 * The MonitorSystem acts as a "conscious editor" for the learner.
 * It analyzes user input against target sentences and provides specific,
 * pedagogical feedback based on error patterns.
 */
export class MonitorSystem {
    constructor() {
        this.grammarRules = [
            {
                id: 'adjective_placement',
                check: (target, input) => {
                    // Very basic heuristic: check if adjectives are misplaced
                    // In a real app, this would need POS tagging.
                    // Here we check if the target has "noun adj" pattern and input has "adj noun"
                    // or vice versa, but relying on exact word lists is robust for small scenarios.
                    return false; // Placeholder logic, improved below
                },
                message: "In French, many adjectives come AFTER the noun (e.g., 'un chat noir'), unlike in English."
            },
            {
                id: 'negation_sandwich',
                check: (target, input) => {
                    return target.includes('ne') && target.includes('pas') &&
                        input.includes('ne') && input.includes('pas') &&
                        input.indexOf('ne') > input.indexOf('pas');
                },
                message: "Remember the negation sandwich: 'ne' + verb + 'pas'. 'Ne' comes first!"
            },
            {
                id: 'question_formation',
                check: (target, input) => {
                    return target.includes('?') && !input.includes('?');
                },
                message: "Don't forget the question mark for questions!"
            }
        ];
    }

    /**
     * Analyzes the user's input against the target sentence.
     * @param {string} targetSentence The correct sentence.
     * @param {string} userSentence The user's constructed sentence.
     * @param {object} context Additional context (e.g., scenario type).
     * @returns {string|null} Specific feedback message or null if no specific error found.
     */
    analyze(targetSentence, userSentence, context = {}) {
        const targetWords = targetSentence.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
        const userWords = userSentence.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);

        // 1. Check for missing words
        const missingWords = targetWords.filter(w => !userWords.includes(w));
        if (missingWords.length > 0) {
            return `You seem to be missing a key word: "${missingWords[0]}".`;
        }

        // 2. Check for extra words
        const extraWords = userWords.filter(w => !targetWords.includes(w));
        if (extraWords.length > 0) {
            return `"${extraWords[0]}" doesn't seem to fit here.`;
        }

        // 3. Order checks
        // If words are correct but order is wrong
        if (targetWords.length === userWords.length && targetSentence !== userSentence) {
            // Check specific rules
            for (const rule of this.grammarRules) {
                if (rule.check(targetSentence, userSentence)) {
                    return rule.message;
                }
            }

            // Generic order hint
            return "The words are correct, but the order is a bit off. Try listening to the rhythm.";
        }

        return null; // No specific issue found (or it matches)
    }
}

export const monitorSystem = new MonitorSystem();
