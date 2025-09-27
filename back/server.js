require('dotenv').config();

const pool = require('./db')
const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 3000;

console.log('DB_USER desde .env:', process.env.DB_USER);
console.log('DB_PASSWORD desde .env:', process.env.DB_PASSWORD);

// Middleware para interpretar JSON
app.use(express.json());

// Middleware CORS 
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de torneos funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, email, password, rol]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Error de conexión a PostgreSQL:', err);
  else console.log('Conexión exitosa:', res.rows[0]);
});