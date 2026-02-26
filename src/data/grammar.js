import React from 'react';
import { Book, AlertCircle, CheckCircle2 } from 'lucide-react';

export const GRAMMAR_TIPS = [
    {
        id: 'etre_present',
        title: 'Être - Present Tense',
        content: 'The verb "être" (to be) is irregular. Memorize: Je suis, Tu es, Il/Elle est, Nous sommes, Vous êtes, Ils/Elles sont.',
        difficulty: 'beginner',
        category: 'conjugation'
    },
    {
        id: 'avoir_present',
        title: 'Avoir - Present Tense',
        content: '"Avoir" (to have) is essential. J\'ai, Tu as, Il a, Nous avons, Vous avez, Ils ont.',
        difficulty: 'beginner',
        category: 'conjugation'
    },
    {
        id: 'gender_adj',
        title: 'Adjective Agreement',
        content: 'Adjectives must match the noun in gender and number. Add "e" for feminine and "s" for plural (usually).',
        difficulty: 'beginner',
        category: 'agreement'
    },
    {
        id: 'passe_compose',
        title: 'Passé Composé',
        content: 'Use "avoir" or "être" + past participle. Most verbs use "avoir". Movement verbs (aller, venir) use "être".',
        difficulty: 'intermediate',
        category: 'tense'
    },
    {
        id: 'negation_simple',
        title: 'Simple Negation',
        content: 'Wrap the verb with "ne ... pas". Example: Je ne mange pas.',
        difficulty: 'beginner',
        category: 'structure'
    },
    {
        id: 'y_en',
        title: 'Pronouns Y and En',
        content: '"Y" replaces places (à Paris). "En" replaces quantities (de l\'eau).',
        difficulty: 'intermediate',
        category: 'pronoun'
    },
    {
        id: 'aller_present',
        title: 'Aller - Present Tense',
        content: 'Je vais, Tu vas, Il va, Nous allons, Vous allez, Ils vont.',
        difficulty: 'beginner',
        category: 'conjugation'
    },
    {
        id: 'articles_partitive',
        title: 'Partitive Articles',
        content: 'Use "du", "de la", or "des" to express "some" or an unspecified quantity.',
        difficulty: 'beginner',
        category: 'grammar'
    }
];

export const getTipForConcept = (conceptId) => {
    return GRAMMAR_TIPS.find(t => t.id === conceptId);
};

export const DRILL_CATEGORIES = {
    conjugation: { name: 'Conjugation', icon: '🏃', color: 'indigo' }, // Simplified icon for now to avoid JSX in data file if possible, or fix JSX import
    agreement: { name: 'Agreement', icon: '📝', color: 'emerald' },
    tense: { name: 'Tenses', icon: '⏳', color: 'sky' },
    pronoun: { name: 'Pronouns', icon: '👉', color: 'rose' },
    structure: { name: 'Structure', icon: '🏗️', color: 'violet' },
    grammar: { name: 'Grammar', icon: '📖', color: 'amber' }
};

export const GRAMMAR_DRILLS = [
    {
        id: 'drill_1',
        category: 'conjugation',
        difficulty: 'beginner',
        prompt: 'Complete: Je ___ (être) content.',
        answer: 'suis',
        options: ['suis', 'es', 'est', 'sommes'],
        tip: 'etre_present',
        xpReward: 10
    },
    {
        id: 'drill_2',
        category: 'agreement',
        difficulty: 'beginner',
        prompt: 'Complete: La voiture est ___ (rouge).',
        answer: 'rouge',
        options: ['rouge', 'rouges'],
        tip: 'gender_adj',
        xpReward: 10
    },
    {
        id: 'drill_3',
        category: 'tense',
        difficulty: 'intermediate',
        prompt: 'Past tense: Nous ___ (manger) hier.',
        answer: 'avons mangé',
        options: ['avons mangé', 'sommes mangés', 'mangeons'],
        tip: 'passe_compose',
        xpReward: 15
    },
    {
        id: 'drill_4',
        category: 'pronoun',
        difficulty: 'intermediate',
        prompt: 'Replace "au parc": Je vais ___.',
        answer: 'y',
        options: ['y', 'en', 'le'],
        tip: 'y_en',
        xpReward: 15
    },
    {
        id: 'drill_5',
        category: 'conjugation',
        difficulty: 'beginner',
        prompt: 'Complete: Tu ___ (avoir) un chat.',
        answer: 'as',
        options: ['as', 'a', 'ai'],
        tip: 'avoir_present',
        xpReward: 10
    },
    {
        id: 'drill_6',
        category: 'structure',
        difficulty: 'beginner',
        prompt: 'Negate: Je mange.',
        answer: 'Je ne mange pas',
        options: ['Je ne mange pas', 'Je pas mange', 'Je mange ne pas'],
        tip: 'negation_simple',
        xpReward: 10
    },
    {
        id: 'drill_7',
        category: 'conjugation',
        difficulty: 'beginner',
        prompt: 'Complete: Ils ___ (aller) au cinéma.',
        answer: 'vont',
        options: ['vont', 'vent', 'va'],
        tip: 'aller_present',
        xpReward: 10
    },
    {
        id: 'drill_8',
        category: 'agreement',
        difficulty: 'beginner',
        prompt: 'Complete: Les pommes sont ___ (vert).',
        answer: 'vertes',
        options: ['vert', 'verte', 'verts', 'vertes'],
        tip: 'gender_adj',
        xpReward: 10
    },
    {
        id: 'drill_9',
        category: 'grammar',
        difficulty: 'beginner',
        prompt: 'Translate: Some water',
        answer: 'De l\'eau',
        options: ['De l\'eau', 'Le eau', 'Une eau'],
        tip: 'articles_partitive',
        xpReward: 10
    },
    {
        id: 'drill_10',
        category: 'pronoun',
        difficulty: 'beginner',
        prompt: 'Which pronoun for formal "You"?',
        answer: 'Vous',
        options: ['Tu', 'Vous'],
        xpReward: 10
    }
];
