const partidoService = require('../services/partidoService.js');

async function getPartidosController(req, res) {
  try {
    const { idTorneo } = req.params;
    const partidos = await partidoService.getPartidosPorTorneoService(idTorneo);
    res.status(200).json(partidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePartidoController(req, res) {
  try {
    const { idPartido } = req.params;
    const partidoActualizado = await partidoService.updatePartidoService(idPartido, req.body);
    res.status(200).json(partidoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deletePartidoController(req, res) {
  try {
    const { idPartido } = req.params;
    await partidoService.deletePartidoService(idPartido);
    res.status(200).json({ message: 'Partido eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// actualiza resultados
async function actualizarResultadoController(req, res) {
  try {
    const { idPartido } = req.params; // 
    const { resultado_local, resultado_visitante } = req.body;

    const resultado = await partidoService.actualizarResultadoService(
      idPartido,
      resultado_local,
      resultado_visitante
    );

    res.status(200).json({
      message: 'Resultado actualizado correctamente.',
      resultado,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports = {
  getPartidosController,
  updatePartidoController,
  deletePartidoController,
  actualizarResultadoController,
};

