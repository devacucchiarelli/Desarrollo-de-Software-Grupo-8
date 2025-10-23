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

async function findEquiposByTorneo(id_torneo) {
  const result = await pool.query(
      `SELECT e.id_equipo, e.nombre_equipo, e.id_capitan
       FROM equipos e
       JOIN equipos_torneo et ON e.id_equipo = et.id_equipo
       WHERE et.id_torneo = $1`,
      [id_torneo]
  );
  return result.rows;
}

// Crear equipos por defecto para un torneo
async function crearEquiposPorDefecto(id_torneo, cantidad_equipos) {
  const equipos = [];
  
  for (let i = 1; i <= cantidad_equipos; i++) {
    const nombreEquipo = `Equipo${String.fromCharCode(64 + i)}`; // EquipoA, EquipoB, etc.
    
    // Crear el equipo
    const equipoResult = await pool.query(
      'INSERT INTO equipos(nombre_equipo, id_capitan) VALUES($1, $2) RETURNING *',
      [nombreEquipo, null] // Sin capitán por defecto
    );
    
    const equipo = equipoResult.rows[0];
    
    // Inscribir el equipo en el torneo
    await pool.query(
      'INSERT INTO equipos_torneo(id_equipo, id_torneo) VALUES($1, $2)',
      [equipo.id_equipo, id_torneo]
    );
    
    equipos.push(equipo);
  }
  
  return equipos;
}

// Actualizar nombre de equipo
async function actualizarNombreEquipo(id_equipo, nuevo_nombre) {
  const result = await pool.query(
    'UPDATE equipos SET nombre_equipo = $1 WHERE id_equipo = $2 RETURNING *',
    [nuevo_nombre, id_equipo]
  );
  return result.rows[0];
}

module.exports = { crearEquipo, 
  findEquipoByCapitan, 
  findAllEquipos, 
  agregarJugadoresAEquipo, 
  getJugadoresEquipo, 
  eliminarJugador,
  getUsuarioPorId,
  findEquiposByTorneo,
  crearEquiposPorDefecto,
  actualizarNombreEquipo
};
