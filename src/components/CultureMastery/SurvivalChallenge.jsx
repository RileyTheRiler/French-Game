import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, ShieldAlert, Heart } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateSurvivalScenario } from '../../data/survivalData';

const SurvivalChallenge = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [scenario, setScenario] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [lives, setLives] = useState(3);
    const [stressLevel, setStressLevel] = useState(0); // 0-100
    const [status, setStatus] = useState('playing');

    useEffect(() => {
        setScenario(generateSurvivalScenario());
    }, []);

    useEffect(() => {
        if (status !== 'playing') return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status]);

    useEffect(() => {
        // Increase stress as time runs out
        // eslint-disable-next-line no-unused-vars
        setStressLevel(prev => Math.min(100, (30 - timeLeft) * 3.3));
    }, [timeLeft]);

    const handleTimeUp = () => {
        setStatus('failed');
        setLives(l => l - 1);
    };

    const handleChoice = (choice) => {
        if (choice.correct) {
            addXP(20);
            setStatus('success');
        } else {
            setLives(l => l - 1);
            setStressLevel(s => Math.min(100, s + 20));
        }
    };

    if (!scenario) return <div>Loading...</div>;

    return (
        <GameLayout title="Survival Mode" onBack={() => navigate('/')}>
            <div className="max-w-md mx-auto space-y-6 p-4">
                {/* Stats Header */}
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 text-red-400">
                        <Heart size={20} fill="currentColor" />
                        <span className="font-bold text-xl">{lives}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                        <Clock size={20} />
                        <span className="font-bold text-xl">{timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-400">
                        <Flame size={20} />
                        <span className="font-bold text-xl">{Math.round(stressLevel)}%</span>
                    </div>
                </div>

                {/* Scenario Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={scenario.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="p-6 border-red-500/20 bg-gradient-to-br from-slate-900 to-red-900/20">
                            <div className="flex items-start gap-4 mb-4">
                                <ShieldAlert className="text-red-500 shrink-0" size={32} />
                                <h2 className="text-xl font-bold text-white">{scenario.situation}</h2>
                            </div>
                            <p className="text-slate-300 mb-6">{scenario.question}</p>

                            <div className="grid gap-3">
                                {scenario.options.map((opt, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleChoice(opt)}
                                        variant="outline"
                                        className="justify-start text-left h-auto py-4 hover:border-red-400 hover:bg-red-500/10"
                                    >
                                        {opt.text}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default SurvivalChallenge;
