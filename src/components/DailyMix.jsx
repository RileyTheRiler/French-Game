import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Volume2, Award, Check, X, Mic, Keyboard, Repeat } from 'lucide-react';
import SoundManager from '../utils/SoundManager';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';
import { playWordAudio } from '../utils/audio';
import { scorePronunciation } from '../utils/phonetics';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { GameLayout } from './layout/GameLayout';

const CHALLENGE_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    LISTENING: 'listening',
    REVERSE_FLASHCARD: 'reverse_flashcard',
    LISTEN_AND_TYPE: 'listen_type',
    SHADOW: 'shadow_audio'
};

const buildOptions = (word, vocabulary) => {
    const pool = vocabulary.filter(w => w.id !== word.id);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.english);
    return [...shuffled, word.english].sort(() => Math.random() - 0.5);
};

const buildQueue = (vocabulary) => {
    const sequence = [CHALLENGE_TYPES.MULTIPLE_CHOICE, CHALLENGE_TYPES.LISTENING, CHALLENGE_TYPES.LISTEN_AND_TYPE, CHALLENGE_TYPES.SHADOW, CHALLENGE_TYPES.REVERSE_FLASHCARD];
    const seed = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 8);

    return seed.map((word, idx) => {
        const type = sequence[idx % sequence.length];
        return {
            word,
            type,
            options: buildOptions(word, vocabulary)
        };
    });
};

const normalize = (text) => text.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

