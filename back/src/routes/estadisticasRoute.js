const { Router } = require('express');
const {
  obtenerEstadisticasController,
  actualizarEstadisticasController,
} = require('../controllers/estadisticasController');

const router = Router();

// GET  /estadisticas/:id_torneo  -> devuelve totales calculados
router.get('/:id_torneo', obtenerEstadisticasController);

// PUT  /estadisticas/:id_torneo  -> recalcula (y persiste si quieres)
router.put('/:id_torneo', actualizarEstadisticasController);

module.exports = router;
