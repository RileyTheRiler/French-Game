/**
 * Graded Readers Data
 * A library of texts from children's stories to news and literature,
 * each with difficulty levels and comprehension questions.
 */

export const READER_CATEGORIES = [
    { id: 'children', name: "Enfants", icon: '🧸' },
    { id: 'news', name: "Actualités", icon: '📰' },
    { id: 'literature', name: "Littérature", icon: '📚' },
    { id: 'culture', name: "Culture", icon: '🇫🇷' }
];

export const GRADED_READERS = [
    {
        id: 'petit_lapin',
        title: "Le Petit Lapin Blanc",
        author: "Traditionnel",
        category: 'children',
        level: 'A1',
        wordCount: 120,
        coverColor: 'from-blue-200 to-indigo-300',
        content: [
            { word: "Il", translation: "There" }, { word: "était", translation: "was" }, { word: "une", translation: "a" }, { word: "fois", translation: "time" }, { word: "un", translation: "a" }, { word: "petit", translation: "small" }, { word: "lapin", translation: "rabbit" }, { word: "blanc", translation: "white" }, { word: ".", translation: "" },
            { word: "Il", translation: "He" }, { word: "aimait", translation: "liked" }, { word: "les", translation: "the" }, { word: "carottes", translation: "carrots" }, { word: "et", translation: "and" }, { word: "le", translation: "the" }, { word: "soleil", translation: "sun" }, { word: ".", translation: "" },
            { word: "Un", translation: "One" }, { word: "jour", translation: "day" }, { word: ",", translation: "" }, { word: "il", translation: "he" }, { word: "trouve", translation: "finds" }, { word: "un", translation: "a" }, { word: "grand", translation: "large" }, { word: "jardin", translation: "garden" }, { word: ".", translation: "" },
            { word: "Il", translation: "He" }, { word: "est", translation: "is" }, { word: "très", translation: "very" }, { word: "heureux", translation: "happy" }, { word: "!", translation: "" }
        ],
        comprehension: [
            {
                question: "De quelle couleur est le lapin?",
                options: ["Gris", "Noir", "Blanc"],
                correctAnswer: "Blanc"
            },
            {
                question: "Qu'est-ce qu'il aime manger?",
                options: ["Des pommes", "Des carottes", "Du pain"],
                correctAnswer: "Des carottes"
            }
        ],
        xpReward: 40
    },
    {
        id: 'paris_jo_2024',
        title: "Paris et les Jeux Olympiques",
        author: "Journaliste",
        category: 'news',
        level: 'A2',
        wordCount: 250,
        coverColor: 'from-amber-400 to-yellow-600',
        content: [
            { word: "Paris", translation: "Paris" }, { word: "se", translation: "" }, { word: "prépare", translation: "prepares" }, { word: "pour", translation: "for" }, { word: "les", translation: "the" }, { word: "Jeux", translation: "Games" }, { word: "Olympiques", translation: "Olympics" }, { word: ".", translation: "" },
            { word: "La", translation: "The" }, { word: "ville", translation: "city" }, { word: "est", translation: "is" }, { word: "en", translation: "in" }, { word: "fête", translation: "celebration" }, { word: ".", translation: "" },
            { word: "Les", translation: "The" }, { word: "athlètes", translation: "athletes" }, { word: "du", translation: "from" }, { word: "monde", translation: "world" }, { word: "entier", translation: "entire" }, { word: "arrivent", translation: "arrive" }, { word: ".", translation: "" },
            { word: "Le", translation: "The" }, { word: "sport", translation: "sport" }, { word: "unit", translation: "unites" }, { word: "les", translation: "the" }, { word: "peuples", translation: "peoples" }, { word: ".", translation: "" }
        ],
        comprehension: [
            {
                question: "Quelle ville accueille les Jeux?",
                options: ["Lyon", "Paris", "Marseille"],
                correctAnswer: "Paris"
            },
            {
                question: "Comment est la ville?",
                options: ["Triste", "Calme", "En fête"],
                correctAnswer: "En fête"
            }
        ],
        xpReward: 60
    },
    {
        id: 'miserables_extrait',
        title: "Les Misérables (Extrait)",
        author: "Victor Hugo",
        category: 'literature',
        level: 'B2',
        wordCount: 400,
        coverColor: 'from-slate-700 to-slate-900',
        content: [
            { word: "Cosette", translation: "Cosette" }, { word: "était", translation: "was" }, { word: "dans", translation: "in" }, { word: "son", translation: "her" }, { word: "coin", translation: "corner" }, { word: "habituel", translation: "usual" }, { word: ".", translation: "" },
            { word: "Elle", translation: "She" }, { word: "avait", translation: "had" }, { word: "peur", translation: "fear" }, { word: "de", translation: "of" }, { word: "tout", translation: "everything" }, { word: ".", translation: "" },
            { word: "L'ombre", translation: "The shadow" }, { word: "l'enveloppait", translation: "wrapped her" }, { word: ".", translation: "" },
            { word: "Soudain", translation: "Suddenly" }, { word: ",", translation: "" }, { word: "une", translation: "a" }, { word: "main", translation: "hand" }, { word: "se", translation: "" }, { word: "posa", translation: "rested" }, { word: "sur", translation: "on" }, { word: "son", translation: "her" }, { word: "épaule", translation: "shoulder" }, { word: ".", translation: "" }
        ],
        comprehension: [
            {
                question: "Qui est dans le coin?",
                options: ["Jean Valjean", "Cosette", "Marius"],
                correctAnswer: "Cosette"
            },
            {
                question: "Qu'est-ce qui l'enveloppait?",
                options: ["Une couverture", "Le silence", "L'ombre"],
                correctAnswer: "L'ombre"
            }
        ],
        xpReward: 100
    },
    {
        id: 'vin_france',
        title: "Le Vin en France",
        author: "Sommelier",
        category: 'culture',
        level: 'B1',
        wordCount: 300,
        coverColor: 'from-red-800 to-rose-950',
        content: [
            { word: "Le", translation: "The" }, { word: "vin", translation: "wine" }, { word: "fait", translation: "is" }, { word: "partie", translation: "part" }, { word: "du", translation: "of the" }, { word: "patrimoine", translation: "heritage" }, { word: "français", translation: "French" }, { word: ".", translation: "" },
            { word: "Bordeaux", translation: "Bordeaux" }, { word: "et", translation: "and" }, { word: "la", translation: "the" }, { word: "Bourgogne", translation: "Burgundy" }, { word: "sont", translation: "are" }, { word: "mondialement", translation: "world-wide" }, { word: "connus", translation: "known" }, { word: ".", translation: "" },
            { word: "Chaque", translation: "Each" }, { word: "région", translation: "region" }, { word: "a", translation: "has" }, { word: "son", translation: "its" }, { word: "propre", translation: "own" }, { word: "terroir", translation: "terroir" }, { word: ".", translation: "" }
        ],
        comprehension: [
            {
                question: "Quelles régions sont citées?",
                options: ["Paris et Lyon", "Bordeaux et Bourgogne", "Alsace et Bretagne"],
                correctAnswer: "Bordeaux et Bourgogne"
            }
        ],
        xpReward: 80
    },
    {
        id: 'gastronomie_unesco',
        title: "La Gastronomie à l'UNESCO",
        author: "Chef Michel",
        category: 'culture',
        level: 'B2',
        wordCount: 350,
        coverColor: 'from-orange-400 to-orange-600',
        content: [
            { word: "Le", translation: "The" }, { word: "repas", translation: "meal" }, { word: "gastronomique", translation: "gastronomic" }, { word: "des", translation: "of the" }, { word: "Français", translation: "French" }, { word: "est", translation: "is" }, { word: "classé", translation: "classified" }, { word: ".", translation: "" },
            { word: "C'est", translation: "It is" }, { word: "une", translation: "a" }, { word: "pratique", translation: "practice" }, { word: "sociale", translation: "social" }, { word: "coutumière", translation: "customary" }, { word: ".", translation: "" }
        ],
        comprehension: [
            {
                question: "Qu'est-ce qui est classé à l'UNESCO?",
                options: ["La tour Eiffel", "Le repas gastronomique", "La langue française"],
                correctAnswer: "Le repas gastronomique"
            }
        ],
        xpReward: 90
    }
];

export const getReadersByLevel = (level) =>
    GRADED_READERS.filter(r => {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIdx = levels.indexOf(level) === -1 ? 0 : levels.indexOf(level);
        const readerLevelIdx = levels.indexOf(r.level);
        return readerLevelIdx <= userLevelIdx + 1; // Show up to one level above user
    });

export const getReadersByCategory = (category) =>
    GRADED_READERS.filter(r => r.category === category);
