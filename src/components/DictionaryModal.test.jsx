import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DictionaryModal from './DictionaryModal';
import { VocabularyContext } from '../context/VocabularyContext';
import { ProgressContext } from '../context/ProgressContext';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Star: () => <span data-testid="icon-star" />,
  Pin: () => <span data-testid="icon-pin" />,
  Clock3: () => <span data-testid="icon-clock" />,
  BellOff: () => <span data-testid="icon-bell-off" />,
  Volume2: () => <span data-testid="icon-volume" />
}));

// Mock audio utility
vi.mock('../utils/audio', () => ({
  playWordAudio: vi.fn()
}));

// Mock grammar data
vi.mock('../data/grammar', () => ({
  GRAMMAR_TIPS: [
    { id: '1', title: 'Test Tip', content: 'Test Content' }
  ]
}));

describe('DictionaryModal Accessibility', () => {
  const mockClose = vi.fn();
  const mockVocabulary = [
    {
      id: '1',
      french: 'Bonjour',
      english: 'Hello',
      level: 1,
      isSaved: false,
      pinned: false
    }
  ];

  const renderModal = () => {
    return render(
      <ProgressContext.Provider value={{ offlineAudio: false }}>
        <VocabularyContext.Provider value={{
          vocabulary: mockVocabulary,
          toggleSaveWord: vi.fn(),
          togglePinWord: vi.fn(),
          snoozeWord: vi.fn(),
          clearSnooze: vi.fn()
        }}>
          <DictionaryModal onClose={mockClose} />
        </VocabularyContext.Provider>
      </ProgressContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct dialog role and label', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dictionary-title');

    const title = screen.getByText('Resources');
    expect(title).toHaveAttribute('id', 'dictionary-title');
  });

  it('has accessible close button', () => {
    renderModal();
    const closeBtn = screen.getByLabelText('Close resources');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalled();
  });

  it('has accessible tabs', () => {
    renderModal();
    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const dictionaryTab = screen.getByRole('tab', { name: 'Dictionary' });
    const savedTab = screen.getByRole('tab', { name: 'Saved' });
    const grammarTab = screen.getByRole('tab', { name: 'Grammar' });

    expect(dictionaryTab).toHaveAttribute('aria-selected', 'true');
    expect(savedTab).toHaveAttribute('aria-selected', 'false');
    expect(grammarTab).toHaveAttribute('aria-selected', 'false');

    // Check panel association
    const panel = screen.getByRole('tabpanel');
    expect(dictionaryTab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', dictionaryTab.id);
  });

  it('updates aria-selected when changing tabs', () => {
    renderModal();
    const savedTab = screen.getByRole('tab', { name: 'Saved' });

    fireEvent.click(savedTab);
    expect(savedTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Dictionary' })).toHaveAttribute('aria-selected', 'false');
  });

  it('search input has accessible label', () => {
    renderModal();
    const input = screen.getByPlaceholderText(/Search dictionary/i);
    expect(input).toHaveAttribute('aria-label', 'Search dictionary');

    // Switch to grammar to verify label update
    const grammarTab = screen.getByRole('tab', { name: 'Grammar' });
    fireEvent.click(grammarTab);

    const inputUpdated = screen.getByPlaceholderText(/Search grammar/i);
    expect(inputUpdated).toHaveAttribute('aria-label', 'Search grammar');
  });
});
