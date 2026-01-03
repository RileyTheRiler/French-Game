export const REGIONS = [
    {
        id: 'quebec',
        title: 'Québec 🇨🇦',
        description: 'Discover "Joual" and the unique accent of La Belle Province.',
        color: 'blue',
        icon: '🍁',
        location: { lat: 46.8138, lng: -71.2079 }
    },
    {
        id: 'marseille',
        title: 'Marseille (Sud) ☀️',
        description: 'The singing accent of the Mediterranean coast.',
        color: 'amber',
        icon: '⚓',
        location: { lat: 43.2965, lng: 5.3698 }
    },
    {
        id: 'belgium',
        title: 'Belgique 🇧🇪',
        description: 'Don\'t say "soixante-dix", say "septante"!',
        color: 'red',
        icon: '🍟',
        location: { lat: 50.8503, lng: 4.3517 }
    },
    {
        id: 'switzerland',
        title: 'Suisse 🇨🇭',
        description: 'Precision and "huitante" in the Alps.',
        color: 'red',
        icon: '🏔️',
        location: { lat: 46.8182, lng: 8.2275 }
    },
    {
        id: 'senegal',
        title: 'Sénégal (Afrique de l\'Ouest) 🇸🇳',
        description: 'Rich Wolof influences and formal elegance.',
        color: 'green',
        icon: '🦁',
        location: { lat: 14.4974, lng: -14.4524 }
    }
];

export const DIALECT_DATA = [
    // Quebec
    {
        id: 'q1',
        regionId: 'quebec',
        term: 'Le char',
        standard: 'La voiture',
        meaning: 'Car',
        example: 'Je prends mon char pour aller travailler.',
        audioNote: 'Pronounced slightly like "chawr".'
    },
    {
        id: 'q2',
        regionId: 'quebec',
        term: 'Magasiner',
        standard: 'Faire du shopping',
        meaning: 'To shop',
        example: 'On va magasiner en fin de semaine.',
        audioNote: 'A classic Quebecois verb.'
    },
    {
        id: 'q3',
        regionId: 'quebec',
        term: 'C\'est tiguidou',
        standard: 'C\'est parfait / super',
        meaning: 'It\'s all good / awesome',
        example: 'Ta solution est tiguidou !',
        audioNote: 'Very informal and friendly.'
    },

    // Marseille
    {
        id: 'm1',
        regionId: 'marseille',
        term: 'Peuchère',
        standard: 'Le pauvre / La pauvre',
        meaning: 'Poor thing (expression of pity/affection)',
        example: 'Il a raté son bus, peuchère !',
        audioNote: 'Pronounced with a strong Southern "twang".'
    },
    {
        id: 'm2',
        regionId: 'marseille',
        term: 'Fada',
        standard: 'Fou',
        meaning: 'Crazy / Mad',
        example: 'Il est fada de conduire comme ça !',
        audioNote: ''
    },
    {
        id: 'm3',
        regionId: 'marseille',
        term: 'Dégun',
        standard: 'Personne',
        meaning: 'Nobody',
        example: 'Y avait dégun à la fête.',
        audioNote: 'Opposite of "tout le monde".'
    },

    // Belgium
    {
        id: 'b1',
        regionId: 'belgium',
        term: 'Septante',
        standard: 'Soixante-dix',
        meaning: 'Seventy (70)',
        example: 'Ça coûte septante euros.',
        audioNote: 'Much more logical than standard French!'
    },
    {
        id: 'b2',
        regionId: 'belgium',
        term: 'Nonante',
        standard: 'Quatre-vingt-dix',
        meaning: 'Ninety (90)',
        example: 'Mon grand-père a nonante ans.',
        audioNote: ''
    },
    {
        id: 'b3',
        regionId: 'belgium',
        term: 'S\'il vous plaît',
        standard: 'Voici (en donnant quelque chose)',
        meaning: 'Here you go (when handing something)',
        example: '(Giving change) S\'il vous plaît !',
        audioNote: 'Used differently than in France.'
    },

    // Switzerland
    {
        id: 's1',
        regionId: 'switzerland',
        term: 'Huitante',
        standard: 'Quatre-vingts',
        meaning: 'Eighty (80)',
        example: 'Il y a huitante participants.',
        audioNote: 'Used in some Swiss cantons (Vaud, Fribourg, Valais).'
    },
    {
        id: 's2',
        regionId: 'switzerland',
        term: 'Le natel',
        standard: 'Le téléphone portable',
        meaning: 'Mobile phone',
        example: 'J\'ai oublié mon natel.',
        audioNote: 'Derived from "Nationales Autotelefon".'
    },

    // Senegal
    {
        id: 'af1',
        regionId: 'senegal',
        term: 'Une essencerie',
        standard: 'Une station-service',
        meaning: 'Gas station',
        example: 'Je m\'arrête à l\'essencerie.',
        audioNote: 'Logical derivation from "essence".'
    },
    {
        id: 'af2',
        regionId: 'senegal',
        term: 'Durer',
        standard: 'Mettre du temps / Être lent',
        meaning: 'To take a long time',
        example: 'Tu dures trop !',
        audioNote: 'Used transitively often.'
    }
];
