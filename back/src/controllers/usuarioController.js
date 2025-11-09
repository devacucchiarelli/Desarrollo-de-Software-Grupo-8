const { UsuarioService } = require('../services/usuarioService.js');

const UsuarioController = {
  async crearUsuario(req, res) {
    try {
      const usuario = await UsuarioService.crearUsuario(req.body);
      res.status(201).json({
        message: 'Usuario registrado correctamente',
        usuario,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await UsuarioService.obtenerUsuarios();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { usuario, token } = await UsuarioService.login({ email, password });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });

      res.json({ message: 'Login exitoso', usuario });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada correctamente' });
  },

  async getMeController(req, res) {
    try {

      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      res.status(200).json({
        id_usuario: req.usuario.id_usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
        rol: req.usuario.rol
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { UsuarioController };
