/**
 * OfflineProvider — Global offline-first context
 *
 * On mount:  seeds the Dexie cache from the API
 * On online: flushes the sync queue + re-seeds
 * Exposes:   { isOnline, queuedItems, enqueueRequest }
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { seedProducts, seedCustomers, seedOrders, flushQueue, enqueue, queueSize, resyncAll } from 'lib/syncEngine';
import type { SyncOperation } from 'lib/db';

interface OfflineContextValue {
  isOnline: boolean;
  queuedItems: number;
  /** Enqueue a mutation to be replayed when online */
  enqueueRequest: (method: SyncOperation, url: string, body?: Record<string, unknown>) => Promise<void>;
  /** Force a full cache resync */
  forceResync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, justReconnected } = useNetworkStatus();
  const [queuedItems, setQueuedItems] = useState(0);

  const refreshQueueCount = useCallback(async () => {
    const count = await queueSize();
    setQueuedItems(count);
  }, []);

  // Seed cache on mount
  useEffect(() => {
    void seedProducts();
    void seedCustomers();
    void seedOrders();
  }, []);

  // On reconnect: flush queue + resync
  useEffect(() => {
    if (!justReconnected) return;
    (async () => {
      await flushQueue();
      await resyncAll();
      await refreshQueueCount();
    })();
  }, [justReconnected, refreshQueueCount]);

  const enqueueRequest = useCallback(async (
    method: SyncOperation,
    url: string,
    body?: Record<string, unknown>,
  ) => {
    await enqueue({ method, url, body });
    await refreshQueueCount();
  }, [refreshQueueCount]);

  const forceResync = useCallback(async () => {
    await resyncAll();
    await refreshQueueCount();
  }, [refreshQueueCount]);

  return (
    <OfflineContext.Provider value={{ isOnline, queuedItems, enqueueRequest, forceResync }}>
      {children}
    </OfflineContext.Provider>
  );
};

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within <OfflineProvider>');
  return ctx;
}
