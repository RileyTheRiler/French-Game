/**
 * Sentence Templates
 * 
 * Placeholders format:
 * {{type:gender:number}}
 * 
 * types: noun, adj, verb, article
 * gender: m (masculine), f (feminine), n (neutral/any)
 * number: s (singular), p (plural)
 * 
 * SEMANTIC PAIRING: Templates now include semantic constraints to ensure
 * realistic, practical sentences (no "purple elephants" or "sad fish").
 */

// Valid semantic pairings for realistic sentences
export const SEMANTIC_PAIRS = {
    // Colors + Objects that naturally have those colors
    coloredObjects: {
        'voiture': ['rouge', 'bleu', 'noir', 'blanc', 'gris', 'vert'],
        'pomme': ['rouge', 'vert', 'jaune'],
        'ciel': ['bleu', 'gris'],
        'sac': ['noir', 'rouge', 'bleu', 'vert', 'rose'],
        'manteau': ['noir', 'bleu', 'rouge', 'gris', 'vert'],
        'fleur': ['rouge', 'rose', 'jaune', 'blanc', 'violet'],
        'maison': ['blanc', 'gris', 'rouge'],
        'livre': ['rouge', 'bleu', 'vert', 'noir'],
        'chaise': ['noir', 'blanc', 'rouge', 'bleu']
    },
    // Natural food descriptions
    foodDescriptions: {
        'café': ['chaud', 'fort', 'noir'],
        'thé': ['chaud', 'vert'],
        'soupe': ['chaude', 'bonne', 'délicieuse'],
        'pain': ['frais', 'chaud', 'bon'],
        'croissant': ['chaud', 'frais', 'délicieux'],
        'fromage': ['bon', 'délicieux', 'français'],
        'salade': ['fraîche', 'verte', 'bonne'],
        'vin': ['rouge', 'blanc', 'bon'],
        'bière': ['fraîche', 'froide', 'bonne']
    }
};

