import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Bot, User, RotateCcw, AlertCircle, Play, Volume2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { GameLayout } from './layout/GameLayout';
import SoundManager from '../utils/SoundManager';
import { speak } from '../utils/audio';
import { generateAIResponse } from '../utils/ai'; // Hypothetical AI helper
import { analyzeProsody } from '../utils/prosody';

const SCENARIOS = [
    {
        id: 'cafe_order',
        title: 'Ordering a Coffee',
        role: 'Customer',
        partner: 'Barista',
        difficulty: 'Easy',
        description: 'Order a coffee and a croissant at a Parisian café.',
        initialMessage: "Bonjour ! Qu'est-ce que je peux vous servir aujourd'hui ?"
    },
    {
        id: 'directions',
        title: 'Asking for Directions',
        role: 'Lost Tourist',
        partner: 'Local',
        difficulty: 'Medium',
        description: 'You are lost. Ask a local how to get to the Louvre.',
        initialMessage: "Pardon, vous semblez chercher quelque chose ?"
    },
    {
        id: 'hotel_checkin',
        title: 'Hotel Check-in',
        role: 'Guest',
        partner: 'Receptionist',
        difficulty: 'Medium',
        description: 'Check into your hotel. You have a reservation under "Smith".',
        initialMessage: "Bienvenue à l'Hôtel Grand. Vous avez une réservation ?"
    }
];

const ConversationSimulator = () => {
    const { addXP, addCoins, trackConversationSession } = useProgress();
    const [scenario, setScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'grammar', message: '...' }

    // Metrics
    const [sessionMetrics, setSessionMetrics] = useState({
        turns: 0,
        fluencyScore: 0,
        vocabularyScore: 0,
        errors: 0
    });

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Init Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'fr-FR';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => setIsRecording(true);

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSend(transcript);
            };

            recognitionRef.current.onend = () => setIsRecording(false);
        }
    }, []);

    const startScenario = (selectedScenario) => {
        setScenario(selectedScenario);
        setMessages([
            {
                id: 1,
                sender: 'ai',
                text: selectedScenario.initialMessage,
                timestamp: Date.now()
            }
        ]);
        setSessionMetrics({ turns: 0, fluencyScore: 0, vocabularyScore: 0, errors: 0 });
        speak(selectedScenario.initialMessage);
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim() || isProcessing) return;

        // Add User Message
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsProcessing(true);

        // Simulate AI Processing & Response
        try {
            // 1. Analyze User Input (Grammar/Vocab Check)
            const analysis = await simulateAnalysis(text);
            if (analysis.feedback) {
                setFeedback(analysis.feedback);
                setSessionMetrics(prev => ({ ...prev, errors: prev.errors + 1 }));
            } else {
                setFeedback(null);
            }

            // 2. Generate Response
            const responseText = await generateAIResponse(scenario.id, [...messages, userMsg]);

            setTimeout(() => {
                const aiMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: responseText,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsProcessing(false);
                setSessionMetrics(prev => ({ ...prev, turns: prev.turns + 1 }));

                // Auto-speak response
                speak(responseText);
                SoundManager.playPop();

            }, 1000 + Math.random() * 1000); // Simulate "typing" delay

        } catch (error) {
            console.error("AI Error:", error);
            setIsProcessing(false);
        }
    };

    const simulateAnalysis = async (text) => {
        // Simple mock analysis logic
        if (text.length < 3) return { feedback: { type: 'warning', message: 'Too short. Try a full sentence.' } };
        return { feedback: null };
    };

    const endSession = () => {
        // Calculate Rewards
        const baseXP = sessionMetrics.turns * 10;
        const bonus = Math.max(0, 100 - (sessionMetrics.errors * 10));
        const totalXP = baseXP + bonus;

        addXP(totalXP);
        addCoins(Math.floor(totalXP / 5));

        trackConversationSession({
            scenarioId: scenario.id,
            metrics: sessionMetrics,
            date: new Date().toISOString()
        });

        setScenario(null);
        setMessages([]);
    };

    if (!scenario) {
        return (
            <GameLayout title="Roleplay Scenarios" subtitle="Practice real conversations with AI characters">
                <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SCENARIOS.map(s => (
                        <Card
                            key={s.id}
                            onClick={() => startScenario(s)}
                            className="p-6 cursor-pointer hover:border-indigo-500 hover:bg-slate-800/80 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                                    {s.difficulty}
                                </Badge>
                                <Bot className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                            <p className="text-slate-400 text-sm mb-4">{s.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User size={14} /> You: <span className="text-slate-300 font-semibold">{s.role}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout
            title={scenario.title}
            subtitle={`Speaking with: ${scenario.partner}`}
            onBack={() => setScenario(null)}
            headerRight={
                <Button variant="ghost" size="sm" onClick={endSession} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    End Session
                </Button>
            }
        >
            <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col p-4">

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[80%] rounded-2xl p-4 relative
                                ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/10'
                                }
                            `}>
                                <p className="leading-relaxed">{msg.text}</p>
                                {msg.sender === 'ai' && (
                                    <button
                                        onClick={() => speak(msg.text)}
                                        className="absolute -right-8 top-2 text-slate-500 hover:text-indigo-400"
                                    >
                                        <Volume2 size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isProcessing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-slate-800 rounded-2xl p-4 rounded-tl-sm border border-white/10 flex gap-2 items-center">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Feedback Toast */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-200 text-sm"
                        >
                            <AlertCircle size={18} />
                            {feedback.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl relative z-10">
                    <button
                        onClick={toggleRecording}
                        className={`p-3 rounded-xl transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Mic size={20} />
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isRecording ? "Listening..." : "Type your response..."}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-600 px-2"
                        disabled={isProcessing}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={!inputText.trim() || isProcessing}
                        className={`p-3 rounded-xl transition-all ${
                            !inputText.trim() || isProcessing
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                        }`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </GameLayout>
    );
};

export default ConversationSimulator;
