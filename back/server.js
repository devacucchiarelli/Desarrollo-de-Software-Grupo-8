
// back/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health
app.get('/api/health', (_, res) => res.json({ ok: true }));

// monta inscripciones
app.use('/api/v1/inscripciones', require('./router/inscripciones.router'));

// (OPCIONAL) si tenés router de torneos para poblar el select del front
// app.use('/api/v1/torneos', require('./router/torneos.router'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
