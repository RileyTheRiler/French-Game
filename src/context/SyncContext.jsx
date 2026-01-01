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

    useEffect(() => {
        if (user) {
            const debounce = setTimeout(() => performSync(), 500);
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
        const parsed = JSON.parse(text);
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
