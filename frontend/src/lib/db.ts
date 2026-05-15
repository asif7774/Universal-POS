/**
 * TuxedoPOS — Offline-First Database (Dexie.js / IndexedDB)
 *
 * Tables:
 *   products  — cached product catalog (synced from GET /products)
 *   customers — cached customer list   (synced from GET /customers)
 *   orders    — completed orders cache (synced from GET /orders)
 *   syncQueue — outbound mutations to replay when back online
 */

import Dexie, { type Table } from 'dexie';

// ── Entity types mirroring the API ─────────────────────────────

export interface CachedProduct {
  id: string;
  sku: string;
  name: string;
  type: string;
  category: string;
  salePrice?: string | null;
  rentalRatePerDay?: string | null;
  taxable: boolean;
  isActive: boolean;
  trackInventory: boolean;
  cachedAt: number; // Date.now()
}

export interface CachedCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  loyaltyPoints: number;
  tags: string[];
  cachedAt: number;
}

export interface CachedOrder {
  id: string;
  orderNo: string;
  status: string;
  type: string;
  total: string | null;
  subtotal: string | null;
  taxAmt: string | null;
  paymentMethod: string | null;
  createdAt: string;
  cachedAt: number;
}

export type SyncOperation = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface SyncQueueItem {
  id?: number; // auto-increment PK
  method: SyncOperation;
  url: string;
  body?: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

// ── Database definition ────────────────────────────────────────

class TuxedoPOSDatabase extends Dexie {
  products!: Table<CachedProduct, string>;
  customers!: Table<CachedCustomer, string>;
  orders!: Table<CachedOrder, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('TuxedoPOS');

    this.version(1).stores({
      products:  'id, sku, category, type, cachedAt',
      customers: 'id, firstName, lastName, cachedAt',
      orders:    'id, orderNo, status, createdAt, cachedAt',
      syncQueue: '++id, method, url, createdAt',
    });
  }
}

export const posDb = new TuxedoPOSDatabase();
