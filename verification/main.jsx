import React from 'react';
import { createRoot } from 'react-dom/client';
import CallScreen from '../src/components/VoiceCall/CallScreen';

const App = () => (
    <div style={{ height: '100vh', width: '100vw' }}>
        <CallScreen
            npcName="Marie"
            isNpcSpeaking={false}
            isUserListening={true}
            onEndCall={() => {}}
            onToggleMic={() => {}}
            transcript=""
            status="Connected"
        />
    </div>
);

const root = createRoot(document.getElementById('root'));
root.render(<App />);
