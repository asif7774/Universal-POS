const { Client } = require('pg');

const url = "postgresql://postgres:RTpvtHcdbjra5HOT@db.zzpggrrboswmbxkjoamt.supabase.co:5432/postgres";

async function test() {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query(`SELECT id, email, password_hash, tenant_id FROM users LIMIT 5`);
    console.log("Users:", res.rows);
  } catch (err) {
    console.error("Error connecting:", err);
  } finally {
    await client.end();
  }
}

test();
