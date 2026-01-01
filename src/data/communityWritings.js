// Writing prompts and sample community submissions for correction practice

export const WRITING_PROMPTS = [
    {
        id: 'wp_introduce',
        title: 'Présentez-vous',
        titleEn: 'Introduce Yourself',
        difficulty: 'Beginner',
        prompt: "Écrivez quelques phrases pour vous présenter : votre nom, votre âge, où vous habitez, et ce que vous aimez faire.",
        promptEn: "Write a few sentences to introduce yourself: your name, age, where you live, and what you like to do.",
        minWords: 30,
        maxWords: 100,
        xpReward: 25,
        hints: [
            "Je m'appelle...",
            "J'ai ... ans",
            "J'habite à...",
            "J'aime..."
        ],
        exampleAnswer: "Bonjour ! Je m'appelle Sophie. J'ai vingt-cinq ans et j'habite à New York. J'aime beaucoup lire et voyager. Le week-end, je fais du vélo dans le parc. J'apprends le français parce que je veux visiter Paris un jour !"
    },
    {
        id: 'wp_daily_routine',
        title: 'Ma journée typique',
        titleEn: 'My Typical Day',
        difficulty: 'Beginner',
        prompt: "Décrivez votre journée typique du matin au soir. Qu'est-ce que vous faites ?",
        promptEn: "Describe your typical day from morning to evening. What do you do?",
        minWords: 50,
        maxWords: 150,
        xpReward: 35,
        hints: [
            "Le matin, je...",
            "À midi, je...",
            "L'après-midi, je...",
            "Le soir, je..."
        ],
        exampleAnswer: "Le matin, je me réveille à sept heures. Je prends mon petit-déjeuner et je me prépare pour le travail. À midi, je déjeune avec mes collègues. L'après-midi, je travaille jusqu'à six heures. Le soir, je rentre chez moi, je fais du sport et je prépare le dîner."
    },
    {
        id: 'wp_weekend',
        title: 'Mon week-end idéal',
        titleEn: 'My Ideal Weekend',
        difficulty: 'Intermediate',
        prompt: "Décrivez votre week-end idéal. Où iriez-vous ? Avec qui ? Que feriez-vous ?",
        promptEn: "Describe your ideal weekend. Where would you go? With whom? What would you do?",
        minWords: 60,
        maxWords: 200,
        xpReward: 50,
        hints: [
            "J'irais...",
            "Je ferais...",
            "Je voudrais...",
            "Ce serait..."
        ],
        exampleAnswer: "Mon week-end idéal commencerait par une grasse matinée. J'irais bruncher dans un café avec mes amis. L'après-midi, je me promènerais dans un parc ou j'irais au musée. Le soir, je dînerais dans un bon restaurant et j'irais au cinéma. Le dimanche, je passerais la journée à la campagne pour me détendre."
    },
    {
        id: 'wp_vacation',
        title: 'Mes dernières vacances',
        titleEn: 'My Last Vacation',
        difficulty: 'Intermediate',
        prompt: "Racontez vos dernières vacances. Où êtes-vous allé(e) ? Qu'avez-vous fait ? Qu'avez-vous aimé ?",
        promptEn: "Tell about your last vacation. Where did you go? What did you do? What did you enjoy?",
        minWords: 80,
        maxWords: 250,
        xpReward: 60,
        hints: [
            "Je suis allé(e) à...",
            "J'ai visité...",
            "J'ai mangé...",
            "C'était..."
        ],
        exampleAnswer: "L'été dernier, je suis allé en Italie avec ma famille. Nous avons visité Rome, Florence et Venise. J'ai adoré voir le Colisée et la chapelle Sixtine. La nourriture était délicieuse - j'ai mangé beaucoup de pâtes et de gelato ! C'était un voyage inoubliable et j'espère y retourner bientôt."
    },
    {
        id: 'wp_opinion',
        title: 'Mon avis sur...',
        titleEn: 'My Opinion On...',
        difficulty: 'Advanced',
        prompt: "Donnez votre opinion sur l'apprentissage des langues. Pourquoi est-ce important ? Quels sont les défis ?",
        promptEn: "Give your opinion on language learning. Why is it important? What are the challenges?",
        minWords: 100,
        maxWords: 300,
        xpReward: 75,
        hints: [
            "Je pense que...",
            "À mon avis...",
            "D'un côté... de l'autre côté...",
            "En conclusion..."
        ],
        exampleAnswer: "À mon avis, l'apprentissage des langues est extrêmement important dans notre monde globalisé. D'abord, cela nous permet de communiquer avec plus de personnes et de comprendre différentes cultures. Ensuite, c'est bénéfique pour notre cerveau. Cependant, il y a des défis : il faut de la patience, de la pratique régulière, et parfois on se sent découragé. En conclusion, malgré les difficultés, les avantages dépassent largement les inconvénients."
    },
    {
        id: 'wp_letter',
        title: 'Une lettre à un ami',
        titleEn: 'A Letter to a Friend',
        difficulty: 'Advanced',
        prompt: "Écrivez une lettre informelle à un ami français pour l'inviter à vous rendre visite dans votre ville.",
        promptEn: "Write an informal letter to a French friend inviting them to visit you in your city.",
        minWords: 120,
        maxWords: 350,
        xpReward: 85,
        hints: [
            "Cher/Chère...",
            "Comment vas-tu ?",
            "Je t'écris pour...",
            "J'espère te voir bientôt !"
        ],
        exampleAnswer: "Cher Pierre,\n\nComment vas-tu ? Ça fait longtemps qu'on ne s'est pas parlé ! Je t'écris pour t'inviter à me rendre visite cet été. Ma ville est magnifique en juillet et il y a plein de choses à faire.\n\nOn pourrait visiter les musées, aller à la plage et goûter la cuisine locale. Je te ferais découvrir mes restaurants préférés ! Tu pourrais rester chez moi, j'ai une chambre d'amis.\n\nDis-moi si tu es disponible et on organise tout ça !\n\nGros bisous,\nMarie"
    }
];

