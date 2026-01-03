export const CULTURE_QUESTIONS = [
    {
        id: 'c1',
        category: 'Gastronomy',
        question: "Which pastry is shaped like a crescent moon?",
        options: ["Baguette", "Croissant", "Éclair", "Macaron"],
        answer: "Croissant",
        fact: "The croissant actually originated in Austria as the 'Kipferl' before becoming a French staple."
    },
    {
        id: 'c2',
        category: 'Geography',
        question: "What is the longest river in France?",
        options: ["Seine", "Rhône", "Loire", "Garonne"],
        answer: "Loire",
        fact: "The Loire Valley is famous for its châteaux and vineyards along the river."
    },
    {
        id: 'c3',
        category: 'History',
        question: "Who was known as the 'Sun King'?",
        options: ["Louis XIV", "Napoleon", "Charlemagne", "Louis XVI"],
        answer: "Louis XIV",
        fact: "Louis XIV built the Palace of Versailles to centralize power and keep nobles close."
    },
    {
        id: 'c4',
        category: 'Art',
        question: "Which museum is home to the Mona Lisa?",
        options: ["Musée d'Orsay", "The Louvre", "Centre Pompidou", "Rodin Museum"],
        answer: "The Louvre",
        fact: "The Louvre is the world's largest art museum and a historic monument in Paris."
    },
    {
        id: 'c5',
        category: 'Culture',
        question: "On which date is Bastille Day celebrated?",
        options: ["July 4", "July 14", "June 6", "August 15"],
        answer: "July 14",
        fact: "It commemorates the Storming of the Bastille on 14 July 1789, a turning point of the French Revolution."
    }
];

export const CULTURE_ARTICLES = [
    {
        id: 'art_of_the_baguette',
        title: "The Art of the Baguette",
        category: 'Gastronomy',
        image: '🥖',
        content: "In France, the **baguette** is more than just bread; it's a way of life! Every morning, millions of people visit their local **boulangerie** (bakery) to buy a **tradition** (a traditional baguette made only with flour, water, salt, and yeast). When you enter, it's polite to say '**Bonjour**' to the **boulanger** (baker). Don't forget to tear off the **croûton** (the end of the baguette) and eat it on the way home—it's a French tradition called 'le quignon'!",
        highlights: [
            { french: 'baguette', english: 'long French bread stick' },
            { french: 'boulangerie', english: 'bakery' },
            { french: 'tradition', english: 'traditional recipe baguette' },
            { french: 'Bonjour', english: 'Hello/Good morning' },
            { french: 'boulanger', english: 'baker' },
            { french: 'croûton', english: 'the crusty end of the bread' }
        ],
        xpReward: 30
    },
    {
        id: 'paris_cinema',
        title: "Paris: Birthplace of Cinema",
        category: 'Cinema',
        image: '🎬',
        content: "Did you know that the first public film screening took place in Paris? The Lumière brothers showed their first **films** (movies) at the Grand Café in 1895. Since then, Paris has become the city with the most **cinémas** per square mile. Parisians love the **septième art** (seventh art), which is how they refer to cinema. You can find many small **salles de cinéma** (movie theaters) in the Latin Quarter showing everything from modern **succès** (hits) to classic black and white films.",
        highlights: [
            { french: 'films', english: 'movies' },
            { french: 'cinémas', english: 'movie theaters' },
            { french: 'septième art', english: 'the seventh art (cinema)' },
            { french: 'salles de cinéma', english: 'movie theater rooms' },
            { french: 'succès', english: 'hits/successes' }
        ],
        xpReward: 30
    },
    {
        id: 'festivals_ete',
        title: "Summer Festivals in France",
        category: 'Culture',
        image: '🎪',
        content: "Every year on June 21st, France celebrates the **Fête de la Musique**. It's a day when everyone—amateurs and professionals—plays music in the **rues** (streets) for free. In July, the world's most famous bicycle race, the **Tour de France**, passes through beautiful **paysages** (landscapes). Finally, on July 14th, the country celebrates its **fête nationale** (national holiday) with amazing **feux d'artifice** (fireworks) and military parades.",
        highlights: [
            { french: 'rues', english: 'streets' },
            { french: 'paysages', english: 'landscapes' },
            { french: 'fête nationale', english: 'national holiday' },
            { french: 'feux d\'artifice', english: 'fireworks' }
        ],
        xpReward: 30
    },
    {
        id: 'cafe_culture',
        title: "French Café Culture",
        category: 'Lifestyle',
        image: '☕',
        content: "The French café is a social institution. Whether it's a small **zinc** (neighborhood bar) or a grand café on a boulevard, it's where people meet to talk, read, or just people-watch. When you order an '**un café**', you'll get a small, strong espresso. If you want milk, ask for '**un café au lait**' or '**un crème**'. It's common to spend hours over a single drink. The waiter will never rush you, as the table is yours until you ask for '**l'addition**' (the check)!",
        highlights: [
            { french: 'zinc', english: 'traditional neighborhood bar table/counter' },
            { french: 'un café', english: 'an espresso' },
            { french: 'un café au lait', english: 'coffee with milk' },
            { french: 'un crème', english: 'coffee with cream/milk' },
            { french: 'l\'addition', english: 'the bill/check' }
        ],
        xpReward: 30
    },
    {
        id: 'le_metro',
        title: "The Paris Métro",
        category: 'Travel',
        image: '🚇',
        content: "Navigating Paris is easy thanks to the **métro**. Opened in 1900, many stations still feature beautiful **Art Nouveau** entrances designed by Hector Guimard. Each **ligne** (line) has a number and a color. To find your way, look at the **direction** (the last stop of the line). Be sure to keep your **ticket** until you exit the station. If you want to be a true Parisian, avoid talking loudly on the train—it's a place of quiet **trajets** (commutes)!",
        highlights: [
            { french: 'métro', english: 'subway/underground' },
            { french: 'ligne', english: 'line' },
            { french: 'direction', english: 'destination/direction' },
            { french: 'ticket', english: 'ticket' },
            { french: 'trajets', english: 'journeys/commutes' }
        ],
        xpReward: 30
    }
];

export const getCultureSession = (count = 5) => {
    return CULTURE_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, count);
};
