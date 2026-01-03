import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for handling touch gestures
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {Function} options.onSwipeUp - Callback for up swipe
 * @param {Function} options.onSwipeDown - Callback for down swipe
 * @param {Function} options.onPullRefresh - Callback for pull-to-refresh gesture
 * @param {number} options.threshold - Minimum distance for swipe detection (default: 50px)
 * @param {number} options.pullThreshold - Distance needed for pull-to-refresh (default: 100px)
 * @returns {Object} - Ref to attach to the element and gesture state
 */
export const useTouchGestures = ({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullRefresh,
    threshold = 50,
    pullThreshold = 100
} = {}) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const elementRef = useRef(null);

    const handleTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
            time: Date.now()
        });
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!touchStart) return;

        const currentY = e.targetTouches[0].clientY;
        const currentX = e.targetTouches[0].clientX;

        setTouchEnd({
            x: currentX,
            y: currentY
        });

        // Pull-to-refresh detection (only when at top of page)
        if (onPullRefresh && window.scrollY === 0) {
            const pullDist = currentY - touchStart.y;
            if (pullDist > 0) {
                setIsPulling(true);
                setPullDistance(Math.min(pullDist, pullThreshold * 1.5));

                // Prevent default scroll when pulling
                if (pullDist > 10) {
                    e.preventDefault();
                }
            }
        }
    }, [touchStart, onPullRefresh, pullThreshold]);

    const handleTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) {
            setIsPulling(false);
            setPullDistance(0);
            return;
        }

        const distanceX = touchStart.x - touchEnd.x;
        const distanceY = touchStart.y - touchEnd.y;
        const absX = Math.abs(distanceX);
        const absY = Math.abs(distanceY);

        // Determine if horizontal or vertical swipe
        const isHorizontal = absX > absY;

        if (isHorizontal && absX > threshold) {
            // Horizontal swipe
            if (distanceX > 0 && onSwipeLeft) {
                onSwipeLeft();
            } else if (distanceX < 0 && onSwipeRight) {
                onSwipeRight();
            }
        } else if (!isHorizontal && absY > threshold) {
            // Vertical swipe
            if (distanceY > 0 && onSwipeUp) {
                onSwipeUp();
            } else if (distanceY < 0 && onSwipeDown) {
                onSwipeDown();
            }
        }

        // Check for pull-to-refresh
        if (isPulling && pullDistance >= pullThreshold && onPullRefresh) {
            onPullRefresh();
        }

        setTouchStart(null);
        setTouchEnd(null);
        setIsPulling(false);
        setPullDistance(0);
    }, [touchStart, touchEnd, threshold, isPulling, pullDistance, pullThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullRefresh]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        ref: elementRef,
        isPulling,
        pullDistance,
        pullProgress: Math.min(pullDistance / pullThreshold, 1)
    };
};

export default useTouchGestures;
