/* eslint-disable no-unused-vars */
/**
 * ConversationAnalyzer - Analyzes free-form conversation transcripts
 * for fluency, vocabulary range, accuracy, and communication success.
 */

// Common French words to exclude from vocabulary complexity analysis
const STOP_WORDS = new Set([
    'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi',
    'ce', 'ça', 'cela', 'ceci', 'c\'est', 'est', 'sont', 'suis', 'es', 'êtes',
    'a', 'ai', 'as', 'ont', 'avons', 'avez', 'avoir', 'être',
    'ne', 'pas', 'plus', 'jamais', 'rien', 'personne',
    'oui', 'non', 'très', 'bien', 'mal', 'aussi', 'encore',
    'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'en',
    'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
    'notre', 'votre', 'leur', 'leurs', 'ce', 'cette', 'ces'
]);

// Common grammar error patterns to detect
const GRAMMAR_PATTERNS = [
    {
        id: 'article_gender',
        pattern: /\ble\s+(baguette|table|chaise|maison|voiture|fenêtre|porte|ville|rue|place)\b/gi,
        correction: 'la',
        message: 'Use "la" for feminine nouns'
    },
    {
        id: 'article_gender_masc',
        pattern: /\bla\s+(livre|pain|fromage|café|thé|vin|jardin|magasin|marché|bureau)\b/gi,
        correction: 'le',
        message: 'Use "le" for masculine nouns'
    },
    {
        id: 'je_veux_polite',
        pattern: /\bje\s+veux\b/gi,
        suggestion: 'je voudrais',
        message: '"Je voudrais" is more polite than "je veux"'
    },
    {
        id: 'missing_ne',
        pattern: /\bje\s+(?:sais|comprends|peux|veux|suis)\s+pas\b/gi,
        suggestion: 'include "ne"',
        message: 'In formal French, use "ne...pas" together'
    },
    {
        id: 'agreement_adjective',
        pattern: /\bune?\s+(?:grand|petit|beau|nouveau|vieux)\s+(?:fille|femme|maison|voiture)\b/gi,
        message: 'Adjectives must agree in gender with the noun'
    }
];

// Topic detection keywords
const TOPIC_KEYWORDS = {
    name: ['appelle', 'm\'appelle', 'nom', 'prénom', 'enchanté'],
    origin: ['viens', 'suis de', 'habite', 'pays', 'ville'],
    weather: ['temps', 'pleut', 'soleil', 'chaud', 'froid', 'beau', 'mauvais'],
    farewell: ['revoir', 'à bientôt', 'salut', 'bonne journée', 'à demain'],
    order: ['voudrais', 'prends', 'commander', 'café', 'croissant', 'menu'],
    price: ['combien', 'coûte', 'euros', 'cher', 'prix', 'addition'],
    payment: ['payer', 'carte', 'espèces', 'monnaie'],
    destination: ['où', 'aller', 'gare', 'station', 'musée', 'hôtel'],
    directions: ['gauche', 'droite', 'tout droit', 'tournez', 'continuez'],
    distance: ['loin', 'près', 'minutes', 'mètres', 'kilomètres'],
    confirmation: ['compris', 'merci', 'd\'accord', 'parfait', 'entendu'],
    reservation: ['réserver', 'table', 'réservation'],
    'party size': ['personnes', 'deux', 'trois', 'quatre', 'combien'],
    time: ['heure', 'heures', 'midi', 'soir', 'matin'],
    item: ['chemise', 'pantalon', 'robe', 'veste', 'chaussures'],
    size: ['taille', 'petit', 'moyen', 'grand', 'medium'],
    color: ['bleu', 'rouge', 'vert', 'noir', 'blanc', 'couleur'],
    fitting: ['essayer', 'cabine', 'va bien', 'trop'],
    purchase: ['prends', 'achète', 'payer'],
    experience: ['travaillé', 'expérience', 'ans', 'entreprise'],
    skills: ['compétences', 'sais', 'capable', 'maîtrise'],
    motivation: ['motivé', 'passionné', 'intéressé', 'pourquoi'],
    'future goals': ['avenir', 'objectifs', 'espère', 'voudrais'],
    opinion: ['pense', 'crois', 'avis', 'selon moi'],
    agreement: ['d\'accord', 'raison', 'exactement', 'absolument'],
    disagreement: ['pas d\'accord', 'mais', 'cependant', 'toutefois'],
    nuance: ['d\'un côté', 'de l\'autre', 'peut-être', 'dépend'],
    problem: ['problème', 'marche pas', 'cassé', 'broken'],
    details: ['depuis', 'quand', 'comment', 'exactement'],
    urgency: ['urgent', 'vite', 'immédiatement', 'maintenant'],
    solution: ['réparer', 'envoyer', 'résoudre', 'fixer'],
    'current weather': ['fait', 'pluie', 'soleil', 'nuageux', 'beau', 'froid', 'chaud'],
    preference: ['aime', 'préfère', 'adore', 'déteste'],
    comparison: ['hier', 'demain', 'mieux', 'pire', 'plus', 'moins']
};

