export const vocabularyList = [
    { id: 'apple', french: 'pomme', english: 'apple', category: 'food' },
    { id: 'bread', french: 'pain', english: 'bread', category: 'food' },
    { id: 'cheese', french: 'fromage', english: 'cheese', category: 'food' },
    { id: 'water', french: 'eau', english: 'water', category: 'food' },
    { id: 'cat', french: 'chat', english: 'cat', category: 'animals' },
    { id: 'dog', french: 'chien', english: 'dog', category: 'animals' },
    { id: 'bird', french: 'oiseau', english: 'bird', category: 'animals' },
    { id: 'house', french: 'maison', english: 'house', category: 'objects' },
    { id: 'car', french: 'voiture', english: 'car', category: 'objects' },
    { id: 'book', french: 'livre', english: 'book', category: 'objects' },
    { id: 'computer', french: 'ordinateur', english: 'computer', category: 'tech' },
    { id: 'mouse', french: 'souris', english: 'mouse', category: 'tech' },
    { id: 'keyboard', french: 'clavier', english: 'keyboard', category: 'tech' },
    { id: 'screen', french: 'écran', english: 'screen', category: 'tech' },
    { id: 'friend', french: 'ami', english: 'friend', category: 'people' },
    { id: 'family', french: 'famille', english: 'family', category: 'people' },
    { id: 'love', french: 'amour', english: 'love', category: 'abstract' },
    { id: 'time', french: 'temps', english: 'time', category: 'abstract' },
    { id: 'happy', french: 'heureux', english: 'happy', category: 'adjectives' },
    { id: 'sad', french: 'triste', english: 'sad', category: 'adjectives' }
];

export const getVocabularyWithProgress = (savedProgress) => {
    return vocabularyList.map(word => ({
        ...word,
        learningData: savedProgress[word.id] || null
    }));
};
