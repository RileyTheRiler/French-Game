export const SLANG_CATEGORIES = [
    {
        id: 'verlan',
        title: 'Le Verlan',
        description: 'Backwards slang commonly used in French suburbs and pop culture.',
        color: 'purple',
        icon: '🔄'
    },
    {
        id: 'texting',
        title: 'Texto & Internet',
        description: 'Abbreviations you will see in WhatsApp and social media.',
        color: 'blue',
        icon: '📱'
    },
    {
        id: 'street',
        title: 'Street & Argot',
        description: 'Common colloquialisms you won\'t find in textbooks.',
        color: 'red',
        icon: '🏙️'
    },
    {
        id: 'expressions',
        title: 'Idioms & Expressions',
        description: 'Colorful metaphors that make no sense literally.',
        color: 'amber',
        icon: '🎨'
    }
];

export const SLANG_DATA = [
    // Verlan
    {
        id: 'v1',
        term: 'Cimer',
        standard: 'Merci',
        literalMean: 'Thank you (reversed)',
        category: 'verlan',
        example: 'Cimer pour le cadeau !',
        difficulty: 1
    },
    {
        id: 'v2',
        term: 'Ouf',
        standard: 'Fou',
        literalMean: 'Crazy (reversed)',
        category: 'verlan',
        example: 'Ce film est un truc de ouf !',
        difficulty: 1
    },
    {
        id: 'v3',
        term: 'Meuf',
        standard: 'Femme',
        literalMean: 'Woman (reversed)',
        category: 'verlan',
        example: 'Je sors avec ma meuf ce soir.',
        difficulty: 1
    },
    {
        id: 'v4',
        term: 'Keuf',
        standard: 'Flic',
        literalMean: 'Cop (reversed)',
        category: 'verlan',
        example: 'Attention, y a les keufs !',
        difficulty: 2
    },
    {
        id: 'v5',
        term: 'Teuf',
        standard: 'Fête',
        literalMean: 'Party (reversed)',
        category: 'verlan',
        example: 'Grosse teuf chez Paul samedi.',
        difficulty: 1
    },
    {
        id: 'v6',
        term: 'Relou',
        standard: 'Lourd',
        literalMean: 'Heavy/Annoying (reversed)',
        category: 'verlan',
        example: 'T\'es vraiment relou quand tu bois.',
        difficulty: 2
    },
    {
        id: 'v7',
        term: 'Chanmé',
        standard: 'Méchant',
        literalMean: 'Wicked/Awesome (reversed)',
        category: 'verlan',
        example: 'Ses baskets sont chanmé !',
        difficulty: 2
    },
    {
        id: 'v8',
        term: 'Chelou',
        standard: 'Louche',
        literalMean: 'Shady/Weird (reversed)',
        category: 'verlan',
        example: 'Ce type est un peu chelou.',
        difficulty: 1
    },

    // Texting
    {
        id: 't1',
        term: 'MDR',
        standard: 'Mort de rire',
        literalMean: 'LOL (Dead from laughing)',
        category: 'texting',
        example: 'Ta blague est nulle mdr',
        difficulty: 1
    },
    {
        id: 't2',
        term: 'Slt',
        standard: 'Salut',
        literalMean: 'Hi',
        category: 'texting',
        example: 'Slt ca va ?',
        difficulty: 1
    },
    {
        id: 't3',
        term: 'A+',
        standard: 'À plus tard',
        literalMean: 'See you later',
        category: 'texting',
        example: 'Je dois y aller, a+',
        difficulty: 1
    },
    {
        id: 't4',
        term: 'Jpp',
        standard: 'J\'en peux plus',
        literalMean: 'I can\'t take it anymore / I\'m done (laughing)',
        category: 'texting',
        example: 'Regarde cette vidéo jpp',
        difficulty: 2
    },
    {
        id: 't5',
        term: 'Tkt',
        standard: 'T\'inquiète pas',
        literalMean: 'Don\'t worry',
        category: 'texting',
        example: 'Tkt je gère',
        difficulty: 2
    },
    {
        id: 't6',
        term: 'Oklm',
        standard: 'Au calme',
        literalMean: 'Chilling / Easy',
        category: 'texting',
        example: 'On est posé oklm',
        difficulty: 2
    },

    // Street / Argot
    {
        id: 's1',
        term: 'Le fric',
        standard: 'L\'argent',
        literalMean: 'Cash / Dough',
        category: 'street',
        example: 'Il a gagné beaucoup de fric.',
        difficulty: 1
    },
    {
        id: 's2',
        term: 'Kiffer',
        standard: 'Aimer / Apprécier',
        literalMean: 'To like / enjoy',
        category: 'street',
        example: 'Je kiffe cette musique.',
        difficulty: 1
    },
    {
        id: 's3',
        term: 'Vénère',
        standard: 'Énervé',
        literalMean: 'Angry / Mad',
        category: 'street',
        example: 'Pourquoi tu es vénère ?',
        difficulty: 2
    },
    {
        id: 's4',
        term: 'Un mec',
        standard: 'Un homme / Un garçon',
        literalMean: 'A guy',
        category: 'street',
        example: 'C\'est un mec sympa.',
        difficulty: 1
    },
    {
        id: 's5',
        term: 'Une bagnole',
        standard: 'Une voiture',
        literalMean: 'Car',
        category: 'street',
        example: 'Belle bagnole !',
        difficulty: 1
    },
    {
        id: 's6',
        term: 'Bosser',
        standard: 'Travailler',
        literalMean: 'To work',
        category: 'street',
        example: 'Je dois bosser ce week-end.',
        difficulty: 1
    },
    {
        id: 's7',
        term: 'Bouffer',
        standard: 'Manger',
        literalMean: 'To eat',
        category: 'street',
        example: 'On va bouffer un truc ?',
        difficulty: 1
    },

    // Expressions
    {
        id: 'e1',
        term: 'Poser un lapin',
        standard: 'Ne pas venir à un rendez-vous',
        literalMean: 'To place a rabbit (to stand someone up)',
        category: 'expressions',
        example: 'Il m\'a posé un lapin hier soir.',
        difficulty: 2
    },
    {
        id: 'e2',
        term: 'Avoir le seum',
        standard: 'Être dégoûté / Triste',
        literalMean: 'To have the venom (to be gutted/upset)',
        category: 'expressions',
        example: 'J\'ai raté mon bus, j\'ai le seum.',
        difficulty: 2
    },
    {
        id: 'e3',
        term: 'Raconter des salades',
        standard: 'Mentir',
        literalMean: 'To tell salads (to lie)',
        category: 'expressions',
        example: 'Arrête de raconter des salades !',
        difficulty: 2
    },
    {
        id: 'e4',
        term: 'Ça marche',
        standard: 'D\'accord',
        literalMean: 'It works (Okay / Sounds good)',
        category: 'expressions',
        example: 'On se voit à 20h ? Ça marche.',
        difficulty: 1
    }
];
