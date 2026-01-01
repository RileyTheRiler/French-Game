import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Map, Star, Book, Rocket, Coins } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';

const ONBOARDING_STEPS = [
    {
        id: 'hub',
        title: 'Explore Le Quartier',
        description: 'Meet locals and unlock mini-quests in the neighborhood hub.',
        icon: Map
    },
    {
        id: 'study',
        title: 'Review Study Session',
        description: 'Warm up with flashcards and spaced repetition before games.',
        icon: Book
    },
    {
        id: 'falling',
        title: 'Try Falling Words',
        description: 'Dodge falling tiles by typing translations quickly.',
        icon: Star
    }
];

const OnboardingChecklist = () => {
    const navigate = useNavigate();
    const { stats, completeOnboarding } = useProgress();
    const { showSuccess } = useToast();
    const [checkedSteps, setCheckedSteps] = useState(() => new Set());

    useEffect(() => {
        if (stats.onboardingComplete) {
            navigate(stats.placementComplete ? '/' : '/placement', { replace: true });
        }
    }, [stats.onboardingComplete, stats.placementComplete, navigate]);

    const rewards = useMemo(() => ({
        xp: 150,
        coins: 150
    }), []);

    const toggleStep = (id) => {
        setCheckedSteps(prev => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    const allChecked = checkedSteps.size === ONBOARDING_STEPS.length;

    const handleComplete = () => {
        if (!allChecked) return;
        completeOnboarding(rewards);
        showSuccess(`Welcome aboard! You earned ${rewards.coins} coins and ${rewards.xp} XP.`);
        navigate('/placement');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full max-w-4xl"
                >
                    <Card className="relative overflow-hidden border border-indigo-500/30 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-blue-500/10 pointer-events-none" />
                        <div className="relative p-8 md:p-10 flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/50">
                                    <Rocket className="text-indigo-300" size={28} />
                                </div>
                                <div>
                                    <p className="text-indigo-300 uppercase text-xs tracking-[0.2em] font-bold">First login</p>
                                    <h1 className="text-3xl md:text-4xl font-black text-white mt-1">Quick onboarding checklist</h1>
                                    <p className="text-slate-300 mt-2 max-w-2xl">
                                        Mark each highlight as you explore. Completing the checklist unlocks starter rewards and leads you to your placement quiz.
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {ONBOARDING_STEPS.map(step => {
                                    const Icon = step.icon;
                                    const checked = checkedSteps.has(step.id);
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => toggleStep(step.id)}
                                            className={`text-left relative group rounded-2xl p-5 border transition-all hover:-translate-y-1 ${checked ? 'bg-emerald-500/10 border-emerald-400/50' : 'bg-white/5 border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2.5 rounded-xl ${checked ? 'bg-emerald-500/20 text-emerald-200' : 'bg-indigo-500/20 text-indigo-200'}`}>
                                                    <Icon size={22} />
                                                </div>
                                                <CheckCircle className={`transition-colors ${checked ? 'text-emerald-400' : 'text-slate-600'}`} size={20} />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                                            <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl bg-slate-800/70 border border-indigo-500/20">
                                <div className="flex items-center gap-3">
                                    <Coins className="text-amber-300" size={24} />
                                    <div>
                                        <p className="text-sm text-indigo-200 font-semibold">Starter rewards unlocked</p>
                                        <p className="text-slate-300">Earn {rewards.coins} coins and {rewards.xp} XP when you complete the checklist.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => navigate('/placement')} className="border-white/10 text-slate-200">
                                        Skip to quiz
                                    </Button>
                                    <Button onClick={handleComplete} disabled={!allChecked}>
                                        {allChecked ? 'Claim rewards & continue' : 'Check all items to continue'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default OnboardingChecklist;
