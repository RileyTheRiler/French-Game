import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Book, Gamepad2, School, MapPin, MessageCircle, X, Send, ArrowLeft, Mic } from 'lucide-react';
import { PERSONAS } from '../../systems/PersonaDefinitions';
import { npcSystem } from '../../systems/NPCSystem';
import { useProgress } from '../../context/ProgressContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const Building = ({ type, onClick, label, icon: Icon, color, locked, levelRequred }) => (
    <motion.div
        whileHover={!locked ? { y: -10 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={!locked ? onClick : null}
        className={`relative w-72 h-96 mx-6 flex flex-col items-center justify-end pb-4 group ${locked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
    >
        {/* Building Visual */}
        <div className={`w-full h-80 rounded-t-[40px] border border-white/10 relative overflow-hidden backdrop-blur-xl transition-all duration-500 ${color.bg} ${!locked && 'group-hover:ring-4 ring-white/10'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

            {/* Architectural details */}
            <div className="grid grid-cols-2 gap-6 p-8 mt-12">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-t-2xl border-t border-x border-white/10 shadow-inner" />
                ))}
            </div>

            {/* Door */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-28 bg-slate-950/60 rounded-t-2xl border-x border-t border-white/5 shadow-2xl" />

            {/* Floating Sign */}
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-slate-900 border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl z-20"
            >
                <Icon size={36} className={color.text} />
            </motion.div>

            {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] z-30">
                    <Badge variant="default" className="flex items-center gap-2 py-2 px-4 bg-slate-950 border-white/20">
                        🔒 Lvl {levelRequred}
                    </Badge>
                </div>
            )}
        </div>

        {/* Label */}
        <div className="mt-6">
            <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">{label}</h3>
        </div>
    </motion.div>
);

const NPC = ({ persona, onClick }) => (
    <motion.button
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        onClick={() => onClick(persona)}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-30"
    >
        <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 border-2 border-white shadow-2xl flex items-center justify-center text-2xl font-black text-white overflow-hidden group-hover:scale-110 transition-transform">
                {persona.name[0]}
            </div>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg"
            >
                <MessageCircle size={12} className="text-white" />
            </motion.div>
        </div>
        <div className="bg-slate-950/90 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-xs font-bold mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap text-white">
            Talking to {persona.name}
        </div>
    </motion.button>
);

import { useNavigate } from 'react-router-dom';

const Neighborhood = () => {
    const navigate = useNavigate();
    const onNavigate = (targetId) => {
        const routes = {
            menu: '/',
            sentenceBuilder: '/game/sentence-builder',
            conversation: '/game/conversation',
            storyMode: '/game/story',
            pronunciation: '/pronunciation',
            fallingWords: '/game/falling-words',
            studySession: '/study-session',
            dailyMix: '/game/daily-mix'
        };
        if (routes[targetId]) navigate(routes[targetId]);
    };

    const { level } = useProgress();
    const [activeNPC, setActiveNPC] = useState(null);
    const [chatLog, setChatLog] = useState([]);
    const [userInput, setUserInput] = useState("");
    const scrollContainerRef = useRef(null);

    const handleNPCClick = (npc) => {
        setActiveNPC(npc);
        setChatLog([{ sender: "npc", text: npc.greeting }]);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        const newLog = [...chatLog, { sender: "user", text: userInput }];
        setChatLog(newLog);
        setUserInput("");
        const response = await npcSystem.interact(activeNPC.id, userInput);
        setChatLog(prev => [...prev, { sender: "npc", text: response.text }]);
    };

    const LOCATIONS = [
        { id: 'school', label: "L'École", icon: School, color: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' }, target: 'sentenceBuilder', level: 1 },
        { id: 'cafe', label: "Le Café", icon: Coffee, color: { bg: 'bg-amber-600/20', text: 'text-amber-400' }, target: 'conversation', level: 2, npc: PERSONAS['barista'] },
        { id: 'library', label: "Bibliothèque", icon: Book, color: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' }, target: 'storyMode', level: 3, npc: PERSONAS['librarian'] },
        { id: 'studio', label: "Le Studio", icon: Mic, color: { bg: 'bg-rose-500/20', text: 'text-rose-400' }, target: 'pronunciation', level: 3 },
        { id: 'bakery', label: "Boulangerie", icon: School, color: { bg: 'bg-pink-500/20', text: 'text-pink-400' }, target: null, level: 1, npc: PERSONAS['baker'] },
        { id: 'arcade', label: "Salle de Jeux", icon: Gamepad2, color: { bg: 'bg-violet-500/20', text: 'text-violet-400' }, target: 'fallingWords', level: 1 }
    ];

    return (
        <div className="h-screen w-full bg-slate-950 overflow-hidden relative flex flex-col">
            {/* Environmental Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b,_#020617)] overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-20 p-8 flex justify-between items-center bg-gradient-to-b from-slate-950 to-transparent">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" onClick={() => onNavigate('menu')} className="rounded-full h-12 w-12 p-0">
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black text-white title-gradient tracking-tight">Le Quartier</h1>
                        <p className="text-slate-400 font-medium tracking-wide">Explore the town and interact with locals.</p>
                    </div>
                </div>
            </header>

            {/* Town Layer */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden flex items-end pb-24 px-24 gap-4 relative z-10 custom-scrollbar"
            >
                {/* Sidewalk */}
                <div className="absolute bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                <div className="absolute bottom-20 left-0 right-0 h-[2px] bg-white/5 pointer-events-none w-[200%]" />

                {LOCATIONS.map((loc) => (
                    <div key={loc.id} className="relative flex-shrink-0">
                        <Building
                            {...loc}
                            locked={level < loc.level}
                            levelRequred={loc.level}
                            onClick={() => loc.target && onNavigate(loc.target)}
                        />
                        {loc.npc && <NPC persona={loc.npc} onClick={handleNPCClick} />}
                    </div>
                ))}
                <div className="w-48 flex-shrink-0" />
            </div>

            {/* Chat Overlay */}
            <AnimatePresence>
                {activeNPC && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="flex flex-col max-h-[85vh] p-0 border-white/10 shadow-3xl overflow-hidden">
                                <div className="p-6 bg-indigo-600/20 border-b border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-white text-2xl shadow-xl">
                                            {activeNPC.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{activeNPC.name}</h3>
                                            <Badge variant="primary">{activeNPC.role}</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={() => setActiveNPC(null)} className="rounded-full">
                                        <X size={24} />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-950/30">
                                    {chatLog.map((msg, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${msg.sender === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-none shadow-lg'
                                                : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/5 shadow-md'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="p-6 bg-slate-900/50 border-t border-white/10">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Translate or chat in French..."
                                            className="flex-1 bg-slate-800 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
                                        />
                                        <Button size="lg" onClick={handleSendMessage} className="gap-2 px-8">
                                            <Send size={20} /> <span className="hidden sm:inline">Send</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Neighborhood;
