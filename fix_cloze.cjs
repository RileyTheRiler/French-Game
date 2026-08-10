const fs = require('fs');
let content = fs.readFileSync('src/games/ClozeGame.jsx', 'utf8');

const loadNextPuzzlePattern = /    const loadNextPuzzle = \(\) => \{[\s\S]*?    \};\n/m;
const match = content.match(loadNextPuzzlePattern);
if (match) {
    const block = match[0];
    content = content.replace(block, '');

    const useEffectPattern = '    useEffect(() => {';
    content = content.replace(useEffectPattern, block + '\n' + useEffectPattern);
}

fs.writeFileSync('src/games/ClozeGame.jsx', content);
