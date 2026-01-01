const buildTtsUrl = (text) => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${encodeURIComponent(text)}`;

const BASE_VOCABULARY = [
    // === BASICS ===
    {
        id: 'b1', french: 'bonjour', english: 'hello', category: 'basics',
        cefr: 'A1', pos: 'expression', gender: null, ipa: 'bɔ̃.ʒuʁ',
        example: { french: 'Bonjour, comment ça va ?', english: 'Hello, how are you?' }
    },
    {
        id: 'b2', french: 'au revoir', english: 'goodbye', category: 'basics',
        cefr: 'A1', pos: 'expression', gender: null, ipa: 'o ʁə.vwaʁ',
        example: { french: 'Au revoir et à bientôt !', english: 'Goodbye and see you soon!' }
    },
    {
        id: 'b3', french: 'merci', english: 'thank you', category: 'basics',
        cefr: 'A1', pos: 'expression', gender: null, ipa: 'mɛʁ.si',
        example: { french: 'Merci pour ton aide.', english: 'Thank you for your help.' }
    },
    {
        id: 'b4', french: "s'il vous plaît", english: 'please', category: 'basics',
        cefr: 'A1', pos: 'expression', gender: null, ipa: 'sil vu plɛ',
        example: { french: "Un café, s'il vous plaît.", english: 'A coffee, please.' }
    },
    {
        id: 'b5', french: 'oui', english: 'yes', category: 'basics',
        cefr: 'A1', pos: 'adverb', gender: null, ipa: 'wi',
        example: { french: 'Oui, je comprends.', english: 'Yes, I understand.' }
    },
    {
        id: 'b6', french: 'non', english: 'no', category: 'basics',
        cefr: 'A1', pos: 'adverb', gender: null, ipa: 'nɔ̃',
        example: { french: "Non, ce n'est pas possible.", english: 'No, that is not possible.' }
    },
    {
        id: 'b7', french: 'excusez-moi', english: 'excuse me', category: 'basics',
        cefr: 'A1', pos: 'expression', gender: null, ipa: 'ɛk.sky.ze mwa',
        example: { french: 'Excusez-moi, où sont les toilettes ?', english: 'Excuse me, where is the restroom?' }
    },
    {
        id: 'b8', french: 'pardon', english: 'sorry', category: 'basics',
        cefr: 'A1', pos: 'expression', gender: null, ipa: 'paʁ.dɔ̃',
        example: { french: 'Pardon, je ne vous ai pas vu.', english: 'Sorry, I did not see you.' }
    },

    // === FOOD & DRINK ===
    { id: 'f1', french: 'pomme', english: 'apple', category: 'food', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'pɔm', example: { french: "Je mange une pomme rouge.", english: 'I am eating a red apple.' } },
    { id: 'f2', french: 'pain', english: 'bread', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'pɛ̃', example: { french: 'Le pain est frais ce matin.', english: 'The bread is fresh this morning.' } },
    { id: 'f3', french: 'fromage', english: 'cheese', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'fʁɔ.maʒ', example: { french: "J'aime le fromage français.", english: 'I like French cheese.' } },
    { id: 'f4', french: 'eau', english: 'water', category: 'food', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'o', example: { french: "Puis-je avoir de l'eau, s'il vous plaît ?", english: 'May I have some water, please?' } },
    { id: 'f5', french: 'café', english: 'coffee', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'ka.fe', example: { french: 'Le café est très fort.', english: 'The coffee is very strong.' } },
    { id: 'f6', french: 'thé', english: 'tea', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'te', example: { french: 'Je prends du thé au citron.', english: 'I have tea with lemon.' } },
    { id: 'f7', french: 'vin', english: 'wine', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'vɛ̃', example: { french: 'Un verre de vin rouge, s’il vous plaît.', english: 'A glass of red wine, please.' } },
    { id: 'f8', french: 'bière', english: 'beer', category: 'food', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'bjɛʁ', example: { french: 'La bière est bien fraîche.', english: 'The beer is nice and cold.' } },
    { id: 'f9', french: 'croissant', english: 'croissant', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'kʁwa.sɑ̃', example: { french: 'Je prends un croissant au petit déjeuner.', english: 'I have a croissant for breakfast.' } },
    { id: 'f10', french: 'baguette', english: 'baguette', category: 'food', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'ba.ɡɛt', example: { french: 'La baguette sort du four.', english: 'The baguette just came out of the oven.' } },
    { id: 'f11', french: 'poulet', english: 'chicken', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'pu.lɛ', example: { french: 'Le poulet rôtit au four.', english: 'The chicken is roasting in the oven.' } },
    { id: 'f12', french: 'poisson', english: 'fish', category: 'food', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'pwa.sɔ̃', example: { french: 'Ce poisson vient du marché.', english: 'This fish comes from the market.' } },
    { id: 'f13', french: 'salade', english: 'salad', category: 'food', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'sa.lad', example: { french: 'Je prépare une salade verte.', english: 'I am making a green salad.' } },
    { id: 'f14', french: 'soupe', english: 'soup', category: 'food', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'sup', example: { french: 'La soupe est chaude.', english: 'The soup is hot.' } },
    { id: 'f15', french: 'dessert', english: 'dessert', category: 'food', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'de.sɛʁ', example: { french: 'Quel dessert préférez-vous ?', english: 'Which dessert do you prefer?' } },

    // === ANIMALS ===
    { id: 'a1', french: 'le chat', english: 'the cat', category: 'animals', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə ʃa', example: { french: 'Le chat dort sur le canapé.', english: 'The cat sleeps on the sofa.' } },
    { id: 'a2', french: 'le chien', english: 'the dog', category: 'animals', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə ʃjɛ̃', example: { french: 'Le chien court dans le jardin.', english: 'The dog runs in the garden.' } },
    { id: 'a3', french: "l'oiseau", english: 'the bird', category: 'animals', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lwa.zo', example: { french: "L'oiseau chante le matin.", english: 'The bird sings in the morning.' } },
    { id: 'a4', french: 'le poisson', english: 'the fish', category: 'animals', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə pwa.sɔ̃', example: { french: 'Le poisson nage vite.', english: 'The fish swims fast.' } },
    { id: 'a5', french: 'le cheval', english: 'the horse', category: 'animals', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə ʃə.val', example: { french: 'Le cheval galope dans le champ.', english: 'The horse gallops in the field.' } },
    { id: 'a6', french: 'la vache', english: 'the cow', category: 'animals', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la vaʃ', example: { french: 'La vache est dans le pré.', english: 'The cow is in the meadow.' } },
    { id: 'a7', french: 'le lapin', english: 'the rabbit', category: 'animals', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə la.pɛ̃', example: { french: 'Le lapin mange une carotte.', english: 'The rabbit eats a carrot.' } },

    // === COLORS ===
    { id: 'c1', french: 'rouge', english: 'red', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'ʁuʒ', example: { french: 'La pomme est rouge.', english: 'The apple is red.' } },
    { id: 'c2', french: 'bleu', english: 'blue', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'blø', example: { french: 'Le ciel est bleu aujourd’hui.', english: 'The sky is blue today.' } },
    { id: 'c3', french: 'vert', english: 'green', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'vɛʁ', example: { french: 'L’herbe est verte.', english: 'The grass is green.' } },
    { id: 'c4', french: 'jaune', english: 'yellow', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'ʒon', example: { french: 'Le soleil est jaune.', english: 'The sun is yellow.' } },
    { id: 'c5', french: 'noir', english: 'black', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'nwaʁ', example: { french: 'Le chat noir dort.', english: 'The black cat sleeps.' } },
    { id: 'c6', french: 'blanc', english: 'white', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'blɑ̃', example: { french: 'La neige est blanche.', english: 'The snow is white.' } },
    { id: 'c7', french: 'orange', english: 'orange', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'ɔ.ʁɑ̃ʒ', example: { french: 'Le mur est orange.', english: 'The wall is orange.' } },
    { id: 'c8', french: 'rose', english: 'pink', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'ʁoz', example: { french: 'La fleur est rose.', english: 'The flower is pink.' } },
    { id: 'c9', french: 'violet', english: 'purple', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'vjɔ.lɛ', example: { french: 'Le manteau est violet.', english: 'The coat is purple.' } },
    { id: 'c10', french: 'gris', english: 'gray', category: 'colors', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'ɡʁi', example: { french: 'Le ciel est gris aujourd’hui.', english: 'The sky is gray today.' } },

    // === NUMBERS ===
    { id: 'n1', french: 'un', english: 'one', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'œ̃', example: { french: 'Il y a un livre sur la table.', english: 'There is one book on the table.' } },
    { id: 'n2', french: 'deux', english: 'two', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'dø', example: { french: 'J’ai deux frères.', english: 'I have two brothers.' } },
    { id: 'n3', french: 'trois', english: 'three', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'tʁwa', example: { french: 'Trois étudiants attendent.', english: 'Three students are waiting.' } },
    { id: 'n4', french: 'quatre', english: 'four', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'katʁ', example: { french: 'Il reste quatre minutes.', english: 'There are four minutes left.' } },
    { id: 'n5', french: 'cinq', english: 'five', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'sɛ̃k', example: { french: 'Cinq personnes sont là.', english: 'Five people are there.' } },
    { id: 'n6', french: 'six', english: 'six', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'sis', example: { french: 'Six pommes sont sur le comptoir.', english: 'Six apples are on the counter.' } },
    { id: 'n7', french: 'sept', english: 'seven', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'sɛt', example: { french: 'Le bus arrive à sept heures.', english: 'The bus arrives at seven o’clock.' } },
    { id: 'n8', french: 'huit', english: 'eight', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'ɥit', example: { french: 'Nous partons dans huit jours.', english: 'We leave in eight days.' } },
    { id: 'n9', french: 'neuf', english: 'nine', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'nœf', example: { french: 'Neuf élèves sont absents.', english: 'Nine students are absent.' } },
    { id: 'n10', french: 'dix', english: 'ten', category: 'numbers', cefr: 'A1', pos: 'numeral', gender: null, ipa: 'dis', example: { french: 'Dix minutes suffisent.', english: 'Ten minutes are enough.' } },

    // === TRAVEL ===
    { id: 't1', french: "l'aéroport", english: 'the airport', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'le.ʁɔ.pɔʁ', example: { french: "Nous arrivons à l'aéroport tôt.", english: 'We arrive at the airport early.' } },
    { id: 't2', french: 'la gare', english: 'the train station', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'f', ipa: 'la ɡaʁ', example: { french: 'La gare est au centre-ville.', english: 'The train station is downtown.' } },
    { id: 't3', french: "l'hôtel", english: 'the hotel', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lo.tɛl', example: { french: "L'hôtel a une belle vue.", english: 'The hotel has a nice view.' } },
    { id: 't4', french: 'le billet', english: 'the ticket', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə bi.jɛ', example: { french: 'J’achète un billet de train.', english: 'I am buying a train ticket.' } },
    { id: 't5', french: 'le passeport', english: 'the passport', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə pas.pɔʁ', example: { french: 'Mon passeport est prêt.', english: 'My passport is ready.' } },
    { id: 't6', french: 'la valise', english: 'the suitcase', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'f', ipa: 'la va.liz', example: { french: 'La valise est lourde.', english: 'The suitcase is heavy.' } },
    { id: 't7', french: 'le train', english: 'the train', category: 'travel', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə tʁɛ̃', example: { french: 'Le train part dans cinq minutes.', english: 'The train leaves in five minutes.' } },
    { id: 't8', french: "l'avion", english: 'the plane', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'la.vjɔ̃', example: { french: "L'avion décolle à midi.", english: 'The plane takes off at noon.' } },
    { id: 't9', french: 'le taxi', english: 'the taxi', category: 'travel', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə tak.si', example: { french: 'Le taxi arrive dans dix minutes.', english: 'The taxi arrives in ten minutes.' } },
    { id: 't10', french: 'le métro', english: 'the subway', category: 'travel', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə me.tʁo', example: { french: 'Nous prenons le métro pour aller au musée.', english: 'We take the subway to go to the museum.' } },

    // === PLACES ===
    { id: 'p1', french: 'la maison', english: 'the house', category: 'places', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la mɛ.zɔ̃', example: { french: 'La maison est grande.', english: 'The house is big.' } },
    { id: 'p2', french: 'le restaurant', english: 'the restaurant', category: 'places', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə ʁɛs.to.ʁɑ̃', example: { french: 'Le restaurant ouvre à midi.', english: 'The restaurant opens at noon.' } },
    { id: 'p3', french: 'le café', english: 'the café', category: 'places', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə ka.fe', example: { french: 'Nous travaillons au café.', english: 'We work at the café.' } },
    { id: 'p4', french: 'la boulangerie', english: 'the bakery', category: 'places', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la bu.lɑ̃ʒ.ʁi', example: { french: 'La boulangerie vend des croissants.', english: 'The bakery sells croissants.' } },
    { id: 'p5', french: 'le marché', english: 'the market', category: 'places', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə maʁ.ʃe', example: { french: 'Je vais au marché le samedi.', english: 'I go to the market on Saturdays.' } },
    { id: 'p6', french: 'la pharmacie', english: 'the pharmacy', category: 'places', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la faʁ.ma.si', example: { french: 'La pharmacie est ouverte tard.', english: 'The pharmacy is open late.' } },
    { id: 'p7', french: "l'hôpital", english: 'the hospital', category: 'places', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lo.pi.tal', example: { french: "L'hôpital est à deux kilomètres.", english: 'The hospital is two kilometers away.' } },
    { id: 'p8', french: 'la banque', english: 'the bank', category: 'places', cefr: 'A2', pos: 'noun', gender: 'f', ipa: 'la bɑ̃k', example: { french: 'La banque est fermée le dimanche.', english: 'The bank is closed on Sundays.' } },
    { id: 'p9', french: 'le musée', english: 'the museum', category: 'places', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə my.ze', example: { french: 'Le musée a une nouvelle exposition.', english: 'The museum has a new exhibit.' } },
    { id: 'p10', french: 'le parc', english: 'the park', category: 'places', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə paʁk', example: { french: 'Nous marchons dans le parc.', english: 'We walk in the park.' } },

    // === EMOTIONS ===
    { id: 'e1', french: 'heureux', english: 'happy', category: 'emotions', cefr: 'A2', pos: 'adjective', gender: null, ipa: 'ø.ʁø', example: { french: 'Je suis heureux de te voir.', english: 'I am happy to see you.' } },
    { id: 'e2', french: 'triste', english: 'sad', category: 'emotions', cefr: 'A2', pos: 'adjective', gender: null, ipa: 'tʁist', example: { french: 'Il est triste aujourd’hui.', english: 'He is sad today.' } },
    { id: 'e3', french: 'en colère', english: 'angry', category: 'emotions', cefr: 'A2', pos: 'expression', gender: null, ipa: 'ɑ̃ kɔ.lɛʁ', example: { french: 'Elle est en colère contre moi.', english: 'She is angry with me.' } },
    { id: 'e4', french: 'fatigué', english: 'tired', category: 'emotions', cefr: 'A1', pos: 'adjective', gender: null, ipa: 'fa.ti.ɡe', example: { french: 'Je suis fatigué après le travail.', english: 'I am tired after work.' } },
    { id: 'e5', french: 'excité', english: 'excited', category: 'emotions', cefr: 'A2', pos: 'adjective', gender: null, ipa: 'ɛk.si.te', example: { french: 'Les enfants sont excités.', english: 'The children are excited.' } },
    { id: 'e6', french: 'nerveux', english: 'nervous', category: 'emotions', cefr: 'A2', pos: 'adjective', gender: null, ipa: 'nɛʁ.vø', example: { french: 'Je suis nerveux avant l’examen.', english: 'I am nervous before the exam.' } },
    { id: 'e7', french: 'surpris', english: 'surprised', category: 'emotions', cefr: 'A2', pos: 'adjective', gender: null, ipa: 'syʁ.pʁi', example: { french: 'Nous sommes surpris par la nouvelle.', english: 'We are surprised by the news.' } },
    { id: 'e8', french: 'confus', english: 'confused', category: 'emotions', cefr: 'B1', pos: 'adjective', gender: null, ipa: 'kɔ̃.fy', example: { french: 'Je suis confus par ces instructions.', english: 'I am confused by these instructions.' } },

    // === COMMON VERBS ===
    { id: 'v1', french: 'manger', english: 'to eat', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'mɑ̃.ʒe', example: { french: 'Je vais manger maintenant.', english: 'I am going to eat now.' } },
    { id: 'v2', french: 'boire', english: 'to drink', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'bwaʁ', example: { french: 'Il préfère boire du thé.', english: 'He prefers to drink tea.' } },
    { id: 'v3', french: 'aller', english: 'to go', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'a.le', example: { french: 'Nous allons au cinéma.', english: 'We are going to the cinema.' } },
    { id: 'v4', french: 'parler', english: 'to speak', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'paʁ.le', example: { french: 'Elle aime parler français.', english: 'She likes to speak French.' } },
    { id: 'v5', french: 'écouter', english: 'to listen', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'e.ku.te', example: { french: 'Écoutez cette chanson.', english: 'Listen to this song.' } },
    { id: 'v6', french: 'regarder', english: 'to watch', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'ʁə.ɡaʁ.de', example: { french: 'Nous regardons un film.', english: 'We are watching a movie.' } },
    { id: 'v7', french: 'lire', english: 'to read', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'liʁ', example: { french: 'Elle aime lire des romans.', english: 'She likes to read novels.' } },
    { id: 'v8', french: 'écrire', english: 'to write', category: 'verbs', cefr: 'A2', pos: 'verb', gender: null, ipa: 'e.kʁiʁ', example: { french: 'J’aime écrire des lettres.', english: 'I like to write letters.' } },
    { id: 'v9', french: 'acheter', english: 'to buy', category: 'verbs', cefr: 'A1', pos: 'verb', gender: null, ipa: 'a.ʃə.te', example: { french: 'Ils vont acheter une voiture.', english: 'They are going to buy a car.' } },
    { id: 'v10', french: 'vendre', english: 'to sell', category: 'verbs', cefr: 'A2', pos: 'verb', gender: null, ipa: 'vɑ̃dʁ', example: { french: 'Le magasin va vendre des livres.', english: 'The store will sell books.' } },

    // === OBJECTS ===
    { id: 'o1', french: 'la voiture', english: 'the car', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la vwa.tyʁ', example: { french: 'La voiture est neuve.', english: 'The car is new.' } },
    { id: 'o2', french: 'le livre', english: 'the book', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə livʁ', example: { french: 'Le livre est sur la table.', english: 'The book is on the table.' } },
    { id: 'o3', french: 'le téléphone', english: 'the phone', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə te.le.fɔn', example: { french: 'Le téléphone sonne.', english: 'The phone is ringing.' } },
    { id: 'o4', french: "l'ordinateur", english: 'the computer', category: 'objects', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lɔʁ.di.na.tœʁ', example: { french: "L'ordinateur est portable.", english: 'The computer is portable.' } },
    { id: 'o5', french: 'la clé', english: 'the key', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la kle', example: { french: 'Où est la clé de la porte ?', english: 'Where is the door key?' } },
    { id: 'o6', french: 'le sac', english: 'the bag', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə sak', example: { french: 'Le sac est lourd.', english: 'The bag is heavy.' } },
    { id: 'o7', french: 'la table', english: 'the table', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la ta.bl', example: { french: 'La table est ronde.', english: 'The table is round.' } },
    { id: 'o8', french: 'la chaise', english: 'the chair', category: 'objects', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la ʃɛz', example: { french: 'La chaise est confortable.', english: 'The chair is comfortable.' } },

    // === TIME ===
    { id: 'tm1', french: "aujourd'hui", english: 'today', category: 'time', cefr: 'A1', pos: 'adverb', gender: null, ipa: 'o.ʒuʁ.dɥi', example: { french: "Aujourd'hui il fait beau.", english: 'The weather is nice today.' } },
    { id: 'tm2', french: 'demain', english: 'tomorrow', category: 'time', cefr: 'A1', pos: 'adverb', gender: null, ipa: 'də.mɛ̃', example: { french: 'Nous partons demain matin.', english: 'We leave tomorrow morning.' } },
    { id: 'tm3', french: 'hier', english: 'yesterday', category: 'time', cefr: 'A1', pos: 'adverb', gender: null, ipa: 'jɛʁ', example: { french: 'Hier, il a plu toute la journée.', english: 'Yesterday, it rained all day.' } },
    { id: 'tm4', french: 'maintenant', english: 'now', category: 'time', cefr: 'A1', pos: 'adverb', gender: null, ipa: 'mɛ̃.tə.nɑ̃', example: { french: 'Je dois partir maintenant.', english: 'I have to leave now.' } },
    { id: 'tm5', french: 'le matin', english: 'the morning', category: 'time', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə ma.tɛ̃', example: { french: 'Le matin, je bois du café.', english: 'In the morning, I drink coffee.' } },
    { id: 'tm6', french: 'le soir', english: 'the evening', category: 'time', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə swaʁ', example: { french: 'Le soir, nous lisons.', english: 'In the evening, we read.' } },
    { id: 'tm7', french: 'la nuit', english: 'the night', category: 'time', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la nɥi', example: { french: 'La nuit est calme.', english: 'The night is calm.' } },
    { id: 'tm8', french: 'la semaine', english: 'the week', category: 'time', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la sə.mɛn', example: { french: 'La semaine commence lundi.', english: 'The week starts on Monday.' } },

    // === FAMILY ===
    { id: 'fam1', french: 'la famille', english: 'the family', category: 'family', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la fa.mij', example: { french: 'Ma famille habite à Paris.', english: 'My family lives in Paris.' } },
    { id: 'fam2', french: 'le père', english: 'the father', category: 'family', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə pɛʁ', example: { french: 'Son père cuisine bien.', english: 'His father cooks well.' } },
    { id: 'fam3', french: 'la mère', english: 'the mother', category: 'family', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la mɛʁ', example: { french: 'Ma mère travaille beaucoup.', english: 'My mother works a lot.' } },
    { id: 'fam4', french: 'le frère', english: 'the brother', category: 'family', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə fʁɛʁ', example: { french: 'Mon frère joue de la guitare.', english: 'My brother plays the guitar.' } },
    { id: 'fam5', french: 'la sœur', english: 'the sister', category: 'family', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la sœʁ', example: { french: 'Sa sœur est étudiante.', english: 'His sister is a student.' } },
    { id: 'fam6', french: 'le fils', english: 'the son', category: 'family', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə fis', example: { french: 'Le fils aide son père.', english: 'The son helps his father.' } },
    { id: 'fam7', french: 'la fille', english: 'the daughter', category: 'family', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la fij', example: { french: 'La fille lit un livre.', english: 'The daughter reads a book.' } },
    { id: 'fam8', french: 'le grand-père', english: 'the grandfather', category: 'family', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə ɡʁɑ̃.pɛʁ', example: { french: 'Mon grand-père aime marcher.', english: 'My grandfather likes to walk.' } },
    { id: 'fam9', french: 'la grand-mère', english: 'the grandmother', category: 'family', cefr: 'A2', pos: 'noun', gender: 'f', ipa: 'la ɡʁɑ̃.mɛʁ', example: { french: 'Ma grand-mère fait des gâteaux.', english: 'My grandmother makes cakes.' } },
    { id: 'fam10', french: "l'oncle", english: 'the uncle', category: 'family', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lɔ̃.kl', example: { french: "L'oncle arrive dimanche.", english: 'The uncle arrives on Sunday.' } },
    { id: 'fam11', french: 'la tante', english: 'the aunt', category: 'family', cefr: 'A2', pos: 'noun', gender: 'f', ipa: 'la tɑ̃t', example: { french: 'Ma tante habite loin.', english: 'My aunt lives far away.' } },
    { id: 'fam12', french: 'le cousin', english: 'the cousin (m)', category: 'family', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə ku.zɛ̃', example: { french: 'Mon cousin visite cet été.', english: 'My cousin is visiting this summer.' } },

    // === BODY PARTS ===
    { id: 'body1', french: 'la tête', english: 'the head', category: 'body', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la tɛt', example: { french: 'J’ai mal à la tête.', english: 'I have a headache.' } },
    { id: 'body2', french: 'les yeux', english: 'the eyes', category: 'body', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'le zjø', example: { french: 'Ouvre bien les yeux.', english: 'Open your eyes wide.' } },
    { id: 'body3', french: 'le nez', english: 'the nose', category: 'body', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə ne', example: { french: 'Son nez est froid.', english: 'His nose is cold.' } },
    { id: 'body4', french: 'la bouche', english: 'the mouth', category: 'body', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la buʃ', example: { french: 'Ferme la bouche, s’il te plaît.', english: 'Close your mouth, please.' } },
    { id: 'body5', french: 'les oreilles', english: 'the ears', category: 'body', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'le.z‿ɔ.ʁɛj', example: { french: 'Mes oreilles me font mal.', english: 'My ears hurt.' } },
    { id: 'body6', french: 'les cheveux', english: 'the hair', category: 'body', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'le ʃə.vø', example: { french: 'Ses cheveux sont longs.', english: 'Her hair is long.' } },
    { id: 'body7', french: 'le bras', english: 'the arm', category: 'body', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə bʁa', example: { french: 'Il lève le bras.', english: 'He raises his arm.' } },
    { id: 'body8', french: 'la main', english: 'the hand', category: 'body', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la mɛ̃', example: { french: 'Donne-moi la main.', english: 'Give me your hand.' } },
    { id: 'body9', french: 'la jambe', english: 'the leg', category: 'body', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la ʒɑ̃b', example: { french: 'Sa jambe est blessée.', english: 'His leg is injured.' } },
    { id: 'body10', french: 'le pied', english: 'the foot', category: 'body', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə pje', example: { french: 'Elle a mal au pied.', english: 'Her foot hurts.' } },
    { id: 'body11', french: 'le cœur', english: 'the heart', category: 'body', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lə kœʁ', example: { french: 'Le cœur bat vite.', english: 'The heart beats fast.' } },

    // === WEATHER ===
    { id: 'w1', french: 'il fait beau', english: "it's nice weather", category: 'weather', cefr: 'A1', pos: 'expression', gender: null, ipa: 'il fɛ bo', example: { french: 'Il fait beau aujourd’hui.', english: 'The weather is nice today.' } },
    { id: 'w2', french: 'il fait chaud', english: "it's hot", category: 'weather', cefr: 'A1', pos: 'expression', gender: null, ipa: 'il fɛ ʃo', example: { french: 'Il fait chaud en été.', english: 'It is hot in summer.' } },
    { id: 'w3', french: 'il fait froid', english: "it's cold", category: 'weather', cefr: 'A1', pos: 'expression', gender: null, ipa: 'il fɛ fʁwa', example: { french: 'Il fait froid ce matin.', english: 'It is cold this morning.' } },
    { id: 'w4', french: 'il pleut', english: "it's raining", category: 'weather', cefr: 'A1', pos: 'expression', gender: null, ipa: 'il plø', example: { french: 'Il pleut depuis hier.', english: 'It has been raining since yesterday.' } },
    { id: 'w5', french: 'il neige', english: "it's snowing", category: 'weather', cefr: 'A1', pos: 'expression', gender: null, ipa: 'il nɛʒ', example: { french: 'Il neige en décembre.', english: 'It snows in December.' } },
    { id: 'w6', french: 'le soleil', english: 'the sun', category: 'weather', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə sɔ.lɛj', example: { french: 'Le soleil brille fort.', english: 'The sun shines brightly.' } },
    { id: 'w7', french: 'la pluie', english: 'the rain', category: 'weather', cefr: 'A1', pos: 'noun', gender: 'f', ipa: 'la plɥi', example: { french: 'La pluie tombe doucement.', english: 'The rain falls gently.' } },
    { id: 'w8', french: 'le vent', english: 'the wind', category: 'weather', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə vɑ̃', example: { french: 'Le vent souffle fort.', english: 'The wind blows hard.' } },
    { id: 'w9', french: 'le nuage', english: 'the cloud', category: 'weather', cefr: 'A1', pos: 'noun', gender: 'm', ipa: 'lə nɥaʒ', example: { french: 'Un nuage cache le soleil.', english: 'A cloud hides the sun.' } },
    { id: 'w10', french: "l'orage", english: 'the storm', category: 'weather', cefr: 'A2', pos: 'noun', gender: 'm', ipa: 'lɔ.ʁaʒ', example: { french: "L'orage approche vite.", english: 'The storm is coming fast.' } },
];

export const vocabularyList = BASE_VOCABULARY.map(entry => ({
    ...entry,
    audioUrl: entry.audioUrl || buildTtsUrl(entry.french)
}));

export const CATEGORIES = {
    basics: { name: 'Basics', icon: '👋', color: 'indigo' },
    food: { name: 'Food & Drink', icon: '🍽️', color: 'amber' },
    animals: { name: 'Animals', icon: '🐾', color: 'emerald' },
    colors: { name: 'Colors', icon: '🎨', color: 'pink' },
    numbers: { name: 'Numbers', icon: '🔢', color: 'blue' },
    travel: { name: 'Travel', icon: '✈️', color: 'sky' },
    places: { name: 'Places', icon: '🏛️', color: 'purple' },
    emotions: { name: 'Emotions', icon: '😊', color: 'rose' },
    verbs: { name: 'Common Verbs', icon: '🏃', color: 'violet' },
    objects: { name: 'Objects', icon: '📦', color: 'slate' },
    time: { name: 'Time', icon: '⏰', color: 'cyan' },
    family: { name: 'Family', icon: '👨‍👩‍👧‍👦', color: 'red' },
    body: { name: 'Body Parts', icon: '🦵', color: 'orange' },
    weather: { name: 'Weather', icon: '🌤️', color: 'teal' },
};

export const getVocabularyByCategory = (category) => {
    return vocabularyList.filter(word => word.category === category);
};

export const getAllCategories = () => {
    return Object.keys(CATEGORIES);
};
