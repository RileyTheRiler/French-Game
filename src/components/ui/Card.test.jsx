import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from './Card';

// Mock framer-motion to avoid issues in test environment
vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line no-unused-vars
    div: ({ children, whileHover, ...props }) => <div {...props}>{children}</div>,
    // eslint-disable-next-line no-unused-vars
    button: ({ children, whileHover, ...props }) => <button {...props}>{children}</button>,
  },
}));

describe('Card Component', () => {
  it('renders a div by default', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content');
    expect(card.tagName).toBe('DIV');
  });

  it('renders a button when clickable', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByText('Clickable');
    expect(card.tagName).toBe('BUTTON');
    expect(card).toHaveAttribute('type', 'button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalled();
  });
});
