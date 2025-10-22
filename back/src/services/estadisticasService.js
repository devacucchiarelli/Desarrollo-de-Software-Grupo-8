const pool = require('../db');

const EstadisticasService = {
  // Crear o actualizar estadísticas globales del partido
  async registrarEstadisticaPartido({ id_partido, id_ganador, id_goleador, goles_local, goles_visitante, amarillas_local, amarillas_visitante, rojas_local, rojas_visitante }) {
    const query = `
      INSERT INTO estadisticas_partido (
        id_partido, id_ganador, id_goleador, goles_local, goles_visitante, amarillas_local, amarillas_visitante, rojas_local, rojas_visitante
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id_partido) DO UPDATE
      SET id_ganador = EXCLUDED.id_ganador,
          id_goleador = EXCLUDED.id_goleador,
          goles_local = EXCLUDED.goles_local,
          goles_visitante = EXCLUDED.goles_visitante,
          amarillas_local = EXCLUDED.amarillas_local,
          amarillas_visitante = EXCLUDED.amarillas_visitante,
          rojas_local = EXCLUDED.rojas_local,
          rojas_visitante = EXCLUDED.rojas_visitante
      RETURNING *;
    `;
    const values = [id_partido, id_ganador, id_goleador, goles_local, goles_visitante, amarillas_local, amarillas_visitante, rojas_local, rojas_visitante];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Registrar estadísticas individuales de jugadores
  async registrarEstadisticasJugadores(id_partido, jugadoresStats) {
    const results = [];
    for (const j of jugadoresStats) {
      const query = `
        INSERT INTO estadisticas_jugador_partido (id_partido, id_jugador, goles, amarillas, rojas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [id_partido, j.id_jugador, j.goles, j.amarillas, j.rojas];
      const res = await pool.query(query, values);
      results.push(res.rows[0]);
    }
    return results;
  },

  // Obtener estadísticas completas de un partido
  async obtenerEstadisticasPartido(id_partido) {
    const partido = await pool.query(
      `SELECT * FROM estadisticas_partido WHERE id_partido = $1`,
      [id_partido]
    );
    const jugadores = await pool.query(
      `SELECT * FROM estadisticas_jugador_partido WHERE id_partido = $1`,
      [id_partido]
    );
    return {
      partido: partido.rows[0] || null,
      jugadores: jugadores.rows,
    };
  },
};

module.exports = { EstadisticasService };
