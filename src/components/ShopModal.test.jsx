import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShopModal from './ShopModal';
import { ProgressContext } from '../context/ProgressContext';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
    })
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock Button to avoid framer-motion issues
vi.mock('./ui/Button', () => ({
    Button: ({ children, onClick, disabled, ...props }) => (
        <button onClick={onClick} disabled={disabled} {...props}>
            {children}
        </button>
    )
}));

vi.mock('../utils/SoundManager', () => ({
    default: {
        playSuccess: vi.fn(),
        playFailure: vi.fn()
    }
}));

describe('ShopModal Accessibility', () => {
    const mockOnClose = vi.fn();
    const mockBuyItem = vi.fn();
    const mockActivateDoubleXP = vi.fn();

    const mockStats = {
        coins: 100,
        inventory: {}
    };

    const renderShopModal = (stats = mockStats) => {
        return render(
            <ProgressContext.Provider value={{
                stats,
                buyItem: mockBuyItem,
                activateDoubleXP: mockActivateDoubleXP
            }}>
                <ShopModal onClose={mockOnClose} />
            </ProgressContext.Provider>
        );
    };

    it('renders with correct accessibility roles', () => {
        renderShopModal();

        // Check for dialog role
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');

        // Check for close button label
        const closeButton = screen.getByRole('button', { name: /close/i }); // Will match aria-label or text
        expect(closeButton).toBeInTheDocument();
    });

    it('implements tab accessibility pattern', () => {
        renderShopModal();

        // Check for tablist
        const tabList = screen.getByRole('tablist');
        expect(tabList).toBeInTheDocument();

        // Check for tabs
        const featuredTab = screen.getByRole('tab', { name: /shop.featured/i });
        const suppliesTab = screen.getByRole('tab', { name: /shop.supplies/i });

        expect(featuredTab).toBeInTheDocument();
        expect(suppliesTab).toBeInTheDocument();

        // Check aria-selected
        expect(featuredTab).toHaveAttribute('aria-selected', 'true');
        expect(suppliesTab).toHaveAttribute('aria-selected', 'false');

        // Check aria-controls relationships
        const featuredPanelId = featuredTab.getAttribute('aria-controls');
        const suppliesPanelId = suppliesTab.getAttribute('aria-controls');

        expect(featuredPanelId).toBeTruthy();
        expect(suppliesPanelId).toBeTruthy();
    });

    it('updates aria-selected when tab is clicked', async () => {
        renderShopModal();

        const suppliesTab = screen.getByRole('tab', { name: /shop.supplies/i });
        fireEvent.click(suppliesTab);

        await waitFor(() => {
            expect(suppliesTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByRole('tab', { name: /shop.featured/i })).toHaveAttribute('aria-selected', 'false');
        });
    });
});
