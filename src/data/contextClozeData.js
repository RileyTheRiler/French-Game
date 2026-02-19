/**
 * Context-Based Cloze Data & Generator
 * 
 * Provides authentic fill-in-the-blank exercises using real sentences
 * from stories and conversations for improved vocabulary retention.
 */

import { STORIES } from './stories';
import { SCENARIOS } from './conversationScenarios';
import { vocabularyList } from './vocabulary';

/**
 * Tokenize French text into word objects
 */
const tokenizeFrench = (text) => {
    if (!text) return [];

    // Handle contractions like J'ai, l'eau, c'est
    const tokens = text
        .toLowerCase()
        .replace(/[.,!?;:"]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 1);

    return tokens.map(t => ({ french: t, english: '' }));
};

/**
 * Extract complete sentences from story content
 */
const extractStorySentences = () => {
    const sentences = [];

    STORIES.forEach(story => {
        let currentSentence = { french: '', english: '', words: [], storyId: story.id, level: story.level };

        story.content.forEach(wordObj => {
            currentSentence.french += wordObj.word + (wordObj.word.match(/[.,!?;:]/) ? '' : ' ');
            currentSentence.english += wordObj.translation + (wordObj.translation ? ' ' : '');
            if (wordObj.word && !wordObj.word.match(/^[.,!?;:]$/)) {
                currentSentence.words.push({
                    french: wordObj.word.toLowerCase().replace(/[.,!?;:]/g, ''),
                    english: wordObj.translation?.toLowerCase() || ''
                });
            }

            // End of sentence
            if (wordObj.word.match(/[.!?]$/)) {
                currentSentence.french = currentSentence.french.trim();
                currentSentence.english = currentSentence.english.trim();
                if (currentSentence.words.length >= 3) {
                    sentences.push({ ...currentSentence, source: 'story' });
                }
                currentSentence = { french: '', english: '', words: [], storyId: story.id, level: story.level };
            }
        });
    });

    return sentences;
};

/**
 * Extract sentences from conversation dialog options
 */
const extractConversationSentences = () => {
    const sentences = [];

    SCENARIOS.forEach(scenario => {
        const difficulty = scenario.difficulty === 'Beginner' ? 1 : scenario.difficulty === 'Intermediate' ? 2 : 3;

        // Initial message
        if (scenario.initialMessage) {
            sentences.push({
                french: scenario.initialMessage,
                english: '', // No direct translation available
                words: tokenizeFrench(scenario.initialMessage),
                scenarioId: scenario.id,
                level: difficulty,
                source: 'conversation',
                speaker: scenario.initialSpeaker
            });
        }

        // Node messages and options
        Object.values(scenario.nodes).forEach(node => {
            if (node.message) {
                sentences.push({
                    french: node.message,
                    english: '',
                    words: tokenizeFrench(node.message),
                    scenarioId: scenario.id,
                    level: difficulty,
                    source: 'conversation',
                    speaker: node.speaker
                });
            }

            (node.options || []).forEach(option => {
                if (option.text && option.text.length > 10) {
                    sentences.push({
                        french: option.text,
                        english: '',
                        words: tokenizeFrench(option.text),
                        scenarioId: scenario.id,
                        level: difficulty,
                        source: 'conversation',
                        isUserOption: true
                    });
                }
            });
        });
    });

    return sentences;
};

/**
 * Build index mapping vocabulary words to sentences containing them
 */
const buildWordSentenceIndex = (sentences) => {
    const index = {};

    sentences.forEach((sentence) => {
        sentence.words.forEach(wordObj => {
            const normalizedWord = wordObj.french.toLowerCase().replace(/[']/g, "'");

            // Try to match against vocabulary
            vocabularyList.forEach(vocabWord => {
                const vocabFrench = vocabWord.french.toLowerCase();

                if (normalizedWord === vocabFrench ||
                    normalizedWord.includes(vocabFrench) ||
                    vocabFrench.includes(normalizedWord)) {
                    if (!index[vocabWord.id]) {
                        index[vocabWord.id] = [];
                    }
                    // Avoid duplicates
                    if (!index[vocabWord.id].some(s => s.french === sentence.french)) {
                        index[vocabWord.id].push(sentence);
                    }
                }
            });
        });
    });

    return index;
};

// Build the data on module load
const allSentences = [...extractStorySentences(), ...extractConversationSentences()];
const wordSentenceIndex = buildWordSentenceIndex(allSentences);

/**
 * Get sentences containing a specific vocabulary word
 * @param {string} wordId - Vocabulary word ID
 * @param {number} maxLevel - Maximum difficulty level (1-3)
 * @returns {Array} Array of sentence objects
 */
export const getSentencesForWord = (wordId, maxLevel = 3) => {
    const sentences = wordSentenceIndex[wordId] || [];
    return sentences.filter(s => s.level <= maxLevel);
};

/**
 * Generate a context-based cloze exercise for a specific word
 * @param {object} word - Vocabulary word object with id, french, english, category
 * @param {number} difficulty - 1=easy, 2=medium, 3=hard
 * @returns {object|null} Cloze exercise or null if no context available
 */
export const generateContextCloze = (word, difficulty = 1) => {
    if (!word || !word.id) return null;

    // Get sentences containing this word
    const sentences = getSentencesForWord(word.id, difficulty + 1);
    if (sentences.length === 0) return null;

    // Pick a random sentence
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];

    // Find the target word position in the sentence
    const wordPattern = new RegExp(`\\b${word.french}\\b`, 'gi');
    const match = sentence.french.match(wordPattern);

    if (!match) {
        // Word might be in a different form (conjugation, plural, etc.)
        // Try a fuzzy match
        const tokens = sentence.french.split(/\s+/);
        const matchedToken = tokens.find(t =>
            t.toLowerCase().includes(word.french.toLowerCase().slice(0, 3))
        );
        if (!matchedToken) return null;
    }

    // Create the cloze question (replace word with blank)
    const clozeQuestion = sentence.french.replace(wordPattern, '_____');

    // If no replacement happened, skip
    if (clozeQuestion === sentence.french) return null;

    // Generate distractors from same category
    const distractors = vocabularyList
        .filter(w =>
            w.category === word.category &&
            w.id !== word.id &&
            w.french !== word.french
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.french);

    // Fallback distractors if not enough from same category
    if (distractors.length < 3) {
        const additionalDistractors = vocabularyList
            .filter(w => w.id !== word.id && !distractors.includes(w.french))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - distractors.length)
            .map(w => w.french);
        distractors.push(...additionalDistractors);
    }

    return {
        type: 'context_cloze',
        question: clozeQuestion,
        answer: word.french,
        translation: sentence.english || `(from ${sentence.source})`,
        options: [word.french, ...distractors].sort(() => Math.random() - 0.5),
        wordId: word.id,
        source: sentence.source,
        sourceId: sentence.storyId || sentence.scenarioId,
        difficulty,
        focus: 'vocabulary'
    };
};

/**
 * Generate multiple context cloze exercises from due words
 * @param {Array} dueWords - Array of vocabulary words due for review
 * @param {number} count - Number of exercises to generate
 * @returns {Array} Array of cloze exercises
 */
export const generateContextClozeSession = (dueWords, count = 5) => {
    const exercises = [];
    const usedWordIds = new Set();

    // Shuffle due words
    const shuffled = [...dueWords].sort(() => Math.random() - 0.5);

    for (const word of shuffled) {
        if (exercises.length >= count) break;
        if (usedWordIds.has(word.id)) continue;

        const exercise = generateContextCloze(word, 2);
        if (exercise) {
            exercises.push(exercise);
            usedWordIds.add(word.id);
        }
    }

    return exercises;
};

// Export sentence count for debugging/stats
export const getContextClozeStats = () => ({
    totalSentences: allSentences.length,
    indexedWords: Object.keys(wordSentenceIndex).length,
    storySentences: allSentences.filter(s => s.source === 'story').length,
    conversationSentences: allSentences.filter(s => s.source === 'conversation').length
});
