import React from 'react';
import { Badge } from './Badge';

const DIFFICULTY_LABELS = {
    1: 'Casual',
    2: 'Relaxed',
    3: 'Balanced',
    4: 'Challenging',
    5: 'Expert'
};

export const DifficultySlider = ({
    value = 3,
    onChange,
    min = 1,
    max = 5,
    className = '',
    label = 'Difficulty'
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">{label}</span>
                <Badge variant="outline" className="text-[11px]">
                    {DIFFICULTY_LABELS[value] || DIFFICULTY_LABELS[3]}
                </Badge>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(e) => onChange?.(Number(e.target.value))}
                className="w-full accent-indigo-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
                <span>Assist</span>
                <span>Standard</span>
                <span>Pressure</span>
            </div>
        </div>
    );
};

export default DifficultySlider;
