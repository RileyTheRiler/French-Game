import React from 'react';
import { VIDEO_CONTENT } from '../../data/videoContent';

const VideoLibrary = ({ onSelectVideo, onBack }) => {
    return (
        <div className="min-h-screen bg-slate-900 p-6 animate-fade-in text-white pb-24">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex items-center">
                <button
                    onClick={onBack}
                    className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-black title-gradient">Immersion Video Library</h1>
                    <p className="text-white/60">Watch authentic content with dual subtitles</p>
                </div>
            </div>

            {/* Video Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VIDEO_CONTENT.map(video => (
                    <button
                        key={video.id}
                        onClick={() => onSelectVideo(video)}
                        className="w-full text-left bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-[var(--accent-primary)] hover:scale-[1.02] transition-all cursor-pointer group shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-black">
                            <img
                                src={video.thumbnail}
                                alt=""
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full group-hover:bg-[var(--accent-primary)] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                                {video.duration}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
                                    {video.title}
                                </h3>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${video.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                        video.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {video.level}
                                </span>
                            </div>
                            <p className="text-sm text-white/60 line-clamp-2">
                                {video.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VideoLibrary;
