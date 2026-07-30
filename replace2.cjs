const fs = require('fs');
let content = fs.readFileSync('src/components/GoalSettingsModal.jsx', 'utf8');

content = content.replace(
    /<Button variant="ghost" size="icon" onClick={onClose}>/,
    '<Button variant="ghost" size="icon" onClick={onClose} aria-label="Close goal settings">'
);

fs.writeFileSync('src/components/GoalSettingsModal.jsx', content);
