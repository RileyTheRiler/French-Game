import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, User } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Button } from '../components/ui/Button';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { analyzeResponse } from '../utils/ConversationAnalyzer';
import { getScenario } from '../systems/NPCSystem';

const VoiceCall = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const { startListening, stopListening, isListening, transcript, resetTranscript } = useSpeechRecognition();

    const [status, setStatus] = useState('Connecting...');
    const [callState, setCallState] = useState('connecting'); // connecting, npc_speaking, listening, processing, ended
    const [scenario] = useState(getScenario('cafe_order'));
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);

    // Get current node
    const currentNode = scenario.nodes[currentNodeId];

    const handleSpeak = useCallback((text, onEnd) => {
        setCallState('npc_speaking');
        setIsNpcSpeaking(true);
        setStatus('Speaking...');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;

        utterance.onend = () => {
            setIsNpcSpeaking(false);
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);

        // Fallback for long text or if onend doesn't fire (browser quirk safety)
        const duration = (text.split(' ').length / 2) * 1000 + 1000;
        setTimeout(() => {
            if (window.speechSynthesis.speaking) {
                // Let it finish naturally
            } else {
                // Force state update if event missed
                setIsNpcSpeaking(false);
                if (onEnd) onEnd(); // We don't check callState here strictly to ensure progress
            }
        }, duration);
    }, []);

    const startListeningPhase = useCallback(() => {
        setCallState('listening');
        setStatus('Listening...');
        resetTranscript();
        startListening();
    }, [resetTranscript, startListening]);

    const handleProcessInput = useCallback((input) => {
        stopListening();
        setCallState('processing');
        setStatus('Thinking...');

        // Analyze input against expected options
        const analysis = analyzeResponse(input, currentNode);

        // eslint-disable-next-line no-unused-vars
        const userMessage = { sender: 'user', text: input };

        if (analysis.isMatch) {
            addXP(10);
            setCurrentNodeId(analysis.nextNodeId);
        } else {
            // Retry logic or hint? For now, stay on node or go to fallback
            // Simple retry loop for MVP
            handleSpeak("Je n'ai pas compris. Pouvez-vous répéter ?", () => {
                startListeningPhase();
            });
        }
    }, [currentNode, stopListening, addXP, handleSpeak, startListeningPhase]);

    // Main Conversation Flow Effect
    useEffect(() => {
        if (!scenario || !currentNode) return;

        // If it's a new node (or start), NPC speaks
        // Wait a moment for "connection"
        const delay = callState === 'connecting' ? 1500 : 500;

        const timer = setTimeout(() => {
            // If node has 'end' flag
            if (currentNode.end) {
                handleSpeak(currentNode.message, () => {
                    setCallState('ended');
                    setStatus('Call Ended');
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                });
                return;
            }

            handleSpeak(currentNode.message, () => {
                // After speaking, start listening
                startListeningPhase();
            });
        }, delay);

        return () => clearTimeout(timer);
    }, [currentNodeId, scenario, currentNode, handleSpeak, startListeningPhase, callState, navigate]);

    // Effect: Check transcript for matches
    useEffect(() => {
        if (callState !== 'listening' || !transcript) return;

        // Debounce slightly to wait for user to finish sentence
        const timer = setTimeout(() => {
            handleProcessInput(transcript);
        }, 1500);

        return () => clearTimeout(timer);
    }, [transcript, callState, handleProcessInput]);

    const handleToggleMic = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleHangup = () => {
        window.speechSynthesis.cancel();
        stopListening();
        navigate('/');
    };

    return (
        <GameLayout
            title="Voice Call"
            onBack={handleHangup}
            className="bg-slate-900"
        >
            <div className="max-w-md mx-auto h-[80vh] flex flex-col justify-between p-4">

                {/* Caller Info */}
                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shadow-2xl relative overflow-hidden">
                        {scenario?.npcAvatar ? (
                            <img src={scenario.npcAvatar} alt="NPC" className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-slate-500" />
                        )}

                        {/* Speaking Wave Animation */}
                        {isNpcSpeaking && (
                            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse rounded-full" />
                        )}
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{scenario?.npcName || 'Unknown Caller'}</h2>
                        <p className={`text-sm font-medium ${callState === 'ended' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {status}
                        </p>
                    </div>
                </div>

                {/* Live Transcript / Feedback */}
                <div className="flex-1 flex flex-col justify-center items-center p-4">
                    <AnimatePresence mode="wait">
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center"
                            >
                                <p className="text-slate-400 text-sm mb-2">You said:</p>
                                <p className="text-white text-xl font-medium">"{transcript}"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6 mb-8">
                    <Button
                        onClick={handleToggleMic}
                        className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}
                        disabled={callState !== 'listening'}
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </Button>

                    <Button
                        onClick={handleHangup}
                        className="h-16 w-16 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30"
                    >
                        <Phone size={28} className="rotate-[135deg]" />
                    </Button>
                </div>

            </div>
        </GameLayout>
    );
};

export default VoiceCall;
