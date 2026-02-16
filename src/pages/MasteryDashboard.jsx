import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { BarChart3, TrendingUp, BookOpen, Star } from 'lucide-react';

const MasteryDashboard = () => {
    const { stats, level } = useProgress();

    return (
        <GameLayout title="Mastery Dashboard" onBack={() => window.history.back()}>
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6 bg-slate-900 border-white/10">
                    <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-800 rounded-xl">
                            <div className="text-slate-400 text-sm">Level</div>
                            <div className="text-3xl font-bold text-white">{level}</div>
                        </div>
                        <div className="p-4 bg-slate-800 rounded-xl">
                            <div className="text-slate-400 text-sm">XP</div>
                            <div className="text-3xl font-bold text-indigo-400">{stats.xp}</div>
                        </div>
                        <div className="p-4 bg-slate-800 rounded-xl">
                            <div className="text-slate-400 text-sm">Words Learned</div>
                            <div className="text-3xl font-bold text-emerald-400">{stats.wordsLearned}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </GameLayout>
    );
};

export default MasteryDashboard;
