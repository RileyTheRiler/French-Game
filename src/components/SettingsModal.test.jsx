import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsModal from './SettingsModal';

// Mock contexts
const mockProgress = {
    audioEnabled: true,
    toggleAudio: vi.fn(),
    offlineAudio: false,
    toggleOfflineAudio: vi.fn(),
    reducedMotion: false,
    toggleReducedMotion: vi.fn(),
    colorTheme: 'midnight',
    switchColorTheme: vi.fn(),
    resetProgress: vi.fn(),
    difficultySettings: { learnerType: 'casual', challengeMode: false },
    updateDifficultySettings: vi.fn(),
    stats: { speedRoundEnabled: true },
    updateStats: vi.fn(),
    globalDifficulty: 50,
    setGlobalDifficulty: vi.fn()
};

const mockVocabulary = {
    resetVocabulary: vi.fn(),
    downloadAudioOnce: vi.fn()
};

const mockAuth = {
    user: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    loading: false,
    error: null
};

const mockSync = {
    exportData: vi.fn(),
    importData: vi.fn(),
    status: 'idle',
    lastSyncedAt: null,
    syncing: false
};

vi.mock('../context/ProgressContext', () => ({
    useProgress: () => mockProgress
}));

vi.mock('../context/VocabularyContext', () => ({
    useVocabulary: () => mockVocabulary
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockAuth
}));

vi.mock('../context/SyncContext', () => ({
    useSync: () => mockSync
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock icons to avoid rendering issues
vi.mock('lucide-react', () => ({
    X: () => <svg data-testid="icon-close" />,
    Volume2: () => <svg data-testid="icon-vol" />,
    VolumeX: () => <svg data-testid="icon-mute" />,
    Check: () => <svg data-testid="icon-check" />,
    CloudUpload: () => <svg data-testid="icon-upload" />,
    CloudDownload: () => <svg data-testid="icon-download" />,
    UserRound: () => <svg data-testid="icon-user" />,
    Zap: () => <svg data-testid="icon-zap" />,
    Brain: () => <svg data-testid="icon-brain" />,
    Target: () => <svg data-testid="icon-target" />,
    AlertTriangle: () => <svg data-testid="icon-alert" />,
    RotateCcw: () => <svg data-testid="icon-rotate" />
}));

vi.mock('./ui/DifficultyDial', () => ({
    default: () => <div data-testid="difficulty-dial" />
}));

describe('SettingsModal UX', () => {
    it('renders Download Audio toggle with correct accessibility attributes', () => {
        render(<SettingsModal onClose={() => {}} />);

        // Should be able to find it by its new accessible label
        const button = screen.getByLabelText('Toggle offline audio cache');

        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('role', 'switch');
        expect(button).toHaveAttribute('aria-checked', 'false'); // offlineAudio is false in mock
    });

    it('renders Learner Focus buttons with radio role and group', () => {
        render(<SettingsModal onClose={() => {}} />);

        const casualBtn = screen.getByText('Casual Explorer').closest('button');
        const scholarBtn = screen.getByText('Serious Scholar').closest('button');

        expect(casualBtn).toBeInTheDocument();
        expect(scholarBtn).toBeInTheDocument();

        expect(casualBtn).toHaveAttribute('role', 'radio');
        expect(scholarBtn).toHaveAttribute('role', 'radio');

        // Check checked state (mock has 'casual')
        expect(casualBtn).toHaveAttribute('aria-checked', 'true');
        expect(scholarBtn).toHaveAttribute('aria-checked', 'false');

        // Check they are in a radiogroup
        const group = screen.getByRole('radiogroup');
        expect(group).toBeInTheDocument();
        expect(group).toHaveAttribute('aria-label', 'Learner Focus');
        expect(group).toContainElement(casualBtn);
        expect(group).toContainElement(scholarBtn);
    });
});
