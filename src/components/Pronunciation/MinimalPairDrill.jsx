import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Mic, MicOff, Volume2, ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { MINIMAL_PAIRS } from '../../data/minimalPairs';
import { speak } from '../../utils/audio';
import SoundManager from '../../utils/SoundManager';
import MouthShapeVisualizer from './MouthShapeVisualizer';

const MinimalPairDrill = ({ onComplete, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [targetWordIndex, setTargetWordIndex] = useState(0); // 0 or 1 (which word of the pair is target)

    // Flatten pairs for the session? Or just pick random ones.
    // Let's create a session queue.
    const [sessionQueue, setSessionQueue] = useState([]);

    useEffect(() => {
        // Create a random queue of 5 drills
        const queue = [];
        for (let i = 0; i < 5; i++) {
            const group = MINIMAL_PAIRS[Math.floor(Math.random() * MINIMAL_PAIRS.length)];
            const pair = group.pairs[Math.floor(Math.random() * group.pairs.length)];
            const target = Math.random() > 0.5 ? 0 : 1;
            queue.push({ group, pair, targetIdx: target });
        }
        setSessionQueue(queue);
    }, []);

    const [status, setStatus] = useState('idle'); // idle, listening, success, fail, wrong-pair
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef(null);

    const currentItem = sessionQueue[currentIndex];
    const targetWord = currentItem ? (currentItem.targetIdx === 0 ? currentItem.pair.word1 : currentItem.pair.word2) : '';
    const otherWord = currentItem ? (currentItem.targetIdx === 0 ? currentItem.pair.word2 : currentItem.pair.word1) : '';

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'fr-FR';
            recognitionRef.current.interimResults = false;
            recognitionRef.current.maxAlternatives = 1;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);

            recognitionRef.current.onresult = (event) => {
                const result = event.results[0][0].transcript.toLowerCase().trim();
                setTranscript(result);
                handleCheck(result);
            };
        }
    }, [currentItem]); // Re-bind if needed, or just once.

    const handleCheck = (spoken) => {
        if (!currentItem) return;

        const target = targetWord.toLowerCase();
        const other = otherWord.toLowerCase();

        // Simple normalization
        const norm = (s) => s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const spokenNorm = norm(spoken);
        const targetNorm = norm(target);
        const otherNorm = norm(other);

        if (spokenNorm === targetNorm || spokenNorm.includes(targetNorm)) {
            setStatus('success');
            SoundManager.playSuccess();
        } else if (spokenNorm === otherNorm || spokenNorm.includes(otherNorm)) {
            setStatus('wrong-pair');
            SoundManager.playMiss();
        } else {
            setStatus('fail');
            SoundManager.playMiss();
        }
    };

    const startListening = () => {
        setStatus('listening');
        if (recognitionRef.current) recognitionRef.current.start();
    };

    const nextDrill = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStatus('idle');
            setTranscript('');
        } else {
            onComplete(100); // Finish session
        }
    };

    if (sessionQueue.length === 0) return <div>Loading pairs...</div>;

    const word1 = currentItem.pair.word1;
    const word2 = currentItem.pair.word2;
    const isTarget1 = currentItem.targetIdx === 0;

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-8">
            <Card className="w-full p-8 bg-slate-900 border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <Badge variant="outline" className="opacity-50">Drill {currentIndex + 1} / {sessionQueue.length}</Badge>
                    <div className="text-slate-400 text-sm">{currentItem.group.description}</div>
                </div>

                <div className="flex justify-center gap-12 mb-12">
                    {/* Option 1 */}
                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isTarget1 ? (status === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 'border-indigo-500 bg-indigo-500/10')
                            : (status === 'wrong-pair' && transcript.includes(word1) ? 'border-red-500 bg-red-500/10' : 'border-slate-800 opacity-50')
                        }`}>
                        <div className="text-3xl font-bold text-center mb-2">{word1}</div>
                        <div className="text-slate-400 text-sm text-center mb-4">{currentItem.pair.meaning1}</div>
                        <Button size="mt-2" variant="ghost" onClick={() => speak(word1)} aria-label={`Listen to ${word1}`}><Volume2 size={16} aria-hidden="true" /></Button>
                    </div>

                    <div className="flex flex-col justify-center text-slate-600 font-bold text-xl">VS</div>

                    {/* Option 2 */}
                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${!isTarget1 ? (status === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 'border-indigo-500 bg-indigo-500/10')
                            : (status === 'wrong-pair' && transcript.includes(word2) ? 'border-red-500 bg-red-500/10' : 'border-slate-800 opacity-50')
                        }`}>
                        <div className="text-3xl font-bold text-center mb-2">{word2}</div>
                        <div className="text-slate-400 text-sm text-center mb-4">{currentItem.pair.meaning2}</div>
                        <Button size="mt-2" variant="ghost" onClick={() => speak(word2)} aria-label={`Listen to ${word2}`}><Volume2 size={16} aria-hidden="true" /></Button>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="text-xl text-slate-300 mb-2">Say the word:</div>
                    <div className="text-5xl font-black text-white mb-4 animate-in fade-in zoom-in duration-300 transform origin-center">
                        {targetWord}
                    </div>
                    {/* Optional: Show Mouth Viz for target */}
                    {/* {targetWord.ipa && <div className="flex justify-center"><MouthShapeVisualizer ipa={targetWord.ipa} /></div>} */}
                </div>

                <div className="flex flex-col items-center">
                    <Button
                        size="lg"
                        onClick={startListening}
                        disabled={status === 'success' || status === 'listening'}
                        className={`w-20 h-20 rounded-full mb-8 ${isListening ? 'animate-pulse bg-indigo-500' : 'bg-indigo-600'}`}
                        aria-label={isListening ? "Stop listening" : "Start listening"}
                    >
                        {isListening ? <MicOff size={32} aria-hidden="true" /> : <Mic size={32} aria-hidden="true" />}
                    </Button>

                    <div className="h-24">
                        {status === 'success' && (
                            <div className="flex flex-col items-center text-emerald-400 animate-in slide-in-from-bottom-2">
                                <span className="flex items-center gap-2 text-xl font-bold"><CheckCircle2 /> Correct!</span>
                                <Button className="mt-4" onClick={nextDrill}>Next PairRep</Button>
                            </div>
                        )}
                        {status === 'wrong-pair' && (
                            <div className="flex flex-col items-center text-red-400 animate-in slide-in-from-bottom-2">
                                <span className="flex items-center gap-2 text-lg font-bold"><AlertTriangle /> You said "{otherWord}"!</span>
                                <span className="text-sm text-slate-400">Pay attention to the difference.</span>
                                <Button variant="ghost" className="mt-2" onClick={() => setStatus('idle')}>Try Again</Button>
                            </div>
                        )}
                        {status === 'fail' && (
                            <div className="flex flex-col items-center text-slate-400 animate-in slide-in-from-bottom-2">
                                <span>Heard: "{transcript}"</span>
                                <Button variant="ghost" className="mt-2" onClick={() => setStatus('idle')}>Try Again</Button>
                            </div>
                        )}
                    </div>
                </div>

            </Card>
        </div>
    );
};

export default MinimalPairDrill;
