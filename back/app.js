const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const equiposRouter = require('./src/routes/equipoRoute.js');
const torneoRouter = require('./src/routes/torneoRoute.js');
const inscripcionesRouter = require('./src/routes/inscripciones.router.js');
const usuarioRoutes = require('./src/routes/usuarioRoutes.js');
const tablaPosicionesRouter = require('./src/routes/tablaPosicionesRoute.js');
const estadisticasRouter = require('./src/routes/estadisticasRoute');
const partidoRouter = require('./src/routes/partidoRoute.js');

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
  // Definimos rutas públicas permitidas
  const rutasPublicasPOST = ['/usuarios/login', '/usuarios'];
  
  // Lista de rutas GET públicas (pueden ser strings o regex)
  const rutasPublicasGET = [
    '/torneo',            // lista de torneos
    /^\/partidos\/\d+$/,  // ver fixture por torneo
    /^\/tabla\/\d+$/      // ver tabla de posiciones por torneo
  ];


  // Si la ruta es pública, dejamos pasar
  if (req.method === 'POST' && rutasPublicasPOST.includes(req.path)) {
    return next();
  }
  
  if (req.method === 'GET') {
    for (const ruta of rutasPublicasGET) {
      if (typeof ruta === 'string' && ruta === req.path) {
        return next();
      }
      // Chequeamos si la ruta es una Expresión Regular y si coincide
      if (ruta instanceof RegExp && ruta.test(req.path)) {
        return next();
      }
    }
  }

  // Si no es pública, verificamos el token
  verificarToken(req, res, next);
});


// --- Fin Middleware ---

// Rutas
app.use('/equipos', equiposRouter);
app.use('/torneo', torneoRouter);
app.use('/inscripciones', inscripcionesRouter);
app.use('/usuarios', usuarioRoutes);

app.use('/partidos', partidoRouter);
app.use('/tabla', tablaPosicionesRouter);
app.use('/estadisticas', estadisticasRouter);

app.get('/', (req, res) => {
  res.send('Backend de torneos funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));