export const SENTENCE_TEMPLATES = [
    // =============================================================
    // LEVEL 1: PRACTICAL BASICS
    // =============================================================

    // --- Greetings & Polite Phrases ---
    {
        id: 'p1',
        level: 1,
        french: "Bonjour, je voudrais {{food:m}}, s'il vous plaît.",
        english: "Hello, I would like {{food:english}}, please.",
        category: 'ordering',
        constraints: {
            food: { category: ['food'], pos: 'noun', gender: 'm' }
        }
    },
    {
        id: 'p2',
        level: 1,
        french: "Bonjour, je voudrais {{food:f}}, s'il vous plaît.",
        english: "Hello, I would like {{food:english}}, please.",
        category: 'ordering',
        constraints: {
            food: { category: ['food'], pos: 'noun', gender: 'f' }
        }
    },

    // --- Basic Existence & States ---
    {
        id: 'p3',
        level: 1,
        french: "Le {{food:m}} est {{adj:m}}.",
        english: "The {{food:english}} is {{adj:english}}.",
        category: 'description',
        constraints: {
            food: { category: ['food'] },
            adj: { semanticKey: 'foodDescriptions' }
        }
    },
    {
        id: 'p4',
        level: 1,
        french: "J'ai {{object:m}} {{color:m}}.",
        english: "I have a {{color:english}} {{object:english}}.",
        category: 'possession',
        constraints: {
            object: { category: ['objects'], gender: 'm' },
            color: { semanticKey: 'coloredObjects', category: ['colors'] }
        }
    },

    // --- Location & Navigation ---
    {
        id: 'p5',
        level: 1,
        french: "Où est {{place:m}} ?",
        english: "Where is the {{place:english}}?",
        category: 'navigation',
        constraints: {
            place: { category: ['places'], gender: 'm' }
        }
    },
    {
        id: 'p6',
        level: 1,
        french: "Où est {{place:f}} ?",
        english: "Where is the {{place:english}}?",
        category: 'navigation',
        constraints: {
            place: { category: ['places'], gender: 'f' }
        }
    },

    // --- Simple Consumption ---
    {
        id: 'p7',
        level: 1,
        french: "Je mange {{food:m}}.",
        english: "I am eating {{food:english}}.",
        category: 'consumption',
        constraints: {
            food: { category: ['food'], gender: 'm' }
        }
    },
    {
        id: 'p8',
        level: 1,
        french: "Je bois {{drink:m}}.",
        english: "I am drinking {{drink:english}}.",
        category: 'consumption',
        constraints: {
            drink: {
                category: ['food'],
                specificIds: ['f4', 'f5', 'f6', 'f7', 'f8'] // water, coffee, tea, wine, beer
            }
        }
    },

    // =============================================================
    // LEVEL 2: PRACTICAL INTERMEDIATE
    // =============================================================

    // --- Shopping ---
    {
        id: 'p9',
        level: 2,
        french: "Combien coûte {{object:m}} ?",
        english: "How much does the {{object:english}} cost?",
        category: 'shopping',
        constraints: {
            object: { category: ['objects', 'food'], gender: 'm' }
        }
    },
    {
        id: 'p10',
        level: 2,
        french: "Combien coûte {{object:f}} ?",
        english: "How much does the {{object:english}} cost?",
        category: 'shopping',
        constraints: {
            object: { category: ['objects', 'food'], gender: 'f' }
        }
    },
    {
        id: 'p11',
        level: 2,
        french: "Je cherche {{object:m}}.",
        english: "I am looking for {{object:english}}.",
        category: 'shopping',
        constraints: {
            object: { category: ['objects', 'places'], gender: 'm' }
        }
    },

    // --- Travel ---
    {
        id: 'p12',
        level: 2,
        french: "Le train part à {{time:m}}.",
        english: "The train leaves at {{time:english}}.",
        category: 'travel',
        constraints: {
            time: {
                category: ['time'],
                specificIds: ['tm5', 'tm6'] // morning, evening
            }
        }
    },
    {
        id: 'p13',
        level: 2,
        french: "Je vais à {{place:f}}.",
        english: "I am going to the {{place:english}}.",
        category: 'travel',
        constraints: {
            place: { category: ['places', 'travel'], gender: 'f' }
        }
    },
    {
        id: 'p14',
        level: 2,
        french: "Je vais à {{place:m}}.",
        english: "I am going to the {{place:english}}.",
        category: 'travel',
        constraints: {
            place: { category: ['places', 'travel'], gender: 'm' }
        }
    },

    // --- Preferences ---
    {
        id: 'p15',
        level: 2,
        french: "J'aime {{food:m}}.",
        english: "I like {{food:english}}.",
        category: 'preferences',
        constraints: {
            food: { category: ['food'] }
        }
    },
    {
        id: 'p16',
        level: 2,
        french: "Je préfère {{drink:m}}.",
        english: "I prefer {{drink:english}}.",
        category: 'preferences',
        constraints: {
            drink: {
                category: ['food'],
                specificIds: ['f4', 'f5', 'f6', 'f7', 'f8']
            }
        }
    },

    // --- Time & Schedule ---
    {
        id: 'p17',
        level: 2,
        french: "{{place:m}} ouvre à neuf heures.",
        english: "The {{place:english}} opens at nine o'clock.",
        category: 'schedule',
        constraints: {
            place: { category: ['places'], gender: 'm' }
        }
    },
    {
        id: 'p18',
        level: 2,
        french: "{{place:f}} ferme à six heures.",
        english: "The {{place:english}} closes at six o'clock.",
        category: 'schedule',
        constraints: {
            place: { category: ['places'], gender: 'f' }
        }
    },

    // =============================================================
    // LEVEL 3: ADVANCED PRACTICAL
    // =============================================================

    // --- Complex Ordering ---
    {
        id: 'p19',
        level: 3,
        french: "Je voudrais réserver une table pour deux personnes.",
        english: "I would like to reserve a table for two people.",
        category: 'ordering',
        constraints: {},
        isStatic: true
    },
    {
        id: 'p20',
        level: 3,
        french: "L'addition, s'il vous plaît.",
        english: "The bill, please.",
        category: 'ordering',
        constraints: {},
        isStatic: true
    },

    // --- Directions ---
    {
        id: 'p21',
        level: 3,
        french: "{{place:m}} est à gauche.",
        english: "The {{place:english}} is on the left.",
        category: 'directions',
        constraints: {
            place: { category: ['places'], gender: 'm' }
        }
    },
    {
        id: 'p22',
        level: 3,
        french: "{{place:f}} est tout droit.",
        english: "The {{place:english}} is straight ahead.",
        category: 'directions',
        constraints: {
            place: { category: ['places'], gender: 'f' }
        }
    },

    // --- Weather Conversations ---
    {
        id: 'p23',
        level: 3,
        french: "{{weather}}. Je prends mon parapluie.",
        english: "{{weather:english}}. I'm taking my umbrella.",
        category: 'weather',
        constraints: {
            weather: {
                category: ['weather'],
                specificIds: ['w4'] // il pleut
            }
        }
    },
    {
        id: 'p24',
        level: 3,
        french: "{{weather}}. Allons au parc !",
        english: "{{weather:english}}. Let's go to the park!",
        category: 'weather',
        constraints: {
            weather: {
                category: ['weather'],
                specificIds: ['w1'] // il fait beau
            }
        }
    },

    // --- Family & Social ---
    {
        id: 'p25',
        level: 3,
        french: "{{family:m}} arrive demain.",
        english: "{{family:english}} arrives tomorrow.",
        category: 'family',
        constraints: {
            family: { category: ['family'], gender: 'm' }
        }
    },
    {
        id: 'p26',
        level: 3,
        french: "Je visite {{family:f}} ce weekend.",
        english: "I am visiting {{family:english}} this weekend.",
        category: 'family',
        constraints: {
            family: { category: ['family'], gender: 'f' }
        }
    },

    // --- Health & Body (practical) ---
    {
        id: 'p27',
        level: 3,
        french: "J'ai mal à {{body:f}}.",
        english: "My {{body:english}} hurts.",
        category: 'health',
        constraints: {
            body: { category: ['body'], gender: 'f' }
        }
    },
    {
        id: 'p28',
        level: 3,
        french: "J'ai mal à {{body:m}}.",
        english: "My {{body:english}} hurts.",
        category: 'health',
        constraints: {
            body: { category: ['body'], gender: 'm' }
        }
    },

    // --- Expressing Feelings (contextual) ---
    {
        id: 'p29',
        level: 3,
        french: "Je suis {{emotion}} aujourd'hui.",
        english: "I am {{emotion:english}} today.",
        category: 'feelings',
        constraints: {
            emotion: { category: ['emotions'] }
        }
    },
    {
        id: 'p30',
        level: 3,
        french: "Je suis {{emotion}} parce que c'est le weekend.",
        english: "I am {{emotion:english}} because it's the weekend.",
        category: 'feelings',
        constraints: {
            emotion: {
                category: ['emotions'],
                specificIds: ['e1', 'e5'] // heureux, excité
            }
        }
    }
];

