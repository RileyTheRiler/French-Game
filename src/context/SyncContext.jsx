import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProgress } from './ProgressContext';
import { useVocabulary } from './VocabularyContext';
import { exportPayload, loadRemoteState, mergeState, saveRemoteState } from '../services/cloudSync';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
    const { user } = useAuth();
    const { stats, hydrateProgress } = useProgress();
    const { vocabulary, hydrateVocabulary } = useVocabulary();

    const [syncing, setSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [status, setStatus] = useState('idle');
    const pendingRef = useRef(false);

    const localSnapshot = useMemo(() => ({
        progress: stats,
        vocabulary,
        updatedAt: stats?.updatedAt || 0
    }), [stats, vocabulary]);

    const performSync = useCallback(async () => {
        if (!user) return;

        // Skip sync if offline
        if (!navigator.onLine) {
            setStatus('offline');
            return;
        }

        if (syncing) {
            pendingRef.current = true;
            return;
        }
        setSyncing(true);
        setStatus('syncing');
        try {
            const remote = await loadRemoteState(user.id);
            const merged = mergeState(localSnapshot, remote);
            await saveRemoteState(user.id, merged);
            if (merged.progress) hydrateProgress(merged.progress);
            if (merged.vocabulary) hydrateVocabulary(merged.vocabulary);
            setLastSyncedAt(new Date());
            setStatus('up_to_date');
        } catch (err) {
            console.error(err);
            setStatus(`error: ${err.message}`);
        } finally {
            setSyncing(false);
            if (pendingRef.current) {
                pendingRef.current = false;
                performSync();
            }
        }
    }, [user, localSnapshot, hydrateProgress, hydrateVocabulary, syncing]);

    useEffect(() => {
        if (user) {
            performSync();
        }
    }, [user, performSync]);

    // Handle Online/Offline events
    useEffect(() => {
        const handleOnline = () => {
            console.log('Back online, syncing...');
            performSync();
        };
        const handleOffline = () => setStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [performSync]);

    useEffect(() => {
        if (user && navigator.onLine) {
            const debounce = setTimeout(() => performSync(), 2000); // Increased debounce to avoid spam
            return () => clearTimeout(debounce);
        }
        return undefined;
    }, [user, localSnapshot, performSync]);

    const exportData = useCallback(() => {
        const payload = exportPayload(stats, vocabulary);
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lingolift-backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [stats, vocabulary]);

    const importData = useCallback(async (file) => {
        const text = await file.text();
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            throw new Error('Invalid file format');
        }

        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid file format');
        }

        if (parsed.progress) {
            hydrateProgress({ ...parsed.progress, updatedAt: Date.now() });
        }
        if (parsed.vocabulary) {
            hydrateVocabulary(parsed.vocabulary.map(word => ({ ...word, updatedAt: Date.now() })));
        }
        setStatus('imported');
    }, [hydrateProgress, hydrateVocabulary]);

    return (
        <SyncContext.Provider value={{
            syncing,
            lastSyncedAt,
            status,
            performSync,
            exportData,
            importData
        }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => useContext(SyncContext);
