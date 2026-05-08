const { Pool } = require('pg');
require('dotenv').config();

const corePool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'wasco_core',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '0000',
});

corePool.on('error', (err) => {
  console.error('[Core DB] Error:', err.message);
});

module.exports = corePool;
