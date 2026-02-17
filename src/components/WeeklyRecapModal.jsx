import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Flame, ArrowRight, Star } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import confetti from 'canvas-confetti';

const WeeklyRecapModal = ({ onClose }) => {
    const { getWeeklySummary, markWeeklyRecapSeen } = useProgress();
    const [step, setStep] = useState(0);

    const weeklyData = getWeeklySummary ? getWeeklySummary() : [];

    // Aggregates
    const totalXP = weeklyData.reduce((acc, d) => acc + (d.xp || 0), 0);
    const totalWords = weeklyData.reduce((acc, d) => acc + (d.words || 0), 0);
    const totalTime = weeklyData.reduce((acc, d) => acc + (d.time || 0), 0);
    const totalTimeMinutes = Math.round(totalTime / 1000 / 60);
    const bestDay = weeklyData.reduce((max, d) => (d.xp > max.xp ? d : max), { xp: 0 });

    useEffect(() => {
        // Confetti on mount
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const handleClose = () => {
        markWeeklyRecapSeen();
        onClose();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <Card className="border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] bg-gradient-to-br from-slate-900 to-indigo-950/50 p-8 text-center relative overflow-hidden">

                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <div className="mb-6 flex justify-center">
                            <div className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-xl">
                                <Trophy size={48} className="text-white drop-shadow-md" />
                            </div>
                        </div>

                        <h2 className="text-4xl font-black text-white mb-2 title-gradient">Weekly Report</h2>
                        <p className="text-indigo-300 mb-8 font-medium">You crushed it this week!</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-3xl font-black text-white mb-1">{totalXP}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total XP</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-3xl font-black text-white mb-1">{totalWords}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Words Learned</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-3xl font-black text-white mb-1">{totalTimeMinutes}m</div>
                                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Active Time</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-3xl font-black text-white mb-1">{bestDay.day || bestDay.date?.split(' ')[0] || '-'}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Day</div>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-lg py-6 shadow-xl shadow-indigo-500/20"
                        >
                            Continue Learning <ArrowRight className="ml-2" />
                        </Button>

                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WeeklyRecapModal;
