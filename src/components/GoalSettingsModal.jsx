import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Settings, Zap, BookOpen, Clock } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GOAL_PRESETS } from '../data/leagues';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const GoalSettingsModal = ({ isOpen, onClose }) => {
    const {
        userGoals, updateUserGoals,
        difficultySettings, updateDifficultySettings,
        updateDailyXPGoal, dailyXPGoal,
        weeklyGoal, updateWeeklyGoal
    } = useProgress();

    const [localWeeklyGoal, setLocalWeeklyGoal] = useState(weeklyGoal?.sessionsPerWeek || 3);

    const [localGoals, setLocalGoals] = useState(userGoals);
    const [localDifficulty, setLocalDifficulty] = useState(difficultySettings);
    const [localDailyGoal, setLocalDailyGoal] = useState(dailyXPGoal || 50);
    const [activeTab, setActiveTab] = useState('goals'); // 'goals' or 'difficulty'
    const [selectedPreset, setSelectedPreset] = useState(null);

    const handleSave = () => {
        updateUserGoals(localGoals);
        updateDifficultySettings(localDifficulty);
        updateDailyXPGoal(localDailyGoal);
        updateWeeklyGoal({ sessionsPerWeek: localWeeklyGoal });
        onClose();
    };

    const applyPreset = (preset) => {
        setSelectedPreset(preset.id);
        setLocalDailyGoal(preset.dailyXP);
        setLocalGoals(prev => ({
            ...prev,
            weeklyWords: preset.weeklyWords
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                {activeTab === 'goals' ? <Target className="text-blue-400" /> : <Settings className="text-purple-400" />}
                                {activeTab === 'goals' ? 'Learning Goals' : 'Difficulty Settings'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X size={24} />
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('goals')}
                                className={`flex-1 p-4 text-center font-bold transition-colors ${activeTab === 'goals' ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-white/5'}`}
                            >
                                Valid Goals
                            </button>
                            <button
                                onClick={() => setActiveTab('difficulty')}
                                className={`flex-1 p-4 text-center font-bold transition-colors ${activeTab === 'difficulty' ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500' : 'text-slate-400 hover:bg-white/5'}`}
                            >
                                Game Difficulty
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            {activeTab === 'goals' ? (
                                <>
                                    {/* Goal Presets */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quick Presets</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {GOAL_PRESETS.map(preset => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => applyPreset(preset)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedPreset === preset.id
                                                        ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                                                        : 'border-white/10 bg-white/5 hover:border-white/30'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-2xl">{preset.icon}</span>
                                                        <span className="font-bold text-white">{preset.name}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mb-2">{preset.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-300">
                                                            {preset.dailyXP} XP/day
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px] bg-slate-500/10 border-slate-500/30 text-slate-300">
                                                            <Clock size={10} className="mr-1" />
                                                            {preset.timeEstimate}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Daily XP Goal */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Daily XP Goal</label>
                                            <span className="text-emerald-400 font-bold">{localDailyGoal} XP</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="300"
                                            step="10"
                                            value={localDailyGoal}
                                            onChange={(e) => {
                                                setLocalDailyGoal(Number(e.target.value));
                                                setSelectedPreset(null);
                                            }}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Easy (10)</span>
                                            <span>Champion (300)</span>
                                        </div>
                                    </div>

                                    {/* Weekly Sessions Goal */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Weekly Commitment</label>
                                            <span className="text-blue-400 font-bold">{localWeeklyGoal} days / week</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="7"
                                            step="1"
                                            value={localWeeklyGoal}
                                            onChange={(e) => setLocalWeeklyGoal(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Casual (1)</span>
                                            <span>Dedicated (7)</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 italic">
                                            Streak flexibility: Your weekly goal replaces daily streaks for a lower-pressure experience.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target CEFR Level</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {CEFR_LEVELS.map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setLocalGoals(prev => ({ ...prev, targetCEFR: level }))}
                                                    className={`p-4 rounded-xl border-2 transition-all ${localGoals.targetCEFR === level
                                                        ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/20'
                                                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'}`}
                                                >
                                                    <div className="text-2xl font-black mb-1">{level}</div>
                                                    <div className="text-xs opacity-70">
                                                        {level === 'A1' ? 'Beginner' : level === 'C2' ? 'Master' : 'Intermediate'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Weekly XP Target</label>
                                                <span className="text-blue-400 font-bold">{localGoals.weeklyXP} XP</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="100"
                                                max="5000"
                                                step="100"
                                                value={localGoals.weeklyXP}
                                                onChange={(e) => setLocalGoals(prev => ({ ...prev, weeklyXP: Number(e.target.value) }))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Weekly Words Target</label>
                                                <span className="text-green-400 font-bold">{localGoals.weeklyWords} Words</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max="100"
                                                step="5"
                                                value={localGoals.weeklyWords}
                                                onChange={(e) => setLocalGoals(prev => ({ ...prev, weeklyWords: Number(e.target.value) }))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
                                        <h3 className="text-lg font-bold text-purple-200 mb-2 flex items-center gap-2">
                                            <Zap size={20} />
                                            Dynamic Scaling
                                        </h3>
                                        <p className="text-sm text-slate-300">
                                            The game automatically adjusts speed and complexity based on your accuracy.
                                            Use the multiplier below to make the baseline harder or easier.
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Speed Multiplier</label>
                                            <Badge variant={localDifficulty.globalMultiplier > 1 ? 'warning' : 'success'}>
                                                {localDifficulty.globalMultiplier}x
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-slate-500">Chill</span>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2.0"
                                                step="0.1"
                                                value={localDifficulty.globalMultiplier}
                                                onChange={(e) => setLocalDifficulty(prev => ({ ...prev, globalMultiplier: Number(e.target.value) }))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                            <span className="text-xs text-slate-500">Insane</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div>
                                            <div className="font-bold text-slate-200">Show Helper Hints</div>
                                            <div className="text-xs text-slate-500">Display first letter/color hints for difficult words</div>
                                        </div>
                                        <button
                                            onClick={() => setLocalDifficulty(prev => ({ ...prev, showHints: !prev.showHints }))}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${localDifficulty.showHints ? 'bg-green-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localDifficulty.showHints ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GoalSettingsModal;
