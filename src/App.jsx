import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { VocabularyProvider } from './context/VocabularyContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { SyncProvider } from './context/SyncContext';

// Components
const MainMenu = lazy(() => import('./components/MainMenu'));
const FlashcardMode = lazy(() => import('./components/FlashcardMode'));
const StoryMode = lazy(() => import('./components/StoryMode'));
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

const screenVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3, ease: "easeIn" } }
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm tracking-wider uppercase">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();
  const { stats } = useProgress();

  return (
    <div
      className="min-h-screen text-slate-50 overflow-hidden bg-slate-950"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              !stats.onboardingComplete ? <Navigate to="/onboarding" replace /> :
                !stats.placementComplete ? <Navigate to="/placement" replace /> :
                  <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                    <MainMenu />
                  </motion.div>
            } />
            <Route path="/onboarding" element={
              stats.onboardingComplete
                ? <Navigate to={stats.placementComplete ? "/" : "/placement"} replace />
                : <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                  <OnboardingChecklist />
                </motion.div>
            } />
            <Route path="/placement" element={
              !stats.onboardingComplete ? <Navigate to="/onboarding" replace /> :
                stats.placementComplete ? <Navigate to="/" replace /> :
                  <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                    <PlacementQuiz />
                  </motion.div>
            } />
            <Route path="/game/falling-words" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <FallingWordsGame />
              </motion.div>
            } />
            <Route path="/game/flashcards" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <FlashcardMode />
              </motion.div>
            } />
            <Route path="/game/daily-mix" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <DailyMix />
              </motion.div>
            } />
            <Route path="/game/conversation" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <ConversationSimulator />
              </motion.div>
            } />
            <Route path="/game/story" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <StoryMode />
              </motion.div>
            } />
            <Route path="/neighborhood" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <Neighborhood />
              </motion.div>
            } />
            <Route path="/game/sentence-builder" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <SentenceBuilderGame />
              </motion.div>
            } />
            <Route path="/study-session" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <StudySession />
              </motion.div>
            } />
            <Route path="/pronunciation" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <PronunciationCoach />
              </motion.div>
            } />
            <Route path="/game/grammar" element={
              <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                <GrammarDrill />
              </motion.div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <ProgressProvider>
      <VocabularyProvider>
        <SyncProvider>
          <AppRoutes />
        </SyncProvider>
      </VocabularyProvider>
    </ProgressProvider>
  );
}

export default App;
