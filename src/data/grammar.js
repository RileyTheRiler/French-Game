export const GRAMMAR_TIPS = [
    {
        id: 'g1',
        title: 'Nouns have Gender',
        content: 'In French, all nouns are either masculine or feminine. "Le" is for masculine (le chat), and "La" is for feminine (la maison).',
        whyItMatters: 'Getting gender right affects adjectives, pronouns, and past participles. It\'s not just about sounding correct—wrong gender can sometimes change meaning entirely!',
        commonMistakes: [
            'Learning nouns without their article (learn "la maison", not just "maison")',
            'Assuming words ending in -e are always feminine (le musée, le problème)',
            'Guessing based on the object\'s real-world properties instead of grammar'
        ],
        memoryTrick: 'Always picture the article as part of the word. Visualize "la maison" as one unit, like a name tag on the word.',
        examples: [
            { wrong: 'le maison', correct: 'la maison', reason: '"maison" is feminine' },
            { wrong: 'la livre', correct: 'le livre', reason: '"livre" is masculine' }
        ],
        relatedTopics: ['gender_system']
    },
    {
        id: 'g2',
        title: 'Adjective Placement',
        content: 'Most adjectives go AFTER the noun in French. Ex: "Une voiture rouge" (A red car). But some short ones (BANGS - Beauty, Age, Number, Goodness, Size) go before: "Une petite voiture".',
        whyItMatters: 'Placement can change meaning! "Un ancien professeur" means a former teacher, but "un professeur ancien" means an elderly teacher.',
        commonMistakes: [
            'Putting colors before the noun (should be "une voiture rouge", not "une rouge voiture")',
            'Forgetting that BANGS adjectives go before (should be "une grande maison")',
            'Not adjusting adjective endings for gender/number'
        ],
        memoryTrick: 'BANGS: Beauty (beau), Age (vieux), Number (premier), Goodness (bon), Size (grand). These common adjectives announce themselves before the noun!',
        examples: [
            { wrong: 'un noir chat', correct: 'un chat noir', reason: 'Colors follow the noun' },
            { correct: 'une grande maison', reason: '"grande" is Size (BANGS)' }
        ],
        relatedTopics: ['adjective_agreement']
    },
    {
        id: 'g3',
        title: 'Negation',
        content: 'To say "not", put "ne" before the verb and "pas" after it. Ex: "Je ne comprends pas" (I do not understand).',
        whyItMatters: 'French uses a two-part negation that "sandwiches" the verb. This structure is consistent across all tenses and makes negation very predictable once you master it.',
        commonMistakes: [
            'Putting both parts on the same side of the verb',
            'Forgetting "ne" in writing (it\'s often dropped in casual speech, but required in writing)',
            'Placing negation incorrectly in compound tenses (it wraps the helper verb, not the participle)'
        ],
        memoryTrick: 'Think of a sandwich: ne is the top bun, the verb is the filling, and pas is the bottom bun. You can\'t have a sandwich without both buns!',
        examples: [
            { wrong: 'Je pas sais', correct: 'Je ne sais pas', reason: '"ne" comes before the verb' }
        ],
        relatedTopics: ['negation']
    },
    {
        id: 'g4',
        title: 'Tu vs Vous',
        content: 'Use "Tu" for friends, family, and children. Use "Vous" for strangers, elders, and in professional settings.',
        whyItMatters: 'Using the wrong form can be seen as disrespectful (too formal with friends) or rude (too informal with superiors). This social nuance is crucial for French culture.',
        commonMistakes: [
            'Using "tu" with people you just met (unless they\'re clearly peers your age)',
            'Switching between tu and vous inconsistently with the same person',
            'Not realizing that "vous" is also the plural form for any group'
        ],
        memoryTrick: 'When in doubt, use "vous"! It\'s better to be too polite than too familiar. The French person will often say "Tu peux me tutoyer" if they want you to use "tu".',
        examples: [
            { correct: 'Tu viens? (to a friend)', reason: 'Informal singular' },
            { correct: 'Vous venez? (to your boss)', reason: 'Formal singular' },
            { correct: 'Vous venez? (to a group)', reason: 'Plural (any formality)' }
        ],
        relatedTopics: ['verb_conjugation']
    },
    {
        id: 'g5',
        title: 'The Verb Être (To Be)',
        content: 'Je suis (I am), Tu es (You are), Il est (He is), Nous sommes (We are), Vous êtes (You are), Ils sont (They are).',
        whyItMatters: 'Être is one of the two most important verbs in French (along with avoir). It\'s used constantly for descriptions, identity, professions, and as a helper verb in passé composé.',
        commonMistakes: [
            'Confusing "es" and "est" (tu es vs il est)',
            'Forgetting the accent in "êtes" (vous êtes)',
            'Using être when avoir is needed (J\'ai 20 ans, NOT Je suis 20 ans)'
        ],
        memoryTrick: 'Practice the rhythm: "suis, es, est, sommes, êtes, sont" - it has a musical quality. Say it like a chant until it becomes automatic!',
        examples: [
            { correct: 'Je suis content', reason: 'I am happy' },
            { correct: 'Nous sommes français', reason: 'We are French' },
            { correct: 'Elle est grande', reason: 'She is tall' }
        ],
        relatedTopics: ['passe_compose']
    },
    {
        id: 'g6',
        title: 'Passé Composé',
        content: 'The passé composé is the main past tense for completed actions. It uses a helper verb (avoir or être) + past participle. Ex: "J\'ai mangé" (I ate), "Elle est allée" (She went).',
        whyItMatters: 'This is the past tense you will use most often in French conversation. Mastering it opens up storytelling and describing past events.',
        commonMistakes: [
            'Using the wrong helper: movement/reflexive verbs use être (je suis allé, not j\'ai allé)',
            'Forgetting participle agreement with être verbs (elle est allée, not elle est allé)',
            'Wrong participle endings (-é for -er verbs, -i for -ir verbs, -u for -re verbs)'
        ],
        memoryTrick: 'DR MRS VANDERTRAMP: Die, Return, Mount, Remain, Stay, Venir, Aller, Naître, Descendre, Entrer, Rentrer, Tomber, Revenir, Arriver, Monter, Partir - these verbs use être!',
        examples: [
            { correct: 'J\'ai parlé avec Marie', reason: 'Parler uses avoir' },
            { correct: 'Elle est arrivée hier', reason: 'Arriver uses être, feminine agreement' },
            { wrong: 'J\'ai allé au cinéma', correct: 'Je suis allé au cinéma', reason: 'Aller uses être' }
        ],
        relatedTopics: ['verb_conjugation', 'etre']
    },
    {
        id: 'g7',
        title: 'Object Pronouns',
        content: 'Object pronouns (le, la, les, lui, leur) replace nouns to avoid repetition. They go BEFORE the verb. Ex: "Je vois Marie" → "Je la vois" (I see her).',
        whyItMatters: 'Native speakers use object pronouns constantly. Without them, your French sounds repetitive and unnatural.',
        commonMistakes: [
            'Placing pronouns after the verb (should be "Je le vois", not "Je vois le")',
            'Confusing direct (le, la, les) vs indirect (lui, leur) objects',
            'Forgetting to use them, repeating the noun instead'
        ],
        memoryTrick: 'Direct = Direct contact (I see HER, I eat IT). Indirect = TO someone (I give TO him = lui, I speak TO them = leur).',
        examples: [
            { correct: 'Je la mange', reason: 'La pomme → la (direct object, feminine)' },
            { correct: 'Je lui parle', reason: 'À Marie → lui (indirect object)' },
            { wrong: 'Je donne le livre à lui', correct: 'Je lui donne le livre', reason: 'Pronoun goes before verb' }
        ],
        relatedTopics: ['verb_conjugation']
    },
    {
        id: 'g8',
        title: 'Imparfait vs Passé Composé',
        content: 'Imparfait = ongoing/habitual past actions ("I was eating", "I used to eat"). Passé composé = completed actions ("I ate"). Ex: "Je mangeais quand il est arrivé" (I was eating when he arrived).',
        whyItMatters: 'This distinction does not exist in English but is crucial in French. Using the wrong one changes the meaning of your story.',
        commonMistakes: [
            'Using passé composé for background descriptions (should be "Il faisait beau", not "Il a fait beau" for setting a scene)',
            'Using imparfait for one-time completed actions (should be "J\'ai mangé une pomme", not "Je mangeais une pomme" for a single event)',
            'Translating English "-ing" always as imparfait (context matters!)'
        ],
        memoryTrick: 'Imparfait = BACKGROUND (weather, feelings, ongoing actions). Passé composé = FOREGROUND (specific events that moved the story forward).',
        examples: [
            { correct: 'Quand j\'étais jeune, j\'aimais le chocolat', reason: 'Habitual past = imparfait' },
            { correct: 'Hier, j\'ai acheté du chocolat', reason: 'Completed action = passé composé' },
            { correct: 'Je dormais quand le téléphone a sonné', reason: 'Background (sleeping) + interruption (rang)' }
        ],
        relatedTopics: ['passe_compose']
    }
];

