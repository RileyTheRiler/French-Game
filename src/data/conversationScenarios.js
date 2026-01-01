export const SCENARIOS = [
    {
        id: 'cafe_basic',
        title: 'Ordering a Coffee',
        npcId: 'barista',
        difficulty: 'Beginner',
        xpReward: 50,
        description: 'Practice ordering a drink at a Parisian café.',
        initialMessage: "Bonjour ! Qu'est-ce que je peux vous servir ?",
        initialSpeaker: 'Serveur',
        nodes: {
            start: {
                options: [
                    {
                        text: "Un café, s'il vous plaît.",
                        nextNode: 'coffee_choice',
                        isCorrect: true
                    },
                    {
                        text: "Je veux café.",
                        nextNode: 'correction_polite',
                        isCorrect: false,
                        feedback: "Too direct! Try using 'Je voudrais' or 's'il vous plaît'."
                    },
                    {
                        text: "Au revoir.",
                        nextNode: 'leave_early',
                        isCorrect: false,
                        feedback: "You usually order before saying goodbye!"
                    }
                ]
            },
            coffee_choice: {
                message: "Très bien. Un café noir ou au lait ?",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Un café noir.",
                        nextNode: 'price',
                        isCorrect: true
                    },
                    {
                        text: "Au lait, s'il vous plaît.",
                        nextNode: 'price',
                        isCorrect: true
                    }
                ]
            },
            correction_polite: {
                message: "Pardon ? On dit 'Bonjour, je voudrais un café'.",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Désolé. Je voudrais un café, s'il vous plaît.",
                        nextNode: 'coffee_choice',
                        isCorrect: true
                    }
                ]
            },
            price: {
                message: "Ça fera 2 euros, s'il vous plaît.",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Voilà 2 euros.",
                        nextNode: 'end_success',
                        isCorrect: true
                    },
                    {
                        text: "C'est cher !",
                        nextNode: 'end_rude',
                        isCorrect: true // Technically correct French, but maybe not the goal? Let's say it leads to end.
                    }
                ]
            },
            leave_early: {
                message: "Euh... au revoir ?",
                speaker: 'Serveur',
                end: true,
                success: false
            },
            end_success: {
                message: "Merci ! Bonne journée.",
                speaker: 'Serveur',
                end: true,
                success: true
            },
            end_rude: {
                message: "C'est Paris, monsieur...",
                speaker: 'Serveur',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'train_station',
        title: 'Buying a Ticket',
        difficulty: 'Intermediate',
        xpReward: 75,
        description: 'Ask for a ticket to Lyon.',
        initialMessage: "Bonjour, je peux vous aider ?",
        initialSpeaker: 'Agent',
        nodes: {
            start: {
                options: [
                    {
                        text: "Je voudrais un billet pour Lyon.",
                        nextNode: 'time',
                        isCorrect: true
                    },
                    {
                        text: "Lyon, maintenant.",
                        nextNode: 'correction_polite',
                        isCorrect: false,
                        feedback: "A bit rude. Try 'Je voudrais...'"
                    }
                ]
            },
            time: {
                message: "Pour quel départ ? Il y a un TGV à 14h.",
                speaker: 'Agent',
                options: [
                    {
                        text: "C'est parfait.",
                        nextNode: 'class',
                        isCorrect: true
                    },
                    {
                        text: "Non, plus tard.",
                        nextNode: 'later_time',
                        isCorrect: true
                    }
                ]
            },
            correction_polite: {
                message: "Bonjour... Vous voulez aller où ?",
                speaker: 'Agent',
                options: [
                    {
                        text: "Pardon. Je voudrais aller à Lyon.",
                        nextNode: 'time',
                        isCorrect: true
                    }
                ]
            },
            class: {
                message: "Première ou seconde classe ?",
                speaker: 'Agent',
                options: [
                    {
                        text: "Seconde, s'il vous plaît.",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            later_time: {
                message: "Il y a un autre train à 16h.",
                speaker: 'Agent',
                options: [
                    {
                        text: "D'accord pour 16h.",
                        nextNode: 'class',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "Voici votre billet. Bon voyage !",
                speaker: 'Agent',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'bakery',
        title: 'At the Bakery',
        npcId: 'shopkeeper',
        difficulty: 'Beginner',
        xpReward: 45,
        description: 'Buy some bread and pastries.',
        initialMessage: "Bonjour ! Qu'est-ce qui vous ferait plaisir ?",
        initialSpeaker: 'Boulanger',
        nodes: {
            start: {
                options: [
                    {
                        text: "Je voudrais une baguette, s'il vous plaît.",
                        nextNode: 'anything_else',
                        isCorrect: true
                    },
                    {
                        text: "Donne-moi du pain.",
                        nextNode: 'correction_polite',
                        isCorrect: false,
                        feedback: "The imperative is too direct! Try 'Je voudrais...' instead."
                    }
                ]
            },
            correction_polite: {
                message: "Pardon ? On dit 'Je voudrais' en France.",
                speaker: 'Boulanger',
                options: [
                    {
                        text: "Pardon. Je voudrais une baguette.",
                        nextNode: 'anything_else',
                        isCorrect: true
                    }
                ]
            },
            anything_else: {
                message: "Très bien ! Autre chose ?",
                speaker: 'Boulanger',
                options: [
                    {
                        text: "Oui, deux croissants aussi.",
                        nextNode: 'price',
                        isCorrect: true
                    },
                    {
                        text: "Non, merci. C'est tout.",
                        nextNode: 'price',
                        isCorrect: true
                    }
                ]
            },
            price: {
                message: "Ça fait 3 euros 50.",
                speaker: 'Boulanger',
                options: [
                    {
                        text: "Voilà. Merci beaucoup !",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "Merci ! Bonne journée !",
                speaker: 'Boulanger',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'directions',
        title: 'Asking for Directions',
        npcId: 'stranger',
        difficulty: 'Intermediate',
        xpReward: 65,
        description: 'Find your way to the museum.',
        initialMessage: "Vous cherchez quelque chose ?",
        initialSpeaker: 'Passant',
        nodes: {
            start: {
                options: [
                    {
                        text: "Excusez-moi, où est le musée ?",
                        nextNode: 'directions_given',
                        isCorrect: true
                    },
                    {
                        text: "Le musée, maintenant !",
                        nextNode: 'confused',
                        isCorrect: false,
                        feedback: "That's very rude! Start with 'Excusez-moi' or 'Pardon'."
                    }
                ]
            },
            confused: {
                message: "Euh... pardon ?",
                speaker: 'Passant',
                options: [
                    {
                        text: "Désolé. Excusez-moi, où est le musée ?",
                        nextNode: 'directions_given',
                        isCorrect: true
                    }
                ]
            },
            directions_given: {
                message: "Allez tout droit, puis tournez à gauche.",
                speaker: 'Passant',
                options: [
                    {
                        text: "C'est loin d'ici ?",
                        nextNode: 'distance',
                        isCorrect: true
                    },
                    {
                        text: "Merci beaucoup !",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            distance: {
                message: "Non, c'est à cinq minutes à pied.",
                speaker: 'Passant',
                options: [
                    {
                        text: "Parfait, merci !",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "De rien ! Bonne visite !",
                speaker: 'Passant',
                end: true,
                success: true
            }
        }
    }
];
