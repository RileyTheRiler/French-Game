// Simple Procedural Sound Manager (No external assets required)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SoundManager = {
    playTone: (freq, type, duration) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },

    playSuccess: () => {
        // High pitched happy chord
        SoundManager.playTone(600, 'sine', 0.3);
        setTimeout(() => SoundManager.playTone(800, 'sine', 0.4), 100);
    },

    playFailure: () => {
        // Low pitched sad tone
        SoundManager.playTone(200, 'sawtooth', 0.3);
        setTimeout(() => SoundManager.playTone(150, 'sawtooth', 0.4), 100);
    },

    init: () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    },

    playMatch: () => {
        SoundManager.playSuccess();
    },

    playLevelUp: () => {
        // Arpeggio
        const now = audioCtx.currentTime;
        SoundManager.playTone(400, 'sine', 0.1);
        setTimeout(() => SoundManager.playTone(500, 'sine', 0.1), 100);
        setTimeout(() => SoundManager.playTone(600, 'sine', 0.1), 200);
        setTimeout(() => SoundManager.playTone(800, 'sine', 0.4), 300);
    },

    playMiss: () => {
        SoundManager.playTone(150, 'sawtooth', 0.2);
    },

    playGameOver: () => {
        SoundManager.playFailure();
    },

    playFlip: () => {
        // Quick Swoosh
        SoundManager.playTone(300, 'triangle', 0.1);
    },

    playPop: () => {
        SoundManager.playTone(500, 'sine', 0.1);
    }
};

export default SoundManager;
