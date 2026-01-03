export const ETYMOLOGY_DATA = {
    'b1': { // bonjour
        id: 'b1',
        word: 'bonjour',
        root: 'Latin: bonus (good) + diurnus (of the day)',
        cognate: 'Bonus, Journal',
        history: 'Originally meant strictly "good day" in a literal sense, it evolved into the standard greeting. "Jour" comes from "diurnum" (daytime), distinct from "dies" (calendar day).'
    },
    'b3': { // merci
        id: 'b3',
        word: 'merci',
        root: 'Latin: merces (wages, fee, price)',
        cognate: 'Mercy, Merchant, Commerce',
        history: 'Originally meant "payment" or "reward". In Old French, saying "grand merci" meant "great reward" (May God reward you). Over time, it shifted from a request for divine payment to a simple expression of gratitude.'
    },
    'f1': { // pomme
        id: 'f1',
        word: 'pomme',
        root: 'Latin: pomum (fruit)',
        cognate: 'Pomegranate (pomum granatum = seeded fruit), Pommel',
        history: 'Latin "pomum" meant any fruit. The specific word for apple was "malum". French kept "pomme" as the generic term for the most common fruit (apple), while "fruit" (fructus) became the category.'
    },
    'f3': { // fromage
        id: 'f3',
        word: 'fromage',
        root: 'Latin: formaticum (shaping [cheese])',
        cognate: 'Form, Format',
        history: 'The Latin "caseus" gave us "cheese" (English) and "queso" (Spanish). But in France, the focus was on the *mold* or *shape* ("forma") used to make it. "Formaticum" -> "Fromage".'
    },
    'a1': { // chat
        id: 'a1',
        word: 'chat',
        root: 'Latin: cattus',
        cognate: 'Cat',
        history: 'Replaced the Classical Latin "feles" (which gives us "feline"). "Cattus" was likely a loanword from North African languages, spreading through the empire as cats became popular mouse-catchers.'
    },
    'v1': { // manger
        id: 'v1',
        word: 'manger',
        root: 'Latin: manducare (to chew)',
        cognate: 'Mandible',
        history: 'Classical Latin "edere" (to eat) was replaced by "manducare" (to chew/chomp) in common speech. It\'s a more visceral, active word!'
    },
    'v2': { // boire
        id: 'v2',
        word: 'boire',
        root: 'Latin: bibere',
        cognate: 'Imbibe, Bibulous',
        history: 'Note the shift from "b" to "v/oi". This sound change is common in French evolution (habere -> avoir, debere -> devoir).'
    },
    'w6': { // soleil
        id: 'w6',
        word: 'soleil',
        root: 'Latin: soliculus (diminutive of sol)',
        cognate: 'Solar, Solstice',
        history: 'Vulgar Latin often preferred "cute" or small versions of words. Instead of just "sol" (sun), they said "soliculus" (little sun), which became "soleil".'
    }
};

export const getEtymology = (wordId) => {
    return ETYMOLOGY_DATA[wordId] || null;
};
