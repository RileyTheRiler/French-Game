export const VERB_DATA = [
    {
        infinitive: 'aimer',
        translation: 'to like/love',
        group: 1,
        conjugations: {
            present: {
                je: 'aime',
                tu: 'aimes',
                il: 'aime',
                nous: 'aimons',
                vous: 'aimez',
                ils: 'aiment'
            },
            future: {
                je: 'aimerai',
                tu: 'aimeras',
                il: 'aimera',
                nous: 'aimerons',
                vous: 'aimerez',
                ils: 'aimeront'
            },
            imparfait: {
                je: 'aimais',
                tu: 'aimais',
                il: 'aimait',
                nous: 'aimions',
                vous: 'aimiez',
                ils: 'aimaient'
            },
            passe_compose: {
                auxiliary: 'avoir',
                participle: 'aimé'
            }
        }
    },
    {
        infinitive: 'finir',
        translation: 'to finish',
        group: 2,
        conjugations: {
            present: {
                je: 'finis',
                tu: 'finis',
                il: 'finit',
                nous: 'finissons',
                vous: 'finissez',
                ils: 'finissent'
            },
            future: {
                je: 'finirai',
                tu: 'finiras',
                il: 'finira',
                nous: 'finirons',
                vous: 'finirez',
                ils: 'finiront'
            },
            imparfait: {
                je: 'finissais',
                tu: 'finissais',
                il: 'finissait',
                nous: 'finissions',
                vous: 'finissiez',
                ils: 'finissaient'
            },
            passe_compose: {
                auxiliary: 'avoir',
                participle: 'fini'
            }
        }
    },
    {
        infinitive: 'être',
        translation: 'to be',
        group: 3,
        conjugations: {
            present: {
                je: 'suis',
                tu: 'es',
                il: 'est',
                nous: 'sommes',
                vous: 'êtes',
                ils: 'sont'
            },
            future: {
                je: 'serai',
                tu: 'seras',
                il: 'sera',
                nous: 'serons',
                vous: 'serez',
                ils: 'seront'
            },
            imparfait: {
                je: 'étais',
                tu: 'étais',
                il: 'était',
                nous: 'étions',
                vous: 'étiez',
                ils: 'étaient'
            },
            passe_compose: {
                auxiliary: 'avoir',
                participle: 'été'
            }
        }
    },
    {
        infinitive: 'avoir',
        translation: 'to have',
        group: 3,
        conjugations: {
            present: {
                je: 'ai',
                tu: 'as',
                il: 'a',
                nous: 'avons',
                vous: 'avez',
                ils: 'ont'
            },
            future: {
                je: 'aurai',
                tu: 'auras',
                il: 'aura',
                nous: 'aurons',
                vous: 'aurez',
                ils: 'auront'
            },
            imparfait: {
                je: 'avais',
                tu: 'avais',
                il: 'avait',
                nous: 'avions',
                vous: 'aviez',
                ils: 'avaient'
            },
            passe_compose: {
                auxiliary: 'avoir',
                participle: 'eu'
            }
        }
    },
    {
        infinitive: 'aller',
        translation: 'to go',
        group: 3,
        conjugations: {
            present: {
                je: 'vais',
                tu: 'vas',
                il: 'va',
                nous: 'allons',
                vous: 'allez',
                ils: 'vont'
            },
            future: {
                je: 'irai',
                tu: 'iras',
                il: 'ira',
                nous: 'irons',
                vous: 'irez',
                ils: 'iront'
            },
            imparfait: {
                je: 'allais',
                tu: 'allais',
                il: 'allait',
                nous: 'allions',
                vous: 'alliez',
                ils: 'allaient'
            },
            passe_compose: {
                auxiliary: 'être',
                participle: 'allé(e)(s)'
            }
        }
    },
    {
        infinitive: 'faire',
        translation: 'to do/make',
        group: 3,
        conjugations: {
            present: {
                je: 'fais',
                tu: 'fais',
                il: 'fait',
                nous: 'faisons',
                vous: 'faites',
                ils: 'font'
            },
            future: {
                je: 'ferai',
                tu: 'feras',
                il: 'fera',
                nous: 'ferons',
                vous: 'ferez',
                ils: 'feront'
            },
            imparfait: {
                je: 'faisais',
                tu: 'faisais',
                il: 'faisait',
                nous: 'faisions',
                vous: 'faisiez',
                ils: 'faisaient'
            },
            passe_compose: {
                auxiliary: 'avoir',
                participle: 'fait'
            }
        }
    }
];

export const PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
export const TENSES = [
    { id: 'present', label: 'Présent' },
    { id: 'future', label: 'Futur Simple' },
    { id: 'imparfait', label: 'Imparfait' }
    // Passé composé handling is different (aux + pp), skipping for blitz mode v1 unless special logic added
];
