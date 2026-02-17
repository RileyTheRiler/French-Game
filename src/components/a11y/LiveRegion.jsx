/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { useA11y } from '../../context/A11yContext';

/**
 * Component that renders live regions for screen reader announcements.
 * This is included in A11yProvider, so you typically don't need to use this directly.
 * However, you can use this if you need additional live regions in specific contexts.
 */
export const LiveRegion = ({
    children,
    priority = 'polite', // 'polite' or 'assertive'
    atomic = true
}) => {
    return (
        <div
            role={priority === 'assertive' ? 'alert' : 'status'}
            aria-live={priority}
            aria-atomic={atomic}
            className="sr-only"
        >
            {children}
        </div>
    );
};

/**
 * Hook to announce messages to screen readers
 * @returns {Function} announce function
 */
export const useAnnounce = () => {
    const { announce } = useA11y();
    return announce;
};

export default LiveRegion;
