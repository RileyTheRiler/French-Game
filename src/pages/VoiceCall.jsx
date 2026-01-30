import React, { useState, useEffect } from 'react';
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

    // Hoist helper functions to avoid reference errors
    const startListeningPhase = () => {
        setCallState('listening');
        setStatus('Listening...');
        resetTranscript();
        startListening();
    };

    const handleSpeak = (text, onEnd) => {
        setCallState('npc_speaking');
        setIsNpcSpeaking(true);
        setStatus('Speaking...');

        // Simulating speech end for visualizer since web speech API doesn't have reliable 'onend' callback for TTS in all browsers or wrapper
        // We use a rough estimation of time: 100ms per character?
        // OR better: speak() function in utils/audio is fire and forget. 
        // For a hack, let's assume average reading speed.
        speak(text);

        const duration = Math.max(2000, text.length * 80);
        setTimeout(() => {
            setIsNpcSpeaking(false);
            if (onEnd) onEnd();
        }, duration);
    };

    const handleProcessInput = (input) => {
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
    };

    // Effect: Handle Node Transitions
    useEffect(() => {
        if (!currentNode) return;

        // If node has 'end' flag
        if (currentNode.end) {
            handleSpeak(currentNode.message, () => {
                setCallState('ended');
                setStatus('Call Ended');
                setTimeout(() => {
                    navigate('/'); // Go back to menu after delay
                    if (currentNode.success) addXP(scenario.xpReward);
                }, 3000);
            });
            return;
        }

        // Normal node: NPC speaks first (if message exists)
        // Note: 'start' node might not have a message if it's the very beginning,
        // usually scenario.initialMessage is for the beginning.

        const messageToSpeak = currentNodeId === 'start' ? scenario.initialMessage : currentNode.message;

        if (messageToSpeak) {
            setStatus('Speaking...');
            handleSpeak(messageToSpeak, () => {
                // After speaking, start listening
                startListeningPhase();
            });
        } else {
            // No message (rare), just listen
            startListeningPhase();
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
        const timer = setTimeout(() => {
            // Start the interaction
            // Trigger the effect by ensuring ID is set (already 'start') 
            // but we need to trigger the initial message logic.
            // We can force a re-eval or just rely on mount.
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
