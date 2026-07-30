const fs = require('fs');
let content = fs.readFileSync('src/context/MessagingContext.jsx', 'utf8');

let simulatePartnerResponseMatch = content.match(/(\s*\/\/ Simulate partner typing and response\s*const simulatePartnerResponse = useCallback\(\(partnerId, userMessage\) => \{[\s\S]*?\}, \[\]\);)/);

if (simulatePartnerResponseMatch) {
    let funcCode = simulatePartnerResponseMatch[0];
    content = content.replace(funcCode, '');
    let sendMessageMatch = content.match(/\s*\/\/ Send a message\s*const sendMessage = useCallback/);
    if (sendMessageMatch) {
        content = content.replace(sendMessageMatch[0], funcCode + '\n' + sendMessageMatch[0]);
    }
}

content = content.replace(
    /\}, \[addXP, unlockAchievement, messagingStats\.totalMessages\]\);/,
    '}, [addXP, unlockAchievement, messagingStats.totalMessages, simulatePartnerResponse]);'
);
fs.writeFileSync('src/context/MessagingContext.jsx', content);
