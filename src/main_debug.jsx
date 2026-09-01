console.log("DEBUG ENTRY POINT EXECUTING");
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (root) {
    // Security: Prevent potential XSS by using textContent instead of innerHTML
    const heading = document.createElement('h1');
    heading.textContent = 'Debug App Works';
    root.appendChild(heading);
    console.log("Root element populated");
} else {
    console.error("Root element missing");
}
