/**
 * PronunciationAnalyzer Service
 * 
 * Provides advanced, AI-style pronunciation analysis using phoneme-level comparison,
 * rhythm analysis, and personalized feedback generation.
 */

// Common French phoneme categories for targeted feedback
const PHONEME_CATEGORIES = {
    nasalVowels: ['ɑ̃', 'ɛ̃', 'œ̃', 'ɔ̃'],
    frontRoundedVowels: ['y', 'ø', 'œ'],
    backVowels: ['u', 'o', 'ɔ'],
    fricatives: ['ʃ', 'ʒ', 'ʁ'],
    liaison: ['z', 't', 'n', 'ʁ'],
    silent: ['h', 'e_final']
};

// Phoneme similarity groups (sounds that are commonly confused)
const SIMILAR_PHONEMES = {
    'u': ['y', 'u'],
    'y': ['u', 'i'],
    'ø': ['œ', 'ə'],
    'œ': ['ø', 'ɛ'],
    'ɑ̃': ['ɔ̃', 'a'],
    'ɛ̃': ['ɑ̃', 'ɛ'],
    'ɔ̃': ['ɑ̃', 'o'],
    'ʁ': ['r', 'h'],
    'ʒ': ['ʃ', 'dʒ'],
    'ʃ': ['ʒ', 'tʃ']
};

// French-specific pronunciation tips for common problem areas
const PHONEME_TIPS = {
    'ʁ': {
        name: 'French R',
        description: 'Uvular fricative - produced at the back of the throat',
        tip: 'Try gargling gently while saying "ah" - that\'s the throat position for the French R.',
        examples: ['rouge', 'Paris', 'merci']
    },
    'y': {
        name: 'French U',
        description: 'Close front rounded vowel',
        tip: 'Say "ee" but round your lips tightly as if saying "oo". Keep tongue forward.',
        examples: ['tu', 'rue', 'lune']
    },
    'ø': {
        name: 'EU sound (closed)',
        description: 'Close-mid front rounded vowel',
        tip: 'Say "ay" with very rounded lips. Like saying "uh" with pursed lips.',
        examples: ['deux', 'bleu', 'feu']
    },
    'œ': {
        name: 'EU sound (open)',
        description: 'Open-mid front rounded vowel',
        tip: 'Similar to "uh" in "fur" but with rounded lips. More open than ø.',
        examples: ['cœur', 'sœur', 'heure']
    },
    'ɑ̃': {
        name: 'Nasal AN',
        description: 'Nasal back vowel',
        tip: 'Say "ah" while letting air flow through your nose. Don\'t pronounce the N!',
        examples: ['enfant', 'France', 'vent']
    },
    'ɛ̃': {
        name: 'Nasal IN',
        description: 'Nasal front vowel',
        tip: 'Say "eh" while letting air flow through your nose. Mouth slightly smiles.',
        examples: ['vin', 'pain', 'main']
    },
    'ɔ̃': {
        name: 'Nasal ON',
        description: 'Nasal back rounded vowel',
        tip: 'Say "oh" with rounded lips while letting air through your nose.',
        examples: ['bon', 'nom', 'maison']
    },
    'ʒ': {
        name: 'French J',
        description: 'Voiced postalveolar fricative',
        tip: 'Like the "s" in "measure" or "vision". Softer than English "j".',
        examples: ['je', 'jardin', 'rouge']
    },
    'ʃ': {
        name: 'CH sound',
        description: 'Voiceless postalveolar fricative',
        tip: 'Like "sh" in "ship", but with lips slightly more rounded.',
        examples: ['chat', 'chaud', 'chose']
    }
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
};

/**
 * Parse IPA string into individual phonemes
 */
