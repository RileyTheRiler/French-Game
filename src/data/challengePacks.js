/**
 * Challenge Packs
 * Themed vocabulary sets for focused practice sessions.
 */

export const CHALLENGE_PACKS = [
    {
        id: 'restaurant',
        title: 'Au Restaurant',
        description: 'Master dining vocabulary',
        icon: '🍽️',
        color: 'from-amber-500 to-orange-600',
        difficulty: 'Beginner',
        words: [
            { french: 'le menu', english: 'the menu' },
            { french: "l'addition", english: 'the bill' },
            { french: 'le serveur', english: 'the waiter' },
            { french: 'la serveuse', english: 'the waitress' },
            { french: 'commander', english: 'to order' },
            { french: 'le plat du jour', english: 'dish of the day' },
            { french: 'une entrée', english: 'a starter' },
            { french: 'le plat principal', english: 'main course' },
            { french: 'le pourboire', english: 'the tip' },
            { french: 'réserver', english: 'to book' }
        ],
        phrases: [
            { french: "Une table pour deux, s'il vous plaît", english: "A table for two, please" },
            { french: "Qu'est-ce que vous recommandez ?", english: "What do you recommend?" },
            { french: "L'addition, s'il vous plaît", english: "The check, please" }
        ]
    },
    {
        id: 'travel',
        title: 'Voyage',
        description: 'Essential travel vocabulary',
        icon: '✈️',
        color: 'from-blue-500 to-cyan-600',
        difficulty: 'Beginner',
        words: [
            { french: "l'aéroport", english: 'the airport' },
            { french: 'le vol', english: 'the flight' },
            { french: "la carte d'embarquement", english: 'boarding pass' },
            { french: 'les bagages', english: 'luggage' },
            { french: 'la douane', english: 'customs' },
            { french: "l'hôtel", english: 'the hotel' },
            { french: 'la chambre', english: 'the room' },
            { french: 'la clé', english: 'the key' },
            { french: 'le petit déjeuner', english: 'breakfast' },
            { french: 'la réception', english: 'reception' }
        ],
        phrases: [
            { french: "Où est la sortie ?", english: "Where is the exit?" },
            { french: "J'ai une réservation", english: "I have a reservation" },
            { french: "À quelle heure est le départ ?", english: "What time is departure?" }
        ]
    },
    {
        id: 'social',
        title: 'Vie Sociale',
        description: 'Small talk and greetings',
        icon: '💬',
        color: 'from-pink-500 to-rose-600',
        difficulty: 'Beginner',
        words: [
            { french: 'enchanté', english: 'pleased to meet you' },
            { french: 'comment allez-vous', english: 'how are you (formal)' },
            { french: 'ça va', english: "how's it going" },
            { french: 'à bientôt', english: 'see you soon' },
            { french: 'bonne journée', english: 'have a nice day' },
            { french: 'bonne soirée', english: 'have a nice evening' },
            { french: 'félicitations', english: 'congratulations' },
            { french: 'bon courage', english: 'good luck / stay strong' },
            { french: 'santé', english: 'cheers (when drinking)' },
            { french: 'à vos souhaits', english: 'bless you (after sneeze)' }
        ],
        phrases: [
            { french: "D'où venez-vous ?", english: "Where are you from?" },
            { french: "Qu'est-ce que vous faites dans la vie ?", english: "What do you do for a living?" },
            { french: "Ça fait plaisir de vous voir", english: "Nice to see you" }
        ]
    },
    {
        id: 'shopping',
        title: 'Shopping',
        description: 'Prices, sizes, and bargaining',
        icon: '🛍️',
        color: 'from-purple-500 to-indigo-600',
        difficulty: 'Intermediate',
        words: [
            { french: 'combien', english: 'how much' },
            { french: 'cher', english: 'expensive' },
            { french: 'bon marché', english: 'cheap' },
            { french: 'la taille', english: 'the size' },
            { french: 'essayer', english: 'to try on' },
            { french: 'la cabine', english: 'fitting room' },
            { french: 'le reçu', english: 'the receipt' },
            { french: 'payer', english: 'to pay' },
            { french: 'en solde', english: 'on sale' },
            { french: 'la réduction', english: 'the discount' }
        ],
        phrases: [
            { french: "Combien ça coûte ?", english: "How much does it cost?" },
            { french: "Je fais du 40", english: "I'm a size 40" },
            { french: "Est-ce que je peux payer par carte ?", english: "Can I pay by card?" }
        ]
    }
];

export const getPackById = (id) => CHALLENGE_PACKS.find(p => p.id === id);
export const getPacksByDifficulty = (difficulty) => CHALLENGE_PACKS.filter(p => p.difficulty === difficulty);
