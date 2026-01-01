export const STORIES = [
    {
        id: 'story1',
        title: "Le Petit Déjeuner",
        description: "A simple story about morning routine.",
        level: 1,
        xpReward: 30,
        coverColor: "from-orange-400 to-red-500",
        content: [
            { word: "C'est", translation: "It is" }, { word: "le", translation: "the" }, { word: "matin", translation: "morning" }, { word: ".", translation: "" },
            { word: "Je", translation: "I" }, { word: "bois", translation: "drink" }, { word: "du", translation: "some" }, { word: "café", translation: "coffee" }, { word: ".", translation: "" },
            { word: "Le", translation: "The" }, { word: "café", translation: "coffee" }, { word: "est", translation: "is" }, { word: "chaud", translation: "hot" }, { word: ".", translation: "" },
            { word: "Je", translation: "I" }, { word: "mange", translation: "eat" }, { word: "un", translation: "a" }, { word: "croissant", translation: "croissant" }, { word: ".", translation: "" },
            { word: "C'est", translation: "It is" }, { word: "délicieux", translation: "delicious" }, { word: "!", translation: "" }
        ],
        quiz: {
            question: "Qu'est-ce que je bois ?",
            options: ["Du thé", "Du café", "Du jus"],
            correctAnswer: "Du café"
        }
    },
    {
        id: 'story2',
        title: "Promenade à Paris",
        description: "Walking through the streets of Paris.",
        level: 2,
        xpReward: 50,
        coverColor: "from-blue-400 to-indigo-500",
        content: [
            { word: "Aujourd'hui", translation: "Today" }, { word: ",", translation: "" }, { word: "je", translation: "I" }, { word: "marche", translation: "walk" }, { word: "dans", translation: "in" }, { word: "Paris", translation: "Paris" }, { word: ".", translation: "" },
            { word: "Je", translation: "I" }, { word: "vois", translation: "see" }, { word: "la", translation: "the" }, { word: "Tour", translation: "Tower" }, { word: "Eiffel", translation: "Eiffel" }, { word: ".", translation: "" },
            { word: "Elle", translation: "She/It" }, { word: "est", translation: "is" }, { word: "très", translation: "very" }, { word: "grande", translation: "tall" }, { word: ".", translation: "" },
            { word: "Il", translation: "There" }, { word: "y", translation: "there" }, { word: "a", translation: "is/has" }, { word: "beaucoup", translation: "a lot" }, { word: "de", translation: "of" }, { word: "touristes", translation: "tourists" }, { word: ".", translation: "" }
        ],
        quiz: {
            question: "Que vois-je à Paris ?",
            options: ["La Tour Eiffel", "Le Louvre", "Notre Dame"],
            correctAnswer: "La Tour Eiffel"
        }
    },
    {
        id: 'story3',
        title: "Le Chat Curieux",
        description: "A cat explores a mysterious garden.",
        level: 3,
        xpReward: 80,
        coverColor: "from-emerald-400 to-teal-500",
        content: [
            { word: "Minou", translation: "Kitty" }, { word: "est", translation: "is" }, { word: "un", translation: "a" }, { word: "chat", translation: "cat" }, { word: "très", translation: "very" }, { word: "curieux", translation: "curious" }, { word: ".", translation: "" },
            { word: "Il", translation: "He" }, { word: "voit", translation: "sees" }, { word: "un", translation: "a" }, { word: "papillon", translation: "butterfly" }, { word: "dans", translation: "in" }, { word: "le", translation: "the" }, { word: "jardin", translation: "garden" }, { word: ".", translation: "" },
            { word: "Le", translation: "The" }, { word: "papillon", translation: "butterfly" }, { word: "est", translation: "is" }, { word: "bleu", translation: "blue" }, { word: ".", translation: "" },
            { word: "Minou", translation: "Kitty" }, { word: "court", translation: "runs" }, { word: "après", translation: "after" }, { word: "lui", translation: "him" }, { word: ",", translation: "" }, { word: "mais", translation: "but" }, { word: "il", translation: "he" }, { word: "s'envole", translation: "flies away" }, { word: ".", translation: "" }
        ],
        quiz: {
            question: "De quelle couleur est le papillon ?",
            options: ["Rouge", "Bleu", "Jaune"],
            correctAnswer: "Bleu"
        }
    }
];
