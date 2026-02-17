import React, { memo } from 'react';
import { Star, Pin, Clock3, BellOff, Volume2 } from 'lucide-react';
import { formatRelativeTime } from '../../utils/time';
import { Button } from '../ui/Button';

const VocabItem = memo(({ word, now, onPlayAudio, onToggleSave, onTogglePin, onSnooze, onClearSnooze, offlineAudio }) => {
    const snoozed = word.snoozeUntil && word.snoozeUntil > now;

    return (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">{word.french}</h3>
                        <button
                            onClick={() => onPlayAudio(word, { preferCache: true, offlineOnly: offlineAudio })}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 transition-colors"
                        >
                            <Volume2 size={14} />
                        </button>
                    </div>
                    <p className="text-[var(--text-secondary)]">{word.english}</p>
                    {(word.lastSeen || word.lastPracticed) && (
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                            <Clock3 size={14} /> Last seen: {formatRelativeTime(word.lastSeen || word.lastPracticed)}
                        </p>
                    )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${word.level >= 5 ? 'bg-green-500/20 text-green-400' :
                        word.level >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-white/10 text-white/40'
                    }`}>
                        Lvl {word.level}
                    </span>
                    <button
                        onClick={() => onToggleSave(word.id)}
                        className={`transition-all hover:scale-110 ${word.isSaved ? 'text-amber-400' : 'text-white/20 hover:text-amber-200'}`}
                        aria-label={word.isSaved ? "Unsave" : "Save"}
                    >
                        <Star size={20} fill={word.isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-3 py-1 h-8 text-xs ${word.pinned ? 'text-emerald-300' : ''}`}
                    onClick={() => onTogglePin(word.id)}
                >
                    <Pin size={12} className="mr-1" /> {word.pinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-3 py-1 h-8 text-xs"
                    onClick={() => snoozed ? onClearSnooze(word.id) : onSnooze(word.id)}
                >
                    <BellOff size={12} className="mr-1" /> {snoozed ? `Unsnooze` : 'Snooze'}
                </Button>
            </div>
        </div>
    );
});

export default VocabItem;
