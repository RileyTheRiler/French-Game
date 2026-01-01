const DEFAULT_LIMIT = 12;
const LAPSE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const PRACTICE_WEIGHTS = {
    flashcards: { due: 0.55, lapses: 0.25, new: 0.2 },
    dailyMix: { due: 0.45, lapses: 0.3, new: 0.25 },
    study: { due: 0.6, lapses: 0.25, new: 0.15 },
    fallingWords: { due: 0.4, lapses: 0.35, new: 0.25 },
    default: { due: 0.5, lapses: 0.25, new: 0.25 }
};

const shuffle = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};

const pickWords = (pool, count, usedIds) => {
    const available = shuffle(pool).filter(word => !usedIds.has(word.id));
    return available.slice(0, count);
};

export const buildPracticeQueue = (vocabulary, mode = 'default', limit = DEFAULT_LIMIT) => {
    const now = Date.now();
    const weights = PRACTICE_WEIGHTS[mode] || PRACTICE_WEIGHTS.default;
    const availableWords = vocabulary.filter(word => !word.snoozeUntil || word.snoozeUntil <= now);

    const pinned = availableWords.filter(word => word.pinned);
    const usedIds = new Set(pinned.map(word => word.id));

    const dueWords = availableWords.filter(word =>
        !usedIds.has(word.id) &&
        word.lastSeen &&
        word.nextReview <= now
    );

    const recentLapses = availableWords.filter(word =>
        !usedIds.has(word.id) &&
        word.lastLapsed &&
        now - word.lastLapsed <= LAPSE_WINDOW_MS
    );

    const newWords = availableWords.filter(word =>
        !usedIds.has(word.id) &&
        !word.lastSeen
    );

    const remainingSlots = Math.max(limit - pinned.length, 0);

    const bucketSizes = {
        due: Math.round(remainingSlots * weights.due),
        lapses: Math.round(remainingSlots * weights.lapses),
        new: Math.round(remainingSlots * weights.new)
    };

    const assigned = bucketSizes.due + bucketSizes.lapses + bucketSizes.new;
    if (assigned < remainingSlots) {
        bucketSizes.due += (remainingSlots - assigned);
    }

    const queue = [
        ...pinned,
        ...pickWords(dueWords, bucketSizes.due, usedIds),
        ...pickWords(recentLapses, bucketSizes.lapses, usedIds),
        ...pickWords(newWords, bucketSizes.new, usedIds)
    ];

    queue.forEach(word => usedIds.add(word.id));

    if (queue.length < limit) {
        const fillers = availableWords.filter(word => !usedIds.has(word.id));
        queue.push(...pickWords(fillers, limit - queue.length, usedIds));
    }

    return queue.slice(0, limit);
};
