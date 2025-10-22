const express = require('express');
const { EstadisticasController } = require('../controllers/estadisticasController.js');

const router = express.Router();

// Registrar estadísticas generales del partido
router.post('/partido', EstadisticasController.registrarEstadisticaPartido);

// Registrar estadísticas individuales de jugadores
router.post('/jugadores', EstadisticasController.registrarEstadisticasJugadores);

// Obtener estadísticas de un partido
router.get('/partido/:id_partido', EstadisticasController.obtenerEstadisticasPartido);

module.exports = router;
