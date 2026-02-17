/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const A11yContext = createContext(null);

export const useA11y = () => {
    const context = useContext(A11yContext);
    if (!context) {
        throw new Error('useA11y must be used within an A11yProvider');
    }
    return context;
};

export const A11yProvider = ({ children }) => {
    const [announcement, setAnnouncement] = useState('');

    // Lazy initialization to avoid synchronous setState in effect
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        return false;
    });

    const [highContrast, setHighContrast] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-contrast: more)').matches;
        }
        return false;
    });

    // Detect reduced motion preference listener
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Detect high contrast preference listener
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-contrast: more)');
        const handleChange = (e) => setHighContrast(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply body class for reduced motion
    useEffect(() => {
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }, [prefersReducedMotion]);

    // Apply body class for high contrast
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    /**
     * Announce a message to screen readers
     * @param {string} message - The message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    const announce = useCallback((message, priority = 'polite') => {
        // Clear first to ensure re-announcement of same message
        setAnnouncement('');

        // Use setTimeout to ensure the DOM updates
        setTimeout(() => {
            setAnnouncement({ message, priority });
        }, 100);

        // Clear after announcement
        setTimeout(() => {
            setAnnouncement('');
        }, 1000);
    }, []);

    const value = {
        announce,
        prefersReducedMotion,
        highContrast,
        setHighContrast
    };

    return (
        <A11yContext.Provider value={value}>
            {children}

            {/* Live regions for screen reader announcements */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {announcement?.priority === 'polite' ? announcement.message : ''}
            </div>
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            >
                {announcement?.priority === 'assertive' ? announcement.message : ''}
            </div>
        </A11yContext.Provider>
    );
};

export default A11yProvider;
