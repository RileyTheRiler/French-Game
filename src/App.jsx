import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProgressProvider } from './context/ProgressContext';
import { VocabularyProvider } from './context/VocabularyContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SyncProvider } from './context/SyncContext';
import { SocialProvider } from './context/SocialContext';
import { MessagingProvider } from './context/MessagingContext';
import { CommunityProvider } from './context/CommunityContext';
import { LearningPathProvider } from './context/LearningPathContext';
import { A11yProvider } from './context/A11yContext';

// Pages & Components
import MainMenu from './components/MainMenu';
import FallingWordsGame from './components/FallingWords/FallingWordsGame';
import FlashcardMode from './components/FlashcardMode';
import GrammarDrill from './components/GrammarDrill';
import StoryMode from './components/StoryMode';
import BranchingStoryMode from './components/BranchingStoryMode';
import ListenRepeatLab from './components/ListenRepeatLab';
import PronunciationCoach from './components/PronunciationCoach';
import CulturalDeepDive from './components/CulturalDeepDive';
import DailyMix from './components/DailyMix';
import ConversationSimulator from './components/ConversationSimulator';
import DictationGame from './games/DictationGame';
import ClozeGame from './games/ClozeGame';
import ErrorSpottingGame from './games/ErrorSpottingGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import CultureQuestGame from './games/CultureQuestGame';
import ConjugationBlitz from './games/ConjugationBlitz';
import PatternDrills from './components/PatternDrills';
import VoiceCall from './pages/VoiceCall';
import SmartImport from './pages/SmartImport';
import MasteryDashboard from './pages/MasteryDashboard';
import LessonCreator from './components/LessonCreator';
import ReadingRoom from './components/ReadingRoom';
import PodcastMode from './components/PodcastMode';
import SentenceBuilderGame from './games/SentenceBuilder/SentenceBuilderGame';
import MediaCenter from './pages/MediaCenter';
import DialectTours from './components/RealWorld/DialectTours';
import SlangExplorer from './components/RealWorld/SlangExplorer';
import ProfessionalSuite from './components/RealWorld/ProfessionalSuite';
import Neighborhood from './components/Hub/Neighborhood';
import PersonalizedDashboard from './components/PersonalizedDashboard/PersonalizedDashboard';
import GrammarDeepDive from './components/GrammarDeepDive';
import GrammarLessonView from './components/GrammarLessonView';
import OnboardingChecklist from './components/OnboardingChecklist';
import PlacementQuiz from './components/PlacementQuiz';
import LearningProfileQuiz from './components/LearningProfileQuiz';
import VisualStoryCards from './components/VisualStoryCards';
import FocusSession from './components/FocusSession';
import SRSReviewQueue from './components/SRSReviewQueue';
import CustomDeckManager from './components/CustomDeckManager';
import FreeFormChat from './components/FreeFormChat';
import SurvivalChallenge from './components/CultureMastery/SurvivalChallenge';
import ProsodyLab from './components/Pronunciation/ProsodyLab';
import InstallPrompt from './components/InstallPrompt';
import OfflineBanner from './components/OfflineBanner';
import LoadingFallback from './components/LoadingFallback';
import VideoImmersion from './components/VideoImmersion/VideoImmersion';
import WritingPad from './components/WritingPad';
import FocusModeSelector from './components/FocusModeSelector';
import DailyGoalRing from './components/DailyGoalRing';
import GoalSettingsModal from './components/GoalSettingsModal';
import WeeklyGoalTracker from './components/WeeklyGoalTracker';
import WeeklyRecapModal from './components/WeeklyRecapModal';
import LeagueProgressWidget from './components/LeagueProgressWidget';
import DailyChallengeWidget from './components/DailyChallengeWidget';
import AchievementsModal from './components/AchievementsModal';
import LeaderboardModal from './components/LeaderboardModal';
import SettingsModal from './components/SettingsModal';
import DictionaryModal from './components/DictionaryModal';
import ShopModal from './components/ShopModal';
import SocialModal from './components/SocialModal';
import StatsModal from './components/StatsModal';
import SmartBreakModal from './components/SmartBreakModal';
import SuccessState from './components/ui/SuccessState';
import Confetti from './components/ui/Confetti';
import LoadingState from './components/ui/LoadingState';
import EmptyState from './components/ui/EmptyState';
import GrammarInsightCard from './components/ui/GrammarInsightCard';
import DifficultyDial from './components/ui/DifficultyDial';
import DifficultySlider from './components/ui/DifficultySlider';
import MonitorFeedback from './components/ui/MonitorFeedback';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Card from './components/ui/Card';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<MainMenu />} />
                <Route path="/falling-words" element={<FallingWordsGame />} />
                <Route path="/flashcards" element={<FlashcardMode />} />
                <Route path="/grammar" element={<GrammarDrill />} />
                <Route path="/story" element={<StoryMode />} />
                <Route path="/story-mode" element={<BranchingStoryMode />} />
                <Route path="/listen-repeat" element={<ListenRepeatLab />} />
                <Route path="/pronunciation" element={<PronunciationCoach />} />
                <Route path="/culture" element={<CulturalDeepDive />} />
                <Route path="/daily-mix" element={<DailyMix />} />
                <Route path="/conversation" element={<ConversationSimulator />} />
                <Route path="/dictation" element={<DictationGame />} />
                <Route path="/cloze" element={<ClozeGame />} />
                <Route path="/error-spotting" element={<ErrorSpottingGame />} />
                <Route path="/memory-match" element={<MemoryMatchGame />} />
                <Route path="/culture-quest" element={<CultureQuestGame />} />
                <Route path="/conjugation-blitz" element={<ConjugationBlitz />} />
                <Route path="/pattern-drills" element={<PatternDrills />} />
                <Route path="/voice-call" element={<VoiceCall />} />
                <Route path="/smart-import" element={<SmartImport />} />
                <Route path="/mastery" element={<MasteryDashboard />} />
                <Route path="/lesson-creator" element={<LessonCreator />} />
                <Route path="/reading-room" element={<ReadingRoom />} />
                <Route path="/podcast" element={<PodcastMode />} />
                <Route path="/sentence-builder" element={<SentenceBuilderGame />} />
                <Route path="/media-center" element={<MediaCenter />} />
                <Route path="/dialects" element={<DialectTours />} />
                <Route path="/slang" element={<SlangExplorer />} />
                <Route path="/professional" element={<ProfessionalSuite />} />
                <Route path="/neighborhood" element={<Neighborhood />} />
                <Route path="/dashboard" element={<PersonalizedDashboard />} />
                <Route path="/grammar-deep-dive" element={<GrammarDeepDive />} />
                <Route path="/grammar-lesson/:topicId" element={<GrammarLessonView />} />
                <Route path="/onboarding" element={<OnboardingChecklist />} />
                <Route path="/placement" element={<PlacementQuiz />} />
                <Route path="/learning-profile" element={<LearningProfileQuiz />} />
                <Route path="/visual-stories" element={<VisualStoryCards />} />
                <Route path="/focus-session" element={<FocusSession />} />
                <Route path="/srs-review" element={<SRSReviewQueue />} />
                <Route path="/custom-decks" element={<CustomDeckManager />} />
                <Route path="/free-chat" element={<FreeFormChat />} />
                <Route path="/survival" element={<SurvivalChallenge />} />
                <Route path="/prosody" element={<ProsodyLab />} />
                <Route path="/video-immersion" element={<VideoImmersion />} />
                <Route path="/writing-pad" element={<WritingPad />} />
            </Routes>
        </AnimatePresence>
    );
};

const App = () => {
    // Service Worker update handling
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // Reload page if SW updates
                // window.location.reload();
                // Better UX: Show toast
                console.log("New version available");
            });
        }
    }, []);

    return (
        <A11yProvider>
            <AuthProvider>
                <ToastProvider>
                    <SyncProvider>
                        <ProgressProvider>
                            <VocabularyProvider>
                                <SocialProvider>
                                    <MessagingProvider>
                                        <CommunityProvider>
                                            <LearningPathProvider>
                                                <Router>
                                                    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
                                                        <AnimatedRoutes />
                                                        <InstallPrompt />
                                                        <OfflineBanner />
                                                    </div>
                                                </Router>
                                            </LearningPathProvider>
                                        </CommunityProvider>
                                    </MessagingProvider>
                                </SocialProvider>
                            </VocabularyProvider>
                        </ProgressProvider>
                    </SyncProvider>
                </ToastProvider>
            </AuthProvider>
        </A11yProvider>
    );
};

export default App;
