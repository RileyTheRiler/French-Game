// French Regions Data for Interactive Map Tours
// Each region contains dialect words, cuisine vocabulary, and cultural tips

export const REGIONS = [
    {
        id: 'paris',
        name: 'Paris & Île-de-France',
        capital: 'Paris',
        coordinates: { x: 48, y: 28 },
        description: 'The heart of France, known for art, fashion, and gastronomy.',
        unlockLevel: 1,
        color: '#8B5CF6',
        dialectWords: [
            { word: 'le métro', meaning: 'the subway', example: "Je prends le métro pour aller au travail.", audio: '/audio/metro.mp3' },
            { word: 'un parisien', meaning: 'a Parisian', example: "Les parisiens adorent les cafés.", audio: '/audio/parisien.mp3' },
            { word: 'la rive gauche', meaning: 'the Left Bank', example: "Les intellectuels se retrouvent sur la rive gauche.", audio: '/audio/rive-gauche.mp3' },
            { word: 'un bobos', meaning: 'bourgeois bohemian', example: "Le Marais est plein de bobos.", audio: '/audio/bobos.mp3' },
            { word: 'le périph', meaning: 'ring road (périphérique)', example: "Il y a des bouchons sur le périph.", audio: '/audio/periph.mp3' }
        ],
        cuisineVocabulary: [
            { dish: 'Croque-monsieur', description: 'Grilled ham and cheese sandwich', vocabulary: ['le jambon', 'le fromage', 'la béchamel'] },
            { dish: 'Steak-frites', description: 'Classic steak with French fries', vocabulary: ['saignant', 'à point', 'bien cuit'] },
            { dish: 'Crêpes', description: 'Thin pancakes, sweet or savory', vocabulary: ['la pâte', 'le sucre', 'le nutella'] },
            { dish: 'Baguette', description: 'Iconic French bread', vocabulary: ['la croûte', 'la mie', 'croustillant'] }
        ],
        culturalTips: [
            { title: 'Always Say Bonjour', tip: "When entering any shop or establishment, always greet with 'Bonjour'. Not doing so is considered very rude." },
            { title: 'Café Culture', tip: "Parisians spend hours at cafés. It's acceptable to sit for a long time with just one coffee." },
            { title: 'Fashion Matters', tip: "Parisians dress elegantly but simply. Black, navy, and neutral colors dominate." },
            { title: 'Sunday is Sacred', tip: "Most shops are closed on Sundays. Plan your shopping accordingly!" }
        ],
        landmarks: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées']
    },
    {
        id: 'provence',
        name: 'Provence-Alpes-Côte d\'Azur',
        capital: 'Marseille',
        coordinates: { x: 58, y: 72 },
        description: 'Sun-drenched region famous for lavender, olive oil, and Mediterranean lifestyle.',
        unlockLevel: 3,
        color: '#F59E0B',
        dialectWords: [
            { word: 'peuchère', meaning: 'poor thing / oh dear', example: "Peuchère, il a perdu son travail!", audio: '/audio/peuchere.mp3' },
            { word: 'fada', meaning: 'crazy (affectionate)', example: "T'es fada toi!", audio: '/audio/fada.mp3' },
            { word: 'le pastis', meaning: 'anise-flavored aperitif', example: "On prend un pastis sur la terrasse?", audio: '/audio/pastis.mp3' },
            { word: 'la pétanque', meaning: 'boules game', example: "On fait une partie de pétanque?", audio: '/audio/petanque.mp3' },
            { word: 'cagole', meaning: 'flashy woman (Marseille slang)', example: "C'est une vraie cagole!", audio: '/audio/cagole.mp3' },
            { word: 'dégun', meaning: 'nobody (Marseille)', example: "Y'a dégun ici!", audio: '/audio/degun.mp3' }
        ],
        cuisineVocabulary: [
            { dish: 'Bouillabaisse', description: 'Traditional fish stew from Marseille', vocabulary: ['les poissons', 'le safran', 'la rouille'] },
            { dish: 'Ratatouille', description: 'Vegetable stew from Nice', vocabulary: ['les courgettes', 'les aubergines', 'les tomates'] },
            { dish: 'Tapenade', description: 'Olive spread', vocabulary: ['les olives noires', 'les câpres', 'l\'huile d\'olive'] },
            { dish: 'Navettes', description: 'Orange blossom cookies from Marseille', vocabulary: ['la fleur d\'oranger', 'le beurre', 'la farine'] }
        ],
        culturalTips: [
            { title: 'The Afternoon Sieste', tip: "Many shops close from 12-2pm. Don't fight it - embrace the Mediterranean rhythm!" },
            { title: 'Speak Slower', tip: "Southern French has a distinctive accent and slower pace. Listen carefully!" },
            { title: 'Pétanque Time', tip: "The game is serious business. Don't walk through an active game!" },
            { title: 'Rosé Season', tip: "Provence is rosé wine country. It's perfectly acceptable to drink it year-round here." }
        ],
        landmarks: ['Lavender Fields', 'Calanques', 'Palais des Papes', 'Nice Promenade']
    },
    {
        id: 'brittany',
        name: 'Bretagne',
        capital: 'Rennes',
        coordinates: { x: 18, y: 32 },
        description: 'Celtic heritage region with rugged coastlines and unique traditions.',
        unlockLevel: 4,
        color: '#3B82F6',
        dialectWords: [
            { word: 'kenavo', meaning: 'goodbye (Breton)', example: "Kenavo, à bientôt!", audio: '/audio/kenavo.mp3' },
            { word: 'fest-noz', meaning: 'night festival with Breton dancing', example: "On va au fest-noz ce soir?", audio: '/audio/fest-noz.mp3' },
            { word: 'un bigouden', meaning: 'person from Pays Bigouden', example: "Elle porte la coiffe bigouden.", audio: '/audio/bigouden.mp3' },
            { word: 'le beurre salé', meaning: 'salted butter (essential!)', example: "En Bretagne, tout est au beurre salé!", audio: '/audio/beurre-sale.mp3' },
            { word: 'yec\'hed mat', meaning: 'cheers/good health (Breton)', example: "Yec'hed mat! À ta santé!", audio: '/audio/yechedmat.mp3' }
        ],
        cuisineVocabulary: [
            { dish: 'Galettes', description: 'Savory buckwheat crêpes', vocabulary: ['le sarrasin', 'le blé noir', 'la garniture'] },
            { dish: 'Crêpes bretonnes', description: 'Sweet wheat flour crêpes', vocabulary: ['le froment', 'le caramel au beurre salé'] },
            { dish: 'Kouign-amann', description: 'Butter cake pastry', vocabulary: ['le beurre', 'le sucre', 'feuilleté'] },
            { dish: 'Cidre', description: 'Apple cider', vocabulary: ['brut', 'doux', 'la bolée'] }
        ],
        culturalTips: [
            { title: 'Celtic Pride', tip: "Bretons have a strong regional identity. Many speak Breton as well as French." },
            { title: 'Cider, Not Wine', tip: "In Brittany, cider is the traditional drink. Order it in a 'bolée' (ceramic cup)." },
            { title: 'Weather Chat', tip: "The weather changes constantly. Bretons joke: 'En Bretagne, il ne pleut que sur les cons!'" },
            { title: 'Salted Butter Territory', tip: "Using unsalted butter here is practically an insult. Everything tastes better salted!" }
        ],
        landmarks: ['Mont Saint-Michel', 'Carnac Stones', 'Saint-Malo', 'Quimper Cathedral']
    },
    {
        id: 'alsace',
        name: 'Alsace',
        capital: 'Strasbourg',
        coordinates: { x: 78, y: 30 },
        description: 'Franco-German border region with unique architecture and cuisine.',
        unlockLevel: 5,
        color: '#EC4899',
        dialectWords: [
            { word: 'winstub', meaning: 'traditional Alsatian tavern', example: "On mange dans une winstub ce soir.", audio: '/audio/winstub.mp3' },
            { word: 'schnaps', meaning: 'fruit brandy', example: "Un petit schnaps pour digérer?", audio: '/audio/schnaps.mp3' },
            { word: 'hopla', meaning: 'there you go / here we are', example: "Hopla, c'est prêt!", audio: '/audio/hopla.mp3' },
            { word: 'les flammekueche', meaning: 'Alsatian pizza', example: "Commander trois flammekueche pour la table.", audio: '/audio/flammekueche.mp3' },
            { word: 'le bretzel', meaning: 'pretzel', example: "Je prends un bretzel au marché de Noël.", audio: '/audio/bretzel.mp3' }
        ],
        cuisineVocabulary: [
            { dish: 'Choucroute', description: 'Sauerkraut with sausages', vocabulary: ['la choucroute', 'les saucisses', 'le lard'] },
            { dish: 'Tarte flambée', description: 'Thin-crust cream and bacon tart', vocabulary: ['la crème fraîche', 'les lardons', 'les oignons'] },
            { dish: 'Baeckeoffe', description: 'Meat and potato casserole', vocabulary: ['le porc', 'l\'agneau', 'les pommes de terre'] },
            { dish: 'Kougelhopf', description: 'Traditional bundt cake', vocabulary: ['les raisins secs', 'les amandes', 'le moule'] }
        ],
        culturalTips: [
            { title: 'German Influence', tip: "Many Alsatians speak Alsatian dialect (close to German). Respect this bilingual heritage." },
            { title: 'Christmas Markets', tip: "Strasbourg is the 'Capital of Christmas'. The markets are famous worldwide!" },
            { title: 'Wine Route', tip: "The Route des Vins d'Alsace features charming villages and excellent white wines." },
            { title: 'Half-Timbered Houses', tip: "The colorful colombages (half-timbered) buildings are protected heritage." }
        ],
        landmarks: ['Strasbourg Cathedral', 'Petite France', 'Colmar', 'Haut-Koenigsbourg Castle']
    },
    {
        id: 'loire',
        name: 'Centre-Val de Loire',
        capital: 'Orléans',
        coordinates: { x: 45, y: 42 },
        description: 'The "Garden of France" with Renaissance châteaux and fine wines.',
        unlockLevel: 6,
        color: '#10B981',
        dialectWords: [
            { word: 'un château', meaning: 'castle/manor', example: "Nous visitons le château de Chambord.", audio: '/audio/chateau.mp3' },
            { word: 'les vendanges', meaning: 'grape harvest', example: "Les vendanges commencent en septembre.", audio: '/audio/vendanges.mp3' },
            { word: 'le vigneron', meaning: 'winemaker', example: "Le vigneron nous fait une dégustation.", audio: '/audio/vigneron.mp3' },
            { word: 'la dégustation', meaning: 'wine tasting', example: "On fait une dégustation de vins?", audio: '/audio/degustation.mp3' },
            { word: 'les caves', meaning: 'wine cellars', example: "Les caves sont creusées dans le tuffeau.", audio: '/audio/caves.mp3' }
        ],
        cuisineVocabulary: [
            { dish: 'Rillettes de Tours', description: 'Pork spread', vocabulary: ['le porc', 'effiloché', 'tartiner'] },
            { dish: 'Tarte Tatin', description: 'Upside-down apple tart', vocabulary: ['les pommes', 'caramélisé', 'renverser'] },
            { dish: 'Fromages de chèvre', description: 'Goat cheeses (Crottin, Valencay)', vocabulary: ['le chèvre', 'affiné', 'le cendré'] },
            { dish: "Noisettes d'agneau", description: 'Lamb medallions', vocabulary: ["l'agneau", 'rosé', 'les haricots verts'] }
        ],
        culturalTips: [
            { title: '"Pure" French', tip: "Loire Valley French is considered the purest accent - great for learners!" },
            { title: 'Château Etiquette', tip: "When visiting châteaux, photography is often restricted inside. Always ask." },
            { title: 'Wine Tasting', tip: "Spit, don't swallow when tasting many wines. No one will judge!" },
            { title: 'Troglodyte Caves', tip: "Many wine cellars and even homes are carved into the cliff sides." }
        ],
        landmarks: ['Château de Chambord', 'Château de Chenonceau', 'Tours', 'Amboise']
    },
    {
        id: 'bordeaux',
        name: 'Nouvelle-Aquitaine',
        capital: 'Bordeaux',
        coordinates: { x: 30, y: 65 },
        description: 'World-renowned wine region with Atlantic beaches and rich gastronomy.',
        unlockLevel: 7,
        color: '#7C3AED',
        dialectWords: [
            { word: 'le bassin', meaning: "the bay (Arcachon)", example: "On va au bassin ce week-end.", audio: '/audio/bassin.mp3' },
            { word: 'les cannelés', meaning: 'Bordeaux pastries', example: "J'achète des cannelés à la boulangerie.", audio: '/audio/canneles.mp3' },
            { word: 'gavé', meaning: 'very/a lot (regional slang)', example: "C'est gavé bon!", audio: '/audio/gave.mp3' },
            { word: 'le chai', meaning: 'wine storehouse', example: "On visite les chais du domaine.", audio: '/audio/chai.mp3' },
            { word: 'chocolatine', meaning: 'pain au chocolat (southwest term)', example: "Je veux une chocolatine, pas un pain au chocolat!", audio: '/audio/chocolatine.mp3' }
        ],
        cuisineVocabulary: [
            { dish: 'Entrecôte bordelaise', description: 'Ribeye with shallot sauce', vocabulary: ['les échalotes', 'le vin rouge', 'la moelle'] },
            { dish: 'Cannelés', description: 'Caramelized rum pastries', vocabulary: ['le rhum', 'la vanille', 'caramélisé'] },
            { dish: 'Huîtres du Bassin', description: "Oysters from Arcachon", vocabulary: ['les huîtres', 'le citron', 'le vin blanc'] },
            { dish: 'Lamproie à la bordelaise', description: 'Lamprey in red wine', vocabulary: ['la lamproie', 'le sang', 'les poireaux'] }
        ],
        culturalTips: [
            { title: 'Chocolatine Debate', tip: "NEVER say 'pain au chocolat' here. It's 'chocolatine' - this is sacred!" },
            { title: 'Wine Classification', tip: "Learn the Bordeaux hierarchy: Premier Cru, Grand Cru, etc. Wine is serious." },
            { title: 'Oyster Season', tip: "Traditionalists only eat oysters in months with 'R' (September-April)." },
            { title: 'Surf Culture', tip: "Biarritz and the Basque coast have a strong surf culture - very laid-back!" }
        ],
        landmarks: ['Place de la Bourse', 'Dune of Pilat', 'Saint-Émilion', 'Cité du Vin']
    }
];

// Helper functions
export const getRegionById = (id) => REGIONS.find(r => r.id === id);

export const getUnlockedRegions = (userLevel) => REGIONS.filter(r => r.unlockLevel <= userLevel);

export const getNextRegionToUnlock = (userLevel) => {
    return REGIONS.find(r => r.unlockLevel > userLevel);
};

export const getRegionProgress = (regionId, completedItems) => {
    const region = getRegionById(regionId);
    if (!region) return 0;

    const totalItems = region.dialectWords.length + region.cuisineVocabulary.length + region.culturalTips.length;
    const completed = completedItems?.[regionId]?.length || 0;
    return Math.round((completed / totalItems) * 100);
};
