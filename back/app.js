const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const equiposRouter = require('./src/routes/equipoRoute.js');
const torneoRouter = require('./src/routes/torneoRoute.js');
const inscripcionesRouter = require('./src/routes/inscripciones.router.js');
const usuarioRoutes = require('./src/routes/usuarioRoutes.js');

const verificarToken = require('./src/middleware/authMiddleware.js');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
  })
);

// 🔒 Middleware para proteger todas las rutas excepto login y registro
app.use((req, res, next) => {
  // rutas públicas
  const rutasPublicas = ['/usuarios/login', '/usuarios']; // login y registro
  if (rutasPublicas.includes(req.path) && req.method === 'POST') {
    return next();
  }
  verificarToken(req, res, next);
});

// Rutas
app.use('/equipos', equiposRouter);
app.use('/torneo', torneoRouter);
app.use('/inscripciones', inscripcionesRouter);
app.use('/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
  res.send('Backend de torneos funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
