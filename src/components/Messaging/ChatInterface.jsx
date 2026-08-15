import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Mic, MoreVertical, Check, CheckCheck, Sparkles } from 'lucide-react';
import { useMessaging } from '../../context/MessagingContext';
import { Button } from '../ui/Button';

const ChatInterface = ({ partnerId, onBack }) => {
    const {
        getConversation,
        sendMessage,
        markAsRead,
        typingPartner,
        getSuggestedReplies,
        NATIVE_SPEAKERS
    } = useMessaging();

    const [message, setMessage] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const partner = NATIVE_SPEAKERS.find(s => s.id === partnerId);
    const conversation = getConversation(partnerId);
    const suggestedReplies = getSuggestedReplies(partnerId);
    const isTyping = typingPartner === partnerId;

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isTyping]);

    // Mark as read when viewing
    useEffect(() => {
        markAsRead(partnerId);
    }, [partnerId, markAsRead]);

    const handleSend = () => {
        if (!message.trim()) return;
        sendMessage(partnerId, message.trim());
        setMessage('');
        setShowSuggestions(true);
        inputRef.current?.focus();
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(partnerId, suggestion);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!partner) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                Partner not found
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-slate-900/50">
                <Button aria-label="Go back" variant="ghost" onClick={onBack} className="h-10 w-10 p-0">
                    <ArrowLeft size={20} />
                </Button>
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl">
                        {partner.avatar}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${partner.isOnline ? 'bg-green-500' : 'bg-slate-500'
                        }`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{partner.name}</h3>
                        <span>{partner.country}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        {partner.isOnline ? 'Online' : `Active ${formatRelativeTime(partner.lastActive)}`}
                    </p>
                </div>
                <Button aria-label="More options" variant="ghost" className="h-10 w-10 p-0">
                    <MoreVertical size={20} />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Partner info card */}
                {conversation.length <= 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-4 text-center mb-6"
                    >
                        <div className="text-4xl mb-2">{partner.avatar}</div>
                        <h4 className="font-bold text-white">{partner.name}</h4>
                        <p className="text-sm text-violet-200 mb-2">{partner.city}, {partner.country}</p>
                        <p className="text-xs text-slate-400 mb-3">{partner.bioEn}</p>
                        <div className="flex flex-wrap justify-center gap-1">
                            {partner.specialties.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Message bubbles */}
                {conversation.map((msg, index) => {
                    const isUser = msg.senderId === 'user';
                    const showAvatar = !isUser && (
                        index === 0 ||
                        conversation[index - 1]?.senderId === 'user'
                    );

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isUser && showAvatar && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm flex-shrink-0">
                                    {partner.avatar}
                                </div>
                            )}
                            {!isUser && !showAvatar && <div className="w-8" />}

                            <div className={`max-w-[75%] ${isUser ? 'order-1' : ''}`}>
                                <div className={`px-4 py-2.5 rounded-2xl ${isUser
                                        ? 'bg-violet-600 text-white rounded-br-sm'
                                        : 'bg-slate-800 text-white rounded-bl-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${isUser ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <span>{formatTime(msg.timestamp)}</span>
                                    {isUser && (
                                        msg.read
                                            ? <CheckCheck size={14} className="text-violet-400" />
                                            : <Check size={14} />
                                    )}
                                </div>

                                {/* Correction highlight */}
                                {msg.correction && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs"
                                    >
                                        <p className="text-amber-300 mb-1">💡 Grammar tip:</p>
                                        <p className="text-slate-300">{msg.correction.explanation}</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {/* Typing indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                                {partner.avatar}
                            </div>
                            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested replies */}
            <AnimatePresence>
                {showSuggestions && suggestedReplies.length > 0 && !isTyping && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 border-t border-white/5"
                    >
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                            <Sparkles size={12} />
                            <span>Suggested replies</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedReplies.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(reply)}
                                    className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-sm rounded-full border border-white/5 transition-colors"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                setShowSuggestions(false);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Écris un message..."
                            className="w-full bg-slate-800/50 border border-white/10 rounded-full px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                        <button aria-label="Record voice message" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition-colors">
                            <Mic size={20} />
                        </button>
                    </div>
                    <Button
                        aria-label="Send message"
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="h-12 w-12 rounded-full p-0"
                    >
                        <Send size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Helper function
function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export default ChatInterface;
