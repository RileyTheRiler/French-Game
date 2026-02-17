import React, { useState, useEffect, useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const PROSODY_DRILLS = [
    {
        id: 'pd1',
        text: 'Bonjour, comment allez-vous ?',
        phonetic: 'bɔ̃.ʒuʁ kɔ.mɑ̃ ta.le vu',
        note: 'Rise at the end for the question.',
        audioUrl: null // In real app, would be a native recording
    },
    {
        id: 'pd2',
        text: 'Je voudrais une baguette, s\'il vous plaît.',
        phonetic: 'ʒə vu.dʁɛ yn ba.ɡɛt sil vu plɛ',
        note: 'Rhythmic groups: [Je voudrais] [une baguette] [s\'il vous plaît].',
        audioUrl: null
    },
    {
        id: 'pd3',
        text: 'C\'est la vie !',
        phonetic: 'sɛ la vi',
        note: 'Short, punchy, fatalistic.',
        audioUrl: null
    }
];

const ProsodyLab = () => {
    const [selectedDrill, setSelectedDrill] = useState(PROSODY_DRILLS[0]);
    const [isRecording, setIsRecording] = useState(false);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        return () => {
            if (isRecording) stopRecording();
        };
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-800 font-serif mb-2">
                    🎵 Prosody & Rhythm Lab
                </h2>
                <p className="text-slate-600">Don't just say it. Sing it like a native.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Drill List */}
                <div className="md:col-span-1 space-y-3">
                    {PROSODY_DRILLS.map(drill => (
                        <button
                            key={drill.id}
                            onClick={() => setSelectedDrill(drill)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${selectedDrill.id === drill.id
                                    ? 'bg-rose-50 border-2 border-rose-200 shadow-sm'
                                    : 'bg-white border border-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            <div className="font-bold text-slate-700">{drill.text}</div>
                            <div className="text-xs text-slate-400 font-mono mt-1">{drill.phonetic}</div>
                        </button>
                    ))}
                </div>

                {/* Main Visualizer Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        {/* Target Phrase Display */}
                        <div className="text-center mb-8 relative z-10">
                            <h3 className="text-3xl font-bold mb-2">{selectedDrill.text}</h3>
                            <p className="text-rose-300 font-mono text-lg">{selectedDrill.phonetic}</p>
                            <p className="text-slate-400 text-sm mt-4 italic">"{selectedDrill.note}"</p>
                        </div>

                        {/* Visualizer */}
                        <div className="h-32 bg-slate-800/50 rounded-xl mb-6 relative border border-slate-700 flex items-center justify-center">
                            {isRecording ? (
                                <AudioVisualizer
                                    isListening={isRecording}
                                    audioContext={audioContextRef.current}
                                    mediaStream={mediaStreamRef.current}
                                />
                            ) : (
                                <div className="text-slate-500 text-sm">Tap mic to see your voice rhythm</div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4 relative z-10">
                            <button className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                                🔊 Hear Native
                            </button>
                            <button
                                onClick={toggleRecording}
                                className={`p-6 rounded-full transition-all shadow-lg ${isRecording
                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                        : 'bg-rose-500 hover:bg-rose-600'
                                    }`}
                            >
                                <span className="text-2xl">{isRecording ? '⏹️' : 'mic'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Feedback Explanation */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-2">How to use</h4>
                        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                            <li>Listen to the native speaker first. Observe the "peaks" (stress) and "valleys".</li>
                            <li>Record yourself trying to match the <b>rhythm</b>, not just the sounds.</li>
                            <li>French has a "syllable-timed" rhythm, unlike English "stress-timed" rhythm.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProsodyLab;
