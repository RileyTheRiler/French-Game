import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Square, RefreshCcw } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import SoundManager from '../../utils/SoundManager';
import { analyzePronunciation } from '../../services/PronunciationAnalyzer';

const ProsodyLab = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [targetPhrase] = useState("Je voudrais un café, s'il vous plaît.");

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]); // Added dependency

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                analyzeAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const analyzeAudio = async (blob) => {
        // Mock analysis for now
        const result = await analyzePronunciation(blob, targetPhrase);
        setAnalysis(result);
        if (result.score > 80) {
            SoundManager.playSuccess();
            addXP(20);
        }
    };

    const playRecording = () => {
        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    return (
        <GameLayout title="Prosody Lab" onBack={() => navigate('/')}>
            <div className="max-w-2xl mx-auto p-4 flex flex-col items-center gap-8">
                <Card className="p-8 w-full text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">"{targetPhrase}"</h2>
                    <p className="text-slate-400 mb-8">Focus on the rising intonation at the end.</p>

                    <div className="flex justify-center gap-4 mb-8">
                        {!isRecording ? (
                            <Button
                                onClick={startRecording}
                                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                            >
                                <Mic size={32} />
                            </Button>
                        ) : (
                            <Button
                                onClick={stopRecording}
                                className="h-20 w-20 rounded-full bg-slate-700 hover:bg-slate-600 animate-pulse"
                            >
                                <Square size={32} />
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => SoundManager.playSuccess()} disabled={!audioBlob}>
                            <Play size={20} className="mr-2" onClick={playRecording} /> Play My Recording
                        </Button>
                        <Button variant="ghost" onClick={() => { setAudioBlob(null); setAnalysis(null); }}>
                            <RefreshCcw size={20} /> Reset
                        </Button>
                    </div>
                </Card>

                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <Card className="p-6 bg-slate-800 border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">Analysis Result</h3>
                                    <span className={`text-2xl font-black ${analysis.score > 80 ? 'text-green-400' : 'text-amber-400'}`}>
                                        {analysis.score}%
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-900 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        className={`h-full ${analysis.score > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysis.score}%` }}
                                    />
                                </div>
                                <p className="text-slate-300">{analysis.feedback}</p>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
};

export default ProsodyLab;