const DailyMix = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { vocabulary, updateWordProgress, downloadAudioOnce } = useVocabulary();
    const { addXP, addCoins, offlineAudio } = useProgress();

    const [sessionQueue, setSessionQueue] = useState(() => buildQueue(vocabulary));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [sessionComplete, setSessionComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);
    const [shadowResult, setShadowResult] = useState(null);
    const [isShadowing, setIsShadowing] = useState(false);

    const recognitionRef = useRef(null);
    const hasPrefetchedAudio = useRef(false);

    const currentChallenge = useMemo(() => sessionQueue[currentIndex], [sessionQueue, currentIndex]);

    useEffect(() => {
        setSessionQueue(buildQueue(vocabulary));
        setCurrentIndex(0);
        setIsAnswered(false);
        setIsCorrect(false);
        setInputValue('');
        setShadowResult(null);
        setTotalXP(0);
    }, [vocabulary]);

    useEffect(() => {
        if (offlineAudio && !hasPrefetchedAudio.current) {
            hasPrefetchedAudio.current = true;
            downloadAudioOnce();
        }
    }, [offlineAudio, downloadAudioOnce]);

    useEffect(() => {
        if (!currentChallenge) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'fr-FR';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
            const heard = event.results[0][0].transcript;
            const { accuracy, feedback } = scorePronunciation(currentChallenge.word.french, heard);
            const success = accuracy >= 70;

            setShadowResult({ heard, accuracy, feedback });
            setIsShadowing(false);
            setIsAnswered(true);
            setIsCorrect(success);

            if (success) {
                SoundManager.playSuccess();
                setTotalXP(prev => prev + 15);
                updateWordProgress(currentChallenge.word.id, true);
            } else {
                SoundManager.playMiss();
                updateWordProgress(currentChallenge.word.id, false);
            }
        };

        recognitionRef.current.onend = () => setIsShadowing(false);
        recognitionRef.current.onerror = () => setIsShadowing(false);
    }, [currentChallenge, updateWordProgress]);

    const handleAnswer = (answer) => {
        if (isAnswered) return;

        const correct = answer === currentChallenge.word.english;
        setIsCorrect(correct);
        setIsAnswered(true);
        setSelectedOption(answer);

        if (correct) {
            SoundManager.playMatch();
            setTotalXP(prev => prev + 15);
            updateWordProgress(currentChallenge.word.id, true);
        } else {
            SoundManager.playMiss();
            updateWordProgress(currentChallenge.word.id, false);
        }
    };

    const handleTypedAnswer = () => {
        if (isAnswered) return;
        const cleaned = normalize(inputValue);
        const target = normalize(currentChallenge.word.french);
        const correct = cleaned === target;

        setIsCorrect(correct);
        setIsAnswered(true);
        if (correct) {
            SoundManager.playMatch();
            setTotalXP(prev => prev + 15);
            updateWordProgress(currentChallenge.word.id, true);
        } else {
            SoundManager.playMiss();
            updateWordProgress(currentChallenge.word.id, false);
        }
    };

    const startShadowing = () => {
        if (!recognitionRef.current || isShadowing) return;
        setShadowResult(null);
        setIsShadowing(true);
        recognitionRef.current.start();
        playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio });
    };

    const handleNext = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOption(null);
            setInputValue('');
            setShadowResult(null);
        } else {
            addXP(totalXP);
            addCoins(20);
            SoundManager.playLevelUp();
            setSessionComplete(true);
        }
    };

    if (vocabulary.length < 4) {
        return (
            <GameLayout title="Daily Mix" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                    <p className="text-xl text-slate-400">You need at least 4 words in your vocabulary to start a Daily Mix!</p>
                    <Button className="mt-8" onClick={onExit}>Go Back</Button>
                </div>
            </GameLayout>
        );
    }

    if (!currentChallenge) return null;

    if (sessionComplete) {
        return (
            <GameLayout title="Session Complete" onBack={onExit}>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-8 p-8 bg-indigo-500/20 rounded-full"
                    >
                        <Award size={80} className="text-indigo-400" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 title-gradient">Daily Mix Done!</h2>
                    <p className="text-slate-400 mb-8 max-w-md text-lg">
                        Fantastic job! You've practiced with interleaving to boost your memory retention.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-12 w-full max-w-xs flex flex-col items-center shadow-2xl">
                        <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Rewards</span>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <span className="text-3xl font-black text-indigo-400">+{totalXP}</span>
                                <p className="text-xs text-indigo-300">XP</p>
                            </div>
                            <div className="text-center">
                                <span className="text-3xl font-black text-amber-400">+20</span>
                                <p className="text-xs text-amber-300">Coins</p>
                            </div>
                        </div>
                    </div>
                    <Button size="lg" onClick={onExit} className="px-12 py-4 text-xl">
                        Return to Hub
                    </Button>
                </div>
            </GameLayout>
        );
    }

    const headerLabel = {
        [CHALLENGE_TYPES.MULTIPLE_CHOICE]: 'What does this mean?',
        [CHALLENGE_TYPES.LISTENING]: 'What did you hear?',
        [CHALLENGE_TYPES.REVERSE_FLASHCARD]: 'Can you recall the translation?',
        [CHALLENGE_TYPES.LISTEN_AND_TYPE]: 'Listen, then type the word',
        [CHALLENGE_TYPES.SHADOW]: 'Shadow the audio in French'
    }[currentChallenge.type];

    return (
        <GameLayout
            title="Daily Mix"
            subtitle="Interleaved practice session"
            onBack={onExit}
            headerRight={
                <Badge variant="primary" className="text-lg py-1 px-4">
                    {currentIndex + 1} / {sessionQueue.length}
                </Badge>
            }
        >
            <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">

                {/* Challenge Header */}
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 text-slate-400 border-white/10 flex items-center gap-2 mx-auto w-fit">
                        <Lightbulb size={14} className="text-yellow-400" />
                        {headerLabel}
                    </Badge>

                    <div className="flex items-center justify-center gap-6">
                        {currentChallenge.type === CHALLENGE_TYPES.LISTENING && (
                            <Button
                                variant="default"
                                size="lg"
                                className="rounded-full w-24 h-24 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 group"
                                onClick={() => playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio })}
                            >
                                <Volume2 size={40} className="group-hover:scale-110 transition-transform" />
                            </Button>
                        )}
                        {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                            <h2 className="text-6xl font-black text-white px-8">
                                {currentChallenge.word.english}
                            </h2>
                        )}
                        {(currentChallenge.type === CHALLENGE_TYPES.MULTIPLE_CHOICE || currentChallenge.type === CHALLENGE_TYPES.LISTEN_AND_TYPE || currentChallenge.type === CHALLENGE_TYPES.SHADOW) && (
                            <h2 className="text-6xl font-black text-white px-8">
                                {currentChallenge.word.french}
                            </h2>
                        )}
                        {currentChallenge.type !== CHALLENGE_TYPES.LISTENING && (
                            <Button
                                variant="ghost"
                                className="rounded-full p-2 h-10 w-10"
                                onClick={() => playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio })}
                            >
                                <Volume2 size={24} className="text-slate-500" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Challenge Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                    <AnimatePresence mode="wait">
                        {currentChallenge.type === CHALLENGE_TYPES.REVERSE_FLASHCARD ? (
                            <motion.div
                                key="reverse"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-lg"
                            >
                                {!isAnswered ? (
                                    <Card
                                        className="h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-dashed border-2 border-white/10"
                                        onClick={() => handleAnswer(currentChallenge.word.english)}
                                    >
                                        <p className="text-slate-500 uppercase tracking-widest font-bold">Think of the French word</p>
                                        <p className="mt-4 text-indigo-400 font-bold">Click to show answer</p>
                                    </Card>
                                ) : (
                                    <Card className="h-64 flex flex-col items-center justify-center bg-indigo-950/20 border-indigo-500/30">
                                        <h3 className="text-4xl font-black text-indigo-300">{currentChallenge.word.french}</h3>
                                        <div className="mt-12 flex gap-4 w-full px-6">
                                            <Button
                                                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 h-14"
                                                onClick={() => { setIsCorrect(false); handleNext(); }}
                                            >
                                                <X className="mr-2" /> Wrong
                                            </Button>
                                            <Button
                                                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 h-14"
                                                onClick={() => { setIsCorrect(true); handleNext(); }}
                                            >
                                                <Check className="mr-2" /> Correct
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        ) : currentChallenge.type === CHALLENGE_TYPES.LISTEN_AND_TYPE ? (
                            <motion.div
                                key="listen-type"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-xl flex flex-col gap-4"
                            >
                                <Card className="p-6 bg-white/5 border-white/10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm uppercase tracking-widest">
                                            <Keyboard size={16} />
                                            Listen then type in French
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => playWordAudio(currentChallenge.word, { preferCache: true, offlineOnly: offlineAudio })}
                                        >
                                            <Volume2 size={18} className="mr-2" /> Play Audio
                                        </Button>
                                    </div>
                                    <input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-4 text-white text-xl"
                                        placeholder="Type what you hear"
                                        disabled={isAnswered}
                                    />
                                    <Button onClick={handleTypedAnswer} disabled={isAnswered || inputValue.length === 0}>
                                        Submit
                                    </Button>
                                </Card>
                            </motion.div>
                        ) : currentChallenge.type === CHALLENGE_TYPES.SHADOW ? (
                            <motion.div
                                key="shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-xl flex flex-col gap-4 items-center"
                            >
                                <Card className="p-6 bg-white/5 border-white/10 w-full text-center flex flex-col gap-4 items-center">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm uppercase tracking-widest">
                                        <Repeat size={16} />
                                        Shadow the audio
                                    </div>
                                    <Button
                                        onClick={startShadowing}
                                        disabled={isShadowing}
                                        className="rounded-full w-24 h-24 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 group flex items-center justify-center text-lg"
                                    >
                                        <Mic size={32} className="mr-2" />
                                        {isShadowing ? 'Listening' : 'Start'}
                                    </Button>
                                    {shadowResult && (
                                        <div className="flex flex-col gap-2 items-center">
                                            <p className={`font-bold ${shadowResult.accuracy >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                Accuracy: {shadowResult.accuracy}%
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {shadowResult.feedback.map((item, idx) => (
                                                    <span
                                                        key={`${item.phoneme}-${idx}`}
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'match' ? 'bg-emerald-500/20 text-emerald-300' :
                                                            item.status === 'close' ? 'bg-amber-500/20 text-amber-300' :
                                                                'bg-red-500/20 text-red-300'}`}
                                                    >
                                                        {item.phoneme}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="options"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
                            >
                                {currentChallenge.options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        variant={isAnswered ? (option === currentChallenge.word.english ? "success" : (option === selectedOption ? "danger" : "ghost")) : "default"}
                                        className={`p-8 text-xl h-auto rounded-3xl border-2 transition-all ${!isAnswered ? "hover:scale-[1.02] active:scale-[0.98] border-white/10" : ""}`}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span>{option}</span>
                                            {isAnswered && option === currentChallenge.word.english && <Check size={24} />}
                                            {isAnswered && option === selectedOption && option !== currentChallenge.word.english && <X size={24} />}
                                        </div>
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Feedback Footer */}
                {isAnswered && currentChallenge.type !== CHALLENGE_TYPES.REVERSE_FLASHCARD && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute bottom-0 left-0 right-0 p-8 flex items-center justify-between backdrop-blur-xl border-t-4 shadow-2xl ${isCorrect ? "bg-emerald-950/80 border-emerald-500" : "bg-red-950/80 border-red-500"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                                {isCorrect ? <Check size={32} className="text-white" /> : <X size={32} className="text-white" />}
                            </div>
                            <div>
                                <h4 className={`text-2xl font-black ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                                    {isCorrect ? "Correct!" : "Incorrect"}
                                </h4>
                                {!isCorrect && (
                                    <p className="text-white/70">The correct answer was <span className="font-bold text-white uppercase">{currentChallenge.word.english}</span></p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant={isCorrect ? "success" : "danger"}
                            size="lg"
                            className="px-12 py-6 text-xl rounded-2xl font-black shadow-xl"
                            onClick={handleNext}
                        >
                            Continue
                        </Button>
                    </motion.div>
                )}
            </div>
        </GameLayout>
    );
};

export default DailyMix;
