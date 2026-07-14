const fs = require('fs');
let grammar = fs.readFileSync('src/data/grammar.js', 'utf8');
grammar = grammar.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> [a-f0-9]+\n/g, '$1');
grammar = grammar.replace(/<<<<<<< HEAD\n/g, '');
fs.writeFileSync('src/data/grammar.js', grammar);

let prog = fs.readFileSync('src/context/ProgressContext.jsx', 'utf8');
prog = prog.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> [a-f0-9]+\n/g, '$1');
prog = prog.replace(/<<<<<<< HEAD\n/g, '');
fs.writeFileSync('src/context/ProgressContext.jsx', prog);
