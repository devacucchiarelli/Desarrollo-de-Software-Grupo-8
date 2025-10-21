const express = require('express');
const {
  getPartidosController,
  updatePartidoController,
  deletePartidoController
} = require('../controllers/partidoController.js');
// Importamos el middleware de autenticación
const verificarToken = require('../middleware/authMiddleware.js');

const router = express.Router();

// GET /partidos/:idTorneo - Ver el fixture (público)
router.get('/:idTorneo', getPartidosController);

// PUT /partidos/:idPartido - Editar un partido (privado, requiere login)
router.put('/:idPartido', verificarToken, updatePartidoController);

// DELETE /partidos/:idPartido - Eliminar un partido (privado, requiere login)
router.delete('/:idPartido', verificarToken, deletePartidoController);

module.exports = router;