import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Award, TrendingUp, BookOpen, Target, MessageCircle,
    CheckCircle, AlertCircle, Lightbulb, ArrowRight, RotateCcw,
    Sparkles, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeConversation } from '../utils/ConversationAnalyzer';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

/**
 * Score Ring Component
 */
const ScoreRing = ({ score, label, color = 'indigo' }) => {
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const colorClasses = {
        indigo: 'text-indigo-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        rose: 'text-rose-400',
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-800"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={colorClasses[color]}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{score}</span>
                </div>
            </div>
            <span className="mt-2 text-sm text-slate-400">{label}</span>
        </div>
    );
};

/**
 * Metric Card Component
 */
const MetricCard = ({ icon: Icon, label, value, description, color = 'slate' }) => {
    const colorClasses = {
        slate: 'bg-slate-800/50 border-slate-700/50',
        indigo: 'bg-indigo-500/10 border-indigo-500/30',
        emerald: 'bg-emerald-500/10 border-emerald-500/30',
        amber: 'bg-amber-500/10 border-amber-500/30',
    };

    const iconColors = {
        slate: 'text-slate-400',
        indigo: 'text-indigo-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-start justify-between mb-2">
                <Icon size={18} className={iconColors[color]} />
                <span className="text-lg font-bold text-white">{value}</span>
            </div>
            <p className="text-sm font-medium text-white">{label}</p>
            {description && (
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            )}
        </div>
    );
};

/**
 * Highlight Item Component
 */
const HighlightItem = ({ highlight }) => {
    const isPositive = highlight.type === 'positive';

    return (
        <div className={`p-3 rounded-lg border ${isPositive
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
            <div className="flex items-start gap-2">
                {isPositive
                    ? <CheckCircle size={16} className="text-emerald-400 mt-0.5" />
                    : <AlertCircle size={16} className="text-amber-400 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{highlight.label}</p>
                    <p className="text-sm text-slate-300 mt-1 break-words">"{highlight.text}"</p>
                    {highlight.suggestion && (
                        <p className="text-xs text-indigo-300 mt-1">
                            Try: "{highlight.suggestion}"
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Conversation Summary Component
 */
const ConversationSummary = ({ messages, prompt, onComplete, onRetry }) => {
    const navigate = useNavigate();

    // Analyze the conversation
    const analysis = useMemo(() => {
        return analyzeConversation(messages, prompt);
    }, [messages, prompt]);

    const handleFinish = () => {
        onComplete(analysis.earnedXP);
    };

    const getGrade = (score) => {
        if (score >= 90) return { letter: 'A+', color: 'text-emerald-400' };
        if (score >= 80) return { letter: 'A', color: 'text-emerald-400' };
        if (score >= 70) return { letter: 'B', color: 'text-indigo-400' };
        if (score >= 60) return { letter: 'C', color: 'text-amber-400' };
        return { letter: 'D', color: 'text-rose-400' };
    };

    const grade = getGrade(analysis.overallScore);

    return (
        <GameLayout
            title="Conversation Complete"
            subtitle={prompt.title}
            onBack={() => navigate('/')}
        >
            <div className="max-w-3xl mx-auto p-4 space-y-6">
                {/* Main Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-indigo-500/30">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Overall Grade */}
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className={`text-7xl font-black ${grade.color}`}
                                >
                                    {grade.letter}
                                </motion.div>
                                <p className="text-slate-400 mt-1">Overall Grade</p>
                            </div>

                            {/* Score Rings */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ScoreRing score={analysis.fluency.score} label="Fluency" color="indigo" />
                                <ScoreRing score={analysis.vocabulary.score} label="Vocabulary" color="emerald" />
                                <ScoreRing score={analysis.accuracy.score} label="Accuracy" color="amber" />
                                <ScoreRing score={analysis.communication.score} label="Communication" color="rose" />
                            </div>
                        </div>

                        {/* XP Earned */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-3"
                        >
                            <Sparkles className="text-yellow-400" size={24} />
                            <span className="text-2xl font-bold text-white">+{analysis.earnedXP} XP Earned</span>
                            <span className="text-slate-400">
                                (of {prompt.xpReward} possible)
                            </span>
                        </motion.div>
                    </Card>
                </motion.div>

                {/* Detailed Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-400" />
                        Detailed Metrics
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricCard
                            icon={MessageCircle}
                            label="Turns Taken"
                            value={analysis.totalTurns}
                            description="conversation exchanges"
                            color="indigo"
                        />
                        <MetricCard
                            icon={BookOpen}
                            label="Unique Words"
                            value={analysis.vocabulary.uniqueWords}
                            description={`${Math.round(analysis.vocabulary.diversityRatio * 100)}% diversity`}
                            color="emerald"
                        />
                        <MetricCard
                            icon={Zap}
                            label="Avg. Length"
                            value={`${analysis.fluency.avgLength} chars`}
                            description="per response"
                            color="slate"
                        />
                        <MetricCard
                            icon={AlertCircle}
                            label="Grammar Notes"
                            value={analysis.accuracy.errorCount}
                            description="areas to review"
                            color="amber"
                        />
                    </div>
                </motion.div>

                {/* Communication Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Target size={18} className="text-indigo-400" />
                        Communication Goals
                    </h3>

                    <Card className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            {analysis.communication.goalAchieved ? (
                                <>
                                    <CheckCircle className="text-emerald-400" size={24} />
                                    <span className="text-emerald-400 font-medium">Goal Achieved!</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="text-amber-400" size={24} />
                                    <span className="text-amber-400 font-medium">Keep Practicing</span>
                                </>
                            )}
                        </div>

                        <p className="text-sm text-slate-400 mb-4">{prompt.goal}</p>

                        <div className="flex flex-wrap gap-2">
                            {analysis.communication.expectedTopics?.map(topic => {
                                const covered = analysis.communication.topicsCovered.includes(topic);
                                return (
                                    <Badge
                                        key={topic}
                                        variant={covered ? 'success' : 'default'}
                                        className={!covered ? 'opacity-50' : ''}
                                    >
                                        {covered && <CheckCircle size={12} className="mr-1" />}
                                        {topic}
                                    </Badge>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>

                {/* Highlights */}
                {analysis.highlights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Lightbulb size={18} className="text-amber-400" />
                            Moments to Review
                        </h3>

                        <div className="space-y-2">
                            {analysis.highlights.map((highlight, idx) => (
                                <HighlightItem key={idx} highlight={highlight} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="p-4 bg-indigo-500/10 border-indigo-500/30">
                            <h4 className="font-medium text-indigo-300 mb-2 flex items-center gap-2">
                                <Sparkles size={16} />
                                Tips for Next Time
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-300">
                                {analysis.suggestions.map((suggestion, idx) => (
                                    <li key={idx}>• {suggestion}</li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3 pt-4"
                >
                    <Button
                        onClick={onRetry}
                        variant="secondary"
                        className="flex-1"
                    >
                        <RotateCcw size={16} className="mr-2" />
                        Practice Again
                    </Button>
                    <Button
                        onClick={handleFinish}
                        className="flex-1"
                    >
                        Claim {analysis.earnedXP} XP
                        <ArrowRight size={16} className="ml-2" />
                    </Button>
                </motion.div>
            </div>
        </GameLayout>
    );
};

export default ConversationSummary;
