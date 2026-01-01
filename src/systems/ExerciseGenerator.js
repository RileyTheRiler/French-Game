import { SENTENCE_TEMPLATES, SEMANTIC_PAIRS } from '../data/sentenceTemplates';
import { vocabularyList, getVocabularyByCategory } from '../data/vocabulary';

/**
 * Utility to get a random item from an array
 */
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];


/**
 * Filter vocabulary based on constraints (category, gender, part of speech, semantic key, specific IDs)
 */
const filterVocab = (constraints, gender, pos) => {
    let result = vocabularyList;

    // Filter by specific IDs if provided
    if (constraints?.specificIds) {
        result = result.filter(w => constraints.specificIds.includes(w.id));
    }

    if (constraints?.category) {
        result = result.filter(w => constraints.category.includes(w.category));
    }

    if (gender) {
        result = result.filter(w => w.gender === gender || w.gender === null);
    }

    if (pos) {
        result = result.filter(w => w.pos === pos);
    }

    return result;
};

/**
 * Get semantically valid adjectives/modifiers for a given noun
 */
const getSemanticPairs = (nounFrench, semanticKey) => {
    if (!semanticKey || !SEMANTIC_PAIRS[semanticKey]) return null;

    const pairs = SEMANTIC_PAIRS[semanticKey];
    // Clean the noun (remove articles like "le ", "la ", "l'")
    const cleanNoun = nounFrench.replace(/^(le |la |l'|les )/i, '').toLowerCase();

    return pairs[cleanNoun] || null;
};

/**
 * Validate that a generated sentence is realistic
 * Returns true if the sentence passes validation
 */
const validateRealism = (instance, template) => {
    if (!instance) return false;

    // Static templates are always valid
    if (template.isStatic) return true;

    // Check for known problematic patterns
    const problematicPatterns = [
        // Animals with colors (unless it's natural)
        { check: (f) => /chat.*violet|chien.*rose|oiseau.*orange/i.test(f), reason: 'unnatural animal color' },
        // Emotions on inanimate objects
        { check: (f) => /table.*triste|chaise.*heureux|voiture.*nerveux/i.test(f), reason: 'emotional object' }
    ];

    for (const pattern of problematicPatterns) {
        if (pattern.check(instance.french)) {
            console.warn(`Validation failed: ${pattern.reason} in "${instance.french}"`);
            return false;
        }
    }

    return true;
};

/**
 * Fill a template with actual words, respecting semantic constraints
 */
const instantiateTemplate = (template, maxRetries = 3) => {
    // Handle static templates (no placeholders)
    if (template.isStatic) {
        return {
            french: template.french,
            english: template.english,
            words: {}
        };
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const usedWords = new Set();
        let frenchSentence = template.french;
        let englishSentence = template.english;
        const instantiationMap = {};
        let failed = false;

        // 1. Identify slots in French sentence
        const matches = frenchSentence.match(/\{\{([^}]+)\}\}/g) || [];

        for (const match of matches) {
            const content = match.slice(2, -2);
            const parts = content.split(':');
            const type = parts[0]; // noun, adj, food, drink, etc.
            const param = parts[1]; // m, f, p, etc.

            const constraint = template.constraints?.[type] || {};

            // Get initial candidates
            let candidates = filterVocab(constraint);

            // Apply gender filter from template param
            if (param === 'm' || param === 'f') {
                candidates = candidates.filter(w => w.gender === param);
            }

            // Apply semantic pairing if this slot depends on a previously selected noun
            if (constraint.semanticKey && instantiationMap.food) {
                const validPairs = getSemanticPairs(instantiationMap.food.french, constraint.semanticKey);
                if (validPairs) {
                    candidates = candidates.filter(w => validPairs.includes(w.french.toLowerCase()));
                }
            }

            if (constraint.semanticKey && instantiationMap.object) {
                const validPairs = getSemanticPairs(instantiationMap.object.french, constraint.semanticKey);
                if (validPairs) {
                    candidates = candidates.filter(w => validPairs.includes(w.french.toLowerCase()));
                }
            }

            // Avoid using same word twice
            candidates = candidates.filter(w => !usedWords.has(w.id));

            if (candidates.length === 0) {
                failed = true;
                break;
            }

            const selectedWord = getRandom(candidates);
            usedWords.add(selectedWord.id);
            instantiationMap[type] = selectedWord;

            // Replace in French
            frenchSentence = frenchSentence.replace(match, selectedWord.french);
        }

        if (failed) continue;

        // 2. Replace in English sentence
        const engMatches = englishSentence.match(/\{\{([^}]+)\}\}/g) || [];
        for (const match of engMatches) {
            const content = match.slice(2, -2);
            const parts = content.split(':');
            const type = parts[0];
            const param = parts[1];

            const word = instantiationMap[type];
            if (word) {
                let replacement = word.english;
                if (param === 'english_plural') {
                    replacement = word.english + 's';
                }
                englishSentence = englishSentence.replace(match, replacement);
            } else {
                englishSentence = englishSentence.replace(match, "???");
            }
        }

        // POST-PROCESSING: Grammar Cleanup

        // French Contractions
        // à + le -> au
        frenchSentence = frenchSentence.replace(/(^|['’\s])à le(\s)/gi, '$1au$2');
        // à + les -> aux
        frenchSentence = frenchSentence.replace(/(^|['’\s])à les(\s)/gi, '$1aux$2');
        // de + le -> du
        frenchSentence = frenchSentence.replace(/(^|['’\s])de le(\s)/gi, '$1du$2');
        // de + les -> des
        frenchSentence = frenchSentence.replace(/(^|['’\s])de les(\s)/gi, '$1des$2');

        // Fix vowel clashes: "au l'hôpital" -> "à l'hôpital"
        // This happens if we had "à le l'hôpital" -> "au l'hôpital" (incorrect)
        // If the word starts with l', we want "à l'..." not "au l'..."
        frenchSentence = frenchSentence.replace(/(^|['’\s])au (l')/gi, "$1à $2");
        frenchSentence = frenchSentence.replace(/(^|['’\s])du (l')/gi, "$1de $2");

        // English Cleanup
        // "The the" -> "The"
        englishSentence = englishSentence.replace(/\b(the|a|my|your) \1\b/gi, "$1");
        // "My the" -> "My"
        englishSentence = englishSentence.replace(/\b(my|your|his|her) the\b/gi, "$1");

        // Capitalize first letter if needed
        frenchSentence = frenchSentence.charAt(0).toUpperCase() + frenchSentence.slice(1);
        englishSentence = englishSentence.charAt(0).toUpperCase() + englishSentence.slice(1);

        const instance = {
            french: frenchSentence,
            english: englishSentence,
            words: instantiationMap
        };

        // Validate realism before returning
        if (validateRealism(instance, template)) {
            return instance;
        }
    }

    console.warn(`Failed to instantiate template ${template.id} after ${maxRetries} attempts`);
    return null;
};

/**
 * Generator for Cloze (Fill-in-the-blank)
 */
export const generateCloze = (level = 1) => {
    // 1. Pick a template appropriate for level
    const templates = SENTENCE_TEMPLATES.filter(t => t.level <= level && !t.isStatic);
    if (!templates.length) return null;

    const template = getRandom(templates);
    const instance = instantiateTemplate(template);

    if (!instance) return generateCloze(level); // Retry with different template

    // 2. Decide what to hide (the "gap")
    const wordTypes = Object.keys(instance.words);
    if (wordTypes.length === 0) return generateCloze(level); // Retry

    const targetType = getRandom(wordTypes);
    const targetWord = instance.words[targetType];

    // 3. Create distractors (same category for challenge)
    let distractors = vocabularyList
        .filter(w =>
            w.category === targetWord.category &&
            w.id !== targetWord.id &&
            (targetWord.gender === null || w.gender === targetWord.gender)
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.french);

    // If not enough distractors, fallback to random words of same type
    if (distractors.length < 3) {
        const randoms = vocabularyList
            .filter(w => w.id !== targetWord.id && w.pos === targetWord.pos)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - distractors.length)
            .map(w => w.french);
        distractors = [...distractors, ...randoms];
    }

    return {
        type: 'cloze',
        question: instance.french.replace(targetWord.french, '_____'),
        answer: targetWord.french,
        translation: instance.english,
        options: [targetWord.french, ...distractors].sort(() => Math.random() - 0.5),
        focus: targetType,
        category: template.category
    };
};

/**
 * Generator for Error Spotting
 */
export const generateErrorSpotting = (level = 1) => {
    const templates = SENTENCE_TEMPLATES.filter(t => t.level <= level && !t.isStatic);
    if (!templates.length) return null;

    const template = getRandom(templates);
    const instance = instantiateTemplate(template);
    if (!instance) return generateErrorSpotting(level);

    let corruptedSentence = instance.french;
    let errorMetadata = {};

    // Create an error based on common French mistakes
    if (instance.french.startsWith("Le ")) {
        corruptedSentence = instance.french.replace("Le ", "La ");
        errorMetadata = {
            target: "La",
            correction: "Le",
            explanation: "The noun is masculine, so use 'Le'."
        };
    } else if (instance.french.startsWith("La ")) {
        corruptedSentence = instance.french.replace("La ", "Le ");
        errorMetadata = {
            target: "Le",
            correction: "La",
            explanation: "The noun is feminine, so use 'La'."
        };
    } else if (instance.french.includes(" un ")) {
        corruptedSentence = instance.french.replace(" un ", " une ");
        errorMetadata = {
            target: "une",
            correction: "un",
            explanation: "Masculine nouns use 'un'."
        };
    } else if (instance.french.includes(" une ")) {
        corruptedSentence = instance.french.replace(" une ", " un ");
        errorMetadata = {
            target: "un",
            correction: "une",
            explanation: "Feminine nouns use 'une'."
        };
    } else if (instance.french.includes(" au ")) {
        corruptedSentence = instance.french.replace(" au ", " à la ");
        errorMetadata = {
            target: "à la",
            correction: "au",
            explanation: "Masculine nouns use 'au' (à + le)."
        };
    } else {
        // Fallback if no easy error pattern found
        return generateErrorSpotting(level);
    }

    return {
        type: 'error_spotting',
        sentence: corruptedSentence,
        correctSentence: instance.french,
        translation: instance.english,
        error: errorMetadata,
        category: template.category
    };
};

/**
 * Generator for Sentence Builder
 */
export const generateSentenceBuilder = (level = 1) => {
    const templates = SENTENCE_TEMPLATES.filter(t => t.level <= level);
    if (!templates.length) return null;

    const template = getRandom(templates);
    const instance = instantiateTemplate(template);
    if (!instance) return generateSentenceBuilder(level);

    // Tokenize the sentence
    const tokens = instance.french.split(' ');

    const detailedTokens = tokens.map((text, idx) => {
        let matchedWord = null;
        Object.values(instance.words).forEach(w => {
            if (w.french === text || w.french === text.replace(/[.,!?]/g, '')) {
                matchedWord = w;
            }
        });

        const type = matchedWord ? matchedWord.pos : 'particle';
        const gender = matchedWord ? matchedWord.gender : null;

        return {
            id: `word-${idx}-${Date.now()}`,
            text: text,
            cleanText: text.replace(/[.,!?]/g, ''),
            metadata: {
                type,
                gender,
                category: matchedWord ? matchedWord.category : null
            }
        };
    });

    return {
        targetEnglish: instance.english,
        targetFrench: instance.french,
        tokens: detailedTokens,
        scrambled: [...detailedTokens].sort(() => Math.random() - 0.5),
        category: template.category
    };
};

/**
 * Generate exercises by category for more focused practice
 */
export const generateExerciseByCategory = (category, level = 1) => {
    const templates = SENTENCE_TEMPLATES.filter(t =>
        t.level <= level &&
        t.category === category &&
        !t.isStatic
    );

    if (!templates.length) return null;

    const template = getRandom(templates);
    const instance = instantiateTemplate(template);

    if (!instance) return null;

    return {
        type: 'contextual',
        french: instance.french,
        english: instance.english,
        category: template.category,
        words: instance.words
    };
};
