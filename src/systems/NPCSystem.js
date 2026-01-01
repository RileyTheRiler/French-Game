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

    /**
     * Enhanced free-form conversation interaction
     * Generates contextual responses based on conversation prompts and user input
     */
    async interactFreeForm(npcId, userMessage, context = {}) {
        const { prompt, turnCount, previousMessages = [] } = context;
        const npc = this.getNPC(npcId) || { name: prompt?.npcName || 'NPC' };

        // Initialize conversation memory
        const memoryKey = `freeform_${npcId}_${prompt?.id || 'default'}`;
        if (!this.memories[memoryKey]) {
            this.memories[memoryKey] = {
                turns: 0,
                topicsCovered: [],
                corrections: [],
                userName: null
            };
        }
        const memory = this.memories[memoryKey];
        memory.turns = turnCount;

        const userLower = userMessage.toLowerCase().trim();
        let responseText = "";
        let correction = null;
        let endConversation = false;

        // ========== Grammar Error Detection ==========
        const grammarChecks = [
            {
                pattern: /\ble\s+(baguette|table|chaise|maison|voiture|rue|place)\b/i,
                fix: 'Use "la" for feminine nouns', corrected: 'la'
            },
            {
                pattern: /\bla\s+(café|pain|fromage|livre|jardin|marché)\b/i,
                fix: 'Use "le" for masculine nouns', corrected: 'le'
            },
            {
                pattern: /\bje\s+suis\s+(\d+)\s+ans\b/i,
                fix: 'Use "J\'ai X ans" (I have X years), not "Je suis"', corrected: "J'ai"
            },
            {
                pattern: /\bje\s+veux\b/i,
                fix: 'Try "Je voudrais" - it\'s more polite!', corrected: 'Je voudrais'
            },
            {
                pattern: /\bun\s+(femme|fille|table|maison)\b/i,
                fix: 'Use "une" for feminine nouns', corrected: 'une'
            },
        ];

        for (const check of grammarChecks) {
            if (check.pattern.test(userMessage)) {
                correction = check.fix;
                memory.corrections.push(check.fix);
                break;
            }
        }

        // ========== Topic Detection ==========
        const topicKeywords = {
            name: ['appelle', 'nom', 'prénom'],
            origin: ['viens', 'habite', 'pays', 'ville', 'suis de'],
            weather: ['temps', 'pleut', 'soleil', 'chaud', 'froid', 'beau'],
            order: ['voudrais', 'prends', 'commander', 'café', 'thé'],
            price: ['combien', 'coûte', 'euros', 'prix'],
            directions: ['où', 'aller', 'gauche', 'droite', 'tout droit'],
            farewell: ['revoir', 'bientôt', 'bonne journée', 'merci']
        };

        let detectedTopic = null;
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(kw => userLower.includes(kw))) {
                detectedTopic = topic;
                if (!memory.topicsCovered.includes(topic)) {
                    memory.topicsCovered.push(topic);
                }
                break;
            }
        }

        // ========== Response Generation ==========
        const responses = this._getContextualResponses(prompt, detectedTopic, memory, userLower);

        // Select appropriate response based on context
        if (memory.turns <= 1) {
            // Early conversation - welcoming responses
            responseText = responses.greeting || responses.default;
        } else if (detectedTopic === 'farewell' || userLower.includes('au revoir')) {
            // Ending conversation
            responseText = responses.farewell || "Au revoir ! À bientôt !";
            endConversation = true;
        } else if (detectedTopic === 'name') {
            // Name exchange
            const nameMatch = userMessage.match(/m'appelle\s+(\w+)/i);
            if (nameMatch) {
                memory.userName = nameMatch[1];
                responseText = `Enchanté, ${nameMatch[1]} ! ${responses.nameResponse || "Moi, c'est " + npc.name + "."}`;
            } else {
                responseText = responses.nameAsk || "Comment vous appelez-vous ?";
            }
        } else if (detectedTopic) {
            // Topic-specific response
            responseText = responses[detectedTopic] || responses.default;
        } else {
            // General continuation
            responseText = responses.continuation || responses.default;
        }

        // Add follow-up question if conversation should continue
        if (!endConversation && memory.turns >= 3 && memory.turns < 8) {
            const followUps = responses.followUps || [
                "Et vous ?",
                "Qu'en pensez-vous ?",
                "C'est tout ?",
            ];
            const followUp = followUps[memory.turns % followUps.length];
            if (!responseText.includes('?')) {
                responseText += ` ${followUp}`;
            }
        }

        // End conversation after enough turns
        if (memory.turns >= 9) {
            endConversation = true;
            responseText = responses.closing || "C'était un plaisir de discuter avec vous ! Au revoir !";
        }

        return {
            text: responseText,
            correction,
            endConversation,
            topicsCovered: memory.topicsCovered,
            sentiment: correction ? 'teaching' : 'friendly'
        };
    }

    /**
     * Get contextual responses based on prompt type
     */
    _getContextualResponses(prompt, topic, memory, userLower) {
        const promptId = prompt?.id || 'default';

        // Response templates by prompt type
        const responseTemplates = {
            // Introduction scenarios
            'intro_basic': {
                greeting: "Oui, il fait vraiment beau ! Vous êtes d'ici ?",
                nameResponse: "Quel joli prénom !",
                nameAsk: "Et comment vous appelez-vous ?",
                origin: "Ah, c'est intéressant ! J'adore voyager.",
                weather: "Oui, le temps est magnifique aujourd'hui !",
                farewell: "Au revoir ! Bonne journée à vous !",
                continuation: "C'est super ! Racontez-moi un peu plus.",
                followUps: ["D'où venez-vous ?", "Vous aimez Paris ?", "C'est votre première visite ?"],
                closing: "Enchanté de vous avoir rencontré ! Bonne continuation !",
                default: "Ah oui, je comprends. C'est intéressant !"
            },
            // Café scenarios
            'cafe_order': {
                greeting: "Bien sûr ! Qu'est-ce que je peux vous servir ?",
                order: "Excellent choix ! Autre chose avec ça ?",
                price: "Ça fait 4 euros 50, s'il vous plaît.",
                farewell: "Merci, bonne dégustation !",
                continuation: "Très bien. Et avec ceci ?",
                followUps: ["Un croissant peut-être ?", "Vous désirez autre chose ?"],
                closing: "Voilà votre commande ! Bonne journée !",
                default: "D'accord ! Je vous prépare ça tout de suite."
            },
            // Weather small talk
            'weather_small_talk': {
                greeting: "N'est-ce pas ? C'est parfait pour une promenade !",
                weather: "Exactement ! Moi j'adore ce temps-là.",
                preference: "Ah oui ? Moi aussi je préfère ça !",
                farewell: "Bonne journée ! Profitez du beau temps !",
                continuation: "Et hier, il faisait comment chez vous ?",
                followUps: ["Vous préférez l'été ou l'hiver ?", "Il pleut souvent dans votre pays ?"],
                closing: "Allez, bon weekend ! Et n'oubliez pas votre parapluie, on ne sait jamais !",
                default: "C'est vrai, le temps change tellement vite ici !"
            },
            // Directions
            'directions_complex': {
                greeting: "Oui, bien sûr ! Où voulez-vous aller ?",
                destination: "D'accord ! Alors, allez tout droit pendant 200 mètres, puis tournez à gauche.",
                directions: "C'est facile ! Continuez tout droit, puis la deuxième à droite.",
                distance: "Non, c'est à environ 10 minutes à pied.",
                confirmation: "Exactement ! Vous avez bien compris.",
                farewell: "De rien ! Bonne route !",
                followUps: ["Vous avez compris ?", "C'est clair ?"],
                closing: "Vous ne pouvez pas le manquer ! Bonne visite !",
                default: "Alors, continuez dans cette direction..."
            },
            // Restaurant reservation
            'restaurant_reservation': {
                greeting: "Bonjour ! En quoi puis-je vous aider ?",
                reservation: "Très bien ! Pour quelle date et à quelle heure ?",
                'party size': "Parfait ! Et combien de personnes ?",
                time: "D'accord ! Une table à cette heure, c'est noté.",
                farewell: "Merci ! À bientôt !",
                followUps: ["C'est à quel nom ?", "Avez-vous des allergies alimentaires ?"],
                closing: "Parfait, votre réservation est confirmée ! À bientôt au restaurant !",
                default: "D'accord, je note tout ça."
            },
            // Shopping
            'shopping_clothes': {
                greeting: "Bonjour ! Je cherche peut-être une chemise ou un pull...",
                item: "Très bon choix ! On a de beaux modèles dans cette couleur.",
                size: "On l'a en S, M et L. Quelle est votre taille ?",
                color: "Oui, on l'a aussi en bleu et en noir.",
                fitting: "La cabine d'essayage est juste là, à droite.",
                purchase: "Parfait ! Je vous fais un paquet cadeau ?",
                farewell: "Merci pour votre visite ! À bientôt !",
                followUps: ["Vous cherchez une occasion spéciale ?", "Vous voulez l'essayer ?"],
                closing: "Merci pour votre achat ! Bonne journée !",
                default: "Oui, on a beaucoup de choix dans cette catégorie."
            },
            // Job interview
            'job_interview': {
                greeting: "Très bien, racontez-moi votre parcours professionnel.",
                experience: "Intéressant ! Et quelles étaient vos responsabilités ?",
                skills: "Ce sont des compétences précieuses pour ce poste.",
                motivation: "Pourquoi notre entreprise vous intéresse-t-elle ?",
                'future goals': "Où vous voyez-vous dans cinq ans ?",
                farewell: "Merci pour cet entretien. Nous vous recontacterons bientôt.",
                followUps: ["Pouvez-vous me donner un exemple ?", "Comment gérez-vous le stress ?"],
                closing: "Merci beaucoup. Avez-vous des questions pour moi ?",
                default: "Je vois. Continuez, s'il vous plaît."
            },
            // Debate/Opinion
            'debate_opinion': {
                greeting: "C'est une question intéressante ! Qu'en pensez-vous ?",
                opinion: "Je comprends votre point de vue. Mais avez-vous considéré...?",
                agreement: "Exactement ! Je suis tout à fait d'accord sur ce point.",
                disagreement: "Hmm, je vois les choses différemment...",
                nuance: "C'est vrai, la question est complexe.",
                farewell: "Merci pour cette discussion enrichissante !",
                followUps: ["Pourquoi pensez-vous ça ?", "Et si on voyait ça autrement ?"],
                closing: "C'était un plaisir de débattre avec vous ! On remet ça ?",
                default: "C'est un argument intéressant..."
            },
            // Problem solving
            'problem_solving': {
                greeting: "Je vous écoute. Quel est le problème ?",
                problem: "Je vois. Depuis quand avez-vous ce problème ?",
                details: "D'accord, je comprends mieux maintenant.",
                urgency: "Oui, je comprends que c'est urgent. Je vais faire le nécessaire.",
                solution: "Je vais envoyer quelqu'un dès que possible.",
                farewell: "D'accord, quelqu'un passera demain matin. Bonne journée !",
                followUps: ["Pouvez-vous décrire le problème plus en détail ?", "C'est la première fois que ça arrive ?"],
                closing: "Très bien, c'est noté. On vous rappelle pour confirmer le rendez-vous.",
                default: "Je note tout ça. Je vais voir ce qu'on peut faire."
            },
            // Default fallback
            'default': {
                greeting: "Bonjour ! Comment allez-vous ?",
                nameResponse: "Enchanté !",
                farewell: "Au revoir ! À bientôt !",
                continuation: "Ah oui ? Dites-m'en plus !",
                followUps: ["Et vous ?", "Vraiment ?", "C'est intéressant !"],
                closing: "C'était un plaisir de discuter ! À la prochaine !",
                default: "Je comprends. Continuez !"
            }
        };

        return responseTemplates[promptId] || responseTemplates['default'];
    }
}

export const npcSystem = new NPCSystem();
