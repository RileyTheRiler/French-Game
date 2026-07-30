const fs = require('fs');
let content = fs.readFileSync('src/data/grammar.js', 'utf8');
content = content.replace(/<<<<<<< HEAD\n/g, '');
fs.writeFileSync('src/data/grammar.js', content);
