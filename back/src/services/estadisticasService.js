const pool = require('../models/db');

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

    // ✅ Filtrar jugadores sin ID válido
    const jugadoresValidos = jugadoresStats.filter(j => {
      if (!j.id_jugador) {
        console.warn(`⚠️ Jugador sin ID válido ignorado:`, j);
        return false;
      }
      return true;
    });

    if (jugadoresValidos.length === 0) {
      console.warn('⚠️ No hay jugadores válidos para registrar estadísticas');
      return [];
    }

    for (const j of jugadoresValidos) {
      const query = `
        INSERT INTO estadisticas_jugador_partido (id_partido, id_jugador, goles, amarillas, rojas)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id_partido, id_jugador)
        DO UPDATE SET 
          goles = EXCLUDED.goles,
          amarillas = EXCLUDED.amarillas,
          rojas = EXCLUDED.rojas
        RETURNING *;
      `;
      const values = [
        id_partido,
        j.id_jugador,
        j.goles || 0,
        j.amarillas || 0,
        j.rojas || 0
      ];

      try {
        const res = await pool.query(query, values);
        results.push(res.rows[0]);
      } catch (error) {
        console.error(`❌ Error al insertar jugador ${j.id_jugador}:`, error.message);
        throw error;
      }
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

  // ✅ NUEVO: Obtener últimos partidos con estadísticas
  async obtenerUltimosPartidos() {
    const query = `
      SELECT 
        p.id_partido,
        p.fecha_partido,
        p.equipo_local,
        p.equipo_visitante,
        p.resultado_local,
        p.resultado_visitante,
        ep.id_goleador,
        u.nombre as goleador,
        COALESCE(ep.amarillas_local, 0) + COALESCE(ep.amarillas_visitante, 0) as amarillas,
        COALESCE(ep.rojas_local, 0) + COALESCE(ep.rojas_visitante, 0) as rojas
      FROM partidos p
      LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
      LEFT JOIN usuarios u ON ep.id_goleador = u.id_usuario
      WHERE p.resultado_local IS NOT NULL 
        AND p.resultado_visitante IS NOT NULL
      ORDER BY p.fecha_partido DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
  },
  async obtenerEstadisticasTorneo(id_torneo) {
    // Obtener información del torneo
    const torneoQuery = `
      SELECT 
        id_torneo,
        nombre_torneo,
        fecha_inicio,
        fecha_fin,
        tipo_torneo,
        formato
      FROM torneos
      WHERE id_torneo = $1
    `;
    const torneoResult = await pool.query(torneoQuery, [id_torneo]);

    if (torneoResult.rows.length === 0) {
      throw new Error('Torneo no encontrado');
    }

    // Obtener todos los partidos con estadísticas
    const partidosQuery = `
      SELECT 
        p.id_partido,
        p.fecha_partido,
        p.equipo_local,
        p.equipo_visitante,
        p.resultado_local,
        p.resultado_visitante,
        ep.id_goleador,
        u.nombre as nombre_goleador,
        u.email as email_goleador,
        COALESCE(ep.amarillas_local, 0) + COALESCE(ep.amarillas_visitante, 0) as total_amarillas,
        COALESCE(ep.rojas_local, 0) + COALESCE(ep.rojas_visitante, 0) as total_rojas
      FROM partidos p
      LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
      LEFT JOIN usuarios u ON ep.id_goleador = u.id_usuario
      WHERE p.id_torneo = $1
        AND p.resultado_local IS NOT NULL 
        AND p.resultado_visitante IS NOT NULL
      ORDER BY p.fecha_partido DESC
    `;
    const partidosResult = await pool.query(partidosQuery, [id_torneo]);

    // Obtener estadísticas detalladas de jugadores por partido
    const jugadoresQuery = `
      SELECT 
        ejp.id_partido,
        ejp.id_jugador,
        u.nombre as nombre_jugador,
        u.email as email_jugador,
        ejp.goles,
        ejp.amarillas,
        ejp.rojas
      FROM estadisticas_jugador_partido ejp
      INNER JOIN usuarios u ON ejp.id_jugador = u.id_usuario
      INNER JOIN partidos p ON ejp.id_partido = p.id_partido
      WHERE p.id_torneo = $1
      ORDER BY ejp.id_partido, ejp.goles DESC
    `;
    const jugadoresResult = await pool.query(jugadoresQuery, [id_torneo]);

    // Agrupar jugadores por partido
    const jugadoresPorPartido = {};
    jugadoresResult.rows.forEach(jugador => {
      if (!jugadoresPorPartido[jugador.id_partido]) {
        jugadoresPorPartido[jugador.id_partido] = [];
      }
      jugadoresPorPartido[jugador.id_partido].push(jugador);
    });

    // Combinar información
    const partidosConEstadisticas = partidosResult.rows.map(partido => ({
      ...partido,
      jugadores: jugadoresPorPartido[partido.id_partido] || []
    }));

    // Calcular estadísticas generales del torneo
    const statsGeneralesQuery = `
      SELECT 
        COUNT(DISTINCT p.id_partido) as total_partidos,
        SUM(p.resultado_local + p.resultado_visitante) as total_goles,
        SUM(COALESCE(ep.amarillas_local, 0) + COALESCE(ep.amarillas_visitante, 0)) as total_amarillas,
        SUM(COALESCE(ep.rojas_local, 0) + COALESCE(ep.rojas_visitante, 0)) as total_rojas
      FROM partidos p
      LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
      WHERE p.id_torneo = $1
        AND p.resultado_local IS NOT NULL 
        AND p.resultado_visitante IS NOT NULL
    `;
    const statsGeneralesResult = await pool.query(statsGeneralesQuery, [id_torneo]);

    // Tabla de goleadores del torneo
    const goleadoresQuery = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        SUM(ejp.goles) as total_goles
      FROM estadisticas_jugador_partido ejp
      INNER JOIN usuarios u ON ejp.id_jugador = u.id_usuario
      INNER JOIN partidos p ON ejp.id_partido = p.id_partido
      WHERE p.id_torneo = $1
      GROUP BY u.id_usuario, u.nombre, u.email
      HAVING SUM(ejp.goles) > 0
      ORDER BY total_goles DESC
      LIMIT 10
    `;
    const goleadoresResult = await pool.query(goleadoresQuery, [id_torneo]);

    return {
      torneo: torneoResult.rows[0],
      partidos: partidosConEstadisticas,
      estadisticasGenerales: statsGeneralesResult.rows[0],
      tablaGoleadores: goleadoresResult.rows
    };
  },

  // ✅ NUEVO: Obtener lista de torneos con partidos jugados
  async obtenerTorneosConEstadisticas() {
    try {
      console.log('📊 Obteniendo torneos con estadísticas...');

      const query = `
      SELECT 
        t.id_torneo,
        t.nombre_torneo,
        t.tipo_torneo,
        t.formato,
        t.fecha_inicio,
        COUNT(DISTINCT p.id_partido) as partidos_jugados
      FROM torneos t
      INNER JOIN partidos p ON t.id_torneo = p.id_torneo
      WHERE p.resultado_local IS NOT NULL 
        AND p.resultado_visitante IS NOT NULL
      GROUP BY t.id_torneo, t.nombre_torneo, t.tipo_torneo, t.formato, t.fecha_inicio
      ORDER BY t.fecha_inicio DESC
    `;

      const result = await pool.query(query);
      console.log('✅ Torneos encontrados:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('❌ Error en obtenerTorneosConEstadisticas:', error);
      throw error;
    }
  },
  async obtenerResumenEstadisticasTorneo(id_torneo) {
    try {
      // Verificar que el torneo existe
      const torneoQuery = `
      SELECT id_torneo, nombre_torneo, tipo_torneo, formato
      FROM torneos
      WHERE id_torneo = $1
    `;
      const torneoResult = await pool.query(torneoQuery, [id_torneo]);

      if (torneoResult.rows.length === 0) {
        throw new Error('Torneo no encontrado');
      }

      // Goleador del torneo
      const goleadorQuery = `
      SELECT 
        u.id_usuario as id_jugador,
        u.nombre,
        u.email,
        SUM(ejp.goles) as total_goles
      FROM estadisticas_jugador_partido ejp
      INNER JOIN usuarios u ON ejp.id_jugador = u.id_usuario
      INNER JOIN partidos p ON ejp.id_partido = p.id_partido
      WHERE p.id_torneo = $1
      GROUP BY u.id_usuario, u.nombre, u.email
      HAVING SUM(ejp.goles) > 0
      ORDER BY total_goles DESC
      LIMIT 1
    `;
      const goleadorResult = await pool.query(goleadorQuery, [id_torneo]);

      // Equipos con más amarillas
      const amarillasQuery = `
      SELECT 
        equipo,
        SUM(amarillas) as total_amarillas
      FROM (
        SELECT p.equipo_local as equipo, COALESCE(ep.amarillas_local, 0) as amarillas
        FROM partidos p
        LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
        WHERE p.id_torneo = $1 AND p.resultado_local IS NOT NULL
        
        UNION ALL
        
        SELECT p.equipo_visitante as equipo, COALESCE(ep.amarillas_visitante, 0) as amarillas
        FROM partidos p
        LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
        WHERE p.id_torneo = $1 AND p.resultado_visitante IS NOT NULL
      ) subquery
      GROUP BY equipo
      HAVING SUM(amarillas) > 0
      ORDER BY total_amarillas DESC
      LIMIT 1
    `;
      const amarillasResult = await pool.query(amarillasQuery, [id_torneo]);

      // Equipos con más rojas
      const rojasQuery = `
      SELECT 
        equipo,
        SUM(rojas) as total_rojas
      FROM (
        SELECT p.equipo_local as equipo, COALESCE(ep.rojas_local, 0) as rojas
        FROM partidos p
        LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
        WHERE p.id_torneo = $1 AND p.resultado_local IS NOT NULL
        
        UNION ALL
        
        SELECT p.equipo_visitante as equipo, COALESCE(ep.rojas_visitante, 0) as rojas
        FROM partidos p
        LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
        WHERE p.id_torneo = $1 AND p.resultado_visitante IS NOT NULL
      ) subquery
      GROUP BY equipo
      HAVING SUM(rojas) > 0
      ORDER BY total_rojas DESC
      LIMIT 1
    `;
      const rojasResult = await pool.query(rojasQuery, [id_torneo]);

      // Partido con más goles
      const partidoMasGolesQuery = `
      SELECT 
        p.id_partido,
        p.equipo_local,
        p.equipo_visitante,
        p.resultado_local,
        p.resultado_visitante,
        p.fecha_partido,
        (p.resultado_local + p.resultado_visitante) as total_goles
      FROM partidos p
      WHERE p.id_torneo = $1
        AND p.resultado_local IS NOT NULL
        AND p.resultado_visitante IS NOT NULL
      ORDER BY total_goles DESC
      LIMIT 1
    `;
      const partidoMasGolesResult = await pool.query(partidoMasGolesQuery, [id_torneo]);

      // Estadísticas generales
      const statsGeneralesQuery = `
      SELECT 
        COUNT(DISTINCT p.id_partido) as total_partidos,
        SUM(p.resultado_local + p.resultado_visitante) as total_goles,
        ROUND(AVG(p.resultado_local + p.resultado_visitante), 2) as promedio_goles_partido,
        SUM(COALESCE(ep.amarillas_local, 0) + COALESCE(ep.amarillas_visitante, 0)) as total_amarillas,
        SUM(COALESCE(ep.rojas_local, 0) + COALESCE(ep.rojas_visitante, 0)) as total_rojas
      FROM partidos p
      LEFT JOIN estadisticas_partido ep ON p.id_partido = ep.id_partido
      WHERE p.id_torneo = $1
        AND p.resultado_local IS NOT NULL
        AND p.resultado_visitante IS NOT NULL
    `;
      const statsGeneralesResult = await pool.query(statsGeneralesQuery, [id_torneo]);

      return {
        torneo: torneoResult.rows[0],
        goleador: goleadorResult.rows[0] || null,
        equipoMasAmarillas: amarillasResult.rows[0] || null,
        equipoMasRojas: rojasResult.rows[0] || null,
        partidoMasGoles: partidoMasGolesResult.rows[0] || null,
        estadisticasGenerales: statsGeneralesResult.rows[0]
      };
    } catch (error) {
      console.error('❌ Error en obtenerResumenEstadisticasTorneo:', error);
      throw error;
    }
  }
};

module.exports = { EstadisticasService };