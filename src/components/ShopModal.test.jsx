import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShopModal from './ShopModal';
import { useProgress } from '../context/ProgressContext';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../context/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line no-unused-vars
    div: ({ children, layoutId, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('../utils/SoundManager', () => ({
  default: {
    playSuccess: vi.fn(),
    playFailure: vi.fn(),
  },
}));

vi.mock('../utils/market', () => ({
  getDailyShopSelection: () => ({
    consumables: [],
    cosmetics: [],
  }),
}));

describe('ShopModal', () => {
  it('renders with accessible tabs', () => {
    useProgress.mockReturnValue({
      stats: { coins: 100, inventory: {} },
      buyItem: vi.fn(),
    });

    render(<ShopModal onClose={vi.fn()} />);

    // Check tablist (using the hardcoded aria-label I added "Shop sections")
    const tablist = screen.getByRole('tablist', { name: /shop sections/i });
    expect(tablist).toBeInTheDocument();

    // Check tabs
    const featuredTab = screen.getByRole('tab', { name: 'shop.featured' });
    const suppliesTab = screen.getByRole('tab', { name: 'shop.supplies' });

    expect(featuredTab).toBeInTheDocument();
    expect(suppliesTab).toBeInTheDocument();

    // Check initial selection
    expect(featuredTab).toHaveAttribute('aria-selected', 'true');
    expect(suppliesTab).toHaveAttribute('aria-selected', 'false');

    // Check panel presence
    // The panel has aria-labelledby pointing to the tab
    // The tab text is "shop.featured"
    // So accessibility name of panel should be "shop.featured"
    const featuredPanel = screen.getByRole('tabpanel', { name: 'shop.featured' });
    expect(featuredPanel).toBeInTheDocument();
    expect(featuredPanel).toHaveAttribute('id', 'panel-featured');

    // Switch tabs
    fireEvent.click(suppliesTab);

    expect(featuredTab).toHaveAttribute('aria-selected', 'false');
    expect(suppliesTab).toHaveAttribute('aria-selected', 'true');

    // Check new panel
    const suppliesPanel = screen.getByRole('tabpanel', { name: 'shop.supplies' });
    expect(suppliesPanel).toBeInTheDocument();
    expect(suppliesPanel).toHaveAttribute('id', 'panel-supplies');
  });
});
