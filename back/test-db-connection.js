const { Pool } = require('pg');

// Diferentes configuraciones a probar
const configs = [
  { name: 'localhost', host: 'localhost' },
  { name: '127.0.0.1', host: '127.0.0.1' },
  { name: '0.0.0.0', host: '0.0.0.0' },
  { name: 'host.docker.internal', host: 'host.docker.internal' }
];

async function testConnection(configName, host) {
  const pool = new Pool({
    user: 'admin',
    host: host,
    database: 'futbol_db',
    password: 'admin123',
    port: 5433,
    ssl: false,
    connectionTimeoutMillis: 3000
  });

  try {
    console.log(`\n🔍 Probando: ${configName} (${host})`);
   
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!');
   
    const result = await client.query('SELECT current_user');
    console.log('👤 Usuario:', result.rows[0].current_user);
   
    client.release();
    console.log(`🎉 ¡${configName} FUNCIONA!`);
    return true;
   
  } catch (err) {
    console.error(`❌ ${configName} falló:`, err.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function testAllConfigs() {
  console.log('🚀 Probando diferentes configuraciones de host...');
  
  for (const config of configs) {
    const success = await testConnection(config.name, config.host);
    if (success) {
      console.log(`\n✨ Usa esta configuración en tu aplicación:`);
      console.log(`host: '${config.host}'`);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testAllConfigs();