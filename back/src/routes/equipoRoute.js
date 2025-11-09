const express = require('express');
const {
  crearEquipoController,
  getEquipoPorCapitanController,
  getTodosLosEquiposController,
  agregarJugadoresController,
  getJugadoresEquipoController,
  eliminarJugadorController,
  crearSolicitudInscripcionController,
  getSolicitudesPendientesController,
  responderSolicitudController,
  getEquipoPorIdController
} = require('../controllers/equipoController.js');

const router = express.Router();

// Rutas existentes
router.post('/', crearEquipoController);
router.get('/mi-equipo/:idCapitan', getEquipoPorCapitanController);
router.get('/', getTodosLosEquiposController);
router.get('/jugadores/:idEquipo', getJugadoresEquipoController);
router.post('/agregar-jugadores', agregarJugadoresController);
router.delete("/eliminar-jugador/:idEquipo/:idJugador", eliminarJugadorController);

// Nuevas rutas para solicitudes
router.get('/detalle/:idEquipo', getEquipoPorIdController); // Info pública del equipo
router.post('/solicitar-inscripcion', crearSolicitudInscripcionController);
router.get('/solicitudes/:idEquipo', getSolicitudesPendientesController);
router.patch('/solicitudes/:id_solicitud/responder', responderSolicitudController);

module.exports = router;