// Placeholder for NPC System
export const npcSystem = {
    // eslint-disable-next-line no-unused-vars
    generateResponse: (npc, input, previousMessages) => {
        return "Bonjour ! Comment ça va ?";
    },

    // eslint-disable-next-line no-unused-vars
    getInitialMessage: (npcName) => {
        return "Salut !";
    },

    // eslint-disable-next-line no-unused-vars
    analyzeSentiment: (text) => {
        return 'neutral';
    },

    // eslint-disable-next-line no-unused-vars
    generateDynamicTopic: (userHistory) => {
        return 'weather';
    },

    // eslint-disable-next-line no-unused-vars
    checkMemory: (topic, userLower) => {
        return null;
    }
};
