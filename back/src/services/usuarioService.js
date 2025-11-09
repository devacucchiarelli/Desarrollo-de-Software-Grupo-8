const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UsuarioModel } = require('../models/usuarioModel.js');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta';

const UsuarioService = {
  async crearUsuario({ nombre, email, password, rol }) {

    if (!nombre || !email || !password || !rol) {
      console.log('Error: falta algún campo obligatorio');
      throw new Error('Todos los campos son obligatorios');
    }

    const password_hash = await bcrypt.hash(password, 10);

    try {
      const usuarioCreado = await UsuarioModel.crearUsuario({ nombre, email, password: password_hash, rol });
      return usuarioCreado;
    } catch (err) {
      console.error('Error al crear usuario en DB:', err.message);
      throw new Error('Error en la base de datos');
    }
  },

  async obtenerUsuarios() {
    try {
      const usuarios = await UsuarioModel.obtenerUsuarios();
      return usuarios;
    } catch (err) {
      console.error('Error al obtener usuarios:', err.message);
      throw new Error('Error en la base de datos');
    }
  },

  async login({ email, password }) {
    const usuario = await UsuarioModel.obtenerPorEmail(email);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) throw new Error('Contraseña incorrecta');

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    return { usuario, token };
  },
};

module.exports = { UsuarioService };
