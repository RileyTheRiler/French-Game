import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Bot, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import SoundManager from '../utils/SoundManager';
import { npcSystem } from '../systems/NPCSystem';

import { SCENARIOS } from '../data/conversationScenarios';

const ConversationSimulator = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { addXP, difficultySettings } = useProgress();
    const messagesEndRef = useRef(null);

    // Scenario State
    const [activeScenario, setActiveScenario] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [history, setHistory] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    // Feedback State for Scholar Mode
    const [feedbackModal, setFeedbackModal] = useState(null); // { text: string, onDismiss: func }

    // Hint Delay State - hide options initially to encourage thinking
    const [showOptions, setShowOptions] = useState(false);
    const optionsTimerRef = useRef(null);

    // Get hint delay from settings (default 8 seconds)
    const hintDelay = difficultySettings?.hintDelay ?? 8;
    // Challenge Mode is forced true for Scholar, otherwise user setting
    const challengeMode = difficultySettings?.learnerType === 'scholar' || (difficultySettings?.challengeMode ?? false);
    const learnerType = difficultySettings?.learnerType || 'casual';

    // Scroll to bottom when history changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Reset options visibility when node changes
    useEffect(() => {
        if (!activeScenario || gameOver || feedbackModal) return;

        // Clear any existing timer
        if (optionsTimerRef.current) {
            clearTimeout(optionsTimerRef.current);
        }

        // Hide options initially
        setShowOptions(false);

        // Show options after delay (unless delay is 0 or challenge mode or scholar mode which might want instant but harder?)
        // Actually Scholar mode implies "Challenge Mode" (no hints), but maybe we just want to hide options for a bit?
        // Let's stick to the settings.
        if (hintDelay === 0) {
            setShowOptions(true);
        } else {
            optionsTimerRef.current = setTimeout(() => {
                setShowOptions(true);
            }, hintDelay * 1000);
        }

        return () => {
            if (optionsTimerRef.current) {
                clearTimeout(optionsTimerRef.current);
            }
        };
    }, [currentNodeId, activeScenario, gameOver, hintDelay, feedbackModal]);

    const startScenario = (scenario) => {
        setActiveScenario(scenario);
        setCurrentNodeId('start');
        setGameOver(false);
        setShowOptions(false);
        setFeedbackModal(null);
        // data/conversationScenarios uses 'initialMessage' and 'initialSpeaker' at root, not inside 'start' node sometimes?
        // Let's check the data structure. Data uses root initialMessage.
        // But nodes also have messages. Let's make sure we handle both.
        // The data file structure: scenario.initialMessage exists. scenario.nodes.start has options only (usually).
        // Let's check a sample from the view_file history.
        // id: 'cafe_basic', initialMessage: "...", nodes: { start: { options: [...] } }

        // So we push the initial message.
        setHistory([{ text: scenario.initialMessage, speaker: scenario.initialSpeaker, isUser: false }]);
    };

    const proceedToNode = (nextNodeId, scenario) => {
        const nextNode = scenario.nodes[nextNodeId];
        if (nextNode) {
            setTimeout(() => {
                if (nextNode.message) {
                    setHistory(prev => [...prev, { text: nextNode.message, speaker: nextNode.speaker, isUser: false }]);
                }

                if (nextNode.end) {
                    setGameOver(true);
                    if (nextNode.success) {
                        addXP(scenario.xpReward);
                        SoundManager.playLevelUp();
                        setHistory(prev => [...prev, { text: `🎉 Scenario Complete! +${scenario.xpReward} XP`, isSystem: true }]);
                    } else {
                        SoundManager.playMiss();
                        setHistory(prev => [...prev, { text: "Scenario failed. Try again!", isSystem: true }]);
                    }
                } else {
                    setCurrentNodeId(nextNodeId);
                }
            }, 800);
        }
    };

    const handleOptionClick = (option) => {
        SoundManager.playPop();

        // Add user response to history
        setHistory(prev => [...prev, { text: option.text, isUser: true }]);

        const handleProgression = () => {
            // AI Interaction Side Effect
            if (activeScenario.npcId) {
                npcSystem.interact(activeScenario.npcId, option.text).then(response => {
                    console.log("NPC Thought:", response.text);
                });
            }
            proceedToNode(option.nextNode, activeScenario);
        };

        // SCHOLAR MODE / LEARNING MOMENT
        // If we have feedback (usually for wrong answers, or specific "good but not great" answers)
        // AND we are in Scholar mode OR it's a critical error (isCorrect === false)
        // We show the feedback.

        // Actually, casual users might want to know why they failed too.
        // But Scholar users get specific feedback even if they get it "right" but maybe "rude"?
        // The data has `isCorrect` and `feedback`.

        if (option.feedback) {
            // If we are in Scholar mode, OR if the answer was actually wrong/rude.
            // We'll show feedback for everything in Scholar mode if it exists.
            // In Casual mode, we might only show it if it led to failure? 
            // Let's show it always if it exists, but maybe style it differently?
            // Implementation Plan said: "Scholar Mode: Should pause and show the specific feedback string... before proceeding."

            if (learnerType === 'scholar' || !option.isCorrect) {
                setFeedbackModal({
                    text: option.feedback,
                    isCorrect: option.isCorrect,
                    onDismiss: () => {
                        setFeedbackModal(null);
                        handleProgression();
                    }
                });
                return;
            }
        }

        handleProgression();
    };

    const reset = () => {
        setActiveScenario(null);
        setHistory([]);
        setShowOptions(false);
        setFeedbackModal(null);
    };

    // Scenario Selection Screen
    if (!activeScenario) {
        return (
            <GameLayout
                title="Conversation Practice"
                subtitle="Real-world dialogues to improve your speaking skills."
                onBack={onExit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                    {SCENARIOS.map((scenario, idx) => (
                        <motion.div
                            key={scenario.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card
                                onClick={() => startScenario(scenario)}
                                className="h-full cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <MessageCircle size={24} />
                                    </div>
                                    <Badge variant="primary">+{scenario.xpReward} XP</Badge>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>
                                <p className="text-slate-400 text-sm mb-4">{scenario.description}</p>
                                <div className="mt-auto">
                                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                                        {scenario.difficulty}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </GameLayout>
        );
    }

    const currentNode = activeScenario.nodes[currentNodeId];

    return (
        <GameLayout
            title={activeScenario.title}
            subtitle="Choose the best response."
            onBack={reset}
        >
            <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl mx-auto">
                {/* Chat Area */}
                <Card className="flex-1 overflow-y-auto mb-4 p-6 space-y-6 bg-slate-950/40 border-white/10">
                    {history.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.isSystem ? 'justify-center' : (msg.isUser ? 'justify-end' : 'justify-start')}`}
                        >
                            <div className={`flex max-w-[85%] gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!msg.isSystem && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.isUser ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                                        }`}>
                                        {msg.isUser ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                )}

                                <div
                                    className={`p-4 rounded-2xl shadow-sm ${msg.isSystem
                                        ? 'bg-transparent text-slate-400 text-sm italic py-2'
                                        : (msg.isUser
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 text-slate-50 rounded-tl-none border border-white/5')
                                        }`}
                                >
                                    {!msg.isUser && !msg.isSystem && (
                                        <p className="text-xs text-indigo-300 mb-1 font-bold">{msg.speaker}</p>
                                    )}
                                    <p className="leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </Card>

                {/* Input Area */}
                <div className="min-h-[140px]">
                    {gameOver ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Button
                                onClick={reset}
                                className="w-full py-4 text-lg"
                                size="lg"
                            >
                                Choose Another Scenario
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-3">
                            <AnimatePresence mode="wait">
                                {!showOptions && !challengeMode ? (
                                    /* Thinking prompt - shown while waiting for hint delay */
                                    <motion.div
                                        key="thinking"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center justify-center gap-3 p-6 bg-slate-800/50 rounded-xl border border-white/5"
                                    >
                                        <Lightbulb size={20} className="text-amber-400 animate-pulse" />
                                        <span className="text-slate-300 font-medium">
                                            Think about how you would respond in French...
                                        </span>
                                    </motion.div>
                                ) : showOptions ? (
                                    /* Response options - shown after hint delay */
                                    <motion.div
                                        key="options"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="grid gap-3"
                                    >
                                        {currentNode && currentNode.options.map((opt, idx) => (
                                            <motion.button
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => handleOptionClick(opt)}
                                                className="w-full text-left p-4 bg-slate-800/80 hover:bg-slate-700 hover:translate-x-1 border border-white/10 hover:border-indigo-500/50 rounded-xl transition-all flex items-center justify-between group"
                                            >
                                                <span className="text-slate-200 group-hover:text-white font-medium">{opt.text}</span>
                                                <Send size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </GameLayout>
    );
};

export default ConversationSimulator;
