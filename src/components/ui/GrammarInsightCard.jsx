import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp, ExternalLink, BookOpen, AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

/**
 * GrammarInsightCard
 * A reusable component for displaying explicit grammar explanations.
 * Shows the rule, why it matters, common mistakes, and links to deeper content.
 */
const GrammarInsightCard = ({
    tip,
    isCorrect = true,
    showDeepDiveLink = true,
    compact = false,
    onDeepDiveClick = null,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(!compact);

    if (!tip) return null;

    // Support both old format (just content) and new format (with whyItMatters, etc.)
    const hasExtendedContent = tip.whyItMatters || tip.commonMistakes || tip.memoryTrick;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <Card className={`
                overflow-hidden border-l-4 
                ${isCorrect
                    ? 'border-l-emerald-500 bg-emerald-500/5'
                    : 'border-l-amber-500 bg-amber-500/5'
                }
            `}>
                {/* Header */}
                <div
                    className={`p-4 flex items-start justify-between gap-3 ${compact ? 'cursor-pointer' : ''}`}
                    onClick={compact ? () => setIsExpanded(!isExpanded) : undefined}
                >
                    <div className="flex items-start gap-3">
                        <div className={`
                            p-2 rounded-xl shrink-0
                            ${isCorrect ? 'bg-emerald-500/20' : 'bg-amber-500/20'}
                        `}>
                            <Lightbulb
                                size={20}
                                className={isCorrect ? 'text-emerald-400' : 'text-amber-400'}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${isCorrect
                                        ? 'border-emerald-500/30 text-emerald-300'
                                        : 'border-amber-500/30 text-amber-300'
                                        }`}
                                >
                                    Grammar Insight
                                </Badge>
                            </div>
                            <h4 className="text-white font-bold">{tip.title}</h4>
                        </div>
                    </div>

                    {compact && (
                        <button
                            className="text-slate-500 hover:text-white transition-colors"
                            aria-label={isExpanded ? "Collapse insight" : "Expand insight"}
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    )}
                </div>

                {/* Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={compact ? { height: 0, opacity: 0 } : false}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-4 pb-4 space-y-4">
                                {/* Main Rule */}
                                <div className="pl-11">
                                    <p className="text-slate-300 leading-relaxed">
                                        {tip.content || tip.shortTip}
                                    </p>
                                </div>

                                {/* Extended Explanation (if available) */}
                                {tip.explanation && (
                                    <div className="pl-11 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-slate-400 text-sm whitespace-pre-line">
                                            {tip.explanation}
                                        </p>
                                    </div>
                                )}

                                {/* Why It Matters */}
                                {tip.whyItMatters && (
                                    <div className="pl-11">
                                        <h5 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                            <BookOpen size={14} />
                                            Why This Matters
                                        </h5>
                                        <p className="text-slate-400 text-sm">
                                            {tip.whyItMatters}
                                        </p>
                                    </div>
                                )}

                                {/* Common Mistakes */}
                                {tip.commonMistakes && tip.commonMistakes.length > 0 && (
                                    <div className="pl-11">
                                        <h5 className="text-sm font-bold text-red-300 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            Common Mistakes
                                        </h5>
                                        <ul className="space-y-1">
                                            {tip.commonMistakes.map((mistake, idx) => (
                                                <li key={idx} className="text-slate-400 text-sm flex items-start gap-2">
                                                    <span className="text-red-400">✗</span>
                                                    {mistake}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Examples */}
                                {tip.examples && tip.examples.length > 0 && (
                                    <div className="pl-11 space-y-2">
                                        <h5 className="text-sm font-bold text-slate-300 mb-2">Examples</h5>
                                        {tip.examples.map((ex, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm">
                                                {ex.wrong && (
                                                    <span className="text-red-400 line-through">{ex.wrong}</span>
                                                )}
                                                {ex.wrong && <span className="text-slate-500">→</span>}
                                                <span className="text-emerald-400 font-medium">{ex.correct}</span>
                                                {ex.reason && (
                                                    <span className="text-slate-500">({ex.reason})</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Memory Trick */}
                                {tip.memoryTrick && (
                                    <div className="pl-11 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                        <h5 className="text-sm font-bold text-purple-300 mb-1">💡 Memory Trick</h5>
                                        <p className="text-purple-200/80 text-sm">{tip.memoryTrick}</p>
                                    </div>
                                )}

                                {/* Deep Dive Link */}
                                {showDeepDiveLink && (
                                    <div className="pl-11 pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-indigo-400 hover:text-indigo-300 gap-2 px-0"
                                            onClick={onDeepDiveClick}
                                        >
                                            <ExternalLink size={14} />
                                            Learn More in Grammar Deep Dive
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
};

export default GrammarInsightCard;
