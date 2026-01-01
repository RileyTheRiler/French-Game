import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { Confetti } from './components/ui/Confetti';
import { INTERACTION_EVENTS } from './utils/InteractionEffects';

// Components
import MainMenu from './components/MainMenu';
import FlashcardMode from './components/FlashcardMode';
import StoryMode from './components/StoryMode';
import FallingWordsGame from './components/FallingWords/FallingWordsGame';
import Neighborhood from './components/Hub/Neighborhood';
import ConversationSimulator from './components/ConversationSimulator';
import SentenceBuilderGame from './components/SentenceBuilder';
import StudySession from './components/Study/StudySession';
import DailyMix from './components/DailyMix';
import PronunciationCoach from './components/PronunciationCoach';
import GrammarDrill from './components/GrammarDrill';
import OnboardingChecklist from './components/OnboardingChecklist';
import PlacementQuiz from './components/PlacementQuiz';
import ClozeGame from './games/ClozeGame';
import ErrorSpottingGame from './games/ErrorSpottingGame';
import GrammarLessonView from './components/GrammarLessonView';
import GrammarDeepDive from './components/GrammarDeepDive';
import FreeFormChat from './components/FreeFormChat';
import OfflineBanner from './components/OfflineBanner';
import PersonalizedDashboard from './components/PersonalizedDashboard';
import SRSReviewQueue from './components/SRSReviewQueue';
import VideoImmersionMode from './components/VideoImmersion/VideoImmersionMode';

const screenVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3, ease: "easeIn" } }
};

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
      <OfflineBanner />
      <Confetti ref={confettiRef} />
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
          <Route path="/game/cloze" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <ClozeGame />
            </motion.div>
          } />
          <Route path="/game/error-spotting" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <ErrorSpottingGame />
            </motion.div>
          } />
          <Route path="/learn/grammar" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <GrammarLessonView />
            </motion.div>
          } />
          <Route path="/grammar-deep-dive" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <GrammarDeepDive />
            </motion.div>
          } />
          <Route path="/game/free-chat" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <FreeFormChat />
            </motion.div>
          } />
          <Route path="/game/srs-review" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <SRSReviewQueue />
            </motion.div>
          } />
          <Route path="/learn" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <PersonalizedDashboard />
            </motion.div>
          } />
          <Route path="/video-immersion" element={
            <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
              <VideoImmersionMode />
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
    <AuthProvider>
      <ToastProvider>
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
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
