import { vocabularyList } from '../data/vocabulary';

export const generateCloze = (level) => {
    // eslint-disable-next-line no-unused-vars
    const vocabulary = vocabularyList.filter(w => w.level <= level);
    // Simple placeholder logic
    return {
        question: "Le chat _____ sur le tapis.",
        answer: "dort",
        options: ["dort", "mange", "court", "parle"],
        translation: "The cat is sleeping on the rug."
    };
};

// eslint-disable-next-line no-unused-vars
export const generateErrorSpotting = (level) => {
    return {
        sentence: "Je suis aller au cinéma.",
        translation: "I went to the movies.",
        error: {
            target: "aller",
            correction: "allé",
            explanation: "Past participle agreement: 'Je suis allé' (masculine) or 'allée' (feminine)."
        }
    };
};
