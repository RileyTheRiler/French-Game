
// Helper event system to trigger global effects without prop drilling
export const INTERACTION_EVENTS = {
    CONFETTI: 'trigger-confetti',
    SHAKE: 'trigger-shake',
};

export const triggerConfetti = (options = {}) => {
    window.dispatchEvent(new CustomEvent(INTERACTION_EVENTS.CONFETTI, { detail: options }));
};

export const triggerShake = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('animate-shake');
        // Force reflow
        void element.offsetWidth;
        element.classList.add('animate-shake');
    }
};
