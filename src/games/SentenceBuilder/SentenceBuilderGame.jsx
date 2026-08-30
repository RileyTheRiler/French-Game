import React, { useState, useEffect } from 'react';
import { SCENARIOS } from './scenarios';
import MonitorFeedback from '../../components/UI/MonitorFeedback';
import { soundManager } from '../../utils/SoundManager';
import { monitorSystem } from '../../systems/MonitorSystem';

const SentenceBuilderGame = ({ onExit }) => {
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [monitorMessage, setMonitorMessage] = useState(null);
    const [monitorTipId, setMonitorTipId] = useState(null);
    const [streak, setStreak] = useState(0);

    const scenario = SCENARIOS[currentScenarioIndex];

    useEffect(() => {
        if (scenario) {
            // Wrap in setTimeout to avoid synchronous state update in effect warning
            setTimeout(() => {
                // Shuffle words for the word bank
                setAvailableWords([...scenario.words].sort(() => Math.random() - 0.5));
                setSelectedWords([]);
                setFeedback(null);
                setMonitorMessage(null);
                setMonitorTipId(null);
            }, 0);
        }
    }, [currentScenarioIndex, scenario]);

    const handleWordClick = (word, idx) => {
        setSelectedWords(prev => [...prev, word]);
        setAvailableWords(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSelectedWordClick = (word, idx) => {
        setAvailableWords(prev => [...prev, word]);
        setSelectedWords(prev => prev.filter((_, i) => i !== idx));
    };

    const checkSentence = () => {
        const formedSentence = selectedWords.join(' ');

        if (formedSentence === scenario.targetSentence) {
            setFeedback('success');
            setMonitorMessage(null);
            setMonitorTipId(null);
            soundManager.playMatch();
            setStreak(s => s + 1);
            setTimeout(() => {
                nextLevel();
            }, 1500);
        } else {
            setFeedback('error');
            const analysis = monitorSystem.analyze(scenario.targetSentence, formedSentence);
            setMonitorMessage(analysis?.message || null);
            setMonitorTipId(analysis?.tipId || null);
            soundManager.playMiss();
            setStreak(0);
        }
    };

    if (!scenario) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-12">
                <button onClick={onExit} className="text-slate-400 hover:text-white">✕ Exit</button>
                <div className="text-xl font-bold text-indigo-400">Streak: {streak} 🔥</div>
            </div>

            {/* Game Area */}
            <div className="max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-center mb-2">Build that Sentence!</h2>
                <p className="text-slate-400 text-center mb-8 italic">Context: "{scenario.context}"</p>

                {/* Construction Zone */}
                <div className={`
                    min-h-[100px] bg-slate-800 rounded-xl p-6 mb-8 border-2 transition-all flex flex-wrap gap-2 items-center justify-center
                    ${feedback === 'success' ? 'border-green-500 bg-green-500/10' : ''}
                    ${feedback === 'error' ? 'border-red-500 bg-red-500/10' : 'border-slate-700'}
                `}>
                    {selectedWords.length === 0 && !feedback && (
                        <span className="text-slate-600">Tap words below to build the sentence...</span>
                    )}

                    {selectedWords.map((word, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectedWordClick(word, idx)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:scale-105 transition-all"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* Word Bank */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {availableWords.map((word, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleWordClick(word, idx)}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg border border-slate-600 transition-all hover:-translate-y-1"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                    {!feedback && selectedWords.length > 0 && (
                        <button
                            onClick={checkSentence}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-105"
                        >
                            Check Answer
                        </button>
                    )}
                </div>
            </div>

            <MonitorFeedback
                feedback={feedback}
                message={
                    monitorMessage || (feedback === 'success'
                        ? `Parfait ! "${scenario.translation}"`
                        : "Something isn't quite right. Check the word order.")
                }
                tipId={monitorTipId}
            />
        </div>
    );
};

export default SentenceBuilderGame;
