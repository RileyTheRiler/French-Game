import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Bot, Lightbulb, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import SoundManager from '../utils/SoundManager';
import { npcSystem } from '../systems/NPCSystem';
import { getDifficultyConfig } from './ui/DifficultyDial';
import { SCENARIOS } from '../data/conversationScenarios';
import { findBestMatch } from '../utils/textMatching';
import { calculateRewards } from '../utils/rewardSystem';

const ConversationSimulator = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');
    const { addXP, addCoins, updateDailyStat, incrementStat, globalDifficulty, difficultySettings } = useProgress();

    const difficultyConfig = useMemo(() => getDifficultyConfig(globalDifficulty), [globalDifficulty]);
    const messagesEndRef = useRef(null);

    // Scenario State
    const [activeScenario, setActiveScenario] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [history, setHistory] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [stepsTaken, setStepsTaken] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [sessionReward, setSessionReward] = useState(null);
    const [outcome, setOutcome] = useState(null);

    // Hybrid Input State
    const [userInputValue, setUserInputValue] = useState("");
    const [showLegacyOptions, setShowLegacyOptions] = useState(false);

    // Feedback State for Scholar Mode
    const [feedbackModal, setFeedbackModal] = useState(null); // { text: string, onDismiss: func }

    // Hint Delay State - hide options initially to encourage thinking
    const [showOptions, setShowOptions] = useState(false);
    const optionsTimerRef = useRef(null);

    // Get hint delay from difficulty config
    const hintDelay = difficultyConfig.hintDelay;

    // Challenge Mode is forced true for Scholar, otherwise global difficulty can influence it
    const challengeMode = difficultySettings?.learnerType === 'scholar' || (globalDifficulty > 80);
    const learnerType = difficultySettings?.learnerType || 'casual';

    // Scroll to bottom when history changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Reset options visibility and input when node changes
    useEffect(() => {
        if (!activeScenario || gameOver || feedbackModal) return;

        // Reset input state
        setUserInputValue("");
        setShowLegacyOptions(false);

        // Clear any existing timer
        if (optionsTimerRef.current) {
            clearTimeout(optionsTimerRef.current);
        }

        // Hide options initially
        setShowOptions(false);

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
        setHistory([{ text: scenario.initialMessage, speaker: scenario.initialSpeaker, isUser: false }]);
        setGameOver(false);
        setStepsTaken(0);
        setMistakes(0);
        setSessionReward(null);
        setOutcome(null);
        setShowOptions(false);
        setFeedbackModal(null);
    };

    const grantRewards = (success) => {
        if (!activeScenario) return;
        const reward = calculateRewards('conversation', {
            baseXp: activeScenario.xpReward,
            difficulty: activeScenario.difficulty,
            mistakes,
            steps: stepsTaken,
            success
        });
        setSessionReward(reward);
        if (success) {
            addXP(reward.xp);
            addCoins(reward.coins);
            updateDailyStat('dailyConversations', 1);
            incrementStat('conversationsCompleted', 1);
        }
    };

    const proceedToNode = (nextNodeId, scenario) => {
        const nextNode = scenario.nodes[nextNodeId];
        if (nextNode) {
            setTimeout(() => {
                if (nextNode.message) {
                    setHistory(prev => [...prev, { text: nextNode.message, speaker: nextNode.speaker, isUser: false }]);
                }

                if (nextNode.end) {
                    const success = !!nextNode.success;
                    setOutcome(success ? 'success' : 'fail');
                    setGameOver(true);
                    if (success) {
                        SoundManager.playLevelUp();
                        setHistory(prev => [...prev, { text: `🎉 Scenario Complete!`, isSystem: true }]);
                    } else {
                        SoundManager.playMiss();
                        setHistory(prev => [...prev, { text: "Scenario failed. Try again!", isSystem: true }]);
                    }
                    grantRewards(success);
                } else {
                    setCurrentNodeId(nextNodeId);
                }
            }, 600);
        }
    };

    /**
     * Handle user typing a response
     */
    const handleTypedSubmit = () => {
        if (!userInputValue.trim()) return;

        const currentNode = activeScenario.nodes[currentNodeId];
        const matchResult = findBestMatch(userInputValue, currentNode.options);

        const handleProgression = (option, wasFuzzyMatch = false) => {
            setHistory(prev => [...prev, { text: wasFuzzyMatch ? userInputValue : option.text, isUser: true }]);
            setStepsTaken(prev => prev + 1);
            if (!option.isCorrect) setMistakes(prev => prev + 1);

            if (activeScenario.npcId) {
                npcSystem.interact(activeScenario.npcId, wasFuzzyMatch ? userInputValue : option.text).then(response => {
                    console.log("NPC Thought:", response.text);
                });
            }
            proceedToNode(option.nextNode, activeScenario);
        };

        if (matchResult && matchResult.score > 0.4) {
            // Good match found
            SoundManager.playPop();
            const { option } = matchResult;

            if (option.feedback && (learnerType === 'scholar' || !option.isCorrect)) {
                setFeedbackModal({
                    text: option.feedback,
                    isCorrect: option.isCorrect,
                    onDismiss: () => {
                        setFeedbackModal(null);
                        handleProgression(option, true);
                    }
                });
            } else {
                handleProgression(option, true);
            }
        } else {
            // No clear match found - use NPCSystem for open-ended handling
            const offScriptResponse = npcSystem.handleOffScript(
                userInputValue,
                activeScenario,
                currentNode.options
            );

            // Add user message to history
            setHistory(prev => [...prev, { text: userInputValue, isUser: true }]);
            setStepsTaken(prev => prev + 1);

            // Add NPC response
            setTimeout(() => {
                setHistory(prev => [...prev, {
                    text: offScriptResponse.text,
                    speaker: activeScenario.initialSpeaker,
                    isUser: false,
                    isRepair: true
                }]);

                // Show correction/learning moment if grammar error detected
                if (offScriptResponse.correction) {
                    SoundManager.playPop();
                    setFeedbackModal({
                        text: offScriptResponse.correction,
                        isCorrect: false,
                        miniLesson: offScriptResponse.miniLesson,
                        onDismiss: () => setFeedbackModal(null)
                    });
                } else if (!offScriptResponse.understood) {
                    SoundManager.playMiss();
                }

                // Show options as hint
                setShowLegacyOptions(true);
            }, 600);
        }
    };

    const handleOptionClick = (option) => {
        SoundManager.playPop();

        // Add user response to history
        setHistory(prev => [...prev, { text: option.text, isUser: true }]);
        setStepsTaken(prev => prev + 1);
        if (!option.isCorrect) setMistakes(prev => prev + 1);

        const handleProgression = () => {
            // AI Interaction Side Effect
            if (activeScenario.npcId) {
                npcSystem.interact(activeScenario.npcId, option.text).then(response => {
                    console.log("NPC Thought:", response.text);
                });
            }
            proceedToNode(option.nextNode, activeScenario);
        };

        if (option.feedback) {
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
        setGameOver(false);
        setCurrentNodeId('start');
        setSessionReward(null);
        setOutcome(null);
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
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                                        {scenario.difficulty}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] text-indigo-200 border-indigo-400/40">
                                        {scenario.nodes ? Object.keys(scenario.nodes).length - 1 : 0} steps
                                    </Badge>
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
            headerRight={sessionReward && (
                <Badge variant="primary" className="bg-indigo-500/20 border-indigo-400/40 text-indigo-200">
                    Session: +{sessionReward.xp} XP / +{sessionReward.coins}⛃
                </Badge>
            )}
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
                <div className="min-h-[160px] space-y-3">
                    {sessionReward && (
                        <div className={`p-3 rounded-xl border ${outcome === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                            <div className="flex items-center gap-2">
                                <Award size={18} />
                                <span>{outcome === 'success' ? 'Scenario complete!' : 'Scenario failed.'} +{sessionReward.xp} XP / +{sessionReward.coins}⛃</span>
                            </div>
                        </div>
                    )}
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
                                ) : showOptions || challengeMode ? (
                                    /* Hybrid Input Mode */
                                    <div className="space-y-4">
                                        {/* Typed Input Field */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={userInputValue}
                                                onChange={(e) => setUserInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && userInputValue.trim()) {
                                                        handleTypedSubmit();
                                                    }
                                                }}
                                                placeholder="Type your response..."
                                                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                autoFocus
                                            />
                                            <Button
                                                onClick={handleTypedSubmit}
                                                disabled={!userInputValue.trim()}
                                                className="px-6"
                                            >
                                                <Send size={18} />
                                            </Button>
                                        </motion.div>

                                        {/* Fallback Options (can be toggled or shown after failed attempts) */}
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => setShowLegacyOptions(!showLegacyOptions)}
                                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                                            >
                                                {showLegacyOptions ? "Hide Options" : "Show Options (I'm stuck)"}
                                            </button>
                                        </div>

                                        {showLegacyOptions && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
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
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
            {/* Feedback Modal for Scholar Mode */}
            <AnimatePresence>
                {feedbackModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={feedbackModal.onDismiss}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`p-4 rounded-full ${feedbackModal.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    <Lightbulb size={32} />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {feedbackModal.isCorrect ? 'Correct, but...' : 'Learning Moment'}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        {feedbackModal.text}
                                    </p>
                                </div>

                                <Button
                                    onClick={feedbackModal.onDismiss}
                                    className="w-full mt-2"
                                >
                                    Got it
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GameLayout>
    );
};

export default ConversationSimulator;
