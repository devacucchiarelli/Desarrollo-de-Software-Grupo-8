

const {
  calcularEstadisticasTorneo,
  actualizarTotalesTorneo,
} = require('../models/estadisticasModel');

async function obtenerEstadisticas(id_torneo) {
  // calcula y devuelve (sin guardar)
  return calcularEstadisticasTorneo(id_torneo);
}

async function actualizarEstadisticas(id_torneo) {
  // calcula y además guarda en "torneos" (opcional)
  const totals = await calcularEstadisticasTorneo(id_torneo);
  // si no quieres persistir, retorna "totals" y listo
  const saved = await actualizarTotalesTorneo(id_torneo, totals);
  return saved ?? totals;
}

module.exports = {
  obtenerEstadisticas,
  actualizarEstadisticas,
};
