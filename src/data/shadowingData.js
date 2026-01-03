export const SHADOWING_PHRASES = [
    {
        id: 's1',
        category: 'Greetings',
        french: "Bonjour, comment allez-vous aujourd'hui ?",
        english: "Hello, how are you today?",
        difficulty: 'A1',
        audioSlow: null, // To be filled if we had real URLs
        audioNormal: null
    },
    {
        id: 's2',
        category: 'Travel',
        french: "Je voudrais un billet pour Paris, s'il vous plaît.",
        english: "I would like a ticket to Paris, please.",
        difficulty: 'A2',
        audioNormal: null
    },
    {
        id: 's3',
        category: 'Restaurant',
        french: "L'addition, s'il vous plaît.",
        english: "The check, please.",
        difficulty: 'A1',
        audioNormal: null
    },
    {
        id: 's4',
        category: 'Daily Life',
        french: "Il fait très beau ce matin, n'est-ce pas ?",
        english: "It's very beautiful this morning, isn't it?",
        difficulty: 'A2',
        audioNormal: null
    },
    {
        id: 's5',
        category: 'Opinion',
        french: "À mon avis, c'est une excellente idée.",
        english: "In my opinion, it's an excellent idea.",
        difficulty: 'B1',
        audioNormal: null
    },
    {
        id: 's6',
        category: 'Business',
        french: "Nous devons discuter des chiffres du trimestre.",
        english: "We need to discuss the quarterly figures.",
        difficulty: 'B2',
        audioNormal: null
    },
    {
        id: 's7',
        category: 'Casual',
        french: "Ça te dit d'aller prendre un café après ?",
        english: "Are you up for grabbing a coffee after?",
        difficulty: 'A2',
        audioNormal: null
    },
    {
        id: 's8',
        category: 'Formal',
        french: "Je vous prie d'agréer, Monsieur, l'expression de mes sentiments distingués.",
        english: "Please accept, Sir, the expression of my distinguished feelings.",
        difficulty: 'C1',
        audioNormal: null
    },
    {
        id: 's9',
        category: 'Travel',
        french: "Où se trouve la banque la plus proche d'ici ?",
        english: "Where is the nearest bank from here?",
        difficulty: 'A1',
        audioNormal: null
    },
    {
        id: 's10',
        category: 'Daily Life',
        french: "Je vais faire les courses, tu as besoin de quelque chose ?",
        english: "I'm going grocery shopping, do you need anything?",
        difficulty: 'A2',
        audioNormal: null
    },
    {
        id: 's11',
        category: 'Travel',
        french: "À quelle heure part le prochain train pour Lyon ?",
        english: "What time does the next train to Lyon leave?",
        difficulty: 'A2',
        audioNormal: null
    },
    {
        id: 's12',
        category: 'Food',
        french: "C'est délicieux, quel est l'ingrédient secret ?",
        english: "It's delicious, what is the secret ingredient?",
        difficulty: 'B1',
        audioNormal: null
    },
    {
        id: 's13',
        category: 'Work',
        french: "Désolé, j'ai une réunion importante à quatorze heures.",
        english: "Sorry, I have an important meeting at 2 PM.",
        difficulty: 'B1',
        audioNormal: null
    },
    {
        id: 's14',
        category: 'Casual',
        french: "On se capte plus tard pour en discuter ?",
        english: "Shall we catch up later to discuss it?",
        difficulty: 'B2',
        audioNormal: null
    },
    {
        id: 's15',
        category: 'Culture',
        french: "La France est célèbre pour sa gastronomie et son vin.",
        english: "France is famous for its gastronomy and its wine.",
        difficulty: 'A1',
        audioNormal: null
    }
];

export const getShadowingSession = (count = 3) => {
    return SHADOWING_PHRASES.sort(() => Math.random() - 0.5).slice(0, count);
};
