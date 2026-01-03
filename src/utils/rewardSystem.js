const difficultyMultipliers = {
    Beginner: 1,
    Intermediate: 1.15,
    Advanced: 1.3,
    Challenge: 1.25
};

const getDifficultyMultiplier = (difficulty = 'Beginner') => difficultyMultipliers[difficulty] || 1;

const roundReward = (value) => Math.max(0, Math.round(value));

export const calculateRewards = (gameId, metrics = {}) => {
    let xp = 0;
    let coins = 0;
    const breakdown = [];

    switch (gameId) {
        case 'fallingWords': {
            const scoreFactor = (metrics.score || 0) / 6;
            const comboBonus = (metrics.maxCombo || 0) * 2.5;
            const survivalBonus = (metrics.livesRemaining || 0) * 6;
            const modeBonus = metrics.zenMode ? 8 : 15;

            xp = 20 + scoreFactor + comboBonus + survivalBonus + modeBonus;
            coins = 8 + (metrics.wordsCaught || 0) * 0.6 + (metrics.livesRemaining || 0) * 1.5;

            breakdown.push('Score driven payout with combo and survival bonuses.');
            break;
        }
        case 'flashcards': {
            const accuracy = metrics.total ? (metrics.correct || 0) / metrics.total : 0;
            const streakBoost = (metrics.bestStreak || 0) * 1.8;
            xp = 15 + (metrics.correct || 0) * 6 + accuracy * 20 + streakBoost;
            coins = 6 + accuracy * 10 + (metrics.total >= 10 ? 5 : 0);
            breakdown.push('Accuracy and streak focused study rewards.');
            break;
        }
        case 'studySession': {
            const accuracy = metrics.total ? (metrics.correct || 0) / metrics.total : 0;
            const streakBoost = (metrics.bestStreak || 0) * 1.2;
            xp = 12 + (metrics.correct || 0) * 5 + accuracy * 15 + streakBoost;
            coins = 5 + accuracy * 8 + (metrics.total > 8 ? 4 : 0);
            breakdown.push('Steady review rewards with streak boosters.');
            break;
        }
        case 'sentenceBuilder': {
            const sentenceLength = metrics.words || 0;
            const precision = Math.max(0, sentenceLength - (metrics.mistakes || 0));
            xp = 10 + sentenceLength * 4 + precision * 1.5;
            coins = 4 + sentenceLength + Math.max(0, precision - 2);
            breakdown.push('Longer, cleaner sentences award more.');
            break;
        }
        case 'conversation': {
            const multiplier = getDifficultyMultiplier(metrics.difficulty);
            const efficiencyBonus = Math.max(0, (metrics.steps || 0) - (metrics.mistakes || 0) * 0.5);
            xp = (metrics.baseXp || 40) * multiplier + efficiencyBonus * 2;
            coins = 10 * multiplier + Math.max(0, 6 - (metrics.mistakes || 0)) + (metrics.success ? 8 : 0);
            breakdown.push('Scenario difficulty and clean runs drive payouts.');
            break;
        }
        case 'story': {
            const multiplier = getDifficultyMultiplier(metrics.difficulty || 'Beginner');
            xp = (metrics.baseXp || 30) * multiplier + (metrics.quizPerfect ? 15 : 5);
            coins = 6 + (metrics.length || 0) * 0.5 + (metrics.quizPerfect ? 6 : 2);
            breakdown.push('Story depth and quiz performance rewards.');
            break;
        }
        case 'grammar': {
            const accuracy = metrics.total ? (metrics.correct || 0) / metrics.total : 0;
            const streakBoost = (metrics.bestStreak || 0) * 2;
            xp = 18 + (metrics.correct || 0) * 5 + accuracy * 20 + streakBoost;
            coins = 7 + accuracy * 10 + (metrics.total >= 8 ? 5 : 0);
            breakdown.push('Accuracy and streaks in drills boost rewards.');
            break;
        }
        case 'pronunciation': {
            const accuracy = metrics.total ? (metrics.successes || 0) / metrics.total : 0;
            xp = 14 + (metrics.successes || 0) * 6 + accuracy * 18;
            coins = 5 + accuracy * 12 + Math.max(0, metrics.successes - 3);
            breakdown.push('Consistent pronunciation wins and accuracy bonuses.');
            break;
        }
        case 'dailyMix': {
            const accuracy = metrics.total ? (metrics.correct || 0) / metrics.total : 0;
            xp = 20 + (metrics.correct || 0) * 8 + accuracy * 25;
            coins = 10 + accuracy * 15 + (metrics.correct >= metrics.total ? 12 : 0);
            breakdown.push('Interleaved mastery reward with completion bonus.');
            break;
        }
        default:
            xp = metrics.baseXp || 0;
            coins = metrics.baseCoins || 0;
            break;
    }

    if (metrics.streak) {
        xp += metrics.streak * 1.2;
        breakdown.push('Streak bonus applied.');
    }

    return {
        xp: roundReward(xp),
        coins: roundReward(coins),
        breakdown
    };
};
