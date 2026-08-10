const fs = require('fs');
let content = fs.readFileSync('src/games/ConjugationBlitz.jsx', 'utf8');

const endGamePattern = /    const endGame = \(\) => \{[\s\S]*?    \};\n/m;
const match = content.match(endGamePattern);
if (match) {
    const block = match[0];
    content = content.replace(block, '');

    // insert it before the useEffect that calls it
    const useEffectPattern = '    // Timer Logic\n    useEffect(() => {';
    content = content.replace(useEffectPattern, block + '\n' + useEffectPattern);
}

// And fix the dependencies for the useEffect
content = content.replace(
    '    }, [status]);\n',
    '    }, [status, endGame]);\n'
);

fs.writeFileSync('src/games/ConjugationBlitz.jsx', content);
