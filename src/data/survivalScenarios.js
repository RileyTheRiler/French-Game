// Survival Scenarios - High-stakes, timed challenges for real-world French

export const SURVIVAL_SCENARIOS = [
    {
        id: 'metro_strike',
        title: 'La Grève du Métro',
        titleEn: 'The Metro Strike',
        difficulty: 'Intermediate',
        timeLimit: 120,
        xpReward: 100,
        icon: '🚇',
        description: "C'est la grève ! Le métro ne fonctionne pas.",
        stages: [
            {
                id: 'discovery',
                situation: "Les portes sont fermées: 'GRÈVE - SERVICE INTERROMPU'",
                options: [
                    { text: "Excusez-moi, est-ce que le métro fonctionne?", isCorrect: true, nextStage: 'ask_agent' },
                    { text: "Pourquoi le métro ne marche pas?!", isCorrect: false, nextStage: 'rude', timePenalty: 10 }
                ]
            },
            {
                id: 'ask_agent',
                npcMessage: "Non, c'est la grève nationale. Pas de métro aujourd'hui.",
                npcSpeaker: "Agent RATP",
                options: [
                    { text: "Y a-t-il des bus qui fonctionnent?", isCorrect: true, nextStage: 'bus_info' },
                    { text: "Je peux prendre un Uber?", isCorrect: true, nextStage: 'uber' }
                ]
            },
            {
                id: 'rude',
                npcMessage: "Monsieur, c'est la grève. Essayez le bus.",
                npcSpeaker: "Agent RATP",
                options: [
                    { text: "Pardon. Quel bus puis-je prendre?", isCorrect: true, nextStage: 'bus_info' }
                ]
            },
            {
                id: 'bus_info',
                npcMessage: "Le bus 42 passe à 100 mètres sur votre droite.",
                npcSpeaker: "Agent RATP",
                options: [
                    { text: "Merci beaucoup!", isCorrect: true, nextStage: 'success' }
                ]
            },
            {
                id: 'uber',
                systemMessage: "⚠️ Prix x3.5 - Attente: 25 minutes",
                options: [
                    { text: "C'est trop cher. Je prends le bus.", isCorrect: true, nextStage: 'success' }
                ]
            },
            { id: 'success', isEnd: true, success: true, message: "Vous avez trouvé un transport!" }
        ],
        vocabulary: [
            { french: 'la grève', english: 'strike' },
            { french: "l'arrêt de bus", english: 'bus stop' }
        ]
    },
    {
        id: 'lost_wallet',
        title: 'Portefeuille Perdu',
        titleEn: 'Lost Wallet',
        difficulty: 'Advanced',
        timeLimit: 180,
        xpReward: 150,
        icon: '👛',
        description: "Vous avez perdu votre portefeuille. Allez au commissariat.",
        stages: [
            {
                id: 'enter',
                npcMessage: "Bonjour, je peux vous aider?",
                npcSpeaker: "Agent de police",
                options: [
                    { text: "Bonjour. J'ai perdu mon portefeuille.", isCorrect: true, nextStage: 'details' },
                    { text: "Aidez-moi!", isCorrect: false, nextStage: 'calm', timePenalty: 15 }
                ]
            },
            {
                id: 'calm',
                npcMessage: "Calmez-vous. Expliquez la situation.",
                npcSpeaker: "Agent",
                options: [
                    { text: "Pardon. J'ai perdu mon portefeuille ce matin.", isCorrect: true, nextStage: 'details' }
                ]
            },
            {
                id: 'details',
                npcMessage: "Où l'avez-vous perdu?",
                npcSpeaker: "Agent",
                options: [
                    { text: "Dans le métro, ligne 4, vers 10h.", isCorrect: true, nextStage: 'contents' }
                ]
            },
            {
                id: 'contents',
                npcMessage: "Qu'est-ce qu'il contenait?",
                npcSpeaker: "Agent",
                options: [
                    { text: "Ma carte d'identité et 50 euros.", isCorrect: true, nextStage: 'cards' }
                ]
            },
            {
                id: 'cards',
                npcMessage: "Des cartes bancaires? Il faut faire opposition.",
                npcSpeaker: "Agent",
                options: [
                    { text: "Oui, j'ai déjà appelé ma banque.", isCorrect: true, nextStage: 'receipt' }
                ]
            },
            {
                id: 'receipt',
                npcMessage: "Voici votre récépissé de déclaration.",
                npcSpeaker: "Agent",
                options: [
                    { text: "Merci pour votre aide!", isCorrect: true, nextStage: 'success' }
                ]
            },
            { id: 'success', isEnd: true, success: true, message: "Déclaration de perte effectuée!" }
        ],
        vocabulary: [
            { french: 'faire opposition', english: 'to block (a card)' },
            { french: 'le récépissé', english: 'receipt' }
        ]
    },
    {
        id: 'medical_emergency',
        title: 'Urgence Médicale',
        titleEn: 'Medical Emergency',
        difficulty: 'Advanced',
        timeLimit: 90,
        xpReward: 175,
        icon: '🏥',
        description: "Votre ami se sent mal. Appelez les secours!",
        stages: [
            {
                id: 'assess',
                systemMessage: "⚠️ Votre ami a du mal à respirer!",
                options: [
                    { text: "J'appelle le 15 (SAMU).", isCorrect: true, nextStage: 'call' },
                    { text: "Je cherche un médecin.", isCorrect: false, nextStage: 'waste', timePenalty: 20 }
                ]
            },
            {
                id: 'waste',
                systemMessage: "Votre ami va plus mal!",
                options: [
                    { text: "J'appelle le 15!", isCorrect: true, nextStage: 'call' }
                ]
            },
            {
                id: 'call',
                npcMessage: "SAMU, quelle est votre urgence?",
                npcSpeaker: "Opérateur",
                options: [
                    { text: "Mon ami a du mal à respirer!", isCorrect: true, nextStage: 'location' }
                ]
            },
            {
                id: 'location',
                npcMessage: "Où êtes-vous exactement?",
                npcSpeaker: "Opérateur",
                options: [
                    { text: "23 rue de la Paix, 2ème arrondissement.", isCorrect: true, nextStage: 'symptoms' }
                ]
            },
            {
                id: 'symptoms',
                npcMessage: "Décrivez les symptômes.",
                npcSpeaker: "Opérateur",
                options: [
                    { text: "Il transpire et a du mal à respirer.", isCorrect: true, nextStage: 'help' }
                ]
            },
            {
                id: 'help',
                npcMessage: "Les secours arrivent dans 5 minutes.",
                npcSpeaker: "Opérateur",
                options: [
                    { text: "Merci!", isCorrect: true, nextStage: 'success' }
                ]
            },
            { id: 'success', isEnd: true, success: true, message: "Les secours sont en route!" }
        ],
        vocabulary: [
            { french: 'le SAMU', english: 'medical emergency (15)' },
            { french: 'les secours', english: 'emergency services' }
        ]
    },
    {
        id: 'airport_delay',
        title: 'Vol Retardé',
        titleEn: 'Flight Delay',
        difficulty: 'Intermediate',
        timeLimit: 150,
        xpReward: 120,
        icon: '✈️',
        description: "Votre vol est annulé! Trouvez une solution.",
        stages: [
            {
                id: 'announce',
                systemMessage: "📢 Vol AF1234 annulé!",
                options: [
                    { text: "Je vais au comptoir.", isCorrect: true, nextStage: 'counter' }
                ]
            },
            {
                id: 'counter',
                npcMessage: "Vous avez votre carte d'embarquement?",
                npcSpeaker: "Agent",
                options: [
                    { text: "Oui. Quelles sont mes options?", isCorrect: true, nextStage: 'options' },
                    { text: "C'est scandaleux!", isCorrect: false, nextStage: 'angry', timePenalty: 20 }
                ]
            },
            {
                id: 'angry',
                npcMessage: "Je comprends. Voyons les alternatives.",
                npcSpeaker: "Agent",
                options: [
                    { text: "Pardon. Quelles alternatives?", isCorrect: true, nextStage: 'options' }
                ]
            },
            {
                id: 'options',
                npcMessage: "Vol demain 7h ou TGV ce soir 19h.",
                npcSpeaker: "Agent",
                options: [
                    { text: "Le TGV ce soir, s'il vous plaît.", isCorrect: true, nextStage: 'compensation' }
                ]
            },
            {
                id: 'compensation',
                npcMessage: "Voici un bon de 15€ pour les repas.",
                npcSpeaker: "Agent",
                options: [
                    { text: "Merci beaucoup!", isCorrect: true, nextStage: 'success' }
                ]
            },
            { id: 'success', isEnd: true, success: true, message: "Alternative trouvée!" }
        ],
        vocabulary: [
            { french: 'vol annulé', english: 'cancelled flight' },
            { french: 'indemnisation', english: 'compensation' }
        ]
    },
    {
        id: 'broken_phone',
        title: 'Téléphone en Panne',
        titleEn: 'Broken Phone',
        difficulty: 'Beginner',
        timeLimit: 100,
        xpReward: 80,
        icon: '📱',
        description: "Votre téléphone est mort. Demandez de l'aide!",
        stages: [
            {
                id: 'realize',
                systemMessage: "📵 Batterie à 0%",
                options: [
                    { text: "Je cherche quelqu'un pour m'aider.", isCorrect: true, nextStage: 'ask' }
                ]
            },
            {
                id: 'ask',
                situation: "Vous voyez une femme avec son téléphone.",
                options: [
                    { text: "Excusez-moi, pourriez-vous m'aider?", isCorrect: true, nextStage: 'explain' },
                    { text: "Prête-moi ton téléphone!", isCorrect: false, nextStage: 'rude', timePenalty: 15 }
                ]
            },
            {
                id: 'rude',
                npcMessage: "Pardon?",
                npcSpeaker: "Femme",
                options: [
                    { text: "Pardon, excusez-moi. Pourriez-vous m'aider?", isCorrect: true, nextStage: 'explain' }
                ]
            },
            {
                id: 'explain',
                npcMessage: "Pourquoi?",
                npcSpeaker: "Femme",
                options: [
                    { text: "Mon téléphone est en panne.", isCorrect: true, nextStage: 'agree' }
                ]
            },
            {
                id: 'agree',
                npcMessage: "Pas de problème, tenez.",
                npcSpeaker: "Femme",
                options: [
                    { text: "Merci infiniment!", isCorrect: true, nextStage: 'call' }
                ]
            },
            {
                id: 'call',
                npcMessage: "Allô?",
                npcSpeaker: "Ami",
                options: [
                    { text: "Salut! On se retrouve où?", isCorrect: true, nextStage: 'success' }
                ]
            },
            { id: 'success', isEnd: true, success: true, message: "Problème résolu!" }
        ],
        vocabulary: [
            { french: 'en panne', english: 'broken' },
            { french: 'merci infiniment', english: 'thank you so much' }
        ]
    },
    // New Logic Puzzles Phase 11
    {
        id: 'train_connection_chaos',
        title: 'Connexion Chaos',
        titleEn: 'Connection Chaos',
        difficulty: 'Expert',
        timeLimit: 60,
        xpReward: 200,
        icon: '🚆',
        description: "LOGIC PUZZLE: Analyze the timetable and find the ONLY valid route.",
        stages: [
            {
                id: 'start',
                situation: "You are at Gare de Lyon (14:00). You must reach Avignon before 17:00.\n\nOption A: TGV 6602 (Dep: 14:15, Arr: 16:45)\nOption B: TER 8801 to Lyon (Dep: 14:05, Arr: 16:00) + TGV to Avignon (Dep: 16:10, Arr: 17:15)\nOption C: TGV 6610 (Dep: 14:45, Arr: 16:55)\nOption D: BlaBlaCar (Dep: 14:00, Dur: 3h30)\n\nWhich option works?",
                options: [
                    { text: "Option A", isCorrect: true, nextStage: 'seats' },
                    { text: "Option B", isCorrect: false, nextStage: 'fail_b', timePenalty: 20 },
                    { text: "Option C", isCorrect: true, nextStage: 'full' },
                    { text: "Option D", isCorrect: false, nextStage: 'fail_d', timePenalty: 20 }
                ]
            },
            {
                id: 'fail_b',
                systemMessage: "Option B arrives at 17:15. Too late!",
                options: [{ text: "Try again", isCorrect: true, nextStage: 'start' }]
            },
            {
                id: 'fail_d',
                systemMessage: "Option D arrives at 17:30. Too late!",
                options: [{ text: "Try again", isCorrect: true, nextStage: 'start' }]
            },
            {
                id: 'full',
                systemMessage: "Option C is valid but SOLD OUT!",
                options: [{ text: "Back to choices", isCorrect: true, nextStage: 'start' }]
            },
            {
                id: 'seats',
                systemMessage: "Option A selected. Train is departing on Quai 12. You have a 'Compostez votre billet' sign.",
                options: [
                    { text: "Run to train directly.", isCorrect: false, nextStage: 'fine', timePenalty: 15 },
                    { text: "Validate ticket then run.", isCorrect: true, nextStage: 'success' }
                ]
            },
            {
                id: 'fine',
                npcMessage: "Contrôle des billets! Billet non validé. Amende de 50€.",
                npcSpeaker: "Contrôleur",
                options: [
                    { text: "Je suis désolé!", isCorrect: true, nextStage: 'shame' }
                ]
            },
            {
                id: 'shame',
                systemMessage: "You arrived... but poorer.",
                options: [{ text: "Finish", isCorrect: true, nextStage: 'success_poor' }]
            },
            { id: 'success', isEnd: true, success: true, message: "Arrived on time and valid!" },
            { id: 'success_poor', isEnd: true, success: true, message: "Arrived, but paid a fine." }
        ],
        vocabulary: [
            { french: 'Composter', english: 'To validate (ticket)' },
            { french: 'La correspondance', english: 'Connection' }
        ]
    },
    {
        id: 'police_report_logic',
        title: 'Rapport de Police',
        titleEn: 'Police Report Logic',
        difficulty: 'Expert',
        timeLimit: 90,
        xpReward: 200,
        icon: '🚓',
        description: "LOGIC PUZZLE: Reconstruct the timeline of the robbery.",
        stages: [
            {
                id: 'start',
                situation: "Witness statements:\n1. 'Le voleur est sorti après l'alarme.'\n2. 'L'alarme a sonné à 14h05.'\n3. 'Il a brisé la vitrine avant d'entrer.'\n\nWhat happened FIRST?",
                options: [
                    { text: "Il est sorti.", isCorrect: false, nextStage: 'wrong_1', timePenalty: 10 },
                    { text: "L'alarme a sonné.", isCorrect: false, nextStage: 'wrong_1', timePenalty: 10 },
                    { text: "Il a brisé la vitrine.", isCorrect: true, nextStage: 'step_2' }
                ]
            },
            {
                id: 'wrong_1',
                systemMessage: "Think logically. Can he exit before entering? Can alarm ring before break-in?",
                options: [{ text: "Retry", isCorrect: true, nextStage: 'start' }]
            },
            {
                id: 'step_2',
                situation: "Correct. He broke the window first.\n\nThen events:\n- Alarm rings (14:05)\n- Thief enters\n- Thief exits\n\nWhat happened immediately AFTER breaking the window?",
                options: [
                    { text: "L'alarme a sonné.", isCorrect: false, nextStage: 'wrong_2', timePenalty: 10 },
                    { text: "Le voleur est entré.", isCorrect: true, nextStage: 'step_3' }
                ]
            },
            {
                id: 'wrong_2',
                systemMessage: "Usually entrance triggers alarm, or break-in does. But statement says 'Sorti après alarme'. Wait, let's look at logic.",
                options: [{ text: "Retry", isCorrect: true, nextStage: 'step_2' }]
            },
            {
                id: 'step_3',
                situation: "He entered. Now, did the alarm ring BEFORE or AFTER he exited?",
                options: [
                    { text: "Avant qu'il sorte.", isCorrect: true, nextStage: 'conclusion' },
                    { text: "Après qu'il sorte.", isCorrect: false, nextStage: 'wrong_3', timePenalty: 10 }
                ]
            },
            {
                id: 'wrong_3',
                systemMessage: "Statement 1: 'Sorti APRÈS l'alarme'.",
                options: [{ text: "Retry", isCorrect: true, nextStage: 'step_3' }]
            },
            {
                id: 'conclusion',
                npcMessage: "Exactement. Vitrine -> Entrée -> Alarme -> Sortie.",
                npcSpeaker: "Inspecteur",
                options: [
                    { text: "Affaire classée.", isCorrect: true, nextStage: 'success' }
                ]
            },
            { id: 'success', isEnd: true, success: true, message: "Timeline reconstituée!" }
        ],
        vocabulary: [
            { french: 'La vitrine', english: 'Shop window' },
            { french: 'Briser', english: 'To break/smash' }
        ]
    }
];

export const getScenarioById = (id) => SURVIVAL_SCENARIOS.find(s => s.id === id);
export const getScenariosByDifficulty = (d) => SURVIVAL_SCENARIOS.filter(s => s.difficulty === d);
export const calculateScore = (scenario, timeRemaining, hints) => {
    const base = scenario.xpReward;
    const bonus = Math.floor((timeRemaining / scenario.timeLimit) * 50);
    return Math.max(base + bonus - (hints * 10), Math.floor(base * 0.5));
};
