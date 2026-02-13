import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, Pause, FastForward, Check, X, RotateCcw, HelpCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';
import SoundManager from '../utils/SoundManager';
import { PODCAST_EPISODES } from '../data/podcastData';

const PodcastMode = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showTranscript, setShowTranscript] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);

    // Simulate audio element
    useEffect(() => {
        let interval;
        if (isPlaying && progress < 100) {
            interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    // Speed factor
                    return p + (0.1 * playbackSpeed);
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, progress, playbackSpeed]); // Added playbackSpeed dependency

    const handleEpisodeSelect = (episode) => {
        setCurrentEpisode(episode);
        setProgress(0);
        setIsPlaying(true);
        setQuizCompleted(false);
        setActiveQuestion(null);
    };

    const handleAnswer = (option) => {
        if (option.isCorrect) {
            SoundManager.playMatch();
            addXP(20);
            setActiveQuestion(null); // Close question
        } else {
            SoundManager.playMiss();
        }
    };

    // Check for timestamps to trigger questions (mock logic)
    useEffect(() => {
        if (!currentEpisode || !isPlaying) return;

        const currentTime = (progress / 100) * currentEpisode.duration;
        const question = currentEpisode.questions.find(q =>
            Math.abs(q.timestamp - currentTime) < 1 && !q.answered
        );

        if (question) {
            setIsPlaying(false);
            setActiveQuestion(question);
        }
    }, [progress, currentEpisode, isPlaying]);

    if (!currentEpisode) {
        return (
            <GameLayout title="Podcast Learning" onBack={() => navigate('/')}>
                <div className="grid gap-4 max-w-2xl mx-auto p-4">
                    {PODCAST_EPISODES.map(ep => (
                        <Card
                            key={ep.id}
                            className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-4"
                            onClick={() => handleEpisodeSelect(ep)}
                        >
                            <div className="w-16 h-16 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Volume2 className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{ep.title}</h3>
                                <p className="text-sm text-slate-400">{ep.duration}s • {ep.difficulty}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout title={currentEpisode.title} onBack={() => setCurrentEpisode(null)}>
            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Audio Visualizer Placeholder */}
                <div className="h-32 bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/10" />
                    <div className="flex items-end gap-1 h-12">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-2 bg-indigo-400 rounded-full"
                                animate={{ height: isPlaying ? [10, 40, 10] : 10 }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.5,
                                    delay: i * 0.05,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <Card className="p-6 bg-slate-900/50">
                    <Slider
                        value={[progress]}
                        max={100}
                        onValueChange={(val) => setProgress(val[0])}
                        className="mb-6"
                    />

                    <div className="flex justify-between items-center">
                        <Button variant="ghost" onClick={() => setPlaybackSpeed(s => s === 1 ? 0.75 : 1)}>
                            {playbackSpeed}x
                        </Button>

                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => setProgress(Math.max(0, progress - 10))}>
                                <RotateCcw size={20} />
                            </Button>
                            <Button
                                size="lg"
                                className="rounded-full w-16 h-16 p-0"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                            </Button>
                            <Button variant="ghost" onClick={() => setProgress(Math.min(100, progress + 10))}>
                                <FastForward size={20} />
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={() => setShowTranscript(!showTranscript)}>
                            <HelpCircle size={20} className={showTranscript ? "text-indigo-400" : ""} />
                        </Button>
                    </div>
                </Card>

                {/* Interactive Question Overlay */}
                <AnimatePresence>
                    {activeQuestion && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="fixed inset-x-0 bottom-0 p-4 md:relative md:p-0 z-50"
                        >
                            <Card className="p-6 border-indigo-500/50 bg-slate-900 shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-4">Comprehension Check</h3>
                                <p className="text-slate-300 mb-6">{activeQuestion.text}</p>
                                <div className="grid gap-3">
                                    {activeQuestion.options.map((opt, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="justify-start text-left h-auto py-3"
                                            onClick={() => handleAnswer(opt)}
                                        >
                                            {opt.text}
                                        </Button>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transcript */}
                <AnimatePresence>
                    {showTranscript && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="p-6 bg-slate-800/50">
                                <p className="text-slate-300 leading-relaxed font-serif">
                                    {currentEpisode.transcript}
                                </p>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default PodcastMode;
