import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from './ProgressContext';
import { useVocabulary } from './VocabularyContext';

const SYNC_ENDPOINT = 'https://api.lingolift.app/sync'; // Placeholder

// eslint-disable-next-line react-refresh/only-export-components
export const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
    const { stats, achievements, hydrateProgress } = useProgress();
    const { vocabulary, hydrateVocabulary } = useVocabulary();

    const [status, setStatus] = useState('idle'); // idle, syncing, error, up_to_date
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [error, setError] = useState(null);

    // Load last sync time
    useEffect(() => {
        const saved = localStorage.getItem('frenchApp_lastSync');
        if (saved) setLastSyncedAt(new Date(saved));
    }, []);

    // Sync Function (Mock Implementation)
    const syncData = useCallback(async () => {
        if (status === 'syncing') return;

        setStatus('syncing');
        setError(null);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real app, we would send the local state diff to the server
            // and receive the merged state back.
            // For now, we just simulate a successful "save" to cloud.

            const now = new Date();
            setLastSyncedAt(now);
            localStorage.setItem('frenchApp_lastSync', now.toISOString());

            setStatus('up_to_date');

            setTimeout(() => setStatus('idle'), 3000);

        } catch (err) {
            console.error("Sync failed:", err);
            setError(err.message);
            setStatus('error');
        }
    }, [status]);

    // Export Data to JSON
    const exportData = useCallback(() => {
        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            stats,
            achievements,
            vocabulary: vocabulary.filter(w => w.srs && (w.srs.repetition > 0 || w.isCustom)) // Only export progress/custom
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lingolift_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [stats, achievements, vocabulary]);

    // Import Data
    const importData = useCallback(async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.version || !data.stats) throw new Error("Invalid backup file");

                    // Merge logic (simplified: overwrite local if valid)
                    if (data.stats) hydrateProgress(data.stats);
                    if (data.vocabulary) hydrateVocabulary(data.vocabulary);

                    resolve(true);
                    setStatus('imported');
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        });
    }, [hydrateProgress, hydrateVocabulary]);

    const value = useMemo(() => ({
        status,
        lastSyncedAt,
        error,
        syncData,
        exportData,
        importData,
        syncing: status === 'syncing'
    }), [status, lastSyncedAt, error, syncData, exportData, importData]);

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => useContext(SyncContext);
