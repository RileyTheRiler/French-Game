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

    // Wrap in useCallback to avoid dependency cycles
    const handleSpeak = React.useCallback((text, onEnd) => {
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

    const startListeningPhase = React.useCallback(() => {
        setCallState('listening');
        setStatus('Listening...');
        resetTranscript();
        startListening();
    }, [resetTranscript, startListening]);

    const handleProcessInput = React.useCallback((input) => {
        stopListening();
        setCallState('processing');
        setStatus('Processing...');

        // Guard against race conditions where currentNode might be outdated or null
        if (!currentNode) return;

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
    }, [currentNode, handleSpeak, startListeningPhase, stopListening]);

    // Effect: Handle Node Transitions
    useEffect(() => {
        if (!currentNode) return;

        let isMounted = true;

        // If node has 'end' flag
        if (currentNode.end) {
            // Wrap in timeout to avoid synchronous state update during render
            const timer = setTimeout(() => {
                if (!isMounted) return;
                handleSpeak(currentNode.message, () => {
                    if (!isMounted) return;
                    setCallState('ended');
                    setStatus('Call Ended');
                    setTimeout(() => {
                        if (!isMounted) return;
                        navigate('/'); // Go back to menu after delay
                        if (currentNode.success) addXP(scenario.xpReward);
                    }, 3000);
                });
            }, 0);
            return () => { isMounted = false; clearTimeout(timer); };
        }

        // Normal node: NPC speaks first (if message exists)
        const messageToSpeak = currentNodeId === 'start' ? scenario.initialMessage : currentNode.message;

        if (messageToSpeak) {
            const timer = setTimeout(() => {
                if (!isMounted) return;
                setStatus('Speaking...');
                handleSpeak(messageToSpeak, () => {
                    if (!isMounted) return;
                    // After speaking, start listening
                    startListeningPhase();
                });
            }, 0);
            return () => { isMounted = false; clearTimeout(timer); };
        } else {
            // No message (rare), just listen
            const timer = setTimeout(() => {
                if (!isMounted) return;
                startListeningPhase();
            }, 0);
            return () => { isMounted = false; clearTimeout(timer); };
        }

    }, [currentNode, currentNodeId, scenario, handleSpeak, startListeningPhase, navigate, addXP]);

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
