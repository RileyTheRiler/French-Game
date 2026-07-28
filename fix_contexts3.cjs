const fs = require('fs');

// Fix ProgressContext.jsx
let progContent = fs.readFileSync('src/context/ProgressContext.jsx', 'utf8');
progContent = progContent.replace('    // Check achievements when relevant stats change\n    }, [stats.xp, stats.unlockedAchievements, stats.dailyStats, stats.streak, stats.wordsLearned, showAchievement]);\n', '');
fs.writeFileSync('src/context/ProgressContext.jsx', progContent);


// Fix FallingWordsGame.jsx - resolving ALL merge conflicts globally
let fwContent = fs.readFileSync('src/components/FallingWords/FallingWordsGame.jsx', 'utf8');
// The simplest way to fix widespread corrupted merge conflicts if we didn't touch it is to use git reset --hard HEAD for it if we don't have local changes.
