export const COMMUNITY_XP = {
    firstWritingSubmitted: 100,
    submitWriting: 50,
    firstCorrectionGiven: 100,
    giveCorrection: 25,
    receiveCorrection: 10,
    helpfulVote: 5
};

export const WRITING_PROMPTS = [
    {
        id: 'intro',
        title: 'Introduce Yourself',
        prompt: 'Présentez-vous en français. Parlez de votre nom, votre âge, et vos hobbies.',
        promptEn: 'Introduce yourself. Talk about your name, age, and hobbies.',
        difficulty: 'Beginner',
        minWords: 20,
        maxWords: 100,
        xpReward: 50,
        hints: ['Je m\'appelle...', 'J\'ai ... ans', 'J\'aime...']
    },
    {
        id: 'weekend',
        title: 'My Weekend',
        prompt: 'Qu\'est-ce que vous avez fait ce week-end ? Utilisez le passé composé.',
        promptEn: 'What did you do this weekend? Use the past tense.',
        difficulty: 'Intermediate',
        minWords: 30,
        maxWords: 120,
        xpReward: 75,
        hints: ['Je suis allé(e)...', 'J\'ai vu...', 'C\'était...']
    },
    {
        id: 'dream_vacation',
        title: 'Dream Vacation',
        prompt: 'Décrivez vos vacances idéales. Où iriez-vous et pourquoi ?',
        promptEn: 'Describe your ideal vacation. Where would you go and why?',
        difficulty: 'Beginner',
        minWords: 30,
        maxWords: 100,
        xpReward: 60,
        hints: ['Je voudrais aller...', 'Il fait beau...', 'J\'aime la plage...']
    },
    {
        id: 'opinion_tech',
        title: 'Technology Opinion',
        prompt: 'Pensez-vous que la technologie nous rapproche ou nous éloigne ?',
        promptEn: 'Do you think technology brings us closer or drives us apart?',
        difficulty: 'Advanced',
        minWords: 50,
        maxWords: 200,
        xpReward: 100,
        hints: ['À mon avis...', 'D\'un côté...', 'Cependant...']
    }
];

export const SAMPLE_SUBMISSIONS = [
    {
        id: 'sample_1',
        promptId: 'intro',
        promptTitle: 'Introduce Yourself',
        authorName: 'Hans',
        authorCountry: '🇩🇪',
        authorLevel: 4,
        text: 'Bonjour tous le monde! Je suis Hans et je suis 25 ans. Je suis de Berlin. J\'aime le football et jouer au jeux vidéos. Je apprends le français pour mon travail.',
        submittedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        status: 'pending',
        corrections: []
    },
    {
        id: 'sample_2',
        promptId: 'weekend',
        promptTitle: 'My Weekend',
        authorName: 'Maria',
        authorCountry: '🇪🇸',
        authorLevel: 7,
        text: 'Ce week-end, je suis allé au cinéma avec mes amis. Nous avons regardé un film d\'action. Après, nous avons mangé dans un restaurant italien. La nourriture était très bonne. Dimanche, j\'ai resté chez moi pour me reposer.',
        submittedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        status: 'pending',
        corrections: []
    },
    {
        id: 'sample_3',
        promptId: 'dream_vacation',
        promptTitle: 'Dream Vacation',
        authorName: 'Kenji',
        authorCountry: '🇯🇵',
        authorLevel: 3,
        text: 'Je veux aller à Paris. Je veux voir la Tour Eiffel et manger des croissants. J\'aime beaucoup la culture française. Je voudrais visiter le musée du Louvre aussi.',
        submittedAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
        status: 'pending',
        corrections: []
    }
];
