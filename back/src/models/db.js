const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'futbol_db',
  password: 'admin123',
  port: 5432,
});

module.exports = pool;
