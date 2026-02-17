/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProgress } from './ProgressContext';
import { useVocabulary } from './VocabularyContext';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
    const { stats } = useProgress();
    const { vocabulary } = useVocabulary();

    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [syncError, setSyncError] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const syncData = useCallback(async () => {
        if (!isOnline) {
            setSyncError("Device is offline");
            return;
        }

        setIsSyncing(true);
        setSyncError(null);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Prepare payload
            const payload = {
                stats,
                vocabulary: vocabulary.filter(w => w.srs.repetition > 0), // Only sync active words to save bandwidth
                timestamp: Date.now()
            };

            // Mock Server Push
            console.log("Syncing data to cloud:", payload);

            // Mock Server Pull (Response)
            // In a real app, server would merge and return updated state
            const serverResponse = {
                syncedAt: Date.now(),
                status: 'success'
                // potential merged data here
            };

            setLastSyncTime(serverResponse.syncedAt);
            localStorage.setItem('frenchApp_lastSync', serverResponse.syncedAt);

        } catch (err) {
            console.error("Sync failed:", err);
            setSyncError("Failed to sync data");
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, stats, vocabulary]);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-sync logic (e.g., every 5 minutes if changes detected)
    useEffect(() => {
        if (!isOnline) return;

        const interval = setInterval(() => {
            // Simple check: Sync if last sync was > 5 mins ago
            if (!lastSyncTime || Date.now() - lastSyncTime > 5 * 60 * 1000) {
                syncData();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [isOnline, lastSyncTime, syncData]);

    const forcePull = useCallback(async () => {
        // Logic to overwrite local data from server
        // Mocking receipt of data
        setIsSyncing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Assume we got data
            // hydrateProgress(fetchedStats);
            // hydrateVocabulary(fetchedVocab);
            setLastSyncTime(Date.now());
        } catch (err) {
            console.error("Failed to pull data", err);
            setSyncError("Failed to pull data");
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const value = {
        isSyncing,
        lastSyncTime,
        syncError,
        isOnline,
        syncData,
        forcePull
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};
