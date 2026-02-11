import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import { ToastContext } from './ToastContext';

// Mock ToastContext
const mockToast = {
    showAchievement: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
};

const wrapper = ({ children }) => (
    <ToastContext.Provider value={mockToast}>
        <ProgressProvider>{children}</ProgressProvider>
    </ToastContext.Provider>
);

describe('ProgressContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });
        expect(result.current.stats.xp).toBe(0);
        expect(result.current.stats.coins).toBe(50);
    });

    it('adds XP correctly', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });

        act(() => {
            result.current.addXP(100);
        });

        expect(result.current.stats.xp).toBe(100);
    });

    it('doubles XP when double XP is active', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });

        act(() => {
            result.current.activateDoubleXP(15);
        });

        // Verify active
        expect(result.current.isDoubleXpActive()).toBe(true);

        act(() => {
            result.current.addXP(100);
        });

        expect(result.current.stats.xp).toBe(200);
    });

    it('adds coins correctly', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });

        act(() => {
            result.current.addCoins(50);
        });

        expect(result.current.stats.coins).toBe(100); // 50 initial + 50
    });

    it('spends coins if sufficient balance', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });

        let success;
        act(() => {
            success = result.current.spendCoins(30);
        });

        expect(success).toBe(true);
        expect(result.current.stats.coins).toBe(20);
    });

    it('fails to spend coins if insufficient balance', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });

        let success;
        act(() => {
            success = result.current.spendCoins(100);
        });

        expect(success).toBe(false);
        expect(result.current.stats.coins).toBe(50);
    });

    it('buying item updates inventory', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });
        const item = { id: 'potion', price: 20, type: 'consumable' };

        act(() => {
            result.current.buyItem(item);
        });

        expect(result.current.stats.coins).toBe(30);
        expect(result.current.stats.inventory['potion']).toBe(1);
    });

    it('updates memory palace room data correctly', () => {
        const { result } = renderHook(() => useProgress(), { wrapper });
        const roomData = { items: ['vase', 'painting'], unlocked: true };

        act(() => {
            result.current.updateMemoryPalaceRoom('living_room', roomData);
        });

        expect(result.current.stats.memoryPalace.rooms['living_room']).toEqual(roomData);
    });
});
