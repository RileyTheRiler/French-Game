/* eslint-disable no-unused-vars */
// Podcast Mode data and utilities
// Generates playlists for audio-only learning sessions

import { vocabularyList } from './vocabulary';

export const PLAYBACK_SPEEDS = [
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
];

export const SESSION_TYPES = {
    VOCABULARY_REVIEW: 'vocabulary_review',
    SENTENCE_PRACTICE: 'sentence_practice',
    MIXED: 'mixed',
};

export const SESSION_TEMPLATES = {
    [SESSION_TYPES.VOCABULARY_REVIEW]: {
        name: 'Vocabulary Review',
        description: 'Listen to vocabulary words with translations',
        icon: '📚',
        itemsPerSession: 20,
        includeExamples: false,
    },
    [SESSION_TYPES.SENTENCE_PRACTICE]: {
        name: 'Sentence Practice',
        description: 'Listen to example sentences in context',
        icon: '💬',
        itemsPerSession: 15,
        includeExamples: true,
    },
    [SESSION_TYPES.MIXED]: {
        name: 'Mixed Review',
        description: 'Words and sentences for complete immersion',
        icon: '🎧',
        itemsPerSession: 25,
        includeExamples: true,
    },
};

/**
 * Generate a podcast playlist based on options
 * @param {Object} options - Playlist generation options
 * @param {string} options.sessionType - Type of session (vocabulary_review, sentence_practice, mixed)
 * @param {string} options.category - Filter by vocabulary category (optional)
 * @param {string} options.cefr - Filter by CEFR level (optional)
 * @returns {Array} Playlist items with audio URLs and text
 */
export function generatePodcastPlaylist(options = {}) {
    const {
        sessionType = SESSION_TYPES.MIXED,
        category = null,
        cefr = null,
    } = options;

    const template = SESSION_TEMPLATES[sessionType];

    // Filter vocabulary
    let filteredVocab = [...vocabularyList];

    if (category) {
        filteredVocab = filteredVocab.filter(v => v.category === category);
    }

    if (cefr) {
        filteredVocab = filteredVocab.filter(v => v.cefr === cefr);
    }

    // Shuffle and limit
    const shuffled = filteredVocab.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, template.itemsPerSession);

    // Build playlist
    const playlist = [];

    selected.forEach((vocab, index) => {
        // Add the word
        playlist.push({
            id: `${vocab.id}-word`,
            type: 'word',
            french: vocab.french,
            english: vocab.english,
            audioUrl: vocab.audioUrl,
            displayText: vocab.french,
            translation: vocab.english,
            ipa: vocab.ipa,
            index: playlist.length,
        });

        // Add example if included
        if (template.includeExamples && vocab.example) {
            playlist.push({
                id: `${vocab.id}-example`,
                type: 'example',
                french: vocab.example.french,
                english: vocab.example.english,
                audioUrl: buildTtsUrl(vocab.example.french),
                displayText: vocab.example.french,
                translation: vocab.example.english,
                index: playlist.length,
            });
        }
    });

    return playlist;
}

// TTS URL builder (same as vocabulary.js)
function buildTtsUrl(text) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${encodeURIComponent(text)}`;
}

export default {
    PLAYBACK_SPEEDS,
    SESSION_TYPES,
    SESSION_TEMPLATES,
    generatePodcastPlaylist,
};
