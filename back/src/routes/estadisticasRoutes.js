const express = require('express');
const { EstadisticasController } = require('../controllers/estadisticasController.js');

const router = express.Router();

// ✅ NUEVAS RUTAS
// Obtener lista de torneos con estadísticas
router.get('/torneos', EstadisticasController.obtenerTorneosConEstadisticas);

// Obtener estadísticas completas de un torneo
router.get('/torneo/:id_torneo', EstadisticasController.obtenerEstadisticasTorneo);

// Registrar estadísticas generales del partido
router.post('/partido', EstadisticasController.registrarEstadisticaPartido);

// Registrar estadísticas individuales de jugadores
router.post('/jugadores', EstadisticasController.registrarEstadisticasJugadores);

// Obtener estadísticas de un partido específico
router.get('/partido/:id_partido', EstadisticasController.obtenerEstadisticasPartido);

module.exports = router;