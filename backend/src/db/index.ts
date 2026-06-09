import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const isProduction = !!process.env['DATABASE_URL'];

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'] ?? 'postgresql://tuxedopos:password@localhost:5432/tuxedopos_dev',
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

export const db = drizzle(pool, { schema });