// Template categories for filtering
export const TEMPLATE_CATEGORIES = {
    ordering: { name: 'Ordering', icon: '🍽️', description: 'Restaurant and café orders' },
    navigation: { name: 'Navigation', icon: '🧭', description: 'Finding places' },
    shopping: { name: 'Shopping', icon: '🛒', description: 'Buying things' },
    travel: { name: 'Travel', icon: '✈️', description: 'Getting around' },
    directions: { name: 'Directions', icon: '➡️', description: 'Following directions' },
    preferences: { name: 'Preferences', icon: '❤️', description: 'Likes and dislikes' },
    schedule: { name: 'Schedule', icon: '📅', description: 'Times and hours' },
    weather: { name: 'Weather', icon: '🌤️', description: 'Weather discussions' },
    family: { name: 'Family', icon: '👨‍👩‍👧', description: 'Family matters' },
    health: { name: 'Health', icon: '🏥', description: 'Health and body' },
    feelings: { name: 'Feelings', icon: '😊', description: 'Expressing emotions' },
    description: { name: 'Descriptions', icon: '📝', description: 'Describing things' },
    possession: { name: 'Possessions', icon: '🎒', description: 'What you have' },
    consumption: { name: 'Eating & Drinking', icon: '🍴', description: 'Food and drink' }
};
