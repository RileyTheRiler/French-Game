import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = (lang = 'fr-FR') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            // Avoid setting state synchronously during effect execution if possible
            setTimeout(() => {
                setError('Speech Recognition Not Supported');
            }, 0);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Capture one sentence at a time
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = lang;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setTranscript(event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            // Ignore "no-speech" errors as they are common when user pauses
            if (event.error !== 'no-speech') {
                setError(event.error);
            }
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

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

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        error,
        resetTranscript: () => setTranscript('')
    };
};

export default useSpeechRecognition;
