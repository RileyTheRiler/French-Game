/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIOS } from '../data/conversationScenarios';
import CallScreen from '../components/VoiceCall/CallScreen';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { speak } from '../utils/audio';
import { findBestMatch } from '../utils/textMatching';
import { useProgress } from '../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    // Select a random scenario for now, or could pass via location state
    // Defaulting to Restaurant for demo
    const [scenario, setScenario] = useState(SCENARIOS.find(s => s.id === 'restaurant_dinner'));
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [status, setStatus] = useState('Connecting...');
    const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);

    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition('fr-FR');

    // State machine for call flow: 'connecting' -> 'npc_speaking' -> 'listening' -> 'processing' -> 'ended'
    const [callState, setCallState] = useState('connecting');

    const currentNode = scenario.nodes[currentNodeId];

    // Definitions must be hoisted before usage in useEffect
    const handleSpeak = (text, onEnd) => {
        setCallState('npc_speaking');
        setIsNpcSpeaking(true);
        setStatus('Speaking...');

        // Simulating speech end for visualizer since web speech API doesn't have reliable 'onend' callback for TTS in all browsers or wrapper
        speak(text);

        const duration = Math.max(2000, text.length * 80);
        setTimeout(() => {
            setIsNpcSpeaking(false);
            if (onEnd) onEnd();
        }, duration);
    };

    const startListeningPhase = () => {
        setCallState('listening');
        setStatus('Listening...');
        resetTranscript();
        startListening();
    };

    const handleProcessInput = (input) => {
        stopListening();
        setCallState('processing');
        setStatus('Processing...');

        // Guard clause if currentNode or options are missing
        if (!currentNode || !currentNode.options) {
             console.warn("No current node or options for processing input");
             return;
        }

        const match = findBestMatch(input, currentNode.options);

        if (match && match.score > 0.4) {
            const option = match.option;

            if (option.isCorrect) {
                setStatus('Correct!');
                setTimeout(() => {
                    setCurrentNodeId(option.nextNode);
                }, 1000);
            } else {
                // Feedback then retry
                handleSpeak(option.feedback || "Je ne comprends pas.", () => {
                    startListeningPhase();
                });
            }
        } else {
            // No match found
            handleSpeak("Pardon ? Pouvez-vous répéter ?", () => {
                startListeningPhase();
            });
        }
    };

    // Effect: Handle Node Transitions
    useEffect(() => {
        if (!currentNode) return;

        // If node has 'end' flag
        if (currentNode.end) {
            const t = setTimeout(() => {
                handleSpeak(currentNode.message, () => {
                    setCallState('ended');
                    setStatus('Call Ended');
                    setTimeout(() => {
                        navigate('/'); // Go back to menu after delay
                        if (currentNode.success) addXP(scenario.xpReward);
                    }, 3000);
                });
            }, 0);
            return () => clearTimeout(t);
        }

        // Normal node: NPC speaks first (if message exists)
        const messageToSpeak = currentNodeId === 'start' ? scenario.initialMessage : currentNode.message;

        if (messageToSpeak) {
            const t = setTimeout(() => {
                setStatus('Speaking...');
                handleSpeak(messageToSpeak, () => {
                    // After speaking, start listening
                    startListeningPhase();
                });
            }, 0);
            return () => clearTimeout(t);
        } else {
            const t = setTimeout(() => {
                startListeningPhase();
            }, 0);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentNodeId, scenario]);

    // Effect: Check transcript for matches
    useEffect(() => {
        if (callState !== 'listening' || !transcript) return;

        // Debounce slightly to wait for user to finish sentence
        const timer = setTimeout(() => {
            handleProcessInput(transcript);
        }, 1500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, callState]);

    const handleToggleMic = () => {
        if (isListening) {
            stopListening();
        } else {
            startListeningPhase();
        }
    };

    const handleEndCall = () => {
        stopListening();
        navigate('/');
    };

    // Initial Connection Simulation
    useEffect(() => {
        // Just a dummy effect to ensure mounting logic if needed
        const timer = setTimeout(() => {
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <CallScreen
            npcName={scenario.initialSpeaker}
            isNpcSpeaking={isNpcSpeaking}
            isUserListening={isListening}
            transcript={transcript}
            status={status}
            onEndCall={handleEndCall}
            onToggleMic={handleToggleMic}
        />
    );
};

export default VoiceCall;
