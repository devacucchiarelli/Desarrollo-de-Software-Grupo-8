const pool = require('./db');

// Crear equipo
async function crearEquipo(nombre_equipo, id_capitan) {
  const result = await pool.query(
    'INSERT INTO equipos(nombre_equipo, id_capitan) VALUES($1, $2) RETURNING *',
    [nombre_equipo, id_capitan]
  );
  return result.rows[0];
}

// Buscar equipo por capitán
async function findEquipoByCapitan(id_capitan) {
  const result = await pool.query(
    'SELECT * FROM equipos WHERE id_capitan = $1',
    [id_capitan]
  );
  return result.rows[0] || null;
}

// Traer todos los equipos
async function findAllEquipos() {
  const result = await pool.query('SELECT * FROM equipos');
  return result.rows;
}

async function agregarJugadoresAEquipo(id_equipo, jugadoresIds) {
  const queries = jugadoresIds.map(
    (id_jugador) =>
      pool.query(
        'INSERT INTO jugadores_equipo(id_equipo, id_jugador) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id_equipo, id_jugador]
      )
  );

  await Promise.all(queries);

  return { id_equipo, jugadores_agregados: jugadoresIds };
}

async function getJugadoresEquipo  (idEquipo)  {
  const result = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email
     FROM jugadores_equipo je
     JOIN usuarios u ON je.id_jugador = u.id_usuario
     WHERE je.id_equipo = $1`,
    [idEquipo]
  );
  return result.rows;
};

async function eliminarJugador  (idEquipo, idJugador) {
  const result = await pool.query(
    `DELETE FROM jugadores_equipo
     WHERE id_equipo = $1 AND id_jugador = $2
     RETURNING *`,
    [idEquipo, idJugador]
  );
  return result.rows[0];
};

async function getUsuarioPorId(id) {
  const result = await pool.query(
    `SELECT u.id_usuario
     FROM jugadores_equipo je
     JOIN usuarios u ON je.id_jugador = u.id_usuario
     WHERE u.id_usuario = $1`,
    [id] // usamos el parámetro que recibimos
  );
  return result.rows[0]; // devuelve un solo usuario
}


module.exports = { crearEquipo, 
  findEquipoByCapitan, 
  findAllEquipos, 
  agregarJugadoresAEquipo, 
  getJugadoresEquipo, 
  eliminarJugador,
  getUsuarioPorId
};
