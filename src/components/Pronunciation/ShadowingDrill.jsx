import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Play, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getShadowingSession } from '../../data/shadowingData';
import { speak } from '../../utils/audio';
import AudioVisualizer from './AudioVisualizer';
import SoundManager from '../../utils/SoundManager';

const ShadowingDrill = ({ onExit, onComplete }) => {
    const [session, setSession] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userAudioUrl, setUserAudioUrl] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, recording, review, feedback

    // Audio Context
    const [audioContext, setAudioContext] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        setSession(getShadowingSession());
    }, []);

    const currentPhrase = session[currentIndex];

    // Cleanup
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
            if (audioContext) {
                audioContext.close();
            }
        };
    }, []);

    const initAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setMediaStream(stream);
            setAudioContext(ctx);
            return stream;
        } catch (err) {
            console.error("Audio init failed", err);
            return null;
        }
    };

    const playTarget = () => {
        if (!currentPhrase) return;
        speak(currentPhrase.french, 1);
    };

    const startRecording = async () => {
        let stream = mediaStream;
        if (!stream) {
            stream = await initAudio();
        }

        if (stream) {
            setUserAudioUrl(null);
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setUserAudioUrl(url);
                setStatus('review');
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setStatus('recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const playUserAudio = () => {
        if (userAudioUrl) {
            const audio = new Audio(userAudioUrl);
            audio.play();
        }
    };

    const handleNext = () => {
        if (currentIndex < session.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStatus('idle');
            setUserAudioUrl(null);
        } else {
            SoundManager.playLevelUp();
            onComplete(50); // XP reward
        }
    };

    if (!currentPhrase) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Progress */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8">
                <Button variant="ghost" onClick={onExit} className="text-slate-400 hover:text-white">
                    Exit Shadowing
                </Button>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                    Phrase {currentIndex + 1} / {session.length}
                </Badge>
            </div>

            {/* Content Card */}
            <Card className="w-full max-w-2xl bg-slate-900 border-white/10 p-8 flex flex-col items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20" />

                <div className="text-center space-y-4">
                    <Badge className="bg-white/5 border-white/10 text-slate-400 mb-2">
                        {currentPhrase.category} • {currentPhrase.difficulty}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        "{currentPhrase.french}"
                    </h2>
                    <p className="text-xl text-slate-400 italic">
                        {currentPhrase.english}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button onClick={playTarget} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 py-6 text-lg">
                        <Volume2 className="mr-2" /> Listen
                    </Button>
                </div>

                {/* Visualizer & Recording */}
                <div className="w-full h-32 bg-black/20 rounded-2xl border border-white/5 relative flex items-center justify-center overflow-hidden">
                    {mediaStream && audioContext ? (
                        <AudioVisualizer
                            isListening={isRecording}
                            audioContext={audioContext}
                            mediaStream={mediaStream}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-slate-500 gap-2">
                            <Activity size={24} />
                            <span className="text-sm">Spectrogram Ready</span>
                        </div>
                    )}
                </div>

                {/* Recording Controls */}
                <div className="flex items-center gap-6">
                    {!isRecording && status !== 'review' && (
                        <Button
                            onClick={startRecording}
                            className="bg-red-500 hover:bg-red-600 rounded-full w-20 h-20 shadow-red-500/50 shadow-lg"
                        >
                            <Mic size={32} />
                        </Button>
                    )}

                    {isRecording && (
                        <Button
                            onClick={stopRecording}
                            className="bg-slate-700 hover:bg-slate-600 rounded-full w-20 h-20 animate-pulse border-2 border-red-500"
                        >
                            <MicOff size={32} />
                        </Button>
                    )}

                    {status === 'review' && (
                        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <Button variant="outline" onClick={playUserAudio} className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 h-16 px-8">
                                <Play size={20} className="mr-2" /> Play My Recording
                            </Button>
                            <Button variant="ghost" onClick={() => setStatus('idle')}>
                                Retry
                            </Button>
                            <Button className="h-16 px-8 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleNext}>
                                Continue
                            </Button>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="text-slate-500 text-sm text-center max-w-md">
                    {status === 'idle' && "Listen to the phrase, then tap Record and repeat it immediately."}
                    {status === 'recording' && "Speak clearly..."}
                    {status === 'review' && "Listen to your recording. Does it sound like the original?"}
                </div>
            </Card>
        </div>
    );
};

export default ShadowingDrill;
