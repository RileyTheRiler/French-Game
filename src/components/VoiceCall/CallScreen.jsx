import React from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, User } from 'lucide-react';

const CallScreen = ({ npcName, isNpcSpeaking, isUserListening, onEndCall, onToggleMic, transcript, status }) => {
    return (
        <div id="main-content" tabIndex={-1} className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-900 pointer-events-none" />

            {/* Header / Info */}
            <div className="pt-12 pb-4 text-center z-10">
                <h2 className="text-2xl font-semibold text-white tracking-wide">{npcName}</h2>
                <div className="text-sm text-indigo-300 font-medium h-6">
                    {isNpcSpeaking ? 'Speaking...' : isUserListening ? 'Listening...' : status}
                </div>
                <div className="text-xs text-slate-500 mt-1">00:42</div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">

                {/* NPC Avatar / Waveform */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{
                            scale: isNpcSpeaking ? [1, 1.1, 1] : 1,
                            borderColor: isNpcSpeaking ? "rgba(129, 140, 248, 0.8)" : "rgba(71, 85, 105, 0.3)"
                        }}
                        transition={{ duration: 1.5, repeat: isNpcSpeaking ? Infinity : 0 }}
                        className="w-40 h-40 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-2xl overflow-hidden"
                    >
                        <User size={64} className="text-slate-400" />
                    </motion.div>

                    {/* Ripple Effects when speaking */}
                    {isNpcSpeaking && (
                        <>
                            <motion.div
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 2 }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-full border border-indigo-500/50"
                            />
                            <motion.div
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                className="absolute inset-0 rounded-full border border-indigo-500/30"
                            />
                        </>
                    )}
                </div>

                {/* Transcript / Feedback Area */}
                <div className="h-24 w-full flex items-center justify-center">
                    <p className={`text-center text-lg font-medium transition-all ${transcript ? 'text-white' : 'text-slate-600'
                        }`}>
                        {transcript || (isUserListening ? "Say something..." : "Tap mic to speak")}
                    </p>
                </div>

            </div>

            {/* Controls */}
            <div className="pb-12 pt-8 flex items-center justify-center gap-8 z-10 bg-gradient-to-t from-slate-900 to-transparent">

                {/* Mic Button */}
                <button
                    onClick={onToggleMic}
                    aria-label={isUserListening ? "Mute microphone" : "Unmute microphone"}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${isUserListening
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }`}
                >
                    {isUserListening ? <Mic size={28} /> : <MicOff size={28} />}
                </button>

                {/* End Call Button */}
                <button
                    onClick={onEndCall}
                    aria-label="End call"
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                    <PhoneOff size={28} />
                </button>
            </div>
        </div>
    );
};

export default CallScreen;