const parsePhonemes = (ipa) => {
    if (!ipa) return [];

    // Handle compound phonemes (nasals with combining marks, etc.)
    const phonemes = [];
    let i = 0;

    while (i < ipa.length) {
        let phoneme = ipa[i];

        // Check for combining diacritics or multi-character phonemes
        if (i + 1 < ipa.length) {
            const nextChar = ipa[i + 1];
            // Nasal vowel marks, length marks, etc.
            if (nextChar === '̃' || nextChar === 'ː' || nextChar === '̥') {
                phoneme += nextChar;
                i++;
            }
        }

        // Skip spaces and stress marks
        if (phoneme !== ' ' && phoneme !== 'ˈ' && phoneme !== 'ˌ' && phoneme !== '.') {
            phonemes.push(phoneme);
        }
        i++;
    }

    return phonemes;
};

/**
 * Normalize text for comparison (lowercase, remove punctuation)
 */
const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase()
        .replace(/[.,!?;:'"()\-]/g, '')
        .trim();
};

/**
 * Simple phonetic approximation from French text
 * This is a basic mapping - not perfect but useful for comparison
 */
const approximatePhonemes = (frenchText) => {
    const text = normalizeText(frenchText);
    const mappings = [
        [/ou/g, 'u'],
        [/au|eau/g, 'o'],
        [/ai|ei/g, 'ɛ'],
        [/eu|œu/g, 'ø'],
        [/an|am|en|em/g, 'ɑ̃'],
        [/in|im|ain|ein|un|um/g, 'ɛ̃'],
        [/on|om/g, 'ɔ̃'],
        [/oi/g, 'wa'],
        [/ch/g, 'ʃ'],
        [/gn/g, 'ɲ'],
        [/qu|q/g, 'k'],
        [/c(?=[eiy])/g, 's'],
        [/c/g, 'k'],
        [/g(?=[eiy])/g, 'ʒ'],
        [/j/g, 'ʒ'],
        [/r/g, 'ʁ'],
        [/ph/g, 'f'],
        [/é|è|ê|ë/g, 'e'],
        [/à|â/g, 'a'],
        [/î|ï/g, 'i'],
        [/ô/g, 'o'],
        [/û|ù/g, 'y'],
        [/ç/g, 's']
    ];

    let result = text;
    for (const [pattern, replacement] of mappings) {
        result = result.replace(pattern, replacement);
    }

    return result.split('').filter(c => c !== ' ');
};

/**
 * Analyze pronunciation comparing target word to spoken text
 * 
 * @param {Object} targetWord - Word object with french, ipa, etc.
 * @param {string} spokenText - Transcribed user speech
 * @returns {Object} Analysis results
 */
export const analyzePronunciation = (targetWord, spokenText) => {
    const target = normalizeText(targetWord.french);
    const spoken = normalizeText(spokenText);

    // Basic text match score
    const textDistance = levenshteinDistance(target, spoken);
    const textScore = Math.max(0, 100 - (textDistance / Math.max(target.length, 1)) * 100);

    // Phoneme analysis
    const targetPhonemes = targetWord.ipa ? parsePhonemes(targetWord.ipa) : approximatePhonemes(target);
    const spokenPhonemes = approximatePhonemes(spoken);

    const phonemeDistance = levenshteinDistance(targetPhonemes.join(''), spokenPhonemes.join(''));
    const phonemeScore = Math.max(0, 100 - (phonemeDistance / Math.max(targetPhonemes.length, 1)) * 50);

    // Identify problem phonemes
    const problemAreas = identifyProblemPhonemes(targetPhonemes, spokenPhonemes);

    // Generate phoneme breakdown with accuracy
    const phonemeBreakdown = generatePhonemeBreakdown(targetPhonemes, spokenPhonemes);

    // Calculate rhythm score (simplified - based on syllable count match)
    const targetSyllables = countSyllables(target);
    const spokenSyllables = countSyllables(spoken);
    const rhythmScore = Math.max(0, 100 - Math.abs(targetSyllables - spokenSyllables) * 25);

    // Combined score with weights
    const overallScore = Math.round(
        textScore * 0.4 +
        phonemeScore * 0.4 +
        rhythmScore * 0.2
    );

    // Generate feedback
    const feedback = generateFeedback(overallScore, problemAreas, targetWord);

    return {
        score: overallScore,
        textScore: Math.round(textScore),
        phonemeScore: Math.round(phonemeScore),
        rhythmScore: Math.round(rhythmScore),
        phonemeBreakdown,
        problemAreas,
        feedback,
        targetPhonemes,
        spokenPhonemes,
        isExactMatch: target === spoken
    };
};

/**
 * Count syllables in French text (approximation)
 */
const countSyllables = (text) => {
    const vowelPattern = /[aeiouyàâäéèêëïîôùûü]/gi;
    const matches = text.match(vowelPattern);
    return matches ? matches.length : 1;
};

/**
 * Identify which phonemes were problematic
 */
const identifyProblemPhonemes = (target, spoken) => {
    const problems = [];
    const targetSet = new Set(target);
    const spokenSet = new Set(spoken);

    for (const phoneme of targetSet) {
        if (!spokenSet.has(phoneme)) {
            // Check if a similar phoneme was used instead
            const similar = SIMILAR_PHONEMES[phoneme];
            const substitution = similar?.find(s => spokenSet.has(s));

            problems.push({
                phoneme,
                type: substitution ? 'substitution' : 'missing',
                substitution: substitution || null,
                category: getPhonemeCategory(phoneme),
                tips: PHONEME_TIPS[phoneme] || null
            });
        }
    }

    return problems;
};

/**
 * Get the category of a phoneme
 */
const getPhonemeCategory = (phoneme) => {
    for (const [category, phonemes] of Object.entries(PHONEME_CATEGORIES)) {
        if (phonemes.includes(phoneme)) {
            return category;
        }
    }
    return 'general';
};

/**
 * Generate a breakdown of each target phoneme with accuracy indicator
 */
const generatePhonemeBreakdown = (target, spoken) => {
    return target.map((phoneme, index) => {
        const isPresent = spoken.includes(phoneme);
        const wasSubstituted = !isPresent && SIMILAR_PHONEMES[phoneme]?.some(s => spoken.includes(s));

        let accuracy = 'incorrect';
        if (isPresent) {
            accuracy = 'correct';
        } else if (wasSubstituted) {
            accuracy = 'partial';
        }

        return {
            phoneme,
            index,
            accuracy,
            tips: PHONEME_TIPS[phoneme] || null
        };
    });
};

/**
 * Generate personalized feedback based on analysis
 */
const generateFeedback = (score, problemAreas, targetWord) => {
    const feedback = {
        summary: '',
        encouragement: '',
        specificTips: [],
        focusAreas: []
    };

    // Summary based on score
    if (score >= 90) {
        feedback.summary = 'Excellent pronunciation! Nearly perfect.';
        feedback.encouragement = 'You\'re mastering French sounds beautifully! 🌟';
    } else if (score >= 75) {
        feedback.summary = 'Good pronunciation with minor areas to polish.';
        feedback.encouragement = 'Great progress! A few tweaks will make it perfect.';
    } else if (score >= 50) {
        feedback.summary = 'Recognizable but needs practice on some sounds.';
        feedback.encouragement = 'You\'re on the right track! Let\'s focus on specific sounds.';
    } else {
        feedback.summary = 'Let\'s work on this word together.';
        feedback.encouragement = 'Don\'t worry! French sounds take practice. Listen and try again.';
    }

    // Specific tips from problem areas
    for (const problem of problemAreas.slice(0, 3)) {
        if (problem.tips) {
            feedback.specificTips.push({
                sound: problem.tips.name,
                tip: problem.tips.tip,
                examples: problem.tips.examples
            });
        }
        feedback.focusAreas.push(problem.category);
    }

    // Remove duplicate focus areas
    feedback.focusAreas = [...new Set(feedback.focusAreas)];

    return feedback;
};

/**
 * Get detailed hints for a specific phoneme
 */
export const getPhonemeHints = (phoneme) => {
    return PHONEME_TIPS[phoneme] || {
        name: phoneme,
        description: 'Standard French sound',
        tip: 'Listen carefully to native pronunciation and mimic.',
        examples: []
    };
};

/**
 * Generate practice recommendations based on user history
 */
export const generatePracticeRecommendations = (historyData) => {
    const { weakWords = {}, errorPatterns = {}, categoryStats = {} } = historyData;

    const recommendations = {
        focusPhonemes: [],
        suggestedCategories: [],
        dailyGoals: [],
        insights: []
    };

    // Analyze error patterns to find common problem phonemes
    const phonemeErrors = {};
    for (const [wordId, data] of Object.entries(weakWords)) {
        if (data.strength < 60) {
            // Track weak phonemes
            phonemeErrors[wordId] = (phonemeErrors[wordId] || 0) + 1;
        }
    }

    // Find categories with lower accuracy
    const categoryAccuracy = {};
    for (const [category, stats] of Object.entries(categoryStats)) {
        if (stats.attempts > 0) {
            categoryAccuracy[category] = stats.correct / stats.attempts;
        }
    }

    // Sort categories by accuracy (lowest first)
    const sortedCategories = Object.entries(categoryAccuracy)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 3)
        .map(([cat]) => cat);

    recommendations.suggestedCategories = sortedCategories;

    // Generate insights
    if (sortedCategories.length > 0) {
        recommendations.insights.push(
            `Focus on ${sortedCategories[0]} vocabulary - this area needs the most practice.`
        );
    }

    const totalAttempts = Object.values(categoryStats).reduce((sum, s) => sum + s.attempts, 0);
    if (totalAttempts > 50) {
        const overallAccuracy = Object.values(categoryStats).reduce((sum, s) => sum + s.correct, 0) / totalAttempts;
        if (overallAccuracy > 0.8) {
            recommendations.insights.push('Your overall accuracy is strong! Try increasing the difficulty.');
        }
    }

    // Daily goals
    recommendations.dailyGoals = [
        'Practice 5 words focusing on nasal vowels',
        'Record yourself saying 3 sentences',
        'Complete one rhythm training session'
    ];

    return recommendations;
};

