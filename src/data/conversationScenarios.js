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
    },
    {
        id: 'restaurant_dinner',
        title: 'Dinner at a Restaurant',
        npcId: 'waiter',
        difficulty: 'Intermediate',
        xpReward: 80,
        description: 'Order a full meal with drinks and dessert.',
        culturalNote: 'In France, meals are often leisurely. It is normal to take 1-2 hours for dinner.',
        initialMessage: "Bonsoir ! Une table pour combien de personnes ?",
        initialSpeaker: 'Serveur',
        nodes: {
            start: {
                options: [
                    {
                        text: "Bonsoir ! Une table pour deux, s'il vous plaît.",
                        nextNode: 'seated',
                        isCorrect: true
                    },
                    {
                        text: "Deux personnes.",
                        nextNode: 'correction_greeting',
                        isCorrect: false,
                        feedback: "In French restaurants, always greet first! Say 'Bonsoir' before your request."
                    }
                ]
            },
            correction_greeting: {
                message: "Pardon ? On dit 'Bonsoir' d'abord en France.",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Pardon. Bonsoir ! Une table pour deux.",
                        nextNode: 'seated',
                        isCorrect: true
                    }
                ]
            },
            seated: {
                message: "Suivez-moi. Voici le menu. Désirez-vous un apéritif ?",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Oui, un kir, s'il vous plaît.",
                        nextNode: 'order_food',
                        isCorrect: true
                    },
                    {
                        text: "Non merci, nous sommes prêts à commander.",
                        nextNode: 'order_food',
                        isCorrect: true
                    }
                ]
            },
            order_food: {
                message: "Très bien. Qu'est-ce que vous prenez ?",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Je vais prendre le canard avec des légumes.",
                        nextNode: 'dessert',
                        isCorrect: true
                    },
                    {
                        text: "Le steak-frites, s'il vous plaît. Saignant.",
                        nextNode: 'dessert',
                        isCorrect: true
                    }
                ]
            },
            dessert: {
                message: "Excellent choix ! Et pour le dessert ?",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Qu'est-ce que vous recommandez ?",
                        nextNode: 'recommendation',
                        isCorrect: true
                    },
                    {
                        text: "La tarte aux pommes, s'il vous plaît.",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            recommendation: {
                message: "Notre crème brûlée est excellente.",
                speaker: 'Serveur',
                options: [
                    {
                        text: "Parfait, je la prends !",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "C'est noté. Bon appétit !",
                speaker: 'Serveur',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'making_plans',
        title: 'Making Plans with a Friend',
        npcId: 'friend',
        difficulty: 'Intermediate',
        xpReward: 70,
        description: 'Arrange a weekend activity with a French friend.',
        culturalNote: 'French friends often use "tu" and informal language. Bisous (kisses) is a common sign-off.',
        initialMessage: "Salut ! Qu'est-ce que tu fais ce week-end ?",
        initialSpeaker: 'Marie',
        nodes: {
            start: {
                options: [
                    {
                        text: "Salut Marie ! Rien de spécial. Tu as une idée ?",
                        nextNode: 'suggestion',
                        isCorrect: true
                    },
                    {
                        text: "Bonjour, je n'ai pas de projets.",
                        nextNode: 'too_formal',
                        isCorrect: false,
                        feedback: "Too formal for a friend! Use 'Salut' and 'tu' with close friends."
                    }
                ]
            },
            too_formal: {
                message: "Ha ha, pourquoi tu es si formel ? On est amis !",
                speaker: 'Marie',
                options: [
                    {
                        text: "Pardon ! Oui, je suis libre. On fait quoi ?",
                        nextNode: 'suggestion',
                        isCorrect: true
                    }
                ]
            },
            suggestion: {
                message: "On pourrait aller au cinéma ou faire un pique-nique ?",
                speaker: 'Marie',
                options: [
                    {
                        text: "Un pique-nique, ça me dit ! Où ?",
                        nextNode: 'location',
                        isCorrect: true
                    },
                    {
                        text: "Le cinéma, super ! Il y a quoi comme film ?",
                        nextNode: 'movie',
                        isCorrect: true
                    }
                ]
            },
            location: {
                message: "Au parc des Buttes-Chaumont ? C'est magnifique !",
                speaker: 'Marie',
                options: [
                    {
                        text: "Parfait ! On se retrouve à quelle heure ?",
                        nextNode: 'time',
                        isCorrect: true
                    }
                ]
            },
            movie: {
                message: "Il y a un nouveau film français qui a l'air bien !",
                speaker: 'Marie',
                options: [
                    {
                        text: "Génial ! On se retrouve quand ?",
                        nextNode: 'time',
                        isCorrect: true
                    }
                ]
            },
            time: {
                message: "Samedi à 14h, ça te va ?",
                speaker: 'Marie',
                options: [
                    {
                        text: "Oui, c'est parfait ! À samedi alors.",
                        nextNode: 'end_success',
                        isCorrect: true
                    },
                    {
                        text: "Plutôt dimanche ? Samedi je suis occupé(e).",
                        nextNode: 'reschedule',
                        isCorrect: true
                    }
                ]
            },
            reschedule: {
                message: "Pas de souci, dimanche c'est bien aussi !",
                speaker: 'Marie',
                options: [
                    {
                        text: "Super ! Bisous, à dimanche !",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "Bisous ! À bientôt !",
                speaker: 'Marie',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'pharmacy',
        title: 'At the Pharmacy',
        npcId: 'pharmacist',
        difficulty: 'Intermediate',
        xpReward: 75,
        description: 'Describe symptoms and get medicine.',
        culturalNote: 'French pharmacists are trained to give medical advice. The green cross indicates a pharmacy.',
        initialMessage: "Bonjour ! Comment puis-je vous aider ?",
        initialSpeaker: 'Pharmacien',
        nodes: {
            start: {
                options: [
                    {
                        text: "Bonjour. J'ai mal à la tête depuis ce matin.",
                        nextNode: 'more_symptoms',
                        isCorrect: true
                    },
                    {
                        text: "Donnez-moi des médicaments.",
                        nextNode: 'correction_polite',
                        isCorrect: false,
                        feedback: "Be specific about your symptoms! Pharmacists need to know what's wrong."
                    }
                ]
            },
            correction_polite: {
                message: "D'accord, mais quels sont vos symptômes exactement ?",
                speaker: 'Pharmacien',
                options: [
                    {
                        text: "Pardon. J'ai mal à la tête et je suis fatigué.",
                        nextNode: 'more_symptoms',
                        isCorrect: true
                    }
                ]
            },
            more_symptoms: {
                message: "Avez-vous de la fièvre ou d'autres symptômes ?",
                speaker: 'Pharmacien',
                options: [
                    {
                        text: "Non, juste un mal de tête.",
                        nextNode: 'recommendation',
                        isCorrect: true
                    },
                    {
                        text: "Oui, j'ai un peu de fièvre aussi.",
                        nextNode: 'fever_advice',
                        isCorrect: true
                    }
                ]
            },
            fever_advice: {
                message: "Dans ce cas, je vous recommande du paracétamol. Prenez-en trois fois par jour.",
                speaker: 'Pharmacien',
                options: [
                    {
                        text: "D'accord, merci. Combien ça coûte ?",
                        nextNode: 'price',
                        isCorrect: true
                    }
                ]
            },
            recommendation: {
                message: "Je vous conseille de l'ibuprofène. Prenez-en avec de la nourriture.",
                speaker: 'Pharmacien',
                options: [
                    {
                        text: "Merci beaucoup. Je prends ça.",
                        nextNode: 'price',
                        isCorrect: true
                    }
                ]
            },
            price: {
                message: "Ça fait 5 euros 20. Reposez-vous bien !",
                speaker: 'Pharmacien',
                options: [
                    {
                        text: "Voilà. Merci pour vos conseils !",
                        nextNode: 'end_success',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "De rien. Bon rétablissement !",
                speaker: 'Pharmacien',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'apartment_viewing',
        title: 'Viewing an Apartment',
        npcId: 'landlord',
        difficulty: 'Advanced',
        xpReward: 90,
        description: 'Ask about rent, amenities, and the neighborhood.',
        culturalNote: 'In France, rent is often quoted without charges (utilities). Always ask "charges comprises ?"',
        initialMessage: "Bonjour ! Bienvenue. Vous cherchez un appartement ?",
        initialSpeaker: 'Propriétaire',
        nodes: {
            start: {
                options: [
                    {
                        text: "Bonjour ! Oui, je cherche un deux-pièces.",
                        nextNode: 'show_apartment',
                        isCorrect: true
                    },
                    {
                        text: "Je veux voir l'appartement.",
                        nextNode: 'correction_polite',
                        isCorrect: false,
                        feedback: "Start with a greeting and be more polite when house hunting!"
                    }
                ]
            },
            correction_polite: {
                message: "Bien sûr. Vous cherchez quel type de logement ?",
                speaker: 'Propriétaire',
                options: [
                    {
                        text: "Pardon. Je cherche un appartement avec une chambre.",
                        nextNode: 'show_apartment',
                        isCorrect: true
                    }
                ]
            },
            show_apartment: {
                message: "Voici le salon et la cuisine ouverte. La chambre est par là.",
                speaker: 'Propriétaire',
                options: [
                    {
                        text: "C'est lumineux ! Le loyer est de combien ?",
                        nextNode: 'rent',
                        isCorrect: true
                    },
                    {
                        text: "L'appartement est bien situé ?",
                        nextNode: 'neighborhood',
                        isCorrect: true
                    }
                ]
            },
            rent: {
                message: "Le loyer est de 950 euros par mois.",
                speaker: 'Propriétaire',
                options: [
                    {
                        text: "C'est charges comprises ?",
                        nextNode: 'charges',
                        isCorrect: true
                    },
                    {
                        text: "D'accord. Et le quartier ?",
                        nextNode: 'neighborhood',
                        isCorrect: true
                    }
                ]
            },
            charges: {
                message: "Non, les charges sont de 80 euros en plus. Eau et chauffage inclus.",
                speaker: 'Propriétaire',
                options: [
                    {
                        text: "Je comprends. Et le quartier est calme ?",
                        nextNode: 'neighborhood',
                        isCorrect: true
                    }
                ]
            },
            neighborhood: {
                message: "Oui, très calme. Il y a un métro à 5 minutes et des commerces partout.",
                speaker: 'Propriétaire',
                options: [
                    {
                        text: "Parfait. Quand est-ce que je pourrais emménager ?",
                        nextNode: 'move_in',
                        isCorrect: true
                    }
                ]
            },
            move_in: {
                message: "L'appartement est disponible le 1er du mois prochain.",
                speaker: 'Propriétaire',
                options: [
                    {
                        text: "Très bien. Je suis intéressé(e). Comment on procède ?",
                        nextNode: 'end_success',
                        isCorrect: true
                    },
                    {
                        text: "Merci, je vais y réfléchir.",
                        nextNode: 'end_thinking',
                        isCorrect: true
                    }
                ]
            },
            end_success: {
                message: "Super ! Je vous envoie le dossier par email. À bientôt !",
                speaker: 'Propriétaire',
                end: true,
                success: true
            },
            end_thinking: {
                message: "Bien sûr. N'hésitez pas à me rappeler !",
                speaker: 'Propriétaire',
                end: true,
                success: true
            }
        }
    }
];
