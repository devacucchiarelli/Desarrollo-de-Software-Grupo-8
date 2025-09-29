const express = require('express');
const equiposRouter = require('./src/routes/equipoRoute.js');
const torneoRouter = require('./src/routes/torneoRoute.js')
const inscripcionesRouter = require('./src/routes/inscripciones.router.js')

const cors = require('cors');
const app = express();

///
require('dotenv').config();
const pool = require('./db')
//

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' })); // puerto del frontend

app.use('/equipos', equiposRouter);
app.use('/torneo', torneoRouter);
app.use('/incripciones', inscripcionesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


///// logica usuarios /////

app.get('/', (req, res) => {
  res.send('Backend de torneos funcionando');
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