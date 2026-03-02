import React, { useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { VocabularyProvider } from './context/VocabularyContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { SyncProvider } from './context/SyncContext';
import { AuthProvider } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import { ToastProvider } from './context/ToastContext';
import { LearningPathProvider } from './context/LearningPathContext';
import { CommunityProvider } from './context/CommunityContext';
import { MessagingProvider } from './context/MessagingContext';
import { A11yProvider } from './context/A11yContext';
import { Confetti } from './components/ui/Confetti';
import { INTERACTION_EVENTS } from './utils/InteractionEffects';

// Core components (not lazy loaded for instant startup)
import MainMenu from './components/MainMenu';
import OfflineBanner from './components/OfflineBanner';
import LoadingFallback from './components/LoadingFallback';
import InstallPrompt from './components/InstallPrompt';
import SkipLink from './components/a11y/SkipLink';

// Lazy-loaded game components
const FlashcardMode = lazy(() => import('./components/FlashcardMode'));
const StoryMode = lazy(() => import('./components/StoryMode'));
const BranchingStoryMode = lazy(() => import('./components/BranchingStoryMode'));
const ReadingRoom = lazy(() => import('./components/ReadingRoom'));
const ListenRepeatLab = lazy(() => import('./components/ListenRepeatLab'));
const CulturalDeepDive = lazy(() => import('./components/CulturalDeepDive'));
const LessonCreator = lazy(() => import('./components/LessonCreator'));
const FallingWordsGame = lazy(() => import('./components/FallingWords/FallingWordsGame'));
const Neighborhood = lazy(() => import('./components/Hub/Neighborhood'));
const ConversationSimulator = lazy(() => import('./components/ConversationSimulator'));
const SentenceBuilderGame = lazy(() => import('./components/SentenceBuilder'));
const StudySession = lazy(() => import('./components/Study/StudySession'));
const DailyMix = lazy(() => import('./components/DailyMix'));
const PronunciationCoach = lazy(() => import('./components/PronunciationCoach'));
const GrammarDrill = lazy(() => import('./components/GrammarDrill'));
const OnboardingChecklist = lazy(() => import('./components/OnboardingChecklist'));
const PlacementQuiz = lazy(() => import('./components/PlacementQuiz'));
const ClozeGame = lazy(() => import('./games/ClozeGame'));
const ErrorSpottingGame = lazy(() => import('./games/ErrorSpottingGame'));
const GrammarLessonView = lazy(() => import('./components/GrammarLessonView'));
const GrammarDeepDive = lazy(() => import('./components/GrammarDeepDive'));
const FreeFormChat = lazy(() => import('./components/FreeFormChat'));
const PersonalizedDashboard = lazy(() => import('./components/PersonalizedDashboard'));
const SRSReviewQueue = lazy(() => import('./components/SRSReviewQueue'));
const DictationGame = lazy(() => import('./games/DictationGame'));
const ConjugationBlitz = lazy(() => import('./games/ConjugationBlitz'));
const MemoryMatchGame = lazy(() => import('./games/MemoryMatchGame'));
const CultureQuestGame = lazy(() => import('./games/CultureQuestGame'));
const VideoImmersion = lazy(() => import('./components/VideoImmersion'));
const SmartImport = lazy(() => import('./pages/SmartImport'));
const VoiceCall = lazy(() => import('./pages/VoiceCall'));
const MasteryDashboard = lazy(() => import('./pages/MasteryDashboard'));
const LearningProfileQuiz = lazy(() => import('./components/LearningProfileQuiz'));
const CustomDeckManager = lazy(() => import('./components/CustomDeckManager'));
const FocusModeSelector = lazy(() => import('./components/FocusModeSelector'));
const FocusSession = lazy(() => import('./components/FocusSession'));

// Learning Modalities
const PodcastMode = lazy(() => import('./components/PodcastMode'));
const VisualStoryCards = lazy(() => import('./components/VisualStoryCards'));
const WritingPad = lazy(() => import('./components/WritingPad'));
const PatternDrills = lazy(() => import('./components/PatternDrills'));
// Cultural Mastery
const FranceMap = lazy(() => import('./components/CultureMastery/FranceMap'));
const SurvivalChallenge = lazy(() => import('./components/CultureMastery/SurvivalChallenge'));
const MediaCenter = lazy(() => import('./components/CultureMastery/MediaCenter'));

// Real World Phase 11
const SlangExplorer = lazy(() => import('./components/RealWorld/SlangExplorer'));
const ProfessionalSuite = lazy(() => import('./components/RealWorld/ProfessionalSuite'));
const DialectTours = lazy(() => import('./components/RealWorld/DialectTours'));

// The AI Linguistic Coach Phase 10
const ProsodyLab = lazy(() => import('./components/Pronunciation/ProsodyLab'));
const GrammarTreeVisualizer = lazy(() => import('./components/GrammarTreeVisualizer'));

const screenVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3, ease: "easeIn" } }
};

