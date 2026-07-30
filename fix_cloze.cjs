const fs = require('fs');
let content = fs.readFileSync('src/games/ClozeGame.jsx', 'utf8');

const loadNextPuzzleRegex = /    const loadNextPuzzle = \(\) => \{[\s\S]*?    \};\n\n/;
const match = content.match(loadNextPuzzleRegex);
if (match) {
    content = content.replace(match[0], '');
    const useEffectRegex = /    useEffect\(\(\) => \{/;
    content = content.replace(useEffectRegex, match[0] + '    useEffect(() => {');
}
fs.writeFileSync('src/games/ClozeGame.jsx', content);
