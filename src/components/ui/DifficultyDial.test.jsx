import { render, screen, fireEvent } from '@testing-library/react';
import DifficultyDial from './DifficultyDial';
import { vi, describe, it, expect } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Globe: () => <div data-testid="icon-globe" />,
  User: () => <div data-testid="icon-user" />,
  GraduationCap: () => <div data-testid="icon-grad" />,
  Rocket: () => <div data-testid="icon-rocket" />,
  Crown: () => <div data-testid="icon-crown" />,
}));

describe('DifficultyDial', () => {
  it('renders correctly with initial value', () => {
    render(<DifficultyDial value={25} onChange={() => {}} />);

    // Check if the current level is displayed (both in the main display and the button list)
    expect(screen.getAllByText('Beginner').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('has accessible attributes on the slider', () => {
    render(<DifficultyDial value={25} onChange={() => {}} />);

    const input = screen.getByLabelText('Difficulty level');
    expect(input).toBeInTheDocument();
    // Check for the new aria-valuetext
    expect(input).toHaveAttribute('aria-valuetext', expect.stringContaining('Beginner'));
  });

  it('has accessible level buttons', () => {
    const handleChange = vi.fn();
    render(<DifficultyDial value={25} onChange={handleChange} />);

    const beginnerButton = screen.getByRole('button', { name: 'Beginner' });
    const advancedButton = screen.getByRole('button', { name: 'Advanced' });

    // Check aria-pressed state
    expect(beginnerButton).toHaveAttribute('aria-pressed', 'true');
    expect(advancedButton).toHaveAttribute('aria-pressed', 'false');

    // Test interaction
    fireEvent.click(advancedButton);
    expect(handleChange).toHaveBeenCalledWith(75);
  });
});
