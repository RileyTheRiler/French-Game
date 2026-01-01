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
    },
    {
        id: 'story4',
        title: "Le Voyage en Train",
        description: "A journey through the French countryside.",
        level: 2,
        xpReward: 60,
        coverColor: "from-sky-400 to-cyan-500",
        content: [
            { word: "Je", translation: "I" }, { word: "suis", translation: "am" }, { word: "à", translation: "at" }, { word: "la", translation: "the" }, { word: "gare", translation: "train station" }, { word: ".", translation: "" },
            { word: "Le", translation: "The" }, { word: "train", translation: "train" }, { word: "arrive", translation: "arrives" }, { word: "bientôt", translation: "soon" }, { word: ".", translation: "" },
            { word: "J'ai", translation: "I have" }, { word: "mon", translation: "my" }, { word: "billet", translation: "ticket" }, { word: "et", translation: "and" }, { word: "ma", translation: "my" }, { word: "valise", translation: "suitcase" }, { word: ".", translation: "" },
            { word: "Le", translation: "The" }, { word: "voyage", translation: "journey" }, { word: "dure", translation: "lasts" }, { word: "deux", translation: "two" }, { word: "heures", translation: "hours" }, { word: ".", translation: "" },
            { word: "Je", translation: "I" }, { word: "regarde", translation: "watch" }, { word: "par", translation: "through" }, { word: "la", translation: "the" }, { word: "fenêtre", translation: "window" }, { word: ".", translation: "" },
            { word: "Les", translation: "The" }, { word: "champs", translation: "fields" }, { word: "sont", translation: "are" }, { word: "verts", translation: "green" }, { word: "et", translation: "and" }, { word: "beaux", translation: "beautiful" }, { word: ".", translation: "" }
        ],
        quiz: {
            question: "Combien de temps dure le voyage ?",
            options: ["Une heure", "Deux heures", "Trois heures"],
            correctAnswer: "Deux heures"
        }
    },
    {
        id: 'story5',
        title: "Au Marché",
        description: "Shopping for fresh produce at the market.",
        level: 1,
        xpReward: 35,
        coverColor: "from-amber-400 to-orange-500",
        content: [
            { word: "Aujourd'hui", translation: "Today" }, { word: ",", translation: "" }, { word: "c'est", translation: "it is" }, { word: "samedi", translation: "Saturday" }, { word: ".", translation: "" },
            { word: "Je", translation: "I" }, { word: "vais", translation: "go" }, { word: "au", translation: "to the" }, { word: "marché", translation: "market" }, { word: ".", translation: "" },
            { word: "J'achète", translation: "I buy" }, { word: "des", translation: "some" }, { word: "pommes", translation: "apples" }, { word: "rouges", translation: "red" }, { word: ".", translation: "" },
            { word: "J'achète", translation: "I buy" }, { word: "aussi", translation: "also" }, { word: "du", translation: "some" }, { word: "fromage", translation: "cheese" }, { word: ".", translation: "" },
            { word: "Le", translation: "The" }, { word: "fromage", translation: "cheese" }, { word: "coûte", translation: "costs" }, { word: "cinq", translation: "five" }, { word: "euros", translation: "euros" }, { word: ".", translation: "" },
            { word: "Merci", translation: "Thank you" }, { word: ",", translation: "" }, { word: "au revoir", translation: "goodbye" }, { word: "!", translation: "" }
        ],
        quiz: {
            question: "Combien coûte le fromage ?",
            options: ["Trois euros", "Cinq euros", "Dix euros"],
            correctAnswer: "Cinq euros"
        }
    },
    {
        id: 'story6',
        title: "La Lettre",
        description: "A heartfelt letter between friends.",
        level: 3,
        xpReward: 90,
        coverColor: "from-rose-400 to-pink-500",
        content: [
            { word: "Chère", translation: "Dear" }, { word: "Marie", translation: "Marie" }, { word: ",", translation: "" },
            { word: "Je", translation: "I" }, { word: "suis", translation: "am" }, { word: "triste", translation: "sad" }, { word: "parce que", translation: "because" }, { word: "tu", translation: "you" }, { word: "me", translation: "me" }, { word: "manques", translation: "miss" }, { word: ".", translation: "" },
            { word: "Mais", translation: "But" }, { word: "je", translation: "I" }, { word: "suis", translation: "am" }, { word: "aussi", translation: "also" }, { word: "heureux", translation: "happy" }, { word: ".", translation: "" },
            { word: "Parce que", translation: "Because" }, { word: "nous", translation: "we" }, { word: "sommes", translation: "are" }, { word: "amis", translation: "friends" }, { word: "pour", translation: "for" }, { word: "toujours", translation: "always" }, { word: ".", translation: "" },
            { word: "J'espère", translation: "I hope" }, { word: "te", translation: "you" }, { word: "voir", translation: "to see" }, { word: "bientôt", translation: "soon" }, { word: ".", translation: "" },
            { word: "Ton", translation: "Your" }, { word: "ami", translation: "friend" }, { word: ",", translation: "" }, { word: "Pierre", translation: "Pierre" }
        ],
        quiz: {
            question: "Comment se sent Pierre ?",
            options: ["En colère", "Fatigué", "Triste mais heureux"],
            correctAnswer: "Triste mais heureux"
        }
    }
];
