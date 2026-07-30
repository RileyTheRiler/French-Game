console.log('Starting Pronunciation sub-component debug...');

async function debug() {
    const components = [
        './components/Pronunciation/AudioVisualizer',
        './components/Pronunciation/MouthShapeVisualizer',
        './components/Pronunciation/MinimalPairDrill',
        './components/Pronunciation/RhythmTrainer',
        './components/PronunciationCoach'
    ];

    for (const path of components) {
        try {
            console.log(`Importing ${path}...`);
            await import(path);
            console.log(`${path} OK`);
        } catch (e) {
            console.error(`DEBUG: Import failed for ${path}`, e);
            // Security: Use textContent and appendChild instead of innerHTML to prevent XSS
            const errorDiv = document.createElement('h3');
            errorDiv.textContent = `Error in ${path}: ${e.message}`;
            document.body.appendChild(errorDiv);
        }
    }
}

debug();