/**
 * Analyze a conversation transcript
 * @param {Array} messages - Array of {text, isUser, timestamp} objects
 * @param {Object} prompt - The conversation prompt with success criteria
 * @returns {Object} Analysis results
 */
export function analyzeConversation(messages, prompt) {
    const userMessages = messages.filter(m => m.isUser);
    const npcMessages = messages.filter(m => !m.isUser && !m.isSystem);

    // Calculate metrics
    const fluencyMetrics = calculateFluency(userMessages);
    const vocabularyMetrics = analyzeVocabulary(userMessages);
    const accuracyMetrics = checkAccuracy(userMessages);
    const communicationMetrics = assessCommunication(userMessages, prompt);

    // Calculate overall score
    const overallScore = Math.round(
        (fluencyMetrics.score * 0.2) +
        (vocabularyMetrics.score * 0.25) +
        (accuracyMetrics.score * 0.25) +
        (communicationMetrics.score * 0.3)
    );

    // Determine XP earned
    const baseXP = prompt?.xpReward || 50;
    const earnedXP = Math.round(baseXP * (overallScore / 100));

    return {
        overallScore,
        earnedXP,
        fluency: fluencyMetrics,
        vocabulary: vocabularyMetrics,
        accuracy: accuracyMetrics,
        communication: communicationMetrics,
        totalTurns: userMessages.length,
        highlights: generateHighlights(userMessages, accuracyMetrics),
        suggestions: generateSuggestions(fluencyMetrics, vocabularyMetrics, accuracyMetrics)
    };
}

/**
 * Calculate fluency metrics based on response patterns
 */
function calculateFluency(userMessages) {
    if (userMessages.length === 0) {
        return { score: 0, avgResponseTime: 0, avgLength: 0, hesitations: 0 };
    }

    // Average message length (characters)
    const avgLength = userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length;

    // Count hesitation markers
    const hesitationPatterns = /\b(euh|um|uh|hmm|\.{3}|\?\?)\b/gi;
    const hesitations = userMessages.reduce((count, m) => {
        const matches = m.text.match(hesitationPatterns);
        return count + (matches ? matches.length : 0);
    }, 0);

    // Calculate response time if timestamps available
    let avgResponseTime = 0;
    if (userMessages.length > 1 && userMessages[0].timestamp) {
        const responseTimes = [];
        for (let i = 1; i < userMessages.length; i++) {
            if (userMessages[i].timestamp && userMessages[i - 1].timestamp) {
                responseTimes.push(userMessages[i].timestamp - userMessages[i - 1].timestamp);
            }
        }
        if (responseTimes.length > 0) {
            avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        }
    }

    // Score: 100 for ideal length (30-80 chars), penalize short/long responses and hesitations
    let lengthScore = avgLength >= 30 && avgLength <= 100 ? 100 :
        avgLength < 15 ? 40 :
            avgLength < 30 ? 70 :
                80; // longer is okay

    const hesitationPenalty = Math.min(hesitations * 5, 30);
    const score = Math.max(0, Math.min(100, lengthScore - hesitationPenalty));

    return {
        score,
        avgLength: Math.round(avgLength),
        hesitations,
        avgResponseTime: Math.round(avgResponseTime / 1000) // in seconds
    };
}

/**
 * Analyze vocabulary usage
 */
