// Media Clips - Curated French content for listening comprehension

export const MEDIA_CLIPS = [
    {
        id: 'weather_report',
        title: 'Météo du Jour',
        titleEn: 'Today\'s Weather',
        category: 'news',
        difficulty: 'Beginner',
        duration: 45,
        xpReward: 30,
        thumbnail: '/images/media/weather.jpg',
        videoUrl: '/videos/weather.mp4',
        transcript: [
            { time: 0, french: "Bonjour à tous!", english: "Hello everyone!" },
            { time: 2, french: "Voici la météo pour aujourd'hui.", english: "Here's the weather for today." },
            { time: 5, french: "Sur Paris, temps nuageux ce matin.", english: "In Paris, cloudy weather this morning." },
            { time: 9, french: "Les températures seront de 15 degrés.", english: "Temperatures will be 15 degrees." },
            { time: 13, french: "Cet après-midi, éclaircies attendues.", english: "This afternoon, clearing expected." },
            { time: 17, french: "Dans le sud, soleil et 22 degrés.", english: "In the south, sunny and 22 degrees." },
            { time: 22, french: "Attention aux orages en montagne.", english: "Watch out for storms in the mountains." },
            { time: 27, french: "Bonne journée à tous!", english: "Have a nice day everyone!" }
        ],
        comprehensionQuestions: [
            {
                question: "Quel temps fait-il à Paris ce matin?",
                options: ["Ensoleillé", "Nuageux", "Pluvieux", "Neigeux"],
                correctIndex: 1
            },
            {
                question: "Quelle est la température à Paris?",
                options: ["12 degrés", "15 degrés", "18 degrés", "22 degrés"],
                correctIndex: 1
            },
            {
                question: "Où y a-t-il du soleil?",
                options: ["À Paris", "En montagne", "Dans le sud", "Au nord"],
                correctIndex: 2
            }
        ],
        vocabularyHighlights: ['nuageux', 'éclaircies', 'orages', 'températures']
    },
    {
        id: 'cafe_scene',
        title: 'Scène au Café',
        titleEn: 'Café Scene',
        category: 'movie',
        difficulty: 'Intermediate',
        duration: 60,
        xpReward: 50,
        thumbnail: '/images/media/cafe.jpg',
        videoUrl: '/videos/cafe.mp4',
        transcript: [
            { time: 0, french: "Un café, s'il vous plaît.", english: "A coffee, please." },
            { time: 3, french: "Noir ou au lait?", english: "Black or with milk?" },
            { time: 5, french: "Noir, avec un sucre.", english: "Black, with one sugar." },
            { time: 8, french: "Et pour vous, madame?", english: "And for you, madam?" },
            { time: 11, french: "Un thé vert, s'il vous plaît.", english: "A green tea, please." },
            { time: 14, french: "Vous désirez autre chose?", english: "Would you like anything else?" },
            { time: 17, french: "Oui, deux croissants.", english: "Yes, two croissants." },
            { time: 20, french: "Ça fera 8 euros 50.", english: "That will be 8 euros 50." },
            { time: 24, french: "Voilà. Gardez la monnaie.", english: "Here. Keep the change." },
            { time: 27, french: "Merci beaucoup! Bonne journée!", english: "Thank you very much! Have a nice day!" }
        ],
        comprehensionQuestions: [
            {
                question: "Comment le monsieur prend-il son café?",
                options: ["Au lait", "Noir avec sucre", "Noir sans sucre", "Crème"],
                correctIndex: 1
            },
            {
                question: "Que commande la dame?",
                options: ["Un café", "Un chocolat", "Un thé vert", "Un jus"],
                correctIndex: 2
            },
            {
                question: "Combien coûte la commande?",
                options: ["6€50", "7€50", "8€50", "9€50"],
                correctIndex: 2
            }
        ],
        vocabularyHighlights: ['noir', 'au lait', 'gardez la monnaie', 'vous désirez']
    },
    {
        id: 'interview_chef',
        title: 'Interview: Chef Parisien',
        titleEn: 'Interview: Parisian Chef',
        category: 'interview',
        difficulty: 'Advanced',
        duration: 90,
        xpReward: 75,
        thumbnail: '/images/media/chef.jpg',
        videoUrl: '/videos/chef.mp4',
        transcript: [
            { time: 0, french: "Bonjour Chef, parlez-nous de votre parcours.", english: "Hello Chef, tell us about your journey." },
            { time: 4, french: "J'ai commencé à cuisiner à 14 ans.", english: "I started cooking at 14." },
            { time: 8, french: "Ma grand-mère m'a tout appris.", english: "My grandmother taught me everything." },
            { time: 12, french: "Quelle est votre spécialité?", english: "What is your specialty?" },
            { time: 15, french: "La cuisine traditionnelle française.", english: "Traditional French cuisine." },
            { time: 19, french: "Avec une touche moderne, bien sûr.", english: "With a modern touch, of course." },
            { time: 23, french: "Votre plat préféré à préparer?", english: "Your favorite dish to prepare?" },
            { time: 27, french: "Le boeuf bourguignon de ma mère.", english: "My mother's beef bourguignon." },
            { time: 32, french: "C'est un plat qui prend du temps.", english: "It's a dish that takes time." },
            { time: 36, french: "Mais le résultat en vaut la peine.", english: "But the result is worth it." }
        ],
        comprehensionQuestions: [
            {
                question: "À quel âge le chef a-t-il commencé?",
                options: ["10 ans", "12 ans", "14 ans", "16 ans"],
                correctIndex: 2
            },
            {
                question: "Qui lui a appris à cuisiner?",
                options: ["Son père", "Sa mère", "Sa grand-mère", "Un chef"],
                correctIndex: 2
            },
            {
                question: "Quel est son plat préféré?",
                options: ["Coq au vin", "Boeuf bourguignon", "Ratatouille", "Cassoulet"],
                correctIndex: 1
            }
        ],
        vocabularyHighlights: ['parcours', 'spécialité', 'touche moderne', 'en vaut la peine']
    },
    {
        id: 'news_headline',
        title: 'Flash Info',
        titleEn: 'News Flash',
        category: 'news',
        difficulty: 'Intermediate',
        duration: 55,
        xpReward: 45,
        thumbnail: '/images/media/news.jpg',
        videoUrl: '/videos/news.mp4',
        transcript: [
            { time: 0, french: "Bonsoir, voici les titres.", english: "Good evening, here are the headlines." },
            { time: 3, french: "Le président rencontre les syndicats.", english: "The president meets with unions." },
            { time: 7, french: "Les négociations ont duré 3 heures.", english: "Negotiations lasted 3 hours." },
            { time: 11, french: "Aucun accord n'a été trouvé.", english: "No agreement was reached." },
            { time: 15, french: "En sport, victoire de l'équipe de France.", english: "In sports, victory for the French team." },
            { time: 19, french: "Score final: 3 à 1.", english: "Final score: 3 to 1." },
            { time: 23, french: "La météo: temps doux demain.", english: "Weather: mild weather tomorrow." }
        ],
        comprehensionQuestions: [
            {
                question: "Combien de temps ont duré les négociations?",
                options: ["1 heure", "2 heures", "3 heures", "4 heures"],
                correctIndex: 2
            },
            {
                question: "Quel est le score du match?",
                options: ["2-1", "3-1", "3-2", "4-1"],
                correctIndex: 1
            }
        ],
        vocabularyHighlights: ['syndicats', 'négociations', 'accord', 'victoire']
    },
    {
        id: 'movie_trailer',
        title: 'Bande-Annonce: Amélie',
        titleEn: 'Trailer: Amélie',
        category: 'movie',
        difficulty: 'Advanced',
        duration: 75,
        xpReward: 60,
        thumbnail: '/images/media/amelie.jpg',
        videoUrl: '/videos/amelie.mp4',
        transcript: [
            { time: 0, french: "Amélie Poulain a une vie simple.", english: "Amélie Poulain has a simple life." },
            { time: 4, french: "Elle travaille dans un café à Montmartre.", english: "She works in a café in Montmartre." },
            { time: 8, french: "Un jour, elle trouve une boîte cachée.", english: "One day, she finds a hidden box." },
            { time: 12, french: "Elle décide de changer la vie des autres.", english: "She decides to change others' lives." },
            { time: 17, french: "Mais qui va changer la sienne?", english: "But who will change hers?" },
            { time: 21, french: "Le destin est parfois surprenant.", english: "Fate is sometimes surprising." }
        ],
        comprehensionQuestions: [
            {
                question: "Où travaille Amélie?",
                options: ["Dans un restaurant", "Dans un café", "Dans une boulangerie", "Dans un musée"],
                correctIndex: 1
            },
            {
                question: "Qu'est-ce qu'elle trouve?",
                options: ["Une lettre", "Une boîte", "Un livre", "Une photo"],
                correctIndex: 1
            }
        ],
        vocabularyHighlights: ['vie simple', 'boîte cachée', 'destin', 'surprenant']
    },
    {
        id: 'street_interview',
        title: 'Micro-Trottoir: Paris',
        titleEn: 'Street Interview: Paris',
        category: 'interview',
        difficulty: 'Beginner',
        duration: 40,
        xpReward: 35,
        thumbnail: '/images/media/street.jpg',
        videoUrl: '/videos/street.mp4',
        transcript: [
            { time: 0, french: "Qu'est-ce que vous aimez à Paris?", english: "What do you like about Paris?" },
            { time: 3, french: "J'adore les musées!", english: "I love the museums!" },
            { time: 6, french: "Et vous, monsieur?", english: "And you, sir?" },
            { time: 8, french: "Moi, c'est la gastronomie.", english: "For me, it's the food." },
            { time: 11, french: "Les restaurants sont incroyables.", english: "The restaurants are incredible." },
            { time: 14, french: "Et vous, madame?", english: "And you, madam?" },
            { time: 16, french: "L'architecture, bien sûr!", english: "The architecture, of course!" }
        ],
        comprehensionQuestions: [
            {
                question: "Qu'est-ce que la première personne aime?",
                options: ["La nourriture", "Les musées", "L'architecture", "Les parcs"],
                correctIndex: 1
            },
            {
                question: "Que préfère le monsieur?",
                options: ["Les musées", "La gastronomie", "Les monuments", "Les cafés"],
                correctIndex: 1
            }
        ],
        vocabularyHighlights: ['musées', 'gastronomie', 'incroyables', 'architecture']
    }
];

// Helper functions
export const getClipById = (id) => MEDIA_CLIPS.find(c => c.id === id);
export const getClipsByCategory = (cat) => MEDIA_CLIPS.filter(c => c.category === cat);
export const getClipsByDifficulty = (diff) => MEDIA_CLIPS.filter(c => c.difficulty === diff);
export const getCategories = () => [...new Set(MEDIA_CLIPS.map(c => c.category))];
