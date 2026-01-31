import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, SkipForward, Clock, Calendar } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { playWordAudio } from '../utils/audio';
import SoundManager from '../utils/SoundManager';

const PodcastMode = () => {
    const { vocabulary } = useVocabulary();
    const { addXP, offlineAudio } = useProgress();
    const [isPlaying, setIsPlaying] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const audioRef = useRef(null);
    const [sessionStarted, setSessionStarted] = useState(false);

    // Filter for review-ready words
    const playlist = vocabulary.filter(w => w.level > 0).sort((a, b) => a.lastSeen - b.lastSeen).slice(0, 20);

    const finishSession = useCallback(() => {
        setIsPlaying(false);
        if (audioRef.current) {
            clearTimeout(audioRef.current);
        }
        addXP(30);
        SoundManager.playLevelUp();
        setSessionComplete(true);
    }, [addXP]);

    const playNextWord = useCallback(() => {
        if (!isPlaying) return;

        if (currentWordIndex < playlist.length) {
            const word = playlist[currentWordIndex];

            // Play English then French
            playWordAudio(word, { lang: 'en-US', offlineOnly: offlineAudio });

            setTimeout(() => {
                playWordAudio(word, { lang: 'fr-FR', offlineOnly: offlineAudio });
                setCurrentWordIndex(prev => prev + 1);
            }, 1500);

            // Schedule next word
            audioRef.current = setTimeout(() => {
                if (currentWordIndex >= playlist.length - 1) {
                    // Session complete
                    finishSession();
                } else {
                    playNextWord();
                }
            }, 4000 / playbackSpeed);
        }
    }, [isPlaying, currentWordIndex, playlist, playbackSpeed, offlineAudio, finishSession]);

    useEffect(() => {
        if (isPlaying) {
            playNextWord();
        }
        return () => {
            if (audioRef.current) clearTimeout(audioRef.current);
        };
    }, [isPlaying, playNextWord]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        if (!sessionStarted) setSessionStarted(true);
    };

    // Session selection screen
    if (!sessionStarted) {
        return (
            <GameLayout title="Podcast Mode" onBack={() => window.history.back()}>
                <div className="max-w-md mx-auto space-y-6 mt-8">
                    <Card className="p-8 text-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                            <Play size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Passive Listening</h2>
                        <p className="text-slate-400 mb-8">
                            Listen to your vocabulary while you walk, drive, or relax. No screen interaction required.
                        </p>
                        <div className="flex justify-center gap-4 mb-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{playlist.length}</div>
                                <div className="text-xs text-slate-500 uppercase">Words</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">~{Math.ceil(playlist.length * 4 / 60)}</div>
                                <div className="text-xs text-slate-500 uppercase">Minutes</div>
                            </div>
                        </div>
                        <Button size="lg" className="w-full py-4 text-lg shadow-xl shadow-indigo-500/20" onClick={togglePlay}>
                            Start Session
                        </Button>
                    </Card>
                </div>
            </GameLayout>
        );
    }

    if (sessionComplete) {
        return (
            <GameLayout title="Session Complete" onBack={() => window.history.back()}>
                <div className="max-w-md mx-auto text-center mt-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400"
                    >
                        <Check size={48} />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-4">Great Job!</h2>
                    <p className="text-slate-400 mb-8">You've reviewed {playlist.length} words.</p>
                    <Button onClick={() => window.history.back()}>Return to Hub</Button>
                </div>
            </GameLayout>
        );
    }

    const currentWord = playlist[Math.min(currentWordIndex, playlist.length - 1)];

    return (
        <GameLayout title="Now Playing" onBack={() => window.history.back()}>
            <div className="max-w-md mx-auto mt-8 flex flex-col items-center">

                {/* Album Art / Visualization */}
                <div className="w-64 h-64 bg-slate-800 rounded-3xl shadow-2xl mb-8 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                    {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center gap-1">
                            {[1,2,3,4,5].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [20, 60, 20] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                    className="w-2 bg-indigo-500/50 rounded-full"
                                />
                            ))}
                        </div>
                    )}
                    <div className="text-4xl font-bold text-white/20 z-10">
                        {currentWordIndex + 1} / {playlist.length}
                    </div>
                </div>

                {/* Word Display */}
                <div className="text-center space-y-2 mb-12">
                    <h2 className="text-4xl font-black text-white">{currentWord?.french}</h2>
                    <p className="text-xl text-indigo-300">{currentWord?.english}</p>
                    <Badge variant="outline" className="mt-2">{currentWord?.category}</Badge>
                </div>

                {/* Controls */}
                <div className="w-full flex items-center justify-between px-8">
                    <button className="text-slate-400 hover:text-white transition-colors">
                        <Square size={20} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <button onClick={finishSession} className="text-slate-400 hover:text-white transition-colors">
                        <SkipForward size={24} />
                    </button>
                </div>

                {/* Playback Speed */}
                <div className="mt-8 flex gap-2">
                    {[0.8, 1.0, 1.2, 1.5].map(speed => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                playbackSpeed === speed ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>

            </div>
        </GameLayout>
    );
};

export default PodcastMode;
