import React, { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, Sliders, Award, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { speak } from '../../utils/audio';
import SoundManager from '../../utils/SoundManager';
import { useVocabulary } from '../../context/VocabularyContext';
import { useProgress } from '../../context/ProgressContext';
import { analyzeRhythm } from '../../services/PronunciationAnalyzer';

/**
 * RhythmTrainer - Practice French speech rhythm and timing
 * 
 * Features:
 * - Visual beat timeline showing syllables as blocks
 * - Native audio playback with synchronized visual guides
 * - User recording with waveform comparison
 * - Tempo control slider
 * - Score based on timing accuracy
 */
const RhythmTrainer = ({ onComplete, onExit }) => {
    const { vocabulary } = useVocabulary();
    const { addXP } = useProgress();

    // Session state
    const [sessionWords, setSessionWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [status, setStatus] = useState('ready'); // ready, playing, recording, analyzing, result
    const [totalScore, setTotalScore] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);

    // Audio/Recording state
    const [tempo, setTempo] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [lastResult, setLastResult] = useState(null);

    // Animation state
    const [activeBeat, setActiveBeat] = useState(-1);
    const [beatProgress, setBeatProgress] = useState(0);

    // Refs
    const recordingStartRef = useRef(null);
    const animationRef = useRef(null);
    const utteranceRef = useRef(null);

    // Initialize session with rhythm-friendly words
    useEffect(() => {
        const rhythmWords = vocabulary
            .filter(w => w.french.length >= 3 && !w.french.includes(' '))
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
            .map(w => ({
                ...w,
                syllables: estimateSyllables(w.french),
                expectedDuration: estimateDuration(w.french)
            }));
        setSessionWords(rhythmWords);
    }, [vocabulary]);

    const currentWord = sessionWords[currentIndex];

    /**
     * Estimate syllables from French text
     */
    function estimateSyllables(text) {
        const vowelGroups = text.match(/[aeiouyàâäéèêëïîôùûü]+/gi) || [];
        const syllables = [];
        let remaining = text.toLowerCase();

        for (let i = 0; i < vowelGroups.length; i++) {
            const vowel = vowelGroups[i].toLowerCase();
            const idx = remaining.indexOf(vowel);

            if (idx > 0) {
                // Include preceding consonants
                syllables.push(remaining.slice(0, idx + vowel.length));
            } else {
                syllables.push(vowel);
            }
            remaining = remaining.slice(idx + vowel.length);
        }

        // Add any trailing consonants to last syllable
        if (remaining && syllables.length > 0) {
            syllables[syllables.length - 1] += remaining;
        }

        return syllables.length > 0 ? syllables : [text];
    }

    /**
     * Estimate expected duration in ms based on syllable count
     */
    function estimateDuration(text) {
        const syllables = estimateSyllables(text);
        // ~300ms per syllable at normal speed
        return syllables.length * 300;
    }

    /**
     * Play the target word with visual beat sync
     */
    const playWithBeats = useCallback(() => {
        if (!currentWord) return;

        setStatus('playing');
        setIsPlaying(true);
        setActiveBeat(0);
        setBeatProgress(0);

        const syllables = currentWord.syllables;
        const msPerSyllable = (currentWord.expectedDuration / syllables.length) / tempo;
        let beatIndex = 0;

        // Start TTS
        speak(currentWord.french, tempo);

        // Animate beats
        const animateBeats = () => {
            beatIndex++;
            if (beatIndex < syllables.length) {
                setActiveBeat(beatIndex);
                animationRef.current = setTimeout(animateBeats, msPerSyllable);
            } else {
                setIsPlaying(false);
                setActiveBeat(-1);
                setStatus('ready');
            }
        };

        animationRef.current = setTimeout(animateBeats, msPerSyllable);

        // Progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 50 / (currentWord.expectedDuration / tempo);
            setBeatProgress(Math.min(progress, 100));
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 50);

    }, [currentWord, tempo]);

    /**
     * Start recording user attempt
     */
    const startRecording = useCallback(() => {
        if (!currentWord) return;

        setStatus('recording');
        setIsRecording(true);
        recordingStartRef.current = Date.now();
        setActiveBeat(0);

        // Visual beat hints during recording
        const syllables = currentWord.syllables;
        const msPerSyllable = (currentWord.expectedDuration / syllables.length) / tempo;
        let beatIndex = 0;

        const animateBeats = () => {
            beatIndex++;
            if (beatIndex < syllables.length) {
                setActiveBeat(beatIndex);
                animationRef.current = setTimeout(animateBeats, msPerSyllable);
            } else {
                setActiveBeat(-1);
            }
        };

        animationRef.current = setTimeout(animateBeats, msPerSyllable);

    }, [currentWord, tempo]);

    /**
     * Stop recording and analyze timing
     */
    const stopRecording = useCallback(() => {
        if (!isRecording || !currentWord) return;

        clearTimeout(animationRef.current);
        setIsRecording(false);
        setActiveBeat(-1);

        const duration = Date.now() - recordingStartRef.current;
        setRecordingDuration(duration);
        setStatus('analyzing');

        // Analyze rhythm
        setTimeout(() => {
            const result = analyzeRhythm(currentWord, duration, currentWord.expectedDuration / tempo);
            setLastResult(result);
            setTotalScore(prev => prev + result.rhythmScore);
            setStatus('result');

            if (result.rhythmScore >= 80) {
                SoundManager.playSuccess();
            } else {
                SoundManager.playMiss();
            }
        }, 500);

    }, [isRecording, currentWord, tempo]);

    /**
     * Move to next word
     */
    const handleNext = () => {
        if (currentIndex < sessionWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStatus('ready');
            setLastResult(null);
        } else {
            // Session complete
            const avgScore = Math.round(totalScore / sessionWords.length);
            const xpReward = Math.round(avgScore / 2);
            addXP(xpReward);
            setSessionComplete(true);
            SoundManager.playLevelUp();
            if (onComplete) onComplete(xpReward);
        }
    };

    /**
     * Retry current word
     */
    const handleRetry = () => {
        setStatus('ready');
        setLastResult(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, []);

    if (sessionWords.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400">Loading rhythm exercises...</div>
            </div>
        );
    }

    if (sessionComplete) {
        const avgScore = Math.round(totalScore / sessionWords.length);
        return (
            <Card className="max-w-2xl mx-auto p-8 text-center bg-slate-900 border-white/10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-6 p-6 bg-indigo-500/20 rounded-full inline-block"
                >
                    <Award size={64} className="text-indigo-400" />
                </motion.div>
                <h2 className="text-4xl font-black mb-4 title-gradient">Rhythm Training Complete!</h2>
                <p className="text-slate-400 mb-6">You're developing a natural French speaking rhythm.</p>

                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                    <div className="text-slate-400 text-sm uppercase tracking-wide mb-2">Average Score</div>
                    <div className="text-5xl font-black text-indigo-400">{avgScore}%</div>
                </div>

                <Button size="lg" onClick={onExit}>
                    Return to Practice
                </Button>
            </Card>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto p-6 bg-slate-900 border-white/10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Badge variant="outline" className="text-slate-400">
                    Word {currentIndex + 1} / {sessionWords.length}
                </Badge>
                <div className="flex items-center gap-3">
                    <Sliders size={16} className="text-slate-500" />
                    <span className="text-slate-400 text-sm">Tempo:</span>
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={tempo}
                        onChange={(e) => setTempo(parseFloat(e.target.value))}
                        className="w-24 accent-indigo-500"
                    />
                    <span className="text-slate-300 font-mono text-sm w-10">{tempo}x</span>
                </div>
            </div>

            {/* Target Word Display */}
            <div className="text-center mb-8">
                <div className="text-6xl font-black text-white mb-2">
                    {currentWord?.french}
                </div>
                <div className="text-xl text-slate-400 italic">
                    {currentWord?.english}
                </div>
            </div>

            {/* Beat Timeline */}
            <div className="mb-8">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <AnimatePresence>
                        {currentWord?.syllables.map((syllable, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0.8, opacity: 0.5 }}
                                animate={{
                                    scale: activeBeat === index ? 1.2 : 1,
                                    opacity: activeBeat === index ? 1 : 0.6,
                                    backgroundColor: activeBeat === index ? 'rgb(99, 102, 241)' : 'rgb(51, 65, 85)'
                                }}
                                className="px-4 py-3 rounded-xl font-bold text-white transition-all"
                            >
                                {syllable}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${beatProgress}%` }}
                        animate={{ width: `${beatProgress}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
                {/* Listen Button */}
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={playWithBeats}
                    disabled={isPlaying || isRecording}
                    className="px-6"
                >
                    {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
                    <span className="ml-2">Listen</span>
                </Button>

                {/* Record Button */}
                <Button
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isPlaying || status === 'analyzing' || status === 'result'}
                    className={`px-8 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                >
                    {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                    <span className="ml-2">{isRecording ? 'Stop' : 'Record'}</span>
                </Button>
            </div>

            {/* Instructions / Status */}
            <div className="text-center text-slate-400 mb-6 h-8">
                {status === 'ready' && 'Listen to the rhythm, then record yourself matching the timing.'}
                {status === 'playing' && 'Pay attention to the syllable timing...'}
                {status === 'recording' && 'Speak now! Follow the beat indicators.'}
                {status === 'analyzing' && 'Analyzing your rhythm...'}
            </div>

            {/* Result Display */}
            <AnimatePresence>
                {status === 'result' && lastResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-slate-400 text-sm uppercase tracking-wide">Rhythm Score</div>
                                <div className={`text-4xl font-black ${lastResult.rhythmScore >= 80 ? 'text-emerald-400' :
                                    lastResult.rhythmScore >= 60 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {lastResult.rhythmScore}%
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold ${lastResult.tempoRatio >= 0.9 && lastResult.tempoRatio <= 1.1
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : lastResult.tempoRatio < 0.9
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {lastResult.tempoRatio < 0.9 ? '⚡ Fast' :
                                    lastResult.tempoRatio > 1.1 ? '🐢 Slow' : '✨ Perfect timing'}
                            </div>
                        </div>

                        <p className="text-slate-300 mb-4">{lastResult.rhythmFeedback}</p>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={handleRetry} className="flex-1">
                                <RotateCcw size={16} className="mr-2" />
                                Try Again
                            </Button>
                            <Button onClick={handleNext} className="flex-1">
                                {currentIndex < sessionWords.length - 1 ? (
                                    <>
                                        Next <ArrowRight size={16} className="ml-2" />
                                    </>
                                ) : (
                                    'Complete'
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default RhythmTrainer;
