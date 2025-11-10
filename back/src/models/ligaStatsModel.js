const pool = require('./db');

async function crearOActualizarLigaStats(data) {
    const query = `
      INSERT INTO liga_stats (
        id_torneo, partidos_jugados, goles_totales,
        tarjetas_amarillas_totales, tarjetas_rojas_totales,
        promedio_goles, equipo_mas_goleador, equipo_menos_goleado,
        equipo_con_mas_puntos
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id_torneo) DO UPDATE SET
        partidos_jugados = EXCLUDED.partidos_jugados,
        goles_totales = EXCLUDED.goles_totales,
        tarjetas_amarillas_totales = EXCLUDED.tarjetas_amarillas_totales,
        tarjetas_rojas_totales = EXCLUDED.tarjetas_rojas_totales,
        promedio_goles = EXCLUDED.promedio_goles,
        equipo_mas_goleador = EXCLUDED.equipo_mas_goleador,
        equipo_menos_goleado = EXCLUDED.equipo_menos_goleado,
        equipo_con_mas_puntos = EXCLUDED.equipo_con_mas_puntos
      RETURNING *;
    `;
    const values = [
        data.id_torneo,
        data.partidos_jugados,
        data.goles_totales,
        data.tarjetas_amarillas_totales,
        data.tarjetas_rojas_totales,
        data.promedio_goles,
        data.equipo_mas_goleador,
        data.equipo_menos_goleado,
        data.equipo_con_mas_puntos
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
}
async function crearOActualizarEquipoStats(data) {
    const query = `
      INSERT INTO equipo_stats_liga (
        id_torneo, id_equipo, partidos_jugados, victorias,
        empates, derrotas, goles_a_favor, goles_en_contra,
        puntos, tarjetas_amarillas, tarjetas_rojas, posicion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (id_torneo, id_equipo) DO UPDATE SET
        partidos_jugados = EXCLUDED.partidos_jugados,
        victorias = EXCLUDED.victorias,
        empates = EXCLUDED.empates,
        derrotas = EXCLUDED.derrotas,
        goles_a_favor = EXCLUDED.goles_a_favor,
        goles_en_contra = EXCLUDED.goles_en_contra,
        puntos = EXCLUDED.puntos,
        tarjetas_amarillas = EXCLUDED.tarjetas_amarillas,
        tarjetas_rojas = EXCLUDED.tarjetas_rojas,
        posicion = EXCLUDED.posicion
      RETURNING *;
    `;
    const values = [
        data.id_torneo, data.id_equipo, data.partidos_jugados,
        data.victorias, data.empates, data.derrotas,
        data.goles_a_favor, data.goles_en_contra,
        data.puntos, data.tarjetas_amarillas, data.tarjetas_rojas,
        data.posicion
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
}
module.exports = { crearOActualizarLigaStats, crearOActualizarEquipoStats };
