/**
 * Grammar Lessons
 * Structured mini-lessons with explanations, examples, and practice exercises.
 */

export const GRAMMAR_LESSONS = [
    {
        id: 'articles',
        title: 'Articles: Le, La, Les',
        level: 1,
        description: 'Learn when to use definite and indefinite articles.',
        sections: [
            {
                type: 'why',
                title: 'Why It Matters',
                content: `Using the correct article is the foundation of French grammar. It tells you the gender and number of the noun, which affects adjectives and pronouns later in the sentence.`
            },
            {
                type: 'explanation',
                title: 'Definite Articles',
                content: `In French, every noun has a gender (masculine or feminine).
                
**Definite Articles** (the):
- **le** - masculine singular (le livre = the book)
- **la** - feminine singular (la maison = the house)
- **l'** - before vowel sounds (l'eau = the water)
- **les** - plural for both genders (les livres = the books)`
            },
            {
                type: 'explanation',
                title: 'Indefinite Articles',
                content: `**Indefinite Articles** (a/an/some):
- **un** - masculine singular (un chat = a cat)
- **une** - feminine singular (une pomme = an apple)
- **des** - plural for both genders (des pommes = some apples)`
            },
            {
                type: 'examples',
                title: 'Common Examples',
                items: [
                    { french: 'le café', english: 'the coffee', gender: 'masculine' },
                    { french: 'la boulangerie', english: 'the bakery', gender: 'feminine' },
                    { french: "l'hôtel", english: 'the hotel', gender: 'masculine (with elision)' },
                    { french: 'les enfants', english: 'the children', gender: 'plural' }
                ]
            },
            {
                type: 'practice',
                title: 'Quick Practice',
                exercises: [
                    { prompt: '___ chat (the cat)', answer: 'le', options: ['le', 'la', 'les'] },
                    { prompt: '___ maison (the house)', answer: 'la', options: ['le', 'la', 'les'] },
                    { prompt: '___ école (the school)', answer: "l'", options: ["l'", 'la', 'les'] }
                ]
            }
        ]
    },
    {
        id: 'etre_avoir',
        title: 'Être & Avoir',
        level: 1,
        description: 'Master the two most important French verbs.',
        sections: [
            {
                type: 'why',
                title: 'Why It Matters',
                content: `These two verbs are the "powerhouses" of French. You'll use them not just to say who you are or what you have, but also to build past tenses (like "I have eaten").`
            },
            {
                type: 'explanation',
                title: 'Être (To Be)',
                content: `**Être** is one of the most used verbs in French.

| Pronoun | Conjugation | Example |
|---------|-------------|---------|
| je | suis | Je suis content (I am happy) |
| tu | es | Tu es français (You are French) |
| il/elle | est | Elle est grande (She is tall) |
| nous | sommes | Nous sommes amis (We are friends) |
| vous | êtes | Vous êtes prêt (You are ready) |
| ils/elles | sont | Ils sont ici (They are here) |`
            },
            {
                type: 'explanation',
                title: 'Avoir (To Have)',
                content: `**Avoir** is used for possession and many expressions.

| Pronoun | Conjugation | Example |
|---------|-------------|---------|
| je | ai | J'ai un chat (I have a cat) |
| tu | as | Tu as faim (You are hungry) |
| il/elle | a | Il a 20 ans (He is 20 years old) |
| nous | avons | Nous avons le temps (We have time) |
| vous | avez | Vous avez raison (You are right) |
| ils/elles | ont | Elles ont des enfants (They have children) |`
            },
            {
                type: 'tip',
                title: 'Important!',
                content: `In French, we use **avoir** for:
- Age: "J'ai 25 ans" (NOT "Je suis 25 ans")
- Hunger/Thirst: "J'ai faim/soif"
- Hot/Cold (feeling): "J'ai chaud/froid"`
            }
        ]
    },
    {
        id: 'er_verbs',
        title: '-ER Verbs',
        level: 2,
        description: 'Learn the most common verb conjugation pattern.',
        sections: [
            {
                type: 'why',
                title: 'Why It Matters',
                content: `French verbs change based on who is doing the action. The good news? 80% of verbs follow this EXACT pattern. Learn this once, and you can conjugate thousands of verbs instantly!`
            },
            {
                type: 'explanation',
                title: 'The Pattern',
                content: `About 80% of French verbs end in **-er**. They all follow the same pattern!

**Steps:**
1. Remove the -er ending
2. Add the appropriate ending

**Endings:**
- je: -e
- tu: -es
- il/elle: -e
- nous: -ons
- vous: -ez
- ils/elles: -ent`
            },
            {
                type: 'examples',
                title: 'Parler (To Speak)',
                items: [
                    { french: 'je parle', english: 'I speak' },
                    { french: 'tu parles', english: 'you speak' },
                    { french: 'il/elle parle', english: 'he/she speaks' },
                    { french: 'nous parlons', english: 'we speak' },
                    { french: 'vous parlez', english: 'you speak' },
                    { french: 'ils/elles parlent', english: 'they speak' }
                ]
            },
            {
                type: 'practice',
                title: 'Conjugate: Manger (To Eat)',
                exercises: [
                    { prompt: 'Je ___', answer: 'mange', options: ['mange', 'manges', 'mangeons'] },
                    { prompt: 'Nous ___', answer: 'mangeons', options: ['mange', 'mangez', 'mangeons'] },
                    { prompt: 'Ils ___', answer: 'mangent', options: ['mange', 'mangent', 'mangeons'] }
                ]
            }
        ]
    },
    {
        id: 'questions',
        title: 'Asking Questions',
        level: 2,
        description: 'Three ways to ask questions in French.',
        sections: [
            {
                type: 'explanation',
                title: 'Method 1: Intonation',
                content: `The easiest way! Just raise your voice at the end.

**Tu parles français.** (statement)
**Tu parles français ?** (question)

This is informal and very common in spoken French.`
            },
            {
                type: 'explanation',
                title: 'Method 2: Est-ce que',
                content: `Add "Est-ce que" at the beginning. Works for any sentence!

**Est-ce que tu parles français ?**
(Do you speak French?)

**Est-ce que vous avez l'heure ?**
(Do you have the time?)`
            },
            {
                type: 'explanation',
                title: 'Method 3: Inversion',
                content: `Swap the subject and verb. This is more formal.

**Parlez-vous français ?**
(Do you speak French?)

**Avez-vous des questions ?**
(Do you have questions?)

Note the hyphen between verb and pronoun!`
            },
            {
                type: 'examples',
                title: 'Question Words',
                items: [
                    { french: 'Qui ?', english: 'Who?' },
                    { french: 'Quoi ?', english: 'What?' },
                    { french: 'Où ?', english: 'Where?' },
                    { french: 'Quand ?', english: 'When?' },
                    { french: 'Pourquoi ?', english: 'Why?' },
                    { french: 'Comment ?', english: 'How?' },
                    { french: 'Combien ?', english: 'How much/many?' }
                ]
            }
        ]
    }
];

export const getLessonById = (id) => GRAMMAR_LESSONS.find(l => l.id === id);
export const getLessonsByLevel = (level) => GRAMMAR_LESSONS.filter(l => l.level <= level);
