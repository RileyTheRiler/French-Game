export const INDUSTRIES = [
    {
        id: 'business',
        title: 'Business Général',
        description: 'Emails, meetings, and networking.',
        icon: 'briefcase',
        color: 'blue'
    },
    {
        id: 'tech',
        title: 'Tech & Startup',
        description: 'Agile, development, and digital marketing.',
        icon: 'cpu',
        color: 'purple'
    },
    {
        id: 'medical',
        title: 'Santé & Médical',
        description: 'Patient consultations and hospital vocabulary.',
        icon: 'heart-pulse',
        color: 'red'
    },
    {
        id: 'legal',
        title: 'Juridique',
        description: 'Contracts, law, and administrative terms.',
        icon: 'scale',
        color: 'amber'
    }
];

export const EMAIL_TEMPLATES = [
    {
        id: 'e1',
        title: 'Demande de réunion',
        industry: 'business',
        difficulty: 1,
        blocks: [
            { id: 'b1', text: "Madame, Monsieur,", type: "greeting", correct: true },
            { id: 'b2', text: "Salut tout le monde,", type: "greeting", correct: false, feedback: "Too informal." },
            { id: 'b3', text: "Je souhaiterais solliciter une entrevue avec vous.", type: "body", correct: true },
            { id: 'b4', text: "Je veux te voir.", type: "body", correct: false, feedback: "Too direct and informal." },
            { id: 'b5', text: "Dans l'attente de votre réponse,", type: "closing", correct: true },
            { id: 'b6', text: "A+", type: "closing", correct: false, feedback: "Too informal." },
            { id: 'b7', text: "Cordialement,", type: "signoff", correct: true }
        ]
    },
    {
        id: 'e2',
        title: 'Suivi de projet (Tech)',
        industry: 'tech',
        difficulty: 2,
        blocks: [
            { id: 'b1', text: "Bonjour à tous,", type: "greeting", correct: true },
            { id: 'b2', text: "Voici le compte-rendu du sprint planning.", type: "body", correct: true },
            { id: 'b3', text: "Voici le truc qu'on a fait.", type: "body", correct: false, feedback: "Vague and unprofessional." },
            { id: 'b4', text: "Le déploiement est prévu pour mardi.", type: "body", correct: true },
            { id: 'b5', text: "La mise en prod est pour demain.", type: "body", correct: true },
            { id: 'b6', text: "Bien à vous,", type: "signoff", correct: true }
        ]
    }
];

export const MEETING_SCENARIOS = [
    {
        id: 'm1',
        title: 'Négociation Budgétaire',
        industry: 'business',
        description: "You need to ask for a budget increase for your project.",
        participants: [
            { name: "Directeur", role: "Boss", avatar: "👤" }
        ],
        dialogue: [
            {
                speaker: "Directeur",
                text: "Pourquoi demandez-vous une augmentation du budget ?",
                options: [
                    {
                        text: "Car les coûts de production ont augmenté de 15%.",
                        score: 10,
                        feedback: "Good, factual justification."
                    },
                    {
                        text: "Parce que j'en ai besoin.",
                        score: 0,
                        feedback: "Too vague."
                    },
                    {
                        text: "C'est pas cher payé, franchement.",
                        score: -5,
                        feedback: "Too aggressive/informal."
                    }
                ]
            },
            {
                speaker: "Directeur",
                text: "Pouvez-vous garantir un retour sur investissement ?",
                options: [
                    {
                        text: "Oui, nous prévoyons une hausse des ventes de 20%.",
                        score: 10,
                        feedback: "Excellent, quantitative response."
                    },
                    {
                        text: "Je pense que oui.",
                        score: 2,
                        feedback: "A bit weak."
                    },
                    {
                        text: "Le ROI, c'est surfait.",
                        score: -10,
                        feedback: "Unprofessional."
                    }
                ]
            }
        ]
    }
];

export const VOCABULARY_LISTS = [
    {
        industry: 'business',
        words: [
            { french: 'Le devis', english: 'Quote/Estimate' },
            { french: 'La réunion', english: 'Meeting' },
            { french: 'Le délai', english: 'Deadline' },
            { french: 'Embaucher', english: 'To hire' },
            { french: 'Licencier', english: 'To fire/lay off' }
        ]
    },
    {
        industry: 'medical',
        words: [
            { french: 'La douleur', english: 'Pain' },
            { french: 'Le rendez-vous', english: 'Appointment' },
            { french: 'L\'ordonnance', english: 'Prescription' },
            { french: 'La fièvre', english: 'Fever' },
            { french: 'Le traitement', english: 'Treatment' }
        ]
    },
    {
        industry: 'tech',
        words: [
            { french: 'Le logiciel', english: 'Software' },
            { french: 'La mise à jour', english: 'Update' },
            { french: 'Le bogue', english: 'Bug' },
            { french: 'Le clavier', english: 'Keyboard' },
            { french: 'Sauvegarder', english: 'To save' }
        ]
    },
    {
        industry: 'legal',
        words: [
            { french: 'Le contrat', english: 'Contract' },
            { french: 'La loi', english: 'Law' },
            { french: 'L\'avocat', english: 'Lawyer' },
            { french: 'Le tribunal', english: 'Court' },
            { french: 'Signer', english: 'To sign' }
        ]
    }
];
