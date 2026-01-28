import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIOS } from '../data/conversationScenarios';
import CallScreen from '../components/VoiceCall/CallScreen';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { speak } from '../utils/audio';
import { findBestMatch } from '../utils/textMatching';
import { useProgress } from '../context/ProgressContext';

const VoiceCall = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    // Select a random scenario for now, or could pass via location state
    // Defaulting to Restaurant for demo
    const [scenario] = useState(SCENARIOS.find(s => s.id === 'restaurant_dinner'));
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [status, setStatus] = useState('Connecting...');
    const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);

    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition('fr-FR');

    // State machine for call flow: 'connecting' -> 'npc_speaking' -> 'listening' -> 'processing' -> 'ended'
    const [callState, setCallState] = useState('connecting');

    const currentNode = scenario.nodes[currentNodeId];

    // Define handlers before effects to avoid hoisting issues
    const handleSpeak = useCallback((text, onEnd) => {
        setCallState('npc_speaking');
        setIsNpcSpeaking(true);
        setStatus('Speaking...');

        speak(text);

        const duration = Math.max(2000, text.length * 80);
        setTimeout(() => {
            setIsNpcSpeaking(false);
            if (onEnd) onEnd();
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
        setStatus('Processing...');

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
    }, [currentNode, stopListening, handleSpeak, startListeningPhase]);

    // Effect: Handle Node Transitions
    useEffect(() => {
        if (!currentNode) return;

        // If node has 'end' flag
        if (currentNode.end) {
            setTimeout(() => {
                handleSpeak(currentNode.message, () => {
                    setCallState('ended');
                    setStatus('Call Ended');
                    setTimeout(() => {
                        navigate('/'); // Go back to menu after delay
                        if (currentNode.success) addXP(scenario.xpReward);
                    }, 3000);
                });
            }, 0);
            return;
        }

        // Normal node: NPC speaks first (if message exists)
        const messageToSpeak = currentNodeId === 'start' ? scenario.initialMessage : currentNode.message;

        if (messageToSpeak) {
            setTimeout(() => {
                setStatus('Speaking...');
                handleSpeak(messageToSpeak, () => {
                    // After speaking, start listening
                    startListeningPhase();
                });
            }, 0);
        } else {
            // No message (rare), just listen
            setTimeout(() => {
                startListeningPhase();
            }, 0);
        }

    }, [currentNodeId, scenario, currentNode, handleSpeak, startListeningPhase, navigate, addXP]);

    // Effect: Check transcript for matches
    useEffect(() => {
        if (callState !== 'listening' || !transcript) return;

        // Debounce slightly to wait for user to finish sentence
        const timer = setTimeout(() => {
            handleProcessInput(transcript);
        }, 1500);

        return () => clearTimeout(timer);
    }, [transcript, callState, handleProcessInput]);

    const handleToggleMic = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListeningPhase();
        }
    }, [isListening, stopListening, startListeningPhase]);

    const handleEndCall = useCallback(() => {
        stopListening();
        navigate('/');
    }, [stopListening, navigate]);

    // Initial Connection Simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            // Start the interaction
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
