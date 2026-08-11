console.log("DEBUG ENTRY POINT EXECUTING");
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (root) {
    // Security: Prevent XSS by using safe DOM manipulation instead of innerHTML
    const heading = document.createElement('h1');
    heading.textContent = 'Debug App Works';
    root.appendChild(heading);
    console.log("Root element populated");
} else {
    console.error("Root element missing");
}
