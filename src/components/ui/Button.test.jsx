import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, whileHover, whileTap, ...props }) => <button {...props}>{children}</button>,
    },
}));

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeDefined();
    });

    it('passes aria-label to the button element', () => {
        render(<Button aria-label="Submit Form">Submit</Button>);
        const button = screen.getByLabelText('Submit Form');
        expect(button).toBeDefined();
    });

    it('applies icon size classes', () => {
        render(<Button size="icon" aria-label="Menu">Icon</Button>);
        const button = screen.getByLabelText('Menu');
        expect(button.className).toContain('h-10 w-10 p-0');
    });
});
