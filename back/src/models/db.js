const { Pool } = require('pg');

const pool = new Pool({
  user: 'alejandro',
  host: 'localhost',
  database: 'futbol_db',
  password: 'clave123',
  port: 5432,
});

module.exports = pool;
