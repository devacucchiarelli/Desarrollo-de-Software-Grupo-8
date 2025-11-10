const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UsuarioModel } = require('../models/usuarioModel.js');
const pool = require('../models/db.js');
UsuarioModel.query = (text, params) => pool.query(text, params);

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

    async obtenerPerfilUsuario(id_usuario) {
    try {
      const query = `
        SELECT 
          u.id_usuario, 
          u.nombre, 
          u.email, 
          u.rol,
          e.id_equipo,
          e.nombre_equipo,
          e.id_capitan,
          CASE WHEN e.id_capitan = u.id_usuario THEN true ELSE false END AS es_capitan
        FROM usuarios u
        LEFT JOIN jugadores_equipo je ON u.id_usuario = je.id_jugador
        LEFT JOIN equipos e ON e.id_equipo = je.id_equipo
        WHERE u.id_usuario = $1;
      `;
      const result = await UsuarioModel.query(query, [id_usuario]);
      const usuario = result.rows[0];

      if (!usuario) return null;

      // Torneos del equipo (si tiene)
      const torneosQuery = `
        SELECT t.id_torneo, t.nombre_torneo, t.tipo_torneo, t.formato
        FROM equipos_torneo et
        JOIN torneos t ON et.id_torneo = t.id_torneo
        WHERE et.id_equipo = $1;
      `;
      const torneos = usuario.id_equipo
        ? (await UsuarioModel.query(torneosQuery, [usuario.id_equipo])).rows
        : [];

      // Estadísticas globales del jugador
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT ejp.id_partido) AS partidos_jugados,
          SUM(ejp.goles) AS goles,
          SUM(ejp.amarillas) AS amarillas,
          SUM(ejp.rojas) AS rojas
        FROM estadisticas_jugador_partido ejp
        WHERE ejp.id_jugador = $1;
      `;
      const stats = (await UsuarioModel.query(statsQuery, [id_usuario])).rows[0];

      return {
        usuario,
        torneos,
        estadisticas: stats || {
          partidos_jugados: 0,
          goles: 0,
          amarillas: 0,
          rojas: 0,
        },
      };
    } catch (error) {
      console.error('Error en obtenerPerfilUsuario:', error);
      throw new Error('No se pudo obtener el perfil del usuario');
    }
  },

};

module.exports = { UsuarioService };
