import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';
import { useVocabulary } from '../context/VocabularyContext';
import { ArrowLeft, Plus, Save, Box, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROOMS = {
    kitchen: { name: 'Kitchen', color: '#ffedd5', wallColor: '#fdba74' },
    living: { name: 'Living Room', color: '#dcfce7', wallColor: '#86efac' },
    bedroom: { name: 'Bedroom', color: '#e0f2fe', wallColor: '#7dd3fc' }
};

const ITEMS = [
    { id: 'chair', name: 'La chaise', icon: '🪑' },
    { id: 'table', name: 'La table', icon: '🪑' }, // reused icon for simplicity in POC
    { id: 'apple', name: 'La pomme', icon: '🍎' },
    { id: 'book', name: 'Le livre', icon: '📕' },
    { id: 'cat', name: 'Le chat', icon: '🐱' },
];

const MemoryPalace = () => {
    const navigate = useNavigate();
    const { memoryPalace, updateMemoryPalaceRoom } = useProgress();
    const { userVocabulary } = useVocabulary();
    const [currentRoom, setCurrentRoom] = useState('kitchen');
    const [selectedItem, setSelectedItem] = useState(null);
    const [placedItems, setPlacedItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    // Initialize items from context
    useEffect(() => {
        const roomData = memoryPalace.rooms?.[currentRoom] || {};
        if (roomData.items) {
            setPlacedItems(roomData.items);
        } else {
            setPlacedItems([]);
        }
    }, [currentRoom, memoryPalace]);

    const handleStageClick = (e) => {
        if (!isEditMode || !selectedItem) return;

        // Calculate relative coordinates (percentage)
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newItem = {
            id: Date.now(),
            wordId: selectedItem.id,
            word: selectedItem.name,
            icon: selectedItem.icon,
            x,
            y
        };

        const newItems = [...placedItems, newItem];
        setPlacedItems(newItems);
        updateMemoryPalaceRoom(currentRoom, newItems);
        setSelectedItem(null);
    };

    const handleRemoveItem = (timestampId) => {
        if (!isEditMode) return;
        const newItems = placedItems.filter(item => item.id !== timestampId);
        setPlacedItems(newItems);
        updateMemoryPalaceRoom(currentRoom, newItems);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🧠 Memory Palace
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isEditMode
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isEditMode ? 'Done Placing' : 'Add Words'}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Room Selector */}
                <div className="lg:col-span-1 space-y-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Rooms</h3>
                    {Object.entries(ROOMS).map(([key, data]) => (
                        <button
                            key={key}
                            onClick={() => setCurrentRoom(key)}
                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${currentRoom === key
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                }`}
                        >
                            <Home className="w-5 h-5 opacity-70" />
                            <span className="font-medium">{data.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Stage (Isometric View) */}
                <div className="lg:col-span-3">
                    <div
                        className="relative w-full aspect-video bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
                        style={{
                            perspective: '1000px'
                        }}
                    >
                        {/* Floor */}
                        <div
                            onClick={handleStageClick}
                            className={`absolute inset-4 rounded-xl border-4 transition-colors duration-500 ${isEditMode ? 'cursor-crosshair ring-2 ring-white/20' : ''}`}
                            style={{
                                transform: 'rotateX(20deg)',
                                backgroundColor: ROOMS[currentRoom].color,
                                borderColor: ROOMS[currentRoom].wallColor
                            }}
                        >
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: `radial-gradient(${ROOMS[currentRoom].wallColor} 2px, transparent 2px)`, backgroundSize: '30px 30px' }}
                            />

                            {/* Placed Items */}
                            {placedItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveItem(item.id);
                                    }}
                                >
                                    <span className="text-4xl filter drop-shadow-md transform transition-transform group-hover:scale-110">
                                        {item.icon}
                                    </span>
                                    <span className="mt-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                                        {item.word}
                                    </span>
                                    {isEditMode && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Inventory Bar (Visible when editing) */}
                        <AnimatePresence>
                            {isEditMode && (
                                <motion.div
                                    initial={{ y: 100 }}
                                    animate={{ y: 0 }}
                                    exit={{ y: 100 }}
                                    className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md rounded-xl p-4 border border-slate-700 flex gap-4 overflow-x-auto"
                                >
                                    {ITEMS.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(item);
                                            }}
                                            className={`flex-shrink-0 p-3 rounded-lg flex flex-col items-center gap-1 transition-all border ${selectedItem?.id === item.id
                                                    ? 'bg-purple-600/30 border-purple-500'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                                                }`}
                                        >
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="text-xs text-slate-300">{item.name}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-4 flex gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-purple-400" />
                            <span>{placedItems.length} items placed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                            <span>{isEditMode ? 'Edit Mode Active' : 'View Mode'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemoryPalace;
