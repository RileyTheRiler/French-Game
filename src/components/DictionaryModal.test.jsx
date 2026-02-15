import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DictionaryModal from './DictionaryModal';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';

// Mock contexts
vi.mock('../context/VocabularyContext', () => ({
  useVocabulary: vi.fn()
}));

vi.mock('../context/ProgressContext', () => ({
  useProgress: vi.fn()
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Star: ({ fill }) => <div data-testid="icon-star" data-fill={fill} />,
  Pin: () => <div data-testid="icon-pin" />,
  Clock3: () => <div data-testid="icon-clock" />,
  BellOff: () => <div data-testid="icon-bell-off" />,
  Volume2: () => <div data-testid="icon-volume" />
}));

// Mock audio util
vi.mock('../utils/audio', () => ({
  playWordAudio: vi.fn()
}));

// Mock time util
vi.mock('../utils/time', () => ({
  formatRelativeTime: () => 'just now',
  formatDateTime: () => 'today'
}));

// Mock grammar data
vi.mock('../data/grammar', () => ({
  GRAMMAR_TIPS: [
    { id: 'g1', title: 'Le Past Tense', content: 'Use passe compose.' },
    { id: 'g2', title: 'Le Future', content: 'Use aller + infinitive.' }
  ]
}));

describe('DictionaryModal', () => {
  const mockVocabulary = [
    { id: '1', french: 'Bonjour', english: 'Hello', isSaved: false, pinned: false, level: 1 },
    { id: '2', french: 'Pomme', english: 'Apple', isSaved: true, pinned: false, level: 2 },
    { id: '3', french: 'Chat', english: 'Cat', isSaved: false, pinned: true, level: 3 }
  ];

  const mockToggleSave = vi.fn();
  const mockTogglePin = vi.fn();
  const mockSnooze = vi.fn();
  const mockClearSnooze = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useVocabulary.mockReturnValue({
      vocabulary: mockVocabulary,
      toggleSaveWord: mockToggleSave,
      togglePinWord: mockTogglePin,
      snoozeWord: mockSnooze,
      clearSnooze: mockClearSnooze
    });

    useProgress.mockReturnValue({
      offlineAudio: false
    });
  });

  it('renders vocabulary list by default', () => {
    render(<DictionaryModal onClose={() => {}} />);
    expect(screen.getByText('Bonjour')).toBeInTheDocument();
    expect(screen.getByText('Pomme')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('filters vocabulary based on search term', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Apple' } });

    expect(screen.queryByText('Bonjour')).not.toBeInTheDocument();
    expect(screen.getByText('Pomme')).toBeInTheDocument(); // Apple
  });

  it('filters saved words correctly', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const savedTab = screen.getByText('Saved');
    fireEvent.click(savedTab);

    expect(screen.queryByText('Bonjour')).not.toBeInTheDocument();
    expect(screen.getByText('Pomme')).toBeInTheDocument();
  });

  it('renders grammar tips when grammar tab is active', () => {
    render(<DictionaryModal onClose={() => {}} />);
    const grammarTab = screen.getByText('Grammar');
    fireEvent.click(grammarTab);

    expect(screen.getByText('Le Past Tense')).toBeInTheDocument();
    expect(screen.queryByText('Bonjour')).not.toBeInTheDocument();
  });

  it('calls toggleSaveWord when save button is clicked', () => {
    render(<DictionaryModal onClose={() => {}} />);
    // "Bonjour" is not saved, so it should have aria-label "Save"
    const saveButtons = screen.getAllByRole('button', { name: "Save" });
    fireEvent.click(saveButtons[0]);
    expect(mockToggleSave).toHaveBeenCalled();
  });
});
