const fs = require('fs');
let content = fs.readFileSync('src/context/SocialContext.jsx', 'utf8');

content = content.replace(
    '        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),',
    '        // eslint-disable-next-line react-hooks/purity\n        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),'
);

fs.writeFileSync('src/context/SocialContext.jsx', content);
