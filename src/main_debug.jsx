console.log("DEBUG ENTRY POINT EXECUTING");
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(<h1>Debug App Works</h1>);
    console.log("Root element populated");
} else {
    console.error("Root element missing");
}
