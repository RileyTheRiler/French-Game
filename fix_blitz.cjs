const fs = require('fs');
let content = fs.readFileSync('src/games/ConjugationBlitz.jsx', 'utf8');

const endGameRegex = /    const endGame = \(\) => \{[\s\S]*?    \};\n\n/;
const match = content.match(endGameRegex);
if (match) {
    content = content.replace(match[0], '');
    const useEffectRegex = /    useEffect\(\(\) => \{[\s\S]*?if \(status === 'playing'\)/;
    content = content.replace(useEffectRegex, (m) => match[0] + m);
}

content = content.replace(
    /const endGame = \(\) => \{/,
    'const endGame = useCallback(() => {'
);
content = content.replace(
    /    addXP\(baseXP\);\n    \};/,
    '    addXP(baseXP);\n    }, [addXP]);'
);
content = content.replace(
    /    \}, \[status\]\);/,
    '    }, [status, endGame]);'
);
fs.writeFileSync('src/games/ConjugationBlitz.jsx', content);
