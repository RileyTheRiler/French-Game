import { PERSONAS } from './PersonaDefinitions';

export class NPCSystem {
    constructor() {
        // Simple session-based memory: { npcId: { lastTopic: string, interactions: number, knownPlayerName: boolean } }
        this.memories = {};
    }

    getNPC(id) {
        return PERSONAS[id];
    }

    // Simulate "Agentic" response with pedagogical scaffolding
    async interact(npcId, userMessage) {
        const npc = this.getNPC(npcId);
        if (!npc) return { text: "...", sentiment: "neutral" };

        // Initialize memory if needed
        if (!this.memories[npcId]) {
            this.memories[npcId] = { interactions: 0, lastTopic: null, knownPlayerName: false };
        }
        const memory = this.memories[npcId];
        memory.interactions++;

        const userLower = userMessage.toLowerCase();

        // 1. Analyze Core Intent (Simple keyword matching for now)
        let responseText = "";
        let sentiment = "neutral";
        let pedagogy = {};

        // 2. Greeting / Context handling
        // If it's the very first interaction or hello
        if (memory.interactions === 1) {
            responseText = npc.greeting;
            sentiment = "happy";
        } else if (userLower.includes("je m'appelle")) {
            memory.knownPlayerName = true;
            responseText = `Enchanté ! Moi c'est ${npc.name}.`;
            sentiment = "happy";
        } else if (userLower.includes("bonjour") || userLower.includes("salut")) {
            responseText = `Re-bonjour ! On s'est déjà vus, non ?`;
        }
        // 3. Topic specific logic
        else if (userLower.includes("le baguette") || userLower.includes("la baguette")) {
            // Pedagogical correction
            if (userLower.includes("le baguette")) {
                responseText = "C'est *la* baguette. Une baguette, féminin.";
                sentiment = "concerned";
                pedagogy.hasCorrection = true;
            } else {
                responseText = "Oui, une excellente baguette tradition !";
                sentiment = "happy";
            }
            memory.lastTopic = "bread";
        } else {
            // Fallback scaffolding
            // In a full AI version, this calls an LLM
            responseText = `(AI ${npc.name} thinks about "${userMessage}"...) C'est intéressant. Dis-m'en plus.`;
        }

        // Update last topic if found
        if (userLower.includes("pain") || userLower.includes("baguette")) memory.lastTopic = "bread";

        return {
            text: responseText,
            sentiment: sentiment,
            pedagogy: pedagogy
        };
    }

    reactToQuiz(npcId, isCorrect) {
        const npc = this.getNPC(npcId) || this.getNPC('librarian'); // Default to librarian for stories

        if (isCorrect) {
            return {
                text: "Excellent ! C'est exactement ça.",
                sentiment: "happy"
            };
        } else {
            return {
                text: "Hmm, pas tout à fait. Essaie encore.",
                sentiment: "neutral"
            };
        }
    }
}

export const npcSystem = new NPCSystem();
