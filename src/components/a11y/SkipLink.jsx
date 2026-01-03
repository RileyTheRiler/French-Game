import React from 'react';

/**
 * Skip link component for keyboard users to bypass navigation
 * Hidden by default, visible on focus
 */
const SkipLink = ({ targetId = 'main-content', children = 'Skip to main content' }) => {
    const handleClick = (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <a
            href={`#${targetId}`}
            onClick={handleClick}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
        >
            {children}
        </a>
    );
};

export default SkipLink;
