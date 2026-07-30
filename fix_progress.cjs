const fs = require('fs');
let content = fs.readFileSync('src/context/ProgressContext.jsx', 'utf8');

const searchStr = `    }, [stats.xp, stats.streak, stats.wordsLearned, stats.unlockedAchievements, showAchievement]);

    // Check achievements when relevant stats change
    }, [stats.xp, stats.unlockedAchievements, stats.dailyStats, stats.streak, stats.wordsLearned, showAchievement]);`;

const replaceStr = `    }, [stats.xp, stats.streak, stats.wordsLearned, stats.unlockedAchievements, showAchievement]);

    // Check achievements when relevant stats change`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync('src/context/ProgressContext.jsx', content);