export const GRAMMAR_DRILLS = [
    // Être Conjugation
    {
        id: 'drill_etre_1',
        category: 'verbs',
        tip: 'g5',
        type: 'fill_blank',
        prompt: 'Je ___ content. (I am happy)',
        answer: 'suis',
        options: ['suis', 'es', 'est', 'sommes'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_etre_2',
        category: 'verbs',
        tip: 'g5',
        type: 'fill_blank',
        prompt: 'Nous ___ français. (We are French)',
        answer: 'sommes',
        options: ['suis', 'êtes', 'sommes', 'sont'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_etre_3',
        category: 'verbs',
        tip: 'g5',
        type: 'fill_blank',
        prompt: 'Ils ___ à Paris. (They are in Paris)',
        answer: 'sont',
        options: ['est', 'sommes', 'êtes', 'sont'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    // Articles (Gender)
    {
        id: 'drill_article_1',
        category: 'articles',
        tip: 'g1',
        type: 'fill_blank',
        prompt: '___ chat est noir. (The cat is black)',
        answer: 'Le',
        options: ['Le', 'La', 'Les', 'Un'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_article_2',
        category: 'articles',
        tip: 'g1',
        type: 'fill_blank',
        prompt: '___ maison est grande. (The house is big)',
        answer: 'La',
        options: ['Le', 'La', 'Les', 'Une'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_article_3',
        category: 'articles',
        tip: 'g1',
        type: 'fill_blank',
        prompt: '___ voiture rouge. (A red car)',
        answer: 'Une',
        options: ['Un', 'Une', 'Le', 'La'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    // Negation
    {
        id: 'drill_neg_1',
        category: 'negation',
        tip: 'g3',
        type: 'fill_blank',
        prompt: 'Je ___ comprends ___. (I do not understand)',
        answer: 'ne...pas',
        options: ['ne...pas', 'pas...ne', 'non...pas', 'ne...non'],
        xpReward: 15,
        difficulty: 'intermediate'
    },
    {
        id: 'drill_neg_2',
        category: 'negation',
        tip: 'g3',
        type: 'translate',
        prompt: 'Translate: "I do not speak French"',
        answer: 'Je ne parle pas français',
        options: ['Je parle pas français', 'Je ne parle pas français', 'Je non parle français', 'Pas je parle français'],
        xpReward: 20,
        difficulty: 'intermediate'
    },
    // Adjective Placement
    {
        id: 'drill_adj_1',
        category: 'adjectives',
        tip: 'g2',
        type: 'order',
        prompt: 'Put in correct order: "red car"',
        answer: 'voiture rouge',
        options: ['voiture rouge', 'rouge voiture'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_adj_2',
        category: 'adjectives',
        tip: 'g2',
        type: 'order',
        prompt: 'Put in correct order: "small house"',
        answer: 'petite maison',
        options: ['petite maison', 'maison petite'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    // Tu vs Vous
    {
        id: 'drill_tu_1',
        category: 'formality',
        tip: 'g4',
        type: 'choice',
        prompt: 'Speaking to your boss, use:',
        answer: 'Vous',
        options: ['Tu', 'Vous'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_tu_2',
        category: 'formality',
        tip: 'g4',
        type: 'choice',
        prompt: 'Speaking to your best friend, use:',
        answer: 'Tu',
        options: ['Tu', 'Vous'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    // Passé Composé
    {
        id: 'drill_pc_1',
        category: 'passe_compose',
        tip: 'g6',
        type: 'fill_blank',
        prompt: 'J\' ___ mangé une pomme. (I ate an apple)',
        answer: 'ai',
        options: ['ai', 'suis', 'avons', 'a'],
        xpReward: 15,
        difficulty: 'beginner'
    },
    {
        id: 'drill_pc_2',
        category: 'passe_compose',
        tip: 'g6',
        type: 'fill_blank',
        prompt: 'Elle ___ arrivée hier. (She arrived yesterday)',
        answer: 'est',
        options: ['a', 'est', 'avait', 'était'],
        xpReward: 15,
        difficulty: 'beginner'
    },
    {
        id: 'drill_pc_3',
        category: 'passe_compose',
        tip: 'g6',
        type: 'choice',
        prompt: '"Aller" uses which helper verb?',
        answer: 'être',
        options: ['avoir', 'être'],
        xpReward: 10,
        difficulty: 'beginner'
    },
    {
        id: 'drill_pc_4',
        category: 'passe_compose',
        tip: 'g6',
        type: 'translate',
        prompt: 'Translate: "We went to Paris"',
        answer: 'Nous sommes allés à Paris',
        options: ['Nous avons allé à Paris', 'Nous sommes allés à Paris', 'Nous allons à Paris', 'Nous étions à Paris'],
        xpReward: 20,
        difficulty: 'intermediate'
    },
    // Object Pronouns
    {
        id: 'drill_op_1',
        category: 'pronouns',
        tip: 'g7',
        type: 'fill_blank',
        prompt: 'Je ___ vois. (I see her - referring to Marie)',
        answer: 'la',
        options: ['la', 'lui', 'le', 'les'],
        xpReward: 15,
        difficulty: 'intermediate'
    },
    {
        id: 'drill_op_2',
        category: 'pronouns',
        tip: 'g7',
        type: 'fill_blank',
        prompt: 'Je ___ parle. (I speak to him)',
        answer: 'lui',
        options: ['le', 'lui', 'la', 'leur'],
        xpReward: 15,
        difficulty: 'intermediate'
    },
    {
        id: 'drill_op_3',
        category: 'pronouns',
        tip: 'g7',
        type: 'translate',
        prompt: 'Translate: "I give it to her" (the book to Marie)',
        answer: 'Je le lui donne',
        options: ['Je donne le livre à elle', 'Je le lui donne', 'Je lui le donne', 'Je la lui donne'],
        xpReward: 20,
        difficulty: 'hard'
    },
    // Imparfait vs Passé Composé
    {
        id: 'drill_imp_1',
        category: 'imparfait',
        tip: 'g8',
        type: 'choice',
        prompt: '"When I was young, I loved chocolate" - which tense?',
        answer: 'Imparfait',
        options: ['Passé composé', 'Imparfait'],
        xpReward: 15,
        difficulty: 'intermediate'
    },
    {
        id: 'drill_imp_2',
        category: 'imparfait',
        tip: 'g8',
        type: 'choice',
        prompt: '"Yesterday, I bought a book" - which tense?',
        answer: 'Passé composé',
        options: ['Passé composé', 'Imparfait'],
        xpReward: 15,
        difficulty: 'intermediate'
    },
    {
        id: 'drill_imp_3',
        category: 'imparfait',
        tip: 'g8',
        type: 'fill_blank',
        prompt: 'Il ___ beau quand je suis sorti. (The weather was nice when I went out)',
        answer: 'faisait',
        options: ['a fait', 'faisait', 'fait', 'fera'],
        xpReward: 20,
        difficulty: 'hard'
    }
];

export const DRILL_CATEGORIES = {
    verbs: { name: 'Verb Conjugation', icon: '🏃', color: 'indigo' },
    articles: { name: 'Articles & Gender', icon: '📝', color: 'amber' },
    negation: { name: 'Negation', icon: '🚫', color: 'red' },
    adjectives: { name: 'Adjective Placement', icon: '🎨', color: 'emerald' },
    formality: { name: 'Tu vs Vous', icon: '🤝', color: 'purple' },
    passe_compose: { name: 'Passé Composé', icon: '⏮️', color: 'sky' },
    pronouns: { name: 'Object Pronouns', icon: '👉', color: 'rose' },
    imparfait: { name: 'Imparfait vs PC', icon: '⏳', color: 'violet' }
};