function analyzeVocabulary(userMessages) {
    const allText = userMessages.map(m => m.text.toLowerCase()).join(' ');
    const words = allText.match(/[\p{L}'-]+/gu) || [];

    // Filter out stop words and very short words
    const meaningfulWords = words.filter(w =>
        w.length > 2 && !STOP_WORDS.has(w.toLowerCase())
    );

    const uniqueWords = new Set(meaningfulWords.map(w => w.toLowerCase()));
    const totalWords = meaningfulWords.length;

    // Vocabulary diversity ratio
    const diversityRatio = totalWords > 0 ? uniqueWords.size / totalWords : 0;

    // Count "advanced" vocabulary (longer words, less common)
    const advancedWords = [...uniqueWords].filter(w => w.length >= 8);

    // Score based on unique words and diversity
    let score = Math.min(100,
        (uniqueWords.size * 5) + // 5 points per unique word
        (diversityRatio * 30) + // up to 30 for diversity
        (advancedWords.length * 10) // bonus for advanced vocab
    );

    return {
        score: Math.round(score),
        uniqueWords: uniqueWords.size,
        totalWords,
        diversityRatio: Math.round(diversityRatio * 100) / 100,
        advancedWords: advancedWords.slice(0, 5) // sample
    };
}

/**
 * Check grammar and spelling accuracy
 */
function checkAccuracy(userMessages) {
    const allText = userMessages.map(m => m.text).join(' ');
    const errors = [];

    // Check against known grammar patterns
    for (const pattern of GRAMMAR_PATTERNS) {
        const matches = allText.match(pattern.pattern);
        if (matches) {
            errors.push({
                type: pattern.id,
                found: matches[0],
                message: pattern.message,
                suggestion: pattern.suggestion || pattern.correction
            });
        }
    }

    // Basic spelling checks (common misspellings)
    const commonMisspellings = {
        'beaucoup': ['baucoup', 'bocoup', 'beaucop'],
        'aujourd\'hui': ['aujourdhui', 'ajordhui'],
        'merci': ['mercy', 'mersi'],
        'bonjour': ['bongour', 'bonjor'],
    };

    const lowerText = allText.toLowerCase();
    for (const [correct, wrongs] of Object.entries(commonMisspellings)) {
        for (const wrong of wrongs) {
            if (lowerText.includes(wrong)) {
                errors.push({
                    type: 'spelling',
                    found: wrong,
                    message: `Did you mean "${correct}"?`,
                    suggestion: correct
                });
            }
        }
    }

    // Score: 100 minus penalties for errors
    const score = Math.max(0, 100 - (errors.length * 15));

    return {
        score,
        errors,
        errorCount: errors.length
    };
}

/**
 * Assess communication success based on prompt goals
 */
function assessCommunication(userMessages, prompt) {
    if (!prompt || !prompt.expectedTopics) {
        return { score: 70, topicsCovered: [], goalAchieved: true };
    }

    const allText = userMessages.map(m => m.text.toLowerCase()).join(' ');
    const topicsCovered = [];

    // Check which expected topics were covered
    for (const topic of prompt.expectedTopics) {
        const keywords = TOPIC_KEYWORDS[topic] || [];
        const covered = keywords.some(kw => allText.includes(kw.toLowerCase()));
        if (covered) {
            topicsCovered.push(topic);
        }
    }

    // Check success criteria
    const criteria = prompt.successCriteria || { minTurns: 3, requiredTopics: [] };
    const meetsMinTurns = userMessages.length >= criteria.minTurns;
    const requiredTopicsMet = criteria.requiredTopics.every(t => topicsCovered.includes(t));
    const goalAchieved = meetsMinTurns && requiredTopicsMet;

    // Score based on coverage
    const topicCoverage = prompt.expectedTopics.length > 0
        ? topicsCovered.length / prompt.expectedTopics.length
        : 0.5;

    let score = Math.round(topicCoverage * 80);
    if (goalAchieved) score += 20;

    return {
        score: Math.min(100, score),
        topicsCovered,
        expectedTopics: prompt.expectedTopics,
        goalAchieved,
        meetsMinTurns
    };
}

/**
 * Generate highlights from the conversation
 */
function generateHighlights(userMessages, accuracyMetrics) {
    const highlights = [];

    // Find longest coherent sentence
    const longest = userMessages.reduce((max, m) =>
        m.text.length > max.length ? m.text : max, ''
    );
    if (longest.length > 20) {
        highlights.push({
            type: 'positive',
            label: 'Great sentence',
            text: longest.slice(0, 60) + (longest.length > 60 ? '...' : '')
        });
    }

    // Add errors as highlights to review
    for (const error of accuracyMetrics.errors.slice(0, 3)) {
        highlights.push({
            type: 'review',
            label: error.message,
            text: error.found,
            suggestion: error.suggestion
        });
    }

    return highlights;
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(fluency, vocabulary, accuracy) {
    const suggestions = [];

    if (fluency.avgLength < 25) {
        suggestions.push('Try to give longer, more detailed responses.');
    }

    if (fluency.hesitations > 2) {
        suggestions.push('Reduce filler words like "euh" - take a moment to think before typing.');
    }

    if (vocabulary.uniqueWords < 10) {
        suggestions.push('Try to use more varied vocabulary in your responses.');
    }

    if (accuracy.errorCount > 2) {
        suggestions.push('Review the grammar corrections shown above.');
    }

    if (suggestions.length === 0) {
        suggestions.push('Excellent work! Keep practicing to maintain your skills.');
    }

    return suggestions;
}

export default {
    analyzeConversation,
    TOPIC_KEYWORDS,
    GRAMMAR_PATTERNS
};
