const fs = require('fs');

// ProgressContext
let progContent = fs.readFileSync('src/context/ProgressContext.jsx', 'utf8');
progContent = progContent.replace('    // Check achievements when relevant stats change\n    }, [stats.xp, stats.unlockedAchievements, stats.dailyStats, stats.streak, stats.wordsLearned, showAchievement]);\n', '');
fs.writeFileSync('src/context/ProgressContext.jsx', progContent);

// FallingWordsGame.jsx
let fwContent = fs.readFileSync('src/components/FallingWords/FallingWordsGame.jsx', 'utf8');
fwContent = fwContent.replace(/<<<<<<< HEAD[\s\S]*?=======\n/g, '');
fwContent = fwContent.replace(/>>>>>>> [a-z0-9]+\n/g, '');
fs.writeFileSync('src/components/FallingWords/FallingWordsGame.jsx', fwContent);
