const fs = require('fs');
let content = fs.readFileSync('src/context/ProgressContext.jsx', 'utf8');

content = content.replace(
    '    // Check achievements when relevant stats change\n    }, [stats.xp, stats.unlockedAchievements, stats.dailyStats, stats.streak, stats.wordsLearned, showAchievement]);\n',
    '    // Check achievements when relevant stats change\n'
);

fs.writeFileSync('src/context/ProgressContext.jsx', content);
