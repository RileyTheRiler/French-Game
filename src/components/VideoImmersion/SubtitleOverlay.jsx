import React from 'react';

const SubtitleOverlay = ({ currentSubtitle, showEnglish, onWordClick }) => {
    if (!currentSubtitle) return null;

    return (
        <div className="absolute bottom-16 left-0 right-0 p-4 text-center z-20 pointer-events-none">
            {/* Main French Subtitle */}
            <div className="mb-2 pointer-events-auto">
                <span className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-xl md:text-2xl font-bold text-white shadow-lg inline-block">
                    {currentSubtitle.tokens.map((token, index) => (
                        <span
                            key={index}
                            onClick={() => {
                                // Only interactive if it's a word (simple heuristic: has definition)
                                if (token.definition) {
                                    onWordClick(token.text);
                                }
                            }}
                            className={`
                                inline-block px-1 rounded cursor-pointer transition-colors
                                ${token.definition ? 'hover:text-[var(--accent-primary)] hover:bg-white/10' : ''}
                            `}
                            title={token.definition || ''}
                        >
                            {token.text}
                        </span>
                    ))}
                </span>
            </div>

            {/* Secondary English Subtitle */}
            {showEnglish && (
                <div className="animate-fade-in pointer-events-auto">
                    <span className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg text-sm md:text-base text-white/90 shadow-lg inline-block">
                        {currentSubtitle.textEn}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SubtitleOverlay;
