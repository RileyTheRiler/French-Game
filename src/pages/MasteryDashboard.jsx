import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, ArrowLeft, BarChart2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const MasteryDashboard = () => {
    const navigate = useNavigate();
    const { stats, categoryStats } = useProgress();

    const getMasteryColor = (percentage) => {
        if (percentage >= 80) return 'text-emerald-400';
        if (percentage >= 50) return 'text-amber-400';
        return 'text-rose-400';
    };

    return (
        <GameLayout
            title="Mastery Dashboard"
            subtitle="Track your progress across all skills"
            onBack={() => navigate('/')}
            icon={<BarChart2 className="w-6 h-6" />}
        >
            <div className="max-w-4xl mx-auto p-4 space-y-8">

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-indigo-900/30 border-indigo-500/30 flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <Trophy className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider">Total XP</p>
                            <h3 className="text-2xl font-bold text-white">{stats.xp.toLocaleString()}</h3>
                        </div>
                    </Card>

                    <Card className="p-6 bg-emerald-900/30 border-emerald-500/30 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <ArrowLeft className="w-8 h-8 text-emerald-400 rotate-90" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider">Level</p>
                            <h3 className="text-2xl font-bold text-white">{stats.level || 1}</h3>
                        </div>
                    </Card>

                    <Card className="p-6 bg-amber-900/30 border-amber-500/30 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <BarChart2 className="w-8 h-8 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider">Words Learned</p>
                            <h3 className="text-2xl font-bold text-white">{stats.wordsLearned || 0}</h3>
                        </div>
                    </Card>
                </div>

                {/* Category Breakdown */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Skill Mastery</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(categoryStats).map(([category, data]) => {
                            const accuracy = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0;
                            return (
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="p-4 hover:bg-slate-800/80 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-slate-200 capitalize">{category}</h3>
                                            <Badge variant="outline" className={getMasteryColor(accuracy)}>
                                                {accuracy}% Accuracy
                                            </Badge>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${accuracy}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                            <span>{data.correct} correct</span>
                                            <span>{data.attempts} attempts</span>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                        {Object.keys(categoryStats).length === 0 && (
                            <p className="text-slate-500 italic col-span-2 text-center py-8">
                                Complete exercises to see your skill breakdown here.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </GameLayout>
    );
};

export default MasteryDashboard;
