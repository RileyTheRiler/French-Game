export const VIDEO_CONTENT = [
    {
        id: "vid_001",
        title: "Ordering Coffee in Paris",
        thumbnail: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", // Using a placeholder public domain video for MVP
        level: "Beginner",
        duration: "0:45",
        description: "Learn how to order a coffee and a croissant in a typical Parisian cafe.",
        subtitles: [
            {
                startTime: 0,
                endTime: 3,
                textFr: "Bonjour, je voudrais un café, s'il vous plaît.",
                textEn: "Hello, I would like a coffee, please.",
                tokens: [
                    { text: "Bonjour", definition: "Hello" },
                    { text: ",", definition: "" },
                    { text: "je", definition: "I" },
                    { text: "voudrais", definition: "would like" },
                    { text: "un", definition: "a" },
                    { text: "café", definition: "coffee" },
                    { text: ",", definition: "" },
                    { text: "s'il vous plaît", definition: "please" },
                    { text: ".", definition: "" }
                ]
            },
            {
                startTime: 3.5,
                endTime: 6,
                textFr: "Bien sûr. Quel type de café désirez-vous ?",
                textEn: "Of course. What type of coffee would you like?",
                tokens: [
                    { text: "Bien", definition: "Good" },
                    { text: "sûr", definition: "sure" },
                    { text: ".", definition: "" },
                    { text: "Quel", definition: "What" },
                    { text: "type", definition: "type" },
                    { text: "de", definition: "of" },
                    { text: "café", definition: "coffee" },
                    { text: "désirez-vous", definition: "do you desire" },
                    { text: "?", definition: "" }
                ]
            },
            {
                startTime: 6.5,
                endTime: 9,
                textFr: "Un café noir, sans sucre.",
                textEn: "A black coffee, without sugar.",
                tokens: [
                    { text: "Un", definition: "A" },
                    { text: "café", definition: "coffee" },
                    { text: "noir", definition: "black" },
                    { text: ",", definition: "" },
                    { text: "sans", definition: "without" },
                    { text: "sucre", definition: "sugar" },
                    { text: ".", definition: "" }
                ]
            },
            {
                startTime: 9.5,
                endTime: 12,
                textFr: "Très bien. Et avec ceci ?",
                textEn: "Very good. And with this?",
                tokens: [
                    { text: "Très", definition: "Very" },
                    { text: "bien", definition: "good" },
                    { text: ".", definition: "" },
                    { text: "Et", definition: "And" },
                    { text: "avec", definition: "with" },
                    { text: "ceci", definition: "this" },
                    { text: "?", definition: "" }
                ]
            },
            {
                startTime: 12.5,
                endTime: 15,
                textFr: "Je prendrai aussi un croissant.",
                textEn: "I will also take a croissant.",
                tokens: [
                    { text: "Je", definition: "I" },
                    { text: "prendrai", definition: "will take" },
                    { text: "aussi", definition: "also" },
                    { text: "un", definition: "a" },
                    { text: "croissant", definition: "croissant" },
                    { text: ".", definition: "" }
                ]
            }
        ]
    },
    {
        id: "vid_002",
        title: "Asking for Directions",
        thumbnail: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        level: "Intermediate",
        duration: "1:20",
        description: "Navigating the streets of Lyon. Asking for the metro and museum.",
        subtitles: [
            {
                startTime: 0,
                endTime: 4,
                textFr: "Excusez-moi, je cherche la station de métro.",
                textEn: "Excuse me, I am looking for the metro station.",
                tokens: [
                    { text: "Excusez-moi", definition: "Excuse me" },
                    { text: ",", definition: "" },
                    { text: "je", definition: "I" },
                    { text: "cherche", definition: "am looking for" },
                    { text: "la", definition: "the" },
                    { text: "station", definition: "station" },
                    { text: "de", definition: "of" },
                    { text: "métro", definition: "metro" },
                    { text: ".", definition: "" }
                ]
            }
        ]
    }
];
