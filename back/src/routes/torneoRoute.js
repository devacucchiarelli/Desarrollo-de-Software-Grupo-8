const express = require('express');
const {
 crearTorneoController,
 getTodosLosTorneosController,
 eliminarTorneoController,
 editarTorneoController
} = require('../controllers/torneoController.js');


const router = express.Router();

router.post('/', crearTorneoController);
router.get('/', getTodosLosTorneosController);
router.delete('/:id', eliminarTorneoController);
router.put('/:id', editarTorneoController);

module.exports = router;    
