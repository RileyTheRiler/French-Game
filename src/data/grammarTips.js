/**
 * Grammar Tips & Rules Database
 * Provides explanations, checkers, and mini-lessons for French grammar rules.
 */

// ============================================================================
// GRAMMAR TIPS (Original - for reference/tooltips)
// ============================================================================

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

// ============================================================================
// NOUN GENDER DATABASES
// ============================================================================

export const FEMININE_NOUNS = new Set([
    'maison', 'voiture', 'table', 'chaise', 'pomme', 'baguette',
    'bibliothèque', 'école', 'université', 'rue', 'ville', 'fleur',
    'porte', 'fenêtre', 'cuisine', 'chambre', 'salle', 'place',
    'femme', 'fille', 'mère', 'sœur', 'tante', 'grand-mère',
    'banque', 'pharmacie', 'boulangerie', 'librairie', 'gare',
    'plage', 'montagne', 'rivière', 'mer', 'forêt', 'campagne',
    'nuit', 'journée', 'semaine', 'année', 'heure', 'minute',
    'question', 'réponse', 'idée', 'histoire', 'vie', 'mort',
    'musique', 'chanson', 'danse', 'peinture', 'sculpture',
    'lettre', 'carte', 'photo', 'image', 'page', 'phrase'
]);

export const MASCULINE_NOUNS = new Set([
    'livre', 'chat', 'chien', 'café', 'pain', 'fromage',
    'appartement', 'bureau', 'jardin', 'parc', 'pays', 'jour',
    'matin', 'soir', 'croissant', 'chocolat', 'vin', 'homme',
    'garçon', 'père', 'frère', 'oncle', 'grand-père', 'fils',
    'restaurant', 'hôtel', 'musée', 'théâtre', 'cinéma', 'marché',
    'travail', 'temps', 'argent', 'prix', 'problème', 'moment',
    'voyage', 'train', 'avion', 'bus', 'métro', 'vélo',
    'ordinateur', 'téléphone', 'film', 'livre', 'journal', 'magazine',
    'repas', 'petit-déjeuner', 'déjeuner', 'dîner', 'dessert'
]);

// BANGS adjectives that go BEFORE the noun
export const BANGS_ADJECTIVES = new Set([
    // Beauty
    'beau', 'belle', 'beaux', 'belles', 'joli', 'jolie', 'jolis', 'jolies',
    // Age
    'nouveau', 'nouvelle', 'nouveaux', 'nouvelles', 'vieux', 'vieille', 'vieilles', 'jeune', 'jeunes', 'ancien', 'ancienne',
    // Number
    'premier', 'première', 'dernier', 'dernière', 'deuxième', 'troisième',
    // Goodness
    'bon', 'bonne', 'bons', 'bonnes', 'mauvais', 'mauvaise', 'meilleur', 'meilleure',
    // Size
    'grand', 'grande', 'grands', 'grandes', 'petit', 'petite', 'petits', 'petites',
    'gros', 'grosse', 'long', 'longue', 'court', 'courte', 'haut', 'haute'
]);

// ============================================================================
// GRAMMAR RULES WITH CHECKER FUNCTIONS
// ============================================================================

/**
 * @typedef {Object} GrammarError
 * @property {string} ruleId - The ID of the violated rule
 * @property {string} errorType - Type of error (e.g., 'gender_mismatch')
 * @property {string} found - What the user wrote
 * @property {string} expected - What they should have written
 * @property {string} explanation - Short explanation
 * @property {Object} miniLesson - Detailed mini-lesson object
 */

