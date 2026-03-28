import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Loader2: ({ className, ...props }) => <div data-testid="loader" className={className} {...props} />
}));

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles loading state', () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('does not show loader when not loading', () => {
    render(<Button>Click me</Button>);
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });
});
