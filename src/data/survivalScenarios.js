export const SURVIVAL_SCENARIOS = [
    {
        id: 'cafe_rush',
        title: 'Café Rush Hour',
        description: 'Order coffee for a group of impatient tourists before the waiter leaves.',
        difficulty: 'Beginner',
        timeLimit: 45,
        xpReward: 100,
        icon: '☕',
        stages: [
            {
                id: 'start',
                situation: "The waiter looks busy. He glances at your table.",
                options: [
                    { text: "Garçon ! Un café !", isCorrect: false, timePenalty: 5, nextStage: 'rude' },
                    { text: "Excusez-moi, on voudrait commander.", isCorrect: true, nextStage: 'order' }
                ]
            },
            {
                id: 'rude',
                situation: "The waiter frowns and ignores you for a moment.",
                options: [
                    { text: "Pardon, s'il vous plaît...", isCorrect: true, nextStage: 'order' },
                    { text: "Hé ! J'ai soif !", isCorrect: false, timePenalty: 10, nextStage: 'fail' }
                ]
            },
            {
                id: 'order',
                situation: "He comes over with a notepad. 'Vous désirez ?'",
                options: [
                    { text: "Je veux un café.", isCorrect: false, timePenalty: 5, nextStage: 'polite_correction' },
                    { text: "Je voudrais un café, s'il vous plaît.", isCorrect: true, nextStage: 'success' }
                ]
            },
            {
                id: 'polite_correction',
                situation: "He sighs. 'Un café. Et avec ça ?'",
                options: [
                    { text: "C'est tout, merci.", isCorrect: true, nextStage: 'success' }
                ]
            },
            {
                id: 'success',
                isEnd: true,
                success: true
            },
            {
                id: 'fail',
                isEnd: true,
                success: false
            }
        ]
    }
];

export const getScenarioById = (id) => SURVIVAL_SCENARIOS.find(s => s.id === id);

export const calculateScore = (scenario, timeRemaining, hintsUsed) => {
    let score = scenario.xpReward;
    score += timeRemaining * 2;
    score -= hintsUsed * 10;
    return Math.max(10, score);
};
