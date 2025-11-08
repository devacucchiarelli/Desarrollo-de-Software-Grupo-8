
const { pool } = require('../../db');


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
    `SELECT 
      id_partido,
      id_torneo,
      fecha_partido,
      TO_CHAR(fecha_partido, 'DD/MM/YYYY HH24:MI') as fecha_formato,
      equipo_local,
      equipo_visitante,
      id_equipo_local,        -- AGREGAR
      id_equipo_visitante,    -- AGREGAR
      resultado_local,
      resultado_visitante
     FROM partidos 
     WHERE id_torneo = $1
     ORDER BY id_partido`,
    [id_torneo]
  );
  return result.rows;
}

// Actualizar un partido (para editar hora, resultado, etc.)
async function updatePartido(
  id_partido, 
  fecha_partido, 
  equipo_local, 
  equipo_visitante,
  id_equipo_local,        // NUEVO
  id_equipo_visitante,    // NUEVO
  resultado_local, 
  resultado_visitante
) {
  const result = await pool.query(
    `UPDATE partidos 
     SET fecha_partido = $1, 
         equipo_local = $2, 
         equipo_visitante = $3,
         id_equipo_local = $4,        -- AGREGAR
         id_equipo_visitante = $5,    -- AGREGAR
         resultado_local = $6, 
         resultado_visitante = $7
     WHERE id_partido = $8
     RETURNING *`,
    [
      fecha_partido, 
      equipo_local, 
      equipo_visitante,
      id_equipo_local,        // AGREGAR
      id_equipo_visitante,    // AGREGAR
      resultado_local, 
      resultado_visitante, 
      id_partido
    ]
  );
  return result.rows[0];
}

// Eliminar un partido
async function deletePartido(id_partido) {
  const result = await pool.query(
    `DELETE FROM partidos WHERE id_partido = $1 RETURNING *`,
    [id_partido]
  );
  return result.rows[0];
}

// Insertar o actualizar estadísticas de un jugador en un partido
async function upsertEstadisticaJugadorPartido(id_partido, id_jugador, goles, amarillas, rojas) {
  const result = await pool.query(
    `INSERT INTO estadisticas_jugador_partido (id_partido, id_jugador, goles, amarillas, rojas)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id_partido, id_jugador) 
     DO UPDATE SET 
       goles = estadisticas_jugador_partido.goles + EXCLUDED.goles,
       amarillas = estadisticas_jugador_partido.amarillas + EXCLUDED.amarillas,
       rojas = estadisticas_jugador_partido.rojas + EXCLUDED.rojas
     RETURNING *`,
    [id_partido, id_jugador, goles, amarillas, rojas]
  );
  return result.rows[0];
}

async function deleteEstadisticasPartido(id_partido) {
  await pool.query(
    `DELETE FROM estadisticas_jugador_partido WHERE id_partido = $1`,
    [id_partido]
  );
}

module.exports = {
  crearPartido,
  getPartidosPorTorneo,
  updatePartido,
  deletePartido,
  upsertEstadisticaJugadorPartido,
  deleteEstadisticasPartido  //Nueva
};