import { getVocabularyByCategory } from '../data/vocabulary';

const CACHE_NAME = 'french-game-media';

export const isCategoryDownloaded = async (categoryId) => {
    if (!('caches' in window)) return false;

    // Check if we have at least one audio file associated with this category cached
    const vocab = getVocabularyByCategory(categoryId);
    if (!vocab.length) return true; // Empty category is "downloaded"

    const cache = await caches.open(CACHE_NAME);
    // Be efficient: check a few random samples
    const samples = vocab.slice(0, 3);
    for (const word of samples) {
        if (word.audio) {
            const match = await cache.match(word.audio);
            if (!match) return false;
        }
        if (word.image) {
            const match = await cache.match(word.image);
            if (!match) return false;
        }
    }
    return true;
};

export const downloadCategoryAssets = async (categoryId, onProgress) => {
    if (!('caches' in window)) throw new Error("Offline storage not supported");

    const vocab = getVocabularyByCategory(categoryId);
    const urls = [];

    vocab.forEach(word => {
        if (word.audio) urls.push(word.audio);
        if (word.image) urls.push(word.image);
    });

    const uniqueUrls = [...new Set(urls)];
    const total = uniqueUrls.length;
    let completed = 0;

    const cache = await caches.open(CACHE_NAME);

    // Fetch and cache each URL
    // We do this manually to track progress, rather than cache.addAll
    await Promise.all(uniqueUrls.map(async (url) => {
        try {
            // Check if already cached
            const existing = await cache.match(url);
            if (!existing) {
                await cache.add(url);
            }
        } catch (e) {
            console.warn(`Failed to cache ${url}`, e);
        } finally {
            completed++;
            if (onProgress) onProgress(completed / total);
        }
    }));

    return true;
};

export const deleteCategoryAssets = async (categoryId) => {
    if (!('caches' in window)) return;

    const vocab = getVocabularyByCategory(categoryId);
    const urls = new Set();
    vocab.forEach(word => {
        if (word.audio) urls.add(word.audio);
        if (word.image) urls.add(word.image);
    });

    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
        await cache.delete(url);
    }
    return true;
};
