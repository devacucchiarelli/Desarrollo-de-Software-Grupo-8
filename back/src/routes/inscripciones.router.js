
// back/router/inscripciones.router.js
const express = require('express');
const inscripcionesController = require('../controllers/inscripciones.controller');

const router = express.Router();

// lista inscripciones (básico)
router.get('/', inscripcionesController.listar);

// crear inscripcion (crea usuario capitan si no existe, crea equipo y lo asocia al torneo)
router.post('/', inscripcionesController.crear);

module.exports = router;
