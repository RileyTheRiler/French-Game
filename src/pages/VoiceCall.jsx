import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, Volume2, User, Globe, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SoundManager from '../utils/SoundManager';
import { CALL_SCENARIOS } from '../data/voiceCallScenarios';
import { npcSystem } from '../systems/NPCSystem';

const VoiceCall = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();
    const [status, setStatus] = useState('connecting'); // connecting, connected, listening, processing, ended
    const [scenario, setScenario] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [callDuration, setCallDuration] = useState(0);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);
    const [callState, setCallState] = useState('idle'); // idle, ringing, connected, npc_speaking, listening, processing, ended
    const [error, setError] = useState(null);

    // Audio & Recognition Refs
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Select random scenario
        const randomScenario = CALL_SCENARIOS[Math.floor(Math.random() * CALL_SCENARIOS.length)];
        setScenario(randomScenario);
        setStatus('connecting');
        setCallState('ringing');

        // Simulate connection delay
        const timer = setTimeout(() => {
            setStatus('connected');
            setCallState('connected');
            SoundManager.playSuccess(); // Pickup sound
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let interval;
        if (callState === 'connected' || callState === 'listening' || callState === 'npc_speaking') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callState]);

    const handleSpeak = (text, onEnd) => {
        setCallState('npc_speaking');
        setIsNpcSpeaking(true);

        // Simple duration estimation for simulation if TTS fails or is simple
        const words = text.split(' ').length;
        const duration = Math.max(2000, words * 300);

        if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.9;
            utterance.onend = () => {
                setIsNpcSpeaking(false);
                if (onEnd) onEnd();
            };
            synthRef.current.speak(utterance);
        } else {
            // Fallback timeout
            setTimeout(() => {
                setIsNpcSpeaking(false);
                if (onEnd) onEnd();
            }, duration);
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !isListeningRef.current) {
            try {
                recognitionRef.current.start();
                isListeningRef.current = true;
            } catch (e) {
                console.error("Mic start error", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListeningRef.current) {
            recognitionRef.current.stop();
            isListeningRef.current = false;
        }
    };

    const resetTranscript = () => setTranscript('');

    const startListeningPhase = () => {
        setCallState('listening');
        setStatus('Listening...');
        resetTranscript();
        startListening();
    };

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'fr-FR';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognitionRef.current.onend = () => {
                isListeningRef.current = false;
                // Auto-restart if still in listening state (unless manually stopped)
                if (callState === 'listening') {
                    // check silence? For now just wait for effect to process
                }
            };
        } else {
            setError('Speech Recognition Not Supported');
        }
    }, [callState]);

    const handleProcessInput = (input) => {
        stopListening();
        setCallState('processing');
        setStatus('Thinking...');

        // Simulate AI processing
        setTimeout(async () => {
            // Check for match in current node options
            const currentNode = scenario.nodes[currentNodeId];
            let nextNodeId = null;
            let matchFound = false;

            // Simple keyword matching for prototype
            // In production, use vector embedding or fuzzy match util
            if (currentNode.options) {
                for (const option of currentNode.options) {
                    const keywords = option.keywords || [];
                    if (keywords.some(k => input.toLowerCase().includes(k.toLowerCase()))) {
                        nextNodeId = option.next;
                        matchFound = true;
                        break;
                    }
                }
            }

            if (!matchFound) {
                // Off-script handling via NPC System (mock)
                const offScript = await npcSystem.handleOffScript(input, scenario);
                if (offScript.correction) {
                    // Feedback logic here?
                }
                // For now, simple fallback or stay on node
                // If really stuck, maybe end call or repeat?
                handleSpeak("Je n'ai pas bien compris. Pouvez-vous répéter ?", () => {
                    startListeningPhase();
                });
                return;
            }

            if (nextNodeId) {
                setCurrentNodeId(nextNodeId);
            }
        }, 1000);
    };

    // Conversation Flow Logic
    useEffect(() => {
        if (!scenario || callState === 'ringing' || callState === 'ended') return;

        const currentNode = scenario.nodes[currentNodeId];

        if (callState === 'connected' || callState === 'processing') {
            // NPC Speaks current node message
            // If it's the start, we just connected.
            const messageToSpeak = currentNode.message;

            handleSpeak(messageToSpeak, () => {
                // After speaking, start listening
                startListeningPhase();
            });
        }

        // If node has 'end' flag
        if (currentNode.end) {
            handleSpeak(currentNode.message, () => {
                setCallState('ended');
                setStatus('Call Ended');
                setTimeout(() => {
                    navigate('/');
                    addXP(50); // Reward
                }, 3000);
            });
        }

    }, [currentNodeId, scenario]); // Removing callState from dependency to avoid loop, managed by flow

    // Effect: Check transcript for matches
    useEffect(() => {
        if (callState !== 'listening' || !transcript) return;

        // Debounce slightly to wait for user to finish sentence
        const timer = setTimeout(() => {
            handleProcessInput(transcript);
        }, 1500);

        return () => clearTimeout(timer);

    }, [transcript, callState]);

    const handleToggleMic = () => {
        if (callState === 'listening') {
            stopListening();
            setCallState('idle'); // Pause?
        } else {
            startListeningPhase();
        }
    };

    const handleEndCall = () => {
        stopListening();
        setCallState('ended');
        setStatus('Call Ended');
        setTimeout(() => navigate('/'), 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <GameLayout title="Voice Call" onBack={() => navigate('/')}>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center p-8 bg-red-500/10 border border-red-500/30 rounded-2xl">
                        <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                        <p className="text-red-200">{error}</p>
                    </div>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout title="Voice Call" onBack={() => navigate('/')}>
            <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] max-w-md mx-auto">

                {/* Caller Profile */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mx-auto mb-6 relative"
                    >
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            {scenario?.avatar ? (
                                <img src={scenario.avatar} alt="Caller" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-slate-400" />
                            )}
                        </div>

                        {/* Status Indicator */}
                        <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-slate-900 ${
                            status === 'connected' ? 'bg-emerald-500' :
                            status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                        }`} />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white mb-2">{scenario?.callerName || 'Unknown Caller'}</h2>
                    <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
                        {status === 'connecting' ? 'Calling...' : formatTime(callDuration)}
                        {status === 'connected' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                    </p>
                </div>

                {/* Waveform / Visualizer Placeholder */}
                <div className="w-full h-24 mb-12 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: isNpcSpeaking ? [10, 40, 10] : 10,
                                opacity: isNpcSpeaking ? 1 : 0.3
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.5,
                                delay: i * 0.1
                            }}
                            className="w-3 bg-indigo-400 rounded-full"
                        />
                    ))}
                </div>

                {/* Transcription Preview (Subtitles) */}
                <AnimatePresence>
                    {(transcript || isNpcSpeaking) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-12 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 max-w-sm w-full text-center"
                        >
                            <p className="text-lg font-medium text-slate-200">
                                {isNpcSpeaking ? "speaking..." : `"${transcript}"`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <Button
                        variant="secondary"
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            callState === 'listening' ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'
                        }`}
                        onClick={handleToggleMic}
                    >
                        {callState === 'listening' ? <MicOff size={24} /> : <Mic size={24} />}
                    </Button>

                    <Button
                        variant="destructive"
                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 hover:scale-105 transition-transform"
                        onClick={handleEndCall}
                    >
                        <Phone size={32} className="rotate-[135deg]" />
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800 text-white"
                        onClick={() => {/* Toggle Speaker */}}
                    >
                        <Volume2 size={24} />
                    </Button>
                </div>

            </div>
        </GameLayout>
    );
};

export default VoiceCall;
