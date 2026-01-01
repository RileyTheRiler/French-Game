import React, { memo } from 'react';
import { motion } from 'framer-motion';

const WordItem = memo(({ text, x, y, isMatched }) => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute px-6 py-3 rounded-2xl font-black shadow-2xl transition-all whitespace-nowrap backdrop-blur-md border border-white/20
                ${isMatched ? 'scale-150 opacity-0 bg-emerald-500 text-white' : 'bg-white/10 text-white'}
            `}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, 0)`,
                boxShadow: isMatched ? '0 0 30px rgba(16, 185, 129, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
        >
            <span className="relative z-10">{text}</span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
        </motion.div>
    );
});

export default WordItem;
