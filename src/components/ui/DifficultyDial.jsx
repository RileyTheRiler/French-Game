/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, User, GraduationCap, Rocket, Crown } from 'lucide-react';

const DIFFICULTY_LEVELS = [
    {
        value: 0,
        label: 'Tourist',
        icon: Globe,
        description: 'Heavy hints, slow pace, English always visible',
        color: 'from-emerald-400 to-emerald-600'
    },
    {
        value: 25,
        label: 'Beginner',
        icon: User,
        description: 'Hints available, normal pace, translations on demand',
        color: 'from-green-400 to-lime-500'
    },
    {
        value: 50,
        label: 'Intermediate',
        icon: GraduationCap,
        description: 'Occasional hints, moderate pace, translations hidden',
        color: 'from-yellow-400 to-amber-500'
    },
    {
        value: 75,
        label: 'Advanced',
        icon: Rocket,
        description: 'Rare hints, fast pace, French-only mode',
        color: 'from-orange-400 to-red-500'
    },
    {
        value: 100,
        label: 'Native',
        icon: Crown,
        description: 'No hints, fast audio, idiomatic speech, no English',
        color: 'from-red-500 to-rose-600'
    }
];

const DifficultyDial = ({ value, onChange, showLabels = true, compact = false }) => {
    const currentLevel = useMemo(() => {
        // Find the closest level
        return DIFFICULTY_LEVELS.reduce((prev, curr) =>
            Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
        );
    }, [value]);

    const handleChange = (e) => {
        onChange(parseInt(e.target.value));
    };

    // Calculate gradient position for the track fill
    const fillPercentage = value;

    return (
        <div className={`space-y-${compact ? '2' : '4'}`}>
            {/* Current Level Display */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentLevel.color} text-white`}>
                        <currentLevel.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-lg">{currentLevel.label}</span>
                        {!compact && (
                            <p className="text-xs text-slate-400 max-w-[200px]">
                                {currentLevel.description}
                            </p>
                        )}
                    </div>
                </div>
                <span className="text-2xl font-mono font-bold text-slate-300">
                    {value}
                </span>
            </div>

            {/* Slider */}
            <div className="relative">
                {/* Track Background */}
                <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 opacity-30" />

                {/* Track Fill */}
                <div className="absolute inset-y-0 left-0 rounded-full overflow-hidden">
                    <motion.div
                        className="h-3 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500"
                        animate={{ width: `${fillPercentage}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ minWidth: '12px' }}
                    />
                </div>

                {/* Actual Range Input */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                    aria-label="Difficulty level"
                />

                {/* Custom Thumb */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-slate-300 pointer-events-none"
                    animate={{ left: `calc(${fillPercentage}% - 12px)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            </div>

            {/* Level Markers */}
            {showLabels && (
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    {DIFFICULTY_LEVELS.map(level => (
                        <button
                            key={level.value}
                            onClick={() => onChange(level.value)}
                            className={`transition-colors hover:text-white ${Math.abs(level.value - value) < 13 ? 'text-slate-300 font-semibold' : ''
                                }`}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper function for components to apply difficulty settings
export const getDifficultyConfig = (globalDifficulty) => {
    const d = globalDifficulty ?? 25;

    return {
        // Hint system
        showHints: d < 75,
        hintDelay: Math.floor(d / 10), // 0-10 seconds

        // Translation visibility
        showTranslations: d < 50 ? 'always' : d < 75 ? 'on-demand' : 'never',

        // Audio settings
        audioSpeed: d < 25 ? 0.8 : d < 75 ? 1.0 : 1.2,
        repeatAudio: d < 50,

        // Input method
        preferFreeForm: d >= 50,

        // Timer adjustments (multiplier)
        timerMultiplier: d < 25 ? 1.5 : d < 75 ? 1.0 : 0.75,

        // Response options
        showAllOptions: d < 25,
        numOptions: d < 50 ? 4 : d < 75 ? 3 : 2,

        // Scaffolding
        showGrammarTips: d < 75,
        showWordBreakdown: d < 50,

        // Labels for display
        levelLabel: DIFFICULTY_LEVELS.find(l =>
            Math.abs(l.value - d) < 13
        )?.label || 'Intermediate',

        // Raw value
        raw: d
    };
};

export default DifficultyDial;
