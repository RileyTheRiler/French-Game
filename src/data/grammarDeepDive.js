/**
 * Grammar Deep Dive Data
 * In-depth grammar explanations for serious learners who want to understand
 * the "why" behind French grammar rules, not just memorize patterns.
 */

export const DEEP_DIVE_TOPICS = [
    {
        id: 'gender_system',
        title: 'The French Gender System',
        category: 'fundamentals',
        level: 1,
        estimatedTime: '15 min',
        icon: '⚧️',
        description: 'Understand why French has grammatical gender and how to predict it.',
        sections: [
            {
                type: 'why',
                title: 'Why Does French Have Gender?',
                content: `French grammatical gender is inherited from Latin, where all nouns were classified as masculine, feminine, or neuter. When neuter was lost, its nouns were absorbed into masculine and feminine.

**Important:** Grammatical gender has nothing to do with biological sex. A "table" (la table) isn't literally female—it's just a classification system that affects agreement patterns.

**Why it matters:** Getting gender wrong doesn't just sound awkward—it affects adjectives, pronouns, and past participles. Mastering gender is essential for fluency.`
            },
            {
                type: 'pattern',
                title: 'Predictable Endings (80% Reliable)',
                content: `While gender seems random, endings often predict it:

**Typically Feminine (-e endings):**
• -tion, -sion → la nation, la décision
• -té, -ité → la beauté, l'université  
• -ence, -ance → la patience, la France
• -ure → la nature, la voiture
• -ette, -elle → la fourchette, la poubelle

**Typically Masculine:**
• -ment → le gouvernement, le moment
• -age → le voyage, le fromage (BUT: la page, la plage, la cage)
• -isme → le tourisme, le capitalisme
• -eur (abstract) → le bonheur, l'honneur
• Borrowed words → le weekend, le parking, le football`
            },
            {
                type: 'exceptions',
                title: 'Notable Exceptions',
                items: [
                    { word: 'le problème', note: 'Greek origin words ending in -ème are masculine' },
                    { word: 'la page', note: 'Exception to the -age rule' },
                    { word: 'la plage', note: 'Exception to the -age rule' },
                    { word: 'le silence', note: 'Exception to the -ence rule' },
                    { word: 'la main', note: 'From Latin manus (feminine)' },
                    { word: 'le musée', note: 'Despite -ée ending, from Greek mouseion' }
                ]
            },
            {
                type: 'memoryTrick',
                title: 'Memory Strategy',
                content: `**Never learn a noun alone.** Always learn the article with it:
• ❌ "maison = house"
• ✓ "la maison = the house"

Create vivid mental images: Picture a house wearing a pink dress (feminine) or a book wearing a blue tie (masculine). The sillier, the more memorable!`
            },
            {
                type: 'practice',
                title: 'Quick Check',
                exercises: [
                    { prompt: 'la/le situation?', answer: 'la', explanation: '-tion endings are feminine' },
                    { prompt: 'la/le gouvernement?', answer: 'le', explanation: '-ment endings are masculine' },
                    { prompt: 'la/le plage?', answer: 'la', explanation: 'Exception to -age rule' }
                ]
            }
        ],
        relatedTopics: ['adjective_agreement', 'article_usage']
    },
    {
        id: 'adjective_agreement',
        title: 'Adjective Agreement & Placement',
        category: 'fundamentals',
        level: 1,
        estimatedTime: '12 min',
        icon: '🎨',
        description: 'Master where adjectives go and how they change form.',
        sections: [
            {
                type: 'why',
                title: 'Why Adjectives Change',
                content: `In French, adjectives must "agree" with the noun they describe—matching its gender and number. This creates redundancy that helps listeners follow the sentence even if they miss a word.

**English:** "the beautiful houses" (no agreement)
**French:** "les belles maisons" (plural feminine throughout)

This agreement system is one of the most reliable patterns in French!`
            },
            {
                type: 'pattern',
                title: 'The Agreement System',
                content: `**Basic Pattern:**
| | Masculine | Feminine |
|---|---|---|
| Singular | petit | petite |
| Plural | petits | petites |

**Adding feminine:**
• Usually add -e: grand → grande
• If already ends in -e: no change (rouge → rouge)
• Double consonant: bon → bonne, ancien → ancienne
• Special: beau → belle, nouveau → nouvelle, vieux → vieille

**Adding plural:**
• Usually add -s: petit → petits
• Already ends in -s/-x: no change (gros → gros)
• -eau → -eaux: beau → beaux`
            },
            {
                type: 'comparison',
                title: 'Placement: French vs English',
                content: `**English:** Adjectives ALWAYS come before the noun
• "a red car", "a beautiful house", "an old man"

**French:** Most adjectives come AFTER the noun
• "une voiture rouge" (a car red)
• "un homme intelligent" (a man intelligent)

**Exception - BANGS adjectives go BEFORE:**
• **B**eauty: beau, joli
• **A**ge: nouveau, vieux, jeune
• **N**umber: premier, dernier, prochain
• **G**oodness: bon, mauvais, meilleur
• **S**ize: grand, petit, gros, long

These are the most common adjectives, so you'll use this rule often!`
            },
            {
                type: 'exceptions',
                title: 'Meaning Changes by Position',
                items: [
                    { word: 'ancien', before: 'un ancien professeur (former teacher)', after: 'un meuble ancien (antique furniture)' },
                    { word: 'propre', before: 'ma propre voiture (my own car)', after: 'une voiture propre (a clean car)' },
                    { word: 'grand', before: 'un grand homme (a great man)', after: 'un homme grand (a tall man)' },
                    { word: 'pauvre', before: 'le pauvre homme (the unfortunate man)', after: 'un homme pauvre (a poor/broke man)' },
                    { word: 'cher', before: 'cher ami (dear friend)', after: 'un restaurant cher (expensive restaurant)' }
                ]
            },
            {
                type: 'memoryTrick',
                title: 'Remember BANGS',
                content: `**B**ig, **A**ntique, **N**umerous, **G**ood, **S**mall things go first!

Or imagine a loud BANG! happening before you see the noun—those adjectives announce themselves first.`
            }
        ],
        relatedTopics: ['gender_system', 'article_usage']
    },
    {
        id: 'passe_compose',
        title: 'Passé Composé Deep Dive',
        category: 'tenses',
        level: 2,
        estimatedTime: '20 min',
        icon: '⏰',
        description: 'Master the most important French past tense.',
        sections: [
            {
                type: 'why',
                title: 'Why Two Parts?',
                content: `The passé composé is a "compound" tense—it uses two parts:
1. A helper verb (avoir or être) conjugated in present tense
2. The past participle of the main verb

**Why this structure?** It evolved from Latin perfect tenses and mirrors how we sometimes express past actions in English: "I have eaten" → "J'ai mangé"

Unlike English, French uses this form for MOST past actions in speech!`
            },
            {
                type: 'pattern',
                title: 'Formation with Avoir (90% of verbs)',
                content: `**Formula:** Subject + avoir (conjugated) + past participle

**Avoir conjugation:**
j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont

**Past participle formation:**
• -er verbs → -é: parler → parlé
• -ir verbs → -i: finir → fini  
• -re verbs → -u: vendre → vendu

**Examples:**
• J'ai mangé (I ate / I have eaten)
• Elle a fini (She finished)
• Nous avons vendu (We sold)`
            },
            {
                type: 'pattern',
                title: 'Formation with Être (DR MRS VANDERTRAMP)',
                content: `About 17 verbs use être instead of avoir. Memorize them with DR MRS VANDERTRAMP:

**D**evenir (to become) → devenu
**R**evenir (to come back) → revenu
**M**onter (to go up) → monté
**R**ester (to stay) → resté
**S**ortir (to go out) → sorti
**V**enir (to come) → venu
**A**ller (to go) → allé
**N**aître (to be born) → né
**D**escendre (to go down) → descendu
**E**ntrer (to enter) → entré
**R**entrer (to return home) → rentré
**T**omber (to fall) → tombé
**R**etourner (to return) → retourné
**A**rriver (to arrive) → arrivé
**M**ourir (to die) → mort
**P**artir (to leave) → parti

**Plus:** All reflexive verbs (se laver, se lever, etc.)`
            },
            {
                type: 'why',
                title: 'Why These Verbs Use Être',
                content: `Notice a pattern? These are verbs of:
• **Motion** (coming, going, arriving, leaving)
• **State change** (being born, dying, becoming)

They describe what happens TO the subject, not what the subject DOES to something else.

**The key insight:** With être verbs, the past participle agrees with the subject like an adjective:
• Elle est allée (she went) - add -e for feminine
• Ils sont partis (they left) - add -s for masculine plural
• Elles sont arrivées (they arrived) - add -es for feminine plural`
            },
            {
                type: 'comparison',
                title: 'Passé Composé vs Imparfait',
                content: `Both are past tenses, but they have different uses:

| Passé Composé | Imparfait |
|---------------|-----------|
| Completed actions | Ongoing/habitual actions |
| Specific events | Background/descriptions |
| "What happened" | "What was happening" |

**Example story:**
"Je marchais dans la rue (imparfait - background) quand j'ai vu (passé composé - event) mon ami."

"I was walking in the street when I saw my friend."

Think of imparfait as the "movie scene" and passé composé as "things that happen in the scene."`
            },
            {
                type: 'exceptions',
                title: 'Irregular Past Participles',
                items: [
                    { word: 'avoir → eu', note: 'J\'ai eu = I had' },
                    { word: 'être → été', note: 'J\'ai été = I was/have been' },
                    { word: 'faire → fait', note: 'J\'ai fait = I did/made' },
                    { word: 'prendre → pris', note: 'J\'ai pris = I took' },
                    { word: 'mettre → mis', note: 'J\'ai mis = I put' },
                    { word: 'voir → vu', note: 'J\'ai vu = I saw' },
                    { word: 'pouvoir → pu', note: 'J\'ai pu = I could' },
                    { word: 'vouloir → voulu', note: 'J\'ai voulu = I wanted' },
                    { word: 'savoir → su', note: 'J\'ai su = I knew/found out' },
                    { word: 'lire → lu', note: 'J\'ai lu = I read' },
                    { word: 'écrire → écrit', note: 'J\'ai écrit = I wrote' },
                    { word: 'dire → dit', note: 'J\'ai dit = I said' }
                ]
            }
        ],
        relatedTopics: ['imparfait', 'verb_conjugation']
    },
    {
        id: 'negation',
        title: 'Negation: The Complete Guide',
        category: 'fundamentals',
        level: 1,
        estimatedTime: '10 min',
        icon: '🚫',
        description: 'Say "no" like a native with all negation patterns.',
        sections: [
            {
                type: 'why',
                title: 'The Sandwich Principle',
                content: `French negation wraps around the conjugated verb like a sandwich:

**ne** + [conjugated verb] + **pas**

This two-part system is unique to French! In older French, "ne" alone was enough, but "pas" (originally meaning "step" as in "not a step") was added for emphasis and eventually became required.

**Fun fact:** In casual speech, the "ne" is often dropped: "Je sais pas" instead of "Je ne sais pas" - but always keep it in writing!`
            },
            {
                type: 'pattern',
                title: 'Basic Negation Patterns',
                content: `**ne...pas** = not
• Je ne parle pas français. (I don't speak French.)

**ne...jamais** = never
• Elle ne mange jamais de viande. (She never eats meat.)

**ne...plus** = no longer, not anymore
• Il ne travaille plus ici. (He doesn't work here anymore.)

**ne...rien** = nothing
• Je ne vois rien. (I see nothing / I don't see anything.)

**ne...personne** = nobody
• Je ne connais personne. (I know nobody.)

**ne...que** = only (not really negative!)
• Je n'ai que 5 euros. (I only have 5 euros.)`
            },
            {
                type: 'pattern',
                title: 'With Compound Tenses',
                content: `In passé composé, the negation wraps around the HELPER verb, not the past participle:

• Je n'ai **pas** mangé. (I didn't eat.)
• Elle n'est **jamais** allée à Paris. (She has never been to Paris.)
• Nous n'avons **rien** fait. (We did nothing.)

**Exception:** "personne" comes AFTER the past participle:
• Je n'ai vu **personne**. (I saw nobody.)`
            },
            {
                type: 'pattern',
                title: 'With Infinitives',
                content: `When negating an infinitive, both parts go BEFORE the verb:

• **Ne pas** fumer. (No smoking / Don't smoke.)
• J'ai décidé de **ne rien** dire. (I decided to say nothing.)
• Il préfère **ne jamais** mentir. (He prefers to never lie.)`
            },
            {
                type: 'comparison',
                title: 'Answering Questions',
                content: `**Positive question → Negative answer:**
"Tu aimes le café?" → "Non, je n'aime pas le café."

**Negative question → "Si" for disagreement:**
"Tu n'aimes pas le café?" → "Si, j'aime le café!" (Yes I do!)

**"Si"** is used to contradict a negative question or statement—it's stronger than "oui"!`
            }
        ],
        relatedTopics: ['question_formation', 'verb_conjugation']
    },
    {
        id: 'object_pronouns',
        title: 'Object Pronouns Explained',
        category: 'pronouns',
        level: 2,
        estimatedTime: '18 min',
        icon: '👆',
        description: 'Replace nouns smoothly with le, la, lui, and more.',
        sections: [
            {
                type: 'why',
                title: 'Why Use Object Pronouns?',
                content: `Object pronouns replace nouns to avoid repetition:

**Without pronouns:**
"J'aime le chocolat. Je mange le chocolat tous les jours."

**With pronouns:**
"J'aime le chocolat. Je **le** mange tous les jours."
(I love chocolate. I eat **it** every day.)

In French, pronouns go BEFORE the verb (unlike English where they follow).`
            },
            {
                type: 'pattern',
                title: 'Direct Object Pronouns',
                content: `Direct objects receive the action directly (no preposition):

| Person | Pronoun | Example |
|--------|---------|---------|
| me | me / m' | Il me voit. (He sees me.) |
| you (informal) | te / t' | Je te connais. (I know you.) |
| him/it (masc) | le / l' | Je le mange. (I eat it.) |
| her/it (fem) | la / l' | Je la vois. (I see her.) |
| us | nous | Elle nous aime. (She loves us.) |
| you (formal/plural) | vous | Je vous entends. (I hear you.) |
| them | les | Je les achète. (I buy them.) |

**Use m', t', l'** before vowels: Je l'adore. (I love him/her/it.)`
            },
            {
                type: 'pattern',
                title: 'Indirect Object Pronouns',
                content: `Indirect objects use "à" (to someone):

| Person | Pronoun | Example |
|--------|---------|---------|
| to me | me / m' | Il me parle. (He talks to me.) |
| to you | te / t' | Je te donne un cadeau. (I give you a gift.) |
| to him/her | lui | Je lui écris. (I write to him/her.) |
| to us | nous | Elle nous envoie un message. |
| to you | vous | Je vous téléphone. (I call you.) |
| to them | leur | Je leur parle. (I talk to them.) |

**Key difference:** "lui" and "leur" are the same for masculine and feminine!`
            },
            {
                type: 'pattern',
                title: 'Pronoun Order (Multiple Pronouns)',
                content: `When using two pronouns, follow this order:

**me, te, se, nous, vous** → **le, la, les** → **lui, leur** → **y** → **en**

Examples:
• Il **me le** donne. (He gives it to me.)
• Je **le lui** donne. (I give it to him/her.)
• Elle **les leur** envoie. (She sends them to them.)

**Memory trick:** "Me le lui y en" - sounds like a little melody!`
            },
            {
                type: 'comparison',
                title: 'Position in Different Tenses',
                content: `**Present:** Before the conjugated verb
• Je le vois. (I see him.)

**Passé composé:** Before the helper verb
• Je l'ai vu. (I saw him.)

**Near future:** Before the infinitive
• Je vais le voir. (I'm going to see him.)

**Imperative affirmative:** AFTER the verb with hyphen
• Regarde-le! (Look at it!)
• Donne-moi! (Give me!) - "me" becomes "moi"

**Imperative negative:** Before the verb (normal position)
• Ne le regarde pas! (Don't look at it!)`
            }
        ],
        relatedTopics: ['verb_conjugation', 'passe_compose']
    }
];

/**
 * Get a deep dive topic by ID
 */
export const getDeepDiveById = (id) => DEEP_DIVE_TOPICS.find(t => t.id === id);

/**
 * Get topics by category
 */
export const getDeepDiveByCategory = (category) =>
    DEEP_DIVE_TOPICS.filter(t => t.category === category);

/**
 * Get topics by level
 */
export const getDeepDiveByLevel = (level) =>
    DEEP_DIVE_TOPICS.filter(t => t.level <= level);

/**
 * Categories with metadata
 */
export const DEEP_DIVE_CATEGORIES = {
    fundamentals: { name: 'Fundamentals', icon: '🏗️', color: 'indigo' },
    tenses: { name: 'Verb Tenses', icon: '⏰', color: 'amber' },
    pronouns: { name: 'Pronouns', icon: '👆', color: 'emerald' },
    advanced: { name: 'Advanced', icon: '🎓', color: 'purple' }
};
