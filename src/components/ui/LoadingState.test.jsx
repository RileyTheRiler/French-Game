import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingState } from './LoadingState';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, animate, transition, ...props }) => <div {...props}>{children}</div>,
        p: ({ children, initial, animate, transition, ...props }) => <p {...props}>{children}</p>,
    },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Loader2: (props) => <div data-testid="loader-icon" {...props} />,
}));

describe('LoadingState Component', () => {
    it('renders the default loading message', () => {
        render(<LoadingState />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders a custom loading message', () => {
        render(<LoadingState message="Connecting to server..." />);
        expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
    });

    it('has appropriate ARIA attributes for accessibility', () => {
        render(<LoadingState />);

        // Use a more specific query if role is present, or fallback to container check
        // Ideally we want role="status"
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toBeInTheDocument();
        expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('hides decorative icon from screen readers', () => {
        render(<LoadingState />);
        // The icon or its container should have aria-hidden="true"
        // Since we mock Loader2, we check if the parent motion.div has it, or if Loader2 has it
        // The current implementation (before fix) doesn't have it.
        // We will implement this.

        // This test assumes implementation details about structure:
        // div > motion.div > Loader2

        const loaderIcon = screen.getByTestId('loader-icon');
        // Check if the icon OR its parent has aria-hidden
        // We'll check the closest motion.div (which we mocked as div)
        const motionDiv = loaderIcon.parentElement;
        expect(motionDiv).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders full screen overlay when fullScreen prop is true', () => {
        const { container } = render(<LoadingState fullScreen={true} />);
        // Check for fixed positioning styles
        const overlay = container.firstChild;
        expect(overlay).toHaveClass('fixed', 'inset-0');

        // Should also probably have stronger accessibility for modal-like behavior
        expect(overlay).toHaveAttribute('aria-busy', 'true');
    });
});
