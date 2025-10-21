const partidoModel = require('../models/partidoModel');

// Lógica de generación de fixture (simple)
async function generarPartidosParaTorneo(id_torneo, formato_torneo) {
  // Por ahora, generamos 8 partidos de placeholder
  // A futuro, la lógica puede depender del 'formato_torneo' (liga, eliminatoria)
  const cantidadPartidos = 8;
  const partidosGenerados = [];
  const fechaInicio = new Date();

  for (let i = 0; i < cantidadPartidos; i++) {
    // Asigna fechas de ejemplo (cada 3 horas)
    const fecha_partido = new Date(fechaInicio.getTime() + (i * 3 * 60 * 60 * 1000)); 
    
    // Nombres placeholder
    const equipo_local = `Equipo ${String.fromCharCode(65 + i*2)}`; // A, C, E...
    const equipo_visitante = `Equipo ${String.fromCharCode(65 + i*2 + 1)}`; // B, D, F...

    const partido = await partidoModel.crearPartido(
      id_torneo,
      fecha_partido,
      equipo_local,
      equipo_visitante
    );
    partidosGenerados.push(partido);
  }
  return partidosGenerados;
}

async function getPartidosPorTorneoService(id_torneo) {
  return await partidoModel.getPartidosPorTorneo(id_torneo);
}

async function updatePartidoService(id_partido, data) {
  const { fecha_partido, equipo_local, equipo_visitante, resultado_local, resultado_visitante } = data;
  
  // Aquí faltaría validación de datos
  
  return await partidoModel.updatePartido(
    id_partido,
    fecha_partido,
    equipo_local,
    equipo_visitante,
    resultado_local,
    resultado_visitante
  );
}

async function deletePartidoService(id_partido) {
  return await partidoModel.deletePartido(id_partido);
}

module.exports = {
  generarPartidosParaTorneo,
  getPartidosPorTorneoService,
  updatePartidoService,
  deletePartidoService
};