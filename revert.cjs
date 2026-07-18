const fs = require('fs');
fs.writeFileSync('src/context/ProgressContext.jsx', fs.readFileSync('src/context/ProgressContext.jsx.orig', 'utf8').replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n/g, '$1'));
fs.writeFileSync('src/components/FallingWords/FallingWordsGame.jsx', fs.readFileSync('src/components/FallingWords/FallingWordsGame.jsx.orig', 'utf8').replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> 6fc497749fb50d44ec751c63ecd2a683f4559701\n/g, '$1'));
