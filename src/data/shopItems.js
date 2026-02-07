export const SHOP_ITEMS = {
    CONSUMABLES: [
        {
            id: 'hint_token',
            name: 'Hint Token',
            description: 'Spend in Sentence Builder for an auto-placed word.',
            basePrice: 40,
            type: 'consumable',
            effect: { type: 'add_token', key: 'hint_token', amount: 1 },
            icon: '💡'
        },
        {
            id: 'double_xp',
            name: 'Double XP Potion',
            description: 'Earn 2x XP for the next 15 minutes.',
            basePrice: 100,
            type: 'consumable',
            effect: { type: 'double_xp', duration: 15 },
            icon: '⚡'
        },
        {
            id: 'xp_boost_30',
            name: 'Extended XP Brew',
            description: 'Boost XP gains for the next 30 minutes.',
            basePrice: 160,
            type: 'consumable',
            effect: { type: 'double_xp', duration: 30 },
            icon: '🧪'
        },
        {
            id: 'hint_pack_small',
            name: 'Small Hint Pack',
            description: 'Get 3 hints to use in any game mode.',
            basePrice: 50,
            type: 'consumable',
            effect: { type: 'add_hints', amount: 3 },
            icon: '💡'
        },
        {
            id: 'time_freeze',
            name: 'Time Freeze',
            description: 'Freeze the timer for 10 seconds in timed challenges.',
            basePrice: 100,
            type: 'consumable',
            effect: { type: 'add_powerup', key: 'time_freeze', amount: 1 },
            icon: '❄️'
        },
        {
            id: 'streak_freeze',
            name: 'Streak Freeze',
            description: 'Protect your streak for one day of inactivity.',
            basePrice: 200,
            type: 'consumable',
            effect: { type: 'add_streak_freeze', amount: 1 },
            icon: '🛡️'
        }
    ],
    COSMETICS: [
        {
            id: 'theme_dark_gold',
            name: 'Midnight Gold Theme',
            description: 'A luxurious dark theme with gold accents.',
            basePrice: 500,
            type: 'cosmetic',
            subType: 'theme',
            value: 'midnight-gold',
            icon: '🌙'
        },
        {
            id: 'avatar_frame_neon',
            name: 'Neon Frame',
            description: 'A glowing neon frame for your profile avatar.',
            basePrice: 300,
            type: 'cosmetic',
            subType: 'avatar_frame',
            value: 'neon_classic',
            icon: '🖼️'
        },
        {
            id: 'avatar_owl_detective',
            name: 'Detective Owl',
            description: 'Unlock the Detective Owl avatar for your profile.',
            basePrice: 400,
            type: 'cosmetic',
            subType: 'avatar',
            value: 'owl_detective',
            icon: '🦉'
        }
    ]
};
