// Pattern Drills data and utilities
// Structured grammar exercises for analytical learners

import { VERB_DATA, PRONOUNS, TENSES } from './verbData';

// Noun-adjective agreement data
export const AGREEMENT_RULES = [
    {
        id: 'adj-gender',
        rule: 'Adjectives agree in gender with the noun they modify',
        description: 'Add -e for feminine forms (unless already ending in -e)',
        examples: [
            { noun: 'le garçon', adjective: 'petit', result: 'le petit garçon' },
            { noun: 'la fille', adjective: 'petite', result: 'la petite fille' },
        ],
    },
    {
        id: 'adj-number',
        rule: 'Adjectives agree in number with the noun they modify',
        description: 'Add -s for plural forms',
        examples: [
            { noun: 'le chat', adjective: 'noir', result: 'le chat noir' },
            { noun: 'les chats', adjective: 'noirs', result: 'les chats noirs' },
        ],
    },
    {
        id: 'adj-position',
        rule: 'Most adjectives come after the noun',
        description: 'BANGS adjectives (Beauty, Age, Number, Goodness, Size) come before',
        examples: [
            { noun: 'une maison', adjective: 'grande', result: 'une grande maison' },
            { noun: 'un livre', adjective: 'intéressant', result: 'un livre intéressant' },
        ],
    },
];

// Common adjectives for agreement practice
export const ADJECTIVES = [
    { masculine: 'petit', feminine: 'petite', meaning: 'small' },
    { masculine: 'grand', feminine: 'grande', meaning: 'big/tall' },
    { masculine: 'nouveau', feminine: 'nouvelle', meaning: 'new' },
    { masculine: 'vieux', feminine: 'vieille', meaning: 'old' },
    { masculine: 'beau', feminine: 'belle', meaning: 'beautiful' },
    { masculine: 'bon', feminine: 'bonne', meaning: 'good' },
    { masculine: 'mauvais', feminine: 'mauvaise', meaning: 'bad' },
    { masculine: 'joli', feminine: 'jolie', meaning: 'pretty' },
    { masculine: 'heureux', feminine: 'heureuse', meaning: 'happy' },
    { masculine: 'premier', feminine: 'première', meaning: 'first' },
    { masculine: 'dernier', feminine: 'dernière', meaning: 'last' },
    { masculine: 'jeune', feminine: 'jeune', meaning: 'young' },
    { masculine: 'français', feminine: 'française', meaning: 'French' },
    { masculine: 'américain', feminine: 'américaine', meaning: 'American' },
    { masculine: 'intelligent', feminine: 'intelligente', meaning: 'intelligent' },
];

// Nouns for agreement practice
export const NOUNS_FOR_AGREEMENT = [
    { french: 'garçon', english: 'boy', gender: 'm', article: 'le' },
    { french: 'fille', english: 'girl', gender: 'f', article: 'la' },
    { french: 'homme', english: 'man', gender: 'm', article: "l'" },
    { french: 'femme', english: 'woman', gender: 'f', article: 'la' },
    { french: 'chat', english: 'cat', gender: 'm', article: 'le' },
    { french: 'chien', english: 'dog', gender: 'm', article: 'le' },
    { french: 'maison', english: 'house', gender: 'f', article: 'la' },
    { french: 'voiture', english: 'car', gender: 'f', article: 'la' },
    { french: 'livre', english: 'book', gender: 'm', article: 'le' },
    { french: 'table', english: 'table', gender: 'f', article: 'la' },
];

// Exercise types
export const DRILL_TYPES = {
    CONJUGATION_TABLE: 'conjugation_table',
    AGREEMENT_MATCHING: 'agreement_matching',
    PATTERN_COMPLETION: 'pattern_completion',
};

/**
 * Generate a conjugation table exercise
 * @param {string} verbInfinitive - The verb to conjugate
 * @param {string} tense - The tense to use
 * @param {number} blanksCount - Number of blanks to create (1-6)
 * @param {number} difficulty - Global difficulty value (0-100)
 * @returns {Object} Exercise data
 */
