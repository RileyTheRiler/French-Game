import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, className, onClick, disabled, 'aria-label': ariaLabel, 'aria-busy': ariaBusy, ...props }) => (
      <button
        className={className}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-busy={ariaBusy}
        {...props}
      >
        {children}
      </button>
    )
  }
}));

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(<Button isLoading>Click me</Button>);
    // Loader2 from lucide-react renders an svg.
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('is clickable when not loading', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
