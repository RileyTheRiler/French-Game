/**
 * Fuzzy text matching utilities for conversation
 */

// Common French synonyms/variations
const SYNONYMS = {
    'bonjour': ['salut', 'coucou'],
    'oui': ['ouais', 'absolument', 'tout à fait', 'bien sûr'],
    'non': ['pas du tout', 'nan'],
    'merci': ['remercie', 'cimer'],
    'au revoir': ['à bientôt', 'ciao', 'adieu', 'salut'],
    'ça va': ['comment allez-vous', 'comment vas-tu'],
    'je voudrais': ['je veux', 'j\'aimerais', 'je prendrais'],
    's\'il vous plaît': ['svp', 's\'il te plaît', 'stp'],
    'pardon': ['excusez-moi', 'désolé', 'navré'],
    'super': ['génial', 'cool', 'parfait', 'excellent'],
};

/**
 * Normalize text for comparison
 * Removes punctuation, extra spaces, accents (optionally), and converts to lowercase
 */
export const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^\w\s]/gi, '') // remove punctuation
        .trim()
        .replace(/\s+/g, ' ');
};

/**
 * Check if user input matches an expected response
 * @param {string} input - User's typed input
 * @param {string} target - Expected target text
 * @param {number} threshold - Match threshold (0-1)
 */
export const isFuzzyMatch = (input, target, threshold = 0.8) => {
    const normInput = normalizeText(input);
    const normTarget = normalizeText(target);

    // Direct match
    if (normInput === normTarget) return true;

    // Targeted contains match (if target is short, input must contain it)
    if (normTarget.length > 3 && normInput.includes(normTarget)) return true;

    // Levenshtein distance check could go here, but for now simple inclusion/word check

    // Check synonyms
    const targetWords = normTarget.split(' ');
    const inputWords = normInput.split(' ');

    let matchCount = 0;
    for (const tWord of targetWords) {
        if (inputWords.includes(tWord)) {
            matchCount++;
            continue;
        }

        // Check if any synonym of tWord is in inputWords
        // This is a simplified check, ideally we'd look up phrases
    }

    return (matchCount / targetWords.length) >= 0.5; // at least 50% of key words matched
};

/**
 * Match input against a list of options
 * @param {string} input - User input
 * @param {Array} options - List of option objects { text: string, ... }
 */
export const findBestMatch = (input, options) => {
    let bestMatch = null;
    let highestScore = 0;

    const normInput = normalizeText(input);

    for (const option of options) {
        const normOpt = normalizeText(option.text);

        // Exact match
        if (normInput === normOpt) return { option, score: 1.0 };

        // Calculate simple overlap score
        const optWords = normOpt.split(' ');
        const inputWords = normInput.split(' ');

        let matches = 0;
        for (const w of optWords) {
            if (inputWords.includes(w)) matches++;
        }

        const score = matches / Math.max(optWords.length, 1);

        if (score > highestScore) {
            highestScore = score;
            bestMatch = option;
        }
    }

    // Require at least 40% match or 1 key word for very short answers
    if (highestScore >= 0.4) {
        return { option: bestMatch, score: highestScore };
    }

    return null;
};

/**
 * Compare input text with target text for detailed feedback (diff)
 * @param {string} input - User input
 * @param {string} target - Correct text
 * @returns {object} { isMatch: boolean, diff: Array }
 */
export const compareText = (input, target) => {
    const normalizedInput = normalizeText(input);
    const normalizedTarget = normalizeText(target);
    const isMatch = normalizedInput === normalizedTarget;

    const inputWords = input.trim().split(/\s+/);
    const targetWords = target.trim().split(/\s+/);
    const diff = [];

    // Simple word-by-word diff (positional)
    const maxLength = Math.max(inputWords.length, targetWords.length);
    for (let i = 0; i < maxLength; i++) {
        const inp = inputWords[i] || "";
        const tgt = targetWords[i] || "";

        if (normalizeText(inp) === normalizeText(tgt)) {
            diff.push({ value: tgt + " ", added: false, removed: false });
        } else {
            // Very naive diff: if mismatch, show correct word as removed (missing) and input word as added (wrong)
            if (tgt) diff.push({ value: tgt + " ", removed: true });
            if (inp) diff.push({ value: inp + " ", added: true });
        }
    }

    return { isMatch, diff };
};
