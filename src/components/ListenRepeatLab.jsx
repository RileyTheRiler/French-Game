import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, Play, Pause, Square, RefreshCcw, CheckCircle2,
    ChevronRight, Volume2, Info, Award, Zap, Library
} from 'lucide-react';
import { SHADOWING_PHRASES } from '../data/shadowingData';
import { useProgress } from '../context/ProgressContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { GameLayout } from './layout/GameLayout';
import { speak } from '../utils/audio';

// Waveform Component (Decorative / Simulated)
const Waveform = ({ active, bars = 20, color = 'bg-indigo-500' }) => {
    return (
        <div className="flex items-center justify-center gap-[2px] h-12">
            {[...Array(bars)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={active ? {
                        height: [10, Math.random() * 40 + 10, 10],
                    } : {
                        height: 4
                    }
                    }
                    transition={active ? {
                        duration: 0.5 + Math.random(),
                        repeat: Infinity,
                        ease: "easeInOut"
                    } : {}}
                    className={`w-1 rounded-full ${color} opacity-80`}
                />
            ))}
        </div>
    );
};

const ListenRepeatLab = () => {
    const navigate = useNavigate();
    const { stats, updateStats, addXP, globalDifficulty } = useProgress();
    const difficultyConfig = React.useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);

    const [currentStep, setCurrentStep] = useState('library'); // library, practice, results
    const [selectedPhrase, setSelectedPhrase] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
    const [isPlayingNew, setIsPlayingNew] = useState(false);
    const [score, setScore] = useState(0);
    const [showComparison, setShowComparison] = useState(false);

    const recordingTimeout = useRef(null);

    const handleSelectPhrase = (phrase) => {
        setSelectedPhrase(phrase);
        setCurrentStep('practice');
        setHasRecorded(false);
        setScore(0);
        setShowComparison(false);
        SoundManager.playFlip();
    };

    const playOriginal = () => {
        setIsPlayingOriginal(true);
        speak(selectedPhrase.french, 'fr-FR', difficultyConfig.audioSpeed, () => setIsPlayingOriginal(false));
    };

    const startRecording = () => {
        setIsRecording(true);
        setHasRecorded(false);
        SoundManager.playPop();

        // Simulate recording end after 3-5 seconds based on phrase length
        const duration = Math.max(3000, selectedPhrase.french.length * 150);
        recordingTimeout.current = setTimeout(() => {
            stopRecording();
        }, duration);
    };

    const stopRecording = () => {
        if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
        setIsRecording(false);
        setHasRecorded(true);

        // Simulate analysis
        setTimeout(() => {
            evaluatePronunciation();
        }, 1000);
    };

    const evaluatePronunciation = () => {
        // Mock evaluation logic
        const randomScore = Math.floor(Math.random() * 31) + 70; // 70-100
        setScore(randomScore);
        setShowComparison(true);
        SoundManager.playSuccess();
    };

    const handleComplete = () => {
        addXP(25);
        const progress = stats.shadowingProgress || {};
        const phraseId = selectedPhrase.id;

        updateStats({
            shadowingProgress: {
                ...progress,
                [phraseId]: {
                    attempts: (progress[phraseId]?.attempts || 0) + 1,
                    bestScore: Math.max(progress[phraseId]?.bestScore || 0, score),
                    lastPracticed: Date.now()
                }
            }
        });

        setCurrentStep('library');
        setSelectedPhrase(null);
    };

    const renderLibrary = () => (
        <GameLayout
            title="Listen & Repeat Lab"
            subtitle="Shadowing exercises to perfect your accent"
            onBack={() => navigate('/')}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-5xl mx-auto">
                {SHADOWING_PHRASES.map((phrase, idx) => {
                    const phraseProgress = stats.shadowingProgress?.[phrase.id];
                    const isPerfect = phraseProgress?.bestScore >= 95;

                    return (
                        <motion.div
                            key={phrase.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card
                                onClick={() => handleSelectPhrase(phrase)}
                                hover
                                className="group relative overflow-hidden flex flex-col justify-between h-full border-white/5 bg-slate-900/40 backdrop-blur-sm"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 capitalize">
                                            {phrase.category}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-white/5 text-slate-400">
                                            {phrase.difficulty}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                        {phrase.french}
                                    </h3>
                                    <p className="text-sm text-slate-400 italic mb-4">{phrase.english}</p>
                                </div>

                                <div className="p-4 bg-white/5 flex justify-between items-center">
                                    <div className="flex gap-1">
                                        {phraseProgress ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${isPerfect ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${phraseProgress.bestScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{phraseProgress.bestScore}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">New Phrase</span>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <Play size={14} fill="currentColor" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </GameLayout>
    );

    const renderPractice = () => (
        <GameLayout
            title="Shadowing Session"
            subtitle={selectedPhrase.category}
            onBack={() => setCurrentStep('library')}
        >
            <div className="max-w-2xl mx-auto px-4 mt-8 flex flex-col items-center">
                <Card className="w-full p-8 md:p-12 mb-8 bg-slate-950/60 backdrop-blur-xl border-white/5 text-center">
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                        {selectedPhrase.french}
                    </h2>
                    <p className="text-xl text-slate-400 italic mb-10">{selectedPhrase.english}</p>

                    {/* Native Audio Control */}
                    <div className="flex flex-col items-center gap-4 mb-12">
                        <Button
                            variant={isPlayingOriginal ? 'primary' : 'outline'}
                            size="lg"
                            className={`rounded-full h-20 w-20 p-0 shadow-lg ${isPlayingOriginal ? 'shadow-indigo-500/50' : ''}`}
                            onClick={playOriginal}
                            disabled={isRecording}
                        >
                            {isPlayingOriginal ? <Volume2 size={32} className="animate-pulse" /> : <Play size={32} fill="currentColor" />}
                        </Button>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Listen to Native</p>
                        <Waveform active={isPlayingOriginal} bars={30} color="bg-indigo-400" />
                    </div>

                    <div className="w-full h-px bg-white/5 mb-12" />

                    {/* recording Control */}
                    <div className="flex flex-col items-center gap-4">
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <Button
                                variant={isRecording ? 'destructive' : hasRecorded ? 'secondary' : 'primary'}
                                size="lg"
                                className={`rounded-full h-24 w-24 p-0 shadow-2xl transition-all duration-300 ${isRecording ? 'animate-pulse ring-4 ring-red-500/20 shadow-red-500/50' : ''
                                    }`}
                                onClick={isRecording ? stopRecording : startRecording}
                            >
                                {isRecording ? <Square size={36} fill="currentColor" /> : <Mic size={36} fill="currentColor" />}
                            </Button>
                        </motion.div>
                        <p className={`text-sm font-bold uppercase tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                            {isRecording ? 'Recording...' : hasRecorded ? 'Rerecord' : 'Tap to Repeat'}
                        </p>
                        <Waveform active={isRecording} bars={40} color="bg-red-500" />
                    </div>
                </Card>

                {/* Analysis Area */}
                <AnimatePresence>
                    {showComparison && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <Card className="p-6 bg-emerald-500/10 border-emerald-500/20 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Analysis Result</h4>
                                            <p className="text-xs text-slate-400">Pronunciation Accuracy</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-emerald-400">{score}%</div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {['Rhythm', 'Phonemes', 'Inflection'].map(stat => (
                                        <div key={stat} className="bg-white/5 p-3 rounded-xl text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{stat}</p>
                                            <div className="text-sm font-bold text-white">
                                                {Math.floor(Math.random() * 20) + 80}%
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => { setHasRecorded(false); setShowComparison(false); }}>
                                        <RefreshCcw size={16} className="mr-2" /> Try Again
                                    </Button>
                                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500" onClick={handleComplete}>
                                        Save & Continue <ChevronRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );

    return currentStep === 'library' ? renderLibrary() : renderPractice();
};

export default ListenRepeatLab;
