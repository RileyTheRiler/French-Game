import { SHOP_ITEMS } from '../data/shopItems';

// Seeded random number generator for consistent daily results
const seededRandom = (seed) => {
    const mask = 0xffffffff;
    let m_w = (123456789 + seed) & mask;
    let m_z = (987654321 - seed) & mask;

    return () => {
        m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
        m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
        let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
        result /= 4294967296;
        return result;
    };
};

export const getDailyShopSelection = (dateString) => {
    // Create a seed based on the date string (e.g., "Mon Jan 01 2024")
    // Simple hash of the string to get an integer seed
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
        seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
        seed |= 0;
    }

    const rng = seededRandom(seed);

    // Always include consumables
    const dailyItems = [...SHOP_ITEMS.CONSUMABLES];

    // Select 2 random cosmetics
    const availableCosmetics = [...SHOP_ITEMS.COSMETICS];
    const selectedCosmetics = [];

    // Shuffle cosmetics using our seeded RNG
    for (let i = availableCosmetics.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [availableCosmetics[i], availableCosmetics[j]] = [availableCosmetics[j], availableCosmetics[i]];
    }

    // specific logic: pick 2 cosmetics
    selectedCosmetics.push(...availableCosmetics.slice(0, 2));

    return {
        consumables: dailyItems,
        cosmetics: selectedCosmetics
    };
};
