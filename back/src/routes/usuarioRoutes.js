const express = require('express');
const { UsuarioController } = require('../controllers/usuarioController.js');
const verificarToken = require('../middleware/authMiddleware.js');

const router = express.Router();

// Registro y login son públicos
router.post('/', UsuarioController.crearUsuario);
router.post('/login', UsuarioController.login);
router.post('/login', UsuarioController.login);
router.get('/me', verificarToken, UsuarioController.getMeController);

// Perfil de usuario requiere autenticación
router.get('/perfil', verificarToken, UsuarioController.obtenerPerfilUsuario);

// Logout y obtener usuarios requieren autenticación
router.post('/logout', verificarToken, UsuarioController.logout);
router.get('/', verificarToken, UsuarioController.obtenerUsuarios);

module.exports = router;
