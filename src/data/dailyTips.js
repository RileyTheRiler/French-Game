/**
 * Daily Tips
 * A collection of tips that rotate daily to keep learning fresh.
 */

export const DAILY_TIPS = [
    // Cultural Tips
    {
        id: 'culture_1',
        category: 'culture',
        icon: '🇫🇷',
        title: 'La Bise',
        content: "In France, greeting friends with kisses on the cheek (la bise) is common. The number varies by region - 2 in Paris, up to 4 in some areas!",
        funFact: "Always start with the right cheek!"
    },
    {
        id: 'culture_2',
        category: 'culture',
        icon: '🥖',
        title: 'Bread Etiquette',
        content: "Never put bread on your plate in France - place it directly on the table. And never cut bread with a knife - tear it with your hands!",
        funFact: "The French buy 10 billion baguettes per year."
    },
    {
        id: 'culture_3',
        category: 'culture',
        icon: '☕',
        title: 'Le Café',
        content: "In France, 'un café' is always an espresso. Want a large coffee? Ask for 'un café allongé' or 'un américain'.",
        funFact: "Coffee with milk after lunch is considered strange!"
    },

    // Grammar Mnemonics
    {
        id: 'grammar_1',
        category: 'grammar',
        icon: '🧠',
        title: 'DR & MRS VANDERTRAMP',
        content: "Verbs that use 'être' in passé composé: Devenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Rentrer, Tomber, Retourner, Arriver, Mourir, Partir.",
        funFact: "Think of a married couple going on a trip!"
    },
    {
        id: 'grammar_2',
        category: 'grammar',
        icon: '📝',
        title: 'BANGS Adjectives',
        content: "Most adjectives go AFTER the noun, but BANGS adjectives go BEFORE: Beauty (beau), Age (vieux), Number (premier), Goodness (bon), Size (grand).",
        funFact: "Une grande maison, but une maison bleue."
    },
    {
        id: 'grammar_3',
        category: 'grammar',
        icon: '🔄',
        title: 'The Negation Sandwich',
        content: "French negation wraps around the verb like a sandwich: ne + verb + pas. Example: Je ne sais pas (I don't know).",
        funFact: "In casual speech, 'ne' is often dropped!"
    },

    // Pronunciation Tips
    {
        id: 'pronunciation_1',
        category: 'pronunciation',
        icon: '👄',
        title: 'Silent Letters',
        content: "Most consonants at the end of French words are silent: petit, grand, fait, parlez. But C, R, F, L are often pronounced (think: CaReFuL).",
        funFact: "Some words have evolved to keep silent letters!"
    },
    {
        id: 'pronunciation_2',
        category: 'pronunciation',
        icon: '🎵',
        title: 'Liaison',
        content: "When a word ending in a consonant is followed by a word starting with a vowel, the consonant often links to the next word: 'les amis' sounds like 'lez-ami'.",
        funFact: "Liaison makes French sound more fluid."
    },
    {
        id: 'pronunciation_3',
        category: 'pronunciation',
        icon: '👃',
        title: 'Nasal Vowels',
        content: "French has nasal sounds that don't exist in English: an/en, on, in, un. Let air flow through your nose while saying them!",
        funFact: "Practice with: pain, bon, vin, un."
    },

    // Vocabulary Tricks
    {
        id: 'vocab_1',
        category: 'vocabulary',
        icon: '💡',
        title: '-tion Words',
        content: "Most English words ending in '-tion' are the same in French! Nation, information, station, communication - just pronounce them French-style.",
        funFact: "That's thousands of words you already know!"
    },
    {
        id: 'vocab_2',
        category: 'vocabulary',
        icon: '🔤',
        title: '-ly to -ment',
        content: "English adverbs ending in '-ly' usually become '-ment' in French: rapidly → rapidement, naturally → naturellement.",
        funFact: "The pattern is very reliable!"
    },
    {
        id: 'vocab_3',
        category: 'vocabulary',
        icon: '🎯',
        title: 'False Friends',
        content: "Watch out! 'Actuellement' means 'currently', not 'actually'. 'Librairie' is a bookshop, not a library (bibliothèque).",
        funFact: "These tricky words are called 'faux amis'."
    }
];

/**
 * Get the tip of the day based on the current date
 */
export const getTipOfTheDay = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
};

/**
 * Get tips by category
 */
export const getTipsByCategory = (category) => {
    return DAILY_TIPS.filter(tip => tip.category === category);
};
