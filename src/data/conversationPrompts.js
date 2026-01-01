/**
 * Conversation prompts organized by difficulty and topic.
 * Each prompt provides context, goals, and scaffolding for free-form conversation practice.
 */

export const CONVERSATION_PROMPTS = [
    // ==================== BEGINNER ====================
    {
        id: 'intro_basic',
        title: 'Meeting Someone New',
        topic: 'introductions',
        difficulty: 'Beginner',
        icon: '👋',
        xpReward: 40,
        description: 'Practice introducing yourself and asking basic questions.',
        npcId: 'stranger',
        npcName: 'Sophie',
        npcPersonality: 'friendly, patient, encouraging',
        context: 'You meet Sophie at a café in Paris. She seems friendly and wants to chat.',
        goal: 'Exchange names, talk about where you are from, and say goodbye politely.',
        suggestedVocabulary: [
            { french: 'Je m\'appelle...', english: 'My name is...' },
            { french: 'Enchanté(e)', english: 'Nice to meet you' },
            { french: 'Je suis de...', english: 'I am from...' },
            { french: 'Et vous ?', english: 'And you?' },
            { french: 'Au revoir', english: 'Goodbye' },
        ],
        grammarFocus: ['être conjugation', 'subject pronouns'],
        starterMessages: [
            { speaker: 'Sophie', text: 'Bonjour ! Il fait beau aujourd\'hui, non ?' },
        ],
        expectedTopics: ['name', 'origin', 'weather', 'farewell'],
        successCriteria: {
            minTurns: 4,
            requiredTopics: ['name'],
        }
    },
    {
        id: 'cafe_order',
        title: 'Ordering at a Café',
        topic: 'food & drink',
        difficulty: 'Beginner',
        icon: '☕',
        xpReward: 45,
        description: 'Order a drink and possibly food from a café server.',
        npcId: 'barista',
        npcName: 'Marc',
        npcPersonality: 'professional, helpful, slightly rushed',
        context: 'You\'re at a Parisian café and want to order something.',
        goal: 'Successfully order a drink, ask about prices, and pay.',
        suggestedVocabulary: [
            { french: 'Je voudrais...', english: 'I would like...' },
            { french: 'Un café, s\'il vous plaît', english: 'A coffee, please' },
            { french: 'C\'est combien ?', english: 'How much is it?' },
            { french: 'L\'addition, s\'il vous plaît', english: 'The bill, please' },
            { french: 'Merci beaucoup', english: 'Thank you very much' },
        ],
        grammarFocus: ['articles (un, une, du, de la)', 'polite expressions'],
        starterMessages: [
            { speaker: 'Marc', text: 'Bonjour ! Qu\'est-ce que je vous sers ?' },
        ],
        expectedTopics: ['order', 'price', 'payment'],
        successCriteria: {
            minTurns: 3,
            requiredTopics: ['order'],
        }
    },
    {
        id: 'weather_small_talk',
        title: 'Talking About Weather',
        topic: 'small talk',
        difficulty: 'Beginner',
        icon: '🌤️',
        xpReward: 35,
        description: 'Practice casual conversation about the weather.',
        npcId: 'neighbor',
        npcName: 'Jacques',
        npcPersonality: 'chatty, loves weather talk, grandpa energy',
        context: 'Your neighbor Jacques loves talking about the weather.',
        goal: 'Discuss today\'s weather, compare to yesterday, and share preferences.',
        suggestedVocabulary: [
            { french: 'Il fait beau', english: 'It\'s nice out' },
            { french: 'Il pleut', english: 'It\'s raining' },
            { french: 'Il fait chaud/froid', english: 'It\'s hot/cold' },
            { french: 'J\'aime le soleil', english: 'I like the sun' },
            { french: 'Quel temps fait-il ?', english: 'What\'s the weather like?' },
        ],
        grammarFocus: ['il fait + adjective', 'weather expressions'],
        starterMessages: [
            { speaker: 'Jacques', text: 'Ah, le temps ! Il fait un peu frais ce matin, vous ne trouvez pas ?' },
        ],
        expectedTopics: ['current weather', 'preference', 'comparison'],
        successCriteria: {
            minTurns: 4,
            requiredTopics: ['current weather'],
        }
    },

    // ==================== INTERMEDIATE ====================
    {
        id: 'directions_complex',
        title: 'Getting Detailed Directions',
        topic: 'navigation',
        difficulty: 'Intermediate',
        icon: '🗺️',
        xpReward: 65,
        description: 'Ask for and understand detailed directions to a destination.',
        npcId: 'local',
        npcName: 'Camille',
        npcPersonality: 'helpful, detailed, speaks a bit fast',
        context: 'You\'re lost in Lyon and need to find the train station.',
        goal: 'Ask for directions, clarify confusing parts, and confirm you understood.',
        suggestedVocabulary: [
            { french: 'Excusez-moi', english: 'Excuse me' },
            { french: 'Où est...?', english: 'Where is...?' },
            { french: 'Tournez à gauche/droite', english: 'Turn left/right' },
            { french: 'Allez tout droit', english: 'Go straight' },
            { french: 'C\'est loin d\'ici ?', english: 'Is it far from here?' },
            { french: 'Pouvez-vous répéter ?', english: 'Can you repeat?' },
        ],
        grammarFocus: ['imperative mood', 'prepositions of place'],
        starterMessages: [
            { speaker: 'Camille', text: 'Oui, je peux vous aider ?' },
        ],
        expectedTopics: ['destination', 'directions', 'distance', 'confirmation'],
        successCriteria: {
            minTurns: 5,
            requiredTopics: ['destination', 'directions'],
        }
    },
    {
        id: 'restaurant_reservation',
        title: 'Making a Reservation',
        topic: 'services',
        difficulty: 'Intermediate',
        icon: '🍽️',
        xpReward: 70,
        description: 'Call a restaurant to make a dinner reservation.',
        npcId: 'host',
        npcName: 'Isabelle',
        npcPersonality: 'professional, efficient, formal',
        context: 'You\'re calling a restaurant to reserve a table for tonight.',
        goal: 'Reserve a table, specify time and party size, and confirm details.',
        suggestedVocabulary: [
            { french: 'Je voudrais réserver une table', english: 'I would like to reserve a table' },
            { french: 'Pour combien de personnes ?', english: 'For how many people?' },
            { french: 'À quelle heure ?', english: 'At what time?' },
            { french: 'C\'est à quel nom ?', english: 'Under what name?' },
            { french: 'C\'est noté', english: 'It\'s noted' },
        ],
        grammarFocus: ['numbers', 'time expressions', 'formal vous'],
        starterMessages: [
            { speaker: 'Isabelle', text: 'Restaurant Le Petit Bistrot, bonjour !' },
        ],
        expectedTopics: ['reservation', 'party size', 'time', 'name'],
        successCriteria: {
            minTurns: 5,
            requiredTopics: ['reservation', 'time'],
        }
    },
    {
        id: 'shopping_clothes',
        title: 'Shopping for Clothes',
        topic: 'shopping',
        difficulty: 'Intermediate',
        icon: '👔',
        xpReward: 60,
        description: 'Browse and buy clothes at a French boutique.',
        npcId: 'salesperson',
        npcName: 'Léa',
        npcPersonality: 'stylish, helpful, gently pushy',
        context: 'You\'re shopping at a clothing boutique in Nice.',
        goal: 'Ask about sizes, colors, try something on, and make a purchase.',
        suggestedVocabulary: [
            { french: 'Quelle taille ?', english: 'What size?' },
            { french: 'Vous l\'avez en bleu ?', english: 'Do you have it in blue?' },
            { french: 'Je peux l\'essayer ?', english: 'Can I try it on?' },
            { french: 'Ça me va bien', english: 'It fits me well' },
            { french: 'Je le prends', english: 'I\'ll take it' },
        ],
        grammarFocus: ['object pronouns (le, la, les)', 'colors agreement'],
        starterMessages: [
            { speaker: 'Léa', text: 'Bonjour ! Vous cherchez quelque chose en particulier ?' },
        ],
        expectedTopics: ['item', 'size', 'color', 'fitting', 'purchase'],
        successCriteria: {
            minTurns: 6,
            requiredTopics: ['item', 'size'],
        }
    },

    // ==================== ADVANCED ====================
    {
        id: 'job_interview',
        title: 'Job Interview Practice',
        topic: 'professional',
        difficulty: 'Advanced',
        icon: '💼',
        xpReward: 100,
        description: 'Practice answering common job interview questions.',
        npcId: 'interviewer',
        npcName: 'Monsieur Dupont',
        npcPersonality: 'formal, probing, professional',
        context: 'You have a job interview for a position at a French company.',
        goal: 'Answer questions about your experience, skills, and motivation professionally.',
        suggestedVocabulary: [
            { french: 'J\'ai travaillé...', english: 'I worked...' },
            { french: 'Mes compétences incluent...', english: 'My skills include...' },
            { french: 'Je suis motivé(e) par...', english: 'I am motivated by...' },
            { french: 'Mon point fort est...', english: 'My strength is...' },
            { french: 'À l\'avenir, je voudrais...', english: 'In the future, I would like...' },
        ],
        grammarFocus: ['passé composé', 'conditional', 'formal register'],
        starterMessages: [
            { speaker: 'Monsieur Dupont', text: 'Bonjour, asseyez-vous. Alors, parlez-moi de vous.' },
        ],
        expectedTopics: ['experience', 'skills', 'motivation', 'future goals'],
        successCriteria: {
            minTurns: 8,
            requiredTopics: ['experience', 'motivation'],
        }
    },
    {
        id: 'debate_opinion',
        title: 'Expressing Your Opinion',
        topic: 'discussion',
        difficulty: 'Advanced',
        icon: '💬',
        xpReward: 90,
        description: 'Engage in a friendly debate about a topic.',
        npcId: 'friend',
        npcName: 'Antoine',
        npcPersonality: 'intellectual, enjoys debate, respectful',
        context: 'Antoine wants to discuss modern technology and its effects on society.',
        goal: 'Express and defend your opinion while respecting different viewpoints.',
        suggestedVocabulary: [
            { french: 'À mon avis...', english: 'In my opinion...' },
            { french: 'Je pense que...', english: 'I think that...' },
            { french: 'Je ne suis pas d\'accord', english: 'I disagree' },
            { french: 'Tu as raison, mais...', english: 'You\'re right, but...' },
            { french: 'D\'un côté... de l\'autre...', english: 'On one hand... on the other...' },
        ],
        grammarFocus: ['subjunctive mood', 'opinion expressions', 'connectors'],
        starterMessages: [
            { speaker: 'Antoine', text: 'Tu sais, je pense que les téléphones portables ont ruiné la conversation. Qu\'est-ce que tu en penses ?' },
        ],
        expectedTopics: ['opinion', 'agreement', 'disagreement', 'nuance'],
        successCriteria: {
            minTurns: 7,
            requiredTopics: ['opinion'],
        }
    },
    {
        id: 'problem_solving',
        title: 'Solving a Problem',
        topic: 'daily life',
        difficulty: 'Advanced',
        icon: '🔧',
        xpReward: 85,
        description: 'Explain a problem and work through a solution.',
        npcId: 'landlord',
        npcName: 'Madame Moreau',
        npcPersonality: 'business-like, efficient, somewhat impatient',
        context: 'You need to report a problem with your apartment to your landlord.',
        goal: 'Explain the problem clearly, negotiate a solution, and agree on next steps.',
        suggestedVocabulary: [
            { french: 'Il y a un problème avec...', english: 'There is a problem with...' },
            { french: 'Ça ne marche pas', english: 'It doesn\'t work' },
            { french: 'Depuis quand ?', english: 'Since when?' },
            { french: 'Pouvez-vous envoyer quelqu\'un ?', english: 'Can you send someone?' },
            { french: 'C\'est urgent', english: 'It\'s urgent' },
        ],
        grammarFocus: ['depuis + present tense', 'conditional politeness', 'problem vocabulary'],
        starterMessages: [
            { speaker: 'Madame Moreau', text: 'Allô, oui ? C\'est à quel sujet ?' },
        ],
        expectedTopics: ['problem', 'details', 'urgency', 'solution'],
        successCriteria: {
            minTurns: 6,
            requiredTopics: ['problem', 'solution'],
        }
    }
];

/**
 * Get prompts filtered by difficulty
 */
export const getPromptsByDifficulty = (difficulty) => {
    return CONVERSATION_PROMPTS.filter(p => p.difficulty === difficulty);
};

/**
 * Get prompts by topic
 */
export const getPromptsByTopic = (topic) => {
    return CONVERSATION_PROMPTS.filter(p => p.topic === topic);
};

/**
 * Get all unique topics
 */
export const getAllTopics = () => {
    return [...new Set(CONVERSATION_PROMPTS.map(p => p.topic))];
};
