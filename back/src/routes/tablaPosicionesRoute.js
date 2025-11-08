const express = require('express');
const { getTablaPosicionesController, actualizarNombreEquipoController } = require('../controllers/tablaPosicionesController');


const verificarToken = require('../middleware/authMiddleware.js');


const router = express.Router();

// GET /tabla/:idTorneo
router.get('/:idTorneo', getTablaPosicionesController);


// PUT /tabla/equipo/:idEquipo → actualizar nombre del equipo (requiere login)
router.put('/equipo/:idEquipo', verificarToken, actualizarNombreEquipoController);

module.exports = router;