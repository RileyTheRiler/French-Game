import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { VocabularyProvider } from './context/VocabularyContext';
import { ToastProvider } from './context/ToastContext';
import { SocialProvider } from './context/SocialContext';
import { MessagingProvider } from './context/MessagingContext';
import { CommunityProvider } from './context/CommunityContext';
import { LearningPathProvider } from './context/LearningPathContext';
import { SyncProvider } from './context/SyncContext';

import MainMenu from './components/MainMenu';
import FallingWordsGame from './components/FallingWords/FallingWordsGame';
import FlashcardMode from './components/FlashcardMode';
import DictationGame from './games/DictationGame';
import ConjugationBlitz from './games/ConjugationBlitz';
import MemoryMatchGame from './games/MemoryMatchGame';
import ErrorSpottingGame from './games/ErrorSpottingGame';
import SentenceBuilderGame from './games/SentenceBuilder/SentenceBuilderGame';
import CultureQuestGame from './games/CultureQuestGame';
import BranchingStoryMode from './components/BranchingStoryMode';
import VoiceCall from './pages/VoiceCall';
import PersonalizedDashboard from './components/PersonalizedDashboard/PersonalizedDashboard';
import SmartImport from './pages/SmartImport';
import MasteryDashboard from './pages/MasteryDashboard';

// Layout wrapper for consistent styling/providers if needed
const AppContent = () => {
    // Global initializers can go here
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            <Routes>
                <Route path="/" element={<MainMenu />} />
                <Route path="/dashboard" element={<PersonalizedDashboard />} />
                <Route path="/mastery" element={<MasteryDashboard />} />
                <Route path="/import" element={<SmartImport />} />

                {/* Games */}
                <Route path="/games/falling-words" element={<FallingWordsGame />} />
                <Route path="/games/flashcards" element={<FlashcardMode mode="standard" />} />
                <Route path="/games/flashcards/mix" element={<FlashcardMode mode="mix" />} />
                <Route path="/games/flashcards/deck/:deckId" element={<FlashcardMode />} />

                <Route path="/games/dictation" element={<DictationGame />} />
                <Route path="/games/conjugation" element={<ConjugationBlitz />} />
                <Route path="/games/memory" element={<MemoryMatchGame />} />
                <Route path="/games/error-spotting" element={<ErrorSpottingGame />} />
                <Route path="/games/sentence-builder" element={<SentenceBuilderGame onExit={() => window.history.back()} />} />
                <Route path="/games/culture-quest" element={<CultureQuestGame />} />
                <Route path="/games/story-mode" element={<BranchingStoryMode />} />
                <Route path="/games/voice-call" element={<VoiceCall />} />
            </Routes>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <ToastProvider>
                <AuthProvider>
                    <ProgressProvider>
                        <VocabularyProvider>
                            <SocialProvider>
                                <MessagingProvider>
                                    <CommunityProvider>
                                        <LearningPathProvider>
                                            <SyncProvider>
                                                <AppContent />
                                            </SyncProvider>
                                        </LearningPathProvider>
                                    </CommunityProvider>
                                </MessagingProvider>
                            </SocialProvider>
                        </VocabularyProvider>
                    </ProgressProvider>
                </AuthProvider>
            </ToastProvider>
        </Router>
    );
};

export default App;
