// Native French speaker profiles for language partner matching
export const NATIVE_SPEAKERS = [
    {
        id: 'ns_marie',
        name: 'Marie Dubois',
        avatar: '👩‍🎨',
        country: '🇫🇷',
        city: 'Paris',
        age: 28,
        bio: "Artiste et amoureuse des langues. J'adore aider les apprenants à découvrir le vrai français !",
        bioEn: "Artist and language lover. I love helping learners discover real French!",
        interests: ['art', 'cinema', 'cooking', 'travel'],
        specialties: ['Conversational French', 'Slang & Idioms', 'Culture'],
        learningLanguage: 'English',
        level: 'Native',
        responseStyle: 'friendly',
        typingSpeed: 1500, // ms delay before responding
        isOnline: true,
        lastActive: Date.now() - 1000 * 60 * 5, // 5 mins ago
        responsePatterns: {
            greeting: [
                "Salut ! 😊 Comment ça va aujourd'hui ?",
                "Coucou ! Contente de te parler !",
                "Hey ! Ça fait plaisir de te voir en ligne !"
            ],
            encouragement: [
                "Super ! Tu t'améliores vraiment !",
                "C'est très bien dit ! Bravo !",
                "Tu fais des progrès incroyables !"
            ],
            correction: [
                "Presque parfait ! On dit plutôt : {correction}",
                "Bonne tentative ! En français naturel, on dirait : {correction}",
                "Je te corrige gentiment : {correction} 😊"
            ],
            question: [
                "Qu'est-ce que tu fais aujourd'hui ?",
                "Tu as des plans pour le week-end ?",
                "Quel est ton plat français préféré ?"
            ]
        }
    },
    {
        id: 'ns_lucas',
        name: 'Lucas Martin',
        avatar: '👨‍💻',
        country: '🇫🇷',
        city: 'Lyon',
        age: 32,
        bio: "Développeur web passionné par l'échange linguistique. Je peux t'aider avec le français professionnel !",
        bioEn: "Web developer passionate about language exchange. I can help you with professional French!",
        interests: ['technology', 'gaming', 'sports', 'business'],
        specialties: ['Business French', 'Technical Vocabulary', 'Formal Writing'],
        learningLanguage: 'English',
        level: 'Native',
        responseStyle: 'professional',
        typingSpeed: 2000,
        isOnline: true,
        lastActive: Date.now() - 1000 * 60 * 15,
        responsePatterns: {
            greeting: [
                "Bonjour ! En quoi puis-je t'aider ?",
                "Salut ! Prêt pour une session de français ?",
                "Bonjour ! Comment puis-je t'aider à progresser ?"
            ],
            encouragement: [
                "Excellent travail ! Continue comme ça.",
                "C'est exactement ça, bien joué !",
                "Tu maîtrises bien ce concept."
            ],
            correction: [
                "Petite correction : on utilise '{correction}' dans ce contexte.",
                "Attention, en français formel : {correction}",
                "Pour être plus précis : {correction}"
            ],
            question: [
                "Tu travailles dans quel domaine ?",
                "Tu as déjà visité la France ?",
                "Qu'est-ce qui t'intéresse dans la langue française ?"
            ]
        }
    },
    {
        id: 'ns_camille',
        name: 'Camille Bernard',
        avatar: '👩‍🏫',
        country: '🇧🇪',
        city: 'Bruxelles',
        age: 35,
        bio: "Professeure de FLE à Bruxelles. Patiente et pédagogue, je m'adapte à tous les niveaux !",
        bioEn: "French teacher in Brussels. Patient and educational, I adapt to all levels!",
        interests: ['education', 'literature', 'music', 'travel'],
        specialties: ['Grammar', 'Pronunciation', 'Literature'],
        learningLanguage: 'Dutch',
        level: 'Native',
        responseStyle: 'educational',
        typingSpeed: 1800,
        isOnline: false,
        lastActive: Date.now() - 1000 * 60 * 60 * 2,
        responsePatterns: {
            greeting: [
                "Bonjour ! Tu es prêt(e) pour notre leçon ?",
                "Salut ! On travaille quoi aujourd'hui ?",
                "Coucou ! Qu'est-ce que tu voudrais pratiquer ?"
            ],
            encouragement: [
                "Très bien ! Tu as bien compris la règle.",
                "Parfait ! C'est exactement comme ça qu'on dit.",
                "Excellent ! Tu retiens vite."
            ],
            correction: [
                "Attention à la règle : {correction}. Tu te souviens pourquoi ?",
                "Presque ! La forme correcte est : {correction}",
                "Petite erreur courante : on dit {correction}"
            ],
            question: [
                "Tu connais la différence entre 'savoir' et 'connaître' ?",
                "Comment on conjugue ce verbe au passé composé ?",
                "Tu peux me donner un exemple avec ce mot ?"
            ]
        }
    },
    {
        id: 'ns_antoine',
        name: 'Antoine Leroy',
        avatar: '🧑‍🎤',
        country: '🇨🇦',
        city: 'Montréal',
        age: 24,
        bio: "Musicien québécois ! Je parle le français du Québec avec ses expressions uniques. Icitte on jase !",
        bioEn: "Quebec musician! I speak Quebec French with its unique expressions. Let's chat!",
        interests: ['music', 'hockey', 'nature', 'festivals'],
        specialties: ['Quebec French', 'Casual Conversation', 'Music Vocabulary'],
        learningLanguage: 'Spanish',
        level: 'Native',
        responseStyle: 'casual',
        typingSpeed: 1200,
        isOnline: true,
        lastActive: Date.now() - 1000 * 60 * 2,
        responsePatterns: {
            greeting: [
                "Salut mon chum ! Ça va-tu bien ?",
                "Hey ! Content de te jaser !",
                "Allô ! Comment ça va toi ?"
            ],
            encouragement: [
                "Ayoye, t'es bon en tabarnouche !",
                "C'est ben correct ça !",
                "T'es vraiment hot !"
            ],
            correction: [
                "Icitte on dit : {correction}, c'est plus naturel !",
                "Pas pire ! Mais essaie : {correction}",
                "Au Québec, on dirait : {correction}"
            ],
            question: [
                "Tu connais-tu la poutine ?",
                "T'as-tu déjà entendu du Québec français ?",
                "C'est quoi ton band préféré ?"
            ]
        }
    },
    {
        id: 'ns_sophie',
        name: 'Sophie Moreau',
        avatar: '👩‍⚕️',
        country: '🇨🇭',
        city: 'Genève',
        age: 40,
        bio: "Médecin à Genève. Je peux t'aider avec le vocabulaire médical et scientifique en français.",
        bioEn: "Doctor in Geneva. I can help you with medical and scientific vocabulary in French.",
        interests: ['medicine', 'science', 'hiking', 'cooking'],
        specialties: ['Medical French', 'Scientific Vocabulary', 'Formal Register'],
        learningLanguage: 'German',
        level: 'Native',
        responseStyle: 'precise',
        typingSpeed: 2200,
        isOnline: false,
        lastActive: Date.now() - 1000 * 60 * 60 * 8,
        responsePatterns: {
            greeting: [
                "Bonjour ! Comment allez-vous aujourd'hui ?",
                "Bonjour ! Que souhaitez-vous apprendre ?",
                "Salut ! Prêt(e) pour enrichir votre vocabulaire ?"
            ],
            encouragement: [
                "Très bien formulé, c'est précis.",
                "Excellent usage du terme technique.",
                "Votre français est de plus en plus précis."
            ],
            correction: [
                "Le terme exact serait : {correction}",
                "En langage médical, on dit : {correction}",
                "Pour être précis : {correction}"
            ],
            question: [
                "Connaissez-vous les termes anatomiques en français ?",
                "Quel domaine scientifique vous intéresse ?",
                "Avez-vous besoin de vocabulaire spécialisé ?"
            ]
        }
    }
];

