import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, User, Bot, Lightbulb, BookOpen, ArrowLeft,
    Sparkles, MessageCircle, ChevronDown, ChevronUp,
    Volume2, HelpCircle, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONVERSATION_PROMPTS, getPromptsByDifficulty } from '../data/conversationPrompts';
import { npcSystem } from '../systems/NPCSystem';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { GameLayout } from './layout/GameLayout';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import SoundManager from '../utils/SoundManager';
import ConversationSummary from './ConversationSummary';

// French keyboard shortcuts
const FRENCH_CHARS = [
    { char: 'é', key: 'e' },
    { char: 'è', key: 'E' },
    { char: 'ê', key: '3' },
    { char: 'ë', key: '4' },
    { char: 'à', key: 'a' },
    { char: 'â', key: 'A' },
    { char: 'ù', key: 'u' },
    { char: 'û', key: 'U' },
    { char: 'ô', key: 'o' },
    { char: 'î', key: 'i' },
    { char: 'ï', key: 'I' },
    { char: 'ç', key: 'c' },
    { char: 'œ', key: 'O' },
];

/**
 * Prompt Selection Screen
 */
const PromptSelector = ({ onSelectPrompt, userLevel }) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    const filteredPrompts = getPromptsByDifficulty(selectedDifficulty);

    return (
        <div className="space-y-6 p-4">
            {/* Difficulty Tabs */}
            <div className="flex gap-2 justify-center">
                {difficulties.map(diff => (
                    <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedDifficulty === diff
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>

            {/* Prompt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map((prompt, idx) => (
                    <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card
                            onClick={() => onSelectPrompt(prompt)}
                            className="h-full cursor-pointer hover:bg-white/5 hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-3xl">{prompt.icon}</span>
                                <Badge variant="primary">+{prompt.xpReward} XP</Badge>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                {prompt.title}
                            </h3>

                            <p className="text-slate-400 text-sm mb-3">{prompt.description}</p>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <MessageCircle size={12} />
                                <span>Chat with {prompt.npcName}</span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-white/5">
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Target size={12} />
                                    <span className="truncate">{prompt.goal}</span>
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

/**
 * Vocabulary Helper Panel
 */
const VocabularyPanel = ({ vocabulary, isOpen, onToggle }) => {
    return (
        <div className="bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2 text-indigo-400">
                    <BookOpen size={16} />
                    <span className="font-medium">Helpful Vocabulary</span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 grid grid-cols-1 gap-2">
                            {vocabulary.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg text-sm"
                                >
                                    <span className="font-medium text-white">{item.french}</span>
                                    <span className="text-slate-400">{item.english}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * French Character Input Helper
 */
const FrenchKeyboard = ({ onInsert }) => {
    return (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-900/50 rounded-lg">
            {FRENCH_CHARS.map(({ char }) => (
                <button
                    key={char}
                    onClick={() => onInsert(char)}
                    className="w-8 h-8 rounded bg-slate-700 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                    {char}
                </button>
            ))}
        </div>
    );
};

/**
 * Chat Message Component
 */
const ChatMessage = ({ message, isNew }) => {
    const isUser = message.isUser;
    const isSystem = message.isSystem;

    if (isSystem) {
        return (
            <motion.div
                initial={isNew ? { opacity: 0, y: 5 } : false}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center py-2"
            >
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm">
                    {message.text}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={isNew ? { opacity: 0, y: 10, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300'
                    }`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`p-4 rounded-2xl shadow-lg ${isUser
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                        : 'bg-slate-800 text-slate-50 rounded-tl-sm border border-white/5'
                    }`}>
                    {!isUser && message.speaker && (
                        <p className="text-xs text-indigo-300 mb-1 font-bold">{message.speaker}</p>
                    )}
                    <p className="leading-relaxed">{message.text}</p>

                    {message.correction && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-amber-300">
                            <Lightbulb size={12} className="inline mr-1" />
                            {message.correction}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Main Free-Form Chat Component
 */
const FreeFormChat = () => {
    const navigate = useNavigate();
    const { addXP, stats } = useProgress();
    const { showToast } = useToast();

    const [activePrompt, setActivePrompt] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showVocab, setShowVocab] = useState(true);
    const [showFrenchKeyboard, setShowFrenchKeyboard] = useState(false);
    const [conversationComplete, setConversationComplete] = useState(false);
    const [turnCount, setTurnCount] = useState(0);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start conversation with selected prompt
    const startConversation = useCallback((prompt) => {
        setActivePrompt(prompt);
        setMessages([]);
        setTurnCount(0);
        setConversationComplete(false);

        // Add context message
        setMessages([
            {
                text: prompt.context,
                isSystem: true,
                timestamp: Date.now()
            }
        ]);

        // Add NPC's opening message after a delay
        setTimeout(() => {
            const starterMessage = prompt.starterMessages[0];
            setMessages(prev => [...prev, {
                text: starterMessage.text,
                speaker: prompt.npcName,
                isUser: false,
                timestamp: Date.now()
            }]);
            SoundManager.playPop();
        }, 800);
    }, []);

    // Generate NPC response based on user input
    const generateNPCResponse = useCallback(async (userMessage) => {
        if (!activePrompt) return null;

        // Use enhanced NPC system for response
        const response = await npcSystem.interactFreeForm(
            activePrompt.npcId || 'stranger',
            userMessage,
            {
                prompt: activePrompt,
                turnCount: turnCount,
                previousMessages: messages
            }
        );

        return response;
    }, [activePrompt, turnCount, messages]);

    // Handle sending a message
    const handleSend = async () => {
        if (!inputValue.trim() || isTyping || conversationComplete) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newUserMessage = {
            text: userMessage,
            isUser: true,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, newUserMessage]);
        setTurnCount(prev => prev + 1);
        SoundManager.playPop();

        // Show typing indicator
        setIsTyping(true);

        // Generate NPC response
        try {
            const response = await generateNPCResponse(userMessage);

            // Simulate typing delay
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

            setIsTyping(false);

            if (response) {
                const npcMessage = {
                    text: response.text,
                    speaker: activePrompt.npcName,
                    isUser: false,
                    correction: response.correction,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, npcMessage]);
                SoundManager.playPop();

                // Check if conversation should end
                if (response.endConversation || turnCount >= 10) {
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            text: '✨ Great conversation! Let\'s see how you did.',
                            isSystem: true,
                            timestamp: Date.now()
                        }]);
                        setConversationComplete(true);
                    }, 1500);
                }
            }
        } catch (error) {
            setIsTyping(false);
            console.error('Error generating response:', error);
        }
    };

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Insert French character
    const insertFrenchChar = (char) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newValue = inputValue.substring(0, start) + char + inputValue.substring(end);
        setInputValue(newValue);

        // Reset cursor position
        setTimeout(() => {
            input.selectionStart = input.selectionEnd = start + 1;
            input.focus();
        }, 0);
    };

    // Reset to prompt selection
    const handleBack = () => {
        if (activePrompt && !conversationComplete) {
            // Confirm leaving mid-conversation
            if (messages.length > 2) {
                setConversationComplete(true);
                return;
            }
        }
        setActivePrompt(null);
        setMessages([]);
    };

    // Handle completion from summary
    const handleComplete = (earnedXP) => {
        addXP(earnedXP);
        showToast(`+${earnedXP} XP earned!`, 'success');
        setActivePrompt(null);
        setMessages([]);
        setConversationComplete(false);
    };

    // Show summary screen
    if (conversationComplete && activePrompt) {
        return (
            <ConversationSummary
                messages={messages}
                prompt={activePrompt}
                onComplete={handleComplete}
                onRetry={() => startConversation(activePrompt)}
            />
        );
    }

    // Show prompt selector
    if (!activePrompt) {
        return (
            <GameLayout
                title="Free Conversation"
                subtitle="Practice real conversations with AI partners"
                onBack={() => navigate('/')}
            >
                <PromptSelector
                    onSelectPrompt={startConversation}
                    userLevel={stats.level}
                />
            </GameLayout>
        );
    }

    // Active conversation view
    return (
        <GameLayout
            title={activePrompt.title}
            subtitle={`Chat with ${activePrompt.npcName}`}
            onBack={handleBack}
        >
            <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
                {/* Top Bar - Goal & Vocabulary Toggle */}
                <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Target size={14} className="text-indigo-400" />
                        <span className="truncate max-w-[300px]">{activePrompt.goal}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Turn {turnCount}/10</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex gap-4 flex-1 min-h-0">
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 border-white/10">
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    message={msg}
                                    isNew={idx === messages.length - 1}
                                />
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-slate-400"
                                >
                                    <Bot size={16} />
                                    <span className="text-sm">{activePrompt.npcName} is typing</span>
                                    <span className="flex gap-1">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </span>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </Card>

                        {/* Input Area */}
                        <div className="mt-3 space-y-2">
                            {/* French Keyboard Toggle */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowFrenchKeyboard(!showFrenchKeyboard)}
                                    className={`text-xs px-3 py-1 rounded-full transition-colors ${showFrenchKeyboard
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    àéç French Accents
                                </button>
                            </div>

                            {showFrenchKeyboard && <FrenchKeyboard onInsert={insertFrenchChar} />}

                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your response in French..."
                                    className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    disabled={isTyping || conversationComplete}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping || conversationComplete}
                                    className="px-6"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel - Vocabulary */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <VocabularyPanel
                            vocabulary={activePrompt.suggestedVocabulary}
                            isOpen={showVocab}
                            onToggle={() => setShowVocab(!showVocab)}
                        />

                        {/* Grammar Focus */}
                        <div className="mt-3 p-4 bg-slate-900/60 border border-white/10 rounded-xl">
                            <div className="flex items-center gap-2 text-amber-400 mb-2">
                                <Sparkles size={14} />
                                <span className="text-sm font-medium">Grammar Focus</span>
                            </div>
                            <div className="space-y-1">
                                {activePrompt.grammarFocus.map((grammar, idx) => (
                                    <div key={idx} className="text-xs text-slate-400">
                                        • {grammar}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GameLayout>
    );
};

export default FreeFormChat;
