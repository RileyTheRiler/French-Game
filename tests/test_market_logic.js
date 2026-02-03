import { getDailyShopSelection } from '../src/utils/market.js';
import { describe, it, expect } from 'vitest';

describe('Market Logic', () => {
    it('generates consistent shop selection for the same date', () => {
        const date1 = 'Mon Jan 01 2024';
        const selection1 = getDailyShopSelection(date1);
        const selection2 = getDailyShopSelection(date1);

        // Same date should yield exact same items
        expect(selection1.consumables).toEqual(selection2.consumables);
        expect(selection1.cosmetics).toEqual(selection2.cosmetics);
    });

    it('generates different shop selection for different dates', () => {
        const date1 = 'Mon Jan 01 2024';
        const date2 = 'Tue Jan 02 2024';
        const selection1 = getDailyShopSelection(date1);
        const selection2 = getDailyShopSelection(date2);

        // Different dates should likely yield different cosmetics (randomized)
        // Note: There's a tiny chance of collision, but highly unlikely with seeded RNG and shuffle
        expect(selection1.cosmetics).not.toEqual(selection2.cosmetics);
    });
});
