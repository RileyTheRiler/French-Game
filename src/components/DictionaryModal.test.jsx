import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DictionaryModal from './DictionaryModal';
import { vi, describe, test, expect } from 'vitest';

// Mock contexts
vi.mock('../context/VocabularyContext', () => ({
    useVocabulary: () => ({
        vocabulary: [
            { id: 1, french: 'Bonjour', english: 'Hello', isSaved: false, pinned: false, level: 1 },
            { id: 2, french: 'Chat', english: 'Cat', isSaved: true, pinned: true, level: 5 },
        ],
        toggleSaveWord: vi.fn(),
        togglePinWord: vi.fn(),
        snoozeWord: vi.fn(),
        clearSnooze: vi.fn(),
    })
}));

vi.mock('../context/ProgressContext', () => ({
    useProgress: () => ({
        offlineAudio: false,
    })
}));

vi.mock('../utils/audio', () => ({
    playWordAudio: vi.fn(),
}));

vi.mock('../data/grammar', () => ({
    GRAMMAR_TIPS: [
        { id: 'g1', title: 'Le/La', content: 'Gender articles' }
    ]
}));

// Mock lucide-react icons to avoid issues
vi.mock('lucide-react', () => ({
    Star: () => <div data-testid="icon-star" />,
    Pin: () => <div data-testid="icon-pin" />,
    Clock3: () => <div data-testid="icon-clock" />,
    BellOff: () => <div data-testid="icon-bell-off" />,
    Volume2: () => <div data-testid="icon-volume" />,
}));

// Mock Button
vi.mock('./ui/Button', () => ({
    Button: ({ children, onClick, className }) => <button onClick={onClick} className={className}>{children}</button>
}));

describe('DictionaryModal', () => {
    test('renders vocabulary list', () => {
        render(<DictionaryModal onClose={() => {}} />);
        expect(screen.getByText('Bonjour')).toBeInTheDocument();
        expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    test('filters vocabulary by search', () => {
        render(<DictionaryModal onClose={() => {}} />);
        const input = screen.getByPlaceholderText(/search dictionary/i);
        fireEvent.change(input, { target: { value: 'Bonjour' } });

        expect(screen.getByText('Bonjour')).toBeInTheDocument();
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    });

    test('switches tabs', () => {
        render(<DictionaryModal onClose={() => {}} />);
        const savedTab = screen.getByText('Saved');
        fireEvent.click(savedTab);

        expect(screen.getByText('Chat')).toBeInTheDocument(); // Saved word
        expect(screen.queryByText('Bonjour')).not.toBeInTheDocument(); // Not saved
    });
});
