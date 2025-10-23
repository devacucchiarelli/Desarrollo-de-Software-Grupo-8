const  pool  = require('./db.js'); // ajustá la ruta si es necesario

const UsuarioModel = {
  async crearUsuario({ nombre, email, password, rol }) {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, email, password, rol]
    );
    return result.rows[0];
  },

  async obtenerUsuarios() {
    const result = await pool.query('SELECT * FROM usuarios');
    return result.rows;
  },

  async obtenerPorEmail(email) {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },
};

module.exports = { UsuarioModel };
