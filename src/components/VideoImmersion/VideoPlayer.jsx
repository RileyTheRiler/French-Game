import React, { useState, useRef, useEffect } from 'react';
import SubtitleOverlay from './SubtitleOverlay';
import DictionaryModal from '../DictionaryModal';

const VideoPlayer = ({ video, onClose }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showEnglish, setShowEnglish] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedWord, setSelectedWord] = useState(null);

    // Sync subtitles
    const currentSubtitle = video.subtitles.find(
        sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        const handleTimeUpdate = () => setCurrentTime(vid.currentTime);
        const handleLoadedMetadata = () => setDuration(vid.duration);
        const handleEnded = () => setIsPlaying(false);

        vid.addEventListener('timeupdate', handleTimeUpdate);
        vid.addEventListener('loadedmetadata', handleLoadedMetadata);
        vid.addEventListener('ended', handleEnded);

        return () => {
            vid.removeEventListener('timeupdate', handleTimeUpdate);
            vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
            vid.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSpeedChange = () => {
        const newSpeed = playbackSpeed === 1 ? 0.75 : playbackSpeed === 0.75 ? 0.5 : 1;
        setPlaybackSpeed(newSpeed);
        if (videoRef.current) {
            videoRef.current.playbackRate = newSpeed;
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
            {/* Header / Back Button */}
            <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={onClose}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Back to Library</span>
                </button>
                <div className="text-white font-bold text-lg drop-shadow-md">{video.title}</div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                <video
                    ref={videoRef}
                    src={video.videoUrl}
                    className="w-full h-full max-h-screen object-contain"
                    onClick={togglePlay}
                    playsInline
                />

                {/* Subtitles */}
                <SubtitleOverlay
                    currentSubtitle={currentSubtitle}
                    showEnglish={showEnglish}
                    onWordClick={(word) => {
                        videoRef.current.pause();
                        setIsPlaying(false);
                        setSelectedWord(word);
                    }}
                />

                {/* Play/Pause Overlay (when paused) */}
                {!isPlaying && !selectedWord && (
                    <button
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer w-full h-full border-0 p-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-primary)]"
                        onClick={togglePlay}
                        aria-label="Play video"
                    >
                        <div className="bg-white/20 backdrop-blur-md p-6 rounded-full hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-gradient-to-t from-black/90 via-black/80 to-transparent p-6 pb-8 space-y-4 z-30">
                {/* Progress Bar */}
                <div className="flex items-center space-x-4">
                    <span className="text-xs text-white/70 font-mono">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent-primary)] [&::-webkit-slider-thumb]:rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                        aria-label="Seek slider"
                    />
                    <span className="text-xs text-white/70 font-mono">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-[var(--accent-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-full"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.currentTime -= 5;
                                }
                            }}
                            className="text-white/70 hover:text-white transition-colors flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-lg"
                            aria-label="Rewind 5 seconds"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                            </svg>
                            <span className="text-[10px]" aria-hidden="true">-5s</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleSpeedChange}
                            className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-lg backdrop-blur-sm transition-colors"
                        >
                            {playbackSpeed}x
                        </button>

                        <button
                            onClick={() => setShowEnglish(!showEnglish)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-lg backdrop-blur-sm text-sm font-bold transition-all ${showEnglish ? 'bg-[var(--accent-primary)] text-white' : 'bg-white/10 text-white/50'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <span>EN</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Dictionary Modal */}
            {selectedWord && (
                <DictionaryModal
                    onClose={() => setSelectedWord(null)}
                    initialSearchTerm={selectedWord}
                />
            )}
        </div>
    );
};

export default VideoPlayer;
