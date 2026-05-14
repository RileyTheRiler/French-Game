import React, { useState, useId } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { GRAMMAR_TIPS } from '../../data/grammarTips';

// The "Monitor" hypothesis suggests conscious learning acts as an editor.
// This component visualizes that "Monitor" process with expandable tips.

const MonitorFeedback = ({ feedback, message, tipId }) => {
    const [showTip, setShowTip] = useState(false);
    const contentId = useId();

    if (!feedback) return null;

    const isSuccess = feedback === 'success';
    const tip = tipId ? GRAMMAR_TIPS[tipId] : null;

    return (
        <div className={`
            fixed bottom-8 right-8 max-w-md p-4 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-500 animate-slide-up z-50
            ${isSuccess
                ? 'bg-green-500/20 border-green-400 text-green-100'
                : 'bg-indigo-500/20 border-indigo-400 text-indigo-100'}
        `}>
            <div className="flex items-start gap-3">
                <div className={`text-2xl ${isSuccess ? 'animate-bounce' : ''}`}>
                    {isSuccess ? '🧠' : '🤔'}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
                        {isSuccess ? 'Monitor Approved' : 'Monitor Check'}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed">
                        {message || (isSuccess ? "Excellent syntax flow!" : "Hmm, something feels off...")}
                    </p>

                    {/* Grammar Tip Expandable Section */}
                    {tip && !isSuccess && (
                        <div className="mt-3 border-t border-white/20 pt-3">
                            <button
                                onClick={() => setShowTip(!showTip)}
                                aria-expanded={showTip}
                                aria-controls={contentId}
                                aria-label={showTip ? `Collapse tip: ${tip.title}` : `Expand tip: ${tip.title}`}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200 hover:text-white transition-colors"
                            >
                                <Lightbulb size={14} />
                                {tip.title}
                                {showTip ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {showTip && (
                                <div id={contentId} className="mt-2 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-300 leading-relaxed">
                                    <p className="mb-2">{tip.shortTip}</p>
                                    {tip.examples.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {tip.examples.slice(0, 1).map((ex, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    {ex.wrong && <span className="text-red-400 line-through">{ex.wrong}</span>}
                                                    <span className="text-green-400">→ {ex.correct}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonitorFeedback;
