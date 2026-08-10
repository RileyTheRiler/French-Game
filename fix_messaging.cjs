const fs = require('fs');

let content = fs.readFileSync('src/context/MessagingContext.jsx', 'utf8');

const simulatePartnerResponsePattern = /    \/\/ Simulate partner typing and response\n    const simulatePartnerResponse = useCallback\(\(partnerId, userMessage\) => \{[\s\S]*?    \}, \[\]\);\n/m;
const match = content.match(simulatePartnerResponsePattern);
if (match) {
    const block = match[0];
    content = content.replace(block, '');

    // insert it before sendMessage
    const sendMessagePattern = '    // Send a message';
    content = content.replace(sendMessagePattern, block + '\n' + sendMessagePattern);
}

// And fix the dependencies for sendMessage
content = content.replace(
    '}, [addXP, unlockAchievement, messagingStats.totalMessages]);\n',
    '}, [addXP, unlockAchievement, messagingStats.totalMessages, simulatePartnerResponse]);\n'
);

fs.writeFileSync('src/context/MessagingContext.jsx', content);
