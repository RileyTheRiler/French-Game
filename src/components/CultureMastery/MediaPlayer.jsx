import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Settings, Subtitles, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const MediaPlayer = ({ clip, onQuizStart }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [subMode, setSubMode] = useState('bilingual'); // french, english, bilingual

    const containerRef = useRef(null);
    const timerRef = useRef(null);

    // Mock video playback
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= clip.duration) {
                        setIsPlaying(false);
                        return clip.duration;
                    }
                    return prev + (0.1 * playbackSpeed);
                });
            }, 100);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, clip.duration, playbackSpeed]);

    const currentSub = clip.transcript.findLast(t => t.time <= currentTime) || clip.transcript[0];

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6" ref={containerRef}>
            {/* Video Area (Mock) */}
            <Card className="relative aspect-video overflow-hidden bg-black border-slate-700 shadow-2xl">
                {/* Mock Visuals */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-slate-900">
                    <motion.div
                        animate={{
                            scale: isPlaying ? [1, 1.02, 1] : 1,
                            opacity: isPlaying ? 0.8 : 0.4
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Zap size={120} className="text-indigo-500/30" />
                    </motion.div>
                </div>

                {/* Subtitle Overlay */}
                {showSubtitles && (
                    <div className="absolute bottom-16 left-0 right-0 p-6 flex flex-col items-center justify-center text-center">
                        <motion.div
                            key={currentSub?.time}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            {(subMode === 'french' || subMode === 'bilingual') && (
                                <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] bg-black/40 px-4 py-1 rounded-lg">
                                    {currentSub?.french}
                                </p>
                            )}
                            {(subMode === 'english' || subMode === 'bilingual') && (
                                <p className="text-lg md:text-xl text-slate-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] bg-black/40 px-4 py-1 rounded-lg inline-block">
                                    {currentSub?.english}
                                </p>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* Video Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-700 rounded-full mb-4 cursor-pointer relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-indigo-500"
                            style={{ width: `${(currentTime / clip.duration) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="text-white hover:bg-white/10"
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentTime(0)}
                                className="text-white hover:bg-white/10"
                            >
                                <RotateCcw size={18} />
                            </Button>
                            <span className="text-xs text-slate-300 font-mono">
                                {formatTime(currentTime)} / {formatTime(clip.duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPlaybackSpeed(s => s === 1 ? 0.75 : s === 0.75 ? 1.25 : 1)}
                                className="text-xs font-bold text-white hover:bg-white/10"
                            >
                                {playbackSpeed}x
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSubtitles(!showSubtitles)}
                                className={`text-white hover:bg-white/10 ${!showSubtitles ? 'opacity-50' : ''}`}
                            >
                                <Subtitles size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Info and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="primary">{clip.difficulty}</Badge>
                        <Badge variant="outline">{clip.category}</Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{clip.title}</h2>
                    <p className="text-slate-400">{clip.titleEn}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {clip.vocabularyHighlights.map(word => (
                            <Badge
                                key={word}
                                variant="ghost"
                                className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
                            >
                                <Volume2 size={12} className="mr-1" />
                                {word}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <Card className="p-6 bg-slate-800/60 border-indigo-500/30">
                        <h3 className="font-bold text-white mb-2">Comprehension Quiz</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Test your listening skills and earn <b>{clip.xpReward} XP</b>.
                        </p>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-500"
                            onClick={onQuizStart}
                            disabled={currentTime < clip.duration * 0.5} // Must watch half
                        >
                            Start Quiz
                            {currentTime < clip.duration * 0.5 && (
                                <span className="block text-[10px] opacity-70">Watch 50% to unlock</span>
                            )}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MediaPlayer;
