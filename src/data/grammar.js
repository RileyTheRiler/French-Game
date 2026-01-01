export const GRAMMAR_TIPS = [
    {
        id: 'g1',
        title: 'Nouns have Gender',
        content: 'In French, all nouns are either masculine or feminine. "Le" is for masculine (le chat), and "La" is for feminine (la maison).'
    },
    {
        id: 'g2',
        title: 'Adjective Placement',
        content: 'Most adjectives go AFTER the noun in French. Ex: "Une voiture rouge" (A red car). But some short ones (BAGS - Beauty, Age, Goodness, Size) go before: "Une petite voiture".'
    },
    {
        id: 'g3',
        title: 'Negation',
        content: 'To say "not", put "ne" before the verb and "pas" after it. Ex: "Je ne comprends pas" (I do not understand).'
    },
    {
        id: 'g4',
        title: 'Tu vs Vous',
        content: 'Use "Tu" for friends, family, and children. Use "Vous" for strangers, elders, and in professional settings.'
    },
    {
        id: 'g5',
        title: 'The Verb Être (To Be)',
        content: 'Je suis (I am), Tu es (You are), Il est (He is), Nous sommes (We are), Vous êtes (You are), Ils sont (They are).'
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
        xpReward: 10
    },
    {
        id: 'drill_etre_2',
        category: 'verbs',
        tip: 'g5',
        type: 'fill_blank',
        prompt: 'Nous ___ français. (We are French)',
        answer: 'sommes',
        options: ['suis', 'êtes', 'sommes', 'sont'],
        xpReward: 10
    },
    {
        id: 'drill_etre_3',
        category: 'verbs',
        tip: 'g5',
        type: 'fill_blank',
        prompt: 'Ils ___ à Paris. (They are in Paris)',
        answer: 'sont',
        options: ['est', 'sommes', 'êtes', 'sont'],
        xpReward: 10
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
        xpReward: 10
    },
    {
        id: 'drill_article_2',
        category: 'articles',
        tip: 'g1',
        type: 'fill_blank',
        prompt: '___ maison est grande. (The house is big)',
        answer: 'La',
        options: ['Le', 'La', 'Les', 'Une'],
        xpReward: 10
    },
    {
        id: 'drill_article_3',
        category: 'articles',
        tip: 'g1',
        type: 'fill_blank',
        prompt: '___ voiture rouge. (A red car)',
        answer: 'Une',
        options: ['Un', 'Une', 'Le', 'La'],
        xpReward: 10
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
        xpReward: 15
    },
    {
        id: 'drill_neg_2',
        category: 'negation',
        tip: 'g3',
        type: 'translate',
        prompt: 'Translate: "I do not speak French"',
        answer: 'Je ne parle pas français',
        options: ['Je parle pas français', 'Je ne parle pas français', 'Je non parle français', 'Pas je parle français'],
        xpReward: 20
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
        xpReward: 10
    },
    {
        id: 'drill_adj_2',
        category: 'adjectives',
        tip: 'g2',
        type: 'order',
        prompt: 'Put in correct order: "small house"',
        answer: 'petite maison',
        options: ['petite maison', 'maison petite'],
        xpReward: 10
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
        xpReward: 10
    },
    {
        id: 'drill_tu_2',
        category: 'formality',
        tip: 'g4',
        type: 'choice',
        prompt: 'Speaking to your best friend, use:',
        answer: 'Tu',
        options: ['Tu', 'Vous'],
        xpReward: 10
    }
];

export const DRILL_CATEGORIES = {
    verbs: { name: 'Verb Conjugation', icon: '🏃', color: 'indigo' },
    articles: { name: 'Articles & Gender', icon: '📝', color: 'amber' },
    negation: { name: 'Negation', icon: '🚫', color: 'red' },
    adjectives: { name: 'Adjective Placement', icon: '🎨', color: 'emerald' },
    formality: { name: 'Tu vs Vous', icon: '🤝', color: 'purple' }
};
