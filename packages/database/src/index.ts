import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected pool error:', err);
});

export { pool };
export default pool;
