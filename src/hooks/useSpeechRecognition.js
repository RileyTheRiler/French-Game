import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = (lang = 'fr-FR') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    // Initial check for support and instance creation
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            // Use setTimeout to avoid setting state during render/mount if synchronous
            setTimeout(() => setError('Speech Recognition Not Supported'), 0);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Capture one sentence at a time
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setTranscript(event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            // Ignore "no-speech" errors as they are common when user pauses
            if (event.error !== 'no-speech') {
                setError(event.error);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [lang]);

    const startListening = useCallback(() => {
        setTranscript('');
        setError(null);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        error,
        resetTranscript
    };
};

export default useSpeechRecognition;