export function generateConjugationExercise(verbInfinitive = null, tense = null, blanksCount = null, difficulty = 25) {
    const finalBlanks = blanksCount ?? Math.min(6, Math.max(1, Math.floor(difficulty / 15) + 1));
    // Pick random verb if not specified
    const verb = verbInfinitive
        ? VERB_DATA.find(v => v.infinitive === verbInfinitive)
        : VERB_DATA[Math.floor(Math.random() * VERB_DATA.length)];

    if (!verb) return null;

    // Pick random tense if not specified
    const selectedTense = tense || TENSES[Math.floor(Math.random() * TENSES.length)].id;
    const conjugations = verb.conjugations[selectedTense];

    if (!conjugations) return null;

    // Create exercise with some blanks
    const pronounList = [...PRONOUNS];
    const shuffled = pronounList.sort(() => Math.random() - 0.5);
    const blankedPronouns = shuffled.slice(0, Math.min(finalBlanks, 6));

    const cells = PRONOUNS.map(pronoun => ({
        pronoun,
        correctAnswer: conjugations[pronoun],
        isBlank: blankedPronouns.includes(pronoun),
        userAnswer: null,
    }));

    return {
        type: DRILL_TYPES.CONJUGATION_TABLE,
        verb: verb.infinitive,
        translation: verb.translation,
        tense: selectedTense,
        tenseName: TENSES.find(t => t.id === selectedTense)?.label || selectedTense,
        cells,
        totalBlanks: blankedPronouns.length,
    };
}

/**
 * Generate an adjective agreement exercise
 * @param {number} difficulty - Global difficulty value (0-100)
 * @returns {Object} Exercise data
 */
export function generateAgreementExercise(difficulty = 25) {
    const noun = NOUNS_FOR_AGREEMENT[Math.floor(Math.random() * NOUNS_FOR_AGREEMENT.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

    const correctForm = noun.gender === 'f' ? adjective.feminine : adjective.masculine;

    // Generate wrong options
    const wrongForm = noun.gender === 'f' ? adjective.masculine : adjective.feminine;
    const options = [correctForm, wrongForm].sort(() => Math.random() - 0.5);

    return {
        type: DRILL_TYPES.AGREEMENT_MATCHING,
        noun: {
            french: noun.french,
            english: noun.english,
            gender: noun.gender,
            article: noun.article,
            fullNoun: `${noun.article}${noun.article.endsWith("'") ? '' : ' '}${noun.french}`,
        },
        adjective: {
            masculine: adjective.masculine,
            feminine: adjective.feminine,
            meaning: adjective.meaning,
        },
        correctAnswer: correctForm,
        options,
        explanation: `"${noun.french}" is ${noun.gender === 'f' ? 'feminine' : 'masculine'}, so the adjective takes the ${noun.gender === 'f' ? 'feminine' : 'masculine'} form.`,
    };
}

/**
 * Generate a pattern completion exercise for verb patterns
 * @param {number} difficulty - Global difficulty value (0-100)
 * @returns {Object} Exercise data
 */
export function generatePatternCompletionExercise(difficulty = 25) {
    // Pick a regular -er or -ir verb
    const regularVerbs = VERB_DATA.filter(v => v.group === 1 || v.group === 2);
    const verb = regularVerbs[Math.floor(Math.random() * regularVerbs.length)];

    const tense = 'present';
    const conjugations = verb.conjugations[tense];

    // Show a pattern with one missing
    const pronounIndex = Math.floor(Math.random() * PRONOUNS.length);
    const targetPronoun = PRONOUNS[pronounIndex];

    const pattern = PRONOUNS.map(p => ({
        pronoun: p,
        conjugation: conjugations[p],
        isHidden: p === targetPronoun,
    }));

    // Generate distractors
    const correctAnswer = conjugations[targetPronoun];
    const distractors = PRONOUNS
        .filter(p => p !== targetPronoun)
        .map(p => conjugations[p])
        .filter(c => c !== correctAnswer)
        .slice(0, 2);

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
        type: DRILL_TYPES.PATTERN_COMPLETION,
        verb: verb.infinitive,
        translation: verb.translation,
        group: verb.group,
        tense,
        pattern,
        targetPronoun,
        correctAnswer,
        options,
        hint: verb.group === 1
            ? 'First group (-er) verbs follow a regular pattern'
            : 'Second group (-ir) verbs add -iss- in plural forms',
    };
}

/**
 * Generate a mixed drill session
 * @param {number} count - Number of exercises
 * @param {number} difficulty - Global difficulty value (0-100)
 * @returns {Array} Array of exercises
 */
export function generateDrillSession(count = 10, difficulty = 25) {
    const exercises = [];

    for (let i = 0; i < count; i++) {
        const type = Math.floor(Math.random() * 3);

        switch (type) {
            case 0:
                exercises.push(generateConjugationExercise(null, null, null, difficulty));
                break;
            case 1:
                exercises.push(generateAgreementExercise(difficulty));
                break;
            case 2:
                exercises.push(generatePatternCompletionExercise(difficulty));
                break;
        }
    }

    return exercises.filter(e => e !== null);
}

export default {
    AGREEMENT_RULES,
    ADJECTIVES,
    NOUNS_FOR_AGREEMENT,
    DRILL_TYPES,
    generateConjugationExercise,
    generateAgreementExercise,
    generatePatternCompletionExercise,
    generateDrillSession,
};
