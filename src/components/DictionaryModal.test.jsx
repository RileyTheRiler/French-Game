import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DictionaryModal from './DictionaryModal';
import { useVocabulary } from '../context/VocabularyContext';
import { useProgress } from '../context/ProgressContext';

// Mock contexts
vi.mock('../context/VocabularyContext', () => ({
  useVocabulary: vi.fn(),
}));

vi.mock('../context/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

// Mock audio
vi.mock('../utils/audio', () => ({
  playWordAudio: vi.fn(),
}));

// Mock grammar data
vi.mock('../data/grammar', () => ({
  GRAMMAR_TIPS: [
    { id: 'g1', title: 'Tip 1', content: 'Content 1' },
    { id: 'g2', title: 'Tip 2', content: 'Content 2' },
  ],
}));

describe('DictionaryModal', () => {
  const mockVocabulary = [
    { id: '1', french: 'Bonjour', english: 'Hello', isSaved: false, level: 1 },
    { id: '2', french: 'Monde', english: 'World', isSaved: true, level: 2 },
  ];

  const mockToggleSaveWord = vi.fn();
  const mockTogglePinWord = vi.fn();
  const mockSnoozeWord = vi.fn();
  const mockClearSnooze = vi.fn();

  beforeEach(() => {
    useVocabulary.mockReturnValue({
      vocabulary: mockVocabulary,
      toggleSaveWord: mockToggleSaveWord,
      togglePinWord: mockTogglePinWord,
      snoozeWord: mockSnoozeWord,
      clearSnooze: mockClearSnooze,
    });
    useProgress.mockReturnValue({
      offlineAudio: false,
    });
  });

  it('renders vocabulary list by default', () => {
    render(<DictionaryModal onClose={() => {}} />);
    expect(screen.getByText('Bonjour')).toBeInTheDocument();
    expect(screen.getByText('Monde')).toBeInTheDocument();
  });

  it('filters vocabulary based on search term', () => {
    render(<DictionaryModal onClose={() => {}} initialSearchTerm="Bonjour" />);
    expect(screen.getByText('Bonjour')).toBeInTheDocument();
    expect(screen.queryByText('Monde')).not.toBeInTheDocument();
  });

  it('switches to saved tab and shows only saved words', () => {
    render(<DictionaryModal onClose={() => {}} />);
    fireEvent.click(screen.getByText('Saved'));
    expect(screen.queryByText('Bonjour')).not.toBeInTheDocument();
    expect(screen.getByText('Monde')).toBeInTheDocument();
  });

  it('switches to grammar tab and shows grammar tips', () => {
    render(<DictionaryModal onClose={() => {}} />);
    fireEvent.click(screen.getByText('Grammar'));
    expect(screen.getByText('Tip 1')).toBeInTheDocument();
    expect(screen.getByText('Tip 2')).toBeInTheDocument();
  });

  it('filters grammar tips based on search term', () => {
    render(<DictionaryModal onClose={() => {}} />);
    fireEvent.click(screen.getByText('Grammar'));
    const input = screen.getByPlaceholderText('Search grammar...');
    fireEvent.change(input, { target: { value: 'Tip 1' } });
    expect(screen.getByText('Tip 1')).toBeInTheDocument();
    expect(screen.queryByText('Tip 2')).not.toBeInTheDocument();
  });
});
