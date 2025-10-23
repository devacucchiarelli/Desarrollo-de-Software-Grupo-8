const pool = require('./db');

// Crear un partido
async function crearPartido(id_torneo, fecha_partido, equipo_local, equipo_visitante) {
  const result = await pool.query(
    `INSERT INTO partidos(id_torneo, fecha_partido, equipo_local, equipo_visitante) 
     VALUES($1, $2, $3, $4) 
     RETURNING *`,
    [id_torneo, fecha_partido, equipo_local, equipo_visitante]
  );
  return result.rows[0];
}

// Traer todos los partidos de un torneo
async function getPartidosPorTorneo(id_torneo) {
  const result = await pool.query(
    `SELECT *, TO_CHAR(fecha_partido, 'DD/MM/YYYY HH24:MI') as fecha_formato
     FROM partidos 
     WHERE id_torneo = $1
     ORDER BY fecha_partido ASC`,
    [id_torneo]
  );
  return result.rows;
}

// Actualizar un partido (para editar hora, resultado, etc.)
async function updatePartido(id_partido, fecha_partido, equipo_local, equipo_visitante, resultado_local, resultado_visitante) {
  const result = await pool.query(
    `UPDATE partidos 
     SET fecha_partido = $1, 
         equipo_local = $2, 
         equipo_visitante = $3, 
         resultado_local = $4, 
         resultado_visitante = $5
     WHERE id_partido = $6
     RETURNING *`,
    [fecha_partido, equipo_local, equipo_visitante, resultado_local, resultado_visitante, id_partido]
  );
  return result.rows[0];
}

// Eliminar un partido
async function deletePartido(id_partido) {
  const result = await pool.query(
    'DELETE FROM partidos WHERE id_partido = $1 RETURNING *',
    [id_partido]
  );
  return result.rows[0];
}

// Insertar o actualizar estadísticas de un jugador en un partido
async function upsertEstadisticaJugadorPartido(id_partido, id_jugador, goles = 0, amarillas = 0, rojas = 0) {
  const result = await pool.query(`
    INSERT INTO estadistica_jugador_partido(id_partido, id_jugador, goles, amarillas, rojas)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id_partido, id_jugador)
    DO UPDATE SET goles = EXCLUDED.goles, amarillas = EXCLUDED.amarillas, rojas = EXCLUDED.rojas
    RETURNING *;
  `, [id_partido, id_jugador, goles, amarillas, rojas]);

  return result.rows[0];
}

module.exports = {
  crearPartido,
  getPartidosPorTorneo,
  updatePartido,
  deletePartido,
  upsertEstadisticaJugadorPartido,  //Nueva
};