
export const GRAMMAR_DEEP_DIVE = [
    {
        id: 'subjunctive_mood',
        title: "The Subjunctive Mood (Le Subjonctif)",
        difficulty: "Advanced",
        description: "Master the art of uncertainty, emotion, and necessity.",
        sections: [
            {
                title: "When to use it?",
                content: `The subjunctive is used to express:
1. **Doubt/Uncertainty**: Je doute qu'il *vienne*. (I doubt he will come.)
2. **Emotion**: Je suis content que tu *sois* là. (I'm happy you are here.)
3. **Necessity/Desire**: Il faut que nous *partions*. (We must leave.)
                `
            },
            {
                title: "Formation (Regular Verbs)",
                content: `Take the **ils/elles** form of the present indicative, drop the **-ent**, and add the endings:
- e
- es
- e
- ions
- iez
- ent

**Example: Parler (ils parlent -> parl-)**
- que je parle
- que tu parles
- qu'il parle
- que nous parlions
- que vous parliez
- qu'ils parlent`
            },
            {
                title: "Irregular Verbs",
                content: `Some verbs are completely irregular:
- **Être**: que je sois, que tu sois, qu'il soit, que nous soyons, que vous soyez, qu'ils soient
- **Avoir**: que j'aie, que tu aies, qu'il ait, que nous ayons, que vous ayez, qu'ils aient
- **Faire**: que je fasse...
- **Aller**: que j'aille...`
            }
        ],
        quiz: [
            {
                question: "Il faut que tu ____ tes devoirs.",
                options: ["fais", "fasses", "fait"],
                correct: 1,
                explanation: "For 'faire', the subjunctive stem is 'fass-'."
            },
            {
                question: "Je suis triste qu'elle ____ malade.",
                options: ["est", "soit", "sera"],
                correct: 1,
                explanation: "After expressions of emotion like 'Je suis triste que', use the subjunctive. 'Être' becomes 'soit'."
            },
            {
                question: "Penses-tu qu'il ____ (venir) ?",
                options: ["vient", "vienne", "viendra"],
                correct: 1,
                explanation: "In a question involving doubt/uncertainty, subjunctive is preferred. 'Venir' becomes 'vienne'."
            }
        ]
    },
    {
        id: 'relative_pronouns',
        title: "Relative Pronouns (Qui, Que, Dont, Où)",
        difficulty: "Intermediate",
        description: "Linking sentences smoothly like a native.",
        sections: [
            {
                title: "Qui vs Que",
                content: `**Qui** replaces the **subject** (the doer).
- L'homme **qui** parle est mon père. (The man *who* is speaking...)

**Que** replaces the **direct object** (the receiver).
- La pomme **que** je mange. (The apple *that* I am eating.)`
            },
            {
                title: "Dont",
                content: `**Dont** replaces objects introduced by **de**.
- C'est le livre **dont** j'ai besoin. (avoir besoin *de*)
- L'homme **dont** je parle. (parler *de*)`
            },
            {
                title: "Où",
                content: `**Où** expresses **place** or **time**.
- La ville **où** j'habite.
- Le jour **où** je t'ai rencontré.`
            }
        ],
        quiz: [
            {
                question: "C'est la maison ____ j'ai grandi.",
                options: ["que", "qui", "où"],
                correct: 2,
                explanation: "Use 'où' for places."
            },
            {
                question: "Le film ____ j'ai vu hier était nul.",
                options: ["que", "qui", "dont"],
                correct: 0,
                explanation: "Use 'que' because 'le film' is the object of 'vu'."
            },
            {
                question: "Voici le livre ____ je t'ai parlé.",
                options: ["que", "dont", "où"],
                correct: 1,
                explanation: "Use 'dont' because the phrase is 'parler DE'."
            }
        ]
    }
];
