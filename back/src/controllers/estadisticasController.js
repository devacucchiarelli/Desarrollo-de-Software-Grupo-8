
// back/src/controllers/estadisticasController.js
const estadisticasService = require('../services/estadisticasService');

async function obtenerEstadisticasController(req, res) {
  try {
    const { id_torneo } = req.params;
    const data = await estadisticasService.obtenerEstadisticas(id_torneo);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function actualizarEstadisticasController(req, res) {
  try {
    const { id_torneo } = req.params;
    const data = await estadisticasService.actualizarEstadisticas(id_torneo);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error al actualizar estadísticas:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  obtenerEstadisticasController,
  actualizarEstadisticasController,
};

