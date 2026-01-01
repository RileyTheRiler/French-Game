const normalizeText = (input) => {
    if (!input) return '';
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zœæç'\-\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const phonemeReplacements = [
    ['eau', 'o'],
    ['ai', 'e'],
    ['ei', 'e'],
    ['er', 'e'],
    ['ez', 'e'],
    ['ou', 'u'],
    ['oi', 'wa'],
    ['au', 'o'],
    ['an', 'an'],
    ['en', 'an'],
    ['on', 'on'],
    ['un', 'un'],
    ['in', 'in'],
    ['gn', 'gn'],
    ['ch', 'sh'],
    ['ph', 'f'],
];

export const textToPhonemes = (text) => {
    let working = normalizeText(text);

    phonemeReplacements.forEach(([find, replace]) => {
        working = working.replaceAll(find, ` ${replace} `);
    });

    const tokens = working.split(' ').filter(Boolean);
    const phonemes = [];

    tokens.forEach(token => {
        if (token.length <= 2 || token.includes(' ')) {
            phonemes.push(token);
        } else {
            token.split('').forEach(letter => phonemes.push(letter));
        }
    });

    return phonemes;
};

const similarity = (target, spoken) => {
    if (target === spoken) return 1;
    if (!spoken) return 0;
    if (target[0] === spoken[0]) return 0.5;
    return 0;
};

export const scorePronunciation = (target, spoken) => {
    const targetPhonemes = textToPhonemes(target);
    const spokenPhonemes = textToPhonemes(spoken);

    const feedback = targetPhonemes.map((phoneme, idx) => {
        const heard = spokenPhonemes[idx];
        const score = similarity(phoneme, heard);
        return {
            phoneme,
            heard: heard || null,
            status: score === 1 ? 'match' : score === 0.5 ? 'close' : 'miss'
        };
    });

    const matches = feedback.filter(f => f.status === 'match').length;
    const accuracy = targetPhonemes.length > 0 ? Math.round((matches / targetPhonemes.length) * 100) : 0;

    return {
        accuracy,
        feedback,
        heard: spokenPhonemes
    };
};
