export const analyzeConversation = (history) => {
    // eslint-disable-next-line no-unused-vars
    const npcMessages = history.filter(m => m.sender === 'npc');
    return {
        fluency: 0.8,
        vocabulary: 0.7,
        grammar: 0.9
    };
};