// Wrapper component for lazy-loaded routes with Suspense
const LazyRoute = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
      {children}
    </motion.div>
  </Suspense>
);

const AppRoutes = () => {
  const location = useLocation();
  const { stats } = useProgress();
  const confettiRef = useRef(null);

  useEffect(() => {
    const handleConfetti = (e) => {
      confettiRef.current?.fire(e.detail);
    };
    window.addEventListener(INTERACTION_EVENTS.CONFETTI, handleConfetti);
    return () => window.removeEventListener(INTERACTION_EVENTS.CONFETTI, handleConfetti);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <SkipLink />
      <OfflineBanner />
      <InstallPrompt />
      <Confetti ref={confettiRef} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            !stats.onboardingComplete ? <Navigate to="/onboarding" replace /> :
              !stats.placementComplete ? <Navigate to="/placement" replace /> :
                !stats.learningProfile?.completed ? <Navigate to="/profile-quiz" replace /> :
                  <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                    <MainMenu />
                  </motion.div>
          } />
          <Route path="/profile-quiz" element={
            !stats.onboardingComplete ? <Navigate to="/onboarding" replace /> :
              !stats.placementComplete ? <Navigate to="/placement" replace /> :
                stats.learningProfile?.completed ? <Navigate to="/" replace /> :
                  <LazyRoute><LearningProfileQuiz /></LazyRoute>
          } />
          <Route path="/decks" element={<LazyRoute><CustomDeckManager /></LazyRoute>} />
          <Route path="/focus" element={<LazyRoute><FocusModeSelector /></LazyRoute>} />
          <Route path="/focus/:mode" element={<LazyRoute><FocusSession /></LazyRoute>} />
          <Route path="/onboarding" element={
            stats.onboardingComplete
              ? <Navigate to={stats.placementComplete ? "/" : "/placement"} replace />
              : <LazyRoute><OnboardingChecklist /></LazyRoute>
          } />
          <Route path="/placement" element={
            !stats.onboardingComplete ? <Navigate to="/onboarding" replace /> :
              stats.placementComplete ? <Navigate to="/" replace /> :
                <LazyRoute><PlacementQuiz /></LazyRoute>
          } />
          <Route path="/game/falling-words" element={
            <LazyRoute><FallingWordsGame /></LazyRoute>
          } />
          <Route path="/game/flashcards/:deckId?" element={
            <LazyRoute><FlashcardMode /></LazyRoute>
          } />
          <Route path="/game/daily-mix" element={
            <LazyRoute><DailyMix /></LazyRoute>
          } />
          <Route path="/game/conversation" element={
            <LazyRoute><ConversationSimulator /></LazyRoute>
          } />
          <Route path="/game/story" element={
            <LazyRoute><StoryMode /></LazyRoute>
          } />
          <Route path="/game/branching-story" element={
            <LazyRoute><BranchingStoryMode /></LazyRoute>
          } />
          <Route path="/reading-room" element={
            <LazyRoute><ReadingRoom /></LazyRoute>
          } />
          <Route path="/listen-repeat-lab" element={
            <LazyRoute><ListenRepeatLab /></LazyRoute>
          } />
          <Route path="/cultural-deep-dive" element={
            <LazyRoute><CulturalDeepDive /></LazyRoute>
          } />
          <Route path="/lesson-creator" element={
            <LazyRoute><LessonCreator /></LazyRoute>
          } />
          <Route path="/neighborhood" element={
            <LazyRoute><Neighborhood /></LazyRoute>
          } />
          <Route path="/game/sentence-builder" element={
            <LazyRoute><SentenceBuilderGame /></LazyRoute>
          } />
          <Route path="/study-session" element={
            <LazyRoute><StudySession /></LazyRoute>
          } />
          <Route path="/pronunciation" element={
            <LazyRoute><PronunciationCoach /></LazyRoute>
          } />
          <Route path="/game/grammar" element={
            <LazyRoute><GrammarDrill /></LazyRoute>
          } />
          <Route path="/game/cloze" element={
            <LazyRoute><ClozeGame /></LazyRoute>
          } />
          <Route path="/game/error-spotting" element={
            <LazyRoute><ErrorSpottingGame /></LazyRoute>
          } />
          <Route path="/learn/grammar" element={
            <LazyRoute><GrammarLessonView /></LazyRoute>
          } />
          <Route path="/grammar-deep-dive" element={
            <LazyRoute><GrammarDeepDive /></LazyRoute>
          } />
          <Route path="/game/free-chat" element={
            <LazyRoute><FreeFormChat /></LazyRoute>
          } />
          <Route path="/game/srs-review" element={
            <LazyRoute><SRSReviewQueue /></LazyRoute>
          } />
          <Route path="/learn" element={
            <LazyRoute><PersonalizedDashboard /></LazyRoute>
          } />
          <Route path="/video-immersion" element={
            <LazyRoute><VideoImmersion /></LazyRoute>
          } />
          <Route path="/game/dictation" element={
            <LazyRoute><DictationGame /></LazyRoute>
          } />
          <Route path="/game/conjugation-blitz" element={
            <LazyRoute><ConjugationBlitz /></LazyRoute>
          } />
          <Route path="/game/memory-match" element={
            <LazyRoute><MemoryMatchGame /></LazyRoute>
          } />
          <Route path="/game/culture-quest" element={
            <LazyRoute><CultureQuestGame /></LazyRoute>
          } />
          <Route path="/smart-import" element={
            <LazyRoute><SmartImport /></LazyRoute>
          } />
          <Route path="/game/voice-call" element={
            <LazyRoute><VoiceCall /></LazyRoute>
          } />
          <Route path="/mastery" element={
            <LazyRoute><MasteryDashboard /></LazyRoute>
          } />

          {/* Learning Modalities */}
          <Route path="/learn/podcast" element={<LazyRoute><PodcastMode /></LazyRoute>} />
          <Route path="/learn/story-cards" element={<LazyRoute><VisualStoryCards /></LazyRoute>} />
          <Route path="/learn/writing-pad" element={<LazyRoute><WritingPad /></LazyRoute>} />
          <Route path="/learn/pattern-drills" element={<LazyRoute><PatternDrills /></LazyRoute>} />

          {/* Cultural Mastery Phase 8 */}
          <Route path="/culture-map" element={<LazyRoute><FranceMap /></LazyRoute>} />
          <Route path="/survival-challenge" element={<LazyRoute><SurvivalChallenge /></LazyRoute>} />
          <Route path="/media-center" element={<LazyRoute><MediaCenter /></LazyRoute>} />

          {/* Real World Phase 11 */}
          <Route path="/real-world/slang" element={<LazyRoute><SlangExplorer /></LazyRoute>} />
          <Route path="/real-world/professional" element={<LazyRoute><ProfessionalSuite /></LazyRoute>} />
          <Route path="/real-world/dialects" element={<LazyRoute><DialectTours /></LazyRoute>} />

          {/* The AI Linguistic Coach Phase 10 */}
          <Route path="/lab/prosody" element={<LazyRoute><ProsodyLab /></LazyRoute>} />
          <Route path="/lab/sentence-blueprint" element={<LazyRoute><GrammarTreeVisualizer /></LazyRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <A11yProvider>
          <ProgressProvider>
            <VocabularyProvider>
              <LearningPathProvider>
                <SyncProvider>
                  <SocialProvider>
                    <CommunityProvider>
                      <MessagingProvider>
                        <AppRoutes />
                      </MessagingProvider>
                    </CommunityProvider>
                  </SocialProvider>
                </SyncProvider>
              </LearningPathProvider>
            </VocabularyProvider>
          </ProgressProvider>
        </A11yProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
