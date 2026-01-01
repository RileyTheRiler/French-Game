/**
 * Grammar Tips Database
 * Provides explanations for common French grammar rules.
 */

export const GRAMMAR_TIPS = {
    gender_agreement: {
        id: 'gender_agreement',
        title: 'Le vs La (Gender)',
        shortTip: 'French nouns have gender. "Le" is masculine, "la" is feminine.',
        explanation: `In French, every noun has a gender - either masculine or feminine. 
        Articles must match: "le" for masculine, "la" for feminine.
        Example: "le livre" (the book, masc.), "la maison" (the house, fem.)`,
        examples: [
            { wrong: 'le maison', correct: 'la maison', reason: '"maison" is feminine' },
            { wrong: 'la livre', correct: 'le livre', reason: '"livre" is masculine' }
        ]
    },
    adjective_placement: {
        id: 'adjective_placement',
        title: 'Adjective Placement (BANGS)',
        shortTip: 'Most adjectives come AFTER the noun, except BANGS adjectives.',
        explanation: `In French, most adjectives follow the noun (unlike English).
        Exception: BANGS adjectives (Beauty, Age, Number, Goodness, Size) go BEFORE.
        Examples: "un chat noir" (a black cat), but "une belle maison" (a beautiful house)`,
        examples: [
            { wrong: 'un noir chat', correct: 'un chat noir', reason: 'Colors follow the noun' },
            { correct: 'une grande maison', reason: '"grande" is Size (BANGS)' }
        ]
    },
    negation: {
        id: 'negation',
        title: 'Negation Sandwich (ne...pas)',
        shortTip: 'Negation wraps around the verb: ne + verb + pas.',
        explanation: `French negation uses "ne...pas" around the verb.
        Example: "Je ne sais pas" (I don't know).
        Common mistake: Forgetting "ne" in informal speech is okay, but "pas" is essential.`,
        examples: [
            { wrong: 'Je pas sais', correct: 'Je ne sais pas', reason: '"ne" comes before the verb' }
        ]
    },
    question_inversion: {
        id: 'question_inversion',
        title: 'Question Formation',
        shortTip: 'Questions can use inversion, "est-ce que", or rising intonation.',
        explanation: `Three ways to ask questions:
        1. Inversion: "Parlez-vous français?"
        2. Est-ce que: "Est-ce que vous parlez français?"
        3. Intonation: "Vous parlez français?" (rising tone)`,
        examples: []
    }
};

// Common feminine nouns for gender checking
export const FEMININE_NOUNS = [
    'maison', 'voiture', 'table', 'chaise', 'pomme', 'baguette',
    'bibliothèque', 'école', 'université', 'rue', 'ville', 'fleur',
    'porte', 'fenêtre', 'cuisine', 'chambre', 'salle', 'place'
];

// Common masculine nouns for gender checking
export const MASCULINE_NOUNS = [
    'livre', 'chat', 'chien', 'café', 'pain', 'fromage',
    'appartement', 'bureau', 'jardin', 'parc', 'pays', 'jour',
    'matin', 'soir', 'croissant', 'chocolat', 'vin', 'homme'
];

// BANGS adjectives that go BEFORE the noun
export const BANGS_ADJECTIVES = [
    // Beauty
    'beau', 'belle', 'joli', 'jolie',
    // Age
    'nouveau', 'nouvelle', 'vieux', 'vieille', 'jeune',
    // Number
    'premier', 'première', 'dernier', 'dernière',
    // Goodness
    'bon', 'bonne', 'mauvais', 'mauvaise',
    // Size
    'grand', 'grande', 'petit', 'petite', 'gros', 'grosse', 'long', 'longue'
];
