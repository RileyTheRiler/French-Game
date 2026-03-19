import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MapPin, Star, ChevronRight } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { REGIONS, getUnlockedRegions, getNextRegionToUnlock } from '../../data/regionData';
import RegionExplorer from './RegionExplorer';

// SVG path data for simplified France regions
const REGION_PATHS = {
    paris: "M 140 85 L 155 80 L 165 90 L 160 105 L 145 100 Z",
    brittany: "M 50 85 L 80 70 L 100 80 L 95 100 L 70 110 L 45 100 Z",
    provence: "M 170 180 L 200 165 L 220 175 L 225 200 L 200 215 L 175 205 Z",
    alsace: "M 210 70 L 230 60 L 245 75 L 240 100 L 220 105 L 205 90 Z",
    loire: "M 110 115 L 145 108 L 160 125 L 155 150 L 125 155 L 105 140 Z",
    bordeaux: "M 70 155 L 100 140 L 115 160 L 110 195 L 80 210 L 60 190 Z"
};

const FranceMap = () => {
    const navigate = useNavigate();
    const { level, stats } = useProgress();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);

    const unlockedRegions = useMemo(() => getUnlockedRegions(level), [level]);
    const nextToUnlock = useMemo(() => getNextRegionToUnlock(level), [level]);

    const isUnlocked = (regionId) => unlockedRegions.some(r => r.id === regionId);

    const getRegionProgress = (regionId) => {
        const progress = stats.regionProgress?.[regionId] || 0;
        return progress;
    };

    const handleRegionClick = (region) => {
        if (isUnlocked(region.id)) {
            setSelectedRegion(region);
        }
    };

    const handleKeyDown = (e, region) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRegionClick(region);
        }
    };

    if (selectedRegion) {
        return (
            <RegionExplorer
                region={selectedRegion}
                onBack={() => setSelectedRegion(null)}
            />
        );
    }

    return (
        <GameLayout
            title="Explore France"
            subtitle="Discover regions, dialects, and culture"
            onBack={() => navigate('/')}
            headerRight={
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                    {unlockedRegions.length} / {REGIONS.length} Regions
                </Badge>
            }
        >
            <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interactive Map */}
                <Card className="p-6 bg-slate-800/80 border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="text-indigo-400" size={20} />
                        Interactive Map
                    </h2>

                    <div className="relative">
                        <svg
                            viewBox="0 0 280 280"
                            className="w-full h-auto"
                            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
                        >
                            {/* France outline background */}
                            <path
                                d="M 50 50 Q 80 30, 150 35 Q 220 40, 245 80 Q 260 120, 240 160 Q 220 200, 200 230 Q 160 260, 120 250 Q 80 240, 50 200 Q 30 160, 40 120 Q 45 80, 50 50 Z"
                                fill="#1e293b"
                                stroke="#475569"
                                strokeWidth="2"
                            />

                            {/* Region paths */}
                            {REGIONS.map(region => {
                                const path = REGION_PATHS[region.id];
                                const unlocked = isUnlocked(region.id);
                                const isHovered = hoveredRegion === region.id;
                                const progress = getRegionProgress(region.id);

                                return (
                                    <g key={region.id}>
                                        <motion.path
                                            d={path}
                                            fill={unlocked ? region.color : '#374151'}
                                            stroke={isHovered ? '#fff' : '#1e293b'}
                                            strokeWidth={isHovered ? 3 : 1.5}
                                            opacity={unlocked ? (isHovered ? 1 : 0.8) : 0.4}
                                            className={unlocked ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white' : 'cursor-not-allowed'}
                                            onMouseEnter={() => setHoveredRegion(region.id)}
                                            onMouseLeave={() => setHoveredRegion(null)}
                                            onClick={() => handleRegionClick(region)}
                                            onKeyDown={(e) => handleKeyDown(e, region)}
                                            role="button"
                                            tabIndex={unlocked ? 0 : -1}
                                            aria-label={unlocked ? `Explore ${region.name}` : `${region.name} (Locked: Level ${region.unlockLevel} required)`}
                                            whileHover={unlocked ? { scale: 1.05 } : {}}
                                            style={{ transformOrigin: 'center' }}
                                        />

                                        {/* Lock icon for locked regions */}
                                        {!unlocked && (
                                            <text
                                                x={region.coordinates.x * 2.8}
                                                y={region.coordinates.y * 2.8 + 5}
                                                textAnchor="middle"
                                                fontSize="16"
                                                fill="#9ca3af"
                                            >
                                                🔒
                                            </text>
                                        )}

                                        {/* Progress indicator for unlocked regions */}
                                        {unlocked && progress > 0 && (
                                            <circle
                                                cx={region.coordinates.x * 2.8}
                                                cy={region.coordinates.y * 2.8}
                                                r="8"
                                                fill="#10b981"
                                                stroke="#fff"
                                                strokeWidth="2"
                                            />
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Hover tooltip */}
                        <AnimatePresence>
                            {hoveredRegion && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 shadow-xl"
                                >
                                    {(() => {
                                        const region = REGIONS.find(r => r.id === hoveredRegion);
                                        const unlocked = isUnlocked(hoveredRegion);
                                        return (
                                            <div className="text-center">
                                                <p className="font-bold text-white">{region?.name}</p>
                                                <p className="text-sm text-slate-400">
                                                    {unlocked ? 'Click to explore!' : `Unlock at Level ${region?.unlockLevel}`}
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Region List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Star className="text-amber-400" size={20} />
                        Regions to Explore
                    </h2>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {REGIONS.map(region => {
                            const unlocked = isUnlocked(region.id);
                            const progress = getRegionProgress(region.id);

                            return (
                                <motion.div
                                    key={region.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={unlocked ? { scale: 1.02 } : {}}
                                >
                                    <Card
                                        role="button"
                                        tabIndex={unlocked ? 0 : -1}
                                        aria-label={unlocked ? `Explore ${region.name}` : `${region.name} (Locked: Level ${region.unlockLevel} required)`}
                                        className={`p-4 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${unlocked
                                                ? 'bg-slate-800/60 hover:bg-slate-700/60 border-slate-600'
                                                : 'bg-slate-900/60 border-slate-700 opacity-60'
                                            }`}
                                        onClick={() => handleRegionClick(region)}
                                        onKeyDown={(e) => handleKeyDown(e, region)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: unlocked ? region.color : '#374151' }}
                                                >
                                                    {unlocked ? (
                                                        <MapPin className="text-white" size={20} />
                                                    ) : (
                                                        <Lock className="text-slate-400" size={16} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{region.name}</h3>
                                                    <p className="text-sm text-slate-400">
                                                        {unlocked ? region.capital : `Level ${region.unlockLevel} required`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {unlocked && progress > 0 && (
                                                    <Badge variant="success" className="text-xs">
                                                        {progress}%
                                                    </Badge>
                                                )}
                                                {unlocked && (
                                                    <ChevronRight className="text-slate-400" size={20} />
                                                )}
                                            </div>
                                        </div>

                                        {unlocked && (
                                            <div className="mt-3">
                                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Next unlock hint */}
                    {nextToUnlock && (
                        <Card className="p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-full">
                                    <Lock className="text-indigo-400" size={16} />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-300">
                                        Next: <span className="font-bold">{nextToUnlock.name}</span>
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Reach Level {nextToUnlock.unlockLevel} to unlock
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </GameLayout>
    );
};

export default FranceMap;
