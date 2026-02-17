import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Send, Users, FileText, Check, X, Award, ChevronRight } from 'lucide-react';
import { GameLayout } from '../layout/GameLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { INDUSTRIES, EMAIL_TEMPLATES, MEETING_SCENARIOS, VOCABULARY_LISTS } from '../../data/professionalData';
import { useProgress } from '../../context/ProgressContext';
import SoundManager from '../../utils/SoundManager';
import confetti from 'canvas-confetti';

const ProfessionalSuite = () => {
    const navigate = useNavigate();
    const { addXP } = useProgress();

    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [mode, setMode] = useState('dashboard'); // 'dashboard', 'email', 'meeting', 'vocab'

    // Email Builder State
    const [currentEmailTemplate, setCurrentEmailTemplate] = useState(null);
    const [emailBlocks, setEmailBlocks] = useState([]); // User's selected blocks
    const [emailFeedback, setEmailFeedback] = useState(null);

    // Meeting State
    const [currentMeeting, setCurrentMeeting] = useState(null);
    const [meetingStep, setMeetingStep] = useState(0);
    const [meetingScore, setMeetingScore] = useState(0);
    const [meetingFeedback, setMeetingFeedback] = useState(null); // For current choice
    const [meetingComplete, setMeetingComplete] = useState(false);

    // --- Actions ---

    const startEmailBuilder = () => {
        // Find a template for the selected industry, or fallback to first one
        const template = EMAIL_TEMPLATES.find(t => t.industry === selectedIndustry?.id) || EMAIL_TEMPLATES[0];
        setCurrentEmailTemplate(template);
        setEmailBlocks([]);
        setEmailFeedback(null);
        setMode('email');
    };

    const startMeeting = () => {
        const meeting = MEETING_SCENARIOS.find(m => m.industry === selectedIndustry?.id) || MEETING_SCENARIOS[0];
        setCurrentMeeting(meeting);
        setMeetingStep(0);
        setMeetingScore(0);
        setMeetingFeedback(null);
        setMeetingComplete(false);
        setMode('meeting');
    };

    const handleEmailBlockSelect = (block) => {
        if (emailFeedback) return;

        // Simple logic: Add block. verify immediately? Or build whole email?
        // Let's do "Build whole email" then submit.
        // Or simpler for "Game": Select the correct block for the next slot.
        // Let's do: Present 3 options for "Greeting", pick correct. Present 3 for "Body", pick correct.

        // Actually, let's just do a simple "Click to add" from a pool of mixed blocks.
        // For MVP simplicity: Just show all blocks for the template, user has to click them in ORDER?
        // No, let's present "Options" for each step.
        // REFACTOR data usage slightly: We will just filter the blocks provided in the template.

        // New approach for MVP:
        // Show 2 options for "Greeting". User picks one.
        // Show 2 options for "Body". User picks one.
        // etc.

        // To do this dynamically with current data structure:
        // We need to group blocks by 'type'.

        // Let's just use the 'blocks' array. It has correct and incorrect ones mixed.
        // We will filter by 'type' and present them as choices.

        if (emailBlocks.some(b => b.id === block.id)) return; // Already selected

        // Verify correctness immediately for "Game" feel
        if (block.correct) {
            SoundManager.playMatch();
            setEmailBlocks([...emailBlocks, block]);

            // Check completion
            const correctBlocksCount = currentEmailTemplate.blocks.filter(b => b.correct).length;
            if (emailBlocks.length + 1 === correctBlocksCount) {
                setEmailFeedback('complete');
                addXP(50);
                SoundManager.playLevelUp();
                confetti({ particleCount: 100, spread: 70 });
            }
        } else {
            SoundManager.playMiss();
            // Show feedback toast or alert?
            // For now, simple alert or shake
            alert(block.feedback || "Incorrect choice.");
        }
    };

    const handleMeetingOption = (option) => {
        if (meetingFeedback) return;

        const scoreChange = option.score;
        setMeetingScore(prev => prev + scoreChange);
        setMeetingFeedback(option);

        if (scoreChange > 0) SoundManager.playMatch();
        else SoundManager.playMiss();

        setTimeout(() => {
            setMeetingFeedback(null);
            if (meetingStep < currentMeeting.dialogue.length - 1) {
                setMeetingStep(prev => prev + 1);
            } else {
                setMeetingComplete(true);
                addXP(meetingScore + scoreChange);
                if (meetingScore + scoreChange > 0) {
                    SoundManager.playLevelUp();
                    confetti({ particleCount: 100, spread: 70 });
                }
            }
        }, 2000);
    };

    // --- Renderers ---

    const renderDashboard = () => (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-black text-white mb-6 text-center">Professional Suite</h2>

            {!selectedIndustry ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INDUSTRIES.map(ind => (
                        <Card
                            key={ind.id}
                            onClick={() => setSelectedIndustry(ind)}
                            className={`p-6 cursor-pointer hover:border-${ind.color}-500 transition-all hover:bg-slate-800/80 group text-center`}
                        >
                            <div className={`mx-auto mb-4 p-4 rounded-full bg-${ind.color}-500/20 w-16 h-16 flex items-center justify-center`}>
                                {/* Icons would be mapped here, using simple fallback for now */}
                                <Briefcase className={`text-${ind.color}-400`} size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{ind.title}</h3>
                            <p className="text-slate-400">{ind.description}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div>
                    <Button variant="ghost" className="mb-6" onClick={() => setSelectedIndustry(null)}>
                        <ChevronRight className="rotate-180 mr-2" />
                        Change Industry
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 bg-blue-900/20 border-blue-500/30 hover:border-blue-400 cursor-pointer text-center" onClick={startEmailBuilder}>
                            <FileText className="mx-auto text-blue-400 mb-4" size={40} />
                            <h3 className="text-lg font-bold text-white mb-2">Email Builder</h3>
                            <p className="text-sm text-slate-400">Assemble professional emails block by block.</p>
                        </Card>

                        <Card className="p-6 bg-purple-900/20 border-purple-500/30 hover:border-purple-400 cursor-pointer text-center" onClick={startMeeting}>
                            <Users className="mx-auto text-purple-400 mb-4" size={40} />
                            <h3 className="text-lg font-bold text-white mb-2">Meeting Simulator</h3>
                            <p className="text-sm text-slate-400">Navigate crucial conversations and negotiations.</p>
                        </Card>

                        <Card className="p-6 bg-amber-900/20 border-amber-500/30 hover:border-amber-400 cursor-pointer text-center" onClick={() => setMode('vocab')}>
                            <Briefcase className="mx-auto text-amber-400 mb-4" size={40} />
                            <h3 className="text-lg font-bold text-white mb-2">Lexique Pro</h3>
                            <p className="text-sm text-slate-400">Essential vocabulary for {selectedIndustry.title}.</p>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );

    const renderEmailBuilder = () => {
        // Group remaining blocks by type to find the "next" type to show?
        // Or just show all available choices for the current "Section" (Greeting, Body, Closing, Signoff)
        // Let's deduce the next step based on what's already selected.
        // Order: greeting -> body -> closing -> signoff

        const types = ['greeting', 'body', 'closing', 'signoff'];
        // Find the first type that doesn't have a selected block
        const currentType = types.find(t => !emailBlocks.some(b => b.type === t));

        const choices = currentType
            ? currentEmailTemplate.blocks.filter(b => b.type === currentType)
            : [];

        return (
            <div className="max-w-2xl mx-auto p-4">
                <Card className="p-8 min-h-[500px] flex flex-col relative bg-white text-slate-900">
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-slate-500 text-sm uppercase">New Message</h3>
                        <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-lg">Subject: {currentEmailTemplate.title}</span>
                            <Badge variant="outline" className="text-slate-500 border-slate-300">{selectedIndustry.title}</Badge>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 font-serif text-lg">
                        {emailBlocks.map((block, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                {block.text}
                            </motion.div>
                        ))}

                        {emailFeedback === 'complete' ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-8 p-4 bg-green-100 text-green-800 rounded-lg text-center font-sans font-bold">
                                Email Complete! Good job.
                            </motion.div>
                        ) : (
                            <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-4">
                                <p className="text-slate-400 text-sm font-sans mb-3">Select the best {currentType}:</p>
                                <div className="grid gap-3">
                                    {choices.map(block => (
                                        <Button
                                            key={block.id}
                                            variant="ghost"
                                            className="justify-start text-left h-auto py-3 px-4 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 text-slate-700"
                                            onClick={() => handleEmailBlockSelect(block)}
                                        >
                                            {block.text}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    };

    const renderMeeting = () => {
        if (meetingComplete) {
            return (
                <div className="max-w-xl mx-auto p-8 text-center">
                    <Card className="p-8 bg-slate-800 border-slate-700">
                        <Award className="mx-auto text-yellow-400 mb-4" size={64} />
                        <h2 className="text-3xl font-bold text-white mb-2">Meeting Adjourned</h2>
                        <p className="text-slate-300 mb-6">Final Score: {meetingScore}</p>
                        <Button onClick={() => setMode('dashboard')}>Back to Office</Button>
                    </Card>
                </div>
            );
        }

        const step = currentMeeting.dialogue[meetingStep];

        return (
            <div className="max-w-3xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">
                        {currentMeeting.title}
                    </Badge>
                    <span className="text-slate-400">Score: {meetingScore}</span>
                </div>

                <Card className="p-6 mb-6 bg-slate-800/80 border-slate-600 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                    <div className="text-center z-10">
                        <div className="text-4xl mb-2">{currentMeeting.participants[0].avatar}</div>
                        <h3 className="text-indigo-400 font-bold mb-4">{step.speaker}</h3>
                        <p className="text-2xl text-white font-medium">"{step.text}"</p>
                    </div>
                    {/* Background blob for atmosphere */}
                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 blur-[100px]" />
                </Card>

                <div className="space-y-3">
                    {step.options.map((option, idx) => (
                        <Button
                            key={idx}
                            variant="outline"
                            className={`w-full justify-start text-left p-4 h-auto text-lg transition-all
                                ${meetingFeedback === option
                                    ? option.score > 0
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                        : 'bg-red-500/20 border-red-500 text-red-300'
                                    : 'hover:bg-slate-800'
                                }
                            `}
                            onClick={() => handleMeetingOption(option)}
                            disabled={!!meetingFeedback}
                        >
                            {option.text}
                            {meetingFeedback === option && (
                                <span className="ml-auto text-sm opacity-70">
                                    {option.score > 0 ? `+${option.score}` : option.score}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {meetingFeedback && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-slate-800 rounded-lg text-center text-slate-300">
                        {meetingFeedback.feedback}
                    </motion.div>
                )}
            </div>
        );
    };

    const renderVocab = () => {
        const list = VOCABULARY_LISTS.find(l => l.industry === selectedIndustry.id);
        return (
            <div className="max-w-2xl mx-auto p-4">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">{selectedIndustry.title} Vocabulary</h2>
                <div className="grid gap-4">
                    {list?.words.map((word, i) => (
                        <Card key={i} className="p-4 flex justify-between items-center bg-slate-800/50 hover:bg-slate-800 transition-colors">
                            <span className="text-lg font-bold text-indigo-300">{word.french}</span>
                            <span className="text-slate-400">{word.english}</span>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <GameLayout
            title="Professional Suite"
            onBack={mode === 'dashboard' ? () => navigate('/') : () => setMode('dashboard')}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    {mode === 'dashboard' && renderDashboard()}
                    {mode === 'email' && renderEmailBuilder()}
                    {mode === 'meeting' && renderMeeting()}
                    {mode === 'vocab' && renderVocab()}
                </motion.div>
            </AnimatePresence>
        </GameLayout>
    );
};

export default ProfessionalSuite;
