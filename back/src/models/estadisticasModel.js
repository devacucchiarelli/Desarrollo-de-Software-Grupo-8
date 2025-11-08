
// back/src/models/estadisticasModel.js
// Versión mínima para que arranque sin tocar BD.
// Luego reemplazamos por queries reales.

async function calcularEstadisticasTorneo(id_torneo) {
  // TODO: calcular desde BD (partidos, goles, etc.)
  return {
    id_torneo: Number(id_torneo),
    equipos: 0,
    partidos: 0,
    goles: 0,
    amarillas: 0,
    rojas: 0,
    actualizadoA: new Date().toISOString(),
  };
}

async function actualizarTotalesTorneo(id_torneo, totals) {
  // TODO: persistir en tabla "torneos" o donde corresponda
  // Devolvemos lo recibido para que el servicio tenga algo consistente.
  return { ...totals, id_torneo: Number(id_torneo) };
}

module.exports = {
  calcularEstadisticasTorneo,
  actualizarTotalesTorneo,
};

