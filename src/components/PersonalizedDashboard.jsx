import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Target, TrendingUp, Award, BookOpen, Zap,
    ArrowRight, Sparkles, BarChart3, Brain, Mic
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useLearningPath } from '../context/LearningPathContext';
import { useProgress } from '../context/ProgressContext';
import { CATEGORIES } from '../data/vocabulary';

/**
 * PersonalizedDashboard - AI-powered learning insights and recommendations
 * 
 * Features:
 * - Skill radar chart showing proficiency across categories
 * - AI Insights card with personalized recommendations
 * - Focus Areas highlighting weak points with practice links
 * - Learning path visualization with milestones
 * - Weekly progress trends
 */
const PersonalizedDashboard = () => {
    const navigate = useNavigate();
    const { stats, level } = useProgress();
    const {
        skillProfile,
        insights,
        categoryStrengths,
        milestones,
        currentMilestone,
        getFocusCategories,
        getMasteredCategories,
        getRecommendedLevel,
        vocabularyMastery,
        consistencyScore,
        learningVelocity
    } = useLearningPath();

    const focusCategories = getFocusCategories();
    const masteredCategories = getMasteredCategories();
    const recommendedLevel = getRecommendedLevel();

    // Prepare radar chart data
    const radarData = useMemo(() => {
        const categories = Object.keys(CATEGORIES).slice(0, 8); // Limit for visual clarity
        return categories.map(cat => ({
            category: cat,
            label: CATEGORIES[cat]?.name || cat,
            value: categoryStrengths[cat] || 0,
            icon: CATEGORIES[cat]?.icon || '📚'
        }));
    }, [categoryStrengths]);

    // Quick action cards
    const quickActions = [
        {
            id: 'pronunciation',
            title: 'Pronunciation Coach',
            description: 'AI-powered speech feedback',
            icon: Mic,
            color: 'indigo',
            path: '/pronunciation'
        },
        {
            id: 'study',
            title: 'Smart Study',
            description: 'Personalized word practice',
            icon: BookOpen,
            color: 'emerald',
            path: '/study'
        },
        {
            id: 'daily',
            title: 'Daily Mix',
            description: 'Your daily learning blend',
            icon: Zap,
            color: 'amber',
            path: '/daily-mix'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">
                            <span className="title-gradient">Your Learning Journey</span>
                        </h1>
                        <p className="text-slate-400">
                            Personalized insights powered by AI
                        </p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        Back to Menu
                    </Button>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<TrendingUp className="text-emerald-400" />}
                        label="Vocabulary Mastery"
                        value={`${vocabularyMastery}%`}
                        color="emerald"
                    />
                    <StatCard
                        icon={<Award className="text-amber-400" />}
                        label="Current Level"
                        value={recommendedLevel}
                        color="amber"
                    />
                    <StatCard
                        icon={<Zap className="text-indigo-400" />}
                        label="Learning Velocity"
                        value={learningVelocity > 0.7 ? 'Fast' : learningVelocity > 0.4 ? 'Steady' : 'Building'}
                        color="indigo"
                    />
                    <StatCard
                        icon={<BarChart3 className="text-purple-400" />}
                        label="Consistency"
                        value={`${consistencyScore}%`}
                        color="purple"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Skill Radar */}
                    <Card className="lg:col-span-2 p-6 bg-slate-900/50 border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="text-indigo-400" size={20} />
                            <h2 className="text-xl font-bold text-white">Skill Profile</h2>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {radarData.map((item, index) => (
                                <motion.div
                                    key={item.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative"
                                >
                                    <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <div className="text-sm text-slate-400 mb-1 truncate">
                                            {item.label}
                                        </div>
                                        <div className="flex items-end gap-1">
                                            <span className={`text-xl font-bold ${item.value >= 80 ? 'text-emerald-400' :
                                                    item.value >= 50 ? 'text-amber-400' :
                                                        item.value > 0 ? 'text-red-400' : 'text-slate-600'
                                                }`}>
                                                {item.value > 0 ? item.value : '—'}
                                            </span>
                                            {item.value > 0 && <span className="text-xs text-slate-500 mb-0.5">%</span>}
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.value}%` }}
                                                transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                                                className={`h-full rounded-full ${item.value >= 80 ? 'bg-emerald-500' :
                                                        item.value >= 50 ? 'bg-amber-500' :
                                                            'bg-red-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    {/* AI Insights */}
                    <Card className="p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-indigo-400" size={20} />
                            <h2 className="text-xl font-bold text-white">AI Insights</h2>
                        </div>

                        <div className="space-y-3">
                            {insights.length > 0 ? (
                                insights.slice(0, 4).map((insight, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-3 rounded-lg border ${insight.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                                insight.type === 'focus' ? 'bg-amber-500/10 border-amber-500/20' :
                                                    insight.type === 'suggestion' ? 'bg-blue-500/10 border-blue-500/20' :
                                                        'bg-slate-800/50 border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">{insight.icon}</span>
                                            <div>
                                                <div className="font-medium text-white text-sm">
                                                    {insight.title}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {insight.message}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-slate-400 text-sm text-center py-4">
                                    Complete more exercises to unlock AI insights!
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Focus Areas & Milestones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Focus Areas */}
                    <Card className="p-6 bg-slate-900/50 border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="text-red-400" size={20} />
                            <h2 className="text-xl font-bold text-white">Focus Areas</h2>
                        </div>

                        {focusCategories.length > 0 ? (
                            <div className="space-y-3">
                                {focusCategories.map((category, index) => (
                                    <div
                                        key={category}
                                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{CATEGORIES[category]?.icon}</span>
                                            <div>
                                                <div className="font-medium text-white">
                                                    {CATEGORIES[category]?.name || category}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {categoryStrengths[category] || 0}% accuracy
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate('/study')}
                                        >
                                            Practice <ArrowRight size={14} className="ml-1" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm text-center py-8">
                                <Award className="mx-auto mb-2 text-emerald-400" size={32} />
                                <span className="text-emerald-400">Great job!</span> No weak areas detected.
                            </div>
                        )}

                        {/* Mastered categories badge */}
                        {masteredCategories.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                                    Mastered Categories
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {masteredCategories.map(cat => (
                                        <Badge key={cat} variant="primary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                            {CATEGORIES[cat]?.icon} {CATEGORIES[cat]?.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Learning Path Milestones */}
                    <Card className="p-6 bg-slate-900/50 border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="text-amber-400" size={20} />
                            <h2 className="text-xl font-bold text-white">Learning Milestones</h2>
                        </div>

                        <div className="space-y-3">
                            {milestones.map((milestone, index) => {
                                const progress = Math.min(100, (milestone.current / milestone.target) * 100);
                                const isCurrent = milestone.id === currentMilestone?.id;

                                return (
                                    <div
                                        key={milestone.id}
                                        className={`p-3 rounded-lg border transition-all ${milestone.complete
                                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                                : isCurrent
                                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                                    : 'bg-slate-800/30 border-white/5 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {milestone.complete ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                        <Award size={14} className="text-white" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCurrent ? 'bg-indigo-500' : 'bg-slate-700'
                                                        }`}>
                                                        <span className="text-xs font-bold text-white">{index + 1}</span>
                                                    </div>
                                                )}
                                                <span className={`font-medium ${milestone.complete ? 'text-emerald-400' : 'text-white'}`}>
                                                    {milestone.title}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {milestone.current} / {milestone.target}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                                                className={`h-full rounded-full ${milestone.complete ? 'bg-emerald-500' : 'bg-indigo-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <Card
                                className={`p-5 cursor-pointer bg-gradient-to-br hover:scale-[1.02] transition-transform ${action.color === 'indigo' ? 'from-indigo-900/30 to-indigo-800/10 border-indigo-500/20 hover:border-indigo-500/40' :
                                        action.color === 'emerald' ? 'from-emerald-900/30 to-emerald-800/10 border-emerald-500/20 hover:border-emerald-500/40' :
                                            'from-amber-900/30 to-amber-800/10 border-amber-500/20 hover:border-amber-500/40'
                                    }`}
                                onClick={() => navigate(action.path)}
                            >
                                <action.icon className={`mb-3 ${action.color === 'indigo' ? 'text-indigo-400' :
                                        action.color === 'emerald' ? 'text-emerald-400' :
                                            'text-amber-400'
                                    }`} size={28} />
                                <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                                <p className="text-sm text-slate-400">{action.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
    <Card className={`p-4 bg-slate-900/50 border-white/10`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-500/10`}>
                {icon}
            </div>
            <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
                <div className="text-xl font-bold text-white">{value}</div>
            </div>
        </div>
    </Card>
);

export default PersonalizedDashboard;
