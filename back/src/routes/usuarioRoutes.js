const express = require('express');
const { UsuarioController } = require('../controllers/usuarioController.js');
const verificarToken = require('../middleware/authMiddleware.js');

const router = express.Router();

// Registro y login son públicos
router.post('/', UsuarioController.crearUsuario);
router.post('/login', UsuarioController.login);

// Logout y obtener usuarios requieren autenticación
router.post('/logout', verificarToken, UsuarioController.logout);
router.get('/', verificarToken, UsuarioController.obtenerUsuarios);

module.exports = router;
