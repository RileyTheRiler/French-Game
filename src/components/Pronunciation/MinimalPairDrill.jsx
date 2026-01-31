import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, X, AlertCircle } from 'lucide-react';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { Button } from './ui/Button';
import SoundManager from '../utils/SoundManager';

const MinimalPairDrill = ({ onComplete, onExit }) => {
    const { vocabulary } = useVocabulary();
    const { addXP } = useProgress();
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [targetWordIndex, setTargetWordIndex] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('idle'); // idle, listening, checking, correct, wrong
    const recognitionRef = useRef(null);

    // Mock minimal pairs data (in real app, move to data file)
    const MINIMAL_PAIRS = [
        { pairs: [{ french: 'dessus', english: 'above' }, { french: 'dessous', english: 'below' }], diff: 'u vs ou' },
        { pairs: [{ french: 'pain', english: 'bread' }, { french: 'bain', english: 'bath' }], diff: 'p vs b' },
        { pairs: [{ french: 'poisson', english: 'fish' }, { french: 'poison', english: 'poison' }], diff: 's vs z' }
    ];

    const [currentPair, setCurrentPair] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);

    const loadNextPair = useCallback(() => {
        // Randomly select a pair and a target word from it
        const group = MINIMAL_PAIRS[Math.floor(Math.random() * MINIMAL_PAIRS.length)];
        const pair = group.pairs; // Array of 2 words
        const target = Math.random() > 0.5 ? 0 : 1;

        setCurrentPair(pair);
        setCurrentItem(pair[target]);
        setStatus('idle');
        setTranscript('');
    }, []);

    useEffect(() => {
        loadNextPair();
    }, [loadNextPair]);

    const handleCheck = useCallback((spoken) => {
        if (!currentItem) return;

        // Simple check
        if (spoken.includes(currentItem.french.toLowerCase())) {
            setStatus('correct');
            SoundManager.playSuccess();
            setTimeout(() => {
                onComplete(15);
                loadNextPair();
            }, 1500);
        } else {
            setStatus('wrong');
            SoundManager.playMiss();
        }
    }, [currentItem, loadNextPair, onComplete]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'fr-FR';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => setStatus('listening');
            recognitionRef.current.onend = () => {
                if (status === 'listening') setStatus('idle');
            };
            recognitionRef.current.onresult = (event) => {
                const result = event.results[0][0].transcript.toLowerCase().trim();
                setTranscript(result);
                handleCheck(result);
            };
        }
    }, [handleCheck, status]);

    const startListening = () => {
        setStatus('listening');
        recognitionRef.current?.start();
    };

    if (!currentItem) return <div>Loading...</div>;

    return (
        <div className="max-w-md mx-auto flex flex-col items-center gap-8 p-4">
            <div className="text-center">
                <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-2">Target Sound</h3>
                <div className="text-4xl font-black text-white mb-2">{currentItem.french}</div>
                <div className="text-indigo-400">{currentItem.english}</div>
            </div>

            <div className="flex gap-4">
                {currentPair.map((word, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${word.french === currentItem.french ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-800'} text-center w-32 opacity-50`}>
                        <div className="font-bold">{word.french}</div>
                    </div>
                ))}
            </div>

            <div className="h-32 flex flex-col items-center justify-center">
                {status === 'listening' && <div className="text-indigo-400 animate-pulse font-bold">Listening...</div>}
                {status === 'correct' && <div className="text-green-400 font-bold text-xl flex items-center gap-2"><Check /> Perfect match!</div>}
                {status === 'wrong' && (
                    <div className="text-center">
                        <div className="text-red-400 font-bold flex items-center gap-2 justify-center"><X /> Not quite</div>
                        <div className="text-slate-400 text-sm mt-1">Heard: "{transcript}"</div>
                    </div>
                )}
            </div>

            <Button
                onClick={startListening}
                disabled={status === 'listening' || status === 'correct'}
                className={`h-20 w-20 rounded-full flex items-center justify-center ${status === 'listening' ? 'bg-red-500' : 'bg-indigo-600'}`}
            >
                <Mic size={32} />
            </Button>
        </div>
    );
};

export default MinimalPairDrill;
