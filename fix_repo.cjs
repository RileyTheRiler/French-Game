const fs = require('fs');

let fw = fs.readFileSync('src/components/FallingWords/FallingWordsGame.jsx', 'utf8');

fw = fw.replace('<<<<<<< HEAD\nimport React, { useState, useEffect, useRef, useCallback } from \'react\';\nimport { useNavigate, useLocation } from \'react-router-dom\';\n=======\nimport React, { useState, useEffect, useRef, useMemo } from \'react\';\nimport React, { useState, useEffect, useRef } from \'react\';\nimport { useNavigate } from \'react-router-dom\';\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', 'import React, { useState, useEffect, useRef, useCallback, useMemo } from \'react\';\nimport { useNavigate, useLocation } from \'react-router-dom\';\n');

fw = fw.replace('<<<<<<< HEAD\nimport { Ghost, Swords, Clock, TrendingUp } from \'lucide-react\';\nimport { getDifficultyConfig } from \'../ui/DifficultyDial\';\n=======\nimport { calculateRewards } from \'../../utils/rewardSystem\';\nimport DifficultySlider from \'../ui/DifficultySlider\';\nimport { playWordAudio } from \'../../utils/audio\';\nimport { scorePronunciation } from \'../../utils/phonetics\';\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', 'import { Ghost, Swords, Clock, TrendingUp } from \'lucide-react\';\nimport { getDifficultyConfig } from \'../ui/DifficultyDial\';\nimport { calculateRewards } from \'../../utils/rewardSystem\';\nimport DifficultySlider from \'../ui/DifficultySlider\';\nimport { playWordAudio } from \'../../utils/audio\';\nimport { scorePronunciation } from \'../../utils/phonetics\';\n');

fw = fw.replace('<<<<<<< HEAD\n\n// Time Attack Constants\n=======\n// Time Attack Constants\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', '\n// Time Attack Constants\n');

fw = fw.replace('<<<<<<< HEAD\n    const { getDueWords, updateWordProgress } = useVocabulary();\n    const { addXP, addCoins, updateDailyStat, incrementStat } = useProgress();\n    const { offlineAudio } = useProgress();\n=======\n    const { getPracticeQueue, updateWordProgress, markWordSeen } = useVocabulary();\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', '    const { addXP, addCoins, updateDailyStat, incrementStat, logWordAttempt, globalDifficulty, difficultySettings, offlineAudio } = useProgress();\n    const { getDueWords, getPracticeQueue, updateWordProgress, getWeightedPracticeWords, vocabulary, markWordSeen } = useVocabulary();\n');

fw = fw.replace('<<<<<<< HEAD\n        const words = getPracticeQueue(\'fallingWords\', 40);\n        const weighted = getWeightedPracticeWords ? getWeightedPracticeWords(40) : getDueWords();\n        const words = weighted && weighted.length ? weighted : getDueWords();\n=======\n        const words = getPracticeQueue(\'fallingWords\', 40);\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', '        const practiceWords = getPracticeQueue(\'fallingWords\', 40);\n        const weighted = getWeightedPracticeWords ? getWeightedPracticeWords(40) : getDueWords();\n        const words = weighted && weighted.length ? weighted : getDueWords();\n');

fw = fw.replace('<<<<<<< HEAD\n    }, [isRivalsMode, gameOver]);\n=======\n        listenModeRef.current = listenMode;\n    }, [listenMode]);\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', '    }, [isRivalsMode, gameOver]);\n    useEffect(() => {\n        listenModeRef.current = listenMode;\n    }, [listenMode]);\n');

fw = fw.replace('<<<<<<< HEAD\n            categoryResponse: getCategoryResponse(randomWord.category)\n=======\n            target: randomWord\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', '            categoryResponse: getCategoryResponse(randomWord.category),\n            target: randomWord,\n');

fw = fw.replace('<<<<<<< HEAD\n            spawnTime: performance.now()\n=======\n            spawnedAt: now,\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n', '            spawnTime: performance.now(),\n            spawnedAt: now,\n');

fw = fw.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n/g, '$1');

fs.writeFileSync('src/components/FallingWords/FallingWordsGame.jsx', fw);

let progCtx = fs.readFileSync('src/context/ProgressContext.jsx', 'utf8');

// Instead of string replaces or loops, let's just use regex to remove the merge conflict and line 359 which caused Expected ']' but found '.'
progCtx = progCtx.replace(/<<<<<<< HEAD\n    \/\/ Check achievements when relevant stats change\n    \}, \[stats\.xp, stats\.unlockedAchievements, stats\.dailyStats, stats\.streak, stats\.wordsLearned, showAchievement\]\);\n=======\n    \}, \[stats\.xp, stats\.streak, stats\.wordsLearned, stats\.unlockedAchievements, showAchievement\]\);\n>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n/g, '');

progCtx = progCtx.replace('    }, [stats.xp, stats.streak, stats.wordsLearned, stats.unlockedAchievements, showAchievement]);\n\n    // Check achievements when relevant stats change\n    }, [stats.xp, stats.unlockedAchievements, stats.dailyStats, stats.streak, stats.wordsLearned, showAchievement]);\n', '    }, [stats.xp, stats.streak, stats.wordsLearned, stats.unlockedAchievements, showAchievement]);\n');

fs.writeFileSync('src/context/ProgressContext.jsx', progCtx);
