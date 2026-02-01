export const CALL_SCENARIOS = [
    {
        id: 'bakery_call',
        callerName: 'Boulangerie Patisserie',
        avatar: null, // Placeholder for icon
        nodes: {
            start: {
                message: "Boulangerie Le Pain Doré, bonjour ?",
                speaker: 'Boulanger',
                options: [
                    {
                        text: "Bonjour, je voudrais commander un gâteau.",
                        keywords: ['commander', 'gâteau', 'gateau'],
                        next: 'order_cake'
                    },
                    {
                        text: "À quelle heure fermez-vous ?",
                        keywords: ['heure', 'fermez', 'ouverture'],
                        next: 'closing_time'
                    }
                ]
            },
            order_cake: {
                message: "Bien sûr. C'est pour combien de personnes ?",
                speaker: 'Boulanger',
                options: [
                    { text: "Pour six personnes.", keywords: ['six', '6'], next: 'flavor' },
                    { text: "Juste pour moi.", keywords: ['moi', 'seul'], next: 'flavor_small' }
                ]
            },
            closing_time: {
                message: "Nous fermons à 19h30 ce soir.",
                speaker: 'Boulanger',
                end: true,
                success: true
            },
            flavor: {
                message: "Très bien. Nous avons chocolat ou fraise ?",
                speaker: 'Boulanger',
                options: [
                    { text: "Chocolat s'il vous plaît.", keywords: ['chocolat'], next: 'confirm' },
                    { text: "Fraise, merci.", keywords: ['fraise'], next: 'confirm' }
                ]
            },
            flavor_small: {
                message: "D'accord, une tartelette alors ?",
                speaker: 'Boulanger',
                end: true,
                success: true
            },
            confirm: {
                message: "C'est noté pour 19h. Merci !",
                speaker: 'Boulanger',
                end: true,
                success: true
            }
        }
    },
    {
        id: 'restaurant_reservation',
        callerName: 'Le Petit Bistro',
        avatar: null,
        nodes: {
            start: {
                message: "Restaurant Le Petit Bistro, j'écoute ?",
                speaker: 'Hôte',
                options: [
                    { text: "Je voudrais réserver une table.", keywords: ['réserver', 'table'], next: 'booking' },
                    { text: "Est-ce que vous faites à emporter ?", keywords: ['emporter'], next: 'takeout' }
                ]
            },
            booking: {
                message: "Pour ce soir ? Combien de personnes ?",
                speaker: 'Hôte',
                options: [
                    { text: "Deux personnes, vers 20h.", keywords: ['deux', '2', '20h'], next: 'confirm_booking' }
                ]
            },
            confirm_booking: {
                message: "C'est noté. À tout à l'heure !",
                speaker: 'Hôte',
                end: true,
                success: true
            },
            takeout: {
                message: "Non désolé, nous ne faisons que le service en salle.",
                speaker: 'Hôte',
                end: true,
                success: true
            }
        }
    }
];
