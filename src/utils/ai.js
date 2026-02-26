// src/utils/ai.js

/**
 * Simulates an AI response generation for conversation scenarios.
 *
 * @param {string} scenarioId - The ID of the current scenario.
 * @param {Array} history - The chat history.
 * @returns {Promise<string>} The generated AI response.
 */
export const generateAIResponse = async (scenarioId, history) => {
    // This is a mock implementation. In a real app, this would call an LLM API.

    return new Promise((resolve) => {
        setTimeout(() => {
            const responses = [
                "C'est très intéressant ! Dites-moi en plus.",
                "Je comprends tout à fait.",
                "Pouvez-vous répéter, s'il vous plaît ?",
                "D'accord, et ensuite ?",
                "C'est noté !"
            ];

            // Simple logic to vary responses based on scenario
            if (scenarioId === 'cafe_order') {
                const cafeResponses = [
                    "Très bon choix ! Avec ceci ?",
                    "Bien sûr. Un instant, s'il vous plaît.",
                    "Cela fera 5 euros, s'il vous plaît.",
                    "Voulez-vous du sucre avec votre café ?"
                ];
                resolve(cafeResponses[Math.floor(Math.random() * cafeResponses.length)]);
            } else if (scenarioId === 'directions') {
                const directionsResponses = [
                    "Allez tout droit, puis tournez à gauche.",
                    "C'est juste à côté de la gare.",
                    "Je ne suis pas d'ici, désolé.",
                    "Prenez la deuxième rue à droite."
                ];
                resolve(directionsResponses[Math.floor(Math.random() * directionsResponses.length)]);
            } else if (scenarioId === 'hotel_checkin') {
                const hotelResponses = [
                    "Voici votre clé. Chambre 302.",
                    "Avez-vous une pièce d'identité ?",
                    "Le petit-déjeuner est servi de 7h à 10h.",
                    "Souhaitez-vous un réveil demain matin ?"
                ];
                resolve(hotelResponses[Math.floor(Math.random() * hotelResponses.length)]);
            } else {
                resolve(responses[Math.floor(Math.random() * responses.length)]);
            }
        }, 1000); // Simulate network delay
    });
};
