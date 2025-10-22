const { UsuarioService } = require('../services/usuarioService.js');

const UsuarioController = {
  async crearUsuario(req, res) {
    console.log('Body recibido en registro:', req.body);
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
};

module.exports = { UsuarioController };
