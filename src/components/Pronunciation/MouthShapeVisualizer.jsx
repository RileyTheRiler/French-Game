import React from 'react';

// Maps IPA vowels to approximate mouth shapes (0-1 scale for openness, roundness)
const getMouthShape = (ipa) => {
    // Simplified mapping
    const shapes = {
        'i': { open: 0.1, round: 0.0, width: 0.9 }, // e.g., 'si'
        'e': { open: 0.3, round: 0.0, width: 0.8 }, // e.g., 'blé'
        'ɛ': { open: 0.5, round: 0.0, width: 0.7 }, // e.g., 'père'
        'a': { open: 0.9, round: 0.0, width: 0.6 }, // e.g., 'chat'
        'ɑ': { open: 0.9, round: 0.2, width: 0.5 }, // e.g., 'pâte'
        'ɔ': { open: 0.6, round: 0.6, width: 0.4 }, // e.g., 'sort'
        'o': { open: 0.4, round: 0.8, width: 0.3 }, // e.g., 'beau'
        'u': { open: 0.1, round: 1.0, width: 0.2 }, // e.g., 'tout'
        'y': { open: 0.1, round: 0.9, width: 0.3 }, // e.g., 'tu'
        'ø': { open: 0.3, round: 0.8, width: 0.4 }, // e.g., 'peu'
        'œ': { open: 0.5, round: 0.7, width: 0.5 }, // e.g., 'peur'
        'ə': { open: 0.4, round: 0.4, width: 0.5 }, // e.g., 'le'
        'ɛ̃': { open: 0.5, round: 0.1, width: 0.7 }, // e.g., 'vin'
        'ɑ̃': { open: 0.8, round: 0.3, width: 0.6 }, // e.g., 'sans'
        'ɔ̃': { open: 0.6, round: 0.7, width: 0.4 }, // e.g., 'bon'
        'œ̃': { open: 0.5, round: 0.6, width: 0.5 }, // e.g., 'brun' (often merged with ɛ̃)
    };

    // Find first vowel in IPA string for simplicity of single-icon representation
    const vowels = ['i', 'e', 'ɛ', 'a', 'ɑ', 'ɔ', 'o', 'u', 'y', 'ø', 'œ', 'ə', 'ɛ̃', 'ɑ̃', 'ɔ̃', 'œ̃'];
    for (let char of ipa) {
        if (vowels.includes(char)) return shapes[char];
    }

    // Default neutral
    return { open: 0.3, round: 0.3, width: 0.6 };
};

const MouthShapeVisualizer = ({ ipa, size = 64 }) => {
    const shape = getMouthShape(ipa);

    // Calculate SVG path based on shape params
    // Ellipse-like path: M center-top C control-points center-bottom ...

    const w = size;
    const h = size;
    const cx = w / 2;
    const cy = h / 2;

    // Width of opening
    const lipWidth = 20 + (shape.width * 40); // 20 to 60
    // Height of opening
    const lipHeight = 5 + (shape.open * 40); // 5 to 45
    // Roundness affects the "corner" sharpness (control points)

    // Let's just do two ellipses for upper and lower lips

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-slate-800 rounded-full border border-slate-700">
                {/* Face outline (subtle) */}
                <circle cx={cx} cy={cy} r={size * 0.45} stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />

                {/* Lips */}
                {/* Upper Lip */}
                <ellipse
                    cx={cx}
                    cy={cy - lipHeight / 2}
                    rx={lipWidth / 2}
                    ry={Math.max(3, lipHeight / 4)}
                    fill="#FF8080"
                />
                {/* Lower Lip */}
                <ellipse
                    cx={cx}
                    cy={cy + lipHeight / 2}
                    rx={lipWidth / 2}
                    ry={Math.max(3, lipHeight / 3)}
                    fill="#FF8080"
                />

                {/* Oral Cavity (Darkness between lips) */}
                <ellipse
                    cx={cx}
                    cy={cy}
                    rx={lipWidth / 2 * 0.8}
                    ry={lipHeight / 2 * 0.8}
                    fill="#330000"
                />
            </svg>
            <span className="text-xs text-slate-400 font-mono">/{ipa}/</span>
        </div>
    );
};

export default MouthShapeVisualizer;
