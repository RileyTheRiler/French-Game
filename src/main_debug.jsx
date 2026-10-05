console.log("DEBUG ENTRY POINT EXECUTING");
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (root) {
    // Security: Use createElement and textContent instead of innerHTML to prevent XSS
    const heading = document.createElement('h1');
    heading.textContent = 'Debug App Works';
    root.appendChild(heading);
    console.log("Root element populated");
} else {
    console.error("Root element missing");
}
