const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UsuarioModel } = require('../models/usuarioModel.js');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta';

const UsuarioService = {
  async crearUsuario({ nombre, email, password, rol }) {
    console.log('Crear usuario llamado con:', { nombre, email, password, rol });

    if (!nombre || !email || !password || !rol) {
      console.log('Error: falta algún campo obligatorio');
      throw new Error('Todos los campos son obligatorios');
    }

    const password_hash = await bcrypt.hash(password, 10);
    console.log('Password hasheado:', password_hash);

    try {
      const usuarioCreado = await UsuarioModel.crearUsuario({ nombre, email, password: password_hash, rol });
      console.log('Usuario creado en DB:', usuarioCreado);
      return usuarioCreado;
    } catch (err) {
      console.error('Error al crear usuario en DB:', err.message);
      throw new Error('Error en la base de datos');
    }
  },

  async obtenerUsuarios() {
    console.log('Obtener todos los usuarios');
    try {
      const usuarios = await UsuarioModel.obtenerUsuarios();
      console.log('Usuarios obtenidos:', usuarios);
      return usuarios;
    } catch (err) {
      console.error('Error al obtener usuarios:', err.message);
      throw new Error('Error en la base de datos');
    }
  },

  async login({ email, password }) {
    console.log('Login llamado con email:', email);

    const usuario = await UsuarioModel.obtenerPorEmail(email);
    if (!usuario) {
      console.log('Usuario no encontrado');
      throw new Error('Usuario no encontrado');
    }
    console.log('Usuario encontrado:', usuario);

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    console.log('Password válido:', passwordValido);
    if (!passwordValido) throw new Error('Contraseña incorrecta');

    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('Usuario encontrado:', usuario);
    console.log('Generando token con id_usuario:', usuario.id_usuario);

    console.log('Token generado:', token);

    return { usuario, token };
  },
};

module.exports = { UsuarioService };
