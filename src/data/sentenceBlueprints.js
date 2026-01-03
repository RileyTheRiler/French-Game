export const SENTENCE_BLUEPRINTS = [
    {
        id: 'sb1',
        sentence: "Le petit chat noir dort sur le canapé.",
        translation: "The small black cat sleeps on the sofa.",
        level: 'A1',
        structure: {
            type: 'root',
            label: 'Sentence',
            children: [
                {
                    type: 'subject_group',
                    label: 'Subject Group (Who?)',
                    color: 'indigo',
                    children: [
                        { type: 'article', label: 'Article', text: 'Le', color: 'slate' },
                        { type: 'adjective', label: 'Adj (Size)', text: 'petit', color: 'emerald' },
                        { type: 'noun', label: 'Noun', text: 'chat', color: 'indigo' },
                        { type: 'adjective', label: 'Adj (Color)', text: 'noir', color: 'emerald' }
                    ]
                },
                {
                    type: 'verb_group',
                    label: 'Verb (Action)',
                    color: 'rose',
                    children: [
                        { type: 'verb', label: 'Verb', text: 'dort', color: 'rose' }
                    ]
                },
                {
                    type: 'complement',
                    label: 'Location (Where?)',
                    color: 'amber',
                    children: [
                        { type: 'preposition', label: 'Prep', text: 'sur', color: 'slate' },
                        { type: 'article', label: 'Article', text: 'le', color: 'slate' },
                        { type: 'noun', label: 'Noun', text: 'canapé', color: 'amber' }
                    ]
                }
            ]
        },
        explanation: 'Notice how the adjectives sandwich the noun here. "Petit" (BANGS) comes before, "Noir" (Color) comes after.'
    },
    {
        id: 'sb2',
        sentence: "Je ne mange pas de viande.",
        translation: "I do not eat meat.",
        level: 'A1',
        structure: {
            type: 'root',
            label: 'Sentence',
            children: [
                {
                    type: 'subject',
                    label: 'Subject',
                    color: 'indigo',
                    children: [
                        { type: 'pronoun', label: 'Pronoun', text: 'Je', color: 'indigo' }
                    ]
                },
                {
                    type: 'verb_group',
                    label: 'Verb Group (Negative)',
                    color: 'rose',
                    children: [
                        { type: 'negation', label: 'Neg 1', text: 'ne', color: 'red' },
                        { type: 'verb', label: 'Verb', text: 'mange', color: 'rose' },
                        { type: 'negation', label: 'Neg 2', text: 'pas', color: 'red' }
                    ]
                },
                {
                    type: 'object',
                    label: 'Object',
                    color: 'amber',
                    children: [
                        { type: 'partitive', label: 'Partitive', text: 'de', color: 'slate', note: 'Becomes "de" in negative' },
                        { type: 'noun', label: 'Noun', text: 'viande', color: 'amber' }
                    ]
                }
            ]
        },
        explanation: 'The "ne...pas" structure hugs the verb. Also, "du/de la" changes to just "de" after a negative!'
    },
    {
        id: 'sb3',
        sentence: "Elle lui a donné une fleur.",
        translation: "She gave him/her a flower.",
        level: 'A2',
        structure: {
            type: 'root',
            label: 'Sentence',
            children: [
                {
                    type: 'subject',
                    label: 'Subject',
                    color: 'indigo',
                    children: [
                        { type: 'pronoun', label: 'Pronoun', text: 'Elle', color: 'indigo' }
                    ]
                },
                {
                    type: 'verb_group',
                    label: 'Compound Verb w/ Object',
                    color: 'rose',
                    children: [
                        { type: 'pronoun_object', label: 'Indirect Obj', text: 'lui', color: 'purple' },
                        { type: 'auxiliary', label: 'Auxiliary', text: 'a', color: 'rose' },
                        { type: 'participle', label: 'Participle', text: 'donné', color: 'rose' }
                    ]
                },
                {
                    type: 'object',
                    label: 'Direct Object',
                    color: 'amber',
                    children: [
                        { type: 'article', label: 'Article', text: 'une', color: 'slate' },
                        { type: 'noun', label: 'Noun', text: 'fleur', color: 'amber' }
                    ]
                }
            ]
        },
        explanation: 'Indirect object "lui" must come BEFORE the auxiliary verb "a".'
    }
];
