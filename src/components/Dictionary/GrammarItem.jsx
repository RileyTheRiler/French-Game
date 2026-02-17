import React, { memo } from 'react';

const GrammarItem = memo(({ tip }) => (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
        <h3 className="text-lg font-bold text-[var(--accent-secondary)] mb-2">{tip.title}</h3>
        <p className="text-sm text-white/80 leading-relaxed">{tip.content}</p>
    </div>
));

export default GrammarItem;