// Response generation helpers
export const generateResponse = (speaker, userMessage) => {
    const patterns = speaker.responsePatterns;
    const lowerMsg = userMessage.toLowerCase();

    // Detect message intent
    if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        return randomChoice(patterns.greeting);
    }

    // Check for common errors and provide corrections
    const corrections = detectErrors(userMessage);
    if (corrections.length > 0) {
        const correctionTemplate = randomChoice(patterns.correction);
        return correctionTemplate.replace('{correction}', corrections[0].suggestion);
    }

    // Ask a follow-up question sometimes
    if (Math.random() > 0.6) {
        return randomChoice(patterns.question);
    }

    // Default to encouragement
    return randomChoice(patterns.encouragement);
};

export const detectErrors = (text) => {
    const errors = [];

    // Common French errors to detect
    const errorPatterns = [
        { pattern: /je suis (\d+) ans/i, suggestion: "j'ai $1 ans", explanation: "On utilise 'avoir' pour l'âge, pas 'être'" },
        { pattern: /je suis froid/i, suggestion: "j'ai froid", explanation: "On utilise 'avoir froid', pas 'être froid'" },
        { pattern: /je suis faim/i, suggestion: "j'ai faim", explanation: "On utilise 'avoir faim', pas 'être faim'" },
        { pattern: /je suis besoin/i, suggestion: "j'ai besoin", explanation: "On utilise 'avoir besoin', pas 'être besoin'" },
        { pattern: /c'est bon\?$/i, suggestion: "C'est bien ?", explanation: "'C'est bon' pour la nourriture, 'C'est bien' pour demander confirmation" },
        { pattern: /je connais comment/i, suggestion: "je sais comment", explanation: "'Savoir' pour les compétences, 'connaître' pour les personnes/lieux" },
        { pattern: /je pense que oui/i, suggestion: "je crois que oui", explanation: "Plus naturel avec 'croire' dans ce contexte" }
    ];

    for (const { pattern, suggestion, explanation } of errorPatterns) {
        if (pattern.test(text)) {
            errors.push({
                original: text.match(pattern)[0],
                suggestion: text.replace(pattern, suggestion),
                explanation
            });
        }
    }

    return errors;
};

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Conversation starters for different topics
export const CONVERSATION_STARTERS = {
    casual: [
        "Salut ! Tu fais quoi de beau aujourd'hui ?",
        "Hey ! Ça va ? Quoi de neuf ?",
        "Coucou ! Tu as passé une bonne journée ?"
    ],
    travel: [
        "Tu as déjà visité la France ?",
        "Quelle ville française voudrais-tu visiter ?",
        "Tu préfères la mer ou la montagne ?"
    ],
    culture: [
        "Tu regardes des films français ?",
        "Tu connais des chanteurs français ?",
        "Qu'est-ce que tu aimes dans la culture française ?"
    ],
    food: [
        "Tu as goûté des plats français ?",
        "Tu sais cuisiner français ?",
        "C'est quoi ton plat français préféré ?"
    ]
};

export default NATIVE_SPEAKERS;
