console.log("DEBUG ENTRY POINT EXECUTING");
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (root) {
    const h1 = document.createElement('h1');
    h1.textContent = 'Debug App Works';
    root.appendChild(h1);
    console.log("Root element populated");
} else {
    console.error("Root element missing");
}
