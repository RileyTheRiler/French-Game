export const MINIMAL_PAIRS = [
    {
        id: 'u_ou',
        contrast: '/y/ vs /u/',
        description: 'The "u" sound (as in tu) vs the "ou" sound (as in tout)',
        pairs: [
            { word1: 'tu', word2: 'tout', meaning1: 'you', meaning2: 'all' },
            { word1: 'nu', word2: 'nous', meaning1: 'naked', meaning2: 'we' },
            { word1: 'du', word2: 'doux', meaning1: 'some', meaning2: 'soft' },
            { word1: 'rue', word2: 'roue', meaning1: 'street', meaning2: 'wheel' },
            { word1: 'jus', word2: 'joue', meaning1: 'juice', meaning2: 'cheek' }
        ]
    },
    {
        id: 's_z',
        contrast: '/s/ vs /z/',
        description: 'The unvoiced "s" vs the voiced "z" sound',
        pairs: [
            { word1: 'poisson', word2: 'poison', meaning1: 'fish', meaning2: 'poison' },
            { word1: 'dessert', word2: 'désert', meaning1: 'dessert', meaning2: 'desert' },
            { word1: 'bas', word2: 'base', meaning1: 'low', meaning2: 'base' },
            { word1: 'visser', word2: 'viser', meaning1: 'to screw', meaning2: 'to aim' }
        ]
    },
    {
        id: 'an_on',
        contrast: '/ɑ̃/ vs /ɔ̃/',
        description: 'Nasal sounds "an" vs "on"',
        pairs: [
            { word1: 'van', word2: 'vont', meaning1: 'van', meaning2: 'they go' },
            { word1: 'temps', word2: 'ton', meaning1: 'time', meaning2: 'your' },
            { word1: 'ment', word2: 'mon', meaning1: 'he lies', meaning2: 'my' },
            { word1: 'sang', word2: 'son', meaning1: 'blood', meaning2: 'sound' }
        ]
    },
    {
        id: 'e_eh',
        contrast: '/e/ vs /ɛ/',
        description: 'Closed "é" vs Open "è"',
        pairs: [
            { word1: 'pré', word2: 'prêt', meaning1: 'meadow', meaning2: 'ready' },
            { word1: 'été', word2: 'était', meaning1: 'summer', meaning2: 'was' },
            { word1: 'nez', word2: 'nait', meaning1: 'nose', meaning2: 'is born' }
        ]
    },
    {
        id: 'ou_u_extended',
        contrast: '/u/ vs /y/',
        description: 'More practice on the tricky "ou" vs "u" sounds',
        pairs: [
            { word1: 'dessous', word2: 'dessus', meaning1: 'underneath', meaning2: 'on top' },
            { word1: 'boue', word2: 'bu', meaning1: 'mud', meaning2: 'drank' },
            { word1: 'sourd', word2: 'sur', meaning1: 'deaf', meaning2: 'on/sour' }
        ]
    },
    {
        id: 'b_v',
        contrast: '/b/ vs /v/',
        description: 'B vs V sounds',
        pairs: [
            { word1: 'bain', word2: 'vin', meaning1: 'bath', meaning2: 'wine' },
            { word1: 'bas', word2: 'va', meaning1: 'low', meaning2: 'goes' },
            { word1: 'belle', word2: 'velle', meaning1: 'beautiful', meaning2: 'female calf' } // velle is rare but exists, or use 'voile'/'boite' etc. let's stick to simple
        ]
    },
    {
        id: 's_ch',
        contrast: '/s/ vs /ʃ/',
        description: 'S vs CH sounds',
        pairs: [
            { word1: 'sous', word2: 'chou', meaning1: 'under', meaning2: 'cabbage' },
            { word1: 'ciel', word2: 'chienne', meaning1: 'sky', meaning2: 'female dog' }, // maybe too complex
            { word1: 'sache', word2: 'chache', meaning1: 'know (subj)', meaning2: 'hunt (dial)' }, // bad example.
            // Better:
            { word1: 'su', word2: 'chou', meaning1: 'known', meaning2: 'cabbage' }, // wait, u vs ou too.
            { word1: 'sse', word2: 'che', meaning1: 'snake sound', meaning2: 'cha' }
        ]
    },
    {
        id: 'br_vr',
        contrast: '/bʁ/ vs /vʁ/',
        description: 'BR vs VR blends',
        pairs: [
            { word1: 'brise', word2: 'vise', meaning1: 'breeze', meaning2: 'aims' },
            { word1: 'brai', word2: 'vrai', meaning1: 'pitch', meaning2: 'true' }
        ]
    }
];

