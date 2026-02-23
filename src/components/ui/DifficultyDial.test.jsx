import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DifficultyDial from './DifficultyDial';
import React from 'react';

// Mock Lucide icons to avoid issues
vi.mock('lucide-react', () => ({
  Globe: () => <svg data-testid="icon-globe" />,
  User: () => <svg data-testid="icon-user" />,
  GraduationCap: () => <svg data-testid="icon-graduation-cap" />,
  Rocket: () => <svg data-testid="icon-rocket" />,
  Crown: () => <svg data-testid="icon-crown" />,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('DifficultyDial', () => {
  it('renders with correct accessibility attributes', () => {
    const handleChange = vi.fn();
    render(<DifficultyDial value={25} onChange={handleChange} />);

    // Check slider
    const slider = screen.getByRole('slider', { name: /Difficulty level/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuetext', 'Beginner');

    // Check if aria-describedby points to an existing element
    const describedBy = slider.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access
    const description = document.getElementById(describedBy);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(/Hints available, normal pace/);

    // Check preset buttons
    const beginnerButton = screen.getByRole('button', { name: /Set difficulty to Beginner/i });
    expect(beginnerButton).toBeInTheDocument();
    expect(beginnerButton).toHaveAttribute('aria-pressed', 'true');

    const intermediateButton = screen.getByRole('button', { name: /Set difficulty to Intermediate/i });
    expect(intermediateButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when slider value changes', () => {
    const handleChange = vi.fn();
    render(<DifficultyDial value={25} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 50 } });
    expect(handleChange).toHaveBeenCalledWith(50);
  });

  it('calls onChange when preset button is clicked', () => {
    const handleChange = vi.fn();
    render(<DifficultyDial value={25} onChange={handleChange} />);

    const advancedButton = screen.getByRole('button', { name: /Set difficulty to Advanced/i });
    fireEvent.click(advancedButton);
    expect(handleChange).toHaveBeenCalledWith(75);
  });
});
