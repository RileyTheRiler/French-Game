import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, FileText, Download } from 'lucide-react';
import { GameLayout } from '../components/layout/GameLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const SmartImport = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');

    const handleImport = () => {
        // Mock import logic
        if (text.trim()) {
            // navigate to lesson creation with text
            navigate('/lesson-creator', { state: { importedText: text } });
        }
    };

    return (
        <GameLayout title="Smart Import" onBack={() => navigate('/')}>
            <div className="max-w-2xl mx-auto p-4">
                <Card className="p-6 bg-slate-900 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Wand2 className="text-fuchsia-400" size={32} />
                        <div>
                            <h2 className="text-xl font-bold text-white">Import Content</h2>
                            <p className="text-slate-400 text-sm">Paste French text to generate a lesson instantly.</p>
                        </div>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste French article, story, or conversation here..."
                        className="w-full h-48 bg-slate-800 border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all resize-none mb-4"
                    />

                    <Button onClick={handleImport} disabled={!text.trim()} className="w-full">
                        <FileText className="mr-2" size={18} /> Generate Lesson
                    </Button>
                </Card>
            </div>
        </GameLayout>
    );
};

export default SmartImport;
