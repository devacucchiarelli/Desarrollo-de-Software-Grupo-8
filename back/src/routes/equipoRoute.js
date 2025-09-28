const express = require('express');
const {
  crearEquipoController,
  getEquipoPorCapitanController,
  getTodosLosEquiposController,
  agregarJugadoresController,
  getJugadoresEquipoController,
  eliminarJugadorController
} = require('../controllers/equipoController.js');

const router = express.Router();

router.post('/', crearEquipoController);
router.get('/mi-equipo/:idCapitan', getEquipoPorCapitanController);
router.get('/', getTodosLosEquiposController);
router.get('/jugadores/:idEquipo', getJugadoresEquipoController);
router.post('/agregar-jugadores', agregarJugadoresController);
router.delete("/eliminar-jugador/:idEquipo/:idJugador",eliminarJugadorController);

module.exports = router;
