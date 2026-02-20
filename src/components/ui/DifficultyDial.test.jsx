import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DifficultyDial from './DifficultyDial';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Globe: () => <svg data-testid="icon-globe" />,
  User: () => <svg data-testid="icon-user" />,
  GraduationCap: () => <svg data-testid="icon-grad" />,
  Rocket: () => <svg data-testid="icon-rocket" />,
  Crown: () => <svg data-testid="icon-crown" />,
}));

describe('DifficultyDial Component', () => {
    it('renders with correct initial value', () => {
        render(<DifficultyDial value={25} onChange={() => {}} />);
        const input = screen.getByRole('slider');
        expect(input).toHaveValue('25');
        // Check my new aria-valuetext
        expect(input).toHaveAttribute('aria-valuetext', 'Beginner');
    });

    it('updates aria-valuetext when value changes', () => {
        const { rerender } = render(<DifficultyDial value={25} onChange={() => {}} />);
        let input = screen.getByRole('slider');
        expect(input).toHaveAttribute('aria-valuetext', 'Beginner');

        rerender(<DifficultyDial value={75} onChange={() => {}} />);
        input = screen.getByRole('slider');
        expect(input).toHaveAttribute('aria-valuetext', 'Advanced');
    });

    it('has aria-pressed on preset buttons', () => {
        render(<DifficultyDial value={50} onChange={() => {}} />);
        const intermediateButton = screen.getByRole('button', { name: 'Intermediate' });
        const beginnerButton = screen.getByRole('button', { name: 'Beginner' });

        expect(intermediateButton).toHaveAttribute('aria-pressed', 'true');
        expect(beginnerButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('associates description with input via aria-describedby', () => {
        render(<DifficultyDial value={25} onChange={() => {}} />);
        const input = screen.getByRole('slider');
        const descriptionId = input.getAttribute('aria-describedby');
        expect(descriptionId).toBe('difficulty-desc');

        const description = screen.getByText('Hints available, normal pace, translations on demand');
        expect(description).toHaveAttribute('id', 'difficulty-desc');
    });
});
