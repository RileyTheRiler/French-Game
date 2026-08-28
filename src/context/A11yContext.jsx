import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

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
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [highContrast, setHighContrast] = useState(false);

    // Detect reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Detect high contrast preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-contrast: more)');
        setHighContrast(mediaQuery.matches);

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

    // ⚡ Bolt: Memoize context value to prevent unnecessary re-renders in consumer components
    // Impact: Avoids cascading renders in a11y-aware components when independent state updates occur
    const value = useMemo(() => ({
        announce,
        prefersReducedMotion,
        highContrast,
        setHighContrast
    }), [announce, prefersReducedMotion, highContrast, setHighContrast]);

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
