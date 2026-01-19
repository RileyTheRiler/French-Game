import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, Zap, Clock, ArrowRight, Trophy, ArrowLeft } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Card } from './ui/Card';

const FOCUS_MODES = [
    {
        id: 'grammarHour',
        label: 'Grammar Hour',
        icon: BookOpen,
        description: 'Deep dive into French grammar rules with interactive exercises and detailed explanations.',
        duration: '30 min',
        skills: ['Grammar', 'Syntax', 'Rules'],
        color: 'from-purple-500 to-indigo-600',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20'
    },
    {
        id: 'listeningLab',
        label: 'Listening Lab',
        icon: Headphones,
        description: 'Train your ear with audio-focused exercises, pronunciation practice, and dictation.',
        duration: '20 min',
        skills: ['Listening', 'Pronunciation', 'Comprehension'],
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20'
    },
    {
        id: 'vocabSprint',
        label: 'Vocab Sprint',
        icon: Zap,
        description: 'Fast-paced vocabulary challenge. How many words can you master in 10 minutes?',
        duration: '10 min',
        skills: ['Vocabulary', 'Speed', 'Recall'],
        color: 'from-orange-500 to-amber-600',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20'
    }
];

const FocusModeSelector = () => {
    const navigate = useNavigate();
    const { focusModeStats } = useProgress();

    const handleSelectMode = (modeId) => {
        navigate(`/focus/${modeId}`);
    };

    return (
        <div id="main-content" tabIndex={-1} className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold title-gradient">Focus Training</h1>
                        <p className="text-slate-400">Choose a skill to master</p>
                    </div>
                </div>

                {/* Mode Cards */}
                <div className="space-y-4">
                    {FOCUS_MODES.map((mode, index) => {
                        const stats = focusModeStats?.[mode.id] || { completed: 0 };

                        return (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <button
                                    onClick={() => handleSelectMode(mode.id)}
                                    className={`w-full p-6 rounded-2xl border ${mode.borderColor} ${mode.bgColor} text-left transition-all hover:scale-[1.02] hover:shadow-xl group`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${mode.color} text-white`}>
                                            <mode.icon className="w-8 h-8" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-bold">{mode.label}</h2>
                                                <span className="flex items-center gap-1 text-sm text-slate-400">
                                                    <Clock className="w-4 h-4" />
                                                    {mode.duration}
                                                </span>
                                            </div>

                                            <p className="text-slate-400 text-sm mb-3">
                                                {mode.description}
                                            </p>

                                            {/* Skills Tags */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {mode.skills.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className={`px-2 py-1 rounded-lg text-xs font-medium ${mode.bgColor} border ${mode.borderColor}`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Stats */}
                                            {stats.completed > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Trophy className="w-4 h-4 text-amber-500" />
                                                    <span>{stats.completed} sessions completed</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-6 h-6 text-slate-400" />
                                        </div>
                                    </div>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                >
                    <p className="text-sm text-slate-400">
                        💡 <strong>Tip:</strong> Focus modes are uninterrupted practice sessions.
                        Each one earns bonus XP upon completion!
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default FocusModeSelector;
