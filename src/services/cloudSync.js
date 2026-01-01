const CLOUD_PREFIX = 'frenchApp_cloud_';

const defaultState = () => ({
    progress: null,
    vocabulary: null,
    updatedAt: 0
});

const getRemoteKey = (userId) => `${CLOUD_PREFIX}${userId}`;

export const loadRemoteState = async (userId) => {
    if (!userId) return defaultState();
    const stored = localStorage.getItem(getRemoteKey(userId));
    return stored ? JSON.parse(stored) : defaultState();
};

export const saveRemoteState = async (userId, payload) => {
    if (!userId) return;
    const next = {
        ...payload,
        updatedAt: payload.updatedAt || Date.now()
    };
    localStorage.setItem(getRemoteKey(userId), JSON.stringify(next));
    return next;
};

const mergeInventory = (winnerInventory = {}, otherInventory = {}) => {
    const merged = { ...winnerInventory };
    Object.entries(otherInventory).forEach(([key, value]) => {
        const winnerValue = merged[key] || 0;
        merged[key] = Math.max(winnerValue, value);
    });
    return merged;
};

export const mergeProgress = (localProgress, remoteProgress) => {
    if (!remoteProgress) return localProgress;
    const localUpdated = localProgress?.updatedAt || 0;
    const remoteUpdated = remoteProgress?.updatedAt || 0;
    const winner = localUpdated >= remoteUpdated ? localProgress : remoteProgress;
    const other = winner === localProgress ? remoteProgress : localProgress;

    const mergedInventory = mergeInventory(winner?.inventory, other?.inventory);

    const streakSafe = Math.max(winner?.streak || 0, other?.streak || 0);
    return {
        ...winner,
        inventory: mergedInventory,
        streak: streakSafe,
        updatedAt: Math.max(localUpdated, remoteUpdated, Date.now())
    };
};

export const mergeVocabulary = (localVocabulary = [], remoteVocabulary = []) => {
    if (!remoteVocabulary.length) return localVocabulary;
    const byId = new Map();
    const handleWord = (word) => {
        const existing = byId.get(word.id);
        if (!existing) {
            byId.set(word.id, word);
            return;
        }
        const localUpdated = existing.updatedAt || 0;
        const incomingUpdated = word.updatedAt || 0;
        if (incomingUpdated > localUpdated) {
            byId.set(word.id, word);
        }
    };
    localVocabulary.forEach(handleWord);
    remoteVocabulary.forEach(handleWord);
    return Array.from(byId.values());
};

export const mergeState = (localState, remoteState) => {
    const localUpdated = localState?.updatedAt || 0;
    const remoteUpdated = remoteState?.updatedAt || 0;

    const mergedProgress = mergeProgress(localState.progress, remoteState.progress);
    const mergedVocabulary = mergeVocabulary(localState.vocabulary, remoteState.vocabulary);

    return {
        progress: mergedProgress,
        vocabulary: mergedVocabulary,
        updatedAt: Math.max(localUpdated, remoteUpdated, mergedProgress?.updatedAt || 0)
    };
};

export const exportPayload = (progress, vocabulary) => ({
    version: 1,
    createdAt: Date.now(),
    progress,
    vocabulary
});