// Sample community submissions for correction practice
export const SAMPLE_SUBMISSIONS = [
    {
        id: 'sub_001',
        promptId: 'wp_introduce',
        authorName: 'Alex_learner',
        authorLevel: 3,
        authorCountry: '🇺🇸',
        submittedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        text: "Bonjour! Je m'apple Marie. Je suis 25 ans et je habite en New York. J'aime lire les livres et faire du sport. Je veux apprendre le français parce que c'est une belle langue.",
        status: 'pending',
        corrections: []
    },
    {
        id: 'sub_002',
        promptId: 'wp_daily_routine',
        authorName: 'FrenchFan92',
        authorLevel: 5,
        authorCountry: '🇬🇧',
        submittedAt: Date.now() - 1000 * 60 * 60 * 5,
        text: "Le matin je reveille à sept heures. Je prend mon petit déjeuner - habituelement je mange des céréales. Après, je vais au travail en metro. Je travaille comme un ingénieur. Le soir, je regard la télévision.",
        status: 'pending',
        corrections: []
    },
    {
        id: 'sub_003',
        promptId: 'wp_weekend',
        authorName: 'ParisLover',
        authorLevel: 7,
        authorCountry: '🇯🇵',
        submittedAt: Date.now() - 1000 * 60 * 60 * 8,
        text: "Mon week-end idéal serait à Paris. Je voudrais visiter la Tour Eiffel et promener sur les Champs-Élysées. J'irais dans les cafés pour boire le café et manger les croissants. C'est mon rêve de voir Paris un jour!",
        status: 'corrected',
        corrections: [
            {
                correctorId: 'ns_marie',
                correctorName: 'Marie Dubois',
                submittedAt: Date.now() - 1000 * 60 * 60 * 4,
                items: [
                    {
                        start: 72,
                        end: 81,
                        original: 'promener',
                        correction: 'me promener',
                        explanation: "Le verbe 'se promener' est pronominal - on dit 'je me promène'"
                    },
                    {
                        start: 121,
                        end: 131,
                        original: 'boire le café',
                        correction: 'boire du café',
                        explanation: "On utilise l'article partitif 'du' pour une quantité indéfinie"
                    }
                ],
                overallComment: "Très bon travail ! Ton français est naturel et agréable à lire. Quelques petites erreurs de grammaire mais rien de grave. Continue comme ça ! 🌟",
                rating: 4
            }
        ]
    },
    {
        id: 'sub_004',
        promptId: 'wp_vacation',
        authorName: 'TravelBug',
        authorLevel: 6,
        authorCountry: '🇧🇷',
        submittedAt: Date.now() - 1000 * 60 * 60 * 12,
        text: "L'année dernière, j'ai allé en France pour la première fois. J'ai visité Paris et Nice. La nourriture était incroyable - j'ai mangé beaucoup de fromage et bu du vin. Les gens étaient très gentil. J'ai pris beaucoup des photos. C'était le meilleur voyage de ma vie!",
        status: 'pending',
        corrections: []
    }
];

// Pre-made correction suggestions for common errors
export const CORRECTION_SUGGESTIONS = {
    // Verb errors
    "je suis ans": {
        correction: "j'ai ... ans",
        explanation: "On utilise 'avoir' pour exprimer l'âge en français, pas 'être'"
    },
    "j'ai allé": {
        correction: "je suis allé(e)",
        explanation: "Le verbe 'aller' utilise l'auxiliaire 'être' au passé composé"
    },
    "je reveille": {
        correction: "je me réveille",
        explanation: "Se réveiller est un verbe pronominal - n'oubliez pas le pronom réfléchi"
    },

    // Article errors
    "boire le café": {
        correction: "boire du café",
        explanation: "Utilisez l'article partitif 'du' pour une quantité indéfinie"
    },
    "manger les croissants": {
        correction: "manger des croissants",
        explanation: "Utilisez 'des' pour le pluriel indéfini"
    },
    "beaucoup des": {
        correction: "beaucoup de",
        explanation: "Après 'beaucoup', on utilise 'de' sans article"
    },

    // Gender/Agreement
    "très gentil": {
        correction: "très gentils",
        explanation: "L'adjectif doit s'accorder en nombre avec le nom (pluriel)"
    },

    // Preposition errors
    "je habite en": {
        correction: "j'habite à",
        explanation: "On utilise 'à' devant les noms de villes, 'en' devant les pays féminins"
    },
    "comme un ingénieur": {
        correction: "comme ingénieur",
        explanation: "Pas d'article après 'comme' quand il exprime une profession"
    }
};

// XP rewards for community actions
export const COMMUNITY_XP = {
    submitWriting: 15,
    receiveCorrection: 10,
    giveCorrection: 25,
    helpfulCorrection: 10, // Bonus for corrections marked helpful
    firstCorrectionGiven: 50, // Bonus for first correction
    firstWritingSubmitted: 30 // Bonus for first writing
};

export default { WRITING_PROMPTS, SAMPLE_SUBMISSIONS, CORRECTION_SUGGESTIONS, COMMUNITY_XP };
