const { EstadisticasService } = require('../services/estadisticasService.js');
const pool = require('../models/db');

const EstadisticasController = {
  async registrarEstadisticaPartido(req, res) {
    try {
      const data = req.body;
      const estadistica = await EstadisticasService.registrarEstadisticaPartido(data);
      res.status(201).json({ message: 'Estadística del partido guardada', estadistica });
    } catch (error) {
      console.error('Error al registrar estadística del partido:', error);
      res.status(500).json({ error: 'Error al guardar la estadística del partido' });
    }
  },

  async registrarEstadisticasJugadores(req, res) {
    try {
      const { id_partido, jugadoresStats } = req.body;
      
      // Convertir objeto de jugadores a array si viene como objeto
      const jugadoresArray = Array.isArray(jugadoresStats) 
        ? jugadoresStats 
        : Object.entries(jugadoresStats).map(([id_jugador, stats]) => ({
            id_jugador: parseInt(id_jugador),
            ...stats
          }));
      
      const resultados = await EstadisticasService.registrarEstadisticasJugadores(id_partido, jugadoresArray);
      res.status(201).json({ message: 'Estadísticas de jugadores guardadas', resultados });
    } catch (error) {
      console.error('Error al registrar estadísticas de jugadores:', error);
      res.status(500).json({ error: 'Error al guardar estadísticas de jugadores' });
    }
  },

  // ✅ Obtener estadísticas de jugadores de un partido específico
  async obtenerEstadisticasJugadoresPartido(req, res) {
    try {
      const { id_partido } = req.params;
      
      // Obtener jugadores de ambos equipos del partido con sus estadísticas
      const jugadoresQuery = `
        SELECT 
          u.id_usuario as id_jugador,
          u.nombre,
          u.email,
          eq.nombre_equipo,
          eq.id_equipo,
          CASE 
            WHEN eq.id_equipo = p.id_equipo_local THEN 'local'
            ELSE 'visitante'
          END as equipo,
          COALESCE(ejp.goles, 0) as goles,
          COALESCE(ejp.amarillas, 0) as amarillas,
          COALESCE(ejp.rojas, 0) as rojas
        FROM partidos p
        CROSS JOIN equipos eq
        INNER JOIN jugadores_equipo je ON je.id_equipo = eq.id_equipo
        INNER JOIN usuarios u ON u.id_usuario = je.id_jugador
        LEFT JOIN estadisticas_jugador_partido ejp ON (ejp.id_partido = p.id_partido AND ejp.id_jugador = u.id_usuario)
        WHERE p.id_partido = $1 
          AND (eq.id_equipo = p.id_equipo_local OR eq.id_equipo = p.id_equipo_visitante)
        ORDER BY eq.id_equipo, u.nombre
      `;
      
      const result = await pool.query(jugadoresQuery, [id_partido]);
      
      // Convertir array a objeto con id_jugador como key
      const jugadoresStats = {};
      result.rows.forEach(jugador => {
        jugadoresStats[jugador.id_jugador] = {
          id_jugador: jugador.id_jugador,
          nombre: jugador.nombre,
          equipo: jugador.equipo,
          nombre_equipo: jugador.nombre_equipo,
          goles: jugador.goles,
          amarillas: jugador.amarillas,
          rojas: jugador.rojas
        };
      });
      
      res.json({ jugadores: jugadoresStats });
    } catch (error) {
      console.error('Error al obtener estadísticas de jugadores:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas de jugadores del partido' });
    }
  },

  async obtenerEstadisticasPartido(req, res) {
    try {
      const { id_partido } = req.params;
      const data = await EstadisticasService.obtenerEstadisticasPartido(id_partido);
      res.json(data);
    } catch (error) {
      console.error('Error al obtener estadísticas del partido:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas del partido' });
    }
  },

  async obtenerUltimosPartidos(req, res) {
    try {
      const partidos = await EstadisticasService.obtenerUltimosPartidos();
      res.json(partidos);
    } catch (error) {
      console.error('Error al obtener últimos partidos:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas de partidos' });
    }
  },

  async obtenerEstadisticasTorneo(req, res) {
    try {
      const { id_torneo } = req.params;
      const estadisticas = await EstadisticasService.obtenerEstadisticasTorneo(id_torneo);
      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas del torneo:', error);
      res.status(500).json({ error: error.message || 'Error al obtener estadísticas del torneo' });
    }
  },

  async obtenerTorneosConEstadisticas(req, res) {
    try {
      const torneos = await EstadisticasService.obtenerTorneosConEstadisticas();
      res.json(torneos);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      res.status(500).json({ error: 'Error al obtener lista de torneos' });
    }
  },

  async obtenerResumenEstadisticasTorneo(req, res) {
    try {
      const { id_torneo } = req.params;
      const resumen = await EstadisticasService.obtenerResumenEstadisticasTorneo(id_torneo);
      res.json(resumen);
    } catch (error) {
      console.error('Error al obtener resumen de estadísticas:', error);
      res.status(500).json({ error: error.message || 'Error al obtener resumen de estadísticas' });
    }
  },

  async recalcularEstadisticasTorneo(req, res) {
  try {
    const { id_torneo } = req.params;
    
    // Verificar que el torneo existe
    const torneoResult = await pool.query(
      'SELECT id_torneo FROM torneos WHERE id_torneo = $1',
      [id_torneo]
    );
    
    if (torneoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    
    // Ejecutar recálculo
    await EstadisticasService.actualizarLigaYEquipos(id_torneo);
    
    res.json({ 
      success: true, 
      message: 'Estadísticas del torneo recalculadas correctamente' 
    });
  } catch (error) {
    console.error('Error al recalcular estadísticas:', error);
    res.status(500).json({ error: 'Error al recalcular estadísticas del torneo' });
  }
}
};

module.exports = { EstadisticasController };