import React, { createContext, useContext, useState, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { useProgress } from './ProgressContext';

export const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
    const { stats, hydrateProgress } = useProgress();
    const [status, setStatus] = useState('idle'); // idle, syncing, up_to_date, error, conflict
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [conflictData, setConflictData] = useState(null);

    // Mock Cloud Sync
    const syncData = async () => {
        setStatus('syncing');
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate random conflict (10% chance)
            if (Math.random() > 0.9) {
                setStatus('conflict');
                setConflictData({
                    local: stats,
                    cloud: {
                        ...stats,
                        xp: stats.xp + 500, // Cloud has more XP
                        wordsLearned: stats.wordsLearned + 5
                    }
                });
                return;
            }

            // Success
            setStatus('up_to_date');
            setLastSyncedAt(new Date());
            localStorage.setItem('frenchApp_lastSync', new Date().toISOString());

        } catch (err) {
            setStatus('error');
            console.error('Sync failed:', err);
        }
    };

    // Auto-sync on significant changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (stats.xp > 0) { // Don't sync empty initial state
                syncData();
            }
        }, 5000); // Sync 5s after last change

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats.xp, stats.wordsLearned]); // Only trigger on major stat changes

    const resolveConflict = (strategy) => {
        if (strategy === 'use_cloud') {
            hydrateProgress(conflictData.cloud);
        }
        // 'use_local' does nothing, just keeps current state
        setStatus('up_to_date');
        setConflictData(null);
    };

    const exportData = () => {
        const dataStr = JSON.stringify(stats, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `lingolift_backup_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const importData = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedStats = JSON.parse(event.target.result);
                    // Basic validation
                    if (typeof importedStats.xp !== 'number') throw new Error("Invalid save file");

                    hydrateProgress(importedStats);
                    setStatus('imported');
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    };

    return (
        <SyncContext.Provider value={{
            status,
            lastSyncedAt,
            syncNow: syncData,
            resolveConflict,
            conflictData,
            exportData,
            importData,
            syncing: status === 'syncing'
        }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => useContext(SyncContext);
