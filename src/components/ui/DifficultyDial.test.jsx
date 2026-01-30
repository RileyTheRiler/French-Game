import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DifficultyDial from './DifficultyDial';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        // eslint-disable-next-line no-unused-vars
        div: ({ children, animate, transition, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('DifficultyDial', () => {
    it('renders the range input with correct aria-label', () => {
        const handleChange = vi.fn();
        render(<DifficultyDial value={50} onChange={handleChange} />);

        const slider = screen.getByLabelText('Difficulty level');
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('type', 'range');
        expect(slider).toHaveValue('50');
    });

    it('displays the current level label correctly', () => {
        render(<DifficultyDial value={25} onChange={() => {}} />);
        // "Beginner" appears in the main display and in the bottom labels
        const labels = screen.getAllByText('Beginner');
        expect(labels.length).toBeGreaterThan(0);
        expect(labels[0]).toBeInTheDocument();
    });
});