/**
 * Analyze rhythm/timing of spoken phrase
 */
export const analyzeRhythm = (targetWord, recordingDurationMs, expectedDurationMs) => {
    if (!expectedDurationMs) {
        // Default expected duration based on syllable count
        const syllables = countSyllables(targetWord.french);
        expectedDurationMs = syllables * 250; // ~250ms per syllable
    }

    const ratio = recordingDurationMs / expectedDurationMs;

    let rhythmFeedback = '';
    let rhythmScore = 100;

    if (ratio < 0.7) {
        rhythmFeedback = 'Too fast! Try to slow down and pronounce each syllable clearly.';
        rhythmScore = 60;
    } else if (ratio > 1.5) {
        rhythmFeedback = 'A bit slow. Try to maintain a natural flow.';
        rhythmScore = 70;
    } else if (ratio >= 0.9 && ratio <= 1.1) {
        rhythmFeedback = 'Perfect timing! Great rhythm.';
        rhythmScore = 100;
    } else if (ratio >= 0.7 && ratio < 0.9) {
        rhythmFeedback = 'Slightly fast. Good energy, just a touch slower.';
        rhythmScore = 85;
    } else {
        rhythmFeedback = 'Good pace. Keep practicing for more natural flow.';
        rhythmScore = 80;
    }

    return {
        rhythmScore,
        rhythmFeedback,
        tempoRatio: ratio,
        suggestion: ratio < 1 ? 'slower' : ratio > 1.2 ? 'faster' : 'maintain'
    };
};

export default {
    analyzePronunciation,
    getPhonemeHints,
    generatePracticeRecommendations,
    analyzeRhythm
};
