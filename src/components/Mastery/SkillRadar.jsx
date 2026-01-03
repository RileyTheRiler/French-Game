import React from 'react';
import { motion } from 'framer-motion';

const SkillRadar = ({ data }) => {
    // Data format: [{ subject: 'Math', A: 120, fullMark: 150 }, ...]
    // We normalize to 100 on the fly

    const size = 300;
    const center = size / 2;
    const radius = 100;
    const angleStep = (Math.PI * 2) / data.length;

    const getCoordinates = (index, value) => {
        const angle = index * angleStep - Math.PI / 2; // Start at top
        // Normalize value (0-100) to radius
        const distance = (value / 100) * radius;
        return {
            x: center + Math.cos(angle) * distance,
            y: center + Math.sin(angle) * distance,
            labelX: center + Math.cos(angle) * (radius + 25),
            labelY: center + Math.sin(angle) * (radius + 25)
        };
    };

    // Construct SVG path for the data
    const pathData = data.map((item, index) => {
        const coords = getCoordinates(index, item.A);
        return `${index === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`;
    }).join(' ') + 'Z';

    // Construct SVG path for the background grid (web)
    const levels = [0.25, 0.5, 0.75, 1];

    return (
        <div className="flex flex-col items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5 relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-indigo-400">⚡</span> Skill Balance
            </h3>

            <div className="relative w-full max-w-[300px] aspect-square">
                <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
                    {/* Background Web */}
                    {levels.map((level, i) => (
                        <path
                            key={i}
                            d={data.map((_, index) => {
                                const angle = index * angleStep - Math.PI / 2;
                                const r = radius * level;
                                const x = center + Math.cos(angle) * r;
                                const y = center + Math.sin(angle) * r;
                                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ') + 'Z'}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Axes */}
                    {data.map((_, index) => {
                        const angle = index * angleStep - Math.PI / 2;
                        const x = center + Math.cos(angle) * radius;
                        const y = center + Math.sin(angle) * radius;
                        return (
                            <line
                                key={index}
                                x1={center} y1={center}
                                x2={x} y2={y}
                                stroke="rgba(255,255,255,0.1)"
                            />
                        );
                    })}

                    {/* Data Polygon with Animation */}
                    <motion.path
                        initial={{
                            d: data.map((_, index) => {
                                // Start from center
                                return `${index === 0 ? 'M' : 'L'} ${center} ${center}`;
                            }).join(' ') + 'Z', opacity: 0
                        }}
                        animate={{ d: pathData, opacity: 0.8 }}
                        transition={{ duration: 1, type: "spring" }}
                        fill="rgba(99, 102, 241, 0.3)" // Indigo 500
                        stroke="rgb(99, 102, 241)"
                        strokeWidth="2"
                    />

                    {/* Points */}
                    {data.map((item, index) => {
                        const coords = getCoordinates(index, item.A);
                        return (
                            <motion.circle
                                key={index}
                                cx={coords.x}
                                cy={coords.y}
                                r="4"
                                fill="white"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                            />
                        );
                    })}

                    {/* Labels */}
                    {data.map((item, index) => {
                        const coords = getCoordinates(index, 100);
                        return (
                            <text
                                key={index}
                                x={coords.labelX}
                                y={coords.labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="10"
                                className="uppercase tracking-wider font-bold"
                            >
                                {item.subject}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default SkillRadar;
