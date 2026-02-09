/**
 * Simple text matching utilities
 */

export const calculateLevenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

export const normalizeString = (str) => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // remove punctuation
        .trim();
};

export const findBestMatch = (input, options, threshold = 0.8) => {
    const normalizedInput = normalizeString(input);
    let bestMatch = null;
    let highestScore = 0;

    options.forEach(option => {
        // Check triggers
        for (const trigger of option.triggers) {
            const normalizedTrigger = normalizeString(trigger);
            const distance = calculateLevenshtein(normalizedInput, normalizedTrigger);
            const maxLength = Math.max(normalizedInput.length, normalizedTrigger.length);
            const score = 1 - (distance / maxLength);

            if (score > highestScore && score >= threshold) {
                highestScore = score;
                bestMatch = { option, score, trigger };
            }
        }
    });

    return bestMatch;
};
