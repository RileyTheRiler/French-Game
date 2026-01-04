import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RetentionHeatmap from './RetentionHeatmap';

describe('RetentionHeatmap', () => {
    const mockData = [
        { date: new Date().toISOString().split('T')[0], count: 5, intensity: 2 }
    ];

    it('renders without crashing', () => {
        render(<RetentionHeatmap data={mockData} />);
        expect(screen.getByText('Consistency Heatmap')).toBeInTheDocument();
    });

    it('renders correct number of weeks (columns)', () => {
        const { container } = render(<RetentionHeatmap data={mockData} />);
        // We expect 52 columns. Each column is a motion.div (which renders as a div)
        // Since we removed inner motion.divs, we can count the columns by class 'flex-col' inside the flex row
        // The outer div has 'flex gap-1 min-w-max'
        // The columns have 'flex flex-col gap-1'

        // Let's use a more specific selector
        const columns = container.querySelectorAll('.flex.flex-col.gap-1');
        expect(columns.length).toBe(52);
    });

    it('renders correct number of days per week', () => {
        const { container } = render(<RetentionHeatmap data={mockData} />);
        const firstColumn = container.querySelector('.flex.flex-col.gap-1');
        // Check direct children divs (cells)
        // Note: motion.div renders as div, but now the column is motion.div and cells are plain divs.
        const cells = firstColumn.querySelectorAll(':scope > div');
        expect(cells.length).toBe(7);
    });
});
