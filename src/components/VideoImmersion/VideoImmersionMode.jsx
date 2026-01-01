import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoLibrary from './VideoLibrary';
import VideoPlayer from './VideoPlayer';

const VideoImmersionMode = () => {
    const navigate = useNavigate();
    const [selectedVideo, setSelectedVideo] = useState(null);

    return (
        <div className="min-h-screen bg-slate-950">
            {selectedVideo ? (
                <VideoPlayer
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            ) : (
                <VideoLibrary
                    onSelectVideo={setSelectedVideo}
                    onBack={() => navigate('/')}
                />
            )}
        </div>
    );
};

export default VideoImmersionMode;
