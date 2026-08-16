import React, { useState, useMemo } from 'react';
import { SENTENCE_BLUEPRINTS } from '../data/sentenceBlueprints';
import { motion, AnimatePresence } from 'framer-motion';

const TreeNode = ({ node, depth = 0 }) => {
    const isLeaf = !node.children || node.children.length === 0;

    // Color mapping
    const colorClasses = {
        indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        rose: 'bg-rose-100 text-rose-800 border-rose-200',
        amber: 'bg-amber-100 text-amber-800 border-amber-200',
        emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        slate: 'bg-slate-100 text-slate-800 border-slate-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200',
        red: 'bg-red-100 text-red-800 border-red-200',
    };

    const baseClass = colorClasses[node.color] || colorClasses.slate;

    return (
        <div className="flex flex-col items-center">
            {/* The Node Itself */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: depth * 0.1 }}
                className={`flex flex-col items-center p-3 rounded-xl border-2 shadow-sm ${baseClass} min-w-[100px] relative hover:shadow-md transition-shadow cursor-default`}
            >
                <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{node.label}</div>
                {node.text && (
                    <div className="text-lg font-bold font-serif">{node.text}</div>
                )}
                {node.note && (
                    <div className="absolute -top-2 -right-2 bg-yellow-300 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold animate-bounce z-10">
                        !
                        <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 w-32 bg-slate-800 text-white text-xs p-2 rounded z-20">
                            {node.note}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Connecting Lines & Children */}
            {!isLeaf && (
                <div className="flex flex-col items-center w-full">
                    {/* Vertical Line Down */}
                    <div className="h-6 w-0.5 bg-slate-300"></div>

                    {/* Horizontal Connector Bar */}
                    <div className="relative w-full flex justify-center">
                        {/* Only show horizontal bar if more than 1 child */}
                        {node.children.length > 1 && (
                            <div className="absolute top-0 left-[calc(50%/var(--child-count)+10px)] right-[calc(50%/var(--child-count)+10px)] h-0.5 bg-slate-300"
                                style={{
                                    left: `calc(${100 / node.children.length / 2}% + 1px)`,
                                    right: `calc(${100 / node.children.length / 2}% + 1px)`
                                }}
                            ></div>
                        )}

                        {/* Children Container */}
                        <div className="flex justify-center gap-4 pt-0 w-full">
                            {node.children.map((child, index) => (
                                <div key={index} className="flex flex-col items-center flex-1 relative">
                                    {/* Vertical Line to Child */}
                                    <div className="h-6 w-0.5 bg-slate-300 absolute -top-0"></div>
                                    <div className="mt-6 w-full flex justify-center">
                                        <TreeNode node={child} depth={depth + 1} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GrammarTreeVisualizer = () => {
    const [selectedId, setSelectedId] = useState(SENTENCE_BLUEPRINTS[0].id);
    // Performance: Memoize the blueprint lookup to avoid O(N) find operation on every re-render.
    const selectedBlueprint = useMemo(() => SENTENCE_BLUEPRINTS.find(b => b.id === selectedId), [selectedId]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2 font-serif flex items-center gap-3">
                    <span className="text-4xl">🏗️</span> Sentence Architects
                </h2>
                <p className="text-slate-600">Visualize the hidden structure of French sentences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Sentence Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                        <h3 className="font-bold text-slate-700 mb-4">Blueprints</h3>
                        <div className="space-y-2">
                            {SENTENCE_BLUEPRINTS.map(bp => (
                                <button
                                    key={bp.id}
                                    onClick={() => setSelectedId(bp.id)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${selectedId === bp.id
                                            ? 'bg-indigo-50 border-indigo-200 border-2 text-indigo-700 shadow-sm'
                                            : 'bg-slate-50 border border-transparent hover:bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    <div className="font-medium truncate">{bp.sentence}</div>
                                    <div className="text-xs opacity-70 mt-1">{bp.translation}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Stage: Tree View */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 min-h-[500px] flex flex-col overflow-x-auto">
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold text-slate-800 font-serif mb-2">
                                {selectedBlueprint.sentence}
                            </h3>
                            <p className="text-slate-500 italic">{selectedBlueprint.translation}</p>
                        </div>

                        {/* Tree Container */}
                        <div className="flex-1 flex justify-center items-start pt-4 overflow-x-auto pb-12">
                            <div className="min-w-max px-8">
                                <TreeNode node={selectedBlueprint.structure} />
                            </div>
                        </div>

                        {/* Explanation Footer */}
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3 mt-auto">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Architect's Note</h4>
                                <p className="text-amber-800 text-sm">{selectedBlueprint.explanation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrammarTreeVisualizer;
