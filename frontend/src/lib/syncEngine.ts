/**
 * TuxedoPOS — Sync Engine
 *
 * Responsibilities:
 *  1. Seed the local Dexie cache from the API on first load / on reconnect
 *  2. Queue outbound mutations when offline (POST /orders, etc.)
 *  3. Flush the queue when the network comes back
 */

import { posDb, type SyncQueueItem } from './db';
import { apiClient } from './apiClient';

// ── Cache TTL: 5 minutes ───────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000;

function isStale(cachedAt: number): boolean {
  return Date.now() - cachedAt > CACHE_TTL_MS;
}

// ── Seed product cache ─────────────────────────────────────────
export async function seedProducts(force = false): Promise<void> {
  try {
    const first = await posDb.products.toCollection().first();
    if (!force && first && !isStale(first.cachedAt)) return;

    const products = await apiClient.get<any[]>('/products');
    const now = Date.now();
    await posDb.products.bulkPut(products.map(p => ({ ...p, cachedAt: now })));
  } catch {
    // Offline — silently skip; cached data will be used
  }
}

// ── Seed customer cache ────────────────────────────────────────
export async function seedCustomers(force = false): Promise<void> {
  try {
    const first = await posDb.customers.toCollection().first();
    if (!force && first && !isStale(first.cachedAt)) return;

    const customers = await apiClient.get<any[]>('/customers');
    const now = Date.now();
    await posDb.customers.bulkPut(customers.map(c => ({ ...c, cachedAt: now })));
  } catch {
    // Offline — silently skip
  }
}

// ── Seed order cache ───────────────────────────────────────────
export async function seedOrders(force = false): Promise<void> {
  try {
    const first = await posDb.orders.orderBy('createdAt').last();
    if (!force && first && !isStale(first.cachedAt)) return;

    const orders = await apiClient.get<any[]>('/orders?limit=100');
    const now = Date.now();
    await posDb.orders.bulkPut(orders.map(o => ({ ...o, cachedAt: now })));
  } catch {
    // Offline — silently skip
  }
}

// ── Full resync (called on reconnect) ─────────────────────────
export async function resyncAll(): Promise<void> {
  await Promise.all([
    seedProducts(true),
    seedCustomers(true),
    seedOrders(true),
  ]);
}

// ── Enqueue an outbound mutation ───────────────────────────────
export async function enqueue(item: Omit<SyncQueueItem, 'id' | 'retries' | 'createdAt'>): Promise<void> {
  await posDb.syncQueue.add({
    ...item,
    createdAt: Date.now(),
    retries: 0,
  });
}

// ── Flush the sync queue ───────────────────────────────────────
export async function flushQueue(): Promise<{ flushed: number; failed: number }> {
  const items = await posDb.syncQueue.orderBy('createdAt').toArray();
  let flushed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      if (item.method === 'POST') {
        await apiClient.post(item.url, item.body);
      } else if (item.method === 'PATCH') {
        await apiClient.patch(item.url, item.body);
      } else if (item.method === 'DELETE') {
        await apiClient.delete(item.url);
      }
      await posDb.syncQueue.delete(item.id!);
      flushed++;
    } catch {
      // Increment retries; abandon after 5
      if (item.retries >= 5) {
        await posDb.syncQueue.delete(item.id!);
        failed++;
      } else {
        await posDb.syncQueue.update(item.id!, { retries: item.retries + 1 });
        failed++;
      }
    }
  }

  return { flushed, failed };
}

// ── Queue size helper ──────────────────────────────────────────
export async function queueSize(): Promise<number> {
  return posDb.syncQueue.count();
}