export const GRAMMAR_RULES = {
    // -------------------------------------------------------------------------
    // Gender Agreement Rules
    // -------------------------------------------------------------------------
    gender_article_mismatch: {
        id: 'gender_article_mismatch',
        conceptId: 'gender_agreement',
        title: 'Article-Noun Gender Agreement',

        /**
         * Check for gender mismatches between articles and nouns
         * @param {string} userInput - The user's French input
         * @param {Object} context - Additional context (e.g., target sentence, word metadata)
         * @returns {GrammarError|null}
         */
        check: (userInput) => {
            const words = userInput.toLowerCase().split(/\s+/);

            for (let i = 0; i < words.length - 1; i++) {
                const article = words[i].replace(/[.,!?]/g, '');
                const noun = words[i + 1].replace(/[.,!?]/g, '');

                // Check masculine article with feminine noun
                if ((article === 'le' || article === 'un') && FEMININE_NOUNS.has(noun)) {
                    return {
                        ruleId: 'gender_article_mismatch',
                        errorType: 'masculine_with_feminine',
                        found: `${article} ${noun}`,
                        expected: `${article === 'le' ? 'la' : 'une'} ${noun}`,
                        explanation: `"${noun}" is feminine, so use "${article === 'le' ? 'la' : 'une'}" instead of "${article}".`,
                        miniLesson: GRAMMAR_RULES.gender_article_mismatch.getMiniLesson({
                            article, noun, correctArticle: article === 'le' ? 'la' : 'une', gender: 'feminine'
                        })
                    };
                }

                // Check feminine article with masculine noun
                if ((article === 'la' || article === 'une') && MASCULINE_NOUNS.has(noun)) {
                    return {
                        ruleId: 'gender_article_mismatch',
                        errorType: 'feminine_with_masculine',
                        found: `${article} ${noun}`,
                        expected: `${article === 'la' ? 'le' : 'un'} ${noun}`,
                        explanation: `"${noun}" is masculine, so use "${article === 'la' ? 'le' : 'un'}" instead of "${article}".`,
                        miniLesson: GRAMMAR_RULES.gender_article_mismatch.getMiniLesson({
                            article, noun, correctArticle: article === 'la' ? 'le' : 'un', gender: 'masculine'
                        })
                    };
                }
            }

            return null;
        },

        getMiniLesson: ({ article, noun, correctArticle, gender }) => ({
            title: '📚 Gender Agreement',
            content: `In French, every noun has a gender (masculine or feminine), and articles must match!`,
            keyPoint: `"${noun}" is **${gender}**, so it uses **${correctArticle}**.`,
            examples: [
                { wrong: `${article} ${noun}`, correct: `${correctArticle} ${noun}` },
                ...(gender === 'feminine'
                    ? [{ correct: 'la maison', note: 'house is feminine' }, { correct: 'la table', note: 'table is feminine' }]
                    : [{ correct: 'le livre', note: 'book is masculine' }, { correct: 'le café', note: 'coffee is masculine' }]
                )
            ],
            tip: gender === 'feminine'
                ? 'Many nouns ending in -e are feminine (but not all!)'
                : 'Many nouns for professions and objects are masculine.',
            relatedConcepts: ['adjective_agreement', 'plural_articles']
        })
    },

    // -------------------------------------------------------------------------
    // Age Expression Rule
    // -------------------------------------------------------------------------
    age_avoir_not_etre: {
        id: 'age_avoir_not_etre',
        conceptId: 'avoir_expressions',
        title: 'Age Uses "Avoir" Not "Être"',

        check: (userInput) => {
            const pattern = /je\s+suis\s+(\d+)\s*ans?/i;
            const match = userInput.match(pattern);

            if (match) {
                return {
                    ruleId: 'age_avoir_not_etre',
                    errorType: 'wrong_verb_for_age',
                    found: match[0],
                    expected: `J'ai ${match[1]} ans`,
                    explanation: `In French, we say "I have X years" (J'ai X ans), not "I am X years."`,
                    miniLesson: GRAMMAR_RULES.age_avoir_not_etre.getMiniLesson({ age: match[1] })
                };
            }

            return null;
        },

        getMiniLesson: ({ age }) => ({
            title: '📚 Expressing Age with "Avoir"',
            content: `Unlike English ("I am 25"), French uses the verb "avoir" (to have): "J'ai 25 ans" (I have 25 years).`,
            keyPoint: `Say **"J'ai ${age} ans"** not "Je suis ${age} ans".`,
            examples: [
                { wrong: `Je suis ${age} ans`, correct: `J'ai ${age} ans` },
                { correct: "Elle a 30 ans", note: "She is 30 (has 30 years)" },
                { correct: "Quel âge as-tu?", note: "How old are you? (What age do you have?)" }
            ],
            tip: '"Avoir" is used for many expressions that use "to be" in English: avoir faim (to be hungry), avoir froid (to be cold).',
            relatedConcepts: ['avoir_expressions', 'verb_conjugation']
        })
    },

    // -------------------------------------------------------------------------
    // Politeness: Je veux vs Je voudrais
    // -------------------------------------------------------------------------
    politeness_vouloir: {
        id: 'politeness_vouloir',
        conceptId: 'politeness',
        title: 'Polite Requests: "Je voudrais" vs "Je veux"',

        check: (userInput) => {
            // Only flag in service contexts (ordering, requesting)
            const isServiceContext = /commander|s'il vous plaît|un café|une baguette/i.test(userInput);

            if (isServiceContext && /\bje\s+veux\b/i.test(userInput)) {
                return {
                    ruleId: 'politeness_vouloir',
                    errorType: 'informal_request',
                    found: 'je veux',
                    expected: 'je voudrais',
                    explanation: `"Je veux" (I want) is quite direct. "Je voudrais" (I would like) is more polite.`,
                    miniLesson: GRAMMAR_RULES.politeness_vouloir.getMiniLesson({})
                };
            }

            return null;
        },

        getMiniLesson: () => ({
            title: '📚 Polite Requests',
            content: `When ordering or making requests in French, use the conditional "je voudrais" (I would like) instead of "je veux" (I want).`,
            keyPoint: `**"Je voudrais"** is polite. **"Je veux"** can sound demanding.`,
            examples: [
                { wrong: 'Je veux un café', correct: 'Je voudrais un café', note: 'At a café' },
                { correct: "Je voudrais l'addition, s'il vous plaît", note: "I'd like the check, please" },
                { correct: "Je voudrais réserver une table", note: "I'd like to reserve a table" }
            ],
            tip: 'Adding "s\'il vous plaît" (please) also helps sound more polite!',
            relatedConcepts: ['conditional_tense', 'formal_vs_informal']
        })
    },

    // -------------------------------------------------------------------------
    // Negation Structure
    // -------------------------------------------------------------------------
    negation_structure: {
        id: 'negation_structure',
        conceptId: 'negation',
        title: 'Negation: ne...pas',

        check: (userInput) => {
            // Check for "pas" without "ne" (informal but okay) - only flag in Scholar mode
            // Check for incorrect placement like "Je pas comprends"

            const incorrectPatterns = [
                { pattern: /\bje\s+pas\s+\w+/i, desc: 'pas before verb without ne' },
                { pattern: /\b(\w+)\s+ne\s+pas\b/i, desc: 'ne pas together without verb' }
            ];

            for (const { pattern, desc } of incorrectPatterns) {
                if (pattern.test(userInput)) {
                    return {
                        ruleId: 'negation_structure',
                        errorType: desc,
                        found: userInput.match(pattern)?.[0] || '',
                        expected: 'ne + verb + pas',
                        explanation: `French negation wraps around the verb: "ne" before, "pas" after.`,
                        miniLesson: GRAMMAR_RULES.negation_structure.getMiniLesson({})
                    };
                }
            }

            return null;
        },

        getMiniLesson: () => ({
            title: '📚 The Negation Sandwich',
            content: `French uses two words to make a sentence negative: "ne" before the verb and "pas" after it.`,
            keyPoint: `Structure: **Subject + ne + VERB + pas**`,
            examples: [
                { wrong: 'Je pas comprends', correct: 'Je ne comprends pas' },
                { correct: "Elle n'aime pas le fromage", note: "ne becomes n' before vowels" },
                { correct: "Nous ne parlons pas anglais", note: "We don't speak English" }
            ],
            tip: 'In casual speech, French speakers often drop "ne" - but keep it in writing and formal contexts!',
            relatedConcepts: ['negation_advanced', 'ne_plus', 'ne_jamais']
        })
    },

    // -------------------------------------------------------------------------
    // Adjective Agreement
    // -------------------------------------------------------------------------
    adjective_agreement: {
        id: 'adjective_agreement',
        conceptId: 'adjective_agreement',
        title: 'Adjective Gender/Number Agreement',

        check: (userInput) => {
            // Common patterns: masculine adj + feminine noun
            const patterns = [
                { pattern: /\b(un|le)\s+(petit|grand|bon|mauvais|nouveau)\s+(maison|table|femme|fille|voiture)\b/i, gender: 'feminine' },
                { pattern: /\b(une|la)\s+(petite|grande|bonne|mauvaise|nouvelle)\s+(homme|garçon|livre|café)\b/i, gender: 'masculine' }
            ];

            for (const { pattern, gender } of patterns) {
                const match = userInput.match(pattern);
                if (match) {
                    return {
                        ruleId: 'adjective_agreement',
                        errorType: 'gender_mismatch',
                        found: match[0],
                        expected: `Adjective should be ${gender}`,
                        explanation: `Adjectives must match the gender and number of the noun they describe.`,
                        miniLesson: GRAMMAR_RULES.adjective_agreement.getMiniLesson({ gender })
                    };
                }
            }

            return null;
        },

        getMiniLesson: ({ gender }) => ({
            title: '📚 Adjective Agreement',
            content: `French adjectives change form to match their noun's gender (masculine/feminine) and number (singular/plural).`,
            keyPoint: `Most feminine adjectives add **-e**: petit → petite`,
            examples: [
                { correct: 'un petit garçon', note: 'masculine singular' },
                { correct: 'une petite fille', note: 'feminine singular' },
                { correct: 'les petits enfants', note: 'masculine plural' },
                { correct: 'les petites maisons', note: 'feminine plural' }
            ],
            tip: 'Some adjectives are irregular: beau/belle, nouveau/nouvelle, vieux/vieille',
            relatedConcepts: ['bangs_adjectives', 'irregular_adjectives']
        })
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Run all grammar checks on user input
 * @param {string} userInput - The user's French input
 * @param {Object} context - Additional context
 * @returns {GrammarError[]} Array of detected errors
 */
export const checkGrammar = (userInput) => {
    const errors = [];

    for (const rule of Object.values(GRAMMAR_RULES)) {
        const error = rule.check(userInput);
        if (error) {
            errors.push(error);
        }
    }

    return errors;
};

/**
 * Get a specific grammar rule by ID
 * @param {string} ruleId 
 * @returns {Object|undefined}
 */
export const getGrammarRule = (ruleId) => {
    return GRAMMAR_RULES[ruleId];
};

/**
 * Get mini-lesson for a specific concept
 * @param {string} conceptId 
 * @returns {Object|undefined}
 */
export const getConceptLesson = (conceptId) => {
    const rule = Object.values(GRAMMAR_RULES).find(r => r.conceptId === conceptId);
    return rule?.getMiniLesson({});
};

/**
 * Check if a noun is feminine
 * @param {string} noun 
 * @returns {boolean}
 */
export const isFeminineNoun = (noun) => {
    return FEMININE_NOUNS.has(noun.toLowerCase().replace(/[.,!?]/g, ''));
};

/**
 * Check if a noun is masculine
 * @param {string} noun 
 * @returns {boolean}
 */
export const isMasculineNoun = (noun) => {
    return MASCULINE_NOUNS.has(noun.toLowerCase().replace(/[.,!?]/g, ''));
};

/**
 * Get the gender of a noun
 * @param {string} noun 
 * @returns {'masculine'|'feminine'|'unknown'}
 */
export const getNounGender = (noun) => {
    const cleanNoun = noun.toLowerCase().replace(/[.,!?]/g, '');
    if (MASCULINE_NOUNS.has(cleanNoun)) return 'masculine';
    if (FEMININE_NOUNS.has(cleanNoun)) return 'feminine';
    return 'unknown';
};

/**
 * Check if an adjective is a BANGS adjective (goes before noun)
 * @param {string} adjective 
 * @returns {boolean}
 */
export const isBANGSAdjective = (adjective) => {
    return BANGS_ADJECTIVES.has(adjective.toLowerCase());
};
