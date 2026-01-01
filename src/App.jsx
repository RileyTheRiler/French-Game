import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { VocabularyProvider } from './context/VocabularyContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';

// Components
import MainMenu from './components/MainMenu';
import FlashcardMode from './components/FlashcardMode';
import StoryMode from './components/StoryMode';
import FallingWordsGame from './components/FallingWords/FallingWordsGame';
import Neighborhood from './components/Hub/Neighborhood';
import ConversationSimulator from './components/ConversationSimulator';
import SentenceBuilderGame from './components/SentenceBuilder'; // Fixed path
import StudySession from './components/Study/StudySession';
import DailyMix from './components/DailyMix';
import PronunciationCoach from './components/PronunciationCoach';
import GrammarDrill from './components/GrammarDrill';
import OnboardingChecklist from './components/OnboardingChecklist';
import PlacementQuiz from './components/PlacementQuiz';

const screenVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3, ease: "easeIn" } }
};

const AppRoutes = () => {
  const location = useLocation();
  const { stats } = useProgress();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <ProgressProvider>
      <VocabularyProvider>
        <AppRoutes />
      </VocabularyProvider>
    </ProgressProvider>
  );
}

export default App;
