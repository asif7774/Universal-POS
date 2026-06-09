import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dns from 'dns';
import * as schema from './schema';

// Force IPv4 — Render free tier does not support IPv6
dns.setDefaultResultOrder('ipv4first');

const isProduction = !!process.env['DATABASE_URL'];

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'] ?? 'postgresql://tuxedopos:password@localhost:5432/tuxedopos_dev',
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

export const db = drizzle(pool, { schema });
