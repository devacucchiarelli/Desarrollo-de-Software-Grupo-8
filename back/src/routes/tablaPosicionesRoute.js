const express = require('express');
const { getTablaPosicionesController, actualizarNombreEquipoController } = require('../controllers/tablaPosicionesController');

const router = express.Router();

// GET /tabla/:idTorneo
router.get('/:idTorneo', getTablaPosicionesController);

// PUT /tabla/equipo/:idEquipo
router.put('/equipo/:idEquipo', actualizarNombreEquipoController);

module.exports = router;