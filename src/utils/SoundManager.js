class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
    }

    init() {
        // Preload sounds if needed
    }

    play(soundName) {
        if (!this.enabled) return;
        // eslint-disable-next-line no-unused-vars
        const now = Date.now();
        console.log(`Playing sound: ${soundName}`);
        // Actual implementation would play audio
    }

    playSuccess() { this.play('success'); }
    playMiss() { this.play('miss'); }
    playClick() { this.play('click'); }
    playMatch() { this.play('match'); }
    playLevelUp() { this.play('levelup'); }
    playGameOver() { this.play('gameover'); }
    playFlip() { this.play('flip'); }
    playPop() { this.play('pop'); }
}

export const soundManager = new SoundManager();
export default soundManager;
