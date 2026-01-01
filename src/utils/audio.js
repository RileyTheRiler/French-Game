/**
 * Text-to-Speech Helper
 */

let voices = [];
const AUDIO_CACHE_KEY = 'frenchApp_audioCache';
const OFFLINE_AUDIO_PREF_KEY = 'frenchApp_offlineAudio';

const loadAudioCache = () => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(AUDIO_CACHE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn('Unable to parse cached audio', error);
        return {};
    }
};

let cachedAudio = loadAudioCache();

// Load voices asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

const saveAudioCache = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUDIO_CACHE_KEY, JSON.stringify(cachedAudio));
};

export const speak = (text, lang = 'fr-FR', options = {}) => {
    if (typeof lang === 'object') {
        options = lang;
        lang = options.lang || 'fr-FR';
    }

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

    utterance.rate = options.rate || 0.9; // Slightly slower for learning
    utterance.pitch = options.pitch || 1.0;

    window.speechSynthesis.speak(utterance);
};

const playAudioUrl = (src) => new Promise((resolve, reject) => {
    try {
        const audio = new Audio(src);
        audio.onended = resolve;
        audio.onerror = reject;
        audio.play();
    } catch (error) {
        reject(error);
    }
});

export const cacheWordAudio = async (word) => {
    if (!word?.id) return null;
    if (cachedAudio[word.id]) return cachedAudio[word.id];

    // If we have a recorded URL, fetch and store it locally
    if (word.audioUrl) {
        try {
            const response = await fetch(word.audioUrl);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            cachedAudio[word.id] = {
                type: 'file',
                objectUrl,
                cachedAt: Date.now()
            };
            saveAudioCache();
            return cachedAudio[word.id];
        } catch (error) {
            console.warn('Failed to cache recorded audio, falling back to TTS', error);
        }
    }

    cachedAudio[word.id] = {
        type: 'tts',
        text: word.audio?.text || word.french,
        cachedAt: Date.now()
    };
    saveAudioCache();
    return cachedAudio[word.id];
};

export const cacheVocabularyAudio = async (words = []) => {
    for (const word of words) {
        await cacheWordAudio(word);
    }
    return cachedAudio;
};

export const playWordAudio = async (word, options = {}) => {
    const { preferCache = true, offlineOnly = false, rate, pitch } = options;
    if (!word) return;

    let source = cachedAudio[word.id];
    if (!source && preferCache) {
        source = await cacheWordAudio(word);
    }

    if (source?.objectUrl) {
        try {
            await playAudioUrl(source.objectUrl);
            return;
        } catch (error) {
            console.warn('Cached audio failed to play, retrying with TTS', error);
        }
    }

    if (offlineOnly && source && source.type !== 'tts' && !source.objectUrl) return;

    speak(word.audio?.text || word.french, { rate, pitch });
};

export const warmVoiceCache = () => {
    if (voices.length === 0 && typeof window !== 'undefined' && window.speechSynthesis) {
        // Trigger a no-op utterance so voices are hydrated before offline use
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
    }
};

export const getCachedAudio = () => cachedAudio;
export const clearAudioCache = () => {
    cachedAudio = {};
    saveAudioCache();
};

export const getOfflinePreference = () => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(OFFLINE_AUDIO_PREF_KEY);
    return saved ? JSON.parse(saved) : false;
};

export const setOfflinePreference = (value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(OFFLINE_AUDIO_PREF_KEY, JSON.stringify(value));
};
