import { normalizeText } from './textMatching';

/**
 * Tokenize text into words and punctuation
 * @param {string} text 
 * @returns {Array<{text: string, isWord: boolean}>}
 */
export const tokenize = (text) => {
    if (!text) return [];

    // Split by spaces and punctuation, keeping delimiters
    // This regex matches words (including accented characters) or punctuation sequences
    const tokens = text.trim().split(/([a-zA-ZÀ-ÿ0-9'-]+)/).filter(t => t.length > 0);

    return tokens.map(token => {
        // Simple check: if it starts with a word character, it's a word
        const isWord = /^[a-zA-ZÀ-ÿ0-9]/.test(token);
        return { text: token, isWord };
    });
};

/**
 * Analyze text against user vocabulary
 * @param {string} text - Raw text input
 * @param {Array} vocabulary - User's vocabulary list
 * @returns {Array<{text: string, isWord: boolean, status: 'known'|'learning'|'new', wordId?: string, word?: object}>}
 */
export const analyzeText = (text, vocabulary) => {
    const tokens = tokenize(text);

    // Create a lookup map for faster checking
    // key: normalized french word, value: word object
    const vocabMap = new Map();
    vocabulary.forEach(word => {
        const norm = normalizeText(word.french);
        vocabMap.set(norm, word);
    });

    return tokens.map(token => {
        if (!token.isWord) {
            return { ...token, status: 'neutral' };
        }

        const normToken = normalizeText(token.text);

        // Check for direct match
        const match = vocabMap.get(normToken);

        if (match) {
            // Determine status based on SRS level or other flags
            const isMastered = (match.level || 0) >= 5; // Example threshold
            return {
                ...token,
                status: isMastered ? 'known' : 'learning',
                wordId: match.id,
                word: match
            };
        } else {
            // Check for potential strict matching issues (plural s, etc) could be added here
            // For now, if not in vocab, it's new
            return {
                ...token,
                status: 'new'
            };
        }
    });
};
