console.log("DEBUG ENTRY POINT EXECUTING");
import React from 'react';

const root = document.getElementById('root');
if (root) {
    root.innerHTML = '<h1>Debug App Works</h1>';
    console.log("Root element populated");
} else {
    console.error("Root element missing");
}
