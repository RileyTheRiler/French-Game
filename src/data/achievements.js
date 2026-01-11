export const ACHIEVEMENTS = [
    {
        id: 'first_word',
        title: 'First Word',
        description: 'Learn your first vocabulary word.',
        icon: '📖',
        xpReward: 10,
        tier: 'Bronze',
        condition: (stats) => stats.wordsLearned >= 1
    },
    {
        id: 'vocab_10',
        title: 'Word Collector',
        description: 'Learn 10 vocabulary words.',
        icon: '📚',
        xpReward: 50,
        tier: 'Bronze',
        condition: (stats) => stats.wordsLearned >= 10
    },
    {
        id: 'vocab_50',
        title: 'Word Master',
        description: 'Learn 50 vocabulary words.',
        icon: '🏆',
        xpReward: 200,
        tier: 'Silver',
        condition: (stats) => stats.wordsLearned >= 50
    },
    {
        id: 'streak_3',
        title: 'Getting Warmed Up',
        description: 'Maintain a 3-day streak.',
        icon: '🔥',
        xpReward: 30,
        tier: 'Bronze',
        condition: (stats) => stats.streak >= 3
    },
    {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak.',
        icon: '💪',
        xpReward: 100,
        tier: 'Silver',
        condition: (stats) => stats.streak >= 7
    },
    {
        id: 'streak_30',
        title: 'Streak Master',
        description: 'Maintain a 30-day streak.',
        icon: '👑',
        xpReward: 500,
        tier: 'Gold',
        condition: (stats) => stats.streak >= 30
    },
    {
        id: 'first_story',
        title: 'Story Scholar',
        description: 'Complete your first story.',
        icon: '📜',
        xpReward: 25,
        condition: (stats) => stats.storiesCompleted >= 1
    },
    {
        id: 'first_conversation',
        title: 'Conversationalist',
        description: 'Complete your first conversation scenario.',
        icon: '💬',
        xpReward: 25,
        condition: (stats) => stats.conversationsCompleted >= 1
    },
    {
        id: 'level_5',
        title: 'Rising Star',
        description: 'Reach Level 5.',
        icon: '⭐',
        xpReward: 100,
        condition: (stats, level) => level >= 5
    },
    {
        id: 'level_10',
        title: 'French Enthusiast',
        description: 'Reach Level 10.',
        icon: '🌟',
        xpReward: 250,
        condition: (stats, level) => level >= 10
    },
    {
        id: 'rich',
        title: 'Coin Collector',
        description: 'Accumulate 500 coins.',
        icon: '💰',
        xpReward: 50,
        condition: (stats) => stats.coins >= 500
    },
    {
        id: 'perfect_quiz',
        title: 'Quiz Whiz',
        description: 'Answer a story quiz correctly on the first try.',
        icon: '🧠',
        xpReward: 30,
        condition: (stats) => stats.perfectQuizzes >= 1
    },
    {
        id: 'season_bronze',
        title: 'Season Scout',
        description: 'Earn 300 seasonal XP.',
        icon: '🍂',
        xpReward: 120,
        tier: 'Bronze',
        condition: (stats) => (stats.seasonalXp || 0) >= 300
    },
    {
        id: 'season_silver',
        title: 'Season Strider',
        description: 'Earn 800 seasonal XP.',
        icon: '❄️',
        xpReward: 250,
        tier: 'Silver',
        condition: (stats) => (stats.seasonalXp || 0) >= 800
    },
    {
        id: 'season_gold',
        title: 'Season Champion',
        description: 'Earn 1,500 seasonal XP.',
        icon: '🌸',
        xpReward: 400,
        tier: 'Gold',
        condition: (stats) => (stats.seasonalXp || 0) >= 1500
    },
    {
        id: 'all_stories',
        title: 'Story Time',
        description: 'Complete all 6 stories.',
        icon: '📚',
        xpReward: 150,
        condition: (stats) => stats.storiesCompleted >= 6
    },
    {
        id: 'vocab_100',
        title: 'Polyglot',
        description: 'Learn 100 vocabulary words.',
        icon: '🌍',
        xpReward: 300,
        condition: (stats) => stats.wordsLearned >= 100
    },
    {
        id: 'all_conversations',
        title: 'Conversation Master',
        description: 'Complete all 4 conversation scenarios.',
        icon: '🗣️',
        xpReward: 150,
        condition: (stats) => stats.conversationsCompleted >= 4
    },
    {
        id: 'sentence_builder_10',
        title: 'Sentence Architect',
        description: 'Complete 10 Sentence Builder challenges.',
        icon: '🏗️',
        xpReward: 75,
        condition: (stats) => stats.sentencesBuilt >= 10
    },
    {
        id: 'pronunciation_5',
        title: 'Voice of France',
        description: 'Practice pronunciation 5 times.',
        icon: '🎤',
        xpReward: 50,
        condition: (stats) => stats.pronunciationPractices >= 5
    },
    // Community & Messaging Achievements
    {
        id: 'first_writing',
        title: 'First Draft',
        description: 'Submit your first writing for correction.',
        icon: '✏️',
        xpReward: 30,
        condition: (stats) => stats.communityStats?.writingsSubmitted >= 1
    },
    {
        id: 'first_correction',
        title: 'Helpful Hand',
        description: 'Give your first correction to another learner.',
        icon: '✅',
        xpReward: 50,
        condition: (stats) => stats.communityStats?.correctionsGiven >= 1
    },
    {
        id: 'corrections_10',
        title: 'Grammar Guardian',
        description: 'Give 10 corrections to help others.',
        icon: '🛡️',
        xpReward: 150,
        condition: (stats) => stats.communityStats?.correctionsGiven >= 10
    },
    {
        id: 'first_penpal',
        title: 'First Pen Pal',
        description: 'Connect with your first language partner.',
        icon: '🤝',
        xpReward: 25,
        condition: (stats) => stats.messagingStats?.partnersConnected >= 1
    },
    {
        id: 'native_connection',
        title: 'Native Connection',
        description: 'Exchange 50 messages with language partners.',
        icon: '💬',
        xpReward: 100,
        condition: (stats) => stats.messagingStats?.totalMessages >= 50
    },
    {
        id: 'writing_star',
        title: 'Writing Star',
        description: 'Submit 5 writings for correction.',
        icon: '⭐',
        xpReward: 75,
        condition: (stats) => stats.communityStats?.writingsSubmitted >= 5
    },
    // Immersive Content Library Achievements
    {
        id: 'story_brancher',
        title: 'Pathfinder',
        description: 'Find a secret ending in Story Mode 2.0.',
        icon: '🗺️',
        xpReward: 50,
        condition: (stats) => Object.values(stats.branchingStoriesProgress || {}).some(p => p.endings?.length > 1)
    },
    {
        id: 'reader_1',
        title: 'Bookworm',
        description: 'Complete your first graded reader.',
        icon: '📖',
        xpReward: 40,
        condition: (stats) => Object.keys(stats.readingRoomProgress || {}).length >= 1
    },
    {
        id: 'shadow_master',
        title: 'Echo Expert',
        description: 'Get a 95%+ score in the Shadowing Lab.',
        icon: '🗣️',
        xpReward: 60,
        condition: (stats) => Object.values(stats.shadowingProgress || {}).some(p => p.bestScore >= 95)
    },
    {
        id: 'culture_fan',
        title: 'Francophile',
        description: 'Read 3 Cultural Deep Dive articles.',
        icon: '🇫🇷',
        xpReward: 100,
        condition: (stats) => (stats.cultureArticlesRead || []).length >= 3
    },
    {
        id: 'creator_1',
        title: 'Budding Author',
        description: 'Create your first custom lesson.',
        icon: '🎨',
        xpReward: 50,
        condition: (stats) => (stats.userLessonsCreated || 0) >= 1
    },
    // Timed Challenge Achievements
    {
        id: 'timed_sprinter',
        title: 'Timed Challenger',
        description: 'Finish a timed challenge before it expires.',
        icon: '⏱️',
        xpReward: 80,
        tier: 'Bronze',
        condition: (stats) => (stats.timedChallengesCompleted || 0) >= 1
    },
    {
        id: 'timed_marathoner',
        title: 'Challenge Conqueror',
        description: 'Complete 5 timed challenges.',
        icon: '🚀',
        xpReward: 180,
        tier: 'Silver',
        condition: (stats) => (stats.timedChallengesCompleted || 0) >= 5
    }
];
