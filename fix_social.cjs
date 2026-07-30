const fs = require('fs');
let content = fs.readFileSync('src/context/SocialContext.jsx', 'utf8');

content = content.replace(
    /const \[activeChallenge, setActiveChallenge\] = useState\(\{[\s\S]*?endDate: new Date\(Date\.now\(\) \+ 3 \* 24 \* 60 \* 60 \* 1000\)\.toISOString\(\),[\s\S]*?\}\);/,
    `const [activeChallenge, setActiveChallenge] = useState(() => ({
        id: 'chal_weekly_xp',
        title: 'Team XP Weekly',
        target: 10000,
        current: 0,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        participants: []
    }));`
);
fs.writeFileSync('src/context/SocialContext.jsx', content);
