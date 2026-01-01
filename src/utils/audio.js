/**
 * Text-to-Speech Helper
 */

let voices = [];

// Load voices asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

export const speak = (text, lang = 'fr-FR') => {
    // Check Global Audio Setting
    const audioEnabled = localStorage.getItem('frenchApp_audio');
    // Default to true if not set
    if (audioEnabled !== null && JSON.parse(audioEnabled) === false) return;

    // Cancel currently speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Find a specific voice if possible (prioritize Google or native quality)
    const voice = voices.find(v => v.lang.includes('fr') && (v.name.includes('Google') || v.name.includes('Premium')));
    if (voice) utterance.voice = voice;

    // Fallback: any french voice
    if (!utterance.voice) {
        utterance.voice = voices.find(v => v.lang.includes('fr'));
    }

    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
};
