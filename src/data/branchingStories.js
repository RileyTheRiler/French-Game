/**
 * Branching Stories Data
 * Visual novel-style narratives with multiple endings, embedded quizzes,
 * and voice acting support (audio placeholders for now).
 */

export const BRANCHING_STORIES = [
    {
        id: 'cafe_mystery',
        title: "Le Mystère du Café",
        description: "A mysterious letter arrives at your favorite Parisian café. Your choices will determine the outcome of this intriguing tale.",
        level: 2,
        estimatedTime: '15 min',
        coverColor: 'from-amber-500 to-orange-600',
        voiceActed: true,
        totalEndings: 3,
        nodes: {
            start: {
                id: 'start',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "êtes", translation: "are" },
                    { word: "assis", translation: "seated" },
                    { word: "dans", translation: "in" },
                    { word: "votre", translation: "your" },
                    { word: "café", translation: "café" },
                    { word: "préféré", translation: "favorite" },
                    { word: ".", translation: "" },
                    { word: "Le", translation: "The" },
                    { word: "serveur", translation: "waiter" },
                    { word: "vous", translation: "to you" },
                    { word: "apporte", translation: "brings" },
                    { word: "une", translation: "a" },
                    { word: "lettre", translation: "letter" },
                    { word: "mystérieuse", translation: "mysterious" },
                    { word: ".", translation: "" }
                ],
                audio: null, // Placeholder for voice acting
                background: 'cafe',
                choices: [
                    { text: "Ouvrir la lettre immédiatement", textEn: "Open the letter immediately", nextNode: 'open_letter' },
                    { text: "Demander au serveur d'où elle vient", textEn: "Ask the waiter where it came from", nextNode: 'ask_waiter' }
                ]
            },
            open_letter: {
                id: 'open_letter',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "La", translation: "The" },
                    { word: "lettre", translation: "letter" },
                    { word: "est", translation: "is" },
                    { word: "écrite", translation: "written" },
                    { word: "à", translation: "by" },
                    { word: "la", translation: "" },
                    { word: "main", translation: "hand" },
                    { word: ":", translation: "" },
                    { word: '"', translation: "" },
                    { word: "Retrouvez-moi", translation: "Meet me" },
                    { word: "au", translation: "at the" },
                    { word: "jardin", translation: "garden" },
                    { word: "du", translation: "of the" },
                    { word: "Luxembourg", translation: "Luxembourg" },
                    { word: "à", translation: "at" },
                    { word: "midi", translation: "noon" },
                    { word: ".", translation: "" },
                    { word: "C'est", translation: "It's" },
                    { word: "urgent", translation: "urgent" },
                    { word: ".", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'letter',
                choices: [
                    { text: "Aller au jardin du Luxembourg", textEn: "Go to the Luxembourg Garden", nextNode: 'go_garden' },
                    { text: "Ignorer la lettre et rester au café", textEn: "Ignore the letter and stay at the café", nextNode: 'ignore_letter' }
                ]
            },
            ask_waiter: {
                id: 'ask_waiter',
                type: 'narrative',
                speaker: 'Serveur',
                content: [
                    { word: '"', translation: "" },
                    { word: "Un", translation: "A" },
                    { word: "homme", translation: "man" },
                    { word: "mystérieux", translation: "mysterious" },
                    { word: "l'a", translation: "left it" },
                    { word: "laissée", translation: "" },
                    { word: "pour", translation: "for" },
                    { word: "vous", translation: "you" },
                    { word: ".", translation: "" },
                    { word: "Il", translation: "He" },
                    { word: "portait", translation: "was wearing" },
                    { word: "un", translation: "a" },
                    { word: "chapeau", translation: "hat" },
                    { word: "noir", translation: "black" },
                    { word: ".", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'cafe',
                choices: [
                    { text: "Ouvrir la lettre maintenant", textEn: "Open the letter now", nextNode: 'open_letter' },
                    { text: "Remercier et garder la lettre pour plus tard", textEn: "Thank him and save the letter for later", nextNode: 'quiz_patience' }
                ]
            },
            quiz_patience: {
                id: 'quiz_patience',
                type: 'quiz',
                question: "Comment dit-on 'Thank you' en français?",
                questionEn: "How do you say 'Thank you' in French?",
                options: ["S'il vous plaît", "Merci", "De rien", "Pardon"],
                correctAnswer: "Merci",
                feedback: {
                    correct: "Parfait! 'Merci' est la bonne réponse!",
                    incorrect: "Essayez encore. 'Merci' signifie 'Thank you'."
                },
                onCorrect: 'keep_letter',
                xpBonus: 10
            },
            keep_letter: {
                id: 'keep_letter',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "glissez", translation: "slip" },
                    { word: "la", translation: "the" },
                    { word: "lettre", translation: "letter" },
                    { word: "dans", translation: "into" },
                    { word: "votre", translation: "your" },
                    { word: "poche", translation: "pocket" },
                    { word: ".", translation: "" },
                    { word: "Plus", translation: "Later" },
                    { word: "tard", translation: "" },
                    { word: ",", translation: "" },
                    { word: "vous", translation: "you" },
                    { word: "la", translation: "it" },
                    { word: "lisez", translation: "read" },
                    { word: "chez", translation: "at" },
                    { word: "vous", translation: "home" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'home',
                choices: [
                    { text: "Aller au rendez-vous demain", textEn: "Go to the meeting tomorrow", nextNode: 'go_garden_late' },
                    { text: "Oublier cette histoire étrange", textEn: "Forget this strange story", nextNode: 'ending_mystery' }
                ]
            },
            go_garden: {
                id: 'go_garden',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Au", translation: "At the" },
                    { word: "jardin", translation: "garden" },
                    { word: ",", translation: "" },
                    { word: "une", translation: "a" },
                    { word: "femme", translation: "woman" },
                    { word: "élégante", translation: "elegant" },
                    { word: "vous", translation: "you" },
                    { word: "attend", translation: "awaits" },
                    { word: ".", translation: "" },
                    { word: "Elle", translation: "She" },
                    { word: "sourit", translation: "smiles" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'garden',
                choices: [
                    { text: "Lui parler", textEn: "Talk to her", nextNode: 'talk_woman' },
                    { text: "Attendre qu'elle parle d'abord", textEn: "Wait for her to speak first", nextNode: 'wait_woman' }
                ]
            },
            go_garden_late: {
                id: 'go_garden_late',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "arrivez", translation: "arrive" },
                    { word: "au", translation: "at the" },
                    { word: "jardin", translation: "garden" },
                    { word: ",", translation: "" },
                    { word: "mais", translation: "but" },
                    { word: "personne", translation: "nobody" },
                    { word: "n'est", translation: "is" },
                    { word: "là", translation: "there" },
                    { word: ".", translation: "" },
                    { word: "Sur", translation: "On" },
                    { word: "un", translation: "a" },
                    { word: "banc", translation: "bench" },
                    { word: ",", translation: "" },
                    { word: "une", translation: "a" },
                    { word: "autre", translation: "other" },
                    { word: "lettre", translation: "letter" },
                    { word: "vous", translation: "for you" },
                    { word: "attend", translation: "awaits" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'garden_empty',
                choices: [
                    { text: "Lire la deuxième lettre", textEn: "Read the second letter", nextNode: 'second_letter' }
                ]
            },
            second_letter: {
                id: 'second_letter',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: '"', translation: "" },
                    { word: "Dommage", translation: "Too bad" },
                    { word: ",", translation: "" },
                    { word: "vous", translation: "you" },
                    { word: "êtes", translation: "are" },
                    { word: "en", translation: "" },
                    { word: "retard", translation: "late" },
                    { word: ".", translation: "" },
                    { word: "Une", translation: "Another" },
                    { word: "autre", translation: "" },
                    { word: "fois", translation: "time" },
                    { word: "peut-être", translation: "perhaps" },
                    { word: ".", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'letter',
                choices: [
                    { text: "Continuer", textEn: "Continue", nextNode: 'ending_missed' }
                ]
            },
            talk_woman: {
                id: 'talk_woman',
                type: 'quiz',
                question: "Comment commencer une conversation poliment?",
                questionEn: "How to start a conversation politely?",
                options: ["Hé!", "Bonjour, madame", "Quoi?", "Toi!"],
                correctAnswer: "Bonjour, madame",
                feedback: {
                    correct: "Excellent! C'est très poli!",
                    incorrect: "'Bonjour, madame' est la façon polie de commencer."
                },
                onCorrect: 'woman_reveals',
                xpBonus: 15
            },
            wait_woman: {
                id: 'wait_woman',
                type: 'narrative',
                speaker: 'Femme',
                content: [
                    { word: '"', translation: "" },
                    { word: "Vous", translation: "You" },
                    { word: "êtes", translation: "are" },
                    { word: "prudent", translation: "careful" },
                    { word: ".", translation: "" },
                    { word: "C'est", translation: "That's" },
                    { word: "bien", translation: "good" },
                    { word: ".", translation: "" },
                    { word: "Je", translation: "I" },
                    { word: "suis", translation: "am" },
                    { word: "Marie", translation: "Marie" },
                    { word: ".", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'garden',
                choices: [
                    { text: "Écouter son histoire", textEn: "Listen to her story", nextNode: 'woman_reveals' }
                ]
            },
            woman_reveals: {
                id: 'woman_reveals',
                type: 'narrative',
                speaker: 'Marie',
                content: [
                    { word: '"', translation: "" },
                    { word: "Je", translation: "I" },
                    { word: "cherchais", translation: "was looking for" },
                    { word: "quelqu'un", translation: "someone" },
                    { word: "pour", translation: "to" },
                    { word: "m'aider", translation: "help me" },
                    { word: ".", translation: "" },
                    { word: "Mon", translation: "My" },
                    { word: "grand-père", translation: "grandfather" },
                    { word: "a", translation: "has" },
                    { word: "caché", translation: "hidden" },
                    { word: "un", translation: "a" },
                    { word: "trésor", translation: "treasure" },
                    { word: "dans", translation: "in" },
                    { word: "Paris", translation: "Paris" },
                    { word: ".", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'garden',
                choices: [
                    { text: "Accepter d'aider Marie", textEn: "Agree to help Marie", nextNode: 'ending_adventure' },
                    { text: "Poliment refuser", textEn: "Politely decline", nextNode: 'ending_safe' }
                ]
            },
            ignore_letter: {
                id: 'ignore_letter',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "décidez", translation: "decide" },
                    { word: "d'ignorer", translation: "to ignore" },
                    { word: "la", translation: "the" },
                    { word: "lettre", translation: "letter" },
                    { word: ".", translation: "" },
                    { word: "La", translation: "" },
                    { word: "vie", translation: "Life" },
                    { word: "continue", translation: "continues" },
                    { word: "normalement", translation: "normally" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'cafe',
                choices: [
                    { text: "Continuer", textEn: "Continue", nextNode: 'ending_mystery' }
                ]
            },
            // Endings
            ending_adventure: {
                id: 'ending_adventure',
                type: 'ending',
                title: "L'Aventurier",
                titleEn: "The Adventurer",
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "et", translation: "and" },
                    { word: "Marie", translation: "Marie" },
                    { word: "partez", translation: "leave" },
                    { word: "ensemble", translation: "together" },
                    { word: "à", translation: "on" },
                    { word: "la", translation: "the" },
                    { word: "recherche", translation: "search" },
                    { word: "du", translation: "for the" },
                    { word: "trésor", translation: "treasure" },
                    { word: ".", translation: "" },
                    { word: "Une", translation: "A" },
                    { word: "grande", translation: "great" },
                    { word: "aventure", translation: "adventure" },
                    { word: "commence", translation: "begins" },
                    { word: "!", translation: "" }
                ],
                endingType: 'good',
                xpReward: 100,
                achievement: 'story_adventurer'
            },
            ending_safe: {
                id: 'ending_safe',
                type: 'ending',
                title: "Le Prudent",
                titleEn: "The Careful One",
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "refusez", translation: "refuse" },
                    { word: "poliment", translation: "politely" },
                    { word: ".", translation: "" },
                    { word: "Marie", translation: "Marie" },
                    { word: "comprend", translation: "understands" },
                    { word: ".", translation: "" },
                    { word: "Vous", translation: "You" },
                    { word: "retournez", translation: "return" },
                    { word: "à", translation: "to" },
                    { word: "votre", translation: "your" },
                    { word: "vie", translation: "life" },
                    { word: "tranquille", translation: "quiet" },
                    { word: ".", translation: "" }
                ],
                endingType: 'neutral',
                xpReward: 75,
                achievement: 'story_prudent'
            },
            ending_mystery: {
                id: 'ending_mystery',
                type: 'ending',
                title: "Le Mystère Reste",
                titleEn: "The Mystery Remains",
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "ne", translation: "never" },
                    { word: "saurez", translation: "will know" },
                    { word: "jamais", translation: "" },
                    { word: "ce", translation: "what" },
                    { word: "qu'il", translation: "was in" },
                    { word: "y", translation: "" },
                    { word: "avait", translation: "" },
                    { word: "dans", translation: "" },
                    { word: "cette", translation: "that" },
                    { word: "lettre", translation: "letter" },
                    { word: ".", translation: "" },
                    { word: "Parfois", translation: "Sometimes" },
                    { word: ",", translation: "" },
                    { word: "vous", translation: "you" },
                    { word: "y", translation: "about it" },
                    { word: "pensez", translation: "think" },
                    { word: "...", translation: "" }
                ],
                endingType: 'mystery',
                xpReward: 50,
                achievement: 'story_mystery'
            },
            ending_missed: {
                id: 'ending_missed',
                type: 'ending',
                title: "Occasion Manquée",
                titleEn: "Missed Opportunity",
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "avez", translation: "have" },
                    { word: "manqué", translation: "missed" },
                    { word: "votre", translation: "your" },
                    { word: "chance", translation: "chance" },
                    { word: ".", translation: "" },
                    { word: "Qui", translation: "Who" },
                    { word: "était", translation: "was" },
                    { word: "cette", translation: "this" },
                    { word: "personne", translation: "person" },
                    { word: "?", translation: "" },
                    { word: "Le", translation: "The" },
                    { word: "mystère", translation: "mystery" },
                    { word: "reste", translation: "remains" },
                    { word: "entier", translation: "complete" },
                    { word: ".", translation: "" }
                ],
                endingType: 'neutral',
                xpReward: 60,
                achievement: 'story_late'
            }
        },
        startNode: 'start'
    },
    {
        id: 'market_adventure',
        title: "Au Marché de Provence",
        description: "Explore the colorful markets of Provence and make choices that lead to delicious discoveries or amusing misunderstandings.",
        level: 1,
        estimatedTime: '10 min',
        coverColor: 'from-emerald-500 to-teal-600',
        voiceActed: false,
        totalEndings: 2,
        nodes: {
            start: {
                id: 'start',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "C'est", translation: "It's" },
                    { word: "samedi", translation: "Saturday" },
                    { word: "matin", translation: "morning" },
                    { word: ".", translation: "" },
                    { word: "Le", translation: "The" },
                    { word: "marché", translation: "market" },
                    { word: "de", translation: "of" },
                    { word: "Provence", translation: "Provence" },
                    { word: "est", translation: "is" },
                    { word: "plein", translation: "full" },
                    { word: "de", translation: "of" },
                    { word: "couleurs", translation: "colors" },
                    { word: "et", translation: "and" },
                    { word: "de", translation: "of" },
                    { word: "parfums", translation: "scents" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'market',
                choices: [
                    { text: "Aller au stand de fromages", textEn: "Go to the cheese stand", nextNode: 'cheese_stand' },
                    { text: "Explorer les fruits et légumes", textEn: "Explore the fruits and vegetables", nextNode: 'fruit_stand' }
                ]
            },
            cheese_stand: {
                id: 'cheese_stand',
                type: 'narrative',
                speaker: 'Vendeur',
                content: [
                    { word: '"', translation: "" },
                    { word: "Bonjour", translation: "Hello" },
                    { word: "!", translation: "" },
                    { word: "Voulez-vous", translation: "Would you like" },
                    { word: "goûter", translation: "to taste" },
                    { word: "notre", translation: "our" },
                    { word: "fromage", translation: "cheese" },
                    { word: "de", translation: "of" },
                    { word: "chèvre", translation: "goat" },
                    { word: "?", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'cheese',
                choices: [
                    { text: "Oui, s'il vous plaît!", textEn: "Yes, please!", nextNode: 'taste_cheese' },
                    { text: "Combien ça coûte?", textEn: "How much does it cost?", nextNode: 'cheese_price' }
                ]
            },
            cheese_price: {
                id: 'cheese_price',
                type: 'quiz',
                question: "Le vendeur dit 'Cinq euros'. Combien est-ce?",
                questionEn: "The seller says 'Cinq euros'. How much is that?",
                options: ["3 euros", "5 euros", "15 euros", "50 euros"],
                correctAnswer: "5 euros",
                feedback: {
                    correct: "Bravo! Cinq = 5!",
                    incorrect: "Rappelez-vous: cinq = 5"
                },
                onCorrect: 'buy_cheese',
                xpBonus: 10
            },
            taste_cheese: {
                id: 'taste_cheese',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Le", translation: "The" },
                    { word: "fromage", translation: "cheese" },
                    { word: "est", translation: "is" },
                    { word: "délicieux", translation: "delicious" },
                    { word: "!", translation: "" },
                    { word: "Crémeux", translation: "Creamy" },
                    { word: "et", translation: "and" },
                    { word: "parfait", translation: "perfect" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'cheese',
                choices: [
                    { text: "Acheter le fromage", textEn: "Buy the cheese", nextNode: 'buy_cheese' },
                    { text: "Continuer au prochain stand", textEn: "Continue to the next stand", nextNode: 'fruit_stand' }
                ]
            },
            buy_cheese: {
                id: 'buy_cheese',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "achetez", translation: "buy" },
                    { word: "un", translation: "a" },
                    { word: "beau", translation: "beautiful" },
                    { word: "morceau", translation: "piece" },
                    { word: "de", translation: "of" },
                    { word: "fromage", translation: "cheese" },
                    { word: ".", translation: "" },
                    { word: "Le", translation: "The" },
                    { word: "vendeur", translation: "seller" },
                    { word: "sourit", translation: "smiles" },
                    { word: ".", translation: "" }
                ],
                audio: null,
                background: 'market',
                choices: [
                    { text: "Continuer", textEn: "Continue", nextNode: 'ending_gourmet' }
                ]
            },
            fruit_stand: {
                id: 'fruit_stand',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "Les", translation: "The" },
                    { word: "fruits", translation: "fruits" },
                    { word: "sont", translation: "are" },
                    { word: "magnifiques", translation: "magnificent" },
                    { word: ":", translation: "" },
                    { word: "des", translation: "some" },
                    { word: "fraises", translation: "strawberries" },
                    { word: "rouges", translation: "red" },
                    { word: ",", translation: "" },
                    { word: "des", translation: "some" },
                    { word: "melons", translation: "melons" },
                    { word: "parfumés", translation: "fragrant" },
                    { word: "...", translation: "" }
                ],
                audio: null,
                background: 'fruits',
                choices: [
                    { text: "Acheter des fraises", textEn: "Buy some strawberries", nextNode: 'buy_strawberries' },
                    { text: "Demander une recommandation", textEn: "Ask for a recommendation", nextNode: 'recommendation' }
                ]
            },
            buy_strawberries: {
                id: 'buy_strawberries',
                type: 'quiz',
                question: "Comment dit-on 'strawberries' en français?",
                questionEn: "How do you say 'strawberries' in French?",
                options: ["Framboises", "Fraises", "Cerises", "Pommes"],
                correctAnswer: "Fraises",
                feedback: {
                    correct: "Parfait! Les fraises sont délicieuses!",
                    incorrect: "Les 'strawberries' sont les 'fraises'!"
                },
                onCorrect: 'ending_healthy',
                xpBonus: 10
            },
            recommendation: {
                id: 'recommendation',
                type: 'narrative',
                speaker: 'Vendeuse',
                content: [
                    { word: '"', translation: "" },
                    { word: "Je", translation: "I" },
                    { word: "recommande", translation: "recommend" },
                    { word: "les", translation: "the" },
                    { word: "pêches", translation: "peaches" },
                    { word: "!", translation: "" },
                    { word: "Elles", translation: "They" },
                    { word: "sont", translation: "are" },
                    { word: "parfaites", translation: "perfect" },
                    { word: "aujourd'hui", translation: "today" },
                    { word: ".", translation: "" },
                    { word: '"', translation: "" }
                ],
                audio: null,
                background: 'fruits',
                choices: [
                    { text: "Prendre les pêches", textEn: "Take the peaches", nextNode: 'ending_healthy' }
                ]
            },
            // Endings
            ending_gourmet: {
                id: 'ending_gourmet',
                type: 'ending',
                title: "Le Gourmet",
                titleEn: "The Gourmet",
                content: [
                    { word: "Vous", translation: "You" },
                    { word: "rentrez", translation: "return" },
                    { word: "chez", translation: "" },
                    { word: "vous", translation: "home" },
                    { word: "avec", translation: "with" },
                    { word: "un", translation: "a" },
                    { word: "délicieux", translation: "delicious" },
                    { word: "fromage", translation: "cheese" },
                    { word: ".", translation: "" },
                    { word: "Quelle", translation: "What a" },
                    { word: "belle", translation: "beautiful" },
                    { word: "matinée", translation: "morning" },
                    { word: "!", translation: "" }
                ],
                endingType: 'good',
                xpReward: 60,
                achievement: 'story_gourmet'
            },
            ending_healthy: {
                id: 'ending_healthy',
                type: 'ending',
                title: "Le Gourmand Sain",
                titleEn: "The Healthy Foodie",
                content: [
                    { word: "Vos", translation: "Your" },
                    { word: "sacs", translation: "bags" },
                    { word: "sont", translation: "are" },
                    { word: "pleins", translation: "full" },
                    { word: "de", translation: "of" },
                    { word: "fruits", translation: "fruits" },
                    { word: "frais", translation: "fresh" },
                    { word: "!", translation: "" },
                    { word: "Délicieux", translation: "Delicious" },
                    { word: "et", translation: "and" },
                    { word: "sain", translation: "healthy" },
                    { word: "!", translation: "" }
                ],
                endingType: 'good',
                xpReward: 60,
                achievement: 'story_healthy'
            }
        },
        startNode: 'start'
    },
    {
        id: 'flight_nice',
        title: "Vol pour Nice",
        description: "Your flight to the French Riviera is full of surprises. Meet fellow travelers and handle unexpected situations high above the clouds.",
        level: 2,
        estimatedTime: '12 min',
        coverColor: 'from-blue-400 to-indigo-600',
        voiceActed: false,
        totalEndings: 2,
        nodes: {
            start: {
                id: 'start',
                type: 'narrative',
                speaker: 'Narrator',
                content: [
                    { word: "L'avion", translation: "The plane" }, { word: "est", translation: "is" }, { word: "prêt", translation: "ready" }, { word: "pour le", translation: "for the" }, { word: "décollage", translation: "takeoff" }, { word: ".", translation: "" },
                    { word: "Vous", translation: "You" }, { word: "cherchez", translation: "look for" }, { word: "votre", translation: "your" }, { word: "siège", translation: "seat" }, { word: ".", translation: "" }
                ],
                audio: null,
                background: 'airplane',
                choices: [
                    { text: "S'asseoir près de la fenêtre", textEn: "Sit by the window", nextNode: 'window_seat' },
                    { text: "S'asseoir près du couloir", textEn: "Sit by the aisle", nextNode: 'aisle_seat' }
                ]
            },
            window_seat: {
                id: 'window_seat',
                type: 'narrative',
                speaker: 'Voisine',
                content: [
                    { word: '"', translation: "" }, { word: "Excusez-moi", translation: "Excuse me" }, { word: ",", translation: "" }, { word: "c'est", translation: "it is" }, { word: "mon", translation: "my" }, { word: "premier", translation: "first" }, { word: "vol", translation: "flight" }, { word: ".", translation: "" }, { word: "Je", translation: "I" }, { word: "suis", translation: "am" }, { word: "un peu", translation: "a bit" }, { word: "nerveuse", translation: "nervous" }, { word: ".", translation: "" }, { word: '"', translation: "" }
                ],
                audio: null,
                background: 'airplane_window',
                choices: [
                    { text: "La rassurer", textEn: "Reassure her", nextNode: 'reassure' },
                    { text: "Lui proposer un magazine", textEn: "Offer her a magazine", nextNode: 'magazine' }
                ]
            },
            aisle_seat: {
                id: 'aisle_seat',
                type: 'narrative',
                speaker: 'Steward',
                content: [
                    { word: '"', translation: "" }, { word: "Bonjour", translation: "Hello" }, { word: ",", translation: "" }, { word: "voulez-vous", translation: "would you like" }, { word: "quelque chose", translation: "something" }, { word: "à boire", translation: "to drink" }, { word: "?", translation: "" }, { word: '"', translation: "" }
                ],
                audio: null,
                background: 'airplane_aisle',
                choices: [
                    { text: "Un café, s'il vous plaît", textEn: "A coffee, please", nextNode: 'cafe_order' },
                    { text: "Juste de l'eau", textEn: "Just some water", nextNode: 'water_order' }
                ]
            },
            cafe_order: {
                id: 'cafe_order',
                type: 'quiz',
                question: "Comment dit-on 'Sugar' en français?",
                questionEn: "How do you say 'Sugar' in French?",
                options: ["Sel", "Sucre", "Poivre", "Lait"],
                correctAnswer: "Sucre",
                feedback: {
                    correct: "Oui! Un café avec du sucre.",
                    incorrect: "Le 'sucre' est nécessaire pour le café sucré!"
                },
                onCorrect: 'ending_relaxed',
                xpBonus: 10
            },
            water_order: {
                id: 'water_order',
                type: 'narrative',
                speaker: 'Steward',
                content: [
                    { word: '"', translation: "" }, { word: "Voici", translation: "Here is" }, { word: "votre", translation: "your" }, { word: "eau", translation: "water" }, { word: ".", translation: "" }, { word: "Bon", translation: "Good" }, { word: "voyage", translation: "trip" }, { word: "!", translation: "" }, { word: '"', translation: "" }
                ],
                audio: null,
                background: 'airplane',
                choices: [
                    { text: "Continuer", textEn: "Continue", nextNode: 'ending_relaxed' }
                ]
            },
            reassure: {
                id: 'reassure',
                type: 'quiz',
                question: "Que dites-vous pour rassurer quelqu'un?",
                questionEn: "What do you say to reassure someone?",
                options: ["Ne vous inquiétez pas", "Au secours!", "C'est terrible", "Regardez!"],
                correctAnswer: "Ne vous inquiétez pas",
                feedback: {
                    correct: "Très bien! C'est la phrase parfaite.",
                    incorrect: "'Ne vous inquiétez pas' signifie 'Don't worry'."
                },
                onCorrect: 'ending_friend',
                xpBonus: 15
            },
            magazine: {
                id: 'magazine',
                type: 'narrative',
                speaker: 'Voisine',
                content: [
                    { word: '"', translation: "" }, { word: "Merci", translation: "Thank you" }, { word: ",", translation: "" }, { word: "c'est", translation: "it is" }, { word: "très", translation: "very" }, { word: "gentil", translation: "kind" }, { word: ".", translation: "" }, { word: '"', translation: "" }
                ],
                audio: null,
                background: 'airplane',
                choices: [
                    { text: "Continuer", textEn: "Continue", nextNode: 'ending_friend' }
                ]
            },
            ending_relaxed: {
                id: 'ending_relaxed',
                type: 'ending',
                title: "Le Voyageur Paisible",
                titleEn: "The Peaceful Traveler",
                content: [
                    { word: "Le", translation: "The" }, { word: "vol", translation: "flight" }, { word: "se", translation: "" }, { word: "passe", translation: "goes" }, { word: "bien", translation: "well" }, { word: ".", translation: "" },
                    { word: "Vous", translation: "You" }, { word: "arrivez", translation: "arrive" }, { word: "à", translation: "at" }, { word: "Nice", translation: "Nice" }, { word: "reposé", translation: "rested" }, { word: ".", translation: "" }
                ],
                endingType: 'good',
                xpReward: 50,
                achievement: 'flight_relaxed'
            },
            ending_friend: {
                id: 'ending_friend',
                type: 'ending',
                title: "Le Nouvel Ami",
                titleEn: "The New Friend",
                content: [
                    { word: "Vous", translation: "You" }, { word: "avez", translation: "have" }, { word: "partagé", translation: "shared" }, { word: "un", translation: "a" }, { word: "bon", translation: "good" }, { word: "moment", translation: "moment" }, { word: ".", translation: "" },
                    { word: "Nice", translation: "Nice" }, { word: "semble", translation: "seems" }, { word: "encore", translation: "even" }, { word: "plus", translation: "more" }, { word: "belle", translation: "beautiful" }, { word: "maintenant", translation: "now" }, { word: ".", translation: "" }
                ],
                endingType: 'good',
                xpReward: 60,
                achievement: 'flight_friend'
            }
        },
        startNode: 'start'
    }
];

// Helper functions
export const getStoryById = (id) => BRANCHING_STORIES.find(s => s.id === id);

export const getStoriesByLevel = (level) => BRANCHING_STORIES.filter(s => s.level <= level);

export const getStoryProgress = (storyId, progress = {}) => {
    const story = getStoryById(storyId);
    if (!story || !progress[storyId]) return { completed: false, endings: [] };
    return progress[storyId];
};

export const countTotalEndings = () =>
    BRANCHING_STORIES.reduce((sum, story) => sum + story.totalEndings, 0);
