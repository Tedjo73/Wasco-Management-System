const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'wasco_db',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '0000',
});

pool.on('connect', () => {
  console.log('[PostgreSQL] Connected to wasco_db');
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Connection error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
