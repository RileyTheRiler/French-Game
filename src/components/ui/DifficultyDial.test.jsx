import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DifficultyDial from './DifficultyDial';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line no-unused-vars
    div: ({ children, animate, transition, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Globe: () => <div data-testid="icon-globe" />,
  User: () => <div data-testid="icon-user" />,
  GraduationCap: () => <div data-testid="icon-grad" />,
  Rocket: () => <div data-testid="icon-rocket" />,
  Crown: () => <div data-testid="icon-crown" />,
}));

describe('DifficultyDial Component', () => {
  it('renders correctly with default props', () => {
    render(<DifficultyDial value={50} onChange={() => {}} />);
    // "Intermediate" appears in the display and the button list
    expect(screen.getAllByText('Intermediate').length).toBeGreaterThan(0);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('calls onChange when slider value changes', () => {
    const handleChange = vi.fn();
    render(<DifficultyDial value={50} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });

    expect(handleChange).toHaveBeenCalledWith(75);
  });

  it('has accessible attributes', () => {
    render(<DifficultyDial value={50} onChange={() => {}} />);
    const slider = screen.getByRole('slider');

    // Check for improved accessibility
    expect(slider).toHaveAttribute('aria-label', 'Difficulty level');
    expect(slider).toHaveAttribute('aria-valuetext', 'Intermediate: Occasional hints, moderate pace, translations hidden');

    // Check for aria-pressed on buttons
    // Note: Use getAllByText for "Intermediate" because it appears in the header too,
    // but getByRole('button', { name: 'Intermediate' }) should find the specific button.
    const intermediateButton = screen.getByRole('button', { name: 'Intermediate' });
    expect(intermediateButton).toHaveAttribute('aria-pressed', 'true');

    const beginnerButton = screen.getByRole('button', { name: 'Beginner' });
    expect(beginnerButton).toHaveAttribute('aria-pressed', 'false');
  });
});
