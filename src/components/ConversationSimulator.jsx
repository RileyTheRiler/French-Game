import SoundManager from '../utils/SoundManager';
import { npcSystem } from '../systems/NPCSystem';
import { useNavigate } from 'react-router-dom';

// ... (other imports)

const ConversationSimulator = () => {
    const navigate = useNavigate();
    const onExit = () => navigate('/');

    // ...

    const handleOptionClick = (option) => {
        SoundManager.playPop();
        // ... (history updates)

        // Find next node
        const nextNode = activeScenario.nodes[option.nextNode];
        if (nextNode) {
            // AI Interaction Side Effect
            if (activeScenario.npcId) {
                npcSystem.interact(activeScenario.npcId, option.text).then(response => {
                    console.log("NPC Thought:", response.text);
                    // In a future update, we could dynamically replace the nextNode message
                    // if (response.text) nextNode.message = response.text; 
                });
            }

            setTimeout(() => {
                if (nextNode.message) {
                    setHistory(prev => [...prev, { text: nextNode.message, speaker: nextNode.speaker, isUser: false }]);
                }


                if (nextNode.end) {
                    setGameOver(true);
                    if (nextNode.success) {
                        addXP(activeScenario.xpReward);
                        SoundManager.playLevelUp();
                        setHistory(prev => [...prev, { text: `🎉 Scenario Complete! +${activeScenario.xpReward} XP`, isSystem: true }]);
                    } else {
                        SoundManager.playMiss();
                        setHistory(prev => [...prev, { text: "Scenario failed. Try again!", isSystem: true }]);
                    }
                } else {
                    setCurrentNodeId(option.nextNode);
                }
            }, 800);
        }
    };

    const reset = () => {
        setActiveScenario(null);
        setHistory([]);
    };

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
                        </div>
                    )}
                </div>
            </div>
        </GameLayout>
    );
};

export default ConversationSimulator;
