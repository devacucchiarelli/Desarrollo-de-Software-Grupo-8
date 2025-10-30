const { EstadisticasService } = require('../services/estadisticasService.js');

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
      const resultados = await EstadisticasService.registrarEstadisticasJugadores(id_partido, jugadoresStats);
      res.status(201).json({ message: 'Estadísticas de jugadores guardadas', resultados });
    } catch (error) {
      console.error('Error al registrar estadísticas de jugadores:', error);
      res.status(500).json({ error: 'Error al guardar estadísticas de jugadores' });
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
    // ✅ NUEVO: Obtener estadísticas completas de un torneo
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

  // ✅ NUEVO: Obtener lista de torneos con estadísticas
  async obtenerTorneosConEstadisticas(req, res) {
    try {
      const torneos = await EstadisticasService.obtenerTorneosConEstadisticas();
      res.json(torneos);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      res.status(500).json({ error: 'Error al obtener lista de torneos' });
    }
  },
};

module.exports = { EstadisticasController };
