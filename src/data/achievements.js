export const ACHIEVEMENTS = [
    {
        id: 'first_word',
        title: 'First Word',
        description: 'Learn your first vocabulary word.',
        icon: '📖',
        xpReward: 10,
        condition: (stats) => stats.wordsLearned >= 1
    },
    {
        id: 'vocab_10',
        title: 'Word Collector',
        description: 'Learn 10 vocabulary words.',
        icon: '📚',
        xpReward: 50,
        condition: (stats) => stats.wordsLearned >= 10
    },
    {
        id: 'vocab_50',
        title: 'Word Master',
        description: 'Learn 50 vocabulary words.',
        icon: '🏆',
        xpReward: 200,
        condition: (stats) => stats.wordsLearned >= 50
    },
    {
        id: 'streak_3',
        title: 'Getting Warmed Up',
        description: 'Maintain a 3-day streak.',
        icon: '🔥',
        xpReward: 30,
        condition: (stats) => stats.streak >= 3
    },
    {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak.',
        icon: '💪',
        xpReward: 100,
        condition: (stats) => stats.streak >= 7
    },
    {
        id: 'streak_30',
        title: 'Streak Master',
        description: 'Maintain a 30-day streak.',
        icon: '👑',
        xpReward: 500,
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
    }
];